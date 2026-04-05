# Server Architecture

## Overview

The server is an ASP.NET Core backend split into API, application, domain, infrastructure, and persistence projects.

## Projects

- `SkillSense.Api/`: controllers, authentication wiring, HTTP composition, and API-specific concerns.
- `SkillSense.Application/`: contracts, service interfaces, orchestration logic, and cross-domain application workflows.
- `SkillSense.Domain/`: domain entities and core business concepts.
- `SkillSense.Infrastructure/`: external-service integrations and runtime implementations.
- `SkillSense.Persistence/`: Entity Framework data access and repositories.

## Controller Guidance

- Controllers should stay thin and delegate business workflows to application services.
- Reusable request contracts belong in `SkillSense.Application/Contracts/...`, not nested inside controllers.
- User/company request context should be resolved consistently before calling services.

## Key Areas

- `SkillSense.Api/Controllers/AccountController.cs`: account setup and setup-status endpoints.
- `SkillSense.Api/Controllers/AdminController.cs`: superadmin and company-admin management endpoints.
- `SkillSense.Api/Controllers/RecruiterController.cs`: recruiter jobs, applicants, offers, interviews, and dashboard flows.
- `SkillSense.Application/Contracts/Auth/AccountSetupRequests.cs`: reusable account setup request DTOs.
- `SkillSense.Application/Contracts/Interviews/RecruiterInterviewRequests.cs`: recruiter interview request DTOs.

## Search Labels

- `ACCOUNT SETUP`
- `ADMIN CONTROLLER`
- `RECRUITER CONTROLLER`
- `ACCOUNT SETUP REQUESTS`
- `RECRUITER INTERVIEW REQUESTS`
