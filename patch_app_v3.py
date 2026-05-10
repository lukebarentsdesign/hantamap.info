import os
import re

FILE = r'c:\Users\Studio\Documents\Antigravity\Hantamap.info\frontend\src\App.jsx'

with open(FILE, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Wire up onRegionClick handler inside viewport
old_vp = 'whoCountries={activeCountries}'
new_vp = 'whoCountries={activeCountries} onRegionClick={(cc) => { setActiveRegion(cc); setIsLocaleOpen(true); }}'
content = content.replace(old_vp, new_vp)

# 2. Header panel label fix - replaces "{REGIONS_MAP[activeRegion] || activeRegion} INTELLIGENCE" 
# with "{getCountryName(activeRegion)} INTELLIGENCE"
# Wait, I saw in the previous dump:
# 98:               {REGIONS_MAP[activeRegion] || activeRegion} INTELLIGENCE
old_hdr = '{REGIONS_MAP[activeRegion] || activeRegion} INTELLIGENCE'
new_hdr = '{getCountryName(activeRegion)} INTELLIGENCE'
content = content.replace(old_hdr, new_hdr)

# 3. Locale pill text in head area:
# 84:             LOCALE: {activeRegion}
# Replace with full name
old_loc = 'LOCALE: {activeRegion}'
new_loc = 'LOCALE: {getCountryName(activeRegion)}'
content = content.replace(old_loc, new_loc)

# 4. Update Group Iteration in drawer body
group_render = """<div className="continents-stack" style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
              {Object.entries(
                flagList.reduce((acc, cc) => {
                  const cont = getContinent(cc);
                  if(!acc[cont]) acc[cont] = [];
                  acc[cont].push(cc);
                  return acc;
                }, {})
              ).sort().map(([continent, ccs]) => (
                <div key={continent} className="continent-group">
                  <div style={{fontSize:'10px', fontWeight:800, color:'var(--accent)', letterSpacing:'0.05em', marginBottom:'6px', opacity:0.8}}>
                    {continent.toUpperCase()}
                  </div>
                  <div className="mini-grid-flags" style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'6px' }}>
                    {ccs.sort((a,b) => getCountryName(a).localeCompare(getCountryName(b))).map(cc => (
                      <button 
                        key={cc}
                        onClick={() => setActiveRegion(cc)}
                        title={getCountryName(cc)}
                        style={{
                          display:'flex', alignItems:'center', gap:'6px', padding:'6px 8px',
                          background: activeRegion === cc ? 'var(--text)' : '#f8fafc',
                          color: activeRegion === cc ? 'white' : 'var(--text)',
                          border: activeRegion === cc ? '1px solid var(--text)' : '1px solid #e2e8f0', 
                          borderRadius:'6px', cursor:'pointer',
                          fontSize:'11px', fontWeight:700, transition:'all 0.1s',
                          overflow:'hidden'
                        }}
                      >
                        <img src={getCountryFlag(cc)} alt="" style={{width:'16px', height:'11px', objectFit:'cover', borderRadius:'1px'}}/>
                        <span style={{ whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{getCountryName(cc)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>"""

content = re.sub(r'<div className="mini-grid-flags">[\s\S]*?\{flagList\.map\(cc => \([\s\S]*?<\/button>[\s\S]*?\)\)\}[\s\S]*?<\/div>', group_render, content)

with open(FILE, 'w', encoding='utf-8') as f:
    f.write(content)

print("Success")
