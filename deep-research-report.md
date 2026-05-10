# Hantavirus source architecture for a factual tracking map

## What the evidence says

The most important finding is that there is **not** a single clean public endpoint you can treat as “the WHO global hantavirus counter”. entity["organization","World Health Organization","United Nations specialized agency"] publishes a hantavirus fact sheet, a Disease Outbreak News hub, developer help for a Disease Outbreak News API, and broader statistical APIs such as GHO OData and Athena. In practice, that means your tracker should use WHO as a **validation and cross-border alert layer**, while building country and regional counts from national surveillance outputs. citeturn0search1turn31view0turn32search7turn32search0turn32search1

The second finding is that the **best official sources are mixed-format**. Some are genuinely machine-friendly, such as the U.S. CDC’s NNDSS JSON/CSV resources, Taiwan CDC open-data datasets, and ECDC’s Atlas export tools. Others are authoritative but less convenient, such as weekly PDFs from Chile, weekly bulletin pages from Argentina, federal PDFs from Brazil, and HTML/PDF pages from Germany, France, Sweden, Korea, Japan, India, Australia, and Russia. That means a robust tracker should support **API/JSON**, **CSV export**, **RSS/Atom**, and **HTML/PDF extraction** as first-class ingestion types. citeturn21search0turn21search2turn22search4turn22search2turn33search0turn47search10turn14search0turn46search0turn42search27turn35search18turn39search8turn34search0turn24search6turn9search3turn48search2turn11search0turn12search15

For a non-alarmist product, the cleanest editorial model is to separate the map into **confirmed official counts**, **official outbreak/risk notices**, and **media or Google News signals awaiting confirmation**. That distinction matches what the source ecosystem actually provides: structured surveillance in some countries, narrative official risk updates in others, and then a wider outer layer of news signals. citeturn21search0turn22search4turn47search12turn28search8turn42search7turn46search3

## Source ranking that keeps the map factual

I would rank incoming data like this.

**Tier A — official structured surveillance** should drive your counts and map state. This includes CDC NNDSS download resources, Taiwan CDC open-data tables, and ECDC Atlas exports. These are the strongest sources for anything you want to label “confirmed”, because they are built as surveillance or open-data products rather than as narrative news. citeturn21search0turn21search2turn22search4turn22search2turn33search0turn47search10

**Tier B — official weekly bulletins, reports, and PDFs** should also feed the map, but with parser confidence checks. Brazil’s Ministry of Health publishes confirmed-case files and epidemiological situation pages; Chile publishes regular hantavirus bulletins and indexed materials; Argentina rolls hantavirus into its weekly Boletín Epidemiológico Nacional; Sweden publishes official statistics pages. These are authoritative, but because many are PDF or bulletin pages, you should store the exact source URL, publication date, and extracted numbers for auditability. citeturn42search16turn42search27turn14search3turn14search0turn46search0turn34search0

**Tier C — official outbreak notices and risk assessments** should not overwrite surveillance counts, but they are critical for cross-border incidents, vessel monitoring, and travel advice. WHO Disease Outbreak News, ECDC outbreak pages, UKHSA posts, Germany’s RKI updates, Sweden’s international outbreak pages, Brazil’s ministry notices, and Argentina’s surveillance news all fit here. Use them to attach context, timelines, and public-health advice to a location or vessel. citeturn31view0turn47search12turn28search8turn35search18turn34search7turn42search7turn46search3

**Tier D — trusted newswires and public broadcasters** should be a separate signal layer, never your counting layer. They are useful because they surface new events faster and more broadly than ministries do, but counts reported there should stay “unverified” until matched to an official source. The safest core list is BBC, AP, DW, and Reuters, with Reuters treated carefully because its official RSS tooling appears geared to licensed/client workflows rather than a simple public consumer feed. citeturn16search4turn17search11turn17search24turn16search13turn16search5

**Tier E — Google News** is excellent for signal detection, clustering, and gap finding, but it should never be your source of truth for confirmed cases or deaths. It is best used to discover that “something is being reported”, after which your system should look for the first corresponding Tier A, B, or C source before promoting the item. citeturn16search3turn21search0turn22search4turn14search0turn46search0

