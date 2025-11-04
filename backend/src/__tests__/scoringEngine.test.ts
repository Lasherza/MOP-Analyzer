/**
 * Unit tests for Scoring Engine
 */
import { ScoringEngine } from '../services/scoringEngine';
import { MOPSection, TavilyEvidence } from '../types';

describe('ScoringEngine', () => {
  let engine: ScoringEngine;

  beforeEach(() => {
    engine = new ScoringEngine();
  });

  const mockPreChecksSection: MOPSection = {
    heading: 'Pre-Checks',
    content: `
      1. Verify system status is healthy
      2. Check backup is completed successfully
      3. Confirm change approval from CAB
      4. Ensure all dependencies are met
      5. Risk assessment completed by the owner
      6. Verify resources are available
    `,
    steps: [
      'Verify system status is healthy',
      'Check backup is completed successfully',
      'Confirm change approval from CAB',
      'Ensure all dependencies are met',
      'Risk assessment completed by the owner',
      'Verify resources are available',
    ],
    lineNumber: 1,
  };

  const mockOperationSection: MOPSection = {
    heading: 'Operation Steps',
    content: `
      1. Stop the service
      2. Backup configuration files
      3. Update configuration with new parameters
      4. Verify configuration syntax
      5. Start the service
      6. Validate service is running
      7. Monitor logs for errors
      8. Notify team of completion
    `,
    steps: [
      'Stop the service',
      'Backup configuration files',
      'Update configuration with new parameters',
      'Verify configuration syntax',
      'Start the service',
      'Validate service is running',
      'Monitor logs for errors',
      'Notify team of completion',
    ],
    lineNumber: 10,
  };

  const mockRollbackSection: MOPSection = {
    heading: 'Rollback Steps',
    content: `
      Rollback trigger: If service fails to start or critical errors occur
      1. Stop the service
      2. Restore original configuration from backup
      3. Verify configuration integrity
      4. Start the service
      5. Validate system returns to previous state
      Owner: Change Manager
    `,
    steps: [
      'Stop the service',
      'Restore original configuration from backup',
      'Verify configuration integrity',
      'Start the service',
      'Validate system returns to previous state',
    ],
    lineNumber: 20,
  };

  const mockEvidence: TavilyEvidence[] = [
    {
      title: 'ITIL4 Change Enablement Best Practices',
      link: 'https://example.com/itil4',
      snippet: 'Change approval, risk assessment, and proper authorization are critical...',
      relevance: 0.9,
      usedInScoring: false,
    },
  ];

  describe('scorePreChecks', () => {
    it('should return 0 score when section is null', () => {
      const result = engine.scorePreChecks(null, []);
      expect(result.score).toBe(0);
      expect(result.missingItems.length).toBeGreaterThan(0);
    });

    it('should score a good pre-checks section highly', () => {
      const result = engine.scorePreChecks(mockPreChecksSection, mockEvidence);
      expect(result.score).toBeGreaterThan(7);
      expect(result.breakdown.presence).toBeGreaterThan(0);
    });

    it('should identify missing items', () => {
      const poorSection: MOPSection = {
        heading: 'Pre-Checks',
        content: 'Just check the system',
        steps: ['Check system'],
        lineNumber: 1,
      };
      const result = engine.scorePreChecks(poorSection, []);
      expect(result.missingItems.length).toBeGreaterThan(0);
    });
  });

  describe('scoreOperationSteps', () => {
    it('should return 0 score when section is null', () => {
      const result = engine.scoreOperationSteps(null, []);
      expect(result.score).toBe(0);
    });

    it('should score detailed operation steps highly', () => {
      const result = engine.scoreOperationSteps(mockOperationSection, mockEvidence);
      expect(result.score).toBeGreaterThan(6);
    });

    it('should verify actionable steps', () => {
      const result = engine.scoreOperationSteps(mockOperationSection, []);
      const actionableCheck = result.checks.find(c => c.name.includes('actionable'));
      expect(actionableCheck?.passed).toBe(true);
    });
  });

  describe('scoreRollbackSteps', () => {
    it('should return 0 score when section is null', () => {
      const result = engine.scoreRollbackSteps(null, []);
      expect(result.score).toBe(0);
    });

    it('should score comprehensive rollback steps highly', () => {
      const result = engine.scoreRollbackSteps(mockRollbackSection, mockEvidence);
      expect(result.score).toBeGreaterThan(6);
    });

    it('should detect rollback triggers', () => {
      const result = engine.scoreRollbackSteps(mockRollbackSection, []);
      const triggerCheck = result.checks.find(c => c.name.includes('trigger'));
      expect(triggerCheck?.passed).toBe(true);
    });
  });

  describe('calculateTotalScore', () => {
    it('should calculate weighted average correctly', () => {
      const preChecks = engine.scorePreChecks(mockPreChecksSection, []);
      const opSteps = engine.scoreOperationSteps(mockOperationSection, []);
      const rollback = engine.scoreRollbackSteps(mockRollbackSection, []);

      const total = engine.calculateTotalScore(preChecks, opSteps, rollback);

      expect(total).toBeGreaterThan(0);
      expect(total).toBeLessThanOrEqual(10);
    });
  });

  describe('generateRecommendations', () => {
    it('should generate recommendations for low scores', () => {
      const lowScore = {
        score: 3,
        breakdown: { presence: 0, clarity: 0, verifiability: 0, safety: 0, compliance: 0 },
        checks: [],
        missingItems: ['Missing item 1', 'Missing item 2'],
      };

      const recommendations = engine.generateRecommendations(lowScore, lowScore, lowScore);
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some(r => r.includes('CRITICAL'))).toBe(true);
    });
  });

  describe('calculateConfidence', () => {
    it('should increase confidence when all sections present', () => {
      const fullMOP = {
        preChecks: mockPreChecksSection,
        operationSteps: mockOperationSection,
        rollbackSteps: mockRollbackSection,
        rawText: 'test',
        metadata: { fileName: 'test.docx', fileSize: 1000, parsedAt: new Date().toISOString(), totalSections: 3 },
      };

      const confidence = engine.calculateConfidence(fullMOP, true);
      expect(confidence).toBeGreaterThan(0.8);
    });

    it('should have lower confidence when sections missing', () => {
      const incompleteMOP = {
        preChecks: mockPreChecksSection,
        operationSteps: null,
        rollbackSteps: null,
        rawText: 'test',
        metadata: { fileName: 'test.docx', fileSize: 1000, parsedAt: new Date().toISOString(), totalSections: 1 },
      };

      const confidence = engine.calculateConfidence(incompleteMOP, false);
      expect(confidence).toBeLessThan(0.7);
    });
  });
});
