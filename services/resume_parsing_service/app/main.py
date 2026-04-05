"""FastAPI entrypoint for the resume parsing microservice."""

import asyncio
from contextlib import asynccontextmanager

import spacy
from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from dotenv import load_dotenv

from app.resources import (
    load_education_programs,
    load_experience_gazetteer,
    load_jz_skill_phrases,
    resolve_parser_resource_paths,
    validate_parser_resource_paths,
)
from app.parser.factory import build_parser
from app.parser.matchers import build_phrase_matcher

# =========================================
# RESUME PARSER API
# =========================================

class AppState:
    nlp = None
    skill_matcher = None
    title_matcher = None
    exp_titles = set()
    exp_firms = set()
    edu_programs = set()

load_dotenv()

state = AppState()

@asynccontextmanager
async def lifespan(app: FastAPI):
    resource_paths = resolve_parser_resource_paths()
    validate_parser_resource_paths(resource_paths)

    state.nlp = spacy.load("en_core_web_sm")

    skills = load_jz_skill_phrases(str(resource_paths.jz_skills_jsonl))
    state.exp_titles, state.exp_firms = load_experience_gazetteer(resource_paths.experience_csv)
    state.edu_programs = load_education_programs(resource_paths.education_csv)

    state.skill_matcher = build_phrase_matcher(state.nlp, skills, "SKILL")
    state.title_matcher = build_phrase_matcher(state.nlp, state.exp_titles, "JOB_TITLE")

    yield


app = FastAPI(title="Resume Parser Microservice", version="2.0.1", lifespan=lifespan)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/parse")
async def parse(file: UploadFile = File(...), parser_version: str = Query(default="v2")):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing filename")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file")

    try:
        parser = build_parser(
            parser_version,
            nlp=state.nlp,
            skill_matcher=state.skill_matcher,
            title_matcher=state.title_matcher,
            exp_titles=state.exp_titles,
            edu_programs=state.edu_programs,
        )
        result = await asyncio.to_thread(parser.parse, filename=file.filename, content=content)
        return {"parser_version": parser.version, "parsed_resume": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"ERROR in /parse: {error_details}")
        raise HTTPException(status_code=500, detail=f"Parsing failed: {str(e)}")