## Official health sources you can ingest

### Global and regional authorities

```text
WHO_FACTSHEET=https://www.who.int/news-room/fact-sheets/detail/hantavirus
WHO_DON_PAGE=https://www.who.int/emergencies/disease-outbreak-news
WHO_DON_API_DOCS=https://www.who.int/api/news/diseaseoutbreaknews/sfhelp
WHO_DON_API=https://www.who.int/api/news/diseaseoutbreaknews
WHO_GHO_ODATA_DOCS=https://www.who.int/data/gho/info/gho-odata-api
WHO_ATHENA_DOCS=https://www.who.int/data/gho/info/athena-api

PAHO_HOME=https://www.paho.org/en

ECDC_HANTAVIRUS=https://www.ecdc.europa.eu/en/hantavirus-infection
ECDC_ATLAS=https://atlas.ecdc.europa.eu/
ECDC_ATLAS_INFO=https://www.ecdc.europa.eu/en/surveillance-atlas-infectious-diseases
ECDC_RSS_INFO=https://www.ecdc.europa.eu/en/rss-feeds
ECDC_CURRENT_OUTBREAK=https://www.ecdc.europa.eu/en/infectious-disease-topics/hantavirus-infection/surveillance-and-updates/andes-hantavirus-outbreak

CDC_HANTAVIRUS=https://www.cdc.gov/hantavirus/about/index.html
CDC_NNDSS_METADATA=https://catalog.data.gov/dataset/nndss-table-1o-hansens-disease-to-hantavirus-pulmonary-syndrome-1eadf
CDC_NNDSS_JSON=https://data.cdc.gov/api/views/tfcp-ufzp/rows.json?accessType=DOWNLOAD
CDC_NNDSS_CSV=https://data.cdc.gov/api/views/tfcp-ufzp/rows.csv?accessType=DOWNLOAD
```

The block above is the most important starting set. WHO gives you the official cross-border framework and outbreak news layer; ECDC gives you EU outbreak updates, RSS discovery, and CSV export capability via the Atlas; CDC gives you both public clinical guidance and a real downloadable surveillance dataset for hantavirus-related notifiable disease reporting. citeturn0search1turn31view0turn32search7turn32search0turn32search1turn6search19turn47search12turn47search10turn47search0turn48search14turn21search0turn21search2

### Europe and the UK

```text
UKHSA_FEED=https://ukhsa.blog.gov.uk/feed/
UKHSA_HANTAVIRUS_POST=https://ukhsa.blog.gov.uk/2026/05/05/what-is-hantavirus-how-is-it-transmitted-and-what-are-the-symptoms/
NHS_ENGLAND_PATHOGEN_LIST=https://www.england.nhs.uk/wp-content/uploads/2022/04/nhs-england-ipc-a-to-z-pathogen-resource-2025-v4.1.xlsm

SWEDEN_STATS=https://www.folkhalsomyndigheten.se/statistik-och-data/hitta-statistik-och-data/sorkfeber-statistik/
SWEDEN_RSS_INFO=https://www.folkhalsomyndigheten.se/nyheter-och-press/prenumerera/rss/
SWEDEN_OUTBREAK_UPDATES=https://www.folkhalsomyndigheten.se/vara-amnesomraden/sjukdomsutbrott/hantavirus-internationellt-maj-2026/

FRANCE_HANTAVIRUS=https://www.santepubliquefrance.fr/en/hantavirus
FRANCE_HANTAVIRUS_DATA=https://www.santepubliquefrance.fr/en/hantavirus/data
FRANCE_RSS_INFO=https://www.santepubliquefrance.fr/en/rss

GERMANY_HANTAVIRUS=https://www.rki.de/DE/Themen/Infektionskrankheiten/Infektionskrankheiten-A-Z/H/Hantavirus/hantavirus-node.html
GERMANY_CURRENT_OUTBREAK=https://www.rki.de/DE/Themen/Infektionskrankheiten/Infektionskrankheiten-A-Z/H/Hantavirus/Hanta_Kreuzfahrtschiff_2026.html
GERMANY_RSS_INFO=https://www.rki.de/DE/Aktuelles/Neuigkeiten-und-Presse/Newsletter-und-RSS-Feeds/RSSFeed_Verweis.html
```

