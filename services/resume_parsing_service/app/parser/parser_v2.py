from __future__ import annotations

"""Hybrid parser that prefers local extraction and uses Groq only as an enhancement pass."""

import ast
import json
import os
import re
from datetime import date
from typing import Any, Dict, List, Optional, Tuple

import requests

from app.parser.extractors import extract_text_from_upload, normalize_text
from app.parser.orchestrator import parse_resume

from .base import ResumeParserBase
from .schema import validate_resume_schema


# =========================================
# PARSER V2 REGEX AND LOOKUP HELPERS
# =========================================

SENTENCE_SPLIT_RE = re.compile(r"(?<=[.!?])\s+(?=[A-Z0-9])")
SKILL_DELIM_RE = re.compile(r"[,;|\n]+")
DUP_MONTH_RE = re.compile(r"\b([A-Za-z]{3,9})\s+\1\b", re.IGNORECASE)
DATE_RANGE_RE = re.compile(
    r"^(?P<start>[A-Za-z]{3,9}\s+\d{4}|\d{4})\s*[-–—]\s*(?P<end>Present|Current|[A-Za-z]{3,9}\s+\d{4}|\d{4})$",
    re.IGNORECASE,
)
INLINE_EXP_RE = re.compile(
    r"^(?P<start>[A-Za-z]{3,9}\s+\d{4}|\d{4})\s*[-–—]\s*(?P<end>Present|Current|[A-Za-z]{3,9}\s+\d{4}|\d{4})\s+(?P<title>[^,]+),\s*(?P<company_loc>.+)$",
    re.IGNORECASE,
)
DATE_LOCATION_LINE_RE = re.compile(
    r"(?P<start>[A-Za-z]{3,9}\s+\d{4})\s*[-–—]\s*(?P<end>Present|Current|[A-Za-z]{3,9}\s+\d{4})",
    re.IGNORECASE,
)
FULL_DATE_RE = re.compile(
    r"\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t|tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},\s+\d{4}\b",
    re.IGNORECASE,
)
CERT_SPLIT_RE = re.compile(r"\s*[|•]\s*|\s+-\s+")
CATEGORY_PREFIX_RE = re.compile(
    r"^(frontend|backend|cloud\s*&\s*devops|devops|tools|database|databases|frameworks|libraries|skills?|technology|technologies)\s*:\s*",
    re.IGNORECASE,
)

MONTH_MAP = {
    "jan": 1,
    "january": 1,
    "feb": 2,
    "february": 2,
    "mar": 3,
    "march": 3,
    "apr": 4,
    "april": 4,
    "may": 5,
    "jun": 6,
    "june": 6,
    "jul": 7,
    "july": 7,
    "aug": 8,
    "august": 8,
    "sep": 9,
    "sept": 9,
    "september": 9,
    "oct": 10,
    "october": 10,
    "nov": 11,
    "november": 11,
    "dec": 12,
    "december": 12,
}

EDU_LEVEL_RANK = {
    "": 0,
    "high_school": 1,
    "associate": 2,
    "bachelor": 3,
    "master": 4,
    "doctorate": 5,
}


def normalize_dash_chars(text: str) -> str:
    return (text or "").replace("—", "-").replace("–", "-")


def parse_date_location_line(line: str) -> Optional[Dict[str, Any]]:
    cleaned = re.sub(r"\s+", " ", (line or "")).strip()
    if not cleaned:
        return None

    parts = [p.strip() for p in cleaned.split("|", 1)]
    left = normalize_dash_chars(parts[0])
    right = parts[1].strip() if len(parts) > 1 else ""

    m = re.search(
        r"(?P<start>[A-Za-z]{3,9}\s+\d{4})\s*-\s*(?P<end>Present|Current|[A-Za-z]{3,9}\s+\d{4})",
        left,
        re.IGNORECASE,
    )
    if not m:
        return None

    end_raw = m.group("end").strip()
    end_norm = "Present" if end_raw.lower() in {"present", "current"} else end_raw
    return {
        "start_date": m.group("start").strip(),
        "end_date": end_norm,
        "location": right,
        "is_current": end_norm.lower() == "present",
    }


