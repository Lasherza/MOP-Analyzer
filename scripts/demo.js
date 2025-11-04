#!/usr/bin/env node
/**
 * Demo script to test the Telco MOP Analysis Agent
 * Usage: node demo.js [path-to-docx] [category]
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3000';
const API_KEY = process.env.X_API_KEY || 'demo-api-key';

const CATEGORIES = {
  'ipcore': 'IPCORE',
  'packet': 'Packet Core',
  'billing': 'Billing and Revenue → Charging/Revenue Management',
  'radio': 'Radio Network',
  'transmission': 'Transmission Network',
  'devops': 'DevOps and Systems (OSS and BSS)',
  'it': 'IT',
  'security': 'Cyber Security',
  'data': 'Data Engineering'
};

async function analyzeMOP(filePath, category) {
  try {
    console.log('🔍 Telco MOP Analysis Agent - Demo\n');
    console.log(`File: ${filePath}`);
    console.log(`Category: ${category}`);
    console.log(`API: ${API_URL}\n`);

    // Check file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Create form data
    const form = new FormData();
    form.append('mop', fs.createReadStream(filePath));
    form.append('category', category);

    // Make request
    console.log('📤 Sending request...\n');
    const startTime = Date.now();

    const response = await axios.post(`${API_URL}/api/analyze`, form, {
      headers: {
        ...form.getHeaders(),
        'X-API-KEY': API_KEY,
      },
    });

    const duration = Date.now() - startTime;
    const result = response.data;

    // Display results
    console.log('✅ Analysis Complete!\n');
    console.log('═'.repeat(60));
    console.log(`📊 TOTAL QUALITY SCORE: ${result.totalScore.toFixed(1)}/10`);
    console.log(`⏱️  Processing Time: ${result.metadata.processingTimeMs}ms`);
    console.log(`🔒 Confidence: ${(result.confidence * 100).toFixed(0)}%`);
    console.log(`📚 Tavily Used: ${result.metadata.tavilyUsed ? 'Yes' : 'No'}`);
    console.log('═'.repeat(60));
    console.log('');

    // Section scores
    console.log('📋 SECTION SCORES:\n');
    
    console.log(`Pre-Checks: ${result.scores.preChecks.score.toFixed(1)}/10`);
    console.log(`  ├─ Presence: ${result.scores.preChecks.breakdown.presence.toFixed(1)}`);
    console.log(`  ├─ Clarity: ${result.scores.preChecks.breakdown.clarity.toFixed(1)}`);
    console.log(`  ├─ Verifiability: ${result.scores.preChecks.breakdown.verifiability.toFixed(1)}`);
    console.log(`  ├─ Safety: ${result.scores.preChecks.breakdown.safety.toFixed(1)}`);
    console.log(`  └─ Compliance: ${result.scores.preChecks.breakdown.compliance.toFixed(1)}\n`);

    console.log(`Operation Steps: ${result.scores.operationSteps.score.toFixed(1)}/10`);
    console.log(`  ├─ Presence: ${result.scores.operationSteps.breakdown.presence.toFixed(1)}`);
    console.log(`  ├─ Clarity: ${result.scores.operationSteps.breakdown.clarity.toFixed(1)}`);
    console.log(`  ├─ Verifiability: ${result.scores.operationSteps.breakdown.verifiability.toFixed(1)}`);
    console.log(`  ├─ Safety: ${result.scores.operationSteps.breakdown.safety.toFixed(1)}`);
    console.log(`  └─ Compliance: ${result.scores.operationSteps.breakdown.compliance.toFixed(1)}\n`);

    console.log(`Rollback Steps: ${result.scores.rollbackSteps.score.toFixed(1)}/10`);
    console.log(`  ├─ Presence: ${result.scores.rollbackSteps.breakdown.presence.toFixed(1)}`);
    console.log(`  ├─ Clarity: ${result.scores.rollbackSteps.breakdown.clarity.toFixed(1)}`);
    console.log(`  ├─ Verifiability: ${result.scores.rollbackSteps.breakdown.verifiability.toFixed(1)}`);
    console.log(`  ├─ Safety: ${result.scores.rollbackSteps.breakdown.safety.toFixed(1)}`);
    console.log(`  └─ Compliance: ${result.scores.rollbackSteps.breakdown.compliance.toFixed(1)}\n`);

    // Recommendations
    if (result.recommendations.length > 0) {
      console.log(`💡 RECOMMENDATIONS (${result.recommendations.length}):\n`);
      result.recommendations.slice(0, 10).forEach((rec, idx) => {
        console.log(`${idx + 1}. ${rec}`);
      });
      console.log('');
    }

    // Evidence
    if (result.evidence.length > 0) {
      console.log(`📚 INDUSTRY EVIDENCE (${result.evidence.length}):\n`);
      result.evidence.slice(0, 3).forEach((ev, idx) => {
        console.log(`${idx + 1}. ${ev.title}`);
        console.log(`   ${ev.link}`);
        console.log(`   Relevance: ${(ev.relevance * 100).toFixed(0)}%\n`);
      });
    }

    // Save JSON report
    const outputPath = path.join(__dirname, '../reports', `analysis-${Date.now()}.json`);
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log(`💾 Full report saved to: ${outputPath}\n`);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Main
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: node demo.js <docx-file> <category>');
  console.log('\nAvailable categories:');
  Object.entries(CATEGORIES).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });
  console.log('\nExample:');
  console.log('  node demo.js ../samples/full_mop.docx ipcore');
  process.exit(1);
}

const filePath = path.resolve(args[0]);
const categoryKey = args[1].toLowerCase();
const category = CATEGORIES[categoryKey];

if (!category) {
  console.error(`Invalid category: ${categoryKey}`);
  console.log('Available categories:', Object.keys(CATEGORIES).join(', '));
  process.exit(1);
}

analyzeMOP(filePath, category);
