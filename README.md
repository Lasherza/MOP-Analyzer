# ?? ITIL 4 Change Enablement MOP Analyzer

A web-based application for analyzing Method of Procedure (MOP) documents based on ITIL 4 Change Enablement best practices for Telecommunications operations.

## ?? Features

- **Category-Specific Analysis**: Supports 9 different Telco categories
  - IPCORE
  - Packet Core
  - Billing and Revenue Management
  - Radio Network
  - Transmission Network
  - DevOps and Systems (OSS and BSS)
  - IT
  - Cyber Security
  - Data Engineering

- **Comprehensive Scoring**: Evaluates three critical sections
  - Pre-Checks (0-10)
  - Operation Steps (0-10)
  - Rollback Steps (0-10)

- **Industry Best Practices Integration**: Uses Tavily Search API to fetch real-time industry standards

- **Visual Analytics**: Interactive charts and visual representations of scores

- **Actionable Recommendations**: Priority-based recommendations to improve MOP quality

- **Export Functionality**: Download analysis reports in JSON format

## ?? Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A Tavily API key (free tier available)

### Installation

1. Clone or download this repository to your local machine

2. No build process required! Simply open `index.html` in your web browser:
   ```bash
   # Option 1: Open directly
   open index.html
   
   # Option 2: Use a local server (recommended)
   python -m http.server 8000
   # Then navigate to http://localhost:8000
   ```

### Getting a Tavily API Key

