export const MV_HONDIUS_STATS = {
  totalCases: 8,
  confirmed: 6,
  probable: 2,
  symptomatic: 6,
  asymptomatic: 18,
  recovered: 4,
  deaths: 3,
  tracked: 39,
  gen0: 3,
  aboard: 147,
  nationalities: 23,
  lastUpdated: 'May 10, 2026',
  status: 'Docked - Port of Granadilla, Tenerife'
}

export const MV_HONDIUS_ROUTE_POINTS = [
  {
    name: 'Ushuaia',
    label: 'Departure / suspected origin',
    coords: [-54.8019, -68.3030],
    tone: 'origin',
    note: 'Departed Apr 1. External tracker says the Dutch index couple are believed to have been exposed during pre-voyage wildlife/bird-watching activity around Ushuaia.'
  },
  {
    name: 'South Georgia Island',
    label: 'Shore excursions',
    coords: [-54.2811, -36.5085],
    tone: 'exposure',
    note: 'Apr 4-7 wildlife excursions; early exposure event in route chronology.'
  },
  {
    name: 'Tristan da Cunha',
    label: 'Island contact',
    coords: [-37.1052, -12.2777],
    tone: 'exposure',
    note: 'Apr 13-16. Six residents embarked; later suspected Tristan case triggered military medical support.'
  },
  {
    name: 'Gough Island',
    label: 'Shore stop',
    coords: [-40.3183, -9.9353],
    tone: 'watch',
    note: 'Apr 17 wildlife viewing; limited local contact.'
  },
  {
    name: 'St Helena',
    label: 'Disembarkation dispersal',
    coords: [-15.9650, -5.7089],
    tone: 'high',
    note: 'Apr 21-24. Thirty-two guests disembarked, including the Dutch index couple.'
  },
  {
    name: 'Ascension Island',
    label: 'Medevac point',
    coords: [-7.9467, -14.3559],
    tone: 'medevac',
    note: 'Apr 27. Two guests evacuated as symptoms escalated.'
  },
  {
    name: 'Praia, Cape Verde',
    label: 'Detention / delayed end',
    coords: [14.9330, -23.5133],
    tone: 'watch',
    note: 'Original May 4 voyage end; ship was detained and later departed May 6.'
  },
  {
    name: 'Granadilla, Tenerife',
    label: 'Current docking / repatriation',
    coords: [28.0842, -16.5137],
    tone: 'current',
    note: 'Docked May 10. Repatriation flights and controlled disembarkation underway.'
  },
  {
    name: 'Rotterdam',
    label: 'Planned disinfection',
    coords: [51.9244, 4.4777],
    tone: 'destination',
    note: 'Expected destination after disembarkation for full disinfection.'
  }
]

export const MV_HONDIUS_REPATRIATION_POINTS = [
  ['Madrid / Gomez Ulla', [40.4168, -3.7038], 'Spain flight departed; 14 nationals to quarantine.'],
  ['Paris area', [48.8566, 2.3522], 'France medical charter departed; 72h hospital then 45-day home isolation.'],
  ['Canada', [45.4215, -75.6972], 'Plane confirmed for four passengers.'],
  ['Eindhoven', [51.4416, 5.4697], 'Netherlands charter pending for 29 aboard.'],
  ['Nebraska / UNMC', [41.2565, -95.9345], 'US biocontainment transfer planned for 17 guests.'],
  ['United Kingdom', [51.5072, -0.1276], 'Flight pending for 19 guests plus 3 crew.'],
  ['Australia / New Zealand', [-33.8688, 151.2093], 'Final long-haul evacuation planned for Australia, New Zealand and nearby nationalities.']
]

export const MV_HONDIUS_DOCKING_NOTES = [
  'Docked at Port of Granadilla, Tenerife on May 10, 2026.',
  'WHO Director-General Tedros and Spanish ministers reported on-site by the external tracker.',
  '147 aboard across 23 nationalities.',
  'No symptoms reported among remaining passengers or crew at docking.',
  'Port protocol: hazmat suits, respirators and face masks.',
  'No luggage disembarkation: small bag, phone, charger and documents only.',
  'No contact with the local population.'
]

