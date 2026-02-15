import re
from typing import Tuple
from .config import MONTHS

DATE_RANGE_RE = re.compile(
    rf"""
    \b({MONTHS})\b\s+(\d{{4}})
    \s*[-–—]\s*
    (
      present|current
      |
      \b({MONTHS})\b\s+(\d{{4}})
    )
    """,
    re.I | re.X
)

def parse_date_range(text: str) -> Tuple[str, str]:
    t = (text or "").strip()
    if not t:
        return "", ""

    t = t.split("|", 1)[0].strip()

    m = DATE_RANGE_RE.search(t)
    if not m:
        return "", ""

    start_date = f"{m.group(1).title()} {m.group(2)}"
    end_raw = (m.group(3) or "").strip()

    if re.fullmatch(r"(present|current)", end_raw, re.I):
        end_date = "Present"
    else:
        end_date = re.sub(r"\s{2,}", " ", end_raw).strip()
        end_date = end_date.replace("Sept", "Sep").title()

    return start_date, end_date