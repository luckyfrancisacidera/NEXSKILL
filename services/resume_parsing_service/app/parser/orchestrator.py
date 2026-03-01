from typing import Any, Dict

from .extractors import extract_text_from_upload, normalize_text
from .sections import split_sections
from .summary import guess_summary
from .personal_info import (
    extract_full_name,
    extract_email,
    extract_phone,
    extract_location,
    extract_job_target,
)
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
    skill_matcher,
    title_matcher,
    exp_titles,
    edu_programs,
) -> Dict[str, Any]:
    raw = extract_text_from_upload(filename, content)
    text = normalize_text(raw)

    sections = split_sections(text)

    summary = guess_summary(sections, text)

    name = extract_full_name(nlp, text)
    email = extract_email(text)
    phone = extract_phone(text)
    location = extract_location(text)
    job_target = extract_job_target(nlp, text, title_matcher, exp_titles)

    skills = extract_skills_robust(sections.get("skills", ""), text, skill_matcher, nlp)

    experience = parse_experience(sections.get("work_experience", sections.get("experience", "")), exp_titles)
    education = parse_education(sections.get("education", ""), edu_programs)
    projects = parse_projects(sections.get("projects", ""), nlp, skill_matcher)
    certifications = parse_certifications(sections.get("certifications", ""))
    events = parse_events(sections.get("events", ""), nlp, skill_matcher)

    return {
        "filename": filename,
        "full_text": text,
        "sections": sections,
        "summary": summary,
        "name": name,
        "email": email,
        "phone": phone,
        "location": location,
        "job_target": job_target,
        "skills": skills,
        "experience": experience,
        "education": education,
        "projects": projects,
        "certifications": certifications,
        "events": events,
    }
