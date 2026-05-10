import { useState } from 'react'
import {
  MV_HONDIUS_CASE_SUMMARY,
  MV_HONDIUS_DOCKING_NOTES,
  MV_HONDIUS_EXPOSURE_EVENTS,
  MV_HONDIUS_FLIGHTS,
  MV_HONDIUS_MANIFEST,
  MV_HONDIUS_OFFICIAL_STATEMENTS,
  MV_HONDIUS_POST_DISEMBARKATION,
  MV_HONDIUS_SOURCE_LINKS,
  MV_HONDIUS_STATS,
  MV_HONDIUS_TIMELINE
} from './mvHondiusData'

const CRUISEMAPPER_URL = 'https://www.cruisemapper.com/ships/MV-Hondius-1624'

const TABS = [
  ['docked', 'Docked'],
  ['cases', 'Case Layer'],
  ['flights', 'Repatriation'],
  ['statements', 'Statements'],
  ['sources', 'Sources']
]

function Metric({ label, value, tone = 'default' }) {
  return (
    <div className={`hondius-metric ${tone}`}>
      <span className="hondius-metric-value">{value}</span>
      <span className="hondius-metric-label">{label}</span>
    </div>
  )
}

function DockedView() {
  return (
    <>
      <div className="hondius-grid">
        <article className="hondius-panel primary">
          <div className="hondius-panel-label">Docking notes</div>
          <h3>{MV_HONDIUS_STATS.status}</h3>
          <ul>{MV_HONDIUS_DOCKING_NOTES.map((note) => <li key={note}>{note}</li>)}</ul>
        </article>
        <article className="hondius-panel">
          <div className="hondius-panel-label">After disembarkation</div>
          <ul>{MV_HONDIUS_POST_DISEMBARKATION.map((note) => <li key={note}>{note}</li>)}</ul>
        </article>
      </div>

      <div className="hondius-grid">
        <section className="hondius-panel" aria-labelledby="timeline-title">
          <div className="hondius-panel-label">Voyage timeline</div>
          <h3 id="timeline-title">Exposure and response sequence</h3>
          <div className="hondius-timeline">
            {MV_HONDIUS_TIMELINE.map(([date, text]) => (
              <div className="hondius-time-row" key={`${date}-${text}`}>
                <span>{date}</span>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="hondius-panel" aria-labelledby="manifest-title">
          <div className="hondius-panel-label">Passenger manifest</div>
          <h3 id="manifest-title">{MV_HONDIUS_STATS.aboard} aboard - {MV_HONDIUS_STATS.nationalities} nationalities</h3>
          <div className="hondius-manifest">
            {MV_HONDIUS_MANIFEST.map(([country, count]) => (
              <div className="hondius-manifest-row" key={country}>
                <span>{country}</span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}

function CaseLayerView() {
  return (
    <div className="hondius-grid">
      <section className="hondius-panel" aria-labelledby="case-summary-title">
        <div className="hondius-panel-label">Integrated case layer</div>
        <h3 id="case-summary-title">Status and generation summary</h3>
        <div className="hondius-status-list">
          {MV_HONDIUS_CASE_SUMMARY.map(([label, value, note]) => (
            <div className="hondius-status-row" key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
              <p>{note}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="hondius-panel" aria-labelledby="exposure-title">
        <div className="hondius-panel-label">Travel exposure events</div>
        <h3 id="exposure-title">Shore stops and medevac points</h3>
        <div className="hondius-exposures">
          {MV_HONDIUS_EXPOSURE_EVENTS.map((event) => (
            <article className="hondius-exposure" key={event.place}>
              <div>
                <strong>{event.place}</strong>
                <span>{event.date}</span>
              </div>
              <em>{event.risk}</em>
              <p>{event.detail}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

function RepatriationView() {
  return (
    <section className="hondius-section" aria-labelledby="flights-title">
      <div className="hondius-section-head">
        <h3 id="flights-title">Repatriation flights</h3>
        <span>{MV_HONDIUS_FLIGHTS.length} tracked operations</span>
      </div>
      <div className="hondius-flight-grid">
        {MV_HONDIUS_FLIGHTS.map((flight) => (
          <article className="hondius-flight" key={flight.country}>
            <div className="hondius-flight-top">
              <strong>{flight.country}</strong>
              <span>{flight.status}</span>
            </div>
            <p>{flight.detail}</p>
            <dl>
              <div><dt>People</dt><dd>{flight.passengers}</dd></div>
              <div><dt>Protocol</dt><dd>{flight.protocol}</dd></div>
            </dl>
            <small>{flight.source}</small>
          </article>
        ))}
      </div>
    </section>
  )
}

function StatementsView() {
  return (
    <section className="hondius-panel" aria-labelledby="statement-title">
      <div className="hondius-panel-label">Official statements</div>
      <h3 id="statement-title">Public-health risk context</h3>
      <div className="hondius-statements">
        {MV_HONDIUS_OFFICIAL_STATEMENTS.map((statement) => (
          <blockquote key={statement.speaker}>
            <p>{statement.text}</p>
            <cite>{statement.speaker} - {statement.org}</cite>
          </blockquote>
        ))}
      </div>
    </section>
  )
}

function SourcesView() {
  return (
    <section className="hondius-panel" aria-labelledby="source-title">
      <div className="hondius-panel-label">Source links</div>
      <h3 id="source-title">Official sources and attribution</h3>
      <div className="hondius-source-list">
        {MV_HONDIUS_SOURCE_LINKS.map(([label, url]) => (
          <a href={url} target="_blank" rel="noopener noreferrer" key={url}>{label}</a>
        ))}
        <a href={CRUISEMAPPER_URL} target="_blank" rel="noopener noreferrer">CruiseMapper - MV Hondius</a>
      </div>
      <p className="hondius-note">
        This site presents an integrated local dossier assembled from official
        reports, public tracker observations, and outbreak-specific news scans.
        It is not an official public-health resource and should not be used as
        a sole source for travel, medical or operational decisions.
      </p>
    </section>
  )
}

export function MvHondiusIntel() {
  const [active, setActive] = useState('docked')

  return (
    <section className="hondius-intel" aria-labelledby="hondius-title">
      <div className="hondius-head">
        <div>
          <p className="hondius-kicker">MV Hondius operations picture</p>
          <h2 id="hondius-title">Docking, case, repatriation and source intelligence</h2>
          <p>
            MV Hondius data is shown directly in this dashboard for situational
            awareness. Verify critical details with WHO, national authorities,
            and operator or port statements.
          </p>
        </div>
      </div>

      <div className="hondius-metrics">
        <Metric label="WHO Cases" value={MV_HONDIUS_STATS.totalCases} tone="alert" />
        <Metric label="Confirmed" value={MV_HONDIUS_STATS.confirmed} tone="alert" />
        <Metric label="Probable" value={MV_HONDIUS_STATS.probable} tone="watch" />
        <Metric label="Recovered" value={MV_HONDIUS_STATS.recovered} tone="ok" />
        <Metric label="Deaths" value={MV_HONDIUS_STATS.deaths} tone="alert" />
        <Metric label="Tracked" value={MV_HONDIUS_STATS.tracked} />
        <Metric label="Gen 0" value={MV_HONDIUS_STATS.gen0} />
      </div>

      <div className="hondius-subtabs" role="tablist" aria-label="MV Hondius data sections">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active === id}
            className={active === id ? 'is-active' : ''}
            onClick={() => setActive(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {active === 'docked' && <DockedView />}
      {active === 'cases' && <CaseLayerView />}
      {active === 'flights' && <RepatriationView />}
      {active === 'statements' && <StatementsView />}
      {active === 'sources' && <SourcesView />}
    </section>
  )
}
