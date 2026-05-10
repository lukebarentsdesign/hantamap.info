import { CompactStats } from './CompactStats'

const SOURCE_CHIPS = ['WHO DON600', 'Integrated Hondius data', 'Hantavirus media scan', 'Translated signal feeds']

export function SiteHeader({ updatedAt, snapshot }) {
  const ts = updatedAt
    ? new Date(updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC'
    : '--:--'

  return (
    <div className="site-header">
      <div className="header-left">
        <div className="logo" style={{ flexShrink: 0 }}>
          <span className="logo-dot" aria-hidden="true" />
          <span className="logo-text">Hantavirus Tracker</span>
        </div>
        <div className="header-sources" aria-label="Primary data sources">
          {SOURCE_CHIPS.map((source) => (
            <span key={source}>{source}</span>
          ))}
        </div>
      </div>

      <CompactStats snapshot={snapshot} />

      <div className="header-meta">
        Updated {ts}
      </div>
    </div>
  )
}
