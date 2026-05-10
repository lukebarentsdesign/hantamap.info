import {
  MV_HONDIUS_EXPOSURE_EVENTS,
  MV_HONDIUS_FLIGHTS,
  MV_HONDIUS_MANIFEST,
  MV_HONDIUS_ROUTE_POINTS,
  MV_HONDIUS_STATS
} from './mvHondiusData'

function parseCount(text) {
  const matches = String(text).match(/\d+/g)
  return matches ? matches.reduce((sum, n) => sum + Number(n), 0) : 0
}

const manifestRows = MV_HONDIUS_MANIFEST
  .filter(([country]) => country !== 'Other nationalities')
  .map(([country, count]) => ({
    country,
    count,
    total: parseCount(count)
  }))
  .sort((a, b) => b.total - a.total)

const flightStatus = MV_HONDIUS_FLIGHTS.reduce((acc, flight) => {
  const key = flight.status.toLowerCase().includes('departed')
    ? 'Departed'
    : flight.status.toLowerCase().includes('pending') || flight.status.toLowerCase().includes('monday')
      ? 'Pending'
      : 'Standby / confirmed'
  acc[key] = (acc[key] || 0) + 1
  return acc
}, {})

export function MvHondiusAnalytics() {
  const monitored = MV_HONDIUS_STATS.symptomatic + MV_HONDIUS_STATS.asymptomatic
  const operationalTotal = MV_HONDIUS_STATS.totalCases + monitored + MV_HONDIUS_STATS.recovered
  const confirmedPct = Math.round((MV_HONDIUS_STATS.totalCases / operationalTotal) * 100)
  const monitoringPct = Math.round((monitored / operationalTotal) * 100)
  const recoveredPct = Math.round((MV_HONDIUS_STATS.recovered / operationalTotal) * 100)
  const maxManifest = Math.max(...manifestRows.map(row => row.total))

  return (
    <section className="analytics-panel" aria-labelledby="analytics-title">
      <div className="analytics-head">
        <div>
          <p className="hondius-kicker">Operational analytics</p>
          <h2 id="analytics-title">MV Hondius outbreak data, aggregated</h2>
          <p>
            This view turns the Hondius dossier into map-ready summaries:
            status mix, exposure stops, repatriation operations and manifest
            concentration.
          </p>
        </div>
      </div>

      <div className="analytics-grid">
        <article className="analytics-card wide">
          <div className="hondius-panel-label">Case state mix</div>
          <div className="status-bars" aria-label="Case status percentage bars">
            <div style={{ width: `${confirmedPct}%` }} className="bar-confirmed">WHO cases {confirmedPct}%</div>
            <div style={{ width: `${monitoringPct}%` }} className="bar-monitoring">Monitoring {monitoringPct}%</div>
            <div style={{ width: `${recoveredPct}%` }} className="bar-resolved">Recovered {recoveredPct}%</div>
          </div>
          <div className="analytics-mini-stats">
            <span>{MV_HONDIUS_STATS.totalCases} WHO cases ({MV_HONDIUS_STATS.confirmed} confirmed, {MV_HONDIUS_STATS.probable} probable)</span>
            <span>{monitored} monitoring</span>
            <span>{MV_HONDIUS_STATS.recovered} recovered</span>
            <span>{MV_HONDIUS_STATS.deaths} deaths - separate outcome, not part of recovered</span>
          </div>
        </article>

        <article className="analytics-card">
          <div className="hondius-panel-label">Exposure stops</div>
          <strong className="analytics-big">{MV_HONDIUS_EXPOSURE_EVENTS.length}</strong>
          <p>Shore or medevac events mapped from the route chronology.</p>
        </article>

        <article className="analytics-card">
          <div className="hondius-panel-label">Route nodes</div>
          <strong className="analytics-big">{MV_HONDIUS_ROUTE_POINTS.length}</strong>
          <p>Origin, shore stops, medevac, docking and disinfection destination.</p>
        </article>
      </div>

      <div className="analytics-grid two">
        <article className="analytics-card">
          <div className="hondius-panel-label">Repatriation status</div>
          <div className="analytics-list">
            {Object.entries(flightStatus).map(([status, total]) => (
              <div className="analytics-row" key={status}>
                <span>{status}</span>
                <strong>{total}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="analytics-card">
          <div className="hondius-panel-label">Manifest concentration</div>
          <div className="manifest-bars">
            {manifestRows.slice(0, 9).map((row) => (
              <div className="manifest-bar-row" key={row.country}>
                <span>{row.country}</span>
                <div>
                  <i style={{ width: `${Math.max(8, (row.total / maxManifest) * 100)}%` }} />
                </div>
                <strong>{row.count}</strong>
              </div>
            ))}
          </div>
        </article>
      </div>

      <article className="analytics-card wide">
        <div className="hondius-panel-label">Exposure interpretation</div>
        <div className="analytics-exposure-grid">
          {MV_HONDIUS_EXPOSURE_EVENTS.map((event) => (
            <div className="analytics-exposure" key={event.place}>
              <strong>{event.place}</strong>
              <span>{event.date}</span>
              <p>{event.risk}</p>
            </div>
          ))}
        </div>
      </article>
    </section>
  )
}
