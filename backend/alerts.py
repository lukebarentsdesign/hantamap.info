import os
import re

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
SITE_URL       = os.environ.get("SITE_URL", "https://hantavirus-tracker.com")
FROM_EMAIL     = os.environ.get("FROM_EMAIL", "alerts@hantavirus-tracker.com")


def is_valid_email(email: str) -> bool:
    return bool(re.match(
        r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$",
        email.strip()
    ))


def send_welcome_email(email: str):
    if not RESEND_API_KEY:
        return
    try:
        import resend
        resend.api_key = RESEND_API_KEY
        resend.Emails.send({
            "from": FROM_EMAIL,
            "to": email,
            "subject": "You're on the list — Hantavirus Tracker",
            "html": f"""
                <div style="font-family:sans-serif;max-width:480px;
                            margin:0 auto;padding:24px;color:#1a1a1a">
                  <h2 style="font-size:18px;font-weight:500;
                             margin-bottom:16px">
                    You're subscribed to WHO case alerts
                  </h2>
                  <p style="color:#555;line-height:1.7">
                    We'll send you a short email the moment WHO confirms a
                    new hantavirus case. One email per confirmed case update.
                    No newsletters. No marketing.
                  </p>
                  <p style="margin-top:20px">
                    <a href="{SITE_URL}"
                       style="color:#c8392b;text-decoration:none">
                      View the live tracker →
                    </a>
                  </p>
                  <hr style="border:none;border-top:1px solid #eee;
                             margin:24px 0" />
                  <p style="color:#999;font-size:12px;line-height:1.6">
                    This is not medical advice. Data sourced from WHO Disease
                    Outbreak News and ECDC. To unsubscribe, reply STOP to
                    any alert email. Operated from the United Kingdom.
                  </p>
                </div>
            """,
        })
    except Exception as e:
        print(f"Welcome email error: {e}")


def send_case_alert(who_confirmed: int, who_deaths: int, countries: list):
    if not RESEND_API_KEY:
        return
    try:
        import resend
        import sqlite3
        from database import DB_PATH

        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        emails = [
            r["email"]
            for r in conn.execute("SELECT email FROM alerts").fetchall()
        ]
        conn.close()

        if not emails:
            return

        country_str = ", ".join(countries[:5])
        resend.api_key = RESEND_API_KEY
        resend.Emails.send({
            "from": FROM_EMAIL,
            "to": emails,
            "subject": f"Update: {who_confirmed} confirmed hantavirus cases",
            "html": f"""
                <div style="font-family:sans-serif;max-width:480px;
                            margin:0 auto;padding:24px;color:#1a1a1a">
                  <h2 style="font-size:18px;font-weight:500;
                             margin-bottom:16px">
                    WHO case update
                  </h2>
                  <table style="width:100%;border-collapse:collapse;
                                margin-bottom:20px">
                    <tr>
                      <td style="padding:10px 0;border-bottom:1px solid #eee;
                                 color:#555;font-size:14px">
                        Confirmed cases
                      </td>
                      <td style="padding:10px 0;border-bottom:1px solid #eee;
                                 font-weight:500;text-align:right;
                                 color:#c8392b">
                        {who_confirmed}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:10px 0;border-bottom:1px solid #eee;
                                 color:#555;font-size:14px">
                        Deaths
                      </td>
                      <td style="padding:10px 0;border-bottom:1px solid #eee;
                                 font-weight:500;text-align:right">
                        {who_deaths}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:10px 0;color:#555;font-size:14px">
                        Countries affected
                      </td>
                      <td style="padding:10px 0;font-weight:500;
                                 text-align:right;font-size:13px">
                        {country_str}
                      </td>
                    </tr>
                  </table>
                  <a href="{SITE_URL}"
                     style="display:inline-block;background:#c8392b;
                            color:#fff;padding:10px 20px;
                            text-decoration:none;font-size:14px">
                    View live tracker →
                  </a>
                  <hr style="border:none;border-top:1px solid #eee;
                             margin:24px 0" />
                  <p style="color:#999;font-size:11px;line-height:1.6">
                    Source: WHO Disease Outbreak News. This is not medical
                    advice. Reply STOP to unsubscribe. Operated from the UK.
                  </p>
                </div>
            """,
        })
        print(f"Case alert sent to {len(emails)} subscribers.")
    except Exception as e:
        print(f"Case alert error: {e}")