For the UK, the public-health authority you should treat as authoritative for monitoring is entity["organization","UK Health Security Agency","UK government public health agency"] rather than the NHS. NHS material is still useful in your **education layer**, but UKHSA is the stronger surveillance and outbreak-reference source. Sweden is especially valuable because it combines official disease statistics, outbreak updates, and RSS discoverability. France and Germany are authoritative but less API-like, so they fit best into an HTML/PDF and feed-assisted ingestion path. citeturn30view0turn28search8turn41search2turn34search0turn34search1turn34search7turn39search2turn39search8turn39search0turn35search3turn35search18turn37search7

### The Americas

```text
CANADA_HANTAVIRUSES=https://www.canada.ca/en/public-health/services/diseases/hantaviruses.html
CANADA_SURVEILLANCE=https://www.canada.ca/en/public-health/services/diseases/hantaviruses/surveillance-hantavirus-related-diseases.html
CANADA_PHAC_ATOM=https://api.io.canada.ca/io-server/gc/news/en/v2?atomtitle=Public+Health+Agency+of+Canada&dept=publichealthagencyofcanada&format=atom&orderBy=desc&pick=50&publishedDate>=2021-07-23&sort=publishedDate
CANADA_HEALTH_ATOM=https://api.io.canada.ca/io-server/gc/news/en/v2?atomtitle=Health+Canada&dept=departmentofhealth&format=atom&orderBy=desc&pick=50&publishedDate>=2021-07-23&sort=publishedDate

BRAZIL_HANTAVIROSE=https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/h/hantavirose
BRAZIL_EPI_SITUATION=https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/h/hantavirose/situacao-epidemiologica
BRAZIL_CONFIRMED_CASES_PDF=https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/h/hantavirose/arquivos/casos-confirmados-de-hantavirose-27-04-2026.pdf/view
BRAZIL_BOLETINS_RSS=https://www.gov.br/saude/pt-br/centrais-de-conteudo/publicacoes/boletins/epidemiologicos/RSS
BRAZIL_PORTAL_RSS=https://www.gov.br/saude/RSS

CHILE_BULLETINS_INDEX=https://epi.minsal.cl/hantavirus-materiales-relacionados/
CHILE_WEEKLY_BULLETIN_EXAMPLE=https://epi.minsal.cl/wp-content/uploads/2026/04/Boletin_Epidemiologico_Hantavirus_SE_15_2026.pdf
CHILE_DIPRECE_HANTA=https://diprece.minsal.cl/temas-de-salud/orden-alfabetico/hanta/

ARGENTINA_BEN_2026=https://www.argentina.gob.ar/salud/boletin-epidemiologico-nacional/boletines-2026
ARGENTINA_HANTAVIRUS_RESOURCE=https://www.argentina.gob.ar/hantavirus-0
ARGENTINA_CURRENT_SURVEILLANCE=https://www.argentina.gob.ar/noticias/salud-sostiene-y-refuerza-la-vigilancia-epidemiologica-de-hantavirus-en-el-pais
```

This is the strongest regional block after the U.S. Canada gives you official disease pages plus machine-consumable Atom news feeds. Brazil is one of the best sources in South America because it offers a disease page, epidemiological situation page, confirmed-case PDF, and portal RSS paths. Chile and Argentina are both authoritative and very relevant for hantavirus, but they are bulletin-driven rather than API-driven, so you should treat them as **weekly official bulletin extraction pipelines**. citeturn10search2turn10search20turn26view0turn27view0turn27view1turn42search3turn42search16turn42search27turn42search2turn42search0turn14search3turn14search0turn44search8turn46search0turn46search8turn46search3

### Asia-Pacific and Russia

