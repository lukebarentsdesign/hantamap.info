export function FullDisclaimer() {
  return (
    <section className="full-disc" aria-labelledby="disc-hd">
      <div className="wrap">
        <div className="disc-box" role="note">
          <div className="disc-box-hd">
            <span aria-hidden="true" style={{ color:'var(--amber)',
              fontSize:'13px' }}>⚠</span>
            <h2 className="disc-box-title" id="disc-hd">
              Important notices — please read
            </h2>
          </div>

          <div className="disc-grid">
            <div className="disc-item">
              <h4>Not medical advice</h4>
              <p>
                Nothing on this site constitutes medical advice, diagnosis or
                treatment. This tracker aggregates publicly available data from
                official sources for general informational purposes only.
                Always consult a qualified healthcare professional for any
                health concern.
              </p>
            </div>
            <div className="disc-item">
              <h4>Data accuracy</h4>
              <p>
                Confirmed case figures are sourced from WHO Disease Outbreak
                News and may lag real-time developments. Signal counts reflect
                monitored news mentions — not confirmed clinical cases. Data
                may be incomplete, delayed, or contain errors.
              </p>
            </div>
            <div className="disc-item">
              <h4>Risk assessment</h4>
              <p>
                WHO has assessed the overall global risk from this event as
                low. Andes virus does not transmit through casual contact or
                airborne routes in public settings. This tracker is not
                intended to cause alarm.
              </p>
            </div>
            <div className="disc-item">
              <h4>Attribution</h4>
              <p>
                News signal data partially sourced from Hantaflow.com under
                Creative Commons CC BY 4.0. Map tiles © CartoDB, data ©
                OpenStreetMap contributors. Clinical data sourced exclusively
                from WHO and ECDC official publications.
              </p>
            </div>
            <div className="disc-item">
              <h4>No affiliation or endorsement</h4>
              <p>
                This is an independent public service. It is not affiliated
                with, endorsed by, or operated by WHO, ECDC, CDC, NHS, or
                any government body. Always seek guidance from your national
                public health authority.
              </p>
            </div>
            <div className="disc-item">
              <h4>Privacy and data</h4>
              <p>
                Email alert addresses are stored securely and never shared
                with third parties. This site uses no tracking cookies and
                collects no personal data beyond voluntarily submitted email
                addresses. Operated from the UK under UK data protection law.
              </p>
            </div>
          </div>

          <div className="emerg">
            <div className="emerg-title">If you have a medical emergency</div>
            <div className="emerg-contacts">
              <div className="emerg-c">
                <strong>UK</strong>
                NHS 111 (non-emergency) · 999 (emergency)
              </div>
              <div className="emerg-c">
                <strong>US</strong>
                CDC 800-232-4636 · 911 (emergency)
              </div>
              <div className="emerg-c">
                <strong>EU</strong>
                112 (emergency)
              </div>
              <div className="emerg-c">
                <strong>Global</strong>
                Contact your national health authority
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
