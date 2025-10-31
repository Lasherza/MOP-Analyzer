from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.schemas import (
    MOPCategory, MOPAnalysisResult, AnalysisStatusResponse, ErrorResponse
)
from app.models.database import get_db, MOPAnalysisRecord
from app.services.document_processor import DocumentProcessor
from app.services.mop_analyzer import MOPAnalyzer
from app.services.tavily_service import TavilyService
from app.services.report_generator import ReportGenerator
from app.core.config import settings
from sqlalchemy import select
import uuid
import os
import aiofiles
from datetime import datetime
from pathlib import Path

router = APIRouter()

# Initialize services
doc_processor = DocumentProcessor()
mop_analyzer = MOPAnalyzer()
tavily_service = TavilyService()
report_generator = ReportGenerator(settings.REPORTS_DIR)


@router.post("/analyze", response_model=MOPAnalysisResult)
async def analyze_mop(
    file: UploadFile = File(...),
    category: str = Form(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload and analyze a MOP document.
    """
    # Validate file
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type not supported. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )
    
    # Validate category
    try:
        mop_category = MOPCategory(category)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid category: {category}")
    
    # Generate analysis ID
    analysis_id = str(uuid.uuid4())
    
    # Save uploaded file
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(settings.UPLOAD_DIR, f"{analysis_id}_{file.filename}")
    
    try:
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            
            # Check file size
            if len(content) > settings.MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=400,
                    detail=f"File size exceeds maximum allowed size of {settings.MAX_FILE_SIZE} bytes"
                )
            
            await f.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")
    
    try:
        # Extract text from document
        full_text = await doc_processor.extract_text(file_path)
        
        if not full_text or len(full_text.strip()) < 100:
            raise HTTPException(
                status_code=400,
                detail="Document appears to be empty or contains insufficient text"
            )
        
        # Extract sections
        sections = await doc_processor.extract_sections(full_text)
        
        # Search for industry standards using Tavily
        industry_standards = await tavily_service.search_industry_standards(category)
        
        # Analyze each section
        pre_checks_score = await mop_analyzer.analyze_section(
            "pre_checks",
            sections["pre_checks"] or full_text,
            category,
            industry_standards
        )
        
        operation_steps_score = await mop_analyzer.analyze_section(
            "operation_steps",
            sections["operation_steps"] or full_text,
            category,
            industry_standards
        )
        
        rollback_steps_score = await mop_analyzer.analyze_section(
            "rollback_steps",
            sections["rollback_steps"] or full_text,
            category,
            industry_standards
        )
        
        # Calculate overall score
        overall_score = (
            pre_checks_score.score * 0.3 +
            operation_steps_score.score * 0.4 +
            rollback_steps_score.score * 0.3
        )
        
        # Determine risk level
        risk_level = mop_analyzer.calculate_risk_level(overall_score)
        
        # Generate recommendations
        recommendations, best_practices = await mop_analyzer.generate_recommendations(
            pre_checks_score,
            operation_steps_score,
            rollback_steps_score,
            category,
            overall_score
        )
        
        # Create analysis result
        result = MOPAnalysisResult(
            analysis_id=analysis_id,
            category=mop_category,
            filename=file.filename,
            timestamp=datetime.utcnow(),
            pre_checks_score=pre_checks_score,
            operation_steps_score=operation_steps_score,
            rollback_steps_score=rollback_steps_score,
            overall_score=overall_score,
            risk_level=risk_level,
            recommendations=recommendations,
            best_practices=best_practices,
            industry_standards=industry_standards
        )
        
        # Save to database
        db_record = MOPAnalysisRecord(
            analysis_id=analysis_id,
            category=category,
            filename=file.filename,
            timestamp=result.timestamp,
            pre_checks_score=pre_checks_score.score,
            operation_steps_score=operation_steps_score.score,
            rollback_steps_score=rollback_steps_score.score,
            overall_score=overall_score,
            risk_level=risk_level,
            analysis_data=result.dict(),
            file_path=file_path
        )
        
        db.add(db_record)
        await db.commit()
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        # Clean up file on error
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Error analyzing document: {str(e)}")


@router.get("/analysis/{analysis_id}", response_model=MOPAnalysisResult)
async def get_analysis(analysis_id: str, db: AsyncSession = Depends(get_db)):
    """
    Retrieve a specific analysis result.
    """
    result = await db.execute(
        select(MOPAnalysisRecord).where(MOPAnalysisRecord.analysis_id == analysis_id)
    )
    record = result.scalar_one_or_none()
    
    if not record:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    return MOPAnalysisResult(**record.analysis_data)


@router.get("/analysis/{analysis_id}/report")
async def download_report(analysis_id: str, db: AsyncSession = Depends(get_db)):
    """
    Download PDF report for an analysis.
    """
    result = await db.execute(
        select(MOPAnalysisRecord).where(MOPAnalysisRecord.analysis_id == analysis_id)
    )
    record = result.scalar_one_or_none()
    
    if not record:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    # Generate report
    analysis = MOPAnalysisResult(**record.analysis_data)
    report_path = await report_generator.generate_report(analysis)
    
    if not os.path.exists(report_path):
        raise HTTPException(status_code=500, detail="Error generating report")
    
    return FileResponse(
        report_path,
        media_type="application/pdf",
        filename=f"MOP_Analysis_{analysis_id}.pdf"
    )


@router.get("/categories")
async def get_categories():
    """
    Get list of available MOP categories.
    """
    return {
        "categories": [category.value for category in MOPCategory]
    }


@router.get("/health")
async def health_check():
    """
    Health check endpoint.
    """
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }
