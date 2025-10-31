from openai import AsyncOpenAI
from typing import Dict, List, Tuple
from app.core.config import settings
from app.models.schemas import SectionScore, MOPCategory
import json
import re


class MOPAnalyzer:
    """
    Analyze MOP documents using AI to score Pre-Checks, Operation Steps, 
    and Rollback Steps based on ITIL 4 best practices.
    """
    
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    
    async def analyze_section(
        self,
        section_name: str,
        section_text: str,
        category: str,
        industry_standards: Dict = None
    ) -> SectionScore:
        """
        Analyze a specific section and return a score with findings.
        """
        prompt = self._build_analysis_prompt(
            section_name, 
            section_text, 
            category,
            industry_standards
        )
        
        try:
            response = await self.client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert ITIL 4 Change Enablement consultant specializing in telecommunications Method of Procedure (MOP) analysis. Your role is to evaluate MOP sections against industry best practices and provide detailed, actionable feedback."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            
            return SectionScore(
                score=float(result.get('score', 0)),
                findings=result.get('findings', []),
                strengths=result.get('strengths', []),
                weaknesses=result.get('weaknesses', [])
            )
        except Exception as e:
            print(f"Error analyzing section: {e}")
            return SectionScore(
                score=0,
                findings=[f"Error during analysis: {str(e)}"],
                strengths=[],
                weaknesses=[]
            )
    
    def _build_analysis_prompt(
        self,
        section_name: str,
        section_text: str,
        category: str,
        industry_standards: Dict = None
    ) -> str:
        """Build the analysis prompt for OpenAI."""
        
        criteria_map = {
            "pre_checks": {
                "title": "Pre-Checks Section",
                "criteria": [
                    "Environmental verification (system status, resource availability)",
                    "Backup verification and validation",
                    "Prerequisite checks (dependencies, versions, configurations)",
                    "Health checks of systems before change",
                    "Stakeholder notification and approval verification",
                    "Risk assessment and impact analysis",
                    "Maintenance window verification",
                    "Tools and access verification",
                    "Documentation of baseline configurations",
                    "Emergency contact list and escalation procedures"
                ]
            },
            "operation_steps": {
                "title": "Operation Steps Section",
                "criteria": [
                    "Clear, sequential, and numbered steps",
                    "Detailed commands with expected outputs",
                    "Time estimates for each major step",
                    "Validation checks after critical steps",
                    "Error handling procedures",
                    "Communication checkpoints",
                    "Screenshot or evidence collection points",
                    "Pause points for verification",
                    "Resource utilization monitoring",
                    "Clear ownership and responsibility for each step"
                ]
            },
            "rollback_steps": {
                "title": "Rollback Steps Section",
                "criteria": [
                    "Complete reversal procedure",
                    "Clear rollback triggers and decision points",
                    "Step-by-step rollback instructions",
                    "Rollback validation and verification",
                    "Data integrity checks post-rollback",
                    "Communication plan during rollback",
                    "Estimated rollback time",
                    "Service restoration verification",
                    "Lessons learned documentation process",
                    "Post-rollback reporting requirements"
                ]
            }
        }
        
        section_info = criteria_map.get(section_name, criteria_map["operation_steps"])
        criteria_list = "\n".join([f"- {c}" for c in section_info["criteria"]])
        
        standards_context = ""
        if industry_standards:
            standards_context = "\n\nIndustry Standards Context:\n"
            for key, value in industry_standards.items():
                if isinstance(value, dict):
                    standards_context += f"- {value.get('title', '')}: {value.get('content', '')[:300]}...\n"
        
        prompt = f"""
Analyze the following {section_info['title']} from a {category} Method of Procedure (MOP) document.

SECTION TEXT:
{section_text[:4000]}  

EVALUATION CRITERIA:
{criteria_list}

{standards_context}

INSTRUCTIONS:
1. Score this section from 0-100 based on how well it meets ITIL 4 Change Enablement best practices
2. Consider completeness, clarity, risk management, and adherence to telecommunications standards
3. Identify specific strengths and weaknesses
4. Provide actionable findings

Scoring Guidelines:
- 90-100: Excellent - Comprehensive, detailed, follows all best practices
- 75-89: Good - Most criteria met, minor improvements needed
- 60-74: Adequate - Basic requirements met, several improvements needed
- 40-59: Poor - Missing critical elements, significant gaps
- 0-39: Inadequate - Major deficiencies, does not meet minimum standards

Return your analysis as a JSON object with this exact structure:
{{
    "score": <number between 0-100>,
    "findings": [<list of key findings as strings>],
    "strengths": [<list of identified strengths as strings>],
    "weaknesses": [<list of identified weaknesses as strings>]
}}
"""
        return prompt
    
    async def generate_recommendations(
        self,
        pre_checks_score: SectionScore,
        operation_score: SectionScore,
        rollback_score: SectionScore,
        category: str,
        overall_score: float
    ) -> Tuple[List[str], List[str]]:
        """
        Generate tailored recommendations and best practices based on analysis.
        """
        prompt = f"""
Based on the following MOP analysis results for a {category} change in telecommunications:

OVERALL SCORE: {overall_score}/100

PRE-CHECKS SCORE: {pre_checks_score.score}/100
Weaknesses: {', '.join(pre_checks_score.weaknesses)}

OPERATION STEPS SCORE: {operation_score.score}/100
Weaknesses: {', '.join(operation_score.weaknesses)}

ROLLBACK STEPS SCORE: {rollback_score.score}/100
Weaknesses: {', '.join(rollback_score.weaknesses)}

Generate:
1. Specific, actionable recommendations to improve this MOP
2. Industry best practices relevant to {category} in telecommunications

Return as JSON:
{{
    "recommendations": [<list of specific recommendations>],
    "best_practices": [<list of industry best practices>]
}}
"""
        
        try:
            response = await self.client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an ITIL 4 expert providing recommendations for MOP improvements."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.4,
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            return (
                result.get('recommendations', []),
                result.get('best_practices', [])
            )
        except Exception as e:
            print(f"Error generating recommendations: {e}")
            return (
                ["Unable to generate recommendations due to an error."],
                ["Follow ITIL 4 Change Enablement best practices."]
            )
    
    def calculate_risk_level(self, overall_score: float) -> str:
        """Determine risk level based on overall score."""
        if overall_score >= 85:
            return "LOW"
        elif overall_score >= 70:
            return "MEDIUM"
        elif overall_score >= 50:
            return "HIGH"
        else:
            return "CRITICAL"
