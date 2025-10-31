// ITIL 4 Change Enablement MOP Analyzer
// Main Application Logic

// Global state
let currentAnalysis = null;
let chartInstance = null;

// Category-specific best practices keywords
const categoryKeywords = {
    'ipcore': {
        name: 'IP Core Network',
        keywords: ['BGP', 'OSPF', 'MPLS', 'routing', 'core network', 'backbone', 'peering', 'IP addressing'],
        criticalAreas: ['routing table backups', 'traffic monitoring', 'BGP session verification', 'MPLS path validation']
    },
    'packet-core': {
        name: 'Packet Core',
        keywords: ['EPC', '5GC', 'MME', 'SGW', 'PGW', 'UPF', 'SMF', 'AMF', 'subscriber', 'bearer'],
        criticalAreas: ['subscriber impact analysis', 'session continuity', 'bearer management', 'network slicing']
    },
    'billing': {
        name: 'Billing and Revenue Management',
        keywords: ['billing', 'charging', 'revenue', 'CDR', 'mediation', 'rating', 'invoicing', 'payment'],
        criticalAreas: ['data backup', 'transaction rollback', 'revenue loss prevention', 'audit trail']
    },
    'radio': {
        name: 'Radio Network',
        keywords: ['RAN', 'eNodeB', 'gNodeB', 'cell', 'antenna', 'RF', 'spectrum', 'handover'],
        criticalAreas: ['coverage analysis', 'interference check', 'handover testing', 'KPI monitoring']
    },
    'transmission': {
        name: 'Transmission Network',
        keywords: ['microwave', 'fiber', 'SDH', 'DWDM', 'OTN', 'backhaul', 'fronthaul', 'transport'],
        criticalAreas: ['link redundancy', 'path protection', 'latency monitoring', 'capacity verification']
    },
    'devops': {
        name: 'DevOps and Systems (OSS/BSS)',
        keywords: ['OSS', 'BSS', 'automation', 'orchestration', 'CI/CD', 'monitoring', 'provisioning'],
        criticalAreas: ['automated testing', 'deployment pipeline', 'monitoring setup', 'rollback automation']
    },
    'it': {
        name: 'IT Systems',
        keywords: ['server', 'database', 'application', 'infrastructure', 'virtualization', 'cloud', 'storage'],
        criticalAreas: ['system backup', 'service dependencies', 'database transaction', 'capacity planning']
    },
    'cyber': {
        name: 'Cyber Security',
        keywords: ['firewall', 'IDS', 'IPS', 'encryption', 'authentication', 'vulnerability', 'security'],
        criticalAreas: ['security baseline', 'access control verification', 'incident response', 'compliance check']
    },
    'data': {
        name: 'Data Engineering',
        keywords: ['ETL', 'data pipeline', 'big data', 'analytics', 'data warehouse', 'streaming', 'batch'],
        criticalAreas: ['data quality check', 'pipeline validation', 'data lineage', 'backup verification']
    }
};

// ITIL 4 Change Enablement criteria
const itilCriteria = {
    preChecks: [
        'Impact assessment documented',
        'Risk analysis completed',
        'Dependencies identified',
        'Backout plan confirmed',
        'Resource availability verified',
        'Stakeholder approval obtained',
        'Service impact communicated',
        'Testing environment validated',
        'Change window scheduled',
        'Backup verification completed'
    ],
    operationSteps: [
        'Steps are numbered sequentially',
        'Each step has clear success criteria',
        'Expected outcomes defined',
        'Commands/scripts provided',
        'Validation points included',
        'Time estimates provided',
        'Dependencies between steps noted',
        'Security considerations addressed',
        'Communication points defined',
        'Monitoring checkpoints included'
    ],
    rollbackSteps: [
        'Rollback procedure documented',
        'Rollback triggers defined',
        'Step-by-step rollback instructions',
        'Rollback validation criteria',
        'Time estimates for rollback',
        'Data restoration procedure',
        'Service restoration order',
        'Communication plan for rollback',
        'Lessons learned process',
        'Post-rollback verification'
    ]
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadApiKeyFromStorage();
});

