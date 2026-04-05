# Resume Parsing Service File Reference

This reference covers the FastAPI parser service, including parser orchestration modules, extraction helpers, resource loaders, and service-specific runtime configuration.

## Coverage
- Documented files: 31
- Groups: 10

## services/resume_parsing_service/.dockerignore

### `services/resume_parsing_service/.dockerignore`
- **File overview:** Repository or environment metadata file that shapes local development defaults without containing runtime business logic.
- **Responsibilities:** Repository support file for developer workflow and local environment conventions.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** No direct business rules live here. Its value is operational clarity, reproducible environments, or developer guidance.
- **Data flow:** Maintainers update this file -> tooling, environments, or readers consume it -> downstream runtime behavior stays consistent without feature code changes.
- **Edge cases / constraints:** Constraints are operational rather than domain-driven: syntax, environment compatibility, and maintainability matter most.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 51 lines. Side effects: Operational/configuration only.

## services/resume_parsing_service/ARCHITECTURE.md

### `services/resume_parsing_service/ARCHITECTURE.md`
- **File overview:** Human-facing project documentation for the surrounding module.
- **Responsibilities:** Existing human-facing documentation.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** No direct business rules live here. Its value is operational clarity, reproducible environments, or developer guidance.
- **Data flow:** Maintainers update this file -> tooling, environments, or readers consume it -> downstream runtime behavior stays consistent without feature code changes.
- **Edge cases / constraints:** Constraints are operational rather than domain-driven: syntax, environment compatibility, and maintainability matter most.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 26 lines. Side effects: Operational/configuration only.

## services/resume_parsing_service/Dockerfile

### `services/resume_parsing_service/Dockerfile`
- **File overview:** Deployment/runtime config for the surrounding project.
- **Responsibilities:** Deployment and hosting support file.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** No direct business rules live here. Its value is operational clarity, reproducible environments, or developer guidance.
- **Data flow:** Maintainers update this file -> tooling, environments, or readers consume it -> downstream runtime behavior stays consistent without feature code changes.
- **Edge cases / constraints:** Constraints are operational rather than domain-driven: syntax, environment compatibility, and maintainability matter most.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 22 lines. Side effects: Operational/configuration only.

## services/resume_parsing_service/app/__init__.py

### `services/resume_parsing_service/app/__init__.py`
- **File overview:** Maintained module `__init__` in the codebase.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through module exports.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 0 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## services/resume_parsing_service/app/main.py

### `services/resume_parsing_service/app/main.py`
- **File overview:** FastAPI entrypoint for the resume parser microservice and shared NLP resource bootstrap.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `AppState` (class), `lifespan` (function), `health` (function), `parse` (function)
- **Business logic:** Startup validates parser resources and builds shared matchers, while request handlers fail fast on empty uploads and keep parser-version responses consistent.
- **Data flow:** Inputs arrive through callers and dependencies (asyncio, contextlib, spacy, fastapi) -> focused transformation -> outputs leave through AppState, lifespan, health.
- **Edge cases / constraints:** File payload shape and content metadata matter here. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses asyncio, contextlib, spacy, fastapi, dotenv, app.resources. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 87 lines. Side effects: file uploads/form data

## services/resume_parsing_service/app/parser

