# Business Logic Flows

## Authentication and Route Access

1. `AuthProvider` hydrates `/api/auth/me` and normalizes roles before the client treats a session as valid.
2. `protectedLoader.ts` repeats the minimum auth/setup bootstrap outside React so route loaders can redirect safely before components mount.
3. `http.ts` retries one failed request after `/api/auth/refresh` and prevents concurrent 401s from stampeding the refresh endpoint.
4. `Program.cs` reads access tokens from cookies, and `AuthService` revalidates that the account and company are still active.

## Application Submission and ATS Processing

1. Jobseeker pages call `jobseeker.service.ts` to browse published jobs and submit `FormData` applications.
2. `JobSeekerService` rejects duplicate active applications for the same user/job before the upload is queued.
3. `ResumeUploadService` stores the resume in object storage and records a `Pending` submission immediately so the request stays responsive.
4. `ResumeProcessingService` later downloads the blob, calls the parser microservice, builds ATS scores, persists embeddings/scores, and marks failures explicitly.

## Recruiter Funnel, Interviews, and Offers

1. `recruiter.service.ts` is the client boundary for jobs, applicants, dashboard filters, offers, and interview mutations.
2. `RecruiterService` enforces recruiter-company ownership, valid job payloads, stage updates, remaining vacancies, and dashboard cache invalidation.
3. `InterviewService` requires shortlisted candidates, future schedules, and conflict-free calendars before persisting an interview.
4. Offer acceptance in `JobSeekerService` is transactional because it updates the offer, application, hire record, notifications, and dashboard cache together.

## Administrative Provisioning

1. `AdminManagementService` creates companies, company admins, and recruiters while enforcing uniqueness and actor/company access boundaries.
2. Activation flags on companies and users feed back into `AuthService`, which blocks inactive accounts from authenticating or refreshing sessions.

## Resume Parser Microservice

1. `main.py` validates parser resources and builds shared spaCy matchers during startup.
2. `orchestrator.py` and `parser_v2.py` normalize text, split sections, and delegate to focused extractors for personal info, skills, experience, education, projects, certifications, and events.
