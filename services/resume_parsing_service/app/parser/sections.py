from typing import Dict, List, Tuple
from .utils import clean


DEFAULT_HEADERS = {
    "summary": [
        "summary", "professional summary", "profile", "professional profile",
        "about", "about me", "overview"
    ],
    "skills": [
        "skills", "technical skills", "core skills", "competencies",
        "tools", "technologies"
    ],
    "work_experience": [
        "experience", "work experience", "professional experience",
        "employment", "employment history", "work history", "career history"
    ],
    "education": [
        "education", "academic background", "academics"
    ],
    "projects": [
        "projects", "project experience", "key projects"
    ],
    "certifications": [
        "certifications", "certificates", "licenses", "licensing", "courses"
    ],
    "events": [
        "events", "hackathons", "competitions", "awards", "activities", "achievements"
    ],
}

def _looks_like_header_line(line: str) -> bool:
    if not line:
        return False
    if len(line) > 90:
        return False
    if len(line.split()) > 7:
        return False
    return True

def split_sections(text: str) -> Dict[str, str]:
    lines = [ln.strip() for ln in (text or "").splitlines()]
    if not lines:
        return {"raw": text}

    hits: List[Tuple[int, str]] = []
    for i, ln in enumerate(lines):
        if not _looks_like_header_line(ln):
            continue

        n = clean(ln.strip(":-–—|,•●"))

        for key, variants in DEFAULT_HEADERS.items():
            for v in variants:
                vv = clean(v)
                if n == vv or (vv in n and len(n.split()) <= 6):
                    hits.append((i, key))
                    break
            else:
                continue
            break

    hits.sort(key=lambda x: x[0])
    if not hits:
        return {"raw": text}

    sections: Dict[str, str] = {"raw": text}
    for idx, (start_i, key) in enumerate(hits):
        end_i = hits[idx + 1][0] if idx + 1 < len(hits) else len(lines)
        body = "\n".join(lines[start_i + 1:end_i]).strip()
        if body:
            sections[key] = (sections.get(key, "") + "\n\n" + body).strip() if key in sections else body

    return sections