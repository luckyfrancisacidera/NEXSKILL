import uuid
from typing import Any, Dict, Optional, Set
from spacy.matcher import PhraseMatcher

from .extractors import extract_text_from_upload, normalize_text
from .sections import split_sections
from .personal_info import extract_email, extract_phone, extract_full_name, extract_location
from .summary import guess_summary, split_sentences
from .skills import extract_skills_robust  
from .experience import parse_experience
from .education import parse_education
from .projects import parse_projects
from .certifications import parse_certifications
from .events import parse_events

def parse_resume(
    filename: str,
    content: bytes,
    nlp,
    skill_matcher: PhraseMatcher,
    exp_titles: Optional[Set[str]] = None,
    edu_institutions: Optional[Set[str]] = None,
    edu_programs: Optional[Set[str]] = None,
) -> Dict[str, Any]:
    raw = extract_text_from_upload(filename, content)

    print("\n" + "="*80)
    print("RAW EXTRACT (FIRST 120 LINES)")
    print("="*80)

    for i, line in enumerate(raw.splitlines(), start=1):
        print(f"{i:03d} | {line}")
        if i >= 120:
            print("... (truncated)")
            break

    raw_text = normalize_text(raw)
    sections = split_sections(raw_text)

    email = extract_email(raw_text)
    phone = extract_phone(raw_text, default_region="PH")
    full_name = extract_full_name(nlp, raw_text)
    location = extract_location(raw_text)

    summary_text = guess_summary(sections, raw_text)
    summary_sentences = split_sentences(summary_text) if summary_text else []

    skills_text = sections.get("skills", "") or ""
    skill_items = extract_skills_robust(skills_text, raw_text, skill_matcher, nlp)

    exp_text = sections.get("work_experience", "") or ""
    edu_text = sections.get("education", "") or ""
    proj_text = sections.get("projects", "") or ""
    cert_text = sections.get("certifications", "") or ""
    events_text = sections.get("events", "") or ""

    exp_titles = exp_titles or set()
    edu_institutions = edu_institutions or set()
    edu_programs = edu_programs or set()

    experience_items = parse_experience(exp_text, exp_titles) if exp_text else []
    education_items = parse_education(edu_text, edu_programs) if edu_text else []
    project_items = parse_projects(proj_text, nlp, skill_matcher) if proj_text else []
    cert_items = parse_certifications(cert_text) if cert_text else []
    event_items = parse_events(events_text, nlp, skill_matcher) if events_text else []

    return {
        "resume_id": str(uuid.uuid4()),
        "personal_info": {
            "full_name": full_name,
            "email": email,
            "phone": phone,
            "location": location
        },
        "summary": {
            "sentences": [{"text": s} for s in summary_sentences]
        },
        "skills": {
            "items": skill_items,
            "text": skills_text.strip()
        },
        "work_experience": experience_items,
        "education": education_items,
        "projects": project_items,
        "events": event_items,
        "certifications": cert_items,
    }