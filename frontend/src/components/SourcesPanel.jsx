import React from 'react';

const INTEL_HIERARCHY = [
  {
    tier: 'A',
    title: 'Official Structured Surveillance',
    subtitle: 'Machine-readable datasets suitable for confirmed-count workflows',
    color: '#f97316',
    items: [
      { name: 'CDC NNDSS JSON', url: 'https://data.cdc.gov/api/views/tfcp-ufzp/rows.json?accessType=DOWNLOAD', desc: 'U.S. notifiable disease surveillance download endpoint.' },
      { name: 'CDC NNDSS CSV', url: 'https://data.cdc.gov/api/views/tfcp-ufzp/rows.csv?accessType=DOWNLOAD', desc: 'CSV companion for U.S. structured surveillance.' },
      { name: 'Taiwan CDC Open Data', url: 'https://data.cdc.gov.tw/en/dataset/?organization=eic&tags=hantavirus-pulmonary-syndrome', desc: 'National open-data tables for hantavirus surveillance.' },
      { name: 'Taiwan Weekly Dataset', url: 'https://data.gov.tw/dataset/9877', desc: 'Weekly open dataset for automated checks.' },
      { name: 'Taiwan Monthly Dataset', url: 'https://data.gov.tw/dataset/8895', desc: 'Monthly open dataset for longer trend validation.' },
      { name: 'ECDC Atlas', url: 'https://atlas.ecdc.europa.eu/', desc: 'European infectious-disease export and surveillance gateway.' },
      { name: 'WHO GHO OData', url: 'https://www.who.int/data/gho/info/gho-odata-api', desc: 'WHO statistical API reference for broader validation.' },
      { name: 'WHO Athena API', url: 'https://www.who.int/data/gho/info/athena-api', desc: 'WHO API reference for health-indicator querying.' },
    ]
  },
  {
    tier: 'B',
    title: 'Official Bulletins and Reports',
    subtitle: 'Authoritative pages and PDFs requiring parser validation',
    color: '#f59e0b',
    items: [
      { name: 'Brazil Hantavirose', url: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/h/hantavirose', desc: 'Federal disease reference and entry point.' },
      { name: 'Brazil Epidemiological Situation', url: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/h/hantavirose/situacao-epidemiologica', desc: 'Official national epidemiological situation page.' },
      { name: 'Brazil Confirmed Cases PDF', url: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/h/hantavirose/arquivos/casos-confirmados-de-hantavirose-27-04-2026.pdf/view', desc: 'Confirmed-case audit document cited in the research.' },
      { name: 'Chile Hantavirus Bulletins', url: 'https://epi.minsal.cl/hantavirus-materiales-relacionados/', desc: 'Weekly official bulletin index and related materials.' },
      { name: 'Chile DIPRECE Hanta', url: 'https://diprece.minsal.cl/temas-de-salud/orden-alfabetico/hanta/', desc: 'Official national health-program reference page.' },
      { name: 'Argentina BEN 2026', url: 'https://www.argentina.gob.ar/salud/boletin-epidemiologico-nacional/boletines-2026', desc: 'Weekly federal epidemiological bulletin cycle.' },
      { name: 'Argentina Hantavirus Resource', url: 'https://www.argentina.gob.ar/hantavirus-0', desc: 'National public-health disease resource.' },
      { name: 'Sweden Sorkfeber Stats', url: 'https://www.folkhalsomyndigheten.se/statistik-och-data/hitta-statistik-och-data/sorkfeber-statistik/', desc: 'Official Swedish disease statistics surface.' },
      { name: 'France Hantavirus Data', url: 'https://www.santepubliquefrance.fr/en/hantavirus/data', desc: 'French official disease data pages.' },
      { name: 'Japan IDWR Table', url: 'https://idsc.niid.go.jp/idwr/ydata/report-Ea.html', desc: 'Japanese infectious-disease weekly report table.' },
      { name: 'Korea Stats Portal', url: 'https://www.kdca.go.kr/kdca/2877/subview.do', desc: 'KDCA public statistics portal.' },
      { name: 'Russia Federal Surveillance', url: 'https://www.rospotrebnadzor.ru/deyatelnost/epidemiological-surveillance/?ELEMENT_ID=31823', desc: 'Federal Rospotrebnadzor surveillance page.' },
    ]
  },
  {
    tier: 'C',
    title: 'Official Notices and Risk Context',
    subtitle: 'Narrative authority for cross-border events, vessels, and guidance',
    color: '#3b82f6',
    items: [
      { name: 'WHO Disease Outbreak News', url: 'https://www.who.int/emergencies/disease-outbreak-news', desc: 'Primary global cross-border outbreak notice layer.' },
      { name: 'WHO DON API Docs', url: 'https://www.who.int/api/news/diseaseoutbreaknews/sfhelp', desc: 'Developer reference for Disease Outbreak News ingestion.' },
      { name: 'ECDC Hantavirus Topic', url: 'https://www.ecdc.europa.eu/en/hantavirus-infection', desc: 'European disease guidance and surveillance context.' },
      { name: 'ECDC Current Outbreak Page', url: 'https://www.ecdc.europa.eu/en/infectious-disease-topics/hantavirus-infection/surveillance-and-updates/andes-hantavirus-outbreak', desc: 'Dedicated outbreak context page for Andes hantavirus.' },
      { name: 'UKHSA Feed', url: 'https://ukhsa.blog.gov.uk/feed/', desc: 'UK public-health updates and outbreak explainers.' },
      { name: 'Germany RKI Hantavirus', url: 'https://www.rki.de/DE/Themen/Infektionskrankheiten/Infektionskrankheiten-A-Z/H/Hantavirus/hantavirus-node.html', desc: 'German federal public-health reference page.' },
      { name: 'Germany RKI Ship Update', url: 'https://www.rki.de/DE/Themen/Infektionskrankheiten/Infektionskrankheiten-A-Z/H/Hantavirus/Hanta_Kreuzfahrtschiff_2026.html', desc: 'Cruise-ship event update page cited by the dossier.' },
      { name: 'Canada Hantaviruses', url: 'https://www.canada.ca/en/public-health/services/diseases/hantaviruses.html', desc: 'Canadian federal disease reference.' },
      { name: 'Canada Surveillance', url: 'https://www.canada.ca/en/public-health/services/diseases/hantaviruses/surveillance-hantavirus-related-diseases.html', desc: 'Canadian hantavirus-related disease surveillance page.' },
      { name: 'Australia Health RSS', url: 'https://www.health.gov.au/using-our-websites/subscriptions/using-our-latest-news-rss-feed', desc: 'Australian department RSS discovery.' },
      { name: 'India IDSP Archive', url: 'https://www.idsp.mohfw.gov.in/index1.php?lang=1&level=2&lid=3841&sublinkid=5901', desc: 'Indian integrated disease surveillance alert archive.' },
    ]
  },
  {
    tier: 'D',
    title: 'Trusted Media and Wire Signals',
    subtitle: 'Fast discovery layer; not used as confirmed case authority',
    color: '#64748b',
    items: [
      { name: 'BBC Top UK', url: 'http://newsrss.bbc.co.uk/rss/newsonline_uk_edition/front_page/rss.xml', desc: 'BBC public RSS discovery feed.' },
      { name: 'Associated Press', url: 'https://apnews.com/index.rss', desc: 'Global newswire signal feed.' },
      { name: 'Deutsche Welle World', url: 'https://rss.dw.com/rdf/rss-en-world', desc: 'International public broadcaster signal feed.' },
      { name: 'DW Top Stories', url: 'https://rss.dw.com/rdf/rss-en-top', desc: 'High-level global news signal feed.' },
      { name: 'Reuters RSS Notes', url: 'https://liaison.reuters.com/page/rss-feeds-tech-notes', desc: 'Reuters RSS documentation; treated as licensed/client workflow.' },
      { name: 'GDELT Hantavirus', url: 'https://api.gdeltproject.org/api/v2/doc/doc?query=hantavirus&mode=artlist&format=rss', desc: 'Machine-scale global media monitoring.' },
      { name: 'ProMED', url: 'https://promedmail.org/feed/', desc: 'Surveillance-oriented event discovery network.' },
    ]
  },
  {
    tier: 'E',
    title: 'Google News Scan Templates',
    subtitle: 'Hourly anomaly discovery awaiting official confirmation',
    color: '#94a3b8',
    items: [
      { name: 'Global Hantavirus Scan', url: 'https://news.google.com/rss/search?q=(hantavirus+OR+%22andes+virus%22+OR+hantavirose+OR+hantavirosis)&hl=en-GB&gl=GB&ceid=GB:en', desc: 'Broad multilingual disease-term discovery.' },
      { name: 'Europe Scan', url: 'https://news.google.com/rss/search?q=(hantavirus+OR+%22andes+virus%22)+Europe&hl=en-GB&gl=GB&ceid=GB:en', desc: 'European regional signal filter.' },
      { name: 'North America Scan', url: 'https://news.google.com/rss/search?q=(hantavirus+OR+%22andes+virus%22)+(%22United+States%22+OR+Canada+OR+Mexico)&hl=en-US&gl=US&ceid=US:en', desc: 'United States, Canada, and Mexico lead discovery.' },
      { name: 'South America Scan', url: 'https://news.google.com/rss/search?q=(hantavirus+OR+%22virus+hanta%22+OR+hantavirosis+OR+hantavirose)+(%22South+America%22+OR+Argentina+OR+Chile+OR+Brazil)&hl=es-419&gl=AR&ceid=AR:es-419', desc: 'Spanish and Portuguese regional signal enrichment.' },
      { name: 'Asia HFRS Scan', url: 'https://news.google.com/rss/search?q=(hantavirus+OR+%22hemorrhagic+fever+with+renal+syndrome%22+OR+HFRS)+(Asia+OR+Japan+OR+Korea+OR+Taiwan+OR+India)&hl=en-US&gl=US&ceid=US:en', desc: 'Asia and HFRS-oriented discovery.' },
      { name: 'Australia/Oceania Scan', url: 'https://news.google.com/rss/search?q=(hantavirus+OR+%22andes+virus%22)+(Australia+OR+Oceania)&hl=en-AU&gl=AU&ceid=AU:en', desc: 'Oceania-specific monitoring.' },
      { name: 'Vessel/Cruise Scan', url: 'https://news.google.com/rss/search?q=(hantavirus+OR+%22andes+virus%22)+(%22MV+Hondius%22+OR+Tenerife+OR+%22Canary+Islands%22+OR+%22cruise+ship%22)&hl=en-GB&gl=GB&ceid=GB:en', desc: 'Targeted scan for vessel-linked reporting.' },
    ]
  }
];

const CONTRACT = [
  'Tier A and validated Tier B sources can support confirmed-count workflows.',
  'Tier C provides official context, timelines, and public-health advice.',
  'Tiers D and E create signal-only leads until an official source confirms them.'
];

export function SourcesPanel() {
  return (
    <section style={{ padding: '24px 0', maxWidth: '1100px', margin: '0 auto' }}>
      <header style={{ marginBottom: '28px', textAlign: 'center' }}>
        <div style={{
          display:'inline-flex', alignItems:'center', gap:'8px',
          padding:'6px 12px', background:'var(--bg2)', borderRadius:'20px',
          fontSize:'12px', fontWeight:700, letterSpacing:'0.05em', color:'var(--text3)',
          border:'1px solid var(--border)', marginBottom:'16px'
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          INTELLIGENCE ASSET DIRECTORY
        </div>
        <h2 style={{ fontSize: '28px', color: 'var(--text)', marginBottom: '12px' }}>
          Verified Hierarchy of Truth
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text3)', maxWidth: '680px', margin: '0 auto', lineHeight: 1.6 }}>
          Research from the dossier is organized into a conservative evidence ladder. The tracker separates official counts, official risk context, and unverified signal discovery.
        </p>
      </header>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '1px',
        border: '1px solid var(--border)',
        background: 'var(--border)',
        marginBottom: '28px'
      }}>
        {CONTRACT.map((rule, index) => (
          <div key={rule} style={{ background: 'var(--bg2)', padding: '14px 16px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--accent)', marginBottom: '6px' }}>
              RULE {index + 1}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text2)', lineHeight: 1.55, margin: 0 }}>
              {rule}
            </p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {INTEL_HIERARCHY.map((tier) => (
          <div key={tier.tier} style={{
            background: 'var(--bg3)',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '16px 20px',
              background: 'rgba(255,255,255,0.65)',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: '14px'
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '8px',
                background: `${tier.color}20`, color: tier.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '19px', fontWeight: 800, border: `1px solid ${tier.color}40`,
                flexShrink: 0
              }}>
                {tier.tier}
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text)', marginBottom: '2px' }}>
                  {tier.title}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text3)', margin: 0 }}>{tier.subtitle}</p>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '1px',
              background: 'var(--border)'
            }}>
              {tier.items.map((item) => (
                <a
                  key={`${tier.tier}-${item.name}`}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="source-tile-hover"
                  style={{
                    display: 'block',
                    padding: '16px 18px',
                    background: 'var(--bg)',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    minHeight: '104px'
                  }}
                >
                  <div style={{
                    fontSize: '13px', fontWeight: 700, color: 'var(--text)',
                    marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px'
                  }}>
                    {item.name}
                    <svg className="ext-ico" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ opacity: 0.4, flexShrink: 0 }} aria-hidden="true">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                    </svg>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text3)', lineHeight: 1.45 }}>
                    {item.desc}
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
