# NEXSKILL Deployment Guide

## Target architecture
- Frontend: Vercel from `client`
- API: Render Docker Web Service from `server`
- Parser: Render Docker Web Service from `services/resume_parsing_service`
- Database: Supabase Postgres

## Frontend on Vercel
- Root directory: `client`
- Framework preset: `Vite`
- Install command: `pnpm install --frozen-lockfile`
- Build command: `pnpm build`
- Output directory: `dist`
- Environment variables:
  - `VITE_API_BASE_URL=https://<your-api-service>.onrender.com`
- Notes:
  - The frontend already sends credentials, so `VITE_API_BASE_URL` must point to the public API origin.
  - SPA rewrites are handled by [client/vercel.json](/D:/NEXSKILL/client/vercel.json).

## API on Render
- Service type: `Web Service`
- Runtime: `Docker`
- Root directory: `server`
- Dockerfile path: `Dockerfile`
- Container port: `8080` locally, and the app also respects Render's `PORT` variable at runtime.
- Required environment variables:
  - `ASPNETCORE_ENVIRONMENT=Production`
  - `CONNECTIONSTRINGS__POSTGRESQL=<Supabase direct connection string>`
  - `JWT__KEY=<strong random secret>`
  - `JWT__ISSUER=SkillSense`
  - `JWT__AUDIENCE=SkillSense.Client`
  - `CLIENT_ALLOWED_ORIGINS=https://<your-vercel-app>.vercel.app`
  - `PASSWORDRESET__FRONTENDBASEURL=https://<your-vercel-app>.vercel.app`
  - `RESUMEPARSER__BASEURL=https://<your-parser-service>.onrender.com`
  - `AUTHCOOKIES__SAMESITE=None`
  - `AUTHCOOKIES__SECURE=true`
  - `APPLY_MIGRATIONS_ON_STARTUP=true`
  - `ENABLE_IDENTITY_SEEDING=false`
  - `RUN_MIGRATIONS_ONLY=false`
  - `BOOTSTRAP_SUPERADMIN_EMAIL=<initial-admin-email>`
  - `BOOTSTRAP_SUPERADMIN_PASSWORD=<initial-admin-password>`
- Optional environment variables:
  - `AUTHCOOKIES__DOMAIN=` leave blank unless you intentionally need a custom cookie domain
  - `STORAGE_DRIVER=local` with Render persistent disk mounted to `/app/storage`, or `STORAGE_DRIVER=cloud` with `CLOUDFLARE_R2_*`
  - `GMAIL_SMTP_*`
  - `GROQ_*`
- Health endpoints:
  - `/health/live`
  - `/health/ready`

## Parser on Render
- Service type: `Web Service`
- Runtime: `Docker`
- Root directory: `services/resume_parsing_service`
- Dockerfile path: `Dockerfile`
- Container port: defaults to `8000` locally and respects Render's `PORT` variable in production.
- Environment variables:
  - `DATA_DIR=/app/data`
  - `EXPERIENCE_CSV=/app/data/experience.csv`
  - `EDUCATION_CSV=/app/data/education.csv`
  - `JZ_SKILLS_JSONL=/app/data/jz_skill_patterns.jsonl`
  - `DEFAULT_PARSER_VERSION=v2`
  - `GROQ_API_KEY=` optional
  - `GROQ_MODEL=llama-3.3-70b-versatile`
- Health endpoint:
  - `/health`
- Recommendation:
  - Keep this service private/internal if your Render plan supports private service-to-service access.
  - If it must be public, only expose the parser URL to the API through `RESUMEPARSER__BASEURL`.

## Supabase Postgres
- Get the connection string from:
  - Supabase Dashboard -> Project Settings -> Database -> Connection string
- Env var to set in the API:
  - `CONNECTIONSTRINGS__POSTGRESQL`
- Recommendation:
  - Prefer the direct connection string on port `5432` for EF Core migrations and the API.
  - Use the pooled connection string only if connection limits force it and you have verified your workflow against Supabase's pooler behavior.
  - Include SSL settings in the connection string, for example:
    - `SSL Mode=Require;Trust Server Certificate=true`

## Deploy order
1. Create the Supabase database and copy the direct Postgres connection string.
2. Deploy the parser on Render and confirm `https://<parser>/health` returns `200`.
3. Deploy the API on Render with the parser URL, Supabase connection string, JWT values, frontend origin, and bootstrap admin env vars.
4. Confirm the API responds on `/health/live` and `/health/ready`.
5. Deploy the frontend on Vercel with `VITE_API_BASE_URL` pointing at the API.
6. Run the smoke tests below.

## Smoke test checklist
- Open the Vercel site and confirm route refreshes work on a non-root page.
- Log in from the Vercel frontend and confirm the session persists across page reloads.
- Call `GET /api/auth/me` from the frontend and confirm it returns the authenticated user.
- Run logout and confirm cookies are cleared and protected pages redirect correctly.
- Upload a resume and confirm parsing succeeds.
- Confirm the API `ready` health check stays green after parser and database calls.
- Trigger a password reset flow and confirm generated links point back to the Vercel frontend.
- If using local storage on Render, verify a persistent disk is mounted to `/app/storage`.