1. Visit [Tavily.com](https://tavily.com)
2. Sign up for a free account
3. Navigate to your dashboard
4. Copy your API key (starts with `tvly-`)
5. Paste it into the application when prompted

**Note**: The API key is stored locally in your browser and only sent to Tavily's servers for search requests.

## ?? How to Use

### Step 1: Select Category
Choose the appropriate Telco category that matches your MOP document from the dropdown menu.

### Step 2: Upload MOP Document
Click the upload area and select your MOP document. Supported formats:
- `.txt` - Plain text files
- `.doc` / `.docx` - Microsoft Word documents (will be read as text)
- `.pdf` - PDF documents (will be read as text)

**Best practices for MOP documents**:
- Use clear section headers: "Pre-Checks", "Operation Steps", "Rollback Steps"
- Number your steps sequentially
- Include validation checkpoints
- Document expected outcomes

### Step 3: Enter API Key
Enter your Tavily API key in the designated field. This will be saved for future sessions.

### Step 4: Analyze
Click the "Analyze MOP Document" button and wait for the analysis to complete.

### Step 5: Review Results
The application will display:
- **Overall Score**: Aggregate score out of 10
- **Risk Level**: Low, Medium, or High
- **Section Scores**: Individual scores for each section
- **Recommendations**: Prioritized suggestions for improvement
- **Best Practices**: Industry standards relevant to your category

### Step 6: Export (Optional)
Download the analysis report as a JSON file for record-keeping or sharing.

## ?? Scoring Methodology

### ITIL 4 Change Enablement Criteria

#### Pre-Checks (10 criteria)
- Impact assessment documented
- Risk analysis completed
- Dependencies identified
- Backout plan confirmed
- Resource availability verified
- Stakeholder approval obtained
- Service impact communicated
- Testing environment validated
- Change window scheduled
- Backup verification completed

#### Operation Steps (10 criteria)
- Steps are numbered sequentially
- Each step has clear success criteria
- Expected outcomes defined
- Commands/scripts provided
- Validation points included
- Time estimates provided
- Dependencies between steps noted
- Security considerations addressed
- Communication points defined
- Monitoring checkpoints included

#### Rollback Steps (10 criteria)
- Rollback procedure documented
- Rollback triggers defined
- Step-by-step rollback instructions
- Rollback validation criteria
- Time estimates for rollback
- Data restoration procedure
- Service restoration order
- Communication plan for rollback
- Lessons learned process
- Post-rollback verification

### Scoring Algorithm

1. **Base Score**: Number of matched criteria / Total criteria ? 10
2. **Quality Bonus** (up to 0.8 points):
   - Numbered steps: +0.3
   - Validation keywords: +0.3
   - Time estimates: +0.2
3. **Final Score**: Base Score + Quality Bonus (capped at 10)

### Risk Level Calculation
- **Low Risk**: Overall score ? 8.0
- **Medium Risk**: Overall score 6.0 - 7.9
- **High Risk**: Overall score < 6.0

## ??? Architecture

### Frontend
- **HTML5**: Semantic markup and structure
- **CSS3**: Modern, responsive design with gradients and animations
- **Vanilla JavaScript**: No framework dependencies for maximum compatibility

### External Dependencies
- **Chart.js** (v4.4.0): For data visualization
- **Tavily Search API**: For fetching industry best practices

### File Structure
```
.
??? index.html          # Main HTML file
??? styles.css          # Stylesheet
??? app.js              # Application logic
??? README.md           # This file
```

## ?? Security Considerations

- **API Key Storage**: Stored in browser's localStorage (client-side only)
- **No Server**: All processing happens in the browser
- **Data Privacy**: MOP content is never uploaded to any server except Tavily for best practices search
- **No Persistence**: Analysis results are not stored permanently

## ?? Customization

### Adding New Categories

Edit the `categoryKeywords` object in `app.js`:

```javascript
const categoryKeywords = {
    'your-category': {
        name: 'Your Category Name',
        keywords: ['keyword1', 'keyword2'],
        criticalAreas: ['area1', 'area2']
    }
};
```

Then add the option to the HTML select element.

### Adjusting Scoring Criteria

Modify the `itilCriteria` object in `app.js` to add or remove criteria for each section.

### Customizing UI Colors

Edit CSS variables in `styles.css`:

```css
:root {
    --primary-color: #2563eb;
    --secondary-color: #7c3aed;
    /* ... other colors ... */
}
```

## ?? Testing

### Sample MOP Format

Create a test MOP document with this structure:

```
Method of Procedure: [Title]

Pre-Checks:
1. Verify system backup completed
2. Confirm impact assessment approved
3. Check resource availability
[... more pre-checks ...]

Operation Steps:
1. Login to system
   Expected outcome: Successful authentication
   Validation: Check session ID
2. Execute configuration change
   Expected outcome: Configuration updated
   Validation: Verify config file
[... more operation steps ...]

Rollback Steps:
1. If operation fails, restore configuration
2. Verify rollback successful
3. Notify stakeholders
[... more rollback steps ...]
```

### Test Cases

1. **Complete MOP**: All three sections present with detailed content
   - Expected: High scores (8-10) across all sections

2. **Missing Rollback**: No rollback section
   - Expected: High-priority recommendation to add rollback

3. **Minimal Content**: Very brief sections
   - Expected: Low scores (0-4) with multiple recommendations

4. **Category-Specific**: Include category keywords
   - Expected: Better alignment with best practices

## ?? Troubleshooting

### Issue: "Failed to read file"
**Solution**: Ensure the file is a valid text-based format. PDFs with images only cannot be parsed.

### Issue: "Tavily API error"
**Solution**: 
- Verify your API key is correct
- Check you haven't exceeded your API quota
- Ensure you have internet connectivity

### Issue: Low scores despite good MOP
**Solution**: 
- Use clear section headers that match expected patterns
- Include validation and verification keywords
- Number steps sequentially
- Add time estimates

### Issue: No sections extracted
**Solution**: 
- Rename section headers to standard format:
  - "Pre-Checks" or "Prerequisites"
  - "Operation Steps" or "Procedure"
  - "Rollback Steps" or "Backout Procedure"

## ?? Interpreting Results

### Overall Score Guide

- **9.0 - 10.0**: Excellent - MOP follows ITIL 4 best practices comprehensively
- **8.0 - 8.9**: Very Good - Minor improvements needed
- **7.0 - 7.9**: Good - Some enhancements recommended
- **6.0 - 6.9**: Acceptable - Multiple improvements needed
- **5.0 - 5.9**: Needs Improvement - Significant gaps identified
- **Below 5.0**: Poor - Major revisions required

### Recommendation Priorities

- **High Priority**: Critical items that significantly impact change safety
- **Medium Priority**: Important improvements for better quality
- **Low Priority**: Optional enhancements for best practice alignment

## ?? Contributing

This is a standalone application designed for internal use. If you'd like to enhance it:

1. Fork the repository
2. Make your changes
3. Test thoroughly
4. Submit a pull request with detailed description

## ?? License

This application is provided as-is for use within telecommunications operations teams.

## ?? Support

For issues or questions:
1. Check the Troubleshooting section
2. Review the sample MOP format
3. Verify your API key is valid
4. Contact your DevOps team

## ?? Version History

### Version 1.0.0 (2025-10-31)
- Initial release
- Support for 9 Telco categories
- ITIL 4 Change Enablement criteria
- Tavily API integration
- Visual analytics with Chart.js
- Export functionality

## ?? Roadmap

Future enhancements may include:
- Support for PDF parsing with complex layouts
- Additional category-specific criteria
- Historical analysis tracking
- Multi-language support
- Integration with ITSM tools
- AI-powered recommendation engine

## ? Performance

- **Analysis Time**: Typically 5-15 seconds
- **File Size Limit**: Recommended < 5MB
- **Browser Compatibility**: Modern browsers (last 2 versions)
- **Offline Capability**: Partial (excluding API searches)

## ?? References

- [ITIL 4 Change Enablement](https://www.axelos.com/certifications/itil-service-management/itil-4-foundation)
- [Tavily API Documentation](https://docs.tavily.com)
- [Chart.js Documentation](https://www.chartjs.org/docs/)

---

**Built with ?? for Telco Operations Teams**

*Ensuring safer, more reliable network changes through ITIL 4 best practices*
