/**
 * Type definitions for Telco MOP Analysis Agent
 */

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

export interface MOPSection {
  heading: string;
  content: string;
  steps: string[];
  lineNumber: number;
}

export interface ParsedMOP {
  preChecks: MOPSection | null;
  operationSteps: MOPSection | null;
  rollbackSteps: MOPSection | null;
  rawText: string;
  metadata: {
    fileName: string;
    fileSize: number;
    parsedAt: string;
    totalSections: number;
  };
}

export interface SectionScore {
  score: number; // 0-10
  breakdown: {
    presence: number; // 0-3 (30%)
    clarity: number; // 0-2.5 (25%)
    verifiability: number; // 0-2 (20%)
    safety: number; // 0-1.5 (15%)
    compliance: number; // 0-1 (10%)
  };
  checks: {
    name: string;
    passed: boolean;
    weight: number;
    message: string;
  }[];
  missingItems: string[];
}

export interface TavilyEvidence {
  title: string;
  link: string;
  snippet: string;
  relevance: number; // 0-1
  usedInScoring: boolean;
}

export interface AnalysisResult {
  scores: {
    preChecks: SectionScore;
    operationSteps: SectionScore;
    rollbackSteps: SectionScore;
  };
  totalScore: number; // 0-10 weighted average
  recommendations: string[];
  evidence: TavilyEvidence[];
  rawExtraction: ParsedMOP;
  confidence: number; // 0-1
  metadata: {
    category: TelcoCategory;
    analyzedAt: string;
    processingTimeMs: number;
    tavilyUsed: boolean;
  };
}

export interface TavilyResponse {
  results: Array<{
    title: string;
    url: string;
    content: string;
    score: number;
  }>;
  query: string;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface APIError {
  error: string;
  message: string;
  statusCode: number;
  details?: any;
}
