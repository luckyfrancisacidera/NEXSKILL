# Docker Configuration

Docker artifacts now live beside each service so builds stay close to the code they package:

- [`/D:/NEXSKILL/client/Dockerfile`](/D:/NEXSKILL/client/Dockerfile)
- [`/D:/NEXSKILL/server/Dockerfile`](/D:/NEXSKILL/server/Dockerfile)
- [`/D:/NEXSKILL/services/resume_parsing_service/Dockerfile`](/D:/NEXSKILL/services/resume_parsing_service/Dockerfile)
- [`/D:/NEXSKILL/compose.yaml`](/D:/NEXSKILL/compose.yaml)

The stack includes:

- `web`: Nginx-served frontend with `/api` proxying to the ASP.NET API
- `api`: ASP.NET Core API on port `8080` inside the network
- `parser`: FastAPI resume parser on port `8000`
- `db`: PostgreSQL 16 with persistent storage
- `migrate`: one-shot migration container that runs before `api`

Staging and production notes:

- Terminate TLS in front of `web`; secure auth cookies require HTTPS in the browser.
- Forward `Host`, `X-Forwarded-For`, and `X-Forwarded-Proto` from your reverse proxy to Nginx/API.
- Set bootstrap account variables in `.env` before the first non-development startup.
- Keep `ENABLE_IDENTITY_SEEDING=false` outside development.
- Set `GMAIL_SMTP_REQUIRED=true` only when your environment must deliver live email.
- Container logs rotate with Docker `json-file` settings in [compose.yaml](/D:/NEXSKILL/compose.yaml) to limit disk growth while keeping recent diagnostics available through `docker compose logs`.
