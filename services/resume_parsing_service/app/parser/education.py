import re
from typing import Any, Dict, List, Set, Optional
from .config import MONTHS
from .dates import parse_date_range
from .bullets import normalize_bullets
from .utils import clean

DATE_SPAN_RE = re.compile(rf"\b({MONTHS})\b\s+\d{{4}}\s*[-–—]\s*(present|current|\b({MONTHS})\b\s+\d{{4}})", re.I)

def _looks_like_institution(line: str) -> bool:
    l = clean(line)
    return any(k in l for k in ["university", "college", "institute", "school", "academy", "polytechnic"])

def _looks_like_degree(line: str, program_set: Set[str]) -> bool:
    l = clean(line)
    if l in {clean(x) for x in program_set}:
        return True
    return any(k in l for k in ["bachelor", "master", "phd", "doctor", "associate", "b.s", "bsc", "bs ", "m.s", "msc"])

def parse_education(section_text: str, edu_programs: Set[str]) -> List[Dict[str, Any]]:
    lines = [l.strip() for l in (section_text or "").splitlines() if l.strip()]
    if not lines:
        return []

    items: List[Dict[str, Any]] = []
    i = 0

    while i < len(lines):
        ln = lines[i]

        m = DATE_SPAN_RE.search(ln)
        if m:
            date_part = m.group(0)
            institution = ln.replace(date_part, "").strip(" -–—|,")
            start_date, end_date = parse_date_range(date_part)

            degree = lines[i + 1] if i + 1 < len(lines) else ""
            j = i + 2
            desc = []
            while j < len(lines):
                if DATE_SPAN_RE.search(lines[j]) and _looks_like_institution(lines[j]):
                    break
                if _looks_like_institution(lines[j]) and j + 1 < len(lines) and _looks_like_degree(lines[j + 1], edu_programs):
                    break
                desc.append(lines[j])
                j += 1

            description_items = normalize_bullets(desc)
            embedding_text = " ".join([degree, institution, start_date, end_date, " ".join(description_items)]).strip()
            items.append({
                "degree": degree,
                "institution": institution,
                "start_date": start_date,
                "end_date": end_date,
                "description_items": description_items,
                "embedding_text": embedding_text
            })
            i = j
            continue

        if _looks_like_institution(ln) and i + 1 < len(lines) and _looks_like_degree(lines[i + 1], edu_programs):
            institution = ln
            degree = lines[i + 1]

            rest = lines[i + 2:]
            start_date, end_date = parse_date_range("\n".join(rest))
            description_items = normalize_bullets(rest)

            embedding_text = " ".join([degree, institution, start_date, end_date, " ".join(description_items)]).strip()
            items.append({
                "degree": degree,
                "institution": institution,
                "start_date": start_date,
                "end_date": end_date,
                "description_items": description_items,
                "embedding_text": embedding_text
            })
            break

        i += 1

    return items