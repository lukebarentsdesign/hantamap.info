import { MapContainer, TileLayer, CircleMarker,
         Polyline, Tooltip } from 'react-leaflet'

const LOCATIONS = [
  { name: 'South Africa',   c: [-30.56,  22.94] },
  { name: 'Netherlands',    c: [ 52.37,   4.90] },
  { name: 'Germany',        c: [ 51.17,  10.45] },
  { name: 'Spain',          c: [ 40.42,  -3.70] },
  { name: 'Switzerland',    c: [ 46.82,   8.23] },
  { name: 'United Kingdom', c: [ 51.51,  -0.13] },
  { name: 'France',         c: [ 46.23,   2.21] },
  { name: 'Italy',          c: [ 41.87,  12.57] },
  { name: 'Poland',         c: [ 51.92,  19.15] },
  { name: 'Argentina',      c: [-38.42, -63.62] },
  { name: 'Canada',         c: [ 56.13,-106.35] },
  { name: 'United States',  c: [ 37.09, -95.71] },
  { name: 'Australia',      c: [-25.27, 133.78] },
  { name: 'Turkey',         c: [ 38.96,  35.24] },
  { name: 'Greece',         c: [ 39.07,  21.82] },
  { name: 'Portugal',       c: [ 39.39,  -8.22] },
  { name: 'Brazil',         c: [-14.23, -51.92] },
  { name: 'Chile',          c: [-35.67, -71.54] },
  { name: 'Russia',         c: [ 61.52, 105.31] },
  { name: 'South Korea',    c: [ 35.90, 127.76] },
]

const ROUTE = [
  [-54.8, -68.3],
  [-15.9,  -5.7],
  [ 14.9, -23.5],
  [ 28.3, -16.5],
]

const TILES = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
const ATTR = '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>'

export function WorldMap({ whoCountries = [], isDashboard = false }) {
  const normalizedConfirmed = whoCountries.map(c => c.toLowerCase())

  const renderMap = () => (
    <MapContainer
      center={[20, 0]} zoom={2} minZoom={1}
      style={{ height: '100%', width: '100%', background: '#f5f7fa' }}
      scrollWheelZoom={true}
    >
      <TileLayer url={TILES} attribution={ATTR} subdomains="abcd" maxZoom={19} />

      {LOCATIONS.map(({ name, c }) => {
        const isConfirmed = normalizedConfirmed.includes(name.toLowerCase());
        
        return (
          <CircleMarker 
            key={name} 
            center={c} 
            radius={isConfirmed ? 9 : 5}
            pathOptions={
              isConfirmed 
                ? { color:'#e85d3c', fillColor:'#e85d3c', fillOpacity:0.65, weight:1.5 }
                : { color:'#a0aabf', fillColor:'#cbd2df', fillOpacity:0.5, weight:1 }
            }
          >
            <Tooltip direction="top" offset={[0,-5]}>
              <div style={{ fontFamily: 'var(--sans)', fontSize: '13px', lineHeight: '1.4' }}>
                <strong style={{ color: '#1a1d23', fontSize: '14px' }}>{name}</strong><br />
                {isConfirmed ? (
                  <span style={{ color: '#d94423', fontWeight: '600' }}>● WHO Confirmed Active</span>
                ) : (
                  <span style={{ color: '#5a6575' }}>News signals monitored</span>
                )}
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}

      <Polyline positions={ROUTE} pathOptions={{ color:'#e85d3c', weight:1.5, opacity:0.5, dashArray:'4 6' }} />

      <CircleMarker center={[28.3, -16.5]} radius={8}
        pathOptions={{ color:'#1a1d23', fillColor:'#e85d3c', fillOpacity:1, weight:1.5 }}>
        <Tooltip permanent direction="top" offset={[0,-8]}>
          <span style={{ fontWeight:600, fontSize:'12px' }}>MV Hondius</span>
        </Tooltip>
      </CircleMarker>
    </MapContainer>
  )

  if (isDashboard) {
    return (
      <div className="dash-map-container">
        {renderMap()}
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
        
        <div className="map-legend" role="legend">
          <div className="legend-i">
            <span className="legend-dot" style={{ background: '#e85d3c' }} aria-hidden="true" />
            WHO Confirmed Cases
          </div>
          <div className="legend-i">
            <span className="legend-dot" style={{ background: '#cbd2df', border: '1px solid #a0aabf' }} aria-hidden="true" />
            News monitoring only
          </div>
          <div className="legend-i">
            <span className="legend-line" style={{ borderTop: '1.5px dashed #e85d3c' }} aria-hidden="true" />
            Ship vector
          </div>
        </div>

        <p className="map-note">
          Passive locations indicate automated RSS feed monitoring coverage only, <strong>not</strong> active outbreaks. 
          Explicit red markers identify countries with clinical laboratory confirmations verified via WHO DON.
        </p>
      </div>
    </section>
  )
}
