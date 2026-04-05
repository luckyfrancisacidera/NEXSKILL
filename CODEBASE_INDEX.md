# CODEBASE INDEX

This index maps the production codebase to the major search labels introduced during the refactor.

## Roots

- `client/`: React application for public, jobseeker, recruiter, company-admin, and super-admin experiences.
- `server/`: ASP.NET Core API plus application/domain/infrastructure layers.
- `services/resume_parsing_service/`: Python FastAPI microservice for resume parsing.

## Fast Search Labels

- `ROUTER COMPOSITION`: `client/src/app/routes/router.tsx`
- `PUBLIC ROUTES`: `client/src/app/routes/public.routes.tsx`
- `JOBSEEKER ROUTES`: `client/src/app/routes/jobseeker.routes.tsx`
- `RECRUITER ROUTES`: `client/src/app/routes/recruiter.routes.tsx`
- `COMPANY ADMIN ROUTES`: `client/src/app/routes/companyAdmin.routes.tsx`
- `SUPERADMIN ROUTES`: `client/src/app/routes/superAdmin.routes.tsx`
- `AUTH GUARDS`: `client/src/app/routes/protectedLoader.ts`
- `SHARED BUTTON`: `client/src/shared/ui/buttons/Button.tsx`
- `SHARED DROPDOWN`: `client/src/shared/ui/dropdowns/Dropdown.tsx`
- `SHARED MODAL`: `client/src/shared/ui/modals/ModalOverlay.tsx`
- `SHARED TYPES`: `client/src/shared/types/index.ts`
- `ACCOUNT SETUP`: `server/SkillSense.Api/Controllers/AccountController.cs`
- `ADMIN CONTROLLER`: `server/SkillSense.Api/Controllers/AdminController.cs`
- `RECRUITER CONTROLLER`: `server/SkillSense.Api/Controllers/RecruiterController.cs`
- `ACCOUNT SETUP REQUESTS`: `server/SkillSense.Application/Contracts/Auth/AccountSetupRequests.cs`
- `RECRUITER INTERVIEW REQUESTS`: `server/SkillSense.Application/Contracts/Interviews/RecruiterInterviewRequests.cs`
- `RESUME PARSER API`: `services/resume_parsing_service/app/main.py`
- `RESUME PARSE ORCHESTRATION`: `services/resume_parsing_service/app/parser/orchestrator.py`

## Architecture Guides

- `client/ARCHITECTURE.md`
- `server/ARCHITECTURE.md`
- `services/resume_parsing_service/ARCHITECTURE.md`