```text
TAIWAN_DISEASE=https://www.cdc.gov.tw/En/Category/ListContent/bg0g_VU_Ysrgkes_KRUDgQ?uaid=FRCHC1QNnvZMrohYrWLGNQ
TAIWAN_OPEN_DATA_PORTAL=https://data.cdc.gov.tw/en/dataset/?organization=eic&tags=hantavirus-pulmonary-syndrome
TAIWAN_WEEKLY_DATASET=https://data.gov.tw/dataset/9877
TAIWAN_MONTHLY_DATASET=https://data.gov.tw/dataset/8895

JAPAN_IDWR_TABLE=https://idsc.niid.go.jp/idwr/ydata/report-Ea.html

KOREA_DISEASE_INFO=https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5279
KOREA_WEEKLY_TRENDS=https://dportal.kdca.go.kr/pot/bbs/BD_selectBbs.do?q_bbsDocNo=20260319161341158&q_bbsSn=1009&q_clsfNo=-1
KOREA_STATS_PORTAL=https://www.kdca.go.kr/kdca/2877/subview.do

INDIA_NCDC_DIVISION=https://ncdc.mohfw.gov.in/includes/About/CentresAndDivision/VHBD.php
INDIA_RSS_HELP=https://ncdc.mohfw.gov.in/includes/SideBar/help.php
INDIA_IDSP_ALERT_ARCHIVE=https://www.idsp.mohfw.gov.in/index1.php?lang=1&level=2&lid=3841&sublinkid=5901

AUSTRALIA_RSS_INFO=https://www.health.gov.au/using-our-websites/subscriptions/using-our-latest-news-rss-feed
AUSTRALIA_CDI_2025=https://www1.health.gov.au/internet/main/publishing.nsf/Content/cdi-2025-index

RUSSIA_ROSPOTREBNADZOR_SURVEILLANCE=https://www.rospotrebnadzor.ru/deyatelnost/epidemiological-surveillance/?ELEMENT_ID=31823
RUSSIA_REGIONAL_RSS_EXAMPLE=https://12.rospotrebnadzor.ru/rss_all/-/asset_publisher/Kq6J/content/id/1264035
```

Taiwan is the cleanest structured-data source I found in Asia, because it combines disease pages with weekly and monthly downloadable datasets on the national open-data platform. Japan and Korea are reliable, but the current public surface is more table/page/dashboard oriented than API oriented. India’s NCDC clearly includes hantavirus in zoonotic surveillance work and documents RSS usage, while IDSP provides an additional alert archive, but I did **not** surface a clean public hantavirus-only dataset in this pass. Australia offers department RSS and official Communicable Diseases Intelligence pages, but I did **not** surface a dedicated live hantavirus dashboard there. Russia is usable, but the public web surface appears fragmented between federal and regional Rospotrebnadzor sites, so Russia would need more manual curation than the other blocks above. citeturn22search0turn22search4turn22search2turn9search3turn24search2turn24search6turn24search4turn48search2turn48search1turn48search17turn11search0turn11search5turn12search15turn12search13

## Reliable news feeds for a separate signal layer

```text
BBC_TOP_UK=http://newsrss.bbc.co.uk/rss/newsonline_uk_edition/front_page/rss.xml
BBC_FEEDS_OPML=http://news.bbc.co.uk/rss/feeds.opml

AP_TOP_NEWS=https://apnews.com/hub/apf-topnews?output=rss&p=2
AP_INDEX_RSS=https://apnews.com/index.rss

DW_ALL=https://rss.dw.com/rdf/rss-en-all
DW_TOP=https://rss.dw.com/rdf/rss-en-top
DW_WORLD=https://rss.dw.com/rdf/rss-en-world

REUTERS_RSS_CLIENT_DOCS=https://liaison.reuters.com/page/rss-feeds-tech-notes
REUTERS_MY_NEWS=https://www.reuters.com/my-news/feed/
```

