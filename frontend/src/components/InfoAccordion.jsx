import { useState } from 'react'

const ITEMS = [
  {
    title: 'What is hantavirus?',
    src: 'Hantaflow FAQ / WHO',
    url: 'https://hantaflow.com/faq',
    body: [
      `Hantavirus is a genus of rodent-borne viruses (Orthohantavirus) that cause Hantavirus Pulmonary Syndrome (HPS) in the Americas and Hemorrhagic Fever with Renal Syndrome (HFRS) in Europe and Asia. Different strains cause different syndromes; reservoirs are species-specific rodents.`
    ],
  },
  {
    title: 'Is it contagious from person to person?',
    src: 'Hantaflow FAQ',
    url: 'https://hantaflow.com/faq',
    body: [
      `Almost never. For nearly every hantavirus, transmission is from rodents to humans, not human to human. The single exception is Andes virus (ANDV) in Argentina and Chile, which has documented person-to-person spread in close-contact settings.`
    ],
  },
  {
    title: 'How does it spread? Is it airborne?',
    src: 'Hantaflow FAQ / ECDC',
    url: 'https://hantaflow.com/faq',
    body: [
      `Primarily through inhaling aerosolised dust from rodent urine, droppings or saliva, especially in enclosed spaces. Less commonly through bites or contact with mucous membranes.`,
      `It is "airborne" only in the sense that contaminated dust gets aerosolised when disturbed. It does not spread through coughs and sneezes between people the way SARS-CoV-2 or influenza do, with the narrow Andes-virus exception.`
    ],
  },
  {
    title: 'Symptoms and Incubation',
    src: 'Hantaflow FAQ / CDC',
    url: 'https://hantaflow.com/faq',
    body: [
      `The incubation period is typically 1–8 weeks after exposure, most commonly 2–4 weeks.`,
      `Initial symptoms (HPS): fever, chills, muscle aches, fatigue. After 4–10 days, rapid shortness of breath. HFRS adds back pain, low blood pressure, and reduced urine output.`
    ],
  },
  {
    title: 'Fatality, Treatment and Vaccines',
    src: 'Hantaflow FAQ',
    url: 'https://hantaflow.com/faq',
    body: [
      `Fatality depends on the strain. Sin Nombre HPS ~36% case-fatality; Andes HPS ~25–40%; Hantaan HFRS ~5–15%; Puumala HFRS <0.5%; Seoul HFRS ~1–2%.`,
      `No specific antiviral is licensed in most regions. Treatment is supportive: IV fluids, oxygen, in severe HPS sometimes ECMO. Early ICU admission improves outcomes. Ribavirin is used in some HFRS settings in Asia.`,
      `Hantaan-family vaccines (Hantavax, others) are licensed in South Korea and China. No widely available vaccine exists for the New World HPS hantaviruses (Sin Nombre, Andes, etc.).`
    ],
  },
  {
    title: 'Key Hantavirus Strains',
    src: 'Hantaflow Strain Reference',
    url: 'https://hantaflow.com/strains',
    body: [
      `The global hantavirus burden is driven by several distinct strains, divided into New World (causing HPS) and Old World (causing HFRS) viruses.`,
      `NEW WORLD STRAINS (HPS):`,
      `• Sin Nombre virus (SNV): Carried by the Deer mouse in the United States. ~36% case-fatality.`,
      `• Andes virus (ANDV): Carried by the Long-tailed pygmy rice rat in Argentina and Chile. ~25-40% case-fatality. The only strain with documented person-to-person transmission.`,
      `• Choclo virus (CHOV) and Laguna Negra virus (LANV): Found in Central and South America. ~10-25% case-fatality.`,
      `OLD WORLD STRAINS (HFRS):`,
      `• Seoul virus (SEOV): Carried by the Brown rat worldwide (often in urban areas). ~1-2% case-fatality.`,
      `• Hantaan virus (HTNV): Carried by the Striped field mouse in South Korea. ~5-15% case-fatality.`,
      `• Puumala virus (PUUV): Carried by the Bank vole in Europe (e.g., Finland). Causes a mild form of HFRS (<0.5% fatality).`,
      `• Dobrava-Belgrade virus (DOBV): Carried by the Yellow-necked mouse in the Balkans. ~10-12% case-fatality.`
    ]
  },
  {
    title: 'Prevention and what to do',
    src: 'NHS (UK) / CDC',
    url: 'https://www.cdc.gov/hantavirus/about/index.html',
    body: [
      `Minimize your exposure to rodents and their habitats. Seal up holes and gaps inside and outside your home or outbuildings to keep rodents out. Clean up potential food sources and secure trash bins.`,
      `When cleaning rodent-infested areas, DO NOT sweep or vacuum, as this can stir up viral aerosols. Instead, use rubber, latex or vinyl gloves. Thoroughly wet the contaminated areas with a disinfectant or a 10% bleach solution and let it soak for 5 minutes before wiping it up.`,
      `Ventilate enclosed spaces by opening windows and doors for at least 30 minutes before entering. If you develop a high fever or breathing difficulty after visiting a rodent-prone area, see a doctor immediately and explicitly state your potential exposure history.`
    ],
  },
]

export function InfoAccordion() {
  const [open, setOpen] = useState(null)
  return (
    <section className="info" aria-labelledby="info-hd">
      <div className="wrap">
        <div className="info-grid">
          <aside>
            <h2 className="info-aside-title" id="info-hd">
              About hantavirus
            </h2>
            <p className="info-aside-sub">
              Factual reference information sourced from WHO, CDC and ECDC.
              Not medical advice.
            </p>
            <p className="info-aside-src">WHO · CDC · ECDC</p>
          </aside>

          <div role="list">
            {ITEMS.map((item, i) => (
              <div key={i} className="acc-item" role="listitem">
                <button
                  className="acc-btn"
                  onClick={() => setOpen(open === i ? null : i)}
                  aria-expanded={open === i}
                  aria-controls={`acc-${i}`}
                  id={`acc-btn-${i}`}
                >
                  {item.title}
                  <span
                    className={`acc-icon${open === i ? ' open' : ''}`}
                    aria-hidden="true">
                    +
                  </span>
                </button>
                <div
                  id={`acc-${i}`}
                  role="region"
                  aria-labelledby={`acc-btn-${i}`}
                  className={`acc-body${open === i ? ' open' : ''}`}
                >
                  {item.body.map((para, j) => (
                    <p key={j}>{para}</p>
                  ))}
                  <p className="acc-src">
                    Source: <a href={item.url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent2)', textDecoration: 'none' }}>{item.src}</a>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