export const MV_HONDIUS_FLIGHTS = [
  {
    country: 'Spain',
    status: 'Departed',
    detail: 'A310 "Reino de Espana" T.22-2 to Gomez Ulla Defense Hospital, Madrid.',
    passengers: '14 Spanish nationals',
    protocol: 'Quarantine on arrival',
    source: 'AP / external tracker'
  },
  {
    country: 'France',
    status: 'Departed',
    detail: 'Medical charter to the Paris area, departed around 12:00 local.',
    passengers: '5 passengers plus staff',
    protocol: '72h hospital monitoring, then 45-day home isolation',
    source: 'Guardian / external tracker'
  },
  {
    country: 'Canada',
    status: 'Plane confirmed',
    detail: 'Assessment at shore, passport check, then direct to aircraft.',
    passengers: '4 passengers',
    protocol: 'Per Spain Health Secretary Padilla, reported by CBC',
    source: 'CBC / external tracker'
  },
  {
    country: 'Norway',
    status: 'On standby',
    detail: 'Norwegian-operated EU air ambulance staged at TFS.',
    passengers: 'Contingency aircraft',
    protocol: 'High-risk infection transport if anyone deteriorates during disembarkation',
    source: 'NRK / external tracker'
  },
  {
    country: 'Netherlands',
    status: 'Pending',
    detail: 'Charter expected for Dutch and other passengers.',
    passengers: '29 aboard',
    protocol: 'Dutch Foreign Ministry confirmed coordination',
    source: 'AP / external tracker'
  },
  {
    country: 'United States',
    status: 'Pending',
    detail: 'Biocontainment charter to Nebraska Biocontainment Unit, UNMC.',
    passengers: '17 guests',
    protocol: 'CDC escort',
    source: 'AP / external tracker'
  },
  {
    country: 'United Kingdom',
    status: 'Pending',
    detail: 'Flight pending for UK nationals and crew.',
    passengers: '19 guests plus 3 crew',
    protocol: 'Hospitalization on arrival',
    source: 'AP / external tracker'
  },
  {
    country: 'Australia',
    status: 'Monday',
    detail: 'Last planned outbound flight; also evacuating New Zealand and nearby nationalities.',
    passengers: '4 Australian guests plus nearby nationalities',
    protocol: 'Aircraft arrival expected Monday',
    source: 'AP / external tracker'
  }
]

export const MV_HONDIUS_TIMELINE = [
  ['Apr 1', 'Departed Ushuaia, Argentina with 175 aboard.'],
  ['Apr 4-7', 'Stop at South Georgia Island.'],
  ['Apr 13-16', 'Stop at Tristan da Cunha / Inaccessible / Nightingale Islands; six islanders embarked.'],
  ['Apr 21-24', 'Stop at St Helena; 32 guests disembarked including the Dutch index couple.'],
  ['Apr 27', 'Two guests medevaced via Ascension Island: symptomatic British national and American partner.'],
  ['May 4', 'Original planned end at Praia, Cape Verde; ship detained.'],
  ['May 6', 'Three more evacuated to the Netherlands; ship departed Cape Verde.'],
  ['May 10', 'Docked Granadilla, Tenerife; repatriation flights underway.']
]

export const MV_HONDIUS_MANIFEST = [
  ['United States', '17 guests'],
  ['United Kingdom', '19 guests + 3 crew'],
  ['Spain', '13 guests + 1 crew'],
  ['Netherlands', '8 guests + 5 crew'],
  ['France', '5 guests'],
  ['Germany', '5 guests + 1 crew'],
  ['Canada', '4 guests'],
  ['Australia', '4 guests'],
  ['Philippines', '38 crew'],
  ['Ukraine', '5 crew'],
  ['Other nationalities', 'Argentina, Belgium, Greece, Guatemala, India, Ireland, Italy, Japan, Montenegro, New Zealand, Poland, Portugal, Russia and Turkey']
]

