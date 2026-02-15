import re
from typing import Dict, List
from .config import EMAIL_RE, PHONE_CANDIDATE_RE
from .utils import clean

def split_sentences(text: str) -> List[str]:
    text = " ".join((text or "").split())
    if not text:
        return []
    parts = re.split(r"(?<=[.!?])\s+", text)
    return [p.strip() for p in parts if p.strip()]

def _looks_like_section_header_line(s: str) -> bool:
    return clean(s) in {
        "summary","profile","skills","experience","work experience","education","projects","certifications","events",
        "employment history","work history"
    }

def guess_summary(sections: Dict[str, str], full_text: str) -> str:
    for k in ("summary",):
        if k in sections and sections[k].strip():
            return sections[k].strip()

    top = "\n".join((full_text or "").splitlines()[:60]).strip()
    paras = [p.strip() for p in re.split(r"\n\s*\n", top) if p.strip()]
    if not paras:
        return ""

    start_idx = 0
    if EMAIL_RE.search(paras[0]) or PHONE_CANDIDATE_RE.search(paras[0]):
        start_idx = 1

    for p in paras[start_idx:]:
        if _looks_like_section_header_line(p):
            continue
        cl = clean(p)
        if "skills" in cl or "experience" in cl or "education" in cl:
            continue
        if len(p.split()) >= 10:
            return p

    return paras[start_idx] if start_idx < len(paras) else ""