### `services/resume_parsing_service/app/parser/__init__.py`
- **File overview:** Resume parser submodule for `__init__` that handles one focused extraction or normalization concern.
- **Responsibilities:** Resume parsing pipeline step.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** This file affects the quality and consistency of structured resume data used later by ATS scoring and recruiter review.
- **Data flow:** Parser input -> focused extraction/normalization using .orchestrator -> structured fragment output.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses .orchestrator. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 3 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `services/resume_parsing_service/app/parser/base.py`
- **File overview:** Resume parser submodule for `base` that handles one focused extraction or normalization concern.
- **Responsibilities:** Resume parsing pipeline step.
- **Key functions / classes:** `ResumeParserBase` (class)
- **Business logic:** This file affects the quality and consistency of structured resume data used later by ATS scoring and recruiter review.
- **Data flow:** Parser input -> focused extraction/normalization using __future__, abc, typing -> structured fragment output.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses __future__, abc, typing. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 12 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `services/resume_parsing_service/app/parser/bullets.py`
- **File overview:** Resume parser submodule for `bullets` that handles one focused extraction or normalization concern.
- **Responsibilities:** Resume parsing pipeline step.
- **Key functions / classes:** `normalize_bullets` (function)
- **Business logic:** This file affects the quality and consistency of structured resume data used later by ATS scoring and recruiter review.
- **Data flow:** Parser input -> focused extraction/normalization using re, typing -> structured fragment output.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses re, typing. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 25 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `services/resume_parsing_service/app/parser/certifications.py`
- **File overview:** Resume parser submodule for `certifications` that handles one focused extraction or normalization concern.
- **Responsibilities:** Resume parsing pipeline step.
- **Key functions / classes:** `parse_certifications` (function)
- **Business logic:** This file affects the quality and consistency of structured resume data used later by ATS scoring and recruiter review.
- **Data flow:** Parser input -> focused extraction/normalization using re, typing, .config, .utils -> structured fragment output.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses re, typing, .config, .utils. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 72 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `services/resume_parsing_service/app/parser/config.py`
- **File overview:** Resume parser submodule for `config` that handles one focused extraction or normalization concern.
- **Responsibilities:** Resume parsing pipeline step.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** This file affects the quality and consistency of structured resume data used later by ATS scoring and recruiter review.
- **Data flow:** Parser input -> focused extraction/normalization using re -> structured fragment output.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses re. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 29 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `services/resume_parsing_service/app/parser/dates.py`
- **File overview:** Resume parser submodule for `dates` that handles one focused extraction or normalization concern.
- **Responsibilities:** Resume parsing pipeline step.
- **Key functions / classes:** `parse_date_range` (function)
- **Business logic:** This file affects the quality and consistency of structured resume data used later by ATS scoring and recruiter review.
- **Data flow:** Parser input -> focused extraction/normalization using re, typing, .config -> structured fragment output.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses re, typing, .config. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 38 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `services/resume_parsing_service/app/parser/education.py`
- **File overview:** Resume parser submodule for `education` that handles one focused extraction or normalization concern.
- **Responsibilities:** Resume parsing pipeline step.
- **Key functions / classes:** `_looks_like_institution` (function), `_looks_like_degree` (function), `parse_education` (function)
- **Business logic:** This file affects the quality and consistency of structured resume data used later by ATS scoring and recruiter review.
- **Data flow:** Parser input -> focused extraction/normalization using re, typing, .config, .dates -> structured fragment output.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses re, typing, .config, .dates, .bullets, .utils. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 167 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `services/resume_parsing_service/app/parser/events.py`
- **File overview:** Resume parser submodule for `events` that handles one focused extraction or normalization concern.
- **Responsibilities:** Resume parsing pipeline step.
- **Key functions / classes:** `parse_events` (function)
- **Business logic:** This file affects the quality and consistency of structured resume data used later by ATS scoring and recruiter review.
- **Data flow:** Parser input -> focused extraction/normalization using re, typing, spacy.matcher, .config -> structured fragment output.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses re, typing, spacy.matcher, .config, .bullets, .skills. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 53 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `services/resume_parsing_service/app/parser/experience.py`
- **File overview:** Resume parser submodule for `experience` that handles one focused extraction or normalization concern.
- **Responsibilities:** Resume parsing pipeline step.
- **Key functions / classes:** `parse_date_range` (function), `_calculate_duration_display` (function), `is_bullet` (function), `_strip_punct` (function), `_looks_like_section_header` (function), `_build_title_index` (function)
- **Business logic:** This file affects the quality and consistency of structured resume data used later by ATS scoring and recruiter review.
- **Data flow:** Parser input -> focused extraction/normalization using re, typing, datetime, .config -> structured fragment output.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses re, typing, datetime, .config, .bullets, .utils. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 236 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `services/resume_parsing_service/app/parser/extractors.py`
- **File overview:** Resume parser submodule for `extractors` that handles one focused extraction or normalization concern.
- **Responsibilities:** Resume parsing pipeline step.
- **Key functions / classes:** `_words_to_lines` (function), `extract_text_from_upload` (function), `normalize_text` (function), `extract_years_of_experience` (function), `score_years_of_experience` (function)
- **Business logic:** This file affects the quality and consistency of structured resume data used later by ATS scoring and recruiter review.
- **Data flow:** Parser input -> focused extraction/normalization using io, re, typing, pdfplumber -> structured fragment output.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses io, re, typing, pdfplumber, docx, itertools. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 162 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `services/resume_parsing_service/app/parser/factory.py`
- **File overview:** Resume parser submodule for `factory` that handles one focused extraction or normalization concern.
- **Responsibilities:** Resume parsing pipeline step.
- **Key functions / classes:** `normalize_parser_version` (function), `build_parser` (function)
- **Business logic:** This file affects the quality and consistency of structured resume data used later by ATS scoring and recruiter review.
- **Data flow:** Parser input -> focused extraction/normalization using __future__, os, .parser_v1, .parser_v2 -> structured fragment output.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses __future__, os, .parser_v1, .parser_v2. Used by services/resume_parsing_service/app/main.py
- **Operational notes:** Approx. 23 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `services/resume_parsing_service/app/parser/matchers.py`
- **File overview:** Resume parser submodule for `matchers` that handles one focused extraction or normalization concern.
- **Responsibilities:** Resume parsing pipeline step.
- **Key functions / classes:** `build_phrase_matcher` (function)
- **Business logic:** This file affects the quality and consistency of structured resume data used later by ATS scoring and recruiter review.
- **Data flow:** Parser input -> focused extraction/normalization using typing, spacy.matcher -> structured fragment output.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses typing, spacy.matcher. Used by services/resume_parsing_service/app/main.py
- **Operational notes:** Approx. 9 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `services/resume_parsing_service/app/parser/orchestrator.py`
- **File overview:** Resume parser submodule for `orchestrator` that handles one focused extraction or normalization concern.
- **Responsibilities:** Resume parsing pipeline step.
- **Key functions / classes:** `parse_resume` (function)
- **Business logic:** This file affects the quality and consistency of structured resume data used later by ATS scoring and recruiter review.
- **Data flow:** Parser input -> focused extraction/normalization using uuid, typing, spacy.matcher, .extractors -> structured fragment output.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses uuid, typing, spacy.matcher, .extractors, .sections, .personal_info. Used by services/resume_parsing_service/app/parser/parser_v1.py
- **Operational notes:** Approx. 92 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `services/resume_parsing_service/app/parser/parser_v1.py`
- **File overview:** Resume parser submodule for `parser_v1` that handles one focused extraction or normalization concern.
- **Responsibilities:** Resume parsing pipeline step.
- **Key functions / classes:** `ParserV1` (class)
- **Business logic:** This file affects the quality and consistency of structured resume data used later by ATS scoring and recruiter review.
- **Data flow:** Parser input -> focused extraction/normalization using __future__, app.parser.orchestrator, .base, .schema -> structured fragment output.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses __future__, app.parser.orchestrator, .base, .schema. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 29 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `services/resume_parsing_service/app/parser/parser_v2.py`
- **File overview:** Hybrid parser that combines deterministic extraction with optional LLM enhancement.
- **Responsibilities:** Resume parsing pipeline step.
- **Key functions / classes:** `ParserV2` (class), `normalize_dash_chars` (function), `parse_date_location_line` (function), `parse_resume_month` (function), `_month_index` (function), `_merge_month_ranges` (function)
- **Business logic:** The parser prefers local extraction first, then uses external AI as an enhancement step so the service remains cheaper and more resilient when enrichment is unavailable.
- **Data flow:** Parser input -> focused extraction/normalization using __future__, ast, json, os -> structured fragment output.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses __future__, ast, json, os, re, datetime. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 749 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `services/resume_parsing_service/app/parser/personal_info.py`
- **File overview:** Resume parser submodule for `personal_info` that handles one focused extraction or normalization concern.
- **Responsibilities:** Resume parsing pipeline step.
- **Key functions / classes:** `_top_lines` (function), `_first_nonempty_line` (function), `_best_match_from_matches` (function), `extract_job_target` (function), `extract_email` (function), `extract_phone` (function)
- **Business logic:** This file affects the quality and consistency of structured resume data used later by ATS scoring and recruiter review.
- **Data flow:** Parser input -> focused extraction/normalization using re, phonenumbers, typing, spacy.matcher -> structured fragment output.
- **Edge cases / constraints:** Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses re, phonenumbers, typing, spacy.matcher, rapidfuzz, .config. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 164 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `services/resume_parsing_service/app/parser/projects.py`
- **File overview:** Resume parser submodule for `projects` that handles one focused extraction or normalization concern.
- **Responsibilities:** Resume parsing pipeline step.
- **Key functions / classes:** `_looks_like_tech_line` (function), `_looks_like_project_title` (function), `parse_projects` (function)
- **Business logic:** This file affects the quality and consistency of structured resume data used later by ATS scoring and recruiter review.
- **Data flow:** Parser input -> focused extraction/normalization using typing, spacy.matcher, .bullets, .skills -> structured fragment output.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses typing, spacy.matcher, .bullets, .skills, .summary, .utils. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 84 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `services/resume_parsing_service/app/parser/schema.py`
- **File overview:** Resume parser submodule for `schema` that handles one focused extraction or normalization concern.
- **Responsibilities:** Resume parsing pipeline step.
- **Key functions / classes:** `_s` (function), `_arr` (function), `_bool` (function), `_int` (function), `normalize_resume_schema` (function), `validate_resume_schema` (function)
- **Business logic:** This file affects the quality and consistency of structured resume data used later by ATS scoring and recruiter review.
- **Data flow:** Parser input -> focused extraction/normalization using __future__, uuid, typing -> structured fragment output.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses __future__, uuid, typing. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 146 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `services/resume_parsing_service/app/parser/sections.py`
- **File overview:** Resume parser submodule for `sections` that handles one focused extraction or normalization concern.
- **Responsibilities:** Resume parsing pipeline step.
- **Key functions / classes:** `_looks_like_header_line` (function), `split_sections` (function)
- **Business logic:** This file affects the quality and consistency of structured resume data used later by ATS scoring and recruiter review.
- **Data flow:** Parser input -> focused extraction/normalization using typing, .utils -> structured fragment output.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses typing, .utils. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 74 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `services/resume_parsing_service/app/parser/skills.py`
- **File overview:** Resume parser submodule for `skills` that handles one focused extraction or normalization concern.
- **Responsibilities:** Resume parsing pipeline step.
- **Key functions / classes:** `is_good_skill` (function), `extract_skills_from_text` (function), `extract_skills_robust` (function)
- **Business logic:** This file affects the quality and consistency of structured resume data used later by ATS scoring and recruiter review.
- **Data flow:** Parser input -> focused extraction/normalization using re, typing, spacy.matcher, .config -> structured fragment output.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses re, typing, spacy.matcher, .config. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 60 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `services/resume_parsing_service/app/parser/summary.py`
- **File overview:** Resume parser submodule for `summary` that handles one focused extraction or normalization concern.
- **Responsibilities:** Resume parsing pipeline step.
- **Key functions / classes:** `split_sentences` (function), `_looks_like_section_header_line` (function), `guess_summary` (function)
- **Business logic:** This file affects the quality and consistency of structured resume data used later by ATS scoring and recruiter review.
- **Data flow:** Parser input -> focused extraction/normalization using re, typing, .config, .utils -> structured fragment output.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses re, typing, .config, .utils. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 42 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `services/resume_parsing_service/app/parser/utils.py`
- **File overview:** Resume parser submodule for `utils` that handles one focused extraction or normalization concern.
- **Responsibilities:** Resume parsing pipeline step.
- **Key functions / classes:** `clean` (function), `norm_spaces` (function), `strip_trailing_punct` (function), `looks_like_header_line` (function), `join_nonempty` (function), `drop_noise_lines` (function)
- **Business logic:** This file affects the quality and consistency of structured resume data used later by ATS scoring and recruiter review.
- **Data flow:** Parser input -> focused extraction/normalization using re, typing -> structured fragment output.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses re, typing. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 32 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## services/resume_parsing_service/app/resources.py

