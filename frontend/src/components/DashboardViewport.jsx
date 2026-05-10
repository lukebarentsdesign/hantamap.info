import { useState } from 'react'
import { WorldMap } from './WorldMap'
import TransmissionGraph from './TransmissionGraph'
import { MvHondiusIntel } from './MvHondiusIntel'
import { MvHondiusAnalytics } from './MvHondiusAnalytics'

export function DashboardViewport({ whoCountries, signals, onRegionClick }) {
  const [activeTab, setActiveTab] = useState('hondius')

  return (
    <div className="dash-viewport-root">
      <div className="dash-tabs-hd">
        <button
          onClick={() => setActiveTab('map')}
          className={`dash-tab ${activeTab === 'map' ? 'is-active' : ''}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          <span>SITUATION MAP</span>
        </button>
        <button
          onClick={() => setActiveTab('hondius')}
          className={`dash-tab ${activeTab === 'hondius' ? 'is-active' : ''}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M3 19h18"/><path d="M5 17l2-8h10l2 8"/><path d="M8 9V5h8v4"/>
          </svg>
          <span>MV HONDIUS</span>
          <span className="tab-badge">LIVE</span>
        </button>
        <button
          onClick={() => setActiveTab('network')}
          className={`dash-tab ${activeTab === 'network' ? 'is-active' : ''}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M5 12l5 5L20 7"/><circle cx="12" cy="12" r="8" strokeOpacity="0.3"/>
          </svg>
          <span>TRANSMISSION CHAINS</span>
          <span className="tab-badge">BETA</span>
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`dash-tab ${activeTab === 'analytics' ? 'is-active' : ''}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
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

        {activeTab === 'hondius' && (
          <div style={{height:'100%', width:'100%', overflowY:'auto', animation: 'fadeIn 0.2s ease'}}>
            <MvHondiusIntel />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div style={{height:'100%', width:'100%', overflowY:'auto', animation: 'fadeIn 0.2s ease'}}>
            <MvHondiusAnalytics />
          </div>
        )}
      </div>
    </div>
  )
}
