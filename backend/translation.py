import os
from functools import lru_cache

import requests


TRANSLATE_TIMEOUT = float(os.environ.get("TRANSLATE_TIMEOUT", "5"))
TRANSLATE_PROVIDER = os.environ.get("TRANSLATE_PROVIDER", "google").lower()


@lru_cache(maxsize=2048)
def translate_to_english(text: str, source_lang: str = "auto") -> str:
    """Translate short public feed text to English.

    Uses Google's no-key translate endpoint by default. This is best-effort:
    if translation fails, callers get the original text back rather than
    dropping the signal.
    """
    text = (text or "").strip()
    if not text or source_lang == "en":
        return text

    try:
        if TRANSLATE_PROVIDER == "off":
            return text

        response = requests.get(
            "https://translate.googleapis.com/translate_a/single",
            params={
                "client": "gtx",
                "sl": source_lang or "auto",
                "tl": "en",
                "dt": "t",
                "q": text,
            },
            timeout=TRANSLATE_TIMEOUT,
        )
        response.raise_for_status()
        data = response.json()
        translated = "".join(part[0] for part in data[0] if part and part[0])
        return translated.strip() or text
    except Exception as exc:
        print(f"Translation skipped [{source_lang}]: {exc}")
        return text
