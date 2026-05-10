import { useState, useEffect } from 'react'

const API = import.meta.env.VITE_API_URL || ''

export function ArticleReaderModal({ url, title, onClose }) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!url) return
    
    let active = true
    setLoading(true)
    setError(null)
    setContent('')

    fetch(`${API}/api/v1/read-article?url=${encodeURIComponent(url)}`)
      .then(r => {
        if (!r.ok) throw new Error(`Reader failure: ${r.status}`)
        return r.json()
      })
      .then(data => {
        if (!active) return
        setContent(data.content)
        setLoading(false)
      })
      .catch(err => {
        if (!active) return
        console.error("Read failed", err)
        setError("We couldn't extract the content from this article automatically.")
        setLoading(false)
      })

    return () => { active = false }
  }, [url])

  if (!url) return null

  return (
    <div className="reader-overlay">
      <div className="reader-container" style={{animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'}}>
        <header className="reader-header">
          <button className="reader-back-btn" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span>BACK TO TRACKER</span>
          </button>
          
          <div className="reader-meta-actions">
            <a href={url} target="_blank" rel="noopener noreferrer" className="reader-ext-link" title="Open Original">
              Open Original ↗
            </a>
          </div>
        </header>

        <main className="reader-content-viewport">
          {loading ? (
            <div className="reader-loading-state">
              <div className="spinner" />
              <p>EXTRACTING CLEAN VIEW...</p>
              <span className="loading-sub">Bypassing clutter and trackers</span>
            </div>
          ) : error ? (
            <div className="reader-error-state">
              <div className="error-icon">⚠️</div>
              <h3>Extraction Blocked</h3>
              <p>{error}</p>
              <a href={url} target="_blank" rel="noopener noreferrer" className="error-btn-primary">
                View Original Source Website
              </a>
            </div>
          ) : (
            <article className="reader-article">
              {title && <h1 className="reader-title">{title}</h1>}
              <div className="reader-body">
                {content.split('\n').map((line, i) => {
                   const trimmed = line.trim()
                   if (!trimmed) return <br key={i} />
                   return <p key={i}>{trimmed}</p>
                })}
              </div>
              <footer className="reader-article-footer">
                 <p>Extracted from: {new URL(url).hostname}</p>
                 <p className="footer-note">Converted to reader mode by Hantamap Intelligent Parser.</p>
              </footer>
            </article>
          )}
        </main>
      </div>
    </div>
  )
}
