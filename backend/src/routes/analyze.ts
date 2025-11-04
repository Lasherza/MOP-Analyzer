/**
 * Analysis API Routes
 */
import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import { DocxParser } from '../services/docxParser';
import { ScoringEngine } from '../services/scoringEngine';
import { TavilyClient } from '../services/tavilyClient';
import { PDFGenerator } from '../utils/pdfGenerator';
import { TelcoCategory, AnalysisResult } from '../types';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir(config.uploadDir, { recursive: true });
      cb(null, config.uploadDir);
    } catch (error) {
      cb(error as Error, '');
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: config.maxFileSize,
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.docx') {
      cb(new AppError(400, 'Only DOCX files are allowed'));
      return;
    }
    cb(null, true);
  },
});

// Initialize services
const docxParser = new DocxParser();
const scoringEngine = new ScoringEngine();
const tavilyClient = new TavilyClient();
const pdfGenerator = new PDFGenerator();

/**
 * POST /api/analyze
 * Analyze MOP document
 */
router.post(
  '/analyze',
  upload.single('mop'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const startTime = Date.now();
    let filePath: string | undefined;

    try {
      // Validate inputs
      if (!req.file) {
        throw new AppError(400, 'No file uploaded. Please provide a DOCX file.');
      }

      const category = req.body.category as TelcoCategory;
      if (!category || !Object.values(TelcoCategory).includes(category)) {
        throw new AppError(400, 'Invalid category. Please select a valid Telco category.');
      }

      filePath = req.file.path;

      logger.info('Starting MOP analysis', {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        category,
      });

      // Step 1: Parse DOCX
      const parsedMOP = await docxParser.parse(
        filePath,
        req.file.originalname,
        req.file.size
      );

      // Step 2: Fetch Tavily evidence
      let evidence = await tavilyClient.searchBestPractices(category);
      const tavilyUsed = evidence.length > 0;

      if (!tavilyUsed) {
        logger.warn('Tavily returned no results, proceeding with baseline scoring', { category });
      }

      // Step 3: Score sections
      const preChecksScore = scoringEngine.scorePreChecks(parsedMOP.preChecks, evidence);
      const operationStepsScore = scoringEngine.scoreOperationSteps(parsedMOP.operationSteps, evidence);
      const rollbackStepsScore = scoringEngine.scoreRollbackSteps(parsedMOP.rollbackSteps, evidence);

      // Step 4: Calculate total score
      const totalScore = scoringEngine.calculateTotalScore(
        preChecksScore,
        operationStepsScore,
        rollbackStepsScore
      );

      // Step 5: Generate recommendations
      const recommendations = scoringEngine.generateRecommendations(
        preChecksScore,
        operationStepsScore,
        rollbackStepsScore
      );

      // Step 6: Calculate confidence
      const confidence = scoringEngine.calculateConfidence(parsedMOP, tavilyUsed);

      // Build result
      const result: AnalysisResult = {
        scores: {
          preChecks: preChecksScore,
          operationSteps: operationStepsScore,
          rollbackSteps: rollbackStepsScore,
        },
        totalScore,
        recommendations,
        evidence,
        rawExtraction: parsedMOP,
        confidence,
        metadata: {
          category,
          analyzedAt: new Date().toISOString(),
          processingTimeMs: Date.now() - startTime,
          tavilyUsed,
        },
      };

      logger.info('Analysis completed successfully', {
        totalScore,
        processingTimeMs: result.metadata.processingTimeMs,
        category,
      });

      res.json(result);
    } catch (error) {
      logger.error('Analysis failed', { error });
      next(error);
    } finally {
      // Clean up uploaded file
      if (filePath) {
        try {
          await fs.unlink(filePath);
          logger.debug('Cleaned up uploaded file', { filePath });
        } catch (err) {
          logger.warn('Failed to delete uploaded file', { filePath, error: err });
        }
      }
    }
  }
);

/**
 * POST /api/analyze/pdf
 * Analyze and return PDF report
 */
router.post(
  '/analyze/pdf',
  upload.single('mop'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const startTime = Date.now();
    let filePath: string | undefined;

    try {
      if (!req.file) {
        throw new AppError(400, 'No file uploaded');
      }

      const category = req.body.category as TelcoCategory;
      if (!category || !Object.values(TelcoCategory).includes(category)) {
        throw new AppError(400, 'Invalid category');
      }

      filePath = req.file.path;

      // Perform analysis (same as /analyze endpoint)
      const parsedMOP = await docxParser.parse(filePath, req.file.originalname, req.file.size);
      const evidence = await tavilyClient.searchBestPractices(category);
      
      const preChecksScore = scoringEngine.scorePreChecks(parsedMOP.preChecks, evidence);
      const operationStepsScore = scoringEngine.scoreOperationSteps(parsedMOP.operationSteps, evidence);
      const rollbackStepsScore = scoringEngine.scoreRollbackSteps(parsedMOP.rollbackSteps, evidence);
      
      const totalScore = scoringEngine.calculateTotalScore(preChecksScore, operationStepsScore, rollbackStepsScore);
      const recommendations = scoringEngine.generateRecommendations(preChecksScore, operationStepsScore, rollbackStepsScore);
      const confidence = scoringEngine.calculateConfidence(parsedMOP, evidence.length > 0);

      const result: AnalysisResult = {
        scores: { preChecks: preChecksScore, operationSteps: operationStepsScore, rollbackSteps: rollbackStepsScore },
        totalScore,
        recommendations,
        evidence,
        rawExtraction: parsedMOP,
        confidence,
        metadata: {
          category,
          analyzedAt: new Date().toISOString(),
          processingTimeMs: Date.now() - startTime,
          tavilyUsed: evidence.length > 0,
        },
      };

      // Generate PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="mop-analysis-report.pdf"`);

      await pdfGenerator.generate(result, res);
    } catch (error) {
      next(error);
    } finally {
      if (filePath) {
        try {
          await fs.unlink(filePath);
        } catch (err) {
          logger.warn('Failed to delete uploaded file', { error: err });
        }
      }
    }
  }
);

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    tavilyEnabled: config.tavilyEnabled,
  });
});

export default router;
