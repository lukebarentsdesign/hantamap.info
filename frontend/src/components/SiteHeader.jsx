import { CompactStats } from './CompactStats'

export function SiteHeader({ updatedAt, snapshot }) {
  const ts = updatedAt
    ? new Date(updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC'
    : '--:--'

  return (
    <div className="site-header">
      <div className="logo" style={{ flexShrink: 0 }}>
        <span className="logo-dot" aria-hidden="true" />
        <span className="logo-text">Hantavirus Tracker</span>
      </div>

      <CompactStats snapshot={snapshot} />

      <div className="header-meta" style={{ flexShrink: 0, fontSize: '12px' }}>
        Updated {ts}
      </div>
    </div>
  )
}