function initializeEventListeners() {
    // File input change
    document.getElementById('mopFile').addEventListener('change', handleFileSelect);
    
    // Analyze button click
    document.getElementById('analyzeBtn').addEventListener('click', handleAnalyze);
    
    // Export button click
    document.getElementById('exportBtn').addEventListener('click', handleExport);
    
    // API key storage
    document.getElementById('apiKey').addEventListener('change', saveApiKeyToStorage);
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        document.getElementById('fileName').textContent = file.name;
        document.getElementById('fileInfo').innerHTML = `
            <strong>Selected:</strong> ${file.name} (${formatFileSize(file.size)})
        `;
    }
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function loadApiKeyFromStorage() {
    const apiKey = localStorage.getItem('tavilyApiKey');
    if (apiKey) {
        document.getElementById('apiKey').value = apiKey;
    }
}

function saveApiKeyToStorage() {
    const apiKey = document.getElementById('apiKey').value;
    if (apiKey) {
        localStorage.setItem('tavilyApiKey', apiKey);
    }
}

// Main analysis handler
async function handleAnalyze() {
    const category = document.getElementById('category').value;
    const file = document.getElementById('mopFile').files[0];
    const apiKey = document.getElementById('apiKey').value;

    // Validation
    if (!category) {
        alert('Please select a category');
        return;
    }

    if (!file) {
        alert('Please select a MOP document');
        return;
    }

    if (!apiKey) {
        alert('Please enter your Tavily API key');
        return;
    }

    // Show loading indicator
    showLoading();
    
    try {
        // Step 1: Read and parse the MOP document
        updateLoadingDetail('Reading MOP document...');
        const mopContent = await readFileContent(file);
        
        // Step 2: Extract sections
        updateLoadingDetail('Extracting sections...');
        const sections = extractMOPSections(mopContent);
        
        // Step 3: Fetch industry best practices
        updateLoadingDetail('Fetching industry best practices...');
        const bestPractices = await fetchBestPractices(category, apiKey);
        
        // Step 4: Score the MOP
        updateLoadingDetail('Analyzing and scoring...');
        const scores = scoreMOP(sections, category, bestPractices);
        
        // Step 5: Generate recommendations
        updateLoadingDetail('Generating recommendations...');
        const recommendations = generateRecommendations(sections, scores, category);
        
        // Store analysis
        currentAnalysis = {
            category,
            sections,
            scores,
            recommendations,
            bestPractices
        };
        
        // Display results
        displayResults(currentAnalysis);
        
    } catch (error) {
        console.error('Analysis error:', error);
        alert('An error occurred during analysis: ' + error.message);
    } finally {
        hideLoading();
    }
}

function showLoading() {
    document.getElementById('loadingIndicator').style.display = 'block';
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('analyzeBtn').disabled = true;
}

function hideLoading() {
    document.getElementById('loadingIndicator').style.display = 'none';
    document.getElementById('analyzeBtn').disabled = false;
}

function updateLoadingDetail(message) {
    document.getElementById('loadingDetail').textContent = message;
}

// Read file content
function readFileContent(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            resolve(e.target.result);
        };
        
        reader.onerror = (e) => {
            reject(new Error('Failed to read file'));
        };
        
        reader.readAsText(file);
    });
}

