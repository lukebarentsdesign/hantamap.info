const SOURCES = [
  { name: 'WHO DON',        type: 'Official · Global' },
  { name: 'WHO News',       type: 'Official · Global' },
  { name: 'ECDC',           type: 'Official · Europe' },
  { name: 'ProMED',         type: 'Surveillance · Global' },
  { name: 'GDELT',          type: 'News · 65 languages' },
  { name: 'Google News EN', type: 'News · GB / US / AU / CA' },
  { name: 'Google News ES', type: 'News · ES / AR / MX / CL' },
  { name: 'Google News DE', type: 'News · DE / AT' },
  { name: 'Google News FR', type: 'News · FR' },
  { name: 'Google News PT', type: 'News · BR / PT' },
  { name: 'Google News IT', type: 'News · IT' },
  { name: 'Google News TR', type: 'News · TR' },
  { name: 'Google News PL', type: 'News · PL' },
  { name: 'Google News NL', type: 'News · NL' },
  { name: 'Google News RU', type: 'News · RU' },
  { name: 'Google News KO', type: 'News · KR' },
  { name: 'Google News EL', type: 'News · GR' },
  { name: 'Hantaflow.com',  type: 'Aggregator · CC BY 4.0' },
]

export function SourcesPanel() {
  return (
    <section className="sources" aria-labelledby="src-hd">
      <div className="wrap">
        <div className="label" id="src-hd">Data sources</div>
        <div className="sources-grid" role="list"
             aria-label="All monitored sources">
          {SOURCES.map(s => (
            <div key={s.name} className="source-card" role="listitem">
              <div className="src-name">
                <span className="src-dot" aria-hidden="true" />
                {s.name}
              </div>
              <div className="src-type">{s.type}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
