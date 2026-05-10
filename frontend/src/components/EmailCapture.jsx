import { useState } from 'react'

export function EmailCapture() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email) {
      setError('Please enter your email')
      return
    }
    
    setIsPending(true)
    setError(null)
    
    // Simulate API call
    setTimeout(() => {
      setIsPending(false)
      if (email.includes('@')) {
        setSubmitted(true)
        setEmail('')
      } else {
        setError('Please enter a valid email address')
      }
    }, 1000)
  }

  return (
    <section style={{
      padding: '60px 20px',
      background: 'linear-gradient(to bottom, var(--bg) 0%, var(--bg2) 100%)',
      borderTop: '1px solid var(--border)'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{
          background: 'var(--bg)',
          borderRadius: '16px',
          padding: '40px',
          border: '1px solid var(--border)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          textAlign: 'center'
        }}>
          
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '12px', color: 'var(--text)' }}>
              Stay Updated on Outbreak Progression
            </h2>
            <p style={{ color: 'var(--text3)', fontSize: '15px', lineHeight: '1.6', maxWidth: '500px', margin: '0 auto' }}>
              Receive intelligence summaries and verified updates directly in your inbox when high-impact situational shifts occur.
            </p>
          </div>

          {submitted ? (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
              padding: '16px', background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px',
              color: '#059669', fontWeight: '600', maxWidth: '400px', margin: '0 auto'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              You're on the list! Check your inbox shortly.
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: '0 auto' }}>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 200px', position: 'relative' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}>
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError(null)
                    }}
                    disabled={isPending}
                    style={{
                      width: '100%',
                      padding: '14px 16px 14px 44px',
                      borderRadius: '12px',
                      border: '1px solid var(--border)',
                      background: 'var(--bg)',
                      color: 'var(--text)',
                      fontSize: '15px',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--text2)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isPending}
                  style={{
                    background: 'var(--text)',
                    color: 'var(--bg)',
                    border: 'none',
                    padding: '0 24px',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '700',
                    cursor: isPending ? 'not-allowed' : 'pointer',
                    opacity: isPending ? 0.7 : 1,
                    transition: 'opacity 0.2s'
                  }}
                  className="hover-bright"
                >
                  {isPending ? "Subscribing..." : "Subscribe"}
                </button>
              </div>

              {error && (
                <div style={{ marginTop: '12px', color: '#ef4444', fontSize: '14px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  {error}
                </div>
              )}
              
              <p style={{ marginTop: '16px', fontSize: '12px', color: 'var(--text3)', textAlign: 'center' }}>
                We respect your privacy. Unsubscribe at any time.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
