# Resume Parsing Service Architecture

## Overview

This service is a FastAPI microservice responsible for parsing uploaded resumes into the normalized schema consumed by the platform.

## Main Areas

- `app/main.py`: FastAPI entrypoint, lifecycle bootstrap, health endpoint, and `/parse` endpoint.
- `app/resources.py`: parser seed-data loading and runtime resource path resolution.
- `app/parser/factory.py`: parser version selection.
- `app/parser/orchestrator.py`: high-level extraction, sectioning, and parsed-output assembly.
- `app/parser/schema.py`: schema normalization and validation helpers.
- `data/`: CSV and JSONL seed data used for parsing support.

## Runtime Flow

1. Lifespan startup resolves parser resource paths and validates required data files.
2. spaCy and phrase matchers are initialized once and stored in app state.
3. `/parse` selects the requested parser version and runs parsing off the main event loop.
4. Parser modules normalize the extracted content into the shared resume schema.

## Search Labels

- `RESUME PARSER API`
- `RESUME PARSE ORCHESTRATION`
