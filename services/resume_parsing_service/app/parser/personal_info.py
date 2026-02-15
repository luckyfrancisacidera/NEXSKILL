import re
import phonenumbers
from .config import EMAIL_RE, PHONE_CANDIDATE_RE

def extract_email(text: str) -> str:
    m = EMAIL_RE.search(text)
    return m.group(0) if m else ""


def extract_phone(text: str, default_region: str = "PH") -> str:
    candidates = PHONE_CANDIDATE_RE.findall(text)
    regions_to_try = [default_region, "PH", "US"]

    for c in candidates[:25]:
        raw = re.sub(r"[^\d+]", "", c)

        if raw.startswith("09") and len(raw) == 11:
            raw = "+63" + raw[1:]
        if raw.startswith("9") and len(raw) == 10:
            raw = "+63" + raw

        for region in regions_to_try:
            try:
                p = phonenumbers.parse(raw, region)
                if phonenumbers.is_valid_number(p):
                    return phonenumbers.format_number(p, phonenumbers.PhoneNumberFormat.E164)
            except Exception:
                continue
    return ""


def extract_full_name(nlp, raw_text: str) -> str:
    lines = [l.strip() for l in raw_text.splitlines() if l.strip()]
    if not lines:
        return ""

    first = lines[0].split("|")[0].strip()
    if "," in first:
        first = first.split(",", 1)[0].strip()

    letters = re.sub(r"[^A-Za-z ]", "", first).strip()
    if len(letters) >= 6 and len(first.split()) <= 6:
        return " ".join(w.capitalize() for w in first.split())

    head = "\n".join(raw_text.splitlines()[:25])
    doc = nlp(head)
    persons = [ent.text.strip() for ent in doc.ents if ent.label_ == "PERSON" and len(ent.text.strip()) >= 3]
    return persons[0] if persons else ""


def extract_location(raw_text: str) -> str:
    m = re.search(r"\b([A-Za-z]+(?:\s+[A-Za-z]+)*),\s*(Philippines)\b", raw_text)
    if m:
        return f"{m.group(1)}, {m.group(2)}"
    if re.search(r"\bPhilippines\b", raw_text, re.I):
        return "Philippines"
    return ""