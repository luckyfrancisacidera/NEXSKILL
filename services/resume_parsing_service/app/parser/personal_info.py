import re
import phonenumbers
from typing import Set

from spacy.matcher import PhraseMatcher
from rapidfuzz import process, fuzz

from .config import EMAIL_RE, PHONE_CANDIDATE_RE


def _top_lines(raw_text: str, max_lines: int = 35, max_chars: int = 3500) -> str:
    lines = [l.rstrip() for l in raw_text.splitlines()]
    head = "\n".join(lines[:max_lines])
    return head[:max_chars]


def _first_nonempty_line(text: str) -> str:
    for l in text.splitlines():
        s = l.strip()
        if s:
            return s
    return ""


def _best_match_from_matches(doc, matches):
    best = None 
    best_key = None
    for _mid, start, end in matches:
        span_len = end - start
        key = (start, -span_len)
        if best_key is None or key < best_key:
            best_key = key
            best = (start, end)
    if not best:
        return ""
    s, e = best
    return doc[s:e].text.strip()


def extract_job_target(
    nlp,
    raw_text: str,
    title_matcher: PhraseMatcher,
    exp_titles: Set[str],
    *,
    max_lines: int = 35,
) -> str:
    if not title_matcher:
        return ""

    head = _top_lines(raw_text, max_lines=max_lines)

    # ---- A) HEADER-FIRST detection (most reliable) ----
    lines = [l.strip() for l in head.splitlines() if l.strip()]
    if not lines:
        return ""

    line1 = lines[0]
    line2 = lines[1] if len(lines) > 1 else ""

    # Case A1: "Name, Title"
    candidate = line1.split(",", 1)[1].strip() if "," in line1 else ""

    # Case A2: Two-line header: NAME then TITLE on next line (common in PDFs)
    # Only use line2 if line1 looks like a name-ish line (letters/spaces) and line2 is short
    if not candidate and line2:
        line1_letters = re.sub(r"[^A-Za-z\s]", "", line1).strip()
        if len(line1_letters) >= 6 and len(line1.split()) <= 6 and 2 <= len(line2.split()) <= 6:
            candidate = line2.strip()

    # 1) Exact phrase match on header candidate
    if candidate:
        doc_c = nlp(candidate)
        m = title_matcher(doc_c)
        if m:
            return _best_match_from_matches(doc_c, m)

        # 2) Fuzzy fallback on header candidate (handles typos like ENGINEEER)
        if exp_titles:
            r = process.extractOne(
                candidate,
                exp_titles,
                scorer=fuzz.token_sort_ratio,
                score_cutoff=85,
            )
            if r:
                return r[0]

    # ---- B) Controlled scan over top lines ----
    first_k_lines = "\n".join(lines[:3])
    doc_top = nlp(first_k_lines)
    m_top = title_matcher(doc_top)
    if m_top:
        return _best_match_from_matches(doc_top, m_top)

    # ---- C) Last resort fuzzy over first 3 lines ----
    if exp_titles:

        fuzzy_text = first_k_lines
        r = process.extractOne(
            fuzzy_text,
            exp_titles,
            scorer=fuzz.token_sort_ratio,
            score_cutoff=88,  
        )
        if r:
            return r[0]

    return ""


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