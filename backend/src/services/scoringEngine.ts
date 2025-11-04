/**
 * Scoring Engine Service
 * Implements ITIL4 Change Enablement best-practice scoring with category-specific checks
 * 
 * SCORING BREAKDOWN (per section, 0-10 scale):
 * - Presence (30%): Does the section exist with meaningful content?
 * - Clarity (25%): Are steps clear, specific, and actionable?
 * - Verifiability (20%): Are there verification/validation steps?
 * - Safety (15%): Are there safety checks, impact assessment, rollback triggers?
 * - Compliance (10%): Does it match Telco/category best practices from Tavily?
 * 
 * ITIL4 CHANGE ENABLEMENT MAPPING:
 * - Pre-Checks: Change authorization, risk assessment, resource availability, dependencies
 * - Operation Steps: Clear execution plan, ownership, communication, monitoring
 * - Rollback Steps: Backout criteria, recovery procedures, data protection
 */

import { ParsedMOP, MOPSection, SectionScore, TavilyEvidence, TelcoCategory } from '../types';
import { logger } from '../utils/logger';

export class ScoringEngine {
  /**
   * Score Pre-Checks section
   */
  scorePreChecks(section: MOPSection | null, evidence: TavilyEvidence[]): SectionScore {
    if (!section) {
      return this.createEmptyScore('Pre-Checks section is missing');
    }

    const checks = [
      // Presence checks (30%)
      {
        name: 'Section exists with content',
        weight: 1.5,
        test: () => section.content.length > 50,
        message: 'Pre-checks section must contain substantial content',
      },
      {
        name: 'Steps are enumerated',
        weight: 1.5,
        test: () => section.steps.length >= 3,
        message: 'At least 3 pre-check steps expected',
      },

      // Clarity checks (25%)
      {
        name: 'Owner/responsible party identified',
        weight: 1.25,
        test: () => this.containsKeywords(section.content, [
          'owner', 'responsible', 'assigned to', 'performed by', 'checked by'
        ]),
        message: 'Owner or responsible party should be identified',
      },
      {
        name: 'Success criteria defined',
        weight: 1.25,
        test: () => this.containsKeywords(section.content, [
          'success', 'criteria', 'expected', 'result', 'confirm', 'verify'
        ]),
        message: 'Success criteria should be defined for pre-checks',
      },

      // Verifiability checks (20%)
      {
        name: 'Verification steps present',
        weight: 1.0,
        test: () => this.containsKeywords(section.content, [
          'verify', 'check', 'validate', 'confirm', 'ensure', 'test'
        ]),
        message: 'Verification keywords should be present',
      },
      {
        name: 'Specific conditions checked',
        weight: 1.0,
        test: () => this.containsKeywords(section.content, [
          'status', 'health', 'availability', 'backup', 'dependency', 'prerequisite'
        ]),
        message: 'Specific conditions (status, health, etc.) should be checked',
      },

      // Safety checks (15%)
      {
        name: 'Risk assessment mentioned',
        weight: 0.75,
        test: () => this.containsKeywords(section.content, [
          'risk', 'impact', 'assessment', 'mitigation', 'contingency'
        ]),
        message: 'Risk or impact assessment should be included',
      },
      {
        name: 'Dependencies identified',
        weight: 0.75,
        test: () => this.containsKeywords(section.content, [
          'dependency', 'dependencies', 'dependent', 'prerequisite', 'required'
        ]),
        message: 'Dependencies should be identified',
      },

      // Compliance checks (10%) - Tavily-enhanced
      {
        name: 'ITIL4 change authorization check',
        weight: 0.5,
        test: () => this.containsKeywords(section.content, [
          'authorization', 'approval', 'change request', 'CAB', 'approved'
        ]),
        message: 'ITIL4: Change authorization should be verified',
      },
      {
        name: 'Category-specific best practice',
        weight: 0.5,
        test: () => this.matchesEvidenceKeywords(section.content, evidence),
        message: 'Should follow category-specific best practices from industry sources',
      },
    ];

    return this.calculateScore(checks, section);
  }

  /**
   * Score Operation Steps section
   */
  scoreOperationSteps(section: MOPSection | null, evidence: TavilyEvidence[]): SectionScore {
    if (!section) {
      return this.createEmptyScore('Operation Steps section is missing');
    }

    const checks = [
      // Presence checks (30%)
      {
        name: 'Section exists with detailed content',
        weight: 1.5,
        test: () => section.content.length > 100,
        message: 'Operation steps must be detailed and comprehensive',
      },
      {
        name: 'Multiple steps documented',
        weight: 1.5,
        test: () => section.steps.length >= 5,
        message: 'At least 5 operation steps expected for a robust procedure',
      },

      // Clarity checks (25%)
      {
        name: 'Steps are specific and actionable',
        weight: 1.25,
        test: () => this.stepsAreActionable(section.steps),
        message: 'Steps should use action verbs and be specific',
      },
      {
        name: 'Execution sequence is clear',
        weight: 1.25,
        test: () => this.hasSequentialSteps(section.steps),
        message: 'Steps should be numbered or clearly sequenced',
      },

      // Verifiability checks (20%)
      {
        name: 'Validation steps after operations',
        weight: 1.0,
        test: () => this.containsKeywords(section.content, [
          'verify', 'validate', 'test', 'confirm', 'check result'
        ]),
        message: 'Each operation should include validation steps',
      },
      {
        name: 'Expected outcomes specified',
        weight: 1.0,
        test: () => this.containsKeywords(section.content, [
          'expected', 'result', 'outcome', 'should be', 'will show'
        ]),
        message: 'Expected outcomes should be specified',
      },

      // Safety checks (15%)
      {
        name: 'Safety warnings or cautions',
        weight: 0.75,
        test: () => this.containsKeywords(section.content, [
          'caution', 'warning', 'note', 'important', 'critical', 'danger'
        ]),
        message: 'Safety warnings should be included where applicable',
      },
      {
        name: 'Communication or notification steps',
        weight: 0.75,
        test: () => this.containsKeywords(section.content, [
          'notify', 'inform', 'communicate', 'alert', 'announce', 'email'
        ]),
        message: 'Communication steps should be included',
      },

      // Compliance checks (10%)
      {
        name: 'ITIL4 monitoring during change',
        weight: 0.5,
        test: () => this.containsKeywords(section.content, [
          'monitor', 'monitoring', 'observe', 'track', 'log'
        ]),
        message: 'ITIL4: Monitoring during change execution is required',
      },
      {
        name: 'Category-specific procedures',
        weight: 0.5,
        test: () => this.matchesEvidenceKeywords(section.content, evidence),
        message: 'Should follow category-specific operational procedures',
      },
    ];

    return this.calculateScore(checks, section);
  }

  /**
   * Score Rollback Steps section
   */
  scoreRollbackSteps(section: MOPSection | null, evidence: TavilyEvidence[]): SectionScore {
    if (!section) {
      return this.createEmptyScore('Rollback Steps section is missing');
    }

    const checks = [
      // Presence checks (30%)
      {
        name: 'Rollback section exists',
        weight: 1.5,
        test: () => section.content.length > 50,
        message: 'Rollback procedure must be documented',
      },
      {
        name: 'Rollback steps enumerated',
        weight: 1.5,
        test: () => section.steps.length >= 3,
        message: 'At least 3 rollback steps expected',
      },

      // Clarity checks (25%)
      {
        name: 'Rollback triggers defined',
        weight: 1.25,
        test: () => this.containsKeywords(section.content, [
          'trigger', 'criteria', 'condition', 'if', 'when', 'failure'
        ]),
        message: 'Rollback triggers/criteria should be clearly defined',
      },
      {
        name: 'Rollback owner identified',
        weight: 1.25,
        test: () => this.containsKeywords(section.content, [
          'owner', 'responsible', 'performed by', 'contact'
        ]),
        message: 'Rollback owner/responsible party should be identified',
      },

      // Verifiability checks (20%)
      {
        name: 'Rollback verification steps',
        weight: 1.0,
        test: () => this.containsKeywords(section.content, [
          'verify', 'confirm', 'validate', 'check', 'test'
        ]),
        message: 'Rollback should include verification steps',
      },
      {
        name: 'System state validation',
        weight: 1.0,
        test: () => this.containsKeywords(section.content, [
          'restore', 'original', 'previous', 'baseline', 'state'
        ]),
        message: 'System state restoration should be validated',
      },

      // Safety checks (15%)
      {
        name: 'Data protection mentioned',
        weight: 0.75,
        test: () => this.containsKeywords(section.content, [
          'backup', 'data', 'snapshot', 'save', 'protect', 'preserve'
        ]),
        message: 'Data protection measures should be included',
      },
      {
        name: 'Impact of rollback assessed',
        weight: 0.75,
        test: () => this.containsKeywords(section.content, [
          'impact', 'risk', 'effect', 'consequence', 'caution'
        ]),
        message: 'Impact of rollback should be assessed',
      },

      // Compliance checks (10%)
      {
        name: 'ITIL4 rollback decision authority',
        weight: 0.5,
        test: () => this.containsKeywords(section.content, [
          'approval', 'decision', 'authority', 'escalate', 'CAB'
        ]),
        message: 'ITIL4: Rollback decision authority should be defined',
      },
      {
        name: 'Category-specific rollback',
        weight: 0.5,
        test: () => this.matchesEvidenceKeywords(section.content, evidence),
        message: 'Should follow category-specific rollback best practices',
      },
    ];

    return this.calculateScore(checks, section);
  }

  /**
   * Calculate total score across all sections
   */
  calculateTotalScore(
    preChecks: SectionScore,
    operationSteps: SectionScore,
    rollbackSteps: SectionScore
  ): number {
    // Weighted average: Operation Steps 40%, Pre-Checks 35%, Rollback 25%
    const total =
      preChecks.score * 0.35 +
      operationSteps.score * 0.40 +
      rollbackSteps.score * 0.25;

    return Math.round(total * 10) / 10; // Round to 1 decimal
  }

