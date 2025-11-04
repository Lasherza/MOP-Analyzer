/**
 * DOCX Parser Service
 * Extracts Pre-Checks, Operation Steps, and Rollback Steps from MOP documents
 */
import mammoth from 'mammoth';
import { ParsedMOP, MOPSection } from '../types';
import { logger } from '../utils/logger';

export class DocxParser {
  /**
   * Parse DOCX file and extract MOP sections
   */
  async parse(filePath: string, fileName: string, fileSize: number): Promise<ParsedMOP> {
    try {
      logger.info('Parsing DOCX file', { fileName, fileSize });
      
      const result = await mammoth.extractRawText({ path: filePath });
      const rawText = result.value;

      if (!rawText || rawText.trim().length === 0) {
        throw new Error('Document is empty or could not be parsed');
      }

      const preChecks = this.extractSection(rawText, this.getPreCheckPatterns());
      const operationSteps = this.extractSection(rawText, this.getOperationPatterns());
      const rollbackSteps = this.extractSection(rawText, this.getRollbackPatterns());

      const totalSections = [preChecks, operationSteps, rollbackSteps].filter(s => s !== null).length;

      logger.info('Parsing completed', { 
        fileName, 
        totalSections,
        hasPreChecks: !!preChecks,
        hasOperationSteps: !!operationSteps,
        hasRollbackSteps: !!rollbackSteps
      });

      return {
        preChecks,
        operationSteps,
        rollbackSteps,
        rawText,
        metadata: {
          fileName,
          fileSize,
          parsedAt: new Date().toISOString(),
          totalSections,
        },
      };
    } catch (error) {
      logger.error('Failed to parse DOCX', { fileName, error });
      throw new Error(`Failed to parse DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract a section based on heading patterns
   */
  private extractSection(text: string, patterns: RegExp[]): MOPSection | null {
    const lines = text.split('\n');
    let sectionStart = -1;
    let sectionEnd = -1;
    let heading = '';

    // Find section start
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      for (const pattern of patterns) {
        if (pattern.test(line)) {
          sectionStart = i;
          heading = line;
          break;
        }
      }
      if (sectionStart !== -1) break;
    }

    if (sectionStart === -1) {
      return null; // Section not found
    }

    // Find section end (next heading or end of document)
    const nextHeadingPatterns = [
      /^#{1,3}\s+/i, // Markdown headings
      /^[A-Z\s]{3,}:?\s*$/i, // ALL CAPS headings
      /^\d+\.\s*[A-Z]/i, // Numbered headings
      /^(pre[-\s]?checks?|operation(al)?\s+steps?|procedure|rollback|backout)/i,
    ];

    for (let i = sectionStart + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.length === 0) continue;
      
      for (const pattern of nextHeadingPatterns) {
        if (pattern.test(line) && i !== sectionStart) {
          sectionEnd = i;
          break;
        }
      }
      if (sectionEnd !== -1) break;
    }

    if (sectionEnd === -1) {
      sectionEnd = lines.length;
    }

    // Extract content
    const contentLines = lines.slice(sectionStart + 1, sectionEnd);
    const content = contentLines.join('\n').trim();

    // Extract steps (numbered or bulleted lists)
    const steps = this.extractSteps(content);

    return {
      heading,
      content,
      steps,
      lineNumber: sectionStart + 1,
    };
  }

  /**
   * Extract steps from section content
   */
  private extractSteps(content: string): string[] {
    const steps: string[] = [];
    const lines = content.split('\n');

    // Patterns for steps
    const stepPatterns = [
      /^\s*\d+[\.)]\s+(.+)$/,           // 1. or 1)
      /^\s*[a-zA-Z][\.)]\s+(.+)$/,      // a. or a)
      /^\s*[-•*]\s+(.+)$/,              // - or • or *
      /^\s*Step\s+\d+:\s*(.+)$/i,       // Step 1:
    ];

    let currentStep = '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        if (currentStep) {
          steps.push(currentStep.trim());
          currentStep = '';
        }
        continue;
      }

      let matched = false;
      for (const pattern of stepPatterns) {
        const match = trimmed.match(pattern);
        if (match) {
          if (currentStep) {
            steps.push(currentStep.trim());
          }
          currentStep = match[1] || match[0];
          matched = true;
          break;
        }
      }

      if (!matched && currentStep) {
        // Continuation of previous step
        currentStep += ' ' + trimmed;
      } else if (!matched) {
        // Standalone line, treat as step if substantial
        if (trimmed.length > 10) {
          steps.push(trimmed);
        }
      }
    }

    if (currentStep) {
      steps.push(currentStep.trim());
    }

    return steps.filter(s => s.length > 5); // Filter out very short steps
  }

  /**
   * Patterns for Pre-Checks section
   */
  private getPreCheckPatterns(): RegExp[] {
    return [
      /^pre[-\s]?checks?$/i,
      /^pre[-\s]?conditions?$/i,
      /^pre[-\s]?requisites?$/i,
      /^prerequisites?$/i,
      /^prechecks?$/i,
      /^\d+\.\s*pre[-\s]?checks?/i,
    ];
  }

  /**
   * Patterns for Operation Steps section
   */
  private getOperationPatterns(): RegExp[] {
    return [
      /^operation(al)?\s+steps?$/i,
      /^procedure$/i,
      /^implementation\s+steps?$/i,
      /^execution\s+steps?$/i,
      /^steps?$/i,
      /^\d+\.\s*operation(al)?\s+steps?/i,
      /^change\s+procedure$/i,
    ];
  }

  /**
   * Patterns for Rollback Steps section
   */
  private getRollbackPatterns(): RegExp[] {
    return [
      /^rollback\s+steps?$/i,
      /^rollback\s+plan$/i,
      /^rollback\s+procedure$/i,
      /^backout\s+plan$/i,
      /^backout\s+steps?$/i,
      /^recovery\s+steps?$/i,
      /^\d+\.\s*rollback/i,
    ];
  }
}
