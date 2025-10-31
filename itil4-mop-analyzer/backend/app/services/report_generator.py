from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from datetime import datetime
from app.models.schemas import MOPAnalysisResult
from typing import List
import os


class ReportGenerator:
    """Generate PDF reports for MOP analysis results."""
    
    def __init__(self, reports_dir: str = "./reports"):
        self.reports_dir = reports_dir
        os.makedirs(reports_dir, exist_ok=True)
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Setup custom paragraph styles."""
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1a365d'),
            spaceAfter=30,
            alignment=TA_CENTER
        ))
        
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#2c5282'),
            spaceAfter=12,
            spaceBefore=12
        ))
        
        self.styles.add(ParagraphStyle(
            name='SubSection',
            parent=self.styles['Heading3'],
            fontSize=12,
            textColor=colors.HexColor('#2d3748'),
            spaceAfter=8,
            spaceBefore=8
        ))
    
    async def generate_report(self, analysis: MOPAnalysisResult) -> str:
        """Generate PDF report and return file path."""
        filename = f"MOP_Analysis_{analysis.analysis_id}.pdf"
        filepath = os.path.join(self.reports_dir, filename)
        
        doc = SimpleDocTemplate(filepath, pagesize=letter)
        story = []
        
        # Title
        story.append(Paragraph("ITIL 4 MOP Analysis Report", self.styles['CustomTitle']))
        story.append(Spacer(1, 0.3 * inch))
        
        # Summary Information
        summary_data = [
            ["Analysis ID:", analysis.analysis_id],
            ["Category:", analysis.category],
            ["Document:", analysis.filename],
            ["Date:", analysis.timestamp.strftime("%Y-%m-%d %H:%M:%S")],
            ["Overall Score:", f"{analysis.overall_score:.1f}/100"],
            ["Risk Level:", analysis.risk_level]
        ]
        
        summary_table = Table(summary_data, colWidths=[2*inch, 4*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e2e8f0')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey)
        ]))
        
        story.append(summary_table)
        story.append(Spacer(1, 0.4 * inch))
        
        # Section Scores
        story.append(Paragraph("Section Scores", self.styles['SectionHeader']))
        
        scores_data = [
            ["Section", "Score", "Status"],
            ["Pre-Checks", f"{analysis.pre_checks_score.score:.1f}/100", 
             self._get_score_status(analysis.pre_checks_score.score)],
            ["Operation Steps", f"{analysis.operation_steps_score.score:.1f}/100",
             self._get_score_status(analysis.operation_steps_score.score)],
            ["Rollback Steps", f"{analysis.rollback_steps_score.score:.1f}/100",
             self._get_score_status(analysis.rollback_steps_score.score)],
        ]
        
        scores_table = Table(scores_data, colWidths=[2*inch, 2*inch, 2*inch])
        scores_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2c5282')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f7fafc')])
        ]))
        
        story.append(scores_table)
        story.append(Spacer(1, 0.3 * inch))
        
        # Detailed Section Analysis
        self._add_section_details(story, "Pre-Checks Analysis", analysis.pre_checks_score)
        self._add_section_details(story, "Operation Steps Analysis", analysis.operation_steps_score)
        self._add_section_details(story, "Rollback Steps Analysis", analysis.rollback_steps_score)
        
        # Recommendations
        story.append(PageBreak())
        story.append(Paragraph("Recommendations", self.styles['SectionHeader']))
        story.append(Spacer(1, 0.1 * inch))
        
        for idx, rec in enumerate(analysis.recommendations, 1):
            story.append(Paragraph(f"{idx}. {rec}", self.styles['Normal']))
            story.append(Spacer(1, 0.1 * inch))
        
        # Best Practices
        story.append(Spacer(1, 0.2 * inch))
        story.append(Paragraph("Industry Best Practices", self.styles['SectionHeader']))
        story.append(Spacer(1, 0.1 * inch))
        
        for idx, practice in enumerate(analysis.best_practices, 1):
            story.append(Paragraph(f"{idx}. {practice}", self.styles['Normal']))
            story.append(Spacer(1, 0.1 * inch))
        
        # Build PDF
        doc.build(story)
        return filepath
    
    def _add_section_details(self, story: List, title: str, score):
        """Add detailed section analysis to report."""
        story.append(Paragraph(title, self.styles['SectionHeader']))
        story.append(Spacer(1, 0.1 * inch))
        
        # Strengths
        if score.strengths:
            story.append(Paragraph("Strengths:", self.styles['SubSection']))
            for strength in score.strengths:
                story.append(Paragraph(f"? {strength}", self.styles['Normal']))
            story.append(Spacer(1, 0.1 * inch))
        
        # Weaknesses
        if score.weaknesses:
            story.append(Paragraph("Areas for Improvement:", self.styles['SubSection']))
            for weakness in score.weaknesses:
                story.append(Paragraph(f"? {weakness}", self.styles['Normal']))
            story.append(Spacer(1, 0.1 * inch))
        
        # Findings
        if score.findings:
            story.append(Paragraph("Key Findings:", self.styles['SubSection']))
            for finding in score.findings:
                story.append(Paragraph(f"? {finding}", self.styles['Normal']))
            story.append(Spacer(1, 0.2 * inch))
    
    def _get_score_status(self, score: float) -> str:
        """Get status text based on score."""
        if score >= 85:
            return "Excellent"
        elif score >= 70:
            return "Good"
        elif score >= 60:
            return "Adequate"
        elif score >= 40:
            return "Poor"
        else:
            return "Inadequate"
