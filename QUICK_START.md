# ?? Quick Start Guide

Get started with the ITIL 4 MOP Analyzer in 5 minutes!

## Step 1: Open the Application

Simply open `index.html` in your web browser:

```bash
# Option 1: Direct open
open index.html

# Option 2: Using Python (recommended)
python3 -m http.server 8000
# Then visit: http://localhost:8000

# Option 3: Using Node.js
npx http-server
```

## Step 2: Get Your Tavily API Key

1. Visit https://tavily.com
2. Sign up (it's free!)
3. Get your API key from the dashboard
4. It looks like: `tvly-xxxxxxxxxxxxxxxxx`

## Step 3: Try the Sample MOP

We've included a sample MOP document (`sample_mop.txt`) for testing:

1. Select **"IPCORE"** from the category dropdown
2. Click the upload area and select `sample_mop.txt`
3. Enter your Tavily API key
4. Click **"Analyze MOP Document"**
5. Wait ~10 seconds for results

## Step 4: Understand Your Results

You'll see:
- **Overall Score**: Should be ~8.5-9.5 for the sample (it's well-structured!)
- **Risk Level**: Likely "Low Risk"
- **Section Scores**: Individual ratings for each section
- **Recommendations**: Any improvements (even good MOPs can improve!)
- **Best Practices**: Industry insights from Tavily

## Step 5: Try Your Own MOP

Create a text file with this structure:

```
Pre-Checks:
1. Your pre-check item
2. Another pre-check
...

Operation Steps:
1. First step
   Expected outcome: What should happen
   Validation: How to verify
2. Second step
...

Rollback Steps:
1. Rollback step 1
2. Rollback step 2
...
```

## ?? Tips for High Scores

### Pre-Checks (aim for 8+)
? Include impact assessment  
? Document risk analysis  
? List all dependencies  
? Confirm backout plan  
? Verify resource availability  

### Operation Steps (aim for 8+)
? Number steps sequentially  
? Add success criteria for each step  
? Include validation commands  
? Provide time estimates  
? Document expected outcomes  

### Rollback Steps (aim for 8+)
? Write detailed rollback procedure  
? Define rollback triggers  
? Include validation criteria  
? Add time estimates  
? Document data restoration  

## ?? Troubleshooting

### "No sections extracted"
**Fix**: Use clear headers like "Pre-Checks", "Operation Steps", "Rollback Steps"

### "Low scores"
**Fix**: 
- Add more detail to each section
- Include the ITIL criteria (see README.md)
- Add validation points and time estimates

### "API Error"
**Fix**: 
- Check your API key is correct
- Ensure you have internet connection
- Verify you haven't exceeded API limits

## ?? Using on Mobile

The application is fully responsive! 
- Works on tablets and phones
- Touch-friendly interface
- All features available

## ?? Learning More

- Full documentation: See `README.md`
- ITIL 4 criteria: Listed in README
- Sample MOP: Review `sample_mop.txt` for structure

## ?? Pro Tips

1. **Save your API key**: It's stored locally, no need to re-enter
2. **Export reports**: Use the export button to save analysis
3. **Category matters**: Choose the right category for accurate scoring
4. **Iterate**: Run analysis multiple times as you improve your MOP

## ?? Success!

You should now see a comprehensive analysis of your MOP with:
- Visual charts
- Detailed scores
- Actionable recommendations
- Industry best practices

Happy analyzing! ??
