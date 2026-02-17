import re
from typing import Any, Dict, List, Set, Tuple, Optional

from .config import MONTHS
from .dates import parse_date_range
from .bullets import normalize_bullets
from .utils import clean, norm_spaces

BULLET_PREFIXES = ("•", "●", "-", "–", "○")

DATE_SPAN_RE = re.compile(
    rf"\b({MONTHS})\b\s+\d{{4}}\s*[-–—]\s*(present|current|\b({MONTHS})\b\s+\d{{4}})",
    re.I,
)

VERB_RE = re.compile(
    r"\b(optimized|designed|built|developed|led|managed|implemented|improved|reduced|increased|created|maintained|handled|ensured)\b",
    re.I,
)

SECTION_HEADERS = {
    "summary",
    "skills",
    "experience",
    "work experience",
    "professional experience",
    "education",
    "projects",
    "certifications",
    "events",
    "employment history",
    "work history",
}

def is_bullet(s: str) -> bool:
    return (s or "").strip().startswith(BULLET_PREFIXES)


def _date_match(s: str) -> Optional[re.Match]:
    return DATE_SPAN_RE.search((s or "").strip())


def _strip_punct(s: str) -> str:
    return (s or "").strip(" \t-–—|,:")


def _looks_like_section_header(s: str) -> bool:
    return clean(s) in SECTION_HEADERS

def _build_title_index(title_set: Set[str]) -> Tuple[Set[Tuple[str, ...]], int]:
    phrases: Set[Tuple[str, ...]] = set()
    max_len = 1
    for t in title_set or set():
        ct = clean(t)
        if not ct:
            continue
        toks = tuple(ct.split())
        if not toks:
            continue
        phrases.add(toks)
        if len(toks) > max_len:
            max_len = len(toks)
    return phrases, max_len


def _find_title_span(tokens: List[str], title_phrases: Set[Tuple[str, ...]], max_len: int) -> Optional[Tuple[int, int]]:
    if not tokens or not title_phrases:
        return None

    best = None
    best_len = 0
    n = len(tokens)

    for i in range(n):
        for L in range(min(max_len, n - i), 0, -1):
            if L <= best_len:
                break
            if tuple(tokens[i : i + L]) in title_phrases:
                best = (i, i + L)
                best_len = L
                break

    return best


def _text_tokens(s: str) -> List[str]:
    return clean(s).split()


def _split_company_and_title(header: str, title_phrases: Set[Tuple[str, ...]], max_title_len: int) -> Tuple[str, str]:
    h = norm_spaces(_strip_punct(header))

    m_at = re.search(r"\b(.+?)\s+\bat\b\s+(.+)$", h, re.I)
    if m_at:
        return m_at.group(2).strip(), m_at.group(1).strip()

    tokens = _text_tokens(h)
    span = _find_title_span(tokens, title_phrases, max_title_len)

    if span:
        s, e = span
        title = " ".join(tokens[s:e]).strip()
        company_tokens = (tokens[:s] + tokens[e:])
        company = " ".join(company_tokens).strip()
        return _strip_punct(company), _strip_punct(title)

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
    if (
        2 <= len(first) <= 80
        and not first.endswith(".")
        and not VERB_RE.search(first)
        and not any(ch.isdigit() for ch in first)
    ):
        return first, bullets[1:]
    return company, bullets


def _contains_any_title(text: str, title_phrases: Set[Tuple[str, ...]], max_title_len: int) -> bool:
    tokens = _text_tokens(text)
    return _find_title_span(tokens, title_phrases, max_title_len) is not None


def parse_experience(section_text: str, title_set: Set[str]) -> List[Dict[str, Any]]:
    lines = [l.strip() for l in (section_text or "").splitlines() if l.strip()]
    if not lines:
        return []

    anchors = [i for i, ln in enumerate(lines) if _date_match(ln) and not is_bullet(ln)]
    if not anchors:
        return []

    title_phrases, max_title_len = _build_title_index(title_set or set())

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
            company, job_title = _split_company_and_title(header_wo_date, title_phrases, max_title_len)
        else:
            up1 = lines[a - 1] if a - 1 >= 0 else ""
            up2 = lines[a - 2] if a - 2 >= 0 else ""
            candidates = [c for c in (up2, up1) if c and not is_bullet(c) and not _looks_like_section_header(c)]

            if len(candidates) == 2:
                c0, c1 = candidates
                c0_has_title = _contains_any_title(c0, title_phrases, max_title_len)
                c1_has_title = _contains_any_title(c1, title_phrases, max_title_len)

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
                company, job_title = _split_company_and_title(candidates[0], title_phrases, max_title_len)

        desc_lines = lines[a + 1 : end_i]
        description_items = normalize_bullets(desc_lines)
        company, description_items = _fix_company_in_bullets(company, description_items)

        embedding_text = " ".join([job_title, company, " ".join(description_items)]).strip()

        items.append(
            {
                "job_title": job_title.strip(),
                "company": company.strip(),
                "start_date": start_date,
                "end_date": end_date,
                "description_items": description_items,
                "embedding_text": embedding_text,
            }
        )

    return items