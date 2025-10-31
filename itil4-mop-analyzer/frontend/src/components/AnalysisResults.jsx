import React from 'react';
import axios from 'axios';

const AnalysisResults = ({ result, onNewAnalysis }) => {
  const getRiskLevelColor = (level) => {
    const colors = {
      'LOW': 'bg-green-100 text-green-800 border-green-300',
      'MEDIUM': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'HIGH': 'bg-orange-100 text-orange-800 border-orange-300',
      'CRITICAL': 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[level] || colors['MEDIUM'];
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Adequate';
    if (score >= 40) return 'Poor';
    return 'Inadequate';
  };

  const CircularProgress = ({ score }) => {
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg className="transform -rotate-90" width="180" height="180">
          <circle
            cx="90"
            cy="90"
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="12"
            fill="none"
          />
          <circle
            cx="90"
            cy="90"
            r={radius}
            stroke={score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'}
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute">
          <div className="text-center">
            <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
              {score.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">out of 100</div>
          </div>
        </div>
      </div>
    );
  };

  const SectionScore = ({ title, score }) => (
    <div className="bg-gray-50 rounded-lg p-6">
      <h4 className="text-sm font-semibold text-gray-600 mb-2">{title}</h4>
      <div className="flex items-end justify-between">
        <div>
          <div className={`text-3xl font-bold ${getScoreColor(score.score)}`}>
            {score.score.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {getScoreLabel(score.score)}
          </div>
        </div>
        <div className="h-16 w-16">
          <svg className="transform rotate-180" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="3"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={score.score >= 70 ? '#10b981' : score.score >= 50 ? '#f59e0b' : '#ef4444'}
              strokeWidth="3"
              strokeDasharray={`${score.score}, 100`}
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
      
      {score.strengths && score.strengths.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-green-700 mb-1">? Strengths:</p>
          <ul className="text-xs text-gray-600 space-y-1">
            {score.strengths.slice(0, 2).map((strength, idx) => (
              <li key={idx} className="flex items-start">
                <span className="text-green-500 mr-1">?</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {score.weaknesses && score.weaknesses.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-semibold text-orange-700 mb-1">? Areas for Improvement:</p>
          <ul className="text-xs text-gray-600 space-y-1">
            {score.weaknesses.slice(0, 2).map((weakness, idx) => (
              <li key={idx} className="flex items-start">
                <span className="text-orange-500 mr-1">?</span>
                <span>{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const handleDownloadReport = async () => {
    try {
      const response = await axios.get(
        `/api/analysis/${result.analysis_id}/report`,
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `MOP_Analysis_${result.analysis_id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="card">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Analysis Complete
            </h2>
            <p className="text-gray-600">
              {result.filename} ? {result.category}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleDownloadReport}
              className="btn-secondary flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Report
            </button>
            <button
              onClick={onNewAnalysis}
              className="btn-primary"
            >
              New Analysis
            </button>
          </div>
        </div>

        {/* Overall Score */}
        <div className="flex items-center justify-center space-x-12 py-8">
          <div>
            <CircularProgress score={result.overall_score} />
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Overall Assessment</h3>
              <div className={`inline-flex items-center px-4 py-2 rounded-full border-2 ${getRiskLevelColor(result.risk_level)}`}>
                <span className="font-bold text-sm">Risk Level: {result.risk_level}</span>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p>Analysis ID: <span className="font-mono text-xs">{result.analysis_id}</span></p>
              <p>Timestamp: {new Date(result.timestamp).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section Scores */}
      <div className="card">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Section Scores</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SectionScore title="Pre-Checks" score={result.pre_checks_score} />
          <SectionScore title="Operation Steps" score={result.operation_steps_score} />
          <SectionScore title="Rollback Steps" score={result.rollback_steps_score} />
        </div>
      </div>

      {/* Recommendations */}
      {result.recommendations && result.recommendations.length > 0 && (
        <div className="card">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Recommendations
          </h3>
          <div className="space-y-3">
            {result.recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-500 text-white font-bold text-sm">
                    {idx + 1}
                  </div>
                </div>
                <p className="ml-4 text-gray-700">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Best Practices */}
      {result.best_practices && result.best_practices.length > 0 && (
        <div className="card">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Industry Best Practices
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.best_practices.map((practice, idx) => (
              <div key={idx} className="flex items-start bg-green-50 p-4 rounded-lg">
                <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-gray-700">{practice}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Findings */}
      <div className="card">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Detailed Findings</h3>
        
        <div className="space-y-6">
          {/* Pre-Checks Findings */}
          <div>
            <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">1</span>
              Pre-Checks Section
            </h4>
            {result.pre_checks_score.findings && result.pre_checks_score.findings.length > 0 && (
              <ul className="space-y-2 ml-8">
                {result.pre_checks_score.findings.map((finding, idx) => (
                  <li key={idx} className="text-gray-600 text-sm flex items-start">
                    <span className="text-blue-500 mr-2">?</span>
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Operation Steps Findings */}
          <div>
            <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">2</span>
              Operation Steps Section
            </h4>
            {result.operation_steps_score.findings && result.operation_steps_score.findings.length > 0 && (
              <ul className="space-y-2 ml-8">
                {result.operation_steps_score.findings.map((finding, idx) => (
                  <li key={idx} className="text-gray-600 text-sm flex items-start">
                    <span className="text-blue-500 mr-2">?</span>
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Rollback Steps Findings */}
          <div>
            <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">3</span>
              Rollback Steps Section
            </h4>
            {result.rollback_steps_score.findings && result.rollback_steps_score.findings.length > 0 && (
              <ul className="space-y-2 ml-8">
                {result.rollback_steps_score.findings.map((finding, idx) => (
                  <li key={idx} className="text-gray-600 text-sm flex items-start">
                    <span className="text-blue-500 mr-2">?</span>
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;
