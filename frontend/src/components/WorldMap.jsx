import { MapContainer, TileLayer, CircleMarker,
         Polyline, Tooltip } from 'react-leaflet'
import { GEO_COORDS } from './geoCoords'
import { getCountryName, getIsoCode } from './flagUtils'
import { MV_HONDIUS_REPATRIATION_POINTS, MV_HONDIUS_ROUTE_POINTS } from './mvHondiusData'
import { getRegionStatus } from './statusLogic'

const ROUTE = MV_HONDIUS_ROUTE_POINTS.map(point => point.coords)

const TILES = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
const ATTR = '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>'

export function WorldMap({ whoCountries = [], signals = [], isDashboard = false, onRegionClick }) {
  const isSmallViewport = typeof window !== 'undefined' && window.innerWidth <= 768
  const initialZoom = isSmallViewport ? 1.35 : 2.5
  const minimumZoom = isSmallViewport ? 1.1 : 2

  // 1. Map string names to standardized ISO codes
  const confirmedIsoCodes = new Set(
    whoCountries.map(c => getIsoCode(c.toString()).toUpperCase())
  )

  // 2. Accumulate all dynamic ISOs from incoming signals
  const signalIsoCodes = new Set(
    signals
      .filter(s => s.country_iso2 && s.country_iso2.length === 2)
      .map(s => s.country_iso2.toUpperCase())
  )

  // 3. Union them to create the complete reactive location set
  const activeIsos = new Set([...confirmedIsoCodes, ...signalIsoCodes])
  
  // 4. Construct explicit rendering payload anchored by valid coordinate geometry
  const locations = Array.from(activeIsos)
    .map(iso => {
      const coords = GEO_COORDS[iso];
      if (!coords) return null;
      return {
        iso,
        name: getCountryName(iso),
        coords,
        isConfirmed: confirmedIsoCodes.has(iso),
        regionSignals: signals.filter(s => s.country_iso2?.toUpperCase() === iso)
      };
    })
    .filter(Boolean);

  const renderMap = () => (
    <MapContainer
      center={[20, 0]} 
      zoom={initialZoom}
      zoomSnap={0.25}
      minZoom={minimumZoom}
      maxBounds={[[-85, -180], [85, 180]]}
      maxBoundsViscosity={1.0}
      worldCopyJump={false}
      style={{ height: '100%', width: '100%', background: '#dce6f2' }}
      scrollWheelZoom={true}
      tap={false}
    >
      <TileLayer 
        url={TILES} 
        attribution={ATTR} 
        subdomains="abcd" 
        maxZoom={19} 
        noWrap={true} 
      />

      <Polyline
        positions={ROUTE}
        color="#ea580c"
        dashArray="6, 8"
        weight={2}
        opacity={0.78}
      >
        <Tooltip sticky>MV Hondius route and exposure chronology</Tooltip>
      </Polyline>

      {MV_HONDIUS_ROUTE_POINTS.map((point) => (
        <CircleMarker
          key={point.name}
          center={point.coords}
          radius={point.tone === 'current' ? 9 : point.tone === 'high' ? 8 : 6}
          fillColor={point.tone === 'current' ? '#14b8a6' : point.tone === 'high' || point.tone === 'origin' ? '#ea580c' : '#f59e0b'}
          color="#ffffff"
          weight={2}
          opacity={1}
          fillOpacity={0.86}
          className={point.tone === 'current' || point.tone === 'high' ? 'pulse-marker' : ''}
        >
          {!isSmallViewport && (
            <Tooltip direction="top" offset={[0, -5]} opacity={1}>
              <div style={{fontWeight: 800, color: 'var(--text)', fontSize: '12px', marginBottom: '4px'}}>
                {point.name}
              </div>
              <div style={{fontSize: '11px', color: 'var(--text2)', lineHeight: 1.45}}>
                <strong style={{color: 'var(--accent)'}}>{point.label}</strong>
                <br />
                {point.note}
              </div>
            </Tooltip>
          )}
        </CircleMarker>
      ))}

      {MV_HONDIUS_REPATRIATION_POINTS.map(([name, coords, note]) => (
        <CircleMarker
          key={name}
          center={coords}
          radius={5}
          fillColor="#0284c7"
          color="#ffffff"
          weight={1.5}
          opacity={1}
          fillOpacity={0.75}
        >
          {!isSmallViewport && (
            <Tooltip direction="top" offset={[0, -5]} opacity={1}>
              <div style={{fontWeight: 800, color: 'var(--text)', fontSize: '12px', marginBottom: '4px'}}>
                {name}
              </div>
              <div style={{fontSize: '11px', color: 'var(--text2)'}}>{note}</div>
            </Tooltip>
          )}
        </CircleMarker>
      ))}

      {locations.map(({ name, coords, iso, isConfirmed, regionSignals }) => {
        // Calculate Signal Heat (recency check: 72 hours)
        const now = new Date();
        const hotSignals = regionSignals.filter(s => {
          if (!s.published_at) return false;
          const deltaHrs = (now - new Date(s.published_at)) / (1000 * 60 * 60);
          return deltaHrs >= 0 && deltaHrs <= 72;
        });
        const isHot = hotSignals.length > 0;

        // RESTORE SAFETY: The Map Dot ALWAYS uses the verified "isConfirmed" source data ONLY. 
        // We do NOT let the news scraper override the map's state!
        const finalColor = isConfirmed ? '#dc2626' : (isHot ? '#0284c7' : '#0ea5e9');
        const finalLabel = isConfirmed ? 'Confirmed Outbreak Area' : (isHot ? 'Recent News Signals' : 'Standard Monitoring');

        let markerClass = "";
        if (isConfirmed) markerClass = "pulse-marker";
        else if (isHot) markerClass = "heat-signal";

        const markerRadius = isConfirmed ? 8 : 6;

        return (
          <CircleMarker 
            key={iso} 
            center={coords} 
            radius={markerRadius}
            fillColor={finalColor}
            color="white"
            weight={2}
            opacity={1}
            fillOpacity={isConfirmed ? 0.9 : 0.6}
            className={markerClass}
            eventHandlers={{
              click: () => onRegionClick && onRegionClick(iso)
            }}
          >
            {!isSmallViewport && (
              <Tooltip direction="top" offset={[0, -5]} opacity={1}>
                <div style={{
                  fontWeight: 800, 
                  color: 'var(--text)', 
                  fontSize: '12px', 
                  marginBottom: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{
                    width:'8px', height:'8px', borderRadius:'50%', background:finalColor, display:'inline-block'
                  }} />
                  {name}
                </div>
                <div style={{fontSize: '11px', color: 'var(--text2)', marginBottom:'4px'}}>
                  {finalLabel}
                </div>
                <div style={{fontSize: '10px', color: 'var(--text3)'}}>
                  {regionSignals.length} signal{regionSignals.length === 1 ? '' : 's'} active
                </div>
              </Tooltip>
            )}
          </CircleMarker>
        )
      })}

    </MapContainer>
  )

  const renderLegend = () => (
    <div className="map-legend" role="legend" style={{
      display: 'flex',
      flexDirection: isDashboard ? 'column' : 'row',
      gap: isDashboard ? '8px' : '20px',
      paddingTop: isDashboard ? '0' : '12px',
      flexWrap: 'wrap'
    }}>
      <div className="legend-i">
        <span className="legend-dot pulse-marker" style={{ background: '#dc2626' }} aria-hidden="true" />
        Confirmed Outbreak
      </div>
      <div className="legend-i">
        <span className="legend-dot heat-signal" style={{ background: '#0284c7' }} aria-hidden="true" />
        Recent Signal Activity
      </div>
      <div className="legend-i">
        <span className="legend-dot" style={{ background: '#0ea5e9', opacity:0.6 }} aria-hidden="true" />
        Monitoring Coverage
      </div>
    </div>
  )

  if (isDashboard) {
    return (
      <div className="dash-map-container" style={{ position: 'relative' }}>
        {renderMap()}
        <div className="map-legend-panel">
           {renderLegend()}
        </div>
      </div>
    )
  }

  return (
    <section className="map-section" aria-label="World map — case locations">
      <div className="wrap">
        <div className="label">Geographic distribution</div>
        <div className="map-box" role="img" aria-label="World map showing monitoring status">
          {renderMap()}
        </div>
        
        {renderLegend()}

        <p className="map-note">
          Blue points indicate regions under systematic surveillance. 
          Orange indicators identify geographies flagged by primary health authorities.
        </p>
      </div>
    </section>
  )
}