def parse_resume_month(value: str, *, now: Optional[date] = None) -> Optional[Tuple[int, int]]:
    text = (value or "").strip()
    if not text:
        return None

    now = now or date.today()
    low = text.lower()
    if low in {"present", "current", "now"}:
        return now.year, now.month

    m = re.match(r"^([A-Za-z]{3,9})\s+(\d{4})$", text)
    if m:
        month = MONTH_MAP.get(m.group(1).lower())
        year = int(m.group(2))
        return (year, month) if month else None

    if re.match(r"^\d{4}$", text):
        return int(text), 1

    return None


def _month_index(ym: Tuple[int, int]) -> int:
    y, m = ym
    return y * 12 + (m - 1)


def _merge_month_ranges(ranges: List[Tuple[int, int]]) -> List[Tuple[int, int]]:
    if not ranges:
        return []
    ranges.sort(key=lambda x: x[0])
    merged = [ranges[0]]
    for start, end in ranges[1:]:
        last_start, last_end = merged[-1]
        if start <= last_end + 1:
            merged[-1] = (last_start, max(last_end, end))
        else:
            merged.append((start, end))
    return merged


def calculate_total_experience_months(work_experience: List[Dict[str, Any]], *, now: Optional[date] = None) -> int:
    now = now or date.today()
    ranges: List[Tuple[int, int]] = []

    for item in work_experience or []:
        if not isinstance(item, dict):
            continue
        start = parse_resume_month(str(item.get("start_date") or ""), now=now)
        end = parse_resume_month(str(item.get("end_date") or ""), now=now)
        if start is None:
            continue
        if end is None:
            if bool(item.get("is_current")):
                end = (now.year, now.month)
            else:
                continue

        start_idx = _month_index(start)
        end_idx = _month_index(end)
        if end_idx < start_idx:
            continue
        ranges.append((start_idx, end_idx))

    merged = _merge_month_ranges(ranges)
    return max(0, sum((e - s + 1) for s, e in merged))


def infer_education_level(degree_text: str) -> str:
    d = (degree_text or "").lower()
    if not d:
        return ""
    if any(x in d for x in ["phd", "doctor", "doctorate", "dphil"]):
        return "doctorate"
    if any(x in d for x in ["master", "msc", "m.sc", "ma ", "m.a", "mba", "m.eng"]):
        return "master"
    if any(x in d for x in ["bachelor", "bs", "b.s", "ba", "b.a", "bsc", "b.eng"]):
        return "bachelor"
    if any(x in d for x in ["associate", "aas", "a.a", "a.s"]):
        return "associate"
    if "high school" in d:
        return "high_school"
    return ""


def compute_education_max_level(education: List[Dict[str, Any]]) -> str:
    max_level = ""
    max_rank = 0
    for item in education or []:
        if not isinstance(item, dict):
            continue
        explicit = str(item.get("education_level") or "").strip().lower()
        inferred = infer_education_level(str(item.get("degree") or ""))
        level = explicit or inferred
        rank = EDU_LEVEL_RANK.get(level, 0)
        if rank > max_rank:
            max_rank = rank
            max_level = level
    return max_level


def compute_latest_job_title(work_experience: List[Dict[str, Any]], *, now: Optional[date] = None) -> str:
    now = now or date.today()
    best_title = ""
    best_idx = -1
    best_is_current = False

    for item in work_experience or []:
        if not isinstance(item, dict):
            continue
        title = str(item.get("job_title") or "").strip()
        if not title:
            continue

        end = parse_resume_month(str(item.get("end_date") or ""), now=now)
        start = parse_resume_month(str(item.get("start_date") or ""), now=now)
        is_current = bool(item.get("is_current")) or str(item.get("end_date") or "").strip().lower() in {"present", "current"}

        if is_current and not end:
            end = (now.year, now.month)

        idx = _month_index(end) if end else (_month_index(start) if start else -1)

        if best_title == "":
            best_title, best_idx, best_is_current = title, idx, is_current
            continue

        if is_current and not best_is_current:
            best_title, best_idx, best_is_current = title, idx, is_current
            continue

        if is_current == best_is_current and idx > best_idx:
            best_title, best_idx, best_is_current = title, idx, is_current

    return best_title


