from fastapi import FastAPI, UploadFile, File, HTTPException
from contextlib import asynccontextmanager
from pathlib import Path
import os

import spacy

from app.resources import (
    load_experience_gazetteer,
    load_education_programs,
    load_jz_skill_phrases,
)
from app.parser.orchestrator import parse_resume
from app.parser.matchers import build_phrase_matcher


class AppState:
    nlp = None
    skill_matcher = None
    exp_titles = set()
    exp_firms = set()
    edu_programs = set()


state = AppState()


@asynccontextmanager
async def lifespan(app: FastAPI):
    BASE_DIR = Path(__file__).resolve().parent.parent
    DATA_DIR = Path(os.getenv("DATA_DIR", str(BASE_DIR / "data")))

    EXPERIENCE_CSV = Path(os.getenv("EXPERIENCE_CSV", str(DATA_DIR / "experience.csv")))
    EDUCATION_CSV = Path(os.getenv("EDUCATION_CSV", str(DATA_DIR / "education.csv")))
    JZ_SKILLS_JSONL = Path(os.getenv("JZ_SKILLS_JSONL", str(DATA_DIR / "jz_skill_patterns.jsonl")))

    if not EXPERIENCE_CSV.exists():
        raise RuntimeError(f"experience.csv not found at: {EXPERIENCE_CSV}")
    if not EDUCATION_CSV.exists():
        raise RuntimeError(f"education.csv not found at: {EDUCATION_CSV}")

    state.nlp = spacy.load("en_core_web_sm")

    skills = load_jz_skill_phrases(str(JZ_SKILLS_JSONL))

    state.exp_titles, state.exp_firms = load_experience_gazetteer(EXPERIENCE_CSV)
    state.edu_programs = load_education_programs(EDUCATION_CSV)

    state.skill_matcher = build_phrase_matcher(state.nlp, skills, "SKILL")

    yield


app = FastAPI(title="Resume Parser Microservice", version="2.0.1", lifespan=lifespan)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/parse")
async def parse(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing filename")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file")

    try:
        return parse_resume(
            filename=file.filename,
            content=content,
            nlp=state.nlp,
            skill_matcher=state.skill_matcher,
            exp_titles=state.exp_titles,
            edu_programs=state.edu_programs,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Parsing failed: {str(e)}")