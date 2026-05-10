import { useState } from 'react'
import { WorldMap } from './WorldMap'
import TransmissionGraph from './TransmissionGraph'

export function DashboardViewport({ whoCountries, signals, onRegionClick }) {
  const [activeTab, setActiveTab] = useState('map')

  return (
    <div className="dash-viewport-root">
      {/* Visual Richness: Analytical Tab Header */}
      <div className="dash-tabs-hd">
        <button 
          onClick={() => setActiveTab('map')} 
          className={`dash-tab ${activeTab === 'map' ? 'is-active' : ''}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          <span>SITUATION MAP</span>
        </button>
        <button 
          onClick={() => setActiveTab('network')} 
          className={`dash-tab ${activeTab === 'network' ? 'is-active' : ''}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12l5 5L20 7"/><circle cx="12" cy="12" r="8" strokeOpacity="0.3"/>
          </svg>
          <span>TRANSMISSION CHAINS</span>
          <span className="tab-badge">BETA</span>
        </button>
        <button 
          onClick={() => setActiveTab('analytics')} 
          className={`dash-tab ${activeTab === 'analytics' ? 'is-active' : ''}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          <span>ANALYTICS</span>
        </button>
      </div>

      <div className="dash-view-content">
        {activeTab === 'map' && (
          <div style={{height:'100%', width:'100%', animation: 'fadeIn 0.2s ease'}}>
            <WorldMap whoCountries={whoCountries} signals={signals} isDashboard={true} onRegionClick={onRegionClick} />
          </div>
        )}
        
        {activeTab === 'network' && (
          <div style={{height:'100%', width:'100%', animation: 'fadeIn 0.2s ease'}}>
             <TransmissionGraph />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="intel-placeholder" style={{animation: 'fadeIn 0.2s ease'}}>
             <div className="intel-icon">📊</div>
             <h3>Epidemiological Metrics</h3>
             <p>Regional case distribution and signal-to-outbreak probability weighting.</p>
             <div className="loading-text">CONSTRUCTING DATASETS...</div>
          </div>
        )}
      </div>
    </div>
  )
}