// Extract MOP sections using pattern matching
function extractMOPSections(content) {
    const sections = {
        preChecks: '',
        operationSteps: '',
        rollbackSteps: '',
        raw: content
    };

    // Convert to lowercase for case-insensitive matching
    const lowerContent = content.toLowerCase();

    // Pattern matching for Pre-Checks section
    const preCheckPatterns = [
        /pre[-\s]?checks?:?\s*([\s\S]*?)(?=operation|procedure|implementation|rollback|$)/i,
        /prerequisites?:?\s*([\s\S]*?)(?=operation|procedure|implementation|rollback|$)/i,
        /pre[-\s]?requisites?:?\s*([\s\S]*?)(?=operation|procedure|implementation|rollback|$)/i,
        /verification:?\s*([\s\S]*?)(?=operation|procedure|implementation|rollback|$)/i
    ];

    // Pattern matching for Operation Steps
    const operationPatterns = [
        /(?:operation|procedure|implementation)\s*steps?:?\s*([\s\S]*?)(?=rollback|backout|verification|post|$)/i,
        /implementation:?\s*([\s\S]*?)(?=rollback|backout|verification|post|$)/i,
        /procedure:?\s*([\s\S]*?)(?=rollback|backout|verification|post|$)/i
    ];

    // Pattern matching for Rollback Steps
    const rollbackPatterns = [
        /rollback\s*(?:steps|procedure)?:?\s*([\s\S]*?)(?=verification|post|appendix|$)/i,
        /backout\s*(?:steps|procedure)?:?\s*([\s\S]*?)(?=verification|post|appendix|$)/i,
        /recovery\s*procedure:?\s*([\s\S]*?)(?=verification|post|appendix|$)/i
    ];

    // Extract Pre-Checks
    for (const pattern of preCheckPatterns) {
        const match = content.match(pattern);
        if (match && match[1] && match[1].trim().length > 50) {
            sections.preChecks = match[1].trim();
            break;
        }
    }

    // Extract Operation Steps
    for (const pattern of operationPatterns) {
        const match = content.match(pattern);
        if (match && match[1] && match[1].trim().length > 50) {
            sections.operationSteps = match[1].trim();
            break;
        }
    }

    // Extract Rollback Steps
    for (const pattern of rollbackPatterns) {
        const match = content.match(pattern);
        if (match && match[1] && match[1].trim().length > 50) {
            sections.rollbackSteps = match[1].trim();
            break;
        }
    }

    return sections;
}

