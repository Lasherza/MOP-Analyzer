# ?? Customization Guide

Learn how to customize the ITIL 4 MOP Analyzer for your organization's needs.

## ?? Branding

### Update Company Name and Logo

Edit `index.html`:

```html
<!-- Line 12-13 -->
<h1>?? Your Company MOP Analyzer</h1>
<p class="subtitle">Your custom subtitle here</p>

<!-- Add logo -->
<img src="your-logo.png" alt="Company Logo" style="height: 50px;">
```

### Change Color Scheme

Edit `styles.css` root variables:

```css
:root {
    /* Primary colors */
    --primary-color: #your-brand-color;
    --secondary-color: #your-secondary-color;
    
    /* Functional colors */
    --success-color: #10b981;  /* Green for good scores */
    --warning-color: #f59e0b;  /* Orange for medium scores */
    --danger-color: #ef4444;   /* Red for low scores */
}
```

**Popular Color Schemes**:

```css
/* Tech Blue */
--primary-color: #0066cc;
--secondary-color: #004c99;

/* Corporate Purple */
--primary-color: #6b46c1;
--secondary-color: #553c9a;

/* Telco Orange */
--primary-color: #ff6600;
--secondary-color: #cc5200;

/* Professional Gray */
--primary-color: #4a5568;
--secondary-color: #2d3748;
```

---

## ?? Adding Custom Categories

Edit `app.js` - `categoryKeywords` object:

```javascript
const categoryKeywords = {
    // ... existing categories ...
    
    'your-category': {
        name: 'Your Category Display Name',
        keywords: [
            'keyword1',
            'keyword2',
            'keyword3'
        ],
        criticalAreas: [
            'Critical area 1 to check',
            'Critical area 2 to check',
            'Critical area 3 to check'
        ]
    }
};
```

Then add to HTML dropdown in `index.html`:

```html
<select id="category" class="form-control">
    <!-- ... existing options ... -->
    <option value="your-category">Your Category Name</option>
</select>
```

**Example - Cloud Infrastructure**:

```javascript
'cloud': {
    name: 'Cloud Infrastructure',
    keywords: [
        'AWS', 'Azure', 'GCP', 'Kubernetes', 
        'container', 'microservices', 'serverless'
    ],
    criticalAreas: [
        'infrastructure as code validation',
        'auto-scaling configuration',
        'disaster recovery testing',
        'cost impact analysis'
    ]
}
```

---

## ?? Customizing Scoring Criteria

### Modify ITIL Criteria

Edit `app.js` - `itilCriteria` object:

```javascript
const itilCriteria = {
    preChecks: [
        'Your custom criterion 1',
        'Your custom criterion 2',
        // ... up to 10 criteria recommended
    ],
    operationSteps: [
        'Your custom criterion 1',
        'Your custom criterion 2',
        // ...
    ],
    rollbackSteps: [
        'Your custom criterion 1',
        'Your custom criterion 2',
        // ...
    ]
};
```

### Adjust Scoring Weights

In `app.js`, modify the `scoreSection` function:

```javascript
function scoreSection(content, criteria, criticalAreas) {
    // ... existing code ...
    
    // Adjust quality bonuses
    let qualityBonus = 0;
    if (hasNumberedSteps) qualityBonus += 0.5;  // Increase from 0.3
    if (hasValidation) qualityBonus += 0.4;     // Increase from 0.3
    if (hasTimings) qualityBonus += 0.3;        // Increase from 0.2
    
    // Custom quality checks
    const hasAutomation = /ansible|terraform|script/i.test(content);
    if (hasAutomation) qualityBonus += 0.2;
    
    const finalScore = Math.min(10, baseScore + qualityBonus);
    // ...
}
```

### Change Risk Level Thresholds

In `app.js`, modify the `scoreMOP` function:

```javascript
// Default thresholds
if (scores.overall >= 8) {
    scores.riskLevel = 'Low';
} else if (scores.overall >= 6) {
    scores.riskLevel = 'Medium';
} else {
    scores.riskLevel = 'High';
}

// Stricter thresholds
if (scores.overall >= 9) {
    scores.riskLevel = 'Low';
} else if (scores.overall >= 7.5) {
    scores.riskLevel = 'Medium';
} else {
    scores.riskLevel = 'High';
}
```

