from __future__ import annotations

import json
import os
from typing import Any, Dict

import requests

from app.parser.orchestrator import parse_resume

from .base import ResumeParserBase
from .schema import validate_resume_schema


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

    def parse(self, filename: str, content: bytes):
        base = parse_resume(
            filename=filename,
            content=content,
            nlp=self.nlp,
            skill_matcher=self.skill_matcher,
            title_matcher=self.title_matcher,
            exp_titles=self.exp_titles,
            edu_programs=self.edu_programs,
        )
        if self.groq_api_key:
            enhanced = self._enhance_with_groq(base)
            return validate_resume_schema(enhanced)
        return validate_resume_schema(base)

    def _enhance_with_groq(self, parsed: Dict[str, Any]) -> Dict[str, Any]:
        prompt = {
            "task": "Improve extraction quality for summary, work bullets, technologies, education normalization, and skill normalization. Keep exact JSON schema and preserve factuality.",
            "input": parsed,
            "requirements": {
                "no_new_top_level_keys": True,
                "always_arrays": ["summary", "skills", "work_experience", "education", "projects", "events", "certifications"],
            },
        }
        body = {
            "model": self.groq_model,
            "messages": [
                {"role": "system", "content": "You are a strict resume JSON normalizer. Return only JSON."},
                {"role": "user", "content": json.dumps(prompt)},
            ],
            "temperature": 0,
            "response_format": {"type": "json_object"},
        }
        resp = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {self.groq_api_key}", "Content-Type": "application/json"},
            json=body,
            timeout=20,
        )
        if resp.status_code >= 400:
            return parsed

        data = resp.json()
        content = data.get("choices", [{}])[0].get("message", {}).get("content")
        if not content:
            return parsed
        try:
            candidate = json.loads(content)
            if isinstance(candidate, dict) and "input" in candidate and isinstance(candidate["input"], dict):
                candidate = candidate["input"]
            return candidate if isinstance(candidate, dict) else parsed
        except Exception:
            return parsed