### `services/resume_parsing_service/app/resources.py`
- **File overview:** Maintained module `resources` in the codebase.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `ParserResourcePaths` (class), `_clean` (function), `resolve_parser_resource_paths` (function), `validate_parser_resource_paths` (function), `load_experience_gazetteer` (function), `load_education_programs` (function)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (dataclasses, pathlib, typing, json) -> focused transformation -> outputs leave through ParserResourcePaths, _clean, resolve_parser_resource_paths.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses dataclasses, pathlib, typing, json, os, pandas. Used by services/resume_parsing_service/app/main.py
- **Operational notes:** Approx. 94 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## services/resume_parsing_service/data/education.csv

### `services/resume_parsing_service/data/education.csv`
- **File overview:** Static data resource for `education` used by runtime code.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through module exports.
- **Edge cases / constraints:** Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 75999 lines. Side effects: cache reads/writes

## services/resume_parsing_service/data/experience.csv

### `services/resume_parsing_service/data/experience.csv`
- **File overview:** Static data resource for `experience` used by runtime code.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through module exports.
- **Edge cases / constraints:** Identity and access preconditions are enforced explicitly. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 265405 lines. Side effects: database reads

## services/resume_parsing_service/requirements.txt

### `services/resume_parsing_service/requirements.txt`
- **File overview:** Package manifest for the surrounding project.
- **Responsibilities:** Package/dependency definition for the surrounding project.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** No direct business rules live here. Its value is operational clarity, reproducible environments, or developer guidance.
- **Data flow:** Maintainers update this file -> tooling, environments, or readers consume it -> downstream runtime behavior stays consistent without feature code changes.
- **Edge cases / constraints:** Constraints are operational rather than domain-driven: syntax, environment compatibility, and maintainability matter most.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 19 lines. Side effects: Operational/configuration only.