---

## ?? Custom Section Detection

### Add Alternative Section Names

Edit the pattern arrays in `extractMOPSections` function:

```javascript
// Pre-Checks patterns
const preCheckPatterns = [
    /pre[-\s]?checks?:?\s*([\s\S]*?)(?=operation|procedure|implementation|rollback|$)/i,
    /prerequisites?:?\s*([\s\S]*?)(?=operation|procedure|implementation|rollback|$)/i,
    // Add custom patterns
    /validation\s*checklist:?\s*([\s\S]*?)(?=operation|procedure|implementation|rollback|$)/i,
    /readiness\s*assessment:?\s*([\s\S]*?)(?=operation|procedure|implementation|rollback|$)/i,
];
```

---

## ?? Custom Visualizations

### Change Chart Type

Edit `displayChart` function in `app.js`:

```javascript
// Change from bar to radar chart
chartInstance = new Chart(ctx, {
    type: 'radar',  // or 'line', 'pie', 'doughnut', 'polarArea'
    data: {
        // ... same data ...
    },
    options: {
        // ... adjusted options for chart type ...
    }
});
```

### Add Additional Charts

In `index.html`, add new canvas:

```html
<div class="chart-container">
    <canvas id="comparisonChart"></canvas>
</div>
```

In `app.js`, create chart:

```javascript
function displayComparisonChart(scores) {
    const ctx = document.getElementById('comparisonChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Pre-Checks', 'Operation', 'Rollback'],
            datasets: [
                {
                    label: 'Current MOP',
                    data: [scores.preChecks.score, scores.operationSteps.score, scores.rollbackSteps.score],
                    borderColor: '#2563eb'
                },
                {
                    label: 'Target',
                    data: [8, 8, 8],
                    borderColor: '#10b981',
                    borderDash: [5, 5]
                }
            ]
        }
    });
}
```

---

## ?? API Configuration

### Use Different Search API

Replace Tavily with your preferred API in `fetchBestPractices`:

```javascript
async function fetchBestPractices(category, apiKey) {
    const categoryInfo = categoryKeywords[category];
    
    // Example: Using Google Custom Search
    const response = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=YOUR_CX&q=${query}`
    );
    
    // Or using internal knowledge base
    const response = await fetch(
        `https://your-kb.company.com/api/search?q=${query}`,
        {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        }
    );
    
    // Transform response to match expected format
    const data = await response.json();
    return transformToExpectedFormat(data);
}
```

---

## ?? Custom Recommendations

### Add Organization-Specific Recommendations

In `generateRecommendations` function:

```javascript
// Add at the end of the function
recommendations.push({
    section: 'Compliance',
    priority: 'high',
    title: 'Ensure SOX Compliance',
    description: 'All MOPs must include SOX compliance checkpoints.',
    action: 'Add SOX compliance verification steps to pre-checks and validation.'
});

