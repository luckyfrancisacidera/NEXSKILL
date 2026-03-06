from __future__ import annotations

from app.parser.orchestrator import parse_resume

from .base import ResumeParserBase
from .schema import validate_resume_schema


class ParserV1(ResumeParserBase):
    version = "v1"

    def __init__(self, *, nlp, skill_matcher, title_matcher, exp_titles, edu_programs):
        self.nlp = nlp
        self.skill_matcher = skill_matcher
        self.title_matcher = title_matcher
        self.exp_titles = exp_titles
        self.edu_programs = edu_programs

    def parse(self, filename: str, content: bytes):
        raw = parse_resume(
            filename=filename,
            content=content,
            nlp=self.nlp,
            skill_matcher=self.skill_matcher,
            title_matcher=self.title_matcher,
            exp_titles=self.exp_titles,
            edu_programs=self.edu_programs,
        )
        return validate_resume_schema(raw)