// Fetch industry best practices using Tavily API
async function fetchBestPractices(category, apiKey) {
    const categoryInfo = categoryKeywords[category];
    const query = `ITIL 4 Change Enablement best practices for ${categoryInfo.name} telecommunications`;

    try {
        const response = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                api_key: apiKey,
                query: query,
                search_depth: 'advanced',
                max_results: 5,
                include_answer: true
            })
        });

        if (!response.ok) {
            throw new Error(`Tavily API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Tavily API error:', error);
        // Return mock data if API fails
        return {
            answer: 'Industry best practices emphasize thorough pre-checks, detailed operation steps, and comprehensive rollback procedures.',
            results: []
        };
    }
}

// Score the MOP based on ITIL criteria and category-specific requirements
function scoreMOP(sections, category, bestPractices) {
    const categoryInfo = categoryKeywords[category];
    
    const scores = {
        preChecks: scoreSection(sections.preChecks, itilCriteria.preChecks, categoryInfo.criticalAreas),
        operationSteps: scoreSection(sections.operationSteps, itilCriteria.operationSteps, categoryInfo.criticalAreas),
        rollbackSteps: scoreSection(sections.rollbackSteps, itilCriteria.rollbackSteps, categoryInfo.criticalAreas)
    };

    // Calculate overall score
    scores.overall = ((scores.preChecks.score + scores.operationSteps.score + scores.rollbackSteps.score) / 3).toFixed(1);
    
    // Determine risk level
    if (scores.overall >= 8) {
        scores.riskLevel = 'Low';
    } else if (scores.overall >= 6) {
        scores.riskLevel = 'Medium';
    } else {
        scores.riskLevel = 'High';
    }

    return scores;
}

function scoreSection(content, criteria, criticalAreas) {
    if (!content || content.length < 50) {
        return {
            score: 0,
            matchedCriteria: [],
            missedCriteria: criteria,
            details: 'Section is missing or insufficient'
        };
    }

    const lowerContent = content.toLowerCase();
    const matchedCriteria = [];
    const missedCriteria = [];

    // Check each criterion
    for (const criterion of criteria) {
        const keywords = extractKeywords(criterion);
        let matched = false;

        for (const keyword of keywords) {
            if (lowerContent.includes(keyword.toLowerCase())) {
                matched = true;
                break;
            }
        }

        if (matched) {
            matchedCriteria.push(criterion);
        } else {
            missedCriteria.push(criterion);
        }
    }

    // Calculate score (0-10)
    const baseScore = (matchedCriteria.length / criteria.length) * 10;
    
    // Bonus points for content quality
    const hasNumberedSteps = /\d+\.\s+/.test(content);
    const hasValidation = /verify|validate|check|confirm/i.test(content);
    const hasTimings = /minute|hour|second|time/i.test(content);
    
    let qualityBonus = 0;
    if (hasNumberedSteps) qualityBonus += 0.3;
    if (hasValidation) qualityBonus += 0.3;
    if (hasTimings) qualityBonus += 0.2;

    const finalScore = Math.min(10, baseScore + qualityBonus);

    return {
        score: parseFloat(finalScore.toFixed(1)),
        matchedCriteria,
        missedCriteria,
        qualityIndicators: {
            hasNumberedSteps,
            hasValidation,
            hasTimings
        }
    };
}

function extractKeywords(criterion) {
    // Extract meaningful keywords from criterion
    const words = criterion.toLowerCase().split(' ');
    return words.filter(word => word.length > 4 && !['steps', 'defined', 'included'].includes(word));
}

// Generate recommendations based on analysis
function generateRecommendations(sections, scores, category) {
    const recommendations = [];
    const categoryInfo = categoryKeywords[category];

    // Pre-Checks recommendations
    if (scores.preChecks.score < 7) {
        recommendations.push({
            section: 'Pre-Checks',
            priority: 'high',
            title: 'Strengthen Pre-Check Procedures',
            description: `The pre-checks section scored ${scores.preChecks.score}/10. Critical missing elements: ${scores.preChecks.missedCriteria.slice(0, 3).join(', ')}.`,
            action: 'Add comprehensive pre-checks including impact assessment, dependency mapping, and resource verification.'
        });
    }

    // Operation Steps recommendations
    if (scores.operationSteps.score < 7) {
        recommendations.push({
            section: 'Operation Steps',
            priority: scores.operationSteps.score < 5 ? 'high' : 'medium',
            title: 'Improve Operation Step Documentation',
            description: `The operation steps scored ${scores.operationSteps.score}/10. Missing: ${scores.operationSteps.missedCriteria.slice(0, 3).join(', ')}.`,
            action: 'Add clear success criteria, validation points, and expected outcomes for each step.'
        });
    }

    if (!scores.operationSteps.qualityIndicators.hasNumberedSteps) {
        recommendations.push({
            section: 'Operation Steps',
            priority: 'medium',
            title: 'Add Sequential Numbering',
            description: 'Operation steps lack clear sequential numbering.',
            action: 'Number all steps sequentially (1, 2, 3...) for better tracking and execution.'
        });
    }

    // Rollback Steps recommendations
    if (scores.rollbackSteps.score < 7) {
        recommendations.push({
            section: 'Rollback Steps',
            priority: 'high',
            title: 'Enhance Rollback Procedures',
            description: `The rollback section scored ${scores.rollbackSteps.score}/10. This is critical for change safety.`,
            action: 'Document detailed rollback steps, triggers, validation criteria, and time estimates.'
        });
    }

    if (!sections.rollbackSteps || sections.rollbackSteps.length < 100) {
        recommendations.push({
            section: 'Rollback Steps',
            priority: 'high',
            title: 'Critical: Missing Rollback Procedure',
            description: 'No adequate rollback procedure found. This poses significant risk.',
            action: 'Create a comprehensive rollback plan with step-by-step instructions and validation criteria.'
        });
    }

    // Category-specific recommendations
    categoryInfo.criticalAreas.forEach(area => {
        const allContent = `${sections.preChecks} ${sections.operationSteps} ${sections.rollbackSteps}`.toLowerCase();
        if (!allContent.includes(area.toLowerCase().split(' ')[0])) {
            recommendations.push({
                section: 'Category-Specific',
                priority: 'medium',
                title: `Add ${categoryInfo.name} Best Practice`,
                description: `Missing critical area for ${categoryInfo.name}: ${area}`,
                action: `Incorporate ${area} into the appropriate section of the MOP.`
            });
        }
    });

    return recommendations;
}

// Display results in the UI
function displayResults(analysis) {
    const { scores, recommendations, bestPractices, category } = analysis;

    // Show results section
    document.getElementById('resultsSection').style.display = 'block';

    // Scroll to results
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });

    // Overall Score
    document.getElementById('overallScore').textContent = scores.overall;
    
    // Risk Level
    const riskElement = document.getElementById('riskLevel');
    riskElement.textContent = scores.riskLevel + ' Risk';
    riskElement.className = 'risk-badge risk-' + scores.riskLevel.toLowerCase();

    // Section Scores
    displaySectionScore('preCheckScore', 'preCheckDetails', scores.preChecks, 'Pre-Checks');
    displaySectionScore('operationScore', 'operationDetails', scores.operationSteps, 'Operation Steps');
    displaySectionScore('rollbackScore', 'rollbackDetails', scores.rollbackSteps, 'Rollback Steps');

    // Chart
    displayChart(scores);

    // Recommendations
    displayRecommendations(recommendations);

    // Best Practices
    displayBestPractices(bestPractices, category);
}

function displaySectionScore(scoreId, detailsId, sectionScore, sectionName) {
    const scoreElement = document.getElementById(scoreId);
    scoreElement.textContent = sectionScore.score;
    
    // Color coding
    let bgColor;
    if (sectionScore.score >= 8) bgColor = '#10b981';
    else if (sectionScore.score >= 6) bgColor = '#f59e0b';
    else bgColor = '#ef4444';
    
    scoreElement.style.background = bgColor;

    // Details
    const detailsElement = document.getElementById(detailsId);
    let detailsHTML = '<ul>';
    detailsHTML += `<li>Matched: ${sectionScore.matchedCriteria.length}/${sectionScore.matchedCriteria.length + sectionScore.missedCriteria.length} criteria</li>`;
    
    if (sectionScore.qualityIndicators) {
        if (sectionScore.qualityIndicators.hasNumberedSteps) {
            detailsHTML += '<li>? Numbered steps</li>';
        }
        if (sectionScore.qualityIndicators.hasValidation) {
            detailsHTML += '<li>? Validation points</li>';
        }
        if (sectionScore.qualityIndicators.hasTimings) {
            detailsHTML += '<li>? Time estimates</li>';
        }
    }
    
    detailsHTML += '</ul>';
    detailsElement.innerHTML = detailsHTML;
}

function displayChart(scores) {
    const ctx = document.getElementById('scoreChart').getContext('2d');
    
    // Destroy previous chart if exists
    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Pre-Checks', 'Operation Steps', 'Rollback Steps', 'Overall'],
            datasets: [{
                label: 'Score (out of 10)',
                data: [
                    scores.preChecks.score,
                    scores.operationSteps.score,
                    scores.rollbackSteps.score,
                    scores.overall
                ],
                backgroundColor: [
                    scores.preChecks.score >= 7 ? '#10b981' : scores.preChecks.score >= 5 ? '#f59e0b' : '#ef4444',
                    scores.operationSteps.score >= 7 ? '#10b981' : scores.operationSteps.score >= 5 ? '#f59e0b' : '#ef4444',
                    scores.rollbackSteps.score >= 7 ? '#10b981' : scores.rollbackSteps.score >= 5 ? '#f59e0b' : '#ef4444',
                    scores.overall >= 7 ? '#10b981' : scores.overall >= 5 ? '#f59e0b' : '#ef4444'
                ],
                borderColor: [
                    '#059669',
                    '#d97706',
                    '#dc2626',
                    '#2563eb'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10,
                    ticks: {
                        stepSize: 2
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'MOP Analysis Scores',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                }
            }
        }
    });
}

function displayRecommendations(recommendations) {
    const container = document.getElementById('recommendationsContainer');
    
    if (recommendations.length === 0) {
        container.innerHTML = '<p>? Excellent! No major recommendations. Your MOP follows ITIL 4 best practices.</p>';
        return;
    }

    let html = '';
    recommendations.forEach(rec => {
        html += `
            <div class="recommendation-item ${rec.priority}-priority">
                <h4>
                    ${rec.title}
                    <span class="priority-badge priority-${rec.priority}">${rec.priority}</span>
                </h4>
                <p><strong>Section:</strong> ${rec.section}</p>
                <p><strong>Issue:</strong> ${rec.description}</p>
                <p><strong>Action:</strong> ${rec.action}</p>
            </div>
        `;
    });

    container.innerHTML = html;
}

function displayBestPractices(bestPractices, category) {
    const container = document.getElementById('bestPracticesContainer');
    const categoryInfo = categoryKeywords[category];

    let html = `<p><strong>Category:</strong> ${categoryInfo.name}</p>`;

    if (bestPractices.answer) {
        html += `
            <div class="best-practice-item">
                <span class="best-practice-icon">??</span>
                <div class="best-practice-content">
                    <h4>Industry Insight</h4>
                    <p>${bestPractices.answer}</p>
                </div>
            </div>
        `;
    }

    if (bestPractices.results && bestPractices.results.length > 0) {
        bestPractices.results.slice(0, 3).forEach(result => {
            html += `
                <div class="best-practice-item">
                    <span class="best-practice-icon">??</span>
                    <div class="best-practice-content">
                        <h4>${result.title || 'Best Practice Resource'}</h4>
                        <p>${result.content || result.snippet || ''}</p>
                        ${result.url ? `<div class="best-practice-source">Source: <a href="${result.url}" target="_blank">${result.url}</a></div>` : ''}
                    </div>
                </div>
            `;
        });
    }

    // Add category-specific best practices
    html += `
        <div class="best-practice-item">
            <span class="best-practice-icon">?</span>
            <div class="best-practice-content">
                <h4>${categoryInfo.name} Critical Areas</h4>
                <p>Ensure your MOP addresses these critical areas:</p>
                <ul>
                    ${categoryInfo.criticalAreas.map(area => `<li>${area}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

// Export report functionality
function handleExport() {
    if (!currentAnalysis) {
        alert('No analysis to export');
        return;
    }

    const { category, scores, recommendations } = currentAnalysis;
    const categoryInfo = categoryKeywords[category];

    const report = {
        title: 'ITIL 4 Change Enablement MOP Analysis Report',
        date: new Date().toISOString(),
        category: categoryInfo.name,
        scores: {
            overall: scores.overall,
            riskLevel: scores.riskLevel,
            preChecks: scores.preChecks.score,
            operationSteps: scores.operationSteps.score,
            rollbackSteps: scores.rollbackSteps.score
        },
        recommendations: recommendations.map(rec => ({
            section: rec.section,
            priority: rec.priority,
            title: rec.title,
            description: rec.description,
            action: rec.action
        }))
    };

    // Create downloadable JSON
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MOP_Analysis_Report_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert('Report exported successfully!');
}
