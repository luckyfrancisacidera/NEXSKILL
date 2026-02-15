import re
from typing import List
from spacy.matcher import PhraseMatcher
from .config import KEEP_SHORT, NOISE_SKILLS

def is_good_skill(s: str) -> bool:
    s = s.strip().lower()
    if not s:
        return False
    if s in NOISE_SKILLS:
        return False
    if s in KEEP_SHORT:
        return True
    words = s.split()
    if len(words) > 4:
        return False
    if len(s) <= 2:
        return False
    if not re.search(r"[a-z0-9]", s):
        return False
    return True

def extract_skills_from_text(text: str, skill_matcher: PhraseMatcher, nlp) -> List[str]:
    if not text:
        return []
    doc = nlp(text)
    matches = skill_matcher(doc)

    found = set()
    for _, start, end in matches:
        span = doc[start:end].text.strip().lower()
        if span:
            found.add(span)

    cleaned = set()
    for s in found:
        s = s.replace("reactts", "react").replace("nextjs", "next.js")
        s = re.sub(r"\s+", " ", s).strip()
        if is_good_skill(s):
            cleaned.add(s)

    return sorted(cleaned)

def extract_skills_robust(skills_section_text: str, full_text: str, skill_matcher: PhraseMatcher, nlp) -> List[str]:
    skills_section_text = (skills_section_text or "").strip()
    base = extract_skills_from_text(skills_section_text, skill_matcher, nlp) if len(skills_section_text) >= 20 else []
    if len(base) >= 6:
        return base

    # fallback to full text
    all_sk = extract_skills_from_text(full_text, skill_matcher, nlp)
    return sorted(set(base) | set(all_sk))