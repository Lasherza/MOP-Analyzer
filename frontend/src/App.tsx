import { useState } from 'react'
import axios from 'axios'
import { TelcoCategory, AnalysisResult } from './types'
import Results from './components/Results'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const API_KEY = import.meta.env.VITE_API_KEY || ''

function App() {
  const [category, setCategory] = useState<TelcoCategory | ''>('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.docx')) {
        setError('Please select a DOCX file')
        return
      }
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleAnalyze = async () => {
    if (!category || !file) {
      setError('Please select a category and upload a file')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('mop', file)
      formData.append('category', category)

      const response = await axios.post<AnalysisResult>(`${API_URL}/api/analyze`, formData, {
        headers: {
          'X-API-KEY': API_KEY,
        },
      })

      setResult(response.data)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Analysis failed'
      setError(errorMessage)
      console.error('Analysis error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadJSON = () => {
    if (!result) return
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mop-analysis-result.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDownloadPDF = async () => {
    if (!category || !file) return

    try {
      const formData = new FormData()
      formData.append('mop', file)
      formData.append('category', category)

      const response = await axios.post(`${API_URL}/api/analyze/pdf`, formData, {
        headers: {
          'X-API-KEY': API_KEY,
        },
        responseType: 'blob',
      })

      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'mop-analysis-report.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err: any) {
      setError('Failed to generate PDF report')
      console.error('PDF generation error:', err)
    }
  }

  return (
    <div className="container">
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
          Telco MOP Analysis Agent
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-light)', marginTop: '0.5rem' }}>
          Analyze Method of Procedure documents for ITIL4 Change Enablement best practices
        </p>
      </header>

      <div className="card">
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Upload MOP Document</h2>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="category" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
            Select Telco Category *
          </label>
          <select
            id="category"
            className="select"
            value={category}
            onChange={(e) => setCategory(e.target.value as TelcoCategory)}
          >
            <option value="">-- Select a category --</option>
            {Object.values(TelcoCategory).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
            Upload DOCX File *
          </label>
          <input
            type="file"
            id="file-upload"
            className="file-input"
            accept=".docx"
            onChange={handleFileChange}
          />
          <label htmlFor="file-upload" className="file-label" style={{ width: '100%' }}>
            {file ? (
              <div>
                <strong>✓ {file.name}</strong>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                  {(file.size / 1024).toFixed(2)} KB
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</div>
                <div>Click to select DOCX file or drag and drop</div>
              </div>
            )}
          </label>
        </div>

        {error && (
          <div className="alert alert-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        <button
          className="btn btn-primary"
          onClick={handleAnalyze}
          disabled={!category || !file || loading}
          style={{ width: '100%' }}
        >
          {loading ? (
            <>
              <div className="spinner" style={{ width: '20px', height: '20px', margin: '0' }}></div>
              Analyzing...
            </>
          ) : (
            '🔍 Analyze MOP'
          )}
        </button>
      </div>

      {loading && (
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-light)' }}>
            Parsing document and analyzing against ITIL4 best practices...
          </p>
        </div>
      )}

      {result && (
        <>
          <Results result={result} />
          
          <div className="card">
            <h2 style={{ marginBottom: '1rem' }}>Export Reports</h2>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={handleDownloadJSON}>
                📥 Download JSON
              </button>
              <button className="btn btn-secondary" onClick={handleDownloadPDF}>
                📄 Download PDF Report
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default App
