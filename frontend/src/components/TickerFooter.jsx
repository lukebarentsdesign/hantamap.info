const CORE_SOURCES = [
  {
    label: 'WHO DON',
    type: 'Official outbreak notices',
    url: 'https://www.who.int/emergencies/disease-outbreak-news'
  },
  {
    label: 'Integrated Hondius dossier',
    type: 'Cases, route, docking, flights',
    url: 'https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON600'
  },
  {
    label: 'CDC / ECDC',
    type: 'Clinical and regional guidance',
    url: 'https://www.cdc.gov/hantavirus/'
  },
  {
    label: 'Hantavirus media scan',
    type: 'Filtered AP/BBC/DW/GDELT signals',
    url: 'https://news.google.com/search?q=MV%20Hondius%20hantavirus'
  },
  {
    label: 'Translated virus RSS',
    type: 'Non-English hantavirus items translated',
    url: 'https://news.google.com/search?q=hantavirus%20OR%20%22Andes%20virus%22'
  }
]

export function TickerFooter({ signals }) {
  const count = signals?.length || 0

  return (
    <footer className="source-footer" aria-label="Data provenance">
      <div className="source-footer-label">
        Sources
        <span>{count ? `${count} live signals indexed` : 'waiting for ingest'}</span>
      </div>
      <div className="source-footer-list">
        {CORE_SOURCES.map((source) => (
          <a
            key={source.label}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="source-footer-item"
          >
            <strong>{source.label}</strong>
            <span>{source.type}</span>
          </a>
        ))}
      </div>
    </footer>
  )
}
