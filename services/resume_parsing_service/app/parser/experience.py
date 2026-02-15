import re
from typing import Any, Dict, List, Set, Tuple, Optional

from .config import MONTHS
from .dates import parse_date_range
from .bullets import normalize_bullets
from .utils import clean, norm_spaces

BULLET_PREFIXES = ("•", "●", "-", "–", "○")

DATE_SPAN_RE = re.compile(
    rf"\b({MONTHS})\b\s+\d{{4}}\s*[-–—]\s*(present|current|\b({MONTHS})\b\s+\d{{4}})",
    re.I
)

VERB_RE = re.compile(
    r"\b(optimized|designed|built|developed|led|managed|implemented|improved|reduced|increased|created|maintained|handled|ensured)\b",
    re.I
)

def is_bullet(s: str) -> bool:
    return (s or "").strip().startswith(BULLET_PREFIXES)

def _date_match(s: str) -> Optional[re.Match]:
    return DATE_SPAN_RE.search((s or "").strip())

def _strip_punct(s: str) -> str:
    return (s or "").strip(" \t-–—|,:")

def _looks_like_section_header(s: str) -> bool:
    return clean(s) in {
        "summary","skills","experience","work experience","professional experience",
        "education","projects","certifications","events","employment history","work history"
    }

def _split_company_and_title(header: str, title_set: Set[str]) -> Tuple[str, str]:
    h = norm_spaces(_strip_punct(header))
    hl = h.lower()

    m_at = re.search(r"\b(.+?)\s+\bat\b\s+(.+)$", h, re.I)
    if m_at:
        return m_at.group(2).strip(), m_at.group(1).strip()

    best = None
    best_len = 0
    for t in title_set:
        tl = clean(t)
        if not tl:
            continue
        m = re.search(rf"(?<!\w){re.escape(tl)}(?!\w)", hl)
        if m and len(tl) > best_len:
            best_len = len(tl)
            best = (m.start(), m.end())

    if best:
        s, e = best
        title = _strip_punct(h[s:e])
        company = _strip_punct((h[:s] + " " + h[e:]).strip())
        return company.strip(), title.strip()

    words = h.split()
    if len(words) >= 3:
        return " ".join(words[:-2]).strip(), " ".join(words[-2:]).strip()
    if len(words) == 2:
        return words[0], words[1]
    return "", h

def _fix_company_in_bullets(company: str, bullets: List[str]) -> Tuple[str, List[str]]:
    company = (company or "").strip()
    if company or not bullets:
        return company, bullets
    first = bullets[0].strip()
    if 2 <= len(first) <= 80 and not first.endswith(".") and not VERB_RE.search(first) and not any(ch.isdigit() for ch in first):
        return first, bullets[1:]
    return company, bullets

def parse_experience(section_text: str, title_set: Set[str]) -> List[Dict[str, Any]]:
    lines = [l.strip() for l in (section_text or "").splitlines() if l.strip()]
    if not lines:
        return []

    anchors = [i for i, ln in enumerate(lines) if _date_match(ln) and not is_bullet(ln)]
    if not anchors:
        return []

    items: List[Dict[str, Any]] = []

    for k, a in enumerate(anchors):
        end_i = anchors[k + 1] if k + 1 < len(anchors) else len(lines)

        date_line = lines[a]
        m = _date_match(date_line)
        date_part = m.group(0) if m else date_line
        start_date, end_date = parse_date_range(date_part)

        job_title = ""
        company = ""

        header_wo_date = _strip_punct(date_line.replace(date_part, ""))
        if header_wo_date and len(header_wo_date) >= 3:
            company, job_title = _split_company_and_title(header_wo_date, title_set)
        else:
            up1 = lines[a - 1] if a - 1 >= 0 else ""
            up2 = lines[a - 2] if a - 2 >= 0 else ""
            candidates = [c for c in [up2, up1] if c and not is_bullet(c) and not _looks_like_section_header(c)]

            if len(candidates) == 2:
                c0, c1 = candidates
                c0_has_title = any(clean(t) in clean(c0) for t in title_set)
                c1_has_title = any(clean(t) in clean(c1) for t in title_set)
                if c0_has_title and not c1_has_title:
                    job_title, company = c0, c1
                elif c1_has_title and not c0_has_title:
                    job_title, company = c1, c0
                else:
                    if len(c0.split()) <= len(c1.split()):
                        job_title, company = c0, c1
                    else:
                        job_title, company = c1, c0
            elif len(candidates) == 1:
                company, job_title = _split_company_and_title(candidates[0], title_set)

        desc_lines = lines[a + 1:end_i]
        description_items = normalize_bullets(desc_lines)
        company, description_items = _fix_company_in_bullets(company, description_items)

        embedding_text = " ".join([job_title, company, " ".join(description_items)]).strip()

        items.append({
            "job_title": job_title.strip(),
            "company": company.strip(),
            "start_date": start_date,
            "end_date": end_date,
            "description_items": description_items,
            "embedding_text": embedding_text
        })
    return items