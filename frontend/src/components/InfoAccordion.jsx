import { useState } from 'react'

const ITEMS = [
  {
    title: 'What is hantavirus?',
    src: 'WHO Fact Sheet — Hantavirus and hantavirus disease',
    body: [
      `Hantavirus is a family of rodent-borne viruses (genus Orthohantavirus)
       found worldwide. More than 50 species are known, with roughly half
       capable of causing disease in humans. The current outbreak involves
       Andes virus, endemic to Argentina and southern Chile.`,
      `Hantaviruses cause two distinct human diseases. In the Americas:
       Hantavirus Pulmonary Syndrome (HPS), a severe respiratory illness.
       In Europe and Asia: Haemorrhagic Fever with Renal Syndrome (HFRS),
       primarily affecting the kidneys.`,
      `Andes virus is the only hantavirus with documented person-to-person
       transmission, occurring through prolonged very close contact in
       household or healthcare settings. All other hantavirus species
       transmit only from rodents to humans — not between people.`,
    ],
  },
  {
    title: 'Symptoms and what to watch for',
    src: 'CDC — Hantavirus Pulmonary Syndrome (HPS)',
    body: [
      `HPS begins with a febrile prodrome of 1–8 weeks after exposure:
       fever, fatigue, muscle aches, headache, and sometimes gastrointestinal
       symptoms. These initial symptoms closely resemble influenza.`,
      `Within 4–10 days, HPS progresses rapidly to a cardiopulmonary phase:
       shortness of breath, cough, and fluid accumulation in the lungs
       (non-cardiogenic pulmonary oedema). This phase is a medical emergency.
       Case fatality for Andes virus is approximately 25–40%.`,
      `Seek emergency medical care immediately if you develop sudden
       shortness of breath following a flu-like illness — particularly if
       you have had recent close contact with a confirmed case or visited
       rodent-occupied enclosed spaces in South America. Always tell
       clinicians about your full exposure history.`,
    ],
  },
  {
    title: 'How it spreads',
    src: 'ECDC — Hantavirus infection fact sheet',
    body: [
      `The primary route is inhalation of aerosols — microscopic particles
       from infected rodent droppings, urine, or saliva — in enclosed, poorly
       ventilated spaces such as cabins, sheds, barns, woodpiles, and grain
       stores. Direct rodent contact or bites can also transmit the virus.`,
      `For Andes virus specifically, rare person-to-person transmission
       has been documented in household and healthcare settings involving
       prolonged close contact. There is no evidence of casual airborne
       transmission in public spaces. The overall global risk from this
       outbreak remains low according to WHO.`,
      `There is currently no licensed vaccine or specific antiviral
       treatment for hantavirus. Treatment is supportive — early
       hospitalisation and intensive care significantly improve survival.`,
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
                  <p className="acc-src">Source: {item.src}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
