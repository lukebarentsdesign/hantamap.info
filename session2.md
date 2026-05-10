REVISED SESSION 2 — Frontend, same as before
The frontend session prompt is unchanged from the last version — Leaflet, CartoDB tiles, React, dark theme, Space Grotesk. No Google Maps, no paid APIs.
The one change: update REACT_APP_API_URL to point to the Railway backend URL instead of Cloud Run.

Sessions 2 and 3 are unchanged — Leaflet, CartoDB dark tiles, React, mobile-first, no paid APIs. The only update is the frontend should display the languages count and countries count from the snapshot response so visitors can see it is genuinely global coverage. Something like "Monitoring 24 feeds across 18 countries in 12 languages" in small text under the hero numbers. That one line is your strongest differentiator from every other tracker.

REVISED SESSION 2 — Frontend, Leaflet instead of Google Maps
Build a React single page application deployed on Google Cloud Run. Dark theme, mobile-first, Space Grotesk from Google Fonts, accent colour #E8593C. No Google Maps — use Leaflet with OpenStreetMap tiles, completely free with no API key.
Fetches GET /api/v1/snapshot on load and every 5 minutes. Fetches GET /api/v1/delta on load once.
Sections top to bottom:
DELTA BANNER — full width top banner. If has_changed true and new_cases greater than zero: red banner "New confirmed case — [confirmed_cases] total as of [generated_at]". If no change: green banner "No new confirmed cases in the last [hours_since_change] hours".
HERO — large numbers from who_data showing confirmed cases, deaths, countries affected. Below them show situation_summary.text at 18px. Small muted attribution: "Updated [generated_at] · WHO · CDC · Hantaflow.com CC BY 4.0"
MAP — Leaflet map with CartoDB dark matter tiles which are free and require no API key. Tile URL is https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png. Add red circle markers for confirmed case countries: South Africa, Netherlands, Germany, Spain, Switzerland, United Kingdom. Add yellow circle markers for monitoring countries. Draw a polyline in red for the MV Hondius route through these coordinates in order: Ushuaia [-54.8, -68.3], Saint Helena [-15.9, -5.7], Cape Verde [14.9, -23.5], Tenerife [28.3, -16.5]. Add a marker at Tenerife labelled "MV Hondius — current position".
LIVE SIGNALS — latest 20 items from signals array. Each shows title as a link opening in a new tab, source name, flag emoji for countryIso2, time ago from publishedAt.
EMAIL CAPTURE — heading "Get notified when new cases are confirmed". Email input and submit button posting to /api/v1/alert-signup. Loading state during request. On success show "You're on the list." On error show the error.
INFO — three collapsible accordion sections: What is hantavirus, Symptoms to watch for, How it spreads. Accurate WHO-sourced content, calm and factual.
FOOTER — "Sources: Hantaflow.com CC BY 4.0, WHO Disease Outbreak News DON599, CDC. Map tiles by CartoDB, data by OpenStreetMap contributors. This tracker is for informational purposes only and is not medical advice."
Include Dockerfile and nginx.conf. Proxy /api requests to backend URL from environment variable REACT_APP_API_URL.