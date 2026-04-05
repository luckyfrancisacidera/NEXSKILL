# Documentation Set

This folder contains onboarding-oriented documentation for the maintained Nexskill codebase.

## Scope
- Frontend application and tooling under `client`
- ASP.NET API, application, persistence, infrastructure, and tests under `server`
- Resume parsing microservice under `services/resume_parsing_service`
- Root and deployment/configuration files that affect local development or production behavior

## Exclusions
- Generated/vendor artifacts such as `node_modules`, `.pnpm-store`, `bin`, `obj`, `.venv`, `__pycache__`, and model binaries
- Generated files in this docs folder are not recursively documented
- Local secret values from `.env` are intentionally not expanded

## Documents
- [System Architecture](./system-architecture.md)
- [Business Logic Flows](./business-logic-flows.md)
- [Root and Ops File Reference](./root-and-ops-file-reference.md)
- [Client File Reference](./client-file-reference.md)
- [Server File Reference](./server-file-reference.md)
- [Service File Reference](./service-file-reference.md)

## Coverage Snapshot
- Root / ops files: 12
- Client files: 332
- Server files: 260
- Service files: 31
- Total documented files: 635