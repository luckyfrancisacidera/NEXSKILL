from typing import Any, Dict, List
from spacy.matcher import PhraseMatcher

from .bullets import normalize_bullets
from .skills import extract_skills_from_text, is_good_skill
from .summary import split_sentences
from .utils import clean

BULLETS = ("●", "•", "-", "–", "○")

def _looks_like_tech_line(s: str) -> bool:
    sl = s.lower().strip()
    if sl.startswith("technologies:"):
        return True
    if "," in s and len(s) <= 90 and len(s.split()) <= 12:
        return True
    return False

def _looks_like_project_title(line: str) -> bool:
    if not line or line.startswith(BULLETS):
        return False
    if len(line) > 70:
        return False
    cl = clean(line)
    if any(k in cl for k in ["experience", "education", "skills", "certifications", "employment"]):
        return False
    return len(line.split()) <= 7 and not line.endswith(".")

def parse_projects(section_text: str, nlp, skill_matcher: PhraseMatcher) -> List[Dict[str, Any]]:
    lines = [l.strip() for l in (section_text or "").splitlines() if l.strip()]
    if not lines:
        return []

    bullet_projects = [l for l in lines if l.startswith("●") and " - " in l]
    if len(bullet_projects) >= 2:
        items: List[Dict[str, Any]] = []
        for b in bullet_projects:
            text = b.lstrip("●").strip()
            parts = [p.strip() for p in text.split(" - ", 1)]
            project_name = parts[0]
            description = parts[1] if len(parts) == 2 else ""
            desc_items = split_sentences(description) if description else []
            techs = extract_skills_from_text(b, skill_matcher, nlp)
            embedding_text = " ".join([project_name, description]).strip()

            items.append({
                "project_name": project_name,
                "technologies": techs,
                "description_items": desc_items,
                "embedding_text": embedding_text
            })
        return items

    anchors = [i for i, ln in enumerate(lines) if _looks_like_project_title(ln)]
    if not anchors:
        return []

    items: List[Dict[str, Any]] = []
    for k, a in enumerate(anchors):
        end_i = anchors[k + 1] if k + 1 < len(anchors) else len(lines)
        name = lines[a]

        tech_line = ""
        start_desc = a + 1
        if start_desc < end_i and _looks_like_tech_line(lines[start_desc]):
            tech_line = lines[start_desc]
            start_desc += 1

        desc_block = lines[start_desc:end_i]
        description_items = normalize_bullets(desc_block)

        techs = extract_skills_from_text(" ".join([tech_line] + description_items), skill_matcher, nlp)
        techs = sorted(set([t for t in techs if is_good_skill(t)]))

        embedding_text = " ".join([name, tech_line, " ".join(description_items)]).strip()

        items.append({
            "project_name": name,
            "technologies": techs,
            "description_items": description_items,
            "embedding_text": embedding_text
        })

    return items