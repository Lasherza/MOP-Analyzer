export enum TelcoCategory {
  IPCORE = 'IPCORE',
  PACKET_CORE = 'Packet Core',
  BILLING_CHARGING = 'Billing and Revenue → Charging/Revenue Management',
  RADIO_NETWORK = 'Radio Network',
  TRANSMISSION_NETWORK = 'Transmission Network',
  DEVOPS_SYSTEMS = 'DevOps and Systems (OSS and BSS)',
  IT = 'IT',
  CYBER_SECURITY = 'Cyber Security',
  DATA_ENGINEERING = 'Data Engineering'
}

export interface SectionScore {
  score: number;
  breakdown: {
    presence: number;
    clarity: number;
    verifiability: number;
    safety: number;
    compliance: number;
  };
  checks: Array<{
    name: string;
    passed: boolean;
    weight: number;
    message: string;
  }>;
  missingItems: string[];
}

export interface TavilyEvidence {
  title: string;
  link: string;
  snippet: string;
  relevance: number;
  usedInScoring: boolean;
}

export interface AnalysisResult {
  scores: {
    preChecks: SectionScore;
    operationSteps: SectionScore;
    rollbackSteps: SectionScore;
  };
  totalScore: number;
  recommendations: string[];
  evidence: TavilyEvidence[];
  rawExtraction: any;
  confidence: number;
  metadata: {
    category: TelcoCategory;
    analyzedAt: string;
    processingTimeMs: number;
    tavilyUsed: boolean;
  };
}
