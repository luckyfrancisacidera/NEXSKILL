from __future__ import annotations

import uuid
from typing import Any, Dict, List


def _s(value: Any) -> str:
    return str(value).strip() if value is not None else ""


def _arr(value: Any) -> List[Any]:
    if isinstance(value, list):
        return value
    if value is None:
        return []
    if isinstance(value, str):
        return [x.strip() for x in value.split("\n") if x.strip()]
    return []


def _bool(value: Any) -> bool:
    return bool(value)


def _int(value: Any, default: int = 0) -> int:
    try:
        return int(value)
    except Exception:
        return default


def normalize_resume_schema(payload: Dict[str, Any]) -> Dict[str, Any]:
    p = payload or {}
    work_experience = []
    for raw in _arr(p.get("work_experience")):
        if not isinstance(raw, dict):
            continue
        bullets = _arr(raw.get("bullets") or raw.get("description_items"))
        techs = _arr(raw.get("technologies"))
        description = _s(raw.get("description") or raw.get("embedding_text"))
        work_experience.append(
            {
                "job_title": _s(raw.get("job_title")),
                "company": _s(raw.get("company")),
                "location": _s(raw.get("location")),
                "start_date": _s(raw.get("start_date")),
                "end_date": _s(raw.get("end_date")),
                "is_current": _bool(raw.get("is_current") or _s(raw.get("end_date")).lower() in {"present", "current"}),
                "duration_months": _int(raw.get("duration_months"), 0),
                "description": description,
                "bullets": [_s(x) for x in bullets if _s(x)],
                "technologies": [_s(x) for x in techs if _s(x)],
            }
        )

    education = []
    for raw in _arr(p.get("education")):
        if not isinstance(raw, dict):
            continue
        education.append(
            {
                "degree": _s(raw.get("degree")),
                "field_of_study": _s(raw.get("field_of_study")),
                "institution": _s(raw.get("institution")),
                "start_date": _s(raw.get("start_date")),
                "end_date": _s(raw.get("end_date")),
                "education_level": _s(raw.get("education_level")),
            }
        )

    projects = []
    for raw in _arr(p.get("projects")):
        if not isinstance(raw, dict):
            continue
        projects.append(
            {
                "name": _s(raw.get("name") or raw.get("project_name")),
                "description": _s(raw.get("description") or raw.get("embedding_text")),
                "bullets": [_s(x) for x in _arr(raw.get("bullets") or raw.get("description_items")) if _s(x)],
                "technologies": [_s(x) for x in _arr(raw.get("technologies")) if _s(x)],
            }
        )

    events = []
    for raw in _arr(p.get("events")):
        if not isinstance(raw, dict):
            continue
        events.append({"name": _s(raw.get("name") or raw.get("event_name")), "description": _s(raw.get("description") or raw.get("embedding_text"))})

    certifications = []
    for raw in _arr(p.get("certifications")):
        if not isinstance(raw, dict):
            continue
        certifications.append({"name": _s(raw.get("name")), "issuer": _s(raw.get("issuer")), "issue_date": _s(raw.get("issue_date") or raw.get("date"))})

    summary = [_s(x) for x in _arr(p.get("summary")) if _s(x)]
    skills = [_s(x) for x in _arr(p.get("skills")) if _s(x)]

    total_exp = sum(max(0, _int(x.get("duration_months"), 0)) for x in work_experience)
    latest_title = work_experience[0]["job_title"] if work_experience else ""

    return {
        "resume_id": _s(p.get("resume_id")) or str(uuid.uuid4()),
        "personal_info": {
            "full_name": _s((p.get("personal_info") or {}).get("full_name") if isinstance(p.get("personal_info"), dict) else ""),
            "email": _s((p.get("personal_info") or {}).get("email") if isinstance(p.get("personal_info"), dict) else ""),
            "phone": _s((p.get("personal_info") or {}).get("phone") if isinstance(p.get("personal_info"), dict) else ""),
            "location": _s((p.get("personal_info") or {}).get("location") if isinstance(p.get("personal_info"), dict) else ""),
            "job_target": _s((p.get("personal_info") or {}).get("job_target") if isinstance(p.get("personal_info"), dict) else ""),
        },
        "summary": summary,
        "skills": skills,
        "work_experience": work_experience,
        "education": education,
        "projects": projects,
        "events": events,
        "certifications": certifications,
        "derived": {
            "total_experience_months": total_exp,
            "latest_job_title": latest_title,
            "normalized_skills": sorted({s.lower() for s in skills}),
            "education_max_level": max([e["education_level"] for e in education], default=""),
        },
    }


def validate_resume_schema(payload: Dict[str, Any]) -> Dict[str, Any]:
    normalized = normalize_resume_schema(payload)
    required = [
        "resume_id",
        "personal_info",
        "summary",
        "skills",
        "work_experience",
        "education",
        "projects",
        "events",
        "certifications",
        "derived",
    ]
    missing = [k for k in required if k not in normalized]
    if missing:
        raise ValueError(f"Invalid parsed resume schema. Missing keys: {missing}")
    return normalized
