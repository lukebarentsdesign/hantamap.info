import { useState, useEffect }    from 'react'
import { useSnapshot }    from './hooks/useSnapshot'
import { useStickyRegion } from './hooks/useStickyRegion'
import { getCountryFlag, getCountryName, getContinent, getIsoCode } from './components/flagUtils'
import { DeltaBanner }    from './components/DeltaBanner'
import { SiteHeader }     from './components/SiteHeader'
import { DisclaimerBar }  from './components/DisclaimerBar'
import { MiniHero }       from './components/MiniHero'
import { SignalFeed }     from './components/SignalFeed'
import { InfoAccordion }  from './components/InfoAccordion'
import { SourcesPanel }   from './components/SourcesPanel'
import { FullDisclaimer } from './components/FullDisclaimer'
import { DashboardViewport } from './components/DashboardViewport'
import { TickerFooter }   from './components/TickerFooter'

export default function App() {
  const { snapshot, delta, loading } = useSnapshot()
  const [activeRegion, setActiveRegion] = useStickyRegion()
  const [isLocaleOpen, setIsLocaleOpen] = useState(false)
  
  // Drawer logic instead of Sidebar
  const [activePanel, setActivePanel] = useState(null)
  
  const updatedAt = snapshot?.snapshot?.created_at ?? null

  if (loading && !snapshot) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', fontFamily: 'var(--mono)', fontSize: '12px',
        letterSpacing: '0.05em', color: 'var(--text3)', background: '#f9fafb'
      }}>
        <div className="loading-indicator">ESTABLISHING DATALINK...</div>
      </div>
    )
  }

  // Extract active countries list for quick flags from entire signal set
  const activeCountries = snapshot?.snapshot?.who_countries || []
  const allSignals = snapshot?.signals || []
  const allCountryCodes = [...new Set(allSignals.map(s => s.country_iso2).filter(Boolean))]
  const rawFlagList = ['GB', 'US', ...allCountryCodes, ...activeCountries]
  const flagList = Array.from(new Set(rawFlagList.map(c => getIsoCode(c)).filter(Boolean)))
    .sort((a, b) => getCountryName(a).localeCompare(getCountryName(b)))
  
  // Dynamic contextual news for sidebar
  const regionalSignals = allSignals.filter(s => s.country_iso2 === activeRegion).slice(0, 20)


  const handleTabToggle = (panel) => {
    setActivePanel(current => current === panel ? null : panel)
  }

  const openSignalArticle = (signal) => {
    if (!signal?.url) return
    const shouldTranslate = signal.language && signal.language !== 'en'
    const target = shouldTranslate
      ? `https://translate.google.com/translate?sl=auto&tl=en&u=${encodeURIComponent(signal.url)}`
      : signal.url
    const opened = window.open(target, '_blank')
    if (opened) {
      opened.opener = null
      return
    }
    window.location.href = target
  }

  return (
    <div className="dash-viewport-root">
      <DeltaBanner delta={delta} />

      <header className="dash-head">
        <SiteHeader updatedAt={updatedAt} snapshot={snapshot} />
        
        {/* Clickable Interactive Region Switcher */}
        <button 
          onClick={() => setIsLocaleOpen(!isLocaleOpen)}
          className="locale-toggle hover-bright"
          title="Click to expand all regions"
        >
          <img 
            src={getCountryFlag(activeRegion)} 
            alt="" 
            style={{width:'20px', height:'14px', borderRadius:'2px', objectFit:'cover'}} 
          />
          <span style={{fontFamily:'var(--mono)', fontSize:'11px', fontWeight:700, color:'var(--text)', textTransform:'uppercase'}}>
            LOCALE: {getCountryName(activeRegion)}
          </span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{transform: isLocaleOpen ? 'rotate(180deg)' : 'none', transition:'transform 0.3s'}}>
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>
      </header>

      {/* Main Content Flow Area (Dynamic Flex Pushing) */}
      <div className="dash-main-flow">
        
        {/* Contextual Right Side Intelligence Drawer (User Recommended) */}
        {isLocaleOpen && (
        <aside className="right-region-panel">
          <div className="panel-hd">
            <h3>
              <img src={getCountryFlag(activeRegion)} width="16" style={{borderRadius:'2px', border:'1px solid #e5e7eb'}} alt=""/>
              {getCountryName(activeRegion)} INTELLIGENCE
            </h3>
            <button className="panel-close" onClick={() => setIsLocaleOpen(false)}>&times;</button>
          </div>
          <div className="panel-body" style={{ padding: '16px' }}>
            {/* Data Summary Header Card */}
            <div style={{
              background:'var(--bg2)', borderRadius:'12px', border:'1px solid var(--border)', 
              padding:'16px', marginBottom:'20px', 
              display:'flex', flexDirection:'column', gap:'8px'
            }}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
                 <span style={{fontSize:'11px', color:'var(--text3)', fontWeight:600}}>Status Profile</span>
                 <span style={{fontSize:'10px', background:'var(--bg)', color:'var(--accent)', padding:'2px 6px', borderRadius:'10px', border:'1px solid var(--border)'}}>
                   {activeRegion}
                 </span>
              </div>
              
              <div style={{fontSize:'20px', fontWeight:800, color:'var(--text)', letterSpacing:'-0.5px', display:'flex', alignItems:'center', gap:'8px'}}>
                <img src={getCountryFlag(activeRegion)} width="24" style={{borderRadius:'4px', boxShadow:'0 2px 4px rgba(0,0,0,0.1)'}} alt=""/>
                {getCountryName(activeRegion)}
              </div>

              <div style={{margin:'8px 0', borderTop:'1px solid var(--border)'}}></div>

              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
                 <div>
                   <div style={{fontSize:'10px', color:'var(--text3)', textTransform:'uppercase'}}>Indexed Data</div>
                   <div style={{fontSize:'18px', fontWeight:700, color:'var(--text)'}}>{regionalSignals.length}</div>
                 </div>
                 <div>
                   <div style={{fontSize:'10px', color:'var(--text3)', textTransform:'uppercase'}}>Verified Risk</div>
                   <div style={{fontSize:'14px', fontWeight:800, color: activeCountries.some(c => c.toLowerCase() === getCountryName(activeRegion).toLowerCase()) ? '#f97316' : '#0ea5e9', marginTop:'3px'}}>
                     {activeCountries.some(c => c.toLowerCase() === getCountryName(activeRegion).toLowerCase()) ? "🟠 HIGH (WHO)" : "🔵 LOW / MONITOR"}
                   </div>
                 </div>
              </div>
            </div>

            {/* Partitioned Telemetry Flow */}
            {(() => {
              const tier1 = regionalSignals.filter(s => s.tier === 1);
              const others = regionalSignals.filter(s => s.tier !== 1);

              return (
                <>
                  <div style={{marginBottom:'24px'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'6px', marginBottom:'12px'}}>
                      <div style={{width:'8px', height:'8px', background:'#f97316', borderRadius:'50%'}}></div>
                      <span style={{fontSize:'11px', fontWeight:800, color:'var(--text)', letterSpacing:'0.05em'}}>OFFICIAL REPORTS ({tier1.length})</span>
                      <span style={{fontSize:'10px', color:'var(--text3)'}}>Validated sources</span>
                    </div>
                    
                    {tier1.length === 0 ? (
                      <div style={{color:'var(--text3)', fontSize:'11px', fontStyle:'italic', padding:'16px', background:'var(--bg2)', border:'1px dashed var(--border)', textAlign:'center', borderRadius:'8px'}}>
                        No official updates.
                      </div>
                    ) : (
                      tier1.map((s, i) => (
                        <button key={`t1-${i}`} onClick={() => openSignalArticle(s)} style={{
                          display:'block', width:'100%', textAlign:'left', cursor:'pointer', fontFamily:'inherit', padding:'12px', borderRadius:'8px', 
                          background:'rgba(249, 115, 22, 0.05)', border:'1px solid rgba(249, 115, 22, 0.2)', marginBottom:'8px'
                        }}>
                           <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px'}}>
                             <span style={{fontSize:'9px', fontWeight:800, color:'#f97316', background:'rgba(249, 115, 22, 0.1)', padding:'2px 5px', borderRadius:'3px'}}>
                               PRIMARY SOURCE
                             </span>
                             {s.published_at && <span style={{fontSize:'9px', color:'var(--text3)'}}>{new Date(s.published_at).toLocaleDateString()}</span>}
                           </div>
                           <div style={{fontSize:'12px', fontWeight:700, color: 'var(--text)', lineHeight:1.4}}>
                             {s.title}
                           </div>
                        </button>
                      ))
                    )}
                  </div>

                  <div>
                    <div style={{display:'flex', alignItems:'center', gap:'6px', marginBottom:'12px'}}>
                      <div style={{width:'8px', height:'8px', background:'#0ea5e9', borderRadius:'50%'}}></div>
                      <span style={{fontSize:'11px', fontWeight:800, color:'var(--text)', letterSpacing:'0.05em'}}>RECENT NEWS ({others.length})</span>
                      <span style={{fontSize:'10px', color:'var(--text3)'}}>Surveillance feed</span>
                    </div>
                    
                    {others.length === 0 ? (
                      <div style={{color:'var(--text3)', fontSize:'11px', fontStyle:'italic', padding:'16px', textAlign:'center'}}>
                        No recent news.
                      </div>
                    ) : (
                      others.map((s, i) => {
                         const isNew = s.published_at && ((new Date() - new Date(s.published_at))/(1000*60*60) <= 72);
                         return (
                          <button key={`o-${i}`} onClick={() => openSignalArticle(s)} style={{
                            display:'block', width:'100%', textAlign:'left', cursor:'pointer', fontFamily:'inherit', padding:'12px', borderRadius:'8px', 
                            background:'var(--bg3)', border: isNew ? '1px solid rgba(2, 132, 199, 0.3)' : '1px solid var(--border)', marginBottom:'8px'
                          }}>
                             <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px'}}>
                               <span style={{fontSize:'9px', fontWeight:800, color: isNew ? '#0284c7' : 'var(--text2)', background: isNew ? 'rgba(2, 132, 199, 0.1)' : 'var(--bg2)', padding:'2px 5px', borderRadius:'3px', textTransform:'uppercase'}}>
                                 {isNew ? '🔥 NEW SIGNAL' : (s.source || 'NEWS').split('/')[0].replace(/^https?:\/\/(www\.)?/, '').split('.')[0].toUpperCase()}
                               </span>
                               {s.published_at && <span style={{fontSize:'9px', color:'var(--text3)'}}>{new Date(s.published_at).toLocaleDateString()}</span>}
                             </div>
                             <div style={{fontSize:'12px', fontWeight:500, color: 'var(--text)', lineHeight:1.4}}>
                               {s.title}
                             </div>
                          </button>
                         )
                      })
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </aside>
      )}

        <main 
          className="dash-view-content" 
        >
        {/* Central Canvas takes full viewport */}
        <DashboardViewport 
          whoCountries={activeCountries} 
          signals={snapshot?.signals || []}
          onRegionClick={(cc) => { setActiveRegion(cc); setIsLocaleOpen(true); }} 
        />

        {/* Overlay Panel Drawer System */}
        {activePanel && (
          <div className="bottom-drawer">
            <div className="drawer-hd">
              <h3 className="drawer-title">{activePanel} Viewer</h3>
              <button className="drawer-close" onClick={() => setActivePanel(null)}>&times;</button>
            </div>
            <div className="drawer-body">
              {activePanel === 'SIGNALS' && (
                 <>
                   <MiniHero snapshot={snapshot} />
                   <SignalFeed signals={snapshot?.signals} onArticleClick={openSignalArticle} />
                 </>
              )}
              {activePanel === 'INTELLIGENCE' && <InfoAccordion />}
              {activePanel === 'SOURCES' && <SourcesPanel />}
              {activePanel === 'DISCLAIMER' && <FullDisclaimer />}
            </div>
          </div>
        )}

        {/* Floating Controller Complex */}
        <div className="bottom-controls">
          {/* Mirror Top Tab Layout Strategy for lower boundary */}
          <div className="bottom-tabs-container">
            <button 
              className={`bottom-tab ${activePanel === 'SIGNALS' ? 'is-active' : ''}`}
              onClick={() => handleTabToggle('SIGNALS')}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 12h5l2 9 4-18 3 9h6"/>
              </svg>
              Live Signals
            </button>
            <button 
              className={`bottom-tab ${activePanel === 'INTELLIGENCE' ? 'is-active' : ''}`}
              onClick={() => handleTabToggle('INTELLIGENCE')}
            >
              Intelligence
            </button>
            <button 
              className={`bottom-tab ${activePanel === 'SOURCES' ? 'is-active' : ''}`}
              onClick={() => handleTabToggle('SOURCES')}
            >
              Data Assets
            </button>
            <button 
              className={`bottom-tab ${activePanel === 'DISCLAIMER' ? 'is-active' : ''}`}
              onClick={() => handleTabToggle('DISCLAIMER')}
            >
              Legal
            </button>
          </div>
        </div>
        </main>
      </div>

      {/* Sub-Map System Stack */}
      <DisclaimerBar />
      <TickerFooter signals={snapshot?.signals} />

    </div>
  )
}
