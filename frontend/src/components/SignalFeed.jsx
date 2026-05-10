import { useState, useMemo } from 'react'
import { getCountryName, getCountryFlag } from './flagUtils'
import { getSignalStatus } from './statusLogic'


function ago(iso) {
  if (!iso) return ''
  const s = (Date.now() - new Date(iso).getTime()) / 1000
  if (s < 60)    return `${Math.round(s)}s`
  if (s < 3600)  return `${Math.round(s/60)}m`
  if (s < 86400) return `${Math.round(s/3600)}h`
  return `${Math.round(s/86400)}d`
}

export function SignalFeed({ signals, onArticleClick }) {
  const [expanded, setExpanded] = useState({})

  const groups = useMemo(() => {
    if (!signals) return []
    const map = {}
    signals.forEach(s => {
      const key = s.country_iso2 || 'XX'
      if (!map[key]) map[key] = { code: key, name: getCountryName(key) || 'International', items: [] }
      map[key].items.push(s)
    })
    // Sort items WITHIN groups by Tier first, then most recent
    Object.values(map).forEach(group => {
      group.items.sort((a, b) => {
        const tierA = a.tier || 3;
        const tierB = b.tier || 3;
        if (tierA !== tierB) return tierA - tierB;
        const timeA = new Date(a.published_at || a.ingested_at).getTime();
        const timeB = new Date(b.published_at || b.ingested_at).getTime();
        return timeB - timeA;
      });
    });
    // Sort groups by count descending, then name
    return Object.values(map).sort((a, b) => b.items.length - a.items.length || a.name.localeCompare(b.name))
  }, [signals])

  const toggle = (code) => {
    setExpanded(prev => ({ ...prev, [code]: !prev[code] }))
  }

  if (!signals?.length) return null

  return (
    <section className="signals" aria-labelledby="sig-hd">
      <div className="signals-hd">
        <div className="label" id="sig-hd" style={{marginBottom:0}}>
          Live signals
        </div>
        <span className="signals-count">{signals.length} detected</span>
      </div>

      <div className="sig-accordion" style={{marginTop:'16px'}}>
        {groups.map(g => {
          const isOpen = expanded[g.code]
          return (
            <div key={g.code} className={`sig-group ${isOpen ? 'is-open' : ''}`}>
              <button 
                className="sig-group-hd"
                onClick={() => toggle(g.code)}
                aria-expanded={isOpen}
              >
                <div className="sig-group-label">
                  <span className="sig-flag" aria-hidden="true" style={{display:'flex', alignItems:'center'}}>
                    {g.code === 'XX' ? '🌍' : <img src={getCountryFlag(g.code)} alt="" style={{width:'16px', height:'12px', objectFit:'cover', borderRadius:'1px'}}/>}
                  </span>
                  <span>{g.name}</span>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                  <span className="sig-group-ct">{g.items.length}</span>
                  <svg 
                    width="10" height="6" viewBox="0 0 10 6" fill="none" 
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s ease'
                    }}
                  >
                    <path d="M1 1L5 5L9 1" stroke="var(--text3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </button>
              
              {isOpen && (
                <div className="sig-group-body">
                  <ul role="list" style={{margin:0, padding:0, listStyle:'none'}}>
                    {g.items.map((s, idx) => (
                      <li key={s.id ?? s.url} className="signal-row">
                        <div className="sig-row-id" aria-hidden="true">
                          S-{s.id ? String(s.id).slice(-3) : idx + 101}
                        </div>
                        <div className="sig-row-content">
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              if (onArticleClick) onArticleClick(s);
                            }}
                            style={{
                              background:'none', border:'none', padding:0, cursor:'pointer', 
                              textAlign:'left', display:'block', width:'100%', fontFamily:'inherit'
                            }}
                            className="sig-title"
                          >
                            {s.title}
                          </button>
                          <div className="sig-meta" style={{marginTop:'4px', display:'flex', alignItems:'center', gap:'6px'}}>
                            {(() => {
                              const st = getSignalStatus(`${s.title || ""} ${s.snippet || ""} ${s.content || ""}`);
                              if (st.id === 'monitoring') return null;
                              return (
                                <span className="badge-lite" style={{ 
                                  borderColor: st.color, 
                                  color: st.id === 'death' ? '#fff' : st.color, 
                                  background: st.id === 'death' ? '#000' : 'transparent',
                                  fontWeight: 600,
                                  textTransform: 'uppercase',
                                  fontSize: '9px'
                                }}>
                                  {st.label}
                                </span>
                              );
                            })()}
                            <span className={`tier-tag t${s.tier || 3}`}>T{s.tier || 3}</span>
                            <span className="badge-lite">{s.source}</span>
                            {s.language && <span className="badge-lite text-mono">{s.language.toUpperCase()}</span>}
                            {s.language && s.language !== 'en' && (
                              <span className="badge-lite text-mono">EN TRANSLATE</span>
                            )}
                            <span className="sig-time" style={{marginLeft:'auto'}}>
                              {ago(s.published_at ?? s.ingested_at)}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <p className="signals-note" role="note">
        Signals reflect monitored official, media and Google News feeds.
        Counts and clinical status still require official-source validation.
      </p>
    </section>
  )
}