if (!allContent.includes('change advisory board')) {
    recommendations.push({
        section: 'Governance',
        priority: 'medium',
        title: 'CAB Approval Required',
        description: 'No mention of Change Advisory Board approval found.',
        action: 'Add CAB approval reference in pre-checks section.'
    });
}
```

---

## ?? Custom Export Formats

### Export as PDF

Add PDF export library:

```html
<!-- Add to index.html -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
```

Update `handleExport` function:

```javascript
function handleExport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text('MOP Analysis Report', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Overall Score: ${currentAnalysis.scores.overall}`, 20, 40);
    doc.text(`Risk Level: ${currentAnalysis.scores.riskLevel}`, 20, 50);
    
    // Add more content...
    
    doc.save('MOP_Analysis_Report.pdf');
}
```

### Export as CSV

```javascript
function exportAsCSV() {
    const { scores, recommendations } = currentAnalysis;
    
    let csv = 'Section,Score,Status\n';
    csv += `Pre-Checks,${scores.preChecks.score},${scores.preChecks.score >= 7 ? 'Pass' : 'Needs Work'}\n`;
    csv += `Operation Steps,${scores.operationSteps.score},${scores.operationSteps.score >= 7 ? 'Pass' : 'Needs Work'}\n`;
    csv += `Rollback Steps,${scores.rollbackSteps.score},${scores.rollbackSteps.score >= 7 ? 'Pass' : 'Needs Work'}\n`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'MOP_Analysis.csv';
    link.click();
}
```

---

## ?? Internationalization

### Add Multi-Language Support

Create language files:

```javascript
// languages.js
const translations = {
    en: {
        title: 'ITIL 4 Change Enablement MOP Analyzer',
        selectCategory: 'Select Telco Category',
        uploadMop: 'Upload MOP Document',
        analyze: 'Analyze MOP Document'
    },
    es: {
        title: 'Analizador MOP de Habilitaci?n de Cambios ITIL 4',
        selectCategory: 'Seleccionar Categor?a Telco',
        uploadMop: 'Cargar Documento MOP',
        analyze: 'Analizar Documento MOP'
    }
};

function setLanguage(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = translations[lang][key];
    });
}
```

Update HTML:

```html
<h1 data-i18n="title">ITIL 4 Change Enablement MOP Analyzer</h1>

<select id="language" onchange="setLanguage(this.value)">
    <option value="en">English</option>
    <option value="es">Espa?ol</option>
</select>
```

---

## ?? Authentication Integration

### Add SSO/OAuth

```javascript
// Add to app.js
async function authenticateUser() {
    // Example: OAuth 2.0
    const authUrl = 'https://your-auth-provider.com/oauth/authorize';
    const params = new URLSearchParams({
        client_id: 'your-client-id',
        redirect_uri: window.location.origin,
        response_type: 'token',
        scope: 'openid profile'
    });
    
    window.location.href = `${authUrl}?${params}`;
}

// Check authentication on page load
if (!localStorage.getItem('auth_token')) {
    authenticateUser();
}
```

---

## ?? Analytics Integration

### Add Google Analytics

```html
<!-- Add to index.html head -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>
```

Track events in `app.js`:

```javascript
function trackAnalysis(category, score) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'mop_analysis', {
            'category': category,
            'score': score,
            'risk_level': getRiskLevel(score)
        });
    }
}
```

---

## ?? UI Customization Examples

### Dark Mode Toggle

Add to `styles.css`:

```css
body.dark-mode {
    --light-bg: #1e293b;
    --card-bg: #334155;
    --text-primary: #f1f5f9;
    --text-secondary: #cbd5e1;
}
```

Add toggle button:

```javascript
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

// Load preference
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
}
```

---

## ?? Plugin System

Create extensibility:

```javascript
// plugin-system.js
const plugins = [];

function registerPlugin(plugin) {
    plugins.push(plugin);
}

function runPlugins(hookName, data) {
    plugins.forEach(plugin => {
        if (plugin[hookName]) {
            plugin[hookName](data);
        }
    });
}

// Use in analysis
function handleAnalyze() {
    // ... existing code ...
    
    runPlugins('beforeAnalysis', { file, category });
    
    // ... analysis ...
    
    runPlugins('afterAnalysis', currentAnalysis);
}

// Example plugin
registerPlugin({
    name: 'CustomValidator',
    afterAnalysis: (analysis) => {
        console.log('Custom validation running...', analysis);
        // Add custom logic
    }
});
```

---

## ?? Database Integration

### Save Analysis History

```javascript
async function saveAnalysis(analysis) {
    await fetch('https://your-api.com/analyses', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
            category: analysis.category,
            scores: analysis.scores,
            timestamp: new Date().toISOString(),
            user: getCurrentUser()
        })
    });
}

async function loadHistory() {
    const response = await fetch('https://your-api.com/analyses');
    const history = await response.json();
    displayHistory(history);
}
```

---

## ?? Tips for Customization

1. **Test Thoroughly**: Test all changes with various MOP documents
2. **Backup First**: Keep original files before modifying
3. **Use Version Control**: Track changes with git
4. **Document Changes**: Keep notes on customizations
5. **Performance**: Monitor load times with custom changes
6. **Mobile Testing**: Verify UI changes work on mobile
7. **Browser Compatibility**: Test in multiple browsers

---

## ?? Getting Help

For customization assistance:
1. Review the source code comments
2. Check browser console for errors
3. Test with the sample MOP first
4. Start with small changes
5. Contact your development team

---

**Remember**: Always test customizations with the sample MOP before using with real documents!