For a clean, conservative newsroom layer, I would prioritise the BBC, AP, and DW feeds first. Reuters is still extremely useful, but the official Reuters RSS documentation surfaced here looks more like a client or syndicated workflow than a simple open public feed, so if you do not have Reuters licensing infrastructure, I would monitor Reuters coverage via your Google News layer rather than scraping Reuters directly. citeturn16search4turn16search8turn17search11turn17search3turn17search4turn17search8turn17search24turn16search13turn16search5

This news layer should be visually and editorially separate from official counts. A good rule is: **news can create a signal, but only official health sources can confirm a case count or death count on the map**. That single rule will keep the interface factual and much less alarmist. citeturn21search0turn22search4turn42search27turn14search0turn46search0

## Google News hourly scan templates

Google News currently exposes a live RSS search endpoint under `/rss/search`, which is enough to build an hourly signal-ingestion layer. I would treat the feeds below as **practical templates to test in production**, not as your source of truth. citeturn16search3

```text
GOOGLE_GLOBAL=https://news.google.com/rss/search?q=(hantavirus+OR+"andes+virus"+OR+hantavirose+OR+hantavirosis)&hl=en-GB&gl=GB&ceid=GB:en

GOOGLE_EUROPE=https://news.google.com/rss/search?q=(hantavirus+OR+"andes+virus")+Europe&hl=en-GB&gl=GB&ceid=GB:en

GOOGLE_NORTH_AMERICA=https://news.google.com/rss/search?q=(hantavirus+OR+"andes+virus")+("United+States"+OR+Canada+OR+Mexico)&hl=en-US&gl=US&ceid=US:en

GOOGLE_SOUTH_AMERICA=https://news.google.com/rss/search?q=(hantavirus+OR+"virus+hanta"+OR+hantavirosis+OR+hantavirose)+("South+America"+OR+Argentina+OR+Chile+OR+Brazil)&hl=es-419&gl=AR&ceid=AR:es-419

GOOGLE_ASIA=https://news.google.com/rss/search?q=(hantavirus+OR+"hemorrhagic+fever+with+renal+syndrome"+OR+HFRS)+("Asia"+OR+Japan+OR+Korea+OR+Taiwan+OR+India)&hl=en-US&gl=US&ceid=US:en

GOOGLE_AUSTRALIA_OCEANIA=https://news.google.com/rss/search?q=(hantavirus+OR+"andes+virus")+("Australia"+OR+Oceania)&hl=en-AU&gl=AU&ceid=AU:en

GOOGLE_TENERIFE_CRUISE=https://news.google.com/rss/search?q=(hantavirus+OR+"andes+virus")+("MV+Hondius"+OR+Tenerife+OR+"Canary+Islands"+OR+"cruise+ship")&hl=en-GB&gl=GB&ceid=GB:en
```

The safest way to use these is simple. Run them hourly. Mark all incoming items as `signal_only`. Then try to match each item to one of your official sources by geography, disease term, vessel name, or bulletin date. Only when an item matches a Tier A, B, or C source should it become `official_confirmed` or `official_suspected`. citeturn21search0turn22search4turn31view0turn47search12turn42search27turn14search0turn46search0

## Open questions and limitations

A few parts of the ecosystem are still messy. WHO is important, but it is not a one-stop live global counter for hantavirus. Several public-health agencies publish authoritative hantavirus information without a clean public API, especially via PDF bulletins, HTML pages, or region-specific feeds. Russia, in particular, appears fragmented across federal and regional pages. India clearly includes hantavirus in surveillance work, but I did not surface a clean hantavirus-only public dataset in this pass. Australia likewise has official RSS and communicable-disease publication pathways, but not a dedicated public hantavirus dashboard in the sources surfaced here. citeturn31view0turn32search7turn42search27turn14search0turn46search0turn12search15turn48search2turn11search0

If you want the map to feel calm, educational, and trustworthy, the best product choice is not a more dramatic design. It is a stricter data contract: **official structured counts first, official narrative context second, trusted media signals third, Google News last**. That structure is what will make the interface look measured rather than theatrical, and accurate rather than merely busy. citeturn21search0turn22search4turn47search10turn42search27turn14search0turn46search0