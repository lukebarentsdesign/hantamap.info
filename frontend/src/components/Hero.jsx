export function Hero({ snapshot }) {
  const s = snapshot?.snapshot ?? {}
  const {
    who_confirmed = 0, who_deaths = 0, who_countries = [],
    situation_summary = '', total_signals = 0,
    active_countries = 0, active_languages = 0,
    feeds_healthy = 0, feeds_total = 0,
  } = s
  const cc = Array.isArray(who_countries) ? who_countries.length : 0

  return (
    <section className="hero" aria-label="Outbreak summary">
      <div className="hero-eyebrow">
        MV Hondius · Andes virus · Active outbreak
      </div>

      <div className="stats-grid" role="region"
           aria-label="WHO confirmed statistics">
        <div className="stat confirmed">
          <span className="stat-n"
                aria-label={`${who_confirmed} confirmed cases`}>
            {who_confirmed}
          </span>
          <span className="stat-l">Confirmed cases</span>
          <span className="stat-src">Source: WHO DON</span>
        </div>
        <div className="stat deaths">
          <span className="stat-n"
                aria-label={`${who_deaths} deaths`}>
            {who_deaths}
          </span>
          <span className="stat-l">Deaths</span>
          <span className="stat-src">Source: WHO DON</span>
        </div>
        <div className="stat countries">
          <span className="stat-n"
                aria-label={`${cc} countries affected`}>
            {cc}
          </span>
          <span className="stat-l">Countries</span>
          <span className="stat-src">Source: WHO DON</span>
        </div>
      </div>

      {situation_summary && (
        <p className="hero-summary">{situation_summary}</p>
      )}

      <div className="pills" aria-label="Data coverage">
        <span className="pill">{total_signals} signals</span>
        <span className="pill">{active_countries} countries</span>
        <span className="pill">{active_languages} languages</span>
        <span className="pill">{feeds_healthy}/{feeds_total} feeds</span>
      </div>
    </section>
  )
}
