import { useState } from 'react'
const API = import.meta.env.VITE_API_URL || ''

export function AlertSignup() {
  const [email,  setEmail]  = useState('')
  const [status, setStatus] = useState('idle')
  const [err,    setErr]    = useState('')

  async function submit(e) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading'); setErr('')
    try {
      const r = await fetch(`${API}/api/v1/alert-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      if (r.ok) { setStatus('success'); return }
      const d = await r.json().catch(() => ({}))
      setStatus('error')
      setErr(r.status === 409
        ? 'That email is already registered.'
        : d.detail ?? 'Something went wrong. Try again.')
    } catch {
      setStatus('error')
      setErr('Network error. Please try again.')
    }
  }

  return (
    <section className="signup" aria-labelledby="signup-hd">
      <div className="wrap">
        <div className="signup-grid">
          <div className="signup-copy">
            <h2 id="signup-hd">Case alerts, sourced from WHO</h2>
            <p>
              When WHO confirms a new hantavirus case we send one short
              email with the case count, affected countries, and a link
              to the official WHO report. Nothing else.
            </p>
            <p className="signup-promise">
              One email per confirmed case update.<br />
              No newsletters. No marketing.<br />
              No third-party data sharing.<br />
              Unsubscribe by replying STOP.
            </p>
          </div>

          <div className="signup-card">
            {status === 'success' ? (
              <div className="signup-ok" role="status">
                <span className="signup-ok-mark" aria-hidden="true">✓</span>
                <p className="signup-ok-text">
                  You're on the list. We'll email you when WHO confirms
                  a new case.
                </p>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <label className="signup-flabel" htmlFor="alert-email">
                  Email address
                </label>
                <input
                  id="alert-email"
                  className="signup-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  aria-describedby="signup-consent"
                />
                <button type="submit" className="signup-btn"
                  disabled={status === 'loading'}
                  aria-busy={status === 'loading'}>
                  {status === 'loading' ? 'Adding...' : 'Alert me'}
                </button>
                {err && (
                  <p className="signup-err" role="alert">{err}</p>
                )}
                <p id="signup-consent" className="signup-consent"
                   role="note">
                  By signing up you agree to receive email alerts when WHO
                  confirms new hantavirus cases. Your email is stored
                  securely and never shared with third parties. Operated
                  from the United Kingdom under UK data protection law.
                  Unsubscribe at any time by replying STOP.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
