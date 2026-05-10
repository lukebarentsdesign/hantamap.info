import { MV_HONDIUS_STATS } from './mvHondiusData'

export function CompactStats({ snapshot }) {
  const cases = MV_HONDIUS_STATS.totalCases
  const confirmed = MV_HONDIUS_STATS.confirmed
  const probable = MV_HONDIUS_STATS.probable
  const deaths = MV_HONDIUS_STATS.deaths
  const aboard = MV_HONDIUS_STATS.aboard
  const tracked = MV_HONDIUS_STATS.tracked

  return (
    <div className="compact-stats">
      <div className="top-stats">
        <div className="stat-box" title="WHO DON600 total cases as of 8 May 2026.">
          <span className="stat-val text-orange">{cases}</span>
          <span className="stat-key">Total cases</span>
        </div>
        <div className="stat-box" title="WHO DON600 laboratory-confirmed Andes virus infections.">
          <span className="stat-val text-orange">{confirmed}</span>
          <span className="stat-key">Confirmed</span>
        </div>
        <div className="stat-box" title="WHO DON600 probable cases.">
          <span className="stat-val text-amber">{probable}</span>
          <span className="stat-key">Probable</span>
        </div>
        <div className="stat-box" title="WHO DON600 deaths: three, not seven.">
          <span className="stat-val">{deaths}</span>
          <span className="stat-key">Deaths</span>
        </div>
        <div className="stat-box" title="People aboard at the time of the WHO update/public tracker docking notes.">
          <span className="stat-val">{aboard}</span>
          <span className="stat-key">Aboard</span>
        </div>
        <div className="stat-box" title="Total people tracked in the MV Hondius public outbreak dataset.">
          <span className="stat-val text-dim">{tracked}</span>
          <span className="stat-key">Tracked</span>
        </div>
      </div>
      <div className="compact-stats-source">
        SOURCES: WHO DON600 / AP / REGIONAL AUTHORITIES / PUBLIC MV HONDIUS TRACKER
      </div>
    </div>
  )
}
