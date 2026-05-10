import os
FILE = r'c:\Users\Studio\Documents\Antigravity\Hantamap.info\frontend\src\index.css'
ADDITION = """
/* Visual Marker Polish - Pulsing effect for WHO Confirmed areas */
.pulse-marker {
  transform-origin: center;
  animation: leaflet-pulse 2s ease-out infinite;
}

@keyframes leaflet-pulse {
  0% {
    stroke-width: 1.5px;
    fill-opacity: 0.6;
  }
  50% {
    stroke-width: 4px;
    fill-opacity: 0.85;
  }
  100% {
    stroke-width: 1.5px;
    fill-opacity: 0.6;
  }
}

/* Advanced tooltip aesthetic polish */
.custom-map-tooltip.leaflet-tooltip {
  background: white;
  border: none;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.15);
  padding: 10px 12px;
}
.custom-map-tooltip.leaflet-tooltip::before {
  border-top-color: white;
}
"""
with open(FILE, 'a', encoding='utf-8') as f:
    f.write(ADDITION)
print("Appended CSS successfully")
