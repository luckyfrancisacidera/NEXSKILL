# certifications.py
import re
from typing import Any, Dict, List
from .config import MONTHS
from .utils import clean

DATE_RE = re.compile(rf"\b({MONTHS})\b\s+(\d{{4}})$", re.I)

def parse_certifications(section_text: str) -> List[Dict[str, Any]]:
    lines = [l.strip() for l in (section_text or "").splitlines() if l.strip()]
    if not lines:
        return []

    items: List[Dict[str, Any]] = []
    seen = set()
    i = 0

    while i < len(lines):
        ln = lines[i]

        if re.fullmatch(r"(microsoft|mircosoft)", ln.strip(), re.I):
            i += 1
            continue

        name = ln
        issuer = ""
        date = ""

        if i + 1 < len(lines) and re.fullmatch(r"(microsoft|mircosoft)", lines[i + 1], re.I):
            issuer = "Microsoft"
            i += 1

        if i + 1 < len(lines):
            m = DATE_RE.search(lines[i + 1])
            if m:
                date = f"{m.group(1).title()} {m.group(2)}"
                i += 1

        m_inline = DATE_RE.search(name)
        if m_inline:
            date = f"{m_inline.group(1).title()} {m_inline.group(2)}"
            name = name[:m_inline.start()].strip()

        base = re.sub(r"\bmircosoft\b", "Microsoft", name, flags=re.I)
        if not issuer and re.search(r"\bmicrosoft\b", base, re.I):
            issuer = "Microsoft"
            base = re.sub(r"\bmicrosoft\b", "", base, flags=re.I).strip()

        name = re.sub(r"\s{2,}", " ", base).strip()
        if not name:
            i += 1
            continue

        key = (clean(name), clean(issuer), clean(date))
        if key in seen:
            i += 1
            continue
        seen.add(key)

        description_items = [x for x in [issuer, date] if x]
        embedding_text = " ".join([name, issuer, date]).strip()

        items.append({
            "name": name,
            "issuer": issuer,
            "date": date,
            "description_items": description_items,
            "embedding_text": embedding_text
        })
        i += 1

    return items