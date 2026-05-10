export function FullDisclaimer() {
  return (
    <section className="full-disc" aria-labelledby="disc-hd">
      <div className="wrap">
        <div className="disc-box" role="note">
          <div className="disc-box-hd">
            <span aria-hidden="true" style={{ color:'var(--amber)',
              fontSize:'13px' }}>!</span>
            <h2 className="disc-box-title" id="disc-hd">
              Important notices - please read
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
                Confirmed case figures should come from official structured
                surveillance or validated official bulletins. Official notices
                provide context, while media and Google News items are signals,
                not confirmed clinical cases. Data may be incomplete, delayed,
                or contain errors.
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
                News signal data is gathered from monitored public feeds and
                search templates. Map tiles (c) CartoDB, data (c) OpenStreetMap
                contributors. Official source hierarchy follows the project
                research dossier: surveillance first, official notices second,
                media and search signals last.
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
                This public dashboard does not operate a mailing list or
                newsletter signup. The site uses no tracking cookies and is
                intended for public situational awareness only. Operated from
                the UK under UK data protection law.
              </p>
            </div>
          </div>

          <div className="emerg">
            <div className="emerg-title">If you have a medical emergency</div>
            <div className="emerg-contacts">
              <div className="emerg-c">
                <strong>UK</strong>
                NHS 111 (non-emergency) - 999 (emergency)
              </div>
              <div className="emerg-c">
                <strong>US</strong>
                CDC 800-232-4636 - 911 (emergency)
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