export const MV_HONDIUS_POST_DISEMBARKATION = [
  'MV Hondius expected to sail to Rotterdam, Netherlands for full disinfection.',
  'Disinfection voyage estimated around five days.',
  'Crew and the body of the deceased passenger remain aboard.',
  'Tristan da Cunha suspected case noted by the external tracker: British paratroopers from 16 Air Assault Brigade airdropped medical support because the island has no airstrip.'
]

export const MV_HONDIUS_EXPOSURE_EVENTS = [
  {
    place: 'South Georgia Island',
    date: 'Apr 4-7, 2026',
    risk: 'Early shore exposure',
    detail: 'Wildlife excursions around penguin colonies, elephant seals and Grytviken. No permanent civilian population; contact limited mainly to passengers, crew and guides.'
  },
  {
    place: 'Tristan da Cunha',
    date: 'Apr 13-16, 2026',
    risk: 'High remote-island concern',
    detail: 'Six island residents embarked. One Tristan resident later developed suspected symptoms; the island has no airstrip and medical support was airdropped.'
  },
  {
    place: 'Gough Island',
    date: 'Apr 17, 2026',
    risk: 'Low local-contact exposure',
    detail: 'Uninhabited except for a small South African weather station. Passengers went ashore for wildlife viewing.'
  },
  {
    place: 'St Helena',
    date: 'Apr 21-24, 2026',
    risk: 'Most epidemiologically significant shore stop',
    detail: 'Thirty-two guests disembarked, including the Dutch index couple. Passengers dispersed onward before the outbreak was identified.'
  },
  {
    place: 'Ascension Island',
    date: 'Apr 27, 2026',
    risk: 'Medevac point',
    detail: 'Two guests were medically evacuated: a symptomatic British national and an American partner. RAF Ascension provided logistics.'
  }
]

export const MV_HONDIUS_CASE_SUMMARY = [
  ['Total cases', '8', 'WHO DON600 total as of 8 May: six laboratory-confirmed cases and two probable cases.'],
  ['Lab-confirmed', '6', 'WHO DON600: all six confirmed infections identified as Andes virus.'],
  ['Probable', '2', 'WHO DON600 probable cases under the outbreak case definition.'],
  ['Monitoring - symptomatic', '6', 'People reported symptomatic or under clinical evaluation.'],
  ['Monitoring - asymptomatic', '18', 'People under monitoring without symptoms at the time of report.'],
  ['Recovered', '4', 'Cases marked recovered by the external tracker.'],
  ['Deaths', '3', 'WHO DON600 reports three deaths; older media reports often say seven cases, not seven deaths.'],
  ['Tracked', '39', 'Total tracked case/person records in the public dataset.']
]

export const MV_HONDIUS_OFFICIAL_STATEMENTS = [
  {
    speaker: 'Dr Tedros Adhanom Ghebreyesus',
    org: 'WHO Director-General',
    text: 'While this is a serious incident, WHO assesses the public health risk as low. More cases may be reported given the incubation period.'
  },
  {
    speaker: 'Dr Maria Van Kerkhove',
    org: 'WHO',
    text: 'This is not SARS-CoV-2. This is not the start of a COVID pandemic.'
  },
  {
    speaker: 'Dr Abdi Mahamud',
    org: 'WHO Alert and Response Director',
    text: 'WHO expects this to remain a limited outbreak if public-health measures are implemented and international coordination continues.'
  }
]

export const MV_HONDIUS_SOURCE_LINKS = [
  ['WHO Disease Outbreak News - DON600', 'https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON600'],
  ['WHO Response Statement - May 8, 2026', 'https://www.who.int/united-kingdom-of-great-britain-and-northern-ireland/news/item/08-05-2026-who-s-response-to-hantavirus-cases-linked-to-a-cruise-ship'],
  ['CDC - Hantavirus', 'https://www.cdc.gov/hantavirus/'],
  ['ECDC - Hantavirus', 'https://www.ecdc.europa.eu/en/hantavirus-infection'],
  ['Underlying public tracker attribution', 'https://hantavirus.up.railway.app/']
]
