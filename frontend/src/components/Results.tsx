import { AnalysisResult, SectionScore } from '../types'

interface ResultsProps {
  result: AnalysisResult
}

function Results({ result }: ResultsProps) {
  const getScoreBadge = (score: number) => {
    if (score >= 8) return 'badge-success'
    if (score >= 6) return 'badge-warning'
    return 'badge-danger'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Excellent'
    if (score >= 6) return 'Good'
    if (score >= 4) return 'Fair'
    return 'Needs Improvement'
  }

  const renderSectionScore = (title: string, score: SectionScore) => (
    <div className="section-score">
      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{title}</h3>
        <div className="breakdown">
          <span>Presence: {score.breakdown.presence.toFixed(1)}</span>
          <span>Clarity: {score.breakdown.clarity.toFixed(1)}</span>
          <span>Verifiability: {score.breakdown.verifiability.toFixed(1)}</span>
          <span>Safety: {score.breakdown.safety.toFixed(1)}</span>
          <span>Compliance: {score.breakdown.compliance.toFixed(1)}</span>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{score.score.toFixed(1)}</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>/ 10</div>
      </div>
    </div>
  )

  return (
    <>
      <div className="score-card">
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Total Quality Score</h2>
        <div className="score-value">{result.totalScore.toFixed(1)}</div>
        <div style={{ fontSize: '1.2rem' }}>{getScoreLabel(result.totalScore)}</div>
        <div style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.9 }}>
          Confidence: {(result.confidence * 100).toFixed(0)}% | 
          Processing: {result.metadata.processingTimeMs}ms
          {result.metadata.tavilyUsed && ' | ✓ Industry data used'}
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Section Scores</h2>
        {renderSectionScore('Pre-Checks', result.scores.preChecks)}
        {renderSectionScore('Operation Steps', result.scores.operationSteps)}
        {renderSectionScore('Rollback Steps', result.scores.rollbackSteps)}
      </div>

      {result.recommendations.length > 0 && (
        <div className="card">
          <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>
            Recommendations ({result.recommendations.length})
          </h2>
          <ul className="recommendation-list">
            {result.recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {result.evidence.length > 0 && (
        <div className="card">
          <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>
            Industry Best Practice Evidence
          </h2>
          <p style={{ color: 'var(--text-light)', marginBottom: '1rem' }}>
            The following sources were used to evaluate category-specific compliance:
          </p>
          <ul className="evidence-list">
            {result.evidence.slice(0, 5).map((ev, idx) => (
              <li key={idx} className="evidence-item">
                <div className="evidence-title">
                  {ev.usedInScoring && <span style={{ color: 'var(--success)' }}>✓ </span>}
                  {ev.title}
                </div>
                <a href={ev.link} target="_blank" rel="noopener noreferrer" className="evidence-link">
                  {ev.link}
                </a>
                <div className="evidence-snippet">{ev.snippet}</div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                  Relevance: {(ev.relevance * 100).toFixed(0)}%
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card">
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Detailed Check Results</h2>
        
        <details style={{ marginBottom: '1rem' }}>
          <summary style={{ cursor: 'pointer', fontWeight: '600', padding: '0.5rem', background: 'var(--bg)', borderRadius: '4px' }}>
            Pre-Checks ({result.scores.preChecks.checks.filter(c => c.passed).length}/{result.scores.preChecks.checks.length} passed)
          </summary>
          <div style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
            {result.scores.preChecks.checks.map((check, idx) => (
              <div key={idx} style={{ padding: '0.5rem', marginBottom: '0.25rem', background: check.passed ? '#f0fdf4' : '#fef2f2', borderRadius: '4px' }}>
                <span style={{ color: check.passed ? 'var(--success)' : 'var(--danger)' }}>
                  {check.passed ? '✓' : '✗'} {check.name}
                </span>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                  {check.message} (Weight: {check.weight})
                </div>
              </div>
            ))}
          </div>
        </details>

        <details style={{ marginBottom: '1rem' }}>
          <summary style={{ cursor: 'pointer', fontWeight: '600', padding: '0.5rem', background: 'var(--bg)', borderRadius: '4px' }}>
            Operation Steps ({result.scores.operationSteps.checks.filter(c => c.passed).length}/{result.scores.operationSteps.checks.length} passed)
          </summary>
          <div style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
            {result.scores.operationSteps.checks.map((check, idx) => (
              <div key={idx} style={{ padding: '0.5rem', marginBottom: '0.25rem', background: check.passed ? '#f0fdf4' : '#fef2f2', borderRadius: '4px' }}>
                <span style={{ color: check.passed ? 'var(--success)' : 'var(--danger)' }}>
                  {check.passed ? '✓' : '✗'} {check.name}
                </span>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                  {check.message} (Weight: {check.weight})
                </div>
              </div>
            ))}
          </div>
        </details>

        <details>
          <summary style={{ cursor: 'pointer', fontWeight: '600', padding: '0.5rem', background: 'var(--bg)', borderRadius: '4px' }}>
            Rollback Steps ({result.scores.rollbackSteps.checks.filter(c => c.passed).length}/{result.scores.rollbackSteps.checks.length} passed)
          </summary>
          <div style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
            {result.scores.rollbackSteps.checks.map((check, idx) => (
              <div key={idx} style={{ padding: '0.5rem', marginBottom: '0.25rem', background: check.passed ? '#f0fdf4' : '#fef2f2', borderRadius: '4px' }}>
                <span style={{ color: check.passed ? 'var(--success)' : 'var(--danger)' }}>
                  {check.passed ? '✓' : '✗'} {check.name}
                </span>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                  {check.message} (Weight: {check.weight})
                </div>
              </div>
            ))}
          </div>
        </details>
      </div>
    </>
  )
}

export default Results