def extract_work_experience_dates_and_location(raw_text: str, work_experience: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    lines = [re.sub(r"\s+", " ", l).strip() for l in (raw_text or "").splitlines() if l.strip()]
    if not lines:
        return work_experience

    cursor = 0
    for idx, item in enumerate(work_experience):
        if not isinstance(item, dict):
            continue
        start_missing = not str(item.get("start_date") or "").strip()
        end_missing = not str(item.get("end_date") or "").strip()
        loc_missing = not str(item.get("location") or "").strip()
        if not (start_missing or end_missing or loc_missing):
            continue

        job = str(item.get("job_title") or "").strip().lower()
        company = str(item.get("company") or "").strip().lower()

        anchor = -1
        # Prefer exact job-title anchoring first, then company from current cursor.
        if job:
            for i in range(cursor, len(lines)):
                if job in lines[i].lower():
                    anchor = i
                    break
        if anchor < 0 and company:
            for i in range(cursor, len(lines)):
                if company in lines[i].lower():
                    anchor = i
                    break
        if anchor < 0:
            anchor = cursor

        left = max(0, anchor - 2)
        right = min(len(lines), anchor + 8)

        ordered_indices = list(range(anchor, right)) + list(range(left, anchor))
        parsed = None
        parsed_line_idx = -1
        for line_idx in ordered_indices:
            parsed = parse_date_location_line(lines[line_idx])
            if parsed:
                parsed_line_idx = line_idx
                break

        if parsed:
            if start_missing:
                item["start_date"] = parsed["start_date"]
            if end_missing:
                item["end_date"] = parsed["end_date"]
            if loc_missing and parsed.get("location"):
                item["location"] = parsed["location"]
            if parsed.get("is_current"):
                item["is_current"] = True
            cursor = max(cursor, parsed_line_idx + 1)

        work_experience[idx] = item

    return work_experience


class ParserV2(ResumeParserBase):
    version = "v2"

    def __init__(self, *, nlp, skill_matcher, title_matcher, exp_titles, edu_programs):
        self.nlp = nlp
        self.skill_matcher = skill_matcher
        self.title_matcher = title_matcher
        self.exp_titles = exp_titles
        self.edu_programs = edu_programs
        self.groq_api_key = os.getenv("GROQ_API_KEY", "")
        self.groq_model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

    def _parse_with_local(self, filename: str, content: bytes) -> Dict[str, Any]:
        # Always keep a deterministic local parse path so the service can succeed
        # when the external enhancement model is unavailable or returns unusable JSON.
        base = parse_resume(
            filename=filename,
            content=content,
            nlp=self.nlp,
            skill_matcher=self.skill_matcher,
            title_matcher=self.title_matcher,
            exp_titles=self.exp_titles,
            edu_programs=self.edu_programs,
        )
        validated = validate_resume_schema(base)
        return self._recompute_derived(validated)

    def _recompute_derived(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        # Derived fields are recomputed after every parse path so local and
        # model-enhanced outputs expose the same downstream contract.
        out = dict(payload or {})
        work = out.get("work_experience") if isinstance(out.get("work_experience"), list) else []
        education = out.get("education") if isinstance(out.get("education"), list) else []
        skills = out.get("skills") if isinstance(out.get("skills"), list) else []

        out["derived"] = {
            "total_experience_months": calculate_total_experience_months(work),
            "latest_job_title": compute_latest_job_title(work),
            "normalized_skills": sorted({str(s).strip().lower() for s in skills if str(s).strip()}),
            "education_max_level": compute_education_max_level(education),
        }
        return out

    def parse(self, filename: str, content: bytes):
        # Treat the LLM as an optional enrichment layer, not the source of truth:
        # local parsing must remain the safety net for production reliability.
        raw_text = normalize_text(extract_text_from_upload(filename, content))

        if not self.groq_api_key or not raw_text:
            return self._parse_with_local(filename, content)

        fallback_local = self._parse_with_local(filename, content)
        enhanced = self._enhance_with_groq(raw_text=raw_text)
        if enhanced is not None:
            cleaned = self._postprocess_groq_candidate(enhanced, raw_text=raw_text)
            validated = validate_resume_schema(cleaned)
            return self._recompute_derived(validated)

        return fallback_local

    def _enhance_with_groq(self, *, raw_text: str) -> Optional[Dict[str, Any]]:
        # The prompt is intentionally strict because downstream scoring expects
        # schema-shaped data, not best-effort prose or inferred resume details.
        prompt = {
            "task": "Strictly extract structured resume fields from raw text only.",
            "raw_resume_text": raw_text,
            "requirements": {
                "primary_source": "raw_resume_text",
                "do_not_hallucinate": True,
                "do_not_infer_unstated_values": True,
                "copy_text_as_is_when_possible": True,
                "categorize_into_schema_fields_only": True,
                "missing_values_must_be_empty": True,
                "skills_must_be_individual_items": True,
                "strip_skill_category_prefixes": ["Frontend:", "Backend:", "Cloud & DevOps:", "Tools:"],
                "summary_must_be_sentence_array": True,
                "bullets_must_be_string_array": True,
                "never_output_stringified_arrays": True,
                "work_date_location_line_format": "{Mon YYYY} - {Mon YYYY or Present} | {Location}",
                "work_date_location_line_examples": [
                    "Apr 2025 - Present | Makati, Philippines (Hybrid)",
                    "Sep 2023 - Mar 2025 | Pampanga, Philippines (Remote)",
                ],
                "work_date_location_rules": {
                    "detect_and_split_date_and_location": True,
                    "do_not_leave_empty_if_line_present": True,
                    "normalize_current_to_present": True,
                    "set_is_current_when_present": True,
                },
                "no_new_top_level_keys": True,
                "schema": {
                    "resume_id": "string",
                    "personal_info": {
                        "full_name": "string",
                        "email": "string",
                        "phone": "string",
                        "location": "string",
                        "job_target": "string",
                    },
                    "summary": "string[]",
                    "skills": "string[]",
                    "work_experience": "object[]",
                    "education": "object[]",
                    "projects": "object[]",
                    "events": "object[]",
                    "certifications": "object[]",
                },
            },
        }
        body = {
            "model": self.groq_model,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are a strict structured resume extractor. Parse only from the provided raw_resume_text. "
                        "Do not hallucinate. Do not infer unstated dates, companies, locations, institutions, or technologies. "
                        "Copy text as-is whenever possible and only map/categorize values into the given schema fields. "
                        "For work experience, detect lines in format 'Mon YYYY - Mon YYYY|Present | Location' and split them into start_date, end_date, and location. "
                        "Support dash variants -, –, —. If Present/Current appears, end_date must be 'Present' and is_current must be true. "
                        "Split grouped skill categories into individual skills and remove category labels. "
                        "Split bullets into arrays. Never output stringified arrays. "
                        "If data is missing, use empty string, empty array, false, or 0 per schema. "
                        "Return valid JSON object only."
                    ),
                },
                {"role": "user", "content": json.dumps(prompt)},
            ],
            "temperature": 0,
            "response_format": {"type": "json_object"},
        }

        try:
            resp = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {self.groq_api_key}", "Content-Type": "application/json"},
                json=body,
                timeout=20,
            )
        except requests.RequestException:
            return None

        if resp.status_code >= 400:
            return None

        try:
            data = resp.json()
        except ValueError:
            return None

        content = data.get("choices", [{}])[0].get("message", {}).get("content")
        if not content:
            return None
        try:
            candidate = json.loads(content)
            return candidate if isinstance(candidate, dict) else None
        except Exception:
            return None

    def _postprocess_groq_candidate(self, candidate: Dict[str, Any], *, raw_text: str) -> Dict[str, Any]:
        out = dict(candidate or {})
        out["summary"] = self._split_summary_sentences(out.get("summary"))
        out["skills"] = self._split_and_normalize_skills(out.get("skills"))

        out["work_experience"] = [self._normalize_work_item(x) for x in self._to_obj_list(out.get("work_experience"))]
        out["work_experience"] = extract_work_experience_dates_and_location(raw_text, out["work_experience"])

        out["projects"] = [self._normalize_project_item(x) for x in self._to_obj_list(out.get("projects"))]
        out["education"] = [self._normalize_education_item(x) for x in self._to_obj_list(out.get("education"))]
        out["certifications"] = [self._normalize_cert_item(x) for x in self._to_obj_list(out.get("certifications"))]
        out["events"] = [self._normalize_event_item(x) for x in self._to_obj_list(out.get("events"))]

        pi = out.get("personal_info") if isinstance(out.get("personal_info"), dict) else {}
        out["personal_info"] = {
            "full_name": self._s(pi.get("full_name")),
            "email": self._s(pi.get("email")),
            "phone": self._s(pi.get("phone")),
            "location": self._s(pi.get("location")),
            "job_target": self._s(pi.get("job_target")),
        }
        return out

    @staticmethod
    def _s(v: Any) -> str:
        return str(v).strip() if v is not None else ""

    def _parse_list_like(self, v: Any) -> Any:
        if not isinstance(v, str):
            return v
        t = v.strip()
        if not (t.startswith("[") and t.endswith("]")):
            return v
        try:
            parsed = ast.literal_eval(t)
            return parsed if isinstance(parsed, list) else v
        except Exception:
            return v

    def _to_str_list(self, v: Any) -> List[str]:
        v = self._parse_list_like(v)
        if isinstance(v, list):
            return [self._s(x) for x in v if self._s(x)]
        if isinstance(v, str) and v.strip():
            return [v.strip()]
        return []

    def _to_obj_list(self, v: Any) -> List[Dict[str, Any]]:
        v = self._parse_list_like(v)
        if not isinstance(v, list):
            return []
        return [x for x in v if isinstance(x, dict)]

    def _split_summary_sentences(self, summary: Any) -> List[str]:
        parts: List[str] = []
        for item in self._to_str_list(summary):
            parts.extend([p.strip() for p in SENTENCE_SPLIT_RE.split(item) if p.strip()])
        return parts

    def _split_skill_token(self, token: str) -> List[str]:
        tok = CATEGORY_PREFIX_RE.sub("", token).strip(" -•:\t")
        if not tok:
            return []

        results: List[str] = []
        m = re.search(r"^([^()]+)\(([^)]+)\)$", tok)
        if m:
            base = m.group(1).strip()
            extra = m.group(2).strip()
            if base:
                results.append(base)
            if extra:
                results.append(extra)
        else:
            results.append(tok)

        cleaned = []
        for r in results:
            r = re.sub(r"\s+", " ", r).strip(" ,;")
            if r and not CATEGORY_PREFIX_RE.match(r + ":"):
                cleaned.append(r)
        return cleaned

    def _split_and_normalize_skills(self, skills: Any) -> List[str]:
        entries = self._to_str_list(skills)
        raw_tokens: List[str] = []
        for entry in entries:
            for part in SKILL_DELIM_RE.split(entry):
                part = part.strip()
                if part:
                    raw_tokens.append(part)

        final: List[str] = []
        seen = set()
        for tok in raw_tokens:
            for candidate in self._split_skill_token(tok):
                key = candidate.lower()
                if key not in seen:
                    seen.add(key)
                    final.append(candidate)
        return final

    def _split_date_range(self, text: str) -> Dict[str, str]:
        parsed = parse_date_location_line(text)
        if parsed:
            return {"start_date": parsed["start_date"], "end_date": parsed["end_date"]}

        m = DATE_RANGE_RE.match(self._s(text))
        if not m:
            return {"start_date": "", "end_date": ""}
        end = self._s(m.group("end"))
        end = "Present" if end.lower() in {"present", "current"} else end
        return {"start_date": self._s(m.group("start")), "end_date": end}

    def _normalize_work_item(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        item = dict(raw)
        bullets = self._to_str_list(item.get("bullets") or item.get("description_items"))

        description = self._s(item.get("description") or item.get("embedding_text"))
        maybe_desc_list = self._parse_list_like(description)
        if isinstance(maybe_desc_list, list) and not bullets:
            bullets = [self._s(x) for x in maybe_desc_list if self._s(x)]
            description = ""

        technologies = self._split_and_normalize_skills(item.get("technologies"))

        header = self._s(item.get("job_title"))
        m = INLINE_EXP_RE.match(header)
        if m:
            item["start_date"] = self._s(item.get("start_date")) or self._s(m.group("start"))
            item["end_date"] = self._s(item.get("end_date")) or self._s(m.group("end"))
            item["job_title"] = self._s(m.group("title"))
            comp_loc = self._s(m.group("company_loc"))
            if not self._s(item.get("company")):
                item["company"] = comp_loc

        # Parse date/location from explicit date line values if Groq packed these into one field.
        for field in ["start_date", "end_date", "location", "company"]:
            raw_field_value = self._s(item.get(field))
            parsed = parse_date_location_line(raw_field_value)
            if not parsed:
                continue
            if field in {"start_date", "end_date"}:
                item["start_date"] = parsed["start_date"]
                item["end_date"] = parsed["end_date"]
            else:
                if not self._s(item.get("start_date")):
                    item["start_date"] = parsed["start_date"]
                if not self._s(item.get("end_date")):
                    item["end_date"] = parsed["end_date"]
            if not self._s(item.get("location")) and parsed.get("location"):
                item["location"] = parsed["location"]
            if parsed.get("is_current"):
                item["is_current"] = True

        if self._s(item.get("start_date")) and not self._s(item.get("end_date")):
            split = self._split_date_range(self._s(item.get("start_date")))
            if split["start_date"]:
                item["start_date"] = split["start_date"]
                item["end_date"] = split["end_date"]
        if self._s(item.get("end_date")) and not self._s(item.get("start_date")):
            split = self._split_date_range(self._s(item.get("end_date")))
            if split["start_date"]:
                item["start_date"] = split["start_date"]
                item["end_date"] = split["end_date"]

        start_date = DUP_MONTH_RE.sub(r"\1", self._s(item.get("start_date")))
        end_date = DUP_MONTH_RE.sub(r"\1", self._s(item.get("end_date")))
        if end_date.lower() in {"current", "present"}:
            end_date = "Present"
        is_current = bool(item.get("is_current")) or end_date.lower() == "present"

        return {
            "job_title": self._s(item.get("job_title")),
            "company": self._s(item.get("company")),
            "location": self._s(item.get("location")),
            "start_date": start_date,
            "end_date": end_date,
            "is_current": is_current,
            "duration_months": int(item.get("duration_months") or 0),
            "description": description,
            "bullets": bullets,
            "technologies": technologies,
        }

    def _normalize_project_item(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        item = dict(raw)
        bullets = self._to_str_list(item.get("bullets") or item.get("description_items"))
        description = self._s(item.get("description") or item.get("embedding_text"))

        maybe_desc_list = self._parse_list_like(description)
        if isinstance(maybe_desc_list, list) and not bullets:
            bullets = [self._s(x) for x in maybe_desc_list if self._s(x)]
            description = ""

        technologies = self._split_and_normalize_skills(item.get("technologies"))
        return {
            "name": self._s(item.get("name") or item.get("project_name")),
            "description": description,
            "bullets": bullets,
            "technologies": technologies,
        }

    def _normalize_education_item(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        item = dict(raw)
        degree = self._s(item.get("degree"))
        institution = self._s(item.get("institution"))

        start_date = DUP_MONTH_RE.sub(r"\1", self._s(item.get("start_date")))
        end_date = DUP_MONTH_RE.sub(r"\1", self._s(item.get("end_date")))

        if start_date and not end_date:
            split = self._split_date_range(start_date)
            if split["start_date"]:
                start_date, end_date = split["start_date"], split["end_date"]

        # Handle lines like "Graduated in July 9, 2023 | Novaliches QC, Philippines"
        hay = " | ".join(
            [
                degree,
                institution,
                self._s(item.get("description")),
                self._s(item.get("details")),
                self._s(item.get("date")),
                start_date,
                end_date,
            ]
        )
        m = FULL_DATE_RE.search(hay)
        if m and not end_date:
            end_date = m.group(0)

        return {
            "degree": degree,
            "field_of_study": self._s(item.get("field_of_study")),
            "institution": institution,
            "start_date": start_date,
            "end_date": end_date,
            "education_level": self._s(item.get("education_level")) or infer_education_level(degree),
        }

    def _normalize_cert_item(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        item = dict(raw)
        name = self._s(item.get("name"))
        issuer = self._s(item.get("issuer"))
        issue_date = self._s(item.get("issue_date") or item.get("date"))

        if name and (not issuer or not issue_date):
            parts = [p.strip() for p in CERT_SPLIT_RE.split(name) if p.strip()]
            if len(parts) == 3 and not issuer and not issue_date:
                name, issuer, issue_date = parts
            elif len(parts) == 2 and not issuer:
                name, issuer = parts

        issue_date = DUP_MONTH_RE.sub(r"\1", issue_date)
        return {"name": name, "issuer": issuer, "issue_date": issue_date}

    def _normalize_event_item(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        item = dict(raw)
        name = self._s(item.get("name") or item.get("event_name"))
        description = self._s(item.get("description") or item.get("embedding_text"))

        if not description:
            extras = [
                self._s(item.get("issuer")),
                self._s(item.get("organizer")),
                self._s(item.get("location")),
                self._s(item.get("date")),
            ]
            description = " | ".join([x for x in extras if x])

        return {
            "name": name,
            "description": description,
        }
