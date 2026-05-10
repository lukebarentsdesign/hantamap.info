export function SiteFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="site-footer" aria-label="Site footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <span className="footer-brand-dot" aria-hidden="true" />
              <span className="footer-brand-name">Hantavirus Tracker</span>
            </div>
            <p className="footer-about">
              An independent real-time public health information service.
              Data aggregated from WHO, ECDC, ProMED, GDELT and 20+
              regional news feeds across 12 languages, updated every
              15 minutes. Built and operated in the United Kingdom.
            </p>
          </div>

          <div>
            <p className="footer-links-title">Official sources</p>
            <nav className="footer-links"
                 aria-label="Official public health sources">
              <a href="https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON599"
                 target="_blank" rel="noopener noreferrer">
                WHO Disease Outbreak News DON599 ↗
              </a>
              <a href="https://www.who.int/news-room/fact-sheets/detail/hantavirus-and-hantavirus-disease"
                 target="_blank" rel="noopener noreferrer">
                WHO Hantavirus Fact Sheet ↗
              </a>
              <a href="https://www.ecdc.europa.eu/en/hantavirus-infection"
                 target="_blank" rel="noopener noreferrer">
                ECDC Hantavirus guidance ↗
              </a>
              <a href="https://www.cdc.gov/hantavirus"
                 target="_blank" rel="noopener noreferrer">
                CDC Hantavirus ↗
              </a>
              <a href="https://www.nhs.uk/conditions/hantavirus/"
                 target="_blank" rel="noopener noreferrer">
                NHS Hantavirus ↗
              </a>
            </nav>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-legal">
            © {year} Hantavirus Tracker. Independent public health
            information service. Not affiliated with WHO, ECDC, CDC or NHS.
            Not medical advice. Confirmed case data sourced from WHO Disease
            Outbreak News. News signal data partially sourced from{' '}
            <a href="https://hantaflow.com" target="_blank"
               rel="noopener noreferrer">Hantaflow.com</a>{' '}
            (CC BY 4.0). Map tiles © CartoDB, data © OpenStreetMap
            contributors. Operated from the United Kingdom.
          </p>
          <span className="footer-v" aria-label="Version 1.0">v1.0</span>
        </div>
      </div>
    </footer>
  )
}