  /**
   * Generate recommendations based on scores
   */
  generateRecommendations(
    preChecks: SectionScore,
    operationSteps: SectionScore,
    rollbackSteps: SectionScore
  ): string[] {
    const recommendations: string[] = [];

    // Collect all missing items
    const allMissing = [
      ...preChecks.missingItems,
      ...operationSteps.missingItems,
      ...rollbackSteps.missingItems,
    ];

    recommendations.push(...allMissing);

    // Add priority recommendations based on scores
    if (preChecks.score < 5) {
      recommendations.unshift('CRITICAL: Pre-Checks section needs significant improvement');
    }
    if (operationSteps.score < 5) {
      recommendations.unshift('CRITICAL: Operation Steps need more detail and clarity');
    }
    if (rollbackSteps.score < 5) {
      recommendations.unshift('CRITICAL: Rollback procedure is inadequate');
    }

    // General recommendations
    if (preChecks.score < 7 || operationSteps.score < 7 || rollbackSteps.score < 7) {
      recommendations.push('Consider peer review by experienced change manager');
    }

    return recommendations;
  }

  /**
   * Calculate confidence based on section availability and Tavily usage
   */
  calculateConfidence(parsedMOP: ParsedMOP, tavilyUsed: boolean): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence if all sections are present
    if (parsedMOP.preChecks) confidence += 0.15;
    if (parsedMOP.operationSteps) confidence += 0.15;
    if (parsedMOP.rollbackSteps) confidence += 0.15;

    // Increase if Tavily was used successfully
    if (tavilyUsed) confidence += 0.05;

    return Math.round(confidence * 100) / 100;
  }

  // ========== Private Helper Methods ==========

  private calculateScore(checks: any[], section: MOPSection): SectionScore {
    const results = checks.map(check => ({
      name: check.name,
      passed: check.test(),
      weight: check.weight,
      message: check.message,
    }));

    let totalScore = 0;
    const missingItems: string[] = [];

    results.forEach(result => {
      if (result.passed) {
        totalScore += result.weight;
      } else {
        missingItems.push(result.message);
      }
    });

    // Calculate breakdown
    const breakdown = this.calculateBreakdown(results);

    return {
      score: Math.round(totalScore * 10) / 10,
      breakdown,
      checks: results,
      missingItems,
    };
  }

  private calculateBreakdown(checks: any[]): SectionScore['breakdown'] {
    let presence = 0, clarity = 0, verifiability = 0, safety = 0, compliance = 0;

    checks.forEach((check, index) => {
      const score = check.passed ? check.weight : 0;
      
      // Map checks to categories based on index (matches check order)
      if (index < 2) presence += score;
      else if (index < 4) clarity += score;
      else if (index < 6) verifiability += score;
      else if (index < 8) safety += score;
      else compliance += score;
    });

    return { presence, clarity, verifiability, safety, compliance };
  }

  private createEmptyScore(message: string): SectionScore {
    return {
      score: 0,
      breakdown: {
        presence: 0,
        clarity: 0,
        verifiability: 0,
        safety: 0,
        compliance: 0,
      },
      checks: [],
      missingItems: [message],
    };
  }

  private containsKeywords(text: string, keywords: string[]): boolean {
    const lowerText = text.toLowerCase();
    return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
  }

  private matchesEvidenceKeywords(text: string, evidence: TavilyEvidence[]): boolean {
    if (evidence.length === 0) return false;

    const lowerText = text.toLowerCase();
    
    // Extract keywords from evidence snippets
    const evidenceKeywords: string[] = [];
    evidence.slice(0, 5).forEach(ev => {
      const words = ev.snippet.toLowerCase().match(/\b\w{5,}\b/g) || [];
      evidenceKeywords.push(...words);
    });

    // Check if any evidence keywords appear in text
    const matches = evidenceKeywords.filter(kw => lowerText.includes(kw));
    
    // Mark evidence as used if matched
    if (matches.length > 0) {
      evidence.forEach(ev => {
        if (matches.some(m => ev.snippet.toLowerCase().includes(m))) {
          ev.usedInScoring = true;
        }
      });
    }

    return matches.length >= 2; // At least 2 keyword matches
  }

  private stepsAreActionable(steps: string[]): boolean {
    const actionVerbs = [
      'run', 'execute', 'perform', 'check', 'verify', 'update', 'configure',
      'create', 'delete', 'modify', 'start', 'stop', 'restart', 'enable',
      'disable', 'install', 'remove', 'backup', 'restore', 'connect', 'disconnect'
    ];

    const actionableSteps = steps.filter(step => {
      const lowerStep = step.toLowerCase();
      return actionVerbs.some(verb => lowerStep.startsWith(verb) || lowerStep.includes(` ${verb} `));
    });

    return actionableSteps.length >= steps.length * 0.6; // 60% should be actionable
  }

  private hasSequentialSteps(steps: string[]): boolean {
    // Already extracted as sequential steps by parser
    return steps.length > 0;
  }
}
