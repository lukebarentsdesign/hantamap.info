import { useState, useEffect }    from 'react'
import { useSnapshot }    from './hooks/useSnapshot'
import { useStickyRegion } from './hooks/useStickyRegion'
import { getCountryFlag, REGIONS_MAP } from './components/flagUtils'
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
import AdminPortal        from './components/AdminPortal'

export default function App() {
  const { snapshot, delta, loading } = useSnapshot()
  const [activeRegion, setActiveRegion] = useStickyRegion()
  const [isAdminOpen, setIsAdminOpen] = useState(false)
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
  const flagList = Array.from(new Set(['GB', 'US', ...allCountryCodes, ...activeCountries]))
    .sort((a, b) => (REGIONS_MAP[a] || a).localeCompare(REGIONS_MAP[b] || b))
  
  // Dynamic contextual news for sidebar
  const regionalSignals = allSignals.filter(s => s.country_iso2 === activeRegion).slice(0, 20)


  const handleTabToggle = (panel) => {
    setActivePanel(current => current === panel ? null : panel)
  }

  return (
    <div className="dash-viewport-root">
      <DeltaBanner delta={delta} />

      <header className="dash-head">
        <SiteHeader updatedAt={updatedAt} snapshot={snapshot} />
        
        {/* Clickable Interactive Region Switcher */}
        <button 
          onClick={() => setIsLocaleOpen(!isLocaleOpen)}
          style={{ 
            marginLeft:'auto', marginRight:'20px', display:'flex', 
            alignItems:'center', gap:'8px', background:'var(--bg2)', 
            padding:'6px 14px', borderRadius:'20px', border:'1px solid var(--border)',
            cursor:'pointer', transition:'all 0.2s'
          }}
          className="hover-bright"
          title="Click to expand all regions"
        >
          <img 
            src={getCountryFlag(activeRegion)} 
            alt="" 
            style={{width:'20px', height:'14px', borderRadius:'2px', objectFit:'cover'}} 
          />
          <span style={{fontFamily:'var(--mono)', fontSize:'11px', fontWeight:700, color:'var(--text)', textTransform:'uppercase'}}>
            LOCALE: {activeRegion}
          </span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{transform: isLocaleOpen ? 'rotate(180deg)' : 'none', transition:'transform 0.3s'}}>
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>
      </header>

      {/* Contextual Right Side Intelligence Drawer (User Recommended) */}
      {isLocaleOpen && (
        <aside className="right-region-panel">
          <div className="panel-hd">
            <h3>
              <img src={getCountryFlag(activeRegion)} width="16" style={{borderRadius:'2px', border:'1px solid #e5e7eb'}} alt=""/>
              {REGIONS_MAP[activeRegion] || activeRegion} INTELLIGENCE
            </h3>
            <button className="panel-close" onClick={() => setIsLocaleOpen(false)}>&times;</button>
          </div>
          <div className="panel-body">
            <span className="panel-subhead">GEO SELECTION</span>
            <div className="mini-grid-flags">
               {flagList.map(cc => (
                 <button 
                   key={cc}
                   onClick={() => setActiveRegion(cc)}
                   title={REGIONS_MAP[cc] || cc}
                   style={{
                     display:'flex', alignItems:'center', gap:'6px', padding:'6px 8px',
                     background: activeRegion === cc ? 'var(--text)' : 'white',
                     color: activeRegion === cc ? 'white' : 'var(--text)',
                     border: '1px solid var(--border)', borderRadius:'6px', cursor:'pointer',
                     fontSize:'11px', fontWeight:700, transition:'all 0.1s'
                   }}
                 >
                   <img src={getCountryFlag(cc)} alt="" style={{width:'16px', height:'11px', objectFit:'cover'}}/>
                   <span>{cc}</span>
                 </button>
               ))}
            </div>
            
            <span className="panel-subhead">REGIONAL TELEMETRY ({regionalSignals.length})</span>
            <div className="regional-signals-list">
               {regionalSignals.length === 0 ? (
                 <div style={{color:'#9ca3af', fontSize:'11px', fontStyle:'italic', padding:'10px', border:'1px dashed var(--border)', textAlign:'center', borderRadius:'6px'}}>
                   No active signals indexed for this territory.
                 </div>
               ) : regionalSignals.map((s, i) => (
                 <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" style={{
                   display:'block', textDecoration:'none', padding:'12px', borderRadius:'8px', 
                   background:'white', border:'1px solid var(--border)', boxShadow:'0 1px 2px rgba(0,0,0,0.03)'
                 }}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px'}}>
                      <span style={{fontSize:'9px', fontWeight:800, color:'#2563eb', background:'rgba(37, 99, 235, 0.08)', padding:'2px 5px', borderRadius:'3px', textTransform:'uppercase'}}>
                        {(s.source || "NEWS").split('/')[0].replace('https://', '').replace('http://', '').replace('www.', '').toUpperCase()}
                      </span>
                      {s.published_at && <span style={{fontSize:'9px', color:'#9ca3af'}}>{new Date(s.published_at).toLocaleDateString()}</span>}
                    </div>
                    <div style={{fontSize:'12px', fontWeight:600, color: 'var(--text)', lineHeight:1.4}}>
                      {s.title}
                    </div>
                 </a>
               ))}
            </div>
          </div>
        </aside>
      )}

      <main className="dash-view-content">
        {/* Central Canvas takes full viewport */}
        <DashboardViewport 
          whoCountries={activeCountries} 
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
                   <SignalFeed signals={snapshot?.signals} />
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

      {/* Sub-Map System Stack */}
      <DisclaimerBar />
      <TickerFooter signals={snapshot?.signals} />


      {/* System Bypass Overlay Trigger */}
      <button 
        onClick={() => setIsAdminOpen(true)}
        style={{
          position:'fixed', bottom:'40px', right:'15px', 
          background:'rgba(255,255,255,0.9)', border:'1px solid #cbd5e1',
          borderRadius:'50%', width:'36px', height:'36px', cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          zIndex: 2000, opacity: 0.7
        }}
        title="Launch Overwatch Admin"
      >
         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.5">
           <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
         </svg>
      </button>

      <AdminPortal 
        isOpen={isAdminOpen} 
        onClose={() => setIsAdminOpen(false)} 
        onSave={() => window.location.reload()}
      />
    </div>
  )
}
