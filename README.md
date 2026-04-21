# NEXSKILL Deployment Notes for Production

## Architecture
- `client`: React 19 + Vite frontend, served as static assets by Nginx in Docker.
- `server`: ASP.NET Core API with EF Core, Identity, cookie-based JWT auth, resume worker, and health endpoints.
- `services/resume_parsing_service`: FastAPI parser used by the API for resume extraction.
- `PostgreSQL`: primary data store.

For the split-cloud deployment target (Vercel + Render + Supabase), see [DEPLOYMENT.md](/D:/NEXSKILL/DEPLOYMENT.md).

## Local Docker bring-up
1. Copy [`.env.example`](/D:/NEXSKILL/.env.example) to `.env` and fill in real values.
2. Set the required values first: `CONNECTIONSTRINGS__POSTGRESQL`, `JWT__KEY`, `CLIENT_ALLOWED_ORIGINS`, `PASSWORDRESET__FRONTENDBASEURL`, `RESUMEPARSER__BASEURL`, and at least one bootstrap admin account.
3. Enable SMTP only when you have real mail credentials. Leave `GMAIL_SMTP_ENABLED=false` in staging if mail delivery is intentionally disabled.
4. Start the stack with `docker compose up --build`.
5. Open the frontend at `http://localhost:8088`.
6. Check readiness at `http://localhost:5062/health/ready`.

## Bootstrap operator flow
- Set `BOOTSTRAP_SUPERADMIN_EMAIL` and `BOOTSTRAP_SUPERADMIN_PASSWORD` before the first non-development startup.
- Optionally set `BOOTSTRAP_RECRUITER_*` and `BOOTSTRAP_RECRUITER_COMPANY_ID` when you want a recruiter bootstrap account tied to an existing company.
- Legacy demo accounts that were locked for using the historical weak password are expected to stay locked. Do not unlock them in staging or production.
- Use the bootstrap superadmin to create replacement operator accounts, then rotate the bootstrap password after first login.
- If you intentionally need to reuse a locked demo account, reset its password through ASP.NET Identity tooling or direct database operations during maintenance, then rotate the password immediately.

## Production notes
- Keep `ENABLE_IDENTITY_SEEDING=false` outside local development.
- The `migrate` service runs controlled startup migrations and exits before the API starts.
- `CLIENT_ALLOWED_ORIGINS` and `PASSWORDRESET__FRONTENDBASEURL` must match the deployed frontend URL.
- For local-storage mode, uploaded files persist in the `api_storage` volume.
- For cloud storage mode, set `STORAGE_DRIVER=cloud` plus the `CLOUDFLARE_R2_*` variables.
- Secure-cookie auth requires TLS. Put the stack behind HTTPS termination before browser-based staging or production validation.
- The API honors forwarded proxy headers, so your reverse proxy must send `X-Forwarded-Proto`, `X-Forwarded-For`, and the original `Host`.
- `/health/live` is for process liveness and `/health/ready` is for deployment readiness. Use `/health/ready` after migrations, parser startup, and a smoke test submission.
- If `GMAIL_SMTP_REQUIRED=true`, the API fails startup when mail settings are incomplete. If `GMAIL_SMTP_ENABLED=false`, email-triggering flows log warnings and continue where the product allows it.
- Docker container logs use the `json-file` driver with rotation set to `10m` per file and `5` files per container to avoid unbounded disk growth.
- API log levels are environment-configurable through `LOGGING__LOGLEVEL__*`. The default staging posture keeps application, worker, readiness, auth, and email warnings visible while suppressing EF Core SQL statement spam.

## Staging-to-production checklist
1. Fill `.env` with real staging or production values and verify every required variable is present.
2. Confirm bootstrap credentials are unique, strong, and stored outside the repository.
3. Run `docker compose up --build` and wait for `migrate`, `parser`, `api`, and `web` to become healthy.
4. Verify `https://<host>/health/live` returns `200` and `https://<host>/health/ready` returns `200`.
5. Run a smoke test: recruiter login, jobseeker apply, recruiter shortlist, interview schedule, offer create, offer respond, hire.
6. Verify resume upload/download and parser/storage connectivity.
7. Enable SMTP and send a password-reset or interview-invite test before promoting beyond staging.

## Staging VPS deployment steps
1. Provision a VPS with Docker Engine, Docker Compose plugin, and enough persistent disk for PostgreSQL and resume storage.
2. Put the repo or built images on the server and create a real `.env` from [`.env.example`](/D:/NEXSKILL/.env.example).
3. Set staging values for `CLIENT_ALLOWED_ORIGINS`, `PASSWORDRESET__FRONTENDBASEURL`, JWT, DB credentials, parser URL, storage mode, bootstrap accounts, and optional SMTP/Groq values.
4. Point your TLS terminator or external reverse proxy at the `web` service, and forward `Host`, `X-Forwarded-For`, and `X-Forwarded-Proto`.
5. Start the stack with `docker compose pull` if using prebuilt images or `docker compose up --build -d` if building on-host.
6. Check `docker compose ps`, then inspect `docker compose logs migrate api parser web --tail=200` for startup issues.
7. Verify `https://<staging-host>/health/live` and `https://<staging-host>/health/ready`.
8. Run the post-deploy smoke test before opening staging to broader testers.
