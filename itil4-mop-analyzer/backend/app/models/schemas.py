from pydantic import BaseModel, Field
from typing import Optional, Dict, List
from datetime import datetime
from enum import Enum


class MOPCategory(str, Enum):
    """Available MOP categories."""
    IPCORE = "IPCORE"
    PACKET_CORE = "Packet Core"
    BILLING_REVENUE = "Billing and Revenue ? Charging/Revenue Management"
    RADIO_NETWORK = "Radio Network"
    TRANSMISSION_NETWORK = "Transmission Network"
    DEVOPS_SYSTEMS = "DevOps and Systems (OSS and BSS)"
    IT = "IT"
    CYBER_SECURITY = "Cyber Security"
    DATA_ENGINEERING = "Data Engineering"


class SectionScore(BaseModel):
    """Score for a specific MOP section."""
    score: float = Field(..., ge=0, le=100, description="Score out of 100")
    findings: List[str] = Field(default_factory=list, description="Key findings")
    strengths: List[str] = Field(default_factory=list, description="Identified strengths")
    weaknesses: List[str] = Field(default_factory=list, description="Identified weaknesses")


class MOPAnalysisResult(BaseModel):
    """Complete MOP analysis result."""
    analysis_id: str
    category: MOPCategory
    filename: str
    timestamp: datetime
    
    # Section Scores
    pre_checks_score: SectionScore
    operation_steps_score: SectionScore
    rollback_steps_score: SectionScore
    
    # Overall Assessment
    overall_score: float = Field(..., ge=0, le=100)
    risk_level: str = Field(..., description="LOW, MEDIUM, HIGH, CRITICAL")
    
    # Recommendations
    recommendations: List[str] = Field(default_factory=list)
    best_practices: List[str] = Field(default_factory=list)
    
    # Industry Standards
    industry_standards: Optional[Dict[str, str]] = None
    

class MOPUploadRequest(BaseModel):
    """Request model for MOP upload."""
    category: MOPCategory


class AnalysisStatusResponse(BaseModel):
    """Response for analysis status check."""
    analysis_id: str
    status: str
    message: Optional[str] = None
    result: Optional[MOPAnalysisResult] = None


class ErrorResponse(BaseModel):
    """Error response model."""
    error: str
    detail: Optional[str] = None
