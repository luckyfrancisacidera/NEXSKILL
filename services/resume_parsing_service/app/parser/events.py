import re
from typing import Any, Dict, List
from spacy.matcher import PhraseMatcher
from .config import MONTHS
from .bullets import normalize_bullets
from .skills import extract_skills_from_text
from .utils import clean

DATE_RE = re.compile(rf"\b{MONTHS}\b\s+\d{{1,2}},\s+\d{{4}}", re.I)

def parse_events(section_text: str, nlp, skill_matcher: PhraseMatcher) -> List[Dict[str, Any]]:
    lines = [l.strip() for l in (section_text or "").splitlines() if l.strip()]
    if not lines:
        return []

    anchors = [i for i, ln in enumerate(lines) if DATE_RE.search(ln)]
    if not anchors:
        anchors = [0]

    items: List[Dict[str, Any]] = []

    for k, a in enumerate(anchors):
        end_i = anchors[k + 1] if k + 1 < len(anchors) else len(lines)

        event_name = lines[a - 2] if a - 2 >= 0 else (lines[0] if lines else "")
        organization = lines[a - 1] if a - 1 >= 0 else ""
        when_where = lines[a]

        date = ""
        location = ""
        m = DATE_RE.search(when_where)
        if m:
            date = m.group(0)

        if "|" in when_where:
            location = when_where.split("|", 1)[1].strip()

        detail_lines = lines[a + 1:end_i] if a + 1 < end_i else []
        description_items = normalize_bullets(detail_lines)
        techs = extract_skills_from_text("\n".join([event_name, organization] + description_items), skill_matcher, nlp)
        embedding_text = " ".join([event_name, organization, date, location, " ".join(description_items)]).strip()

        items.append({
            "event_name": event_name,
            "organization": organization,
            "date": date,
            "location": location,
            "technologies": techs,
            "description_items": description_items,
            "embedding_text": embedding_text
        })

    return items