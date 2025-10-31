from tavily import TavilyClient
from typing import Dict, List
from app.core.config import settings


class TavilyService:
    """Service for web search using Tavily API."""
    
    def __init__(self):
        self.client = TavilyClient(api_key=settings.TAVILY_API_KEY)
    
    async def search_industry_standards(self, category: str) -> Dict[str, str]:
        """
        Search for industry standards and best practices for MOP in given category.
        """
        query = f"ITIL 4 Change Enablement Method of Procedure best practices {category} telecommunications"
        
        try:
            response = self.client.search(
                query=query,
                search_depth="advanced",
                max_results=5
            )
            
            standards = {}
            if response and 'results' in response:
                for idx, result in enumerate(response['results'][:3], 1):
                    standards[f"source_{idx}"] = {
                        "title": result.get('title', ''),
                        "content": result.get('content', ''),
                        "url": result.get('url', '')
                    }
            
            return standards
        except Exception as e:
            print(f"Tavily search error: {e}")
            return {}
    
    async def search_risk_mitigation(self, category: str, risks: List[str]) -> List[str]:
        """
        Search for risk mitigation strategies specific to category and identified risks.
        """
        risk_text = ", ".join(risks[:3])  # Limit to top 3 risks
        query = f"Risk mitigation strategies for {category} telecommunications change management {risk_text}"
        
        try:
            response = self.client.search(
                query=query,
                search_depth="basic",
                max_results=3
            )
            
            mitigations = []
            if response and 'results' in response:
                for result in response['results']:
                    content = result.get('content', '')
                    if content:
                        mitigations.append(content)
            
            return mitigations
        except Exception as e:
            print(f"Tavily search error: {e}")
            return []
    
    async def search_mop_checklist(self, category: str) -> Dict[str, List[str]]:
        """
        Get comprehensive MOP checklist for the category.
        """
        query = f"Method of Procedure checklist {category} telecommunications change management ITIL"
        
        try:
            response = self.client.search(
                query=query,
                search_depth="advanced",
                max_results=3
            )
            
            checklist = {
                "pre_checks": [],
                "operation_steps": [],
                "rollback_steps": []
            }
            
            if response and 'results' in response:
                for result in response['results']:
                    content = result.get('content', '').lower()
                    
                    # Extract relevant items (simplified)
                    if 'pre-check' in content or 'prerequisite' in content:
                        checklist['pre_checks'].append(result.get('content', '')[:200])
                    if 'implementation' in content or 'execution' in content:
                        checklist['operation_steps'].append(result.get('content', '')[:200])
                    if 'rollback' in content or 'backout' in content:
                        checklist['rollback_steps'].append(result.get('content', '')[:200])
            
            return checklist
        except Exception as e:
            print(f"Tavily search error: {e}")
            return {
                "pre_checks": [],
                "operation_steps": [],
                "rollback_steps": []
            }
