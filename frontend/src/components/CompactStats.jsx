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
    <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-start' }}>
      <div className="top-stats">
        <div className="stat-box" title="Individuals positively diagnosed via laboratory validation.">
          <span className="stat-val text-orange">{who_confirmed}</span>
          <span className="stat-key">Confirmed <sup style={{opacity:0.5, fontSize:'8px'}}>ⓘ</sup></span>
        </div>
        <div className="stat-box" title="Cases undergoing clinical evaluation without completed verification.">
          <span className="stat-val text-amber">{who_suspected || 0}</span>
          <span className="stat-key">Suspected <sup style={{opacity:0.5, fontSize:'8px'}}>ⓘ</sup></span>
        </div>
        <div className="stat-box" title="Total verified causalities explicitly linked by authoritative sources.">
          <span className="stat-val">{who_deaths}</span>
          <span className="stat-key">Deaths <sup style={{opacity:0.5, fontSize:'8px'}}>ⓘ</sup></span>
        </div>
        <div className="stat-box" title="Discrete international boundaries actively monitored.">
          <span className="stat-val">{active_countries}</span>
          <span className="stat-key">Regions <sup style={{opacity:0.5, fontSize:'8px'}}>ⓘ</sup></span>
        </div>
        <div className="stat-box" title="Total machine-filtered intelligence items ingested.">
          <span className="stat-val text-dim">{total_signals}</span>
          <span className="stat-key">Signals <sup style={{opacity:0.5, fontSize:'8px'}}>ⓘ</sup></span>
        </div>
      </div>
      <div style={{ fontSize: '9px', color:'#64748b', opacity:0.8, marginTop:'2px', marginLeft:'2px', fontWeight:600, letterSpacing:'0.02em' }}>
        SOURCES: WHO SITREPS & PROMED-MAIL
      </div>
    </div>
  )
}
