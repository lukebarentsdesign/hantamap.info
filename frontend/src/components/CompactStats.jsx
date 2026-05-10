export function CompactStats({ snapshot }) {
  const s = snapshot?.snapshot ?? {}
  const {
    who_confirmed = 0, 
    who_deaths = 0, 
    who_suspected = 0,
    total_signals = 0,
    active_countries = 0,
    feeds_healthy = 0
  } = s

  return (
    <div className="top-stats">
      <div className="stat-box" title="Individuals positively diagnosed with active Hantavirus via verified laboratory validation (CDC/WHO sourced).">
        <span className="stat-val text-orange">{who_confirmed}</span>
        <span className="stat-key">Confirmed</span>
      </div>
      <div className="stat-box" title="Cases undergoing dynamic clinical evaluation for Hantavirus symptoms without completed lab verification.">
        <span className="stat-val text-amber">{who_suspected || 0}</span>
        <span className="stat-key">Suspected</span>
      </div>
      <div className="stat-box" title="Total verified causalities explicitly linked to active transmission vectors according to health ministry data.">
        <span className="stat-val">{who_deaths}</span>
        <span className="stat-key">Deaths</span>
      </div>
      <div className="stat-box" title="Discrete international nation-states actively generating relevant spatial intelligence and monitoring streams.">
        <span className="stat-val">{active_countries}</span>
        <span className="stat-key">Regions</span>
      </div>
      <div className="stat-box" title="Aggregated situational telemetry including distinct news items, surveillance feeds, and local agency alerts.">
        <span className="stat-val text-dim">{total_signals}</span>
        <span className="stat-key">Signals</span>
      </div>
    </div>
  )
}
