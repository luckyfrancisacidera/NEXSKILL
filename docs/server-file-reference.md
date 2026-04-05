# Server File Reference

This reference covers the ASP.NET API, application services, contracts, persistence, infrastructure integrations, and test coverage. The most important business rules live in application services and their collaborating repositories.

## Coverage
- Documented files: 260
- Groups: 53

## server/.dockerignore

### `server/.dockerignore`
- **File overview:** Repository or environment metadata file that shapes local development defaults without containing runtime business logic.
- **Responsibilities:** Repository support file for developer workflow and local environment conventions.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** No direct business rules live here. Its value is operational clarity, reproducible environments, or developer guidance.
- **Data flow:** Maintainers update this file -> tooling, environments, or readers consume it -> downstream runtime behavior stays consistent without feature code changes.
- **Edge cases / constraints:** Constraints are operational rather than domain-driven: syntax, environment compatibility, and maintainability matter most.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 47 lines. Side effects: Operational/configuration only.

## server/ARCHITECTURE.md

### `server/ARCHITECTURE.md`
- **File overview:** Human-facing project documentation for the surrounding module.
- **Responsibilities:** Existing human-facing documentation.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** No direct business rules live here. Its value is operational clarity, reproducible environments, or developer guidance.
- **Data flow:** Maintainers update this file -> tooling, environments, or readers consume it -> downstream runtime behavior stays consistent without feature code changes.
- **Edge cases / constraints:** Constraints are operational rather than domain-driven: syntax, environment compatibility, and maintainability matter most.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 35 lines. Side effects: Operational/configuration only.

## server/Dockerfile

### `server/Dockerfile`
- **File overview:** Deployment/runtime config for the surrounding project.
- **Responsibilities:** Deployment and hosting support file.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** No direct business rules live here. Its value is operational clarity, reproducible environments, or developer guidance.
- **Data flow:** Maintainers update this file -> tooling, environments, or readers consume it -> downstream runtime behavior stays consistent without feature code changes.
- **Edge cases / constraints:** Constraints are operational rather than domain-driven: syntax, environment compatibility, and maintainability matter most.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 30 lines. Side effects: Operational/configuration only.

## server/SkillSense.Api/Controllers

### `server/SkillSense.Api/Controllers/AccountController.cs`
- **File overview:** HTTP entrypoint for `AccountController` that translates requests into application-service calls.
- **Responsibilities:** API boundary: routing, authorization, context extraction, and response shaping.
- **Key functions / classes:** `AccountController` (class), `GetSetupStatus` (method), `CompleteRecruiterSetup` (method), `CompleteCompanyAdminSetup` (method)
- **Business logic:** Persistence is part of this file's transaction boundary.
- **Data flow:** HTTP request -> controller action -> delegated collaborators (Microsoft.AspNetCore.Authorization, Microsoft.AspNetCore.Mvc, Microsoft.EntityFrameworkCore, SkillSense.Api.Security) -> HTTP response.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. Identity and access preconditions are enforced explicitly.
- **Dependencies:** Uses Microsoft.AspNetCore.Authorization, Microsoft.AspNetCore.Mvc, Microsoft.EntityFrameworkCore, SkillSense.Api.Security, SkillSense.Application.Contracts.Auth, SkillSense.Persistence.Data. Used by Reached by external HTTP clients through routing.
- **Operational notes:** Approx. 198 lines. Side effects: HTTP/API calls, database writes

### `server/SkillSense.Api/Controllers/AdminController.cs`
- **File overview:** HTTP entrypoint for `AdminController` that translates requests into application-service calls.
- **Responsibilities:** API boundary: routing, authorization, context extraction, and response shaping.
- **Key functions / classes:** `AdminController` (class), `CreateUser` (method), `GetSuperAdminDashboard` (method), `GetSuperAdminUsers` (method), `CreateCompanyAccount` (method), `ActivateCompany` (method)
- **Business logic:** Validation and guard clauses protect downstream workflows from invalid state.
- **Data flow:** HTTP request -> controller action -> delegated collaborators (Microsoft.AspNetCore.Authorization, Microsoft.AspNetCore.Mvc, SkillSense.Api.Security, SkillSense.Application.Contracts.Admin.Request) -> HTTP response.
- **Edge cases / constraints:** Pagination is normalized or bounded. Identity and access preconditions are enforced explicitly.
- **Dependencies:** Uses Microsoft.AspNetCore.Authorization, Microsoft.AspNetCore.Mvc, SkillSense.Api.Security, SkillSense.Application.Contracts.Admin.Request, SkillSense.Application.Contracts.Admin.Response, SkillSense.Application.Contracts.Auth. Used by Reached by external HTTP clients through routing.
- **Operational notes:** Approx. 227 lines. Side effects: HTTP/API calls

### `server/SkillSense.Api/Controllers/AuthController.cs`
- **File overview:** HTTP entrypoint for `AuthController` that translates requests into application-service calls.
- **Responsibilities:** API boundary: routing, authorization, context extraction, and response shaping.
- **Key functions / classes:** `AuthController` (class), `Register` (method), `Login` (method), `Refresh` (method), `RequestPasswordReset` (method), `RequestPasswordResetPin` (method)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** HTTP request -> controller action -> delegated collaborators (Microsoft.AspNetCore.Authorization, Microsoft.AspNetCore.Identity, Microsoft.AspNetCore.Mvc, Microsoft.AspNetCore.RateLimiting) -> HTTP response.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. Identity and access preconditions are enforced explicitly.
- **Dependencies:** Uses Microsoft.AspNetCore.Authorization, Microsoft.AspNetCore.Identity, Microsoft.AspNetCore.Mvc, Microsoft.AspNetCore.RateLimiting, SkillSense.Api.Security, SkillSense.Application.Common. Used by Reached by external HTTP clients through routing.
- **Operational notes:** Approx. 346 lines. Side effects: HTTP/API calls, file uploads/form data

### `server/SkillSense.Api/Controllers/JobController.cs`
- **File overview:** HTTP entrypoint for `JobController` that translates requests into application-service calls.
- **Responsibilities:** API boundary: routing, authorization, context extraction, and response shaping.
- **Key functions / classes:** `JobController` (class), `GetJobs` (method), `GetById` (method)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** HTTP request -> controller action -> delegated collaborators (Microsoft.AspNetCore.Mvc, SkillSense.Application.Contracts.Recruiter.Response, SkillSense.Application.Contracts.Response, SkillSense.Application.Interfaces.Jobseeker) -> HTTP response.
- **Edge cases / constraints:** Pagination is normalized or bounded.
- **Dependencies:** Uses Microsoft.AspNetCore.Mvc, SkillSense.Application.Contracts.Recruiter.Response, SkillSense.Application.Contracts.Response, SkillSense.Application.Interfaces.Jobseeker. Used by Reached by external HTTP clients through routing.
- **Operational notes:** Approx. 26 lines. Side effects: HTTP/API calls, database reads

### `server/SkillSense.Api/Controllers/JobSeekerController.cs`
- **File overview:** HTTP entrypoint for `JobSeekerController` that translates requests into application-service calls.
- **Responsibilities:** API boundary: routing, authorization, context extraction, and response shaping.
- **Key functions / classes:** `JobSeekerController` (class), `Apply` (method), `Dashboard` (method), `MyApplications` (method), `ArchivedApplications` (method), `GetApplication` (method)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** HTTP request -> controller action -> delegated collaborators (Microsoft.AspNetCore.Authorization, Microsoft.AspNetCore.Mvc, SkillSense.Api.Security, SkillSense.Application.Contracts.Interviews) -> HTTP response.
- **Edge cases / constraints:** Pagination is normalized or bounded. Identity and access preconditions are enforced explicitly.
- **Dependencies:** Uses Microsoft.AspNetCore.Authorization, Microsoft.AspNetCore.Mvc, SkillSense.Api.Security, SkillSense.Application.Contracts.Interviews, SkillSense.Application.Contracts.Jobseeker.Request, SkillSense.Application.Contracts.Jobseeker.Response. Used by Reached by external HTTP clients through routing.
- **Operational notes:** Approx. 211 lines. Side effects: HTTP/API calls, database reads, email/calendar delivery, file uploads/form data

### `server/SkillSense.Api/Controllers/NotificationsController.cs`
- **File overview:** HTTP entrypoint for `NotificationsController` that translates requests into application-service calls.
- **Responsibilities:** API boundary: routing, authorization, context extraction, and response shaping.
- **Key functions / classes:** `NotificationsController` (class), `BulkDeleteNotificationsRequest` (record), `GetNotifications` (method), `MarkAsRead` (method), `MarkAllAsRead` (method), `DeleteBulk` (method)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** HTTP request -> controller action -> delegated collaborators (Microsoft.AspNetCore.Authorization, Microsoft.AspNetCore.Mvc, SkillSense.Api.Security, SkillSense.Application.Contracts.Notifications) -> HTTP response.
- **Edge cases / constraints:** Identity and access preconditions are enforced explicitly.
- **Dependencies:** Uses Microsoft.AspNetCore.Authorization, Microsoft.AspNetCore.Mvc, SkillSense.Api.Security, SkillSense.Application.Contracts.Notifications, SkillSense.Application.Interfaces. Used by Reached by external HTTP clients through routing.
- **Operational notes:** Approx. 64 lines. Side effects: HTTP/API calls, notifications

### `server/SkillSense.Api/Controllers/RecruiterController.cs`
- **File overview:** HTTP entrypoint for `RecruiterController` that translates requests into application-service calls.
- **Responsibilities:** API boundary: routing, authorization, context extraction, and response shaping.
- **Key functions / classes:** `RecruiterController` (class), `GetProfile` (method), `UpdateProfile` (method), `CreateJob` (method), `UpdateJob` (method), `DuplicateJob` (method)
- **Business logic:** Validation and guard clauses protect downstream workflows from invalid state.
- **Data flow:** HTTP request -> controller action -> delegated collaborators (Microsoft.AspNetCore.Authorization, Microsoft.AspNetCore.Mvc, SkillSense.Api.Security, SkillSense.Application.Contracts.Interviews) -> HTTP response.
- **Edge cases / constraints:** Pagination is normalized or bounded. Identity and access preconditions are enforced explicitly.
- **Dependencies:** Uses Microsoft.AspNetCore.Authorization, Microsoft.AspNetCore.Mvc, SkillSense.Api.Security, SkillSense.Application.Contracts.Interviews, SkillSense.Application.Contracts.Employees, SkillSense.Application.Contracts.Offers. Used by Reached by external HTTP clients through routing.
- **Operational notes:** Approx. 346 lines. Side effects: HTTP/API calls, database reads, email/calendar delivery, object storage, redirect/navigation

### `server/SkillSense.Api/Controllers/ResumeController.cs`
- **File overview:** HTTP entrypoint for `ResumeController` that translates requests into application-service calls.
- **Responsibilities:** API boundary: routing, authorization, context extraction, and response shaping.
- **Key functions / classes:** `ResumeController` (class), `Upload` (method), `ParseResume` (method), `GetEmbeddingsSummary` (method), `ScoreResume` (method)
- **Business logic:** Validation and guard clauses protect downstream workflows from invalid state.
- **Data flow:** HTTP request -> controller action -> delegated collaborators (SkillSense.Application.Contracts.Request, SkillSense.Application.Contracts.Response, SkillSense.Application.Interfaces, SkillSense.Application.Interfaces.Jobseeker) -> HTTP response.
- **Edge cases / constraints:** Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses SkillSense.Application.Contracts.Request, SkillSense.Application.Contracts.Response, SkillSense.Application.Interfaces, SkillSense.Application.Interfaces.Jobseeker, System.ComponentModel.DataAnnotations, SkillSense.Application.Validators. Used by Reached by external HTTP clients through routing.
- **Operational notes:** Approx. 69 lines. Side effects: HTTP/API calls, object storage, file uploads/form data

## server/SkillSense.Api/DatabaseStartupExtensions.cs

### `server/SkillSense.Api/DatabaseStartupExtensions.cs`
- **File overview:** Maintained module `DatabaseStartupExtensions` in the codebase.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `DatabaseStartupExtensions` (class), `ApplyMigrationsSafelyAsync` (method)
- **Business logic:** Persistence is part of this file's transaction boundary.
- **Data flow:** Inputs arrive through callers and dependencies (Microsoft.AspNetCore.Identity, Microsoft.EntityFrameworkCore, Npgsql, SkillSense.Domain.Entities) -> focused transformation -> outputs leave through DatabaseStartupExtensions, ApplyMigrationsSafelyAsync.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses Microsoft.AspNetCore.Identity, Microsoft.EntityFrameworkCore, Npgsql, SkillSense.Domain.Entities, SkillSense.Persistence.Data, SkillSense.Persistence.Seed. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 330 lines. Side effects: database writes, database reads

## server/SkillSense.Api/Health

### `server/SkillSense.Api/Health/DatabaseHealthCheck.cs`
- **File overview:** Health probe for `DatabaseHealthCheck` that reports readiness or dependency health.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `DatabaseHealthCheck` (class), `CheckHealthAsync` (method)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (Microsoft.EntityFrameworkCore, Microsoft.Extensions.Diagnostics.HealthChecks, SkillSense.Persistence.Data) -> focused transformation -> outputs leave through DatabaseHealthCheck, CheckHealthAsync.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Microsoft.EntityFrameworkCore, Microsoft.Extensions.Diagnostics.HealthChecks, SkillSense.Persistence.Data. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 16 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Api/Health/ResumeParserHealthCheck.cs`
- **File overview:** Health probe for `ResumeParserHealthCheck` that reports readiness or dependency health.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `ResumeParserHealthCheck` (class), `CheckHealthAsync` (method)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (Microsoft.Extensions.Diagnostics.HealthChecks) -> focused transformation -> outputs leave through ResumeParserHealthCheck, CheckHealthAsync.
- **Edge cases / constraints:** Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses Microsoft.Extensions.Diagnostics.HealthChecks. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 26 lines. Side effects: HTTP/API calls

### `server/SkillSense.Api/Health/ResumeProcessingHealthCheck.cs`
- **File overview:** Health probe for `ResumeProcessingHealthCheck` that reports readiness or dependency health.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `ResumeProcessingHealthCheck` (class), `CheckHealthAsync` (method)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (Microsoft.EntityFrameworkCore, Microsoft.Extensions.Diagnostics.HealthChecks, Microsoft.Extensions.Options, SkillSense.Application.Interfaces) -> focused transformation -> outputs leave through ResumeProcessingHealthCheck, CheckHealthAsync.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Microsoft.EntityFrameworkCore, Microsoft.Extensions.Diagnostics.HealthChecks, Microsoft.Extensions.Options, SkillSense.Application.Interfaces, SkillSense.Domain.Entities, SkillSense.Infrastructure.Options. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 75 lines. Side effects: database reads

## server/SkillSense.Api/Program.cs

### `server/SkillSense.Api/Program.cs`
- **File overview:** Bootstraps the ASP.NET Core API host, middleware pipeline, auth stack, health checks, rate limits, and global error handling.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** Startup contains important platform rules: cookie-based token reading, session revalidation, rate limiting, normalized validation errors, and migrations-only startup behavior.
- **Data flow:** Inputs arrive through callers and dependencies (System.IO, System.Text, System.Threading.RateLimiting, Microsoft.AspNetCore.Authentication.JwtBearer) -> focused transformation -> outputs leave through module exports.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. Identity and access preconditions are enforced explicitly. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses System.IO, System.Text, System.Threading.RateLimiting, Microsoft.AspNetCore.Authentication.JwtBearer, Microsoft.AspNetCore.DataProtection, Microsoft.AspNetCore.Diagnostics. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 360 lines. Side effects: HTTP/API calls, cache reads/writes

## server/SkillSense.Api/Properties

### `server/SkillSense.Api/Properties/launchSettings.json`
- **File overview:** Maintained module `launchSettings` in the codebase.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through module exports.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 23 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## server/SkillSense.Api/Security

### `server/SkillSense.Api/Security/CurrentUserContext.cs`
- **File overview:** Maintained module `CurrentUserContext` in the codebase.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `CurrentUserContext` (class), `GetUserId` (method), `GetRole` (method), `GetActiveCompanyId` (method), `GetActiveRecruiterProfileId` (method)
- **Business logic:** Validation and guard clauses protect downstream workflows from invalid state.
- **Data flow:** Inputs arrive through callers and dependencies (System.Security.Claims, SkillSense.Application.Common) -> focused transformation -> outputs leave through CurrentUserContext, GetUserId, GetRole.
- **Edge cases / constraints:** Identity and access preconditions are enforced explicitly.
- **Dependencies:** Uses System.Security.Claims, SkillSense.Application.Common. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 76 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## server/SkillSense.Api/SkillSense.Api.csproj

### `server/SkillSense.Api/SkillSense.Api.csproj`
- **File overview:** Build/tooling config for the surrounding project.
- **Responsibilities:** Compilation, bundling, linting, or tooling configuration.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** No direct business rules live here. Its value is operational clarity, reproducible environments, or developer guidance.
- **Data flow:** Maintainers update this file -> tooling, environments, or readers consume it -> downstream runtime behavior stays consistent without feature code changes.
- **Edge cases / constraints:** Constraints are operational rather than domain-driven: syntax, environment compatibility, and maintainability matter most.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 58 lines. Side effects: Operational/configuration only.

## server/SkillSense.Api/SkillSense.Api.http

### `server/SkillSense.Api/SkillSense.Api.http`
- **File overview:** Maintained module `SkillSense Api` in the codebase.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through module exports.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 4 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## server/SkillSense.Api/appsettings.Development.json

### `server/SkillSense.Api/appsettings.Development.json`
- **File overview:** Maintained module `appsettings Development` in the codebase.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through module exports.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 143 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## server/SkillSense.Api/appsettings.json

### `server/SkillSense.Api/appsettings.json`
- **File overview:** Maintained module `appsettings` in the codebase.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through module exports.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 154 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## server/SkillSense.Api/skill_aliases.json

### `server/SkillSense.Api/skill_aliases.json`
- **File overview:** Maintained module `skill_aliases` in the codebase.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through module exports.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 3447 lines. Side effects: HTTP/API calls

## server/SkillSense.Application.Tests/AuthServiceTests.cs

### `server/SkillSense.Application.Tests/AuthServiceTests.cs`
- **File overview:** Maintained module `AuthServiceTests` in the codebase.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `AuthServiceTests` (class), `TestUserManager` (class), `TestRoleManager` (class), `TestTokenService` (class), `TestAuthRepository` (class), `PassThroughSanitizer` (class)
- **Business logic:** Persistence is part of this file's transaction boundary.
- **Data flow:** Inputs arrive through callers and dependencies (Microsoft.AspNetCore.Identity, Microsoft.Extensions.Logging.Abstractions, Microsoft.Extensions.Options, SkillSense.Application.Contracts.Auth) -> focused transformation -> outputs leave through AuthServiceTests, TestUserManager, TestRoleManager.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses Microsoft.AspNetCore.Identity, Microsoft.Extensions.Logging.Abstractions, Microsoft.Extensions.Options, SkillSense.Application.Contracts.Auth, SkillSense.Application.Contracts.Email, SkillSense.Application.Interfaces. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 527 lines. Side effects: database writes, database reads, email/calendar delivery

## server/SkillSense.Application.Tests/AuthUserProfileMapperTests.cs

### `server/SkillSense.Application.Tests/AuthUserProfileMapperTests.cs`
- **File overview:** Maintained module `AuthUserProfileMapperTests` in the codebase.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `AuthUserProfileMapperTests` (class), `ToCurrentUserResponse_UsesStoredFirstAndLastName_WhenAvailable` (method), `ToCurrentUserResponse_UsesJobSeekerFullName_WhenIdentityNameFieldsAreMissing` (method), `ToCurrentUserResponse_LeavesNamesNull_WhenNoStoredNameExists` (method), `ToAccountProfileResponse_UsesStoredNamesAndRole` (method)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (SkillSense.Application.Services.Auth, SkillSense.Domain.Entities) -> focused transformation -> outputs leave through AuthUserProfileMapperTests, ToCurrentUserResponse_UsesStoredFirstAndLastName_WhenAvailable, ToCurrentUserResponse_UsesJobSeekerFullName_WhenIdentityNameFieldsAreMissing.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses SkillSense.Application.Services.Auth, SkillSense.Domain.Entities. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 91 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## server/SkillSense.Application.Tests/AutoMapperConfigurationTests.cs

### `server/SkillSense.Application.Tests/AutoMapperConfigurationTests.cs`
- **File overview:** Maintained module `AutoMapperConfigurationTests` in the codebase.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `AutoMapperConfigurationTests` (class), `ApplicationProfiles_AreValid` (method)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (AutoMapper, Microsoft.Extensions.Logging.Abstractions, SkillSense.Application) -> focused transformation -> outputs leave through AutoMapperConfigurationTests, ApplicationProfiles_AreValid.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses AutoMapper, Microsoft.Extensions.Logging.Abstractions, SkillSense.Application. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 19 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## server/SkillSense.Application.Tests/CandidateExplanationServiceTests.cs

### `server/SkillSense.Application.Tests/CandidateExplanationServiceTests.cs`
- **File overview:** Maintained module `CandidateExplanationServiceTests` in the codebase.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `CandidateExplanationServiceTests` (class), `StubExplanationProvider` (class), `RecordingCandidateExplanationRepository` (class), `GenerateForShortlistedAsync_UsesStructuredEvidenceToAvoidFalseMissingAndFalseExactClaims` (method), `GenerateForShortlistedAsync_PreservesStrongResponsibilityAndApiAlignment` (method), `GenerateForShortlistedAsync_ReportsTrueNotFoundGapWithoutOverclaiming` (method)
- **Business logic:** Persistence is part of this file's transaction boundary.
- **Data flow:** Inputs arrive through callers and dependencies (System.Text.Json, Microsoft.Extensions.Logging.Abstractions, SkillSense.Application.Contracts.Recruiter.Response, SkillSense.Application.Contracts.Response) -> focused transformation -> outputs leave through CandidateExplanationServiceTests, StubExplanationProvider, RecordingCandidateExplanationRepository.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System.Text.Json, Microsoft.Extensions.Logging.Abstractions, SkillSense.Application.Contracts.Recruiter.Response, SkillSense.Application.Contracts.Response, SkillSense.Application.Contracts.Scoring.Response, SkillSense.Application.Interfaces. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 302 lines. Side effects: database writes, database reads

## server/SkillSense.Application.Tests/IdentitySeederTests.cs

### `server/SkillSense.Application.Tests/IdentitySeederTests.cs`
- **File overview:** Maintained module `IdentitySeederTests` in the codebase.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `IdentitySeederTests` (class), `IsLegacySeedUser_ReturnsTrue_ForKnownLegacySeedUser` (method), `IsLegacySeedUser_ReturnsFalse_ForNonSeedBootstrapUser` (method)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (SkillSense.Domain.Entities, SkillSense.Persistence.Seed) -> focused transformation -> outputs leave through IdentitySeederTests, IsLegacySeedUser_ReturnsTrue_ForKnownLegacySeedUser, IsLegacySeedUser_ReturnsFalse_ForNonSeedBootstrapUser.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses SkillSense.Domain.Entities, SkillSense.Persistence.Seed. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 31 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## server/SkillSense.Application.Tests/InterviewServiceTests.cs

### `server/SkillSense.Application.Tests/InterviewServiceTests.cs`
- **File overview:** Maintained module `InterviewServiceTests` in the codebase.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `InterviewServiceTests` (class), `StubDateTimeProvider` (class), `RecordingInterviewCalendarService` (class), `RecordingInterviewInviteEmailSender` (class), `SentInvite` (record), `RecordingNotificationService` (class)
- **Business logic:** Validation and guard clauses protect downstream workflows from invalid state. Persistence is part of this file's transaction boundary.
- **Data flow:** Inputs arrive through callers and dependencies (SkillSense.Application.Contracts.Interviews, SkillSense.Application.Interfaces, SkillSense.Application.Services.Interviews, SkillSense.Domain.Entities) -> focused transformation -> outputs leave through InterviewServiceTests, StubDateTimeProvider, RecordingInterviewCalendarService.
- **Edge cases / constraints:** Pagination is normalized or bounded. Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses SkillSense.Application.Contracts.Interviews, SkillSense.Application.Interfaces, SkillSense.Application.Services.Interviews, SkillSense.Domain.Entities, SkillSense.Persistence.Interfaces, SkillSense.Persistence.Models. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 700 lines. Side effects: database writes, database reads, notifications, email/calendar delivery

## server/SkillSense.Application.Tests/JobSeekerServiceTests.cs

### `server/SkillSense.Application.Tests/JobSeekerServiceTests.cs`
- **File overview:** Maintained module `JobSeekerServiceTests` in the codebase.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `JobSeekerServiceTests` (class), `StubJobSeekerRepository` (class), `NoOpResumeUploadService` (class), `NoOpCacheService` (class), `StubDateTimeProvider` (class), `NoOpNotificationService` (class)
- **Business logic:** Validation and guard clauses protect downstream workflows from invalid state. Persistence is part of this file's transaction boundary.
- **Data flow:** Inputs arrive through callers and dependencies (SkillSense.Application.Contracts.Notifications, SkillSense.Application.Contracts.Response, SkillSense.Application.Interfaces, SkillSense.Application.Interfaces.Jobseeker) -> focused transformation -> outputs leave through JobSeekerServiceTests, StubJobSeekerRepository, NoOpResumeUploadService.
- **Edge cases / constraints:** Pagination is normalized or bounded. File payload shape and content metadata matter here. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses SkillSense.Application.Contracts.Notifications, SkillSense.Application.Contracts.Response, SkillSense.Application.Interfaces, SkillSense.Application.Interfaces.Jobseeker, SkillSense.Application.Services.Jobseeker, SkillSense.Domain.Entities. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 325 lines. Side effects: database writes, database reads, cache reads/writes, notifications, object storage

## server/SkillSense.Application.Tests/RecruiterServiceTests.cs

### `server/SkillSense.Application.Tests/RecruiterServiceTests.cs`
- **File overview:** Maintained module `RecruiterServiceTests` in the codebase.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `RecruiterServiceTests` (class), `InMemoryJobRepository` (class), `StubRecruiterRepository` (class), `StaticEmbeddingService` (class), `NoOpCacheService` (class), `RecordingCacheService` (class)
- **Business logic:** Validation and guard clauses protect downstream workflows from invalid state. Persistence is part of this file's transaction boundary.
- **Data flow:** Inputs arrive through callers and dependencies (AutoMapper, Microsoft.EntityFrameworkCore.Storage, Microsoft.Extensions.Logging.Abstractions, SkillSense.Application.Contracts.Notifications) -> focused transformation -> outputs leave through RecruiterServiceTests, InMemoryJobRepository, StubRecruiterRepository.
- **Edge cases / constraints:** Pagination is normalized or bounded. File payload shape and content metadata matter here.
- **Dependencies:** Uses AutoMapper, Microsoft.EntityFrameworkCore.Storage, Microsoft.Extensions.Logging.Abstractions, SkillSense.Application.Contracts.Notifications, SkillSense.Application.Contracts.Offers, SkillSense.Application.Contracts.Recruiter.Request. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 405 lines. Side effects: database writes, database reads, cache reads/writes, notifications, object storage

## server/SkillSense.Application.Tests/RecruiterStageTransition.cs

### `server/SkillSense.Application.Tests/RecruiterStageTransition.cs`
- **File overview:** Maintained module `RecruiterStageTransition` in the codebase.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `RecruiterStageTransitionTests` (class), `Reject_FromAnyActiveStage_IsAllowed` (method), `Reject_FromHired_IsRejected` (method), `Shortlist_FromInterview_IsAllowed` (method), `RemoveShortlist_FromShortlisted_GoesBackToCompleted` (method), `RemoveShortlist_DoesNotReject` (method)
- **Business logic:** Validation and guard clauses protect downstream workflows from invalid state.
- **Data flow:** Inputs arrive through callers and dependencies (System.Reflection, SkillSense.Application.Services.Recruiter, SkillSense.Domain.Entities) -> focused transformation -> outputs leave through RecruiterStageTransitionTests, Reject_FromAnyActiveStage_IsAllowed, Reject_FromHired_IsRejected.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System.Reflection, SkillSense.Application.Services.Recruiter, SkillSense.Domain.Entities. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 55 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## server/SkillSense.Application.Tests/ScoringTests.cs

### `server/SkillSense.Application.Tests/ScoringTests.cs`
- **File overview:** Maintained module `ScoringTests` in the codebase.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `ScoringTests` (class), `FakeEmbeddingService` (class), `CountingEmbeddingService` (class), `RequiredSkill_ExactMatch_BeatsSemanticOnly` (method), `ExperienceYearsCalculator_MinYearsPartial` (method), `WorkExperience_HasHigherWeightThanSummaryOnlyMentions` (method)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (SkillSense.Application.Contracts.Response, SkillSense.Application.Interfaces, SkillSense.Application.Services.Scoring, System.Collections.Concurrent) -> focused transformation -> outputs leave through ScoringTests, FakeEmbeddingService, CountingEmbeddingService.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses SkillSense.Application.Contracts.Response, SkillSense.Application.Interfaces, SkillSense.Application.Services.Scoring, System.Collections.Concurrent. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 1014 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## server/SkillSense.Application.Tests/SkillSense.Application.Tests.csproj

### `server/SkillSense.Application.Tests/SkillSense.Application.Tests.csproj`
- **File overview:** Build/tooling config for the surrounding project.
- **Responsibilities:** Compilation, bundling, linting, or tooling configuration.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** No direct business rules live here. Its value is operational clarity, reproducible environments, or developer guidance.
- **Data flow:** Maintainers update this file -> tooling, environments, or readers consume it -> downstream runtime behavior stays consistent without feature code changes.
- **Edge cases / constraints:** Constraints are operational rather than domain-driven: syntax, environment compatibility, and maintainability matter most.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 28 lines. Side effects: Operational/configuration only.

## server/SkillSense.Application/Common

### `server/SkillSense.Application/Common/Jobs/NormalizedJobDescriptionFactory.cs`
- **File overview:** Shared helper for `NormalizedJobDescriptionFactory` that packages reusable transformations or policy logic.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `NormalizedJobDescriptionFactory` (class), `Create` (method)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (System.Text.Json, SkillSense.Application.Contracts.Recruiter.Request, SkillSense.Application.Contracts.Request, SkillSense.Application.Contracts.Response) -> focused transformation -> outputs leave through NormalizedJobDescriptionFactory, Create.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System.Text.Json, SkillSense.Application.Contracts.Recruiter.Request, SkillSense.Application.Contracts.Request, SkillSense.Application.Contracts.Response, SkillSense.Domain.Entities. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 63 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Common/Mapping/MappingJson.cs`
- **File overview:** Shared helper for `MappingJson` that packages reusable transformations or policy logic.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `MappingJson` (class), `DeserializeStringList` (method), `NormalizeMultiline` (method), `ParseJsonElement` (method)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (System.Text.Json) -> focused transformation -> outputs leave through MappingJson, DeserializeStringList, NormalizeMultiline.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses System.Text.Json. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 55 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Common/Recruiter/ApplicantStageTransitionPolicy.cs`
- **File overview:** Shared helper for `ApplicantStageTransitionPolicy` that packages reusable transformations or policy logic.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `ApplicantStageTransitionPolicy` (class), `ResolveAction` (method), `ResolveNextStatus` (method)
- **Business logic:** Validation and guard clauses protect downstream workflows from invalid state.
- **Data flow:** Inputs arrive through callers and dependencies (SkillSense.Application.Exceptions, SkillSense.Domain.Entities) -> focused transformation -> outputs leave through ApplicantStageTransitionPolicy, ResolveAction, ResolveNextStatus.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses SkillSense.Application.Exceptions, SkillSense.Domain.Entities. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 91 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Common/Recruiter/OfferCompensationNormalizer.cs`
- **File overview:** Shared helper for `OfferCompensationNormalizer` that packages reusable transformations or policy logic.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `OfferCompensationNormalizer` (class), `NormalizeToAnnual` (method)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through OfferCompensationNormalizer, NormalizeToAnnual.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 33 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Common/Recruiter/RecruiterApplicantProjection.cs`
- **File overview:** Shared helper for `RecruiterApplicantProjection` that packages reusable transformations or policy logic.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `RecruiterApplicantProjection` (class), `DeserializeListOrEmpty` (method), `ParseResumeJsonElement` (method), `ResolveJobseekerStage` (method), `ResolveSubmissionStatus` (method), `ToApplicantScoreItem` (method)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (System.Text.Json, SkillSense.Application.Contracts.Recruiter.Response, SkillSense.Domain.Entities, SkillSense.Persistence.Models) -> focused transformation -> outputs leave through RecruiterApplicantProjection, DeserializeListOrEmpty, ParseResumeJsonElement.
- **Edge cases / constraints:** Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses System.Text.Json, SkillSense.Application.Contracts.Recruiter.Response, SkillSense.Domain.Entities, SkillSense.Persistence.Models. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 84 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Common/Recruiter/RecruiterDashboardComposer.cs`
- **File overview:** Shared helper for `RecruiterDashboardComposer` that packages reusable transformations or policy logic.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `RecruiterDashboardComposer` (class), `TrendAccumulator` (class), `BuildSummary` (method), `BuildTrends` (method)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (System.Globalization, SkillSense.Application.Contracts.Recruiter.Response, SkillSense.Domain.Entities, SkillSense.Persistence.Models) -> focused transformation -> outputs leave through RecruiterDashboardComposer, TrendAccumulator, BuildSummary.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System.Globalization, SkillSense.Application.Contracts.Recruiter.Response, SkillSense.Domain.Entities, SkillSense.Persistence.Models. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 146 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Common/Scoring/ResumeScoreEntityFactory.cs`
- **File overview:** Shared helper for `ResumeScoreEntityFactory` that packages reusable transformations or policy logic.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `ResumeScoreEntityFactory` (class), `Create` (method)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (System.Text.Json, SkillSense.Application.Contracts.Response, SkillSense.Domain.Entities) -> focused transformation -> outputs leave through ResumeScoreEntityFactory, Create.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System.Text.Json, SkillSense.Application.Contracts.Response, SkillSense.Domain.Entities. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 24 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Common/SkillSenseClaimTypes.cs`
- **File overview:** Shared helper for `SkillSenseClaimTypes` that packages reusable transformations or policy logic.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `SkillSenseClaimTypes` (class)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through SkillSenseClaimTypes.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 10 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Common/Text/MultilineTextNormalizer.cs`
- **File overview:** Shared helper for `MultilineTextNormalizer` that packages reusable transformations or policy logic.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `MultilineTextNormalizer` (class), `Normalize` (method)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through MultilineTextNormalizer, Normalize.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 18 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Common/Text/RichTextPlainTextNormalizer.cs`
- **File overview:** Shared helper for `RichTextPlainTextNormalizer` that packages reusable transformations or policy logic.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `RichTextPlainTextNormalizer` (class), `Normalize` (method)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (System.Net, System.Text.RegularExpressions) -> focused transformation -> outputs leave through RichTextPlainTextNormalizer, Normalize.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses System.Net, System.Text.RegularExpressions. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 39 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## server/SkillSense.Application/ConfigureApplicationService.cs

### `server/SkillSense.Application/ConfigureApplicationService.cs`
- **File overview:** Maintained module `ConfigureApplicationService` in the codebase.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `ApplicationServiceRegistration` (class), `AddApplicationServices` (method)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (AutoMapper, Microsoft.Extensions.Configuration, Microsoft.Extensions.DependencyInjection, SkillSense.Application.Options) -> focused transformation -> outputs leave through ApplicationServiceRegistration, AddApplicationServices.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses AutoMapper, Microsoft.Extensions.Configuration, Microsoft.Extensions.DependencyInjection, SkillSense.Application.Options, SkillSense.Application.Interfaces, SkillSense.Application.Interfaces.Admin. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 53 lines. Side effects: cache reads/writes, notifications

## server/SkillSense.Application/Contracts

### `server/SkillSense.Application/Contracts/Admin/Request/CreateCompanyAccountRequest.cs`
- **File overview:** Contract module for `CreateCompanyAccountRequest`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `CreateCompanyAccountRequest` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (CreateCompanyAccountRequest) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System.ComponentModel.DataAnnotations. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 21 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Admin/Request/CreateManagedRecruiterRequest.cs`
- **File overview:** Contract module for `CreateManagedRecruiterRequest`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `CreateManagedRecruiterRequest` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (CreateManagedRecruiterRequest) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System.ComponentModel.DataAnnotations. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 12 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Admin/Response/AdminDashboardResponse.cs`
- **File overview:** Contract module for `AdminDashboardResponse`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `SuperAdminDashboardResponse` (class), `SuperAdminUsersPageResponse` (class), `SuperAdminDashboardSummaryResponse` (class), `CompanyAdminDashboardResponse` (class), `CompanyAdminDashboardSummaryResponse` (class), `AdminCompanyIdentityResponse` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (SuperAdminDashboardResponse, SuperAdminUsersPageResponse, SuperAdminDashboardSummaryResponse) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses SkillSense.Application.Contracts.Response. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 107 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Auth/AccountProfileResponse.cs`
- **File overview:** Contract module for `AccountProfileResponse`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `AccountProfileResponse` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (AccountProfileResponse) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System.Text.Json.Serialization. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 18 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Auth/AccountSetupRequests.cs`
- **File overview:** Contract module for `AccountSetupRequests`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `CompleteRecruiterSetupRequest` (record), `CompleteCompanyAdminSetupRequest` (record)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (CompleteRecruiterSetupRequest, CompleteCompanyAdminSetupRequest) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 17 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Auth/AuthResult.cs`
- **File overview:** Contract module for `AuthResult`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `AuthResult` (class), `Failure` (method), `Success` (method)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (AuthResult, Failure, Success) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 46 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Auth/ChangePasswordRequest.cs`
- **File overview:** Contract module for `ChangePasswordRequest`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `ChangePasswordRequest` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (ChangePasswordRequest) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System.ComponentModel.DataAnnotations, System.Text.Json.Serialization. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 15 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Auth/CreatePrivilegedUserRequest.cs`
- **File overview:** Contract module for `CreatePrivilegedUserRequest`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `CreatePrivilegedUserRequest` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (CreatePrivilegedUserRequest) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System.ComponentModel.DataAnnotations. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 18 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Auth/CurrentUserResponse.cs`
- **File overview:** Contract module for `CurrentUserResponse`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `CurrentUserResponse` (class), `Unauthenticated` (method)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (CurrentUserResponse, Unauthenticated) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System.Text.Json.Serialization. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 47 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Auth/FinalizeEmailChangeRequest.cs`
- **File overview:** Contract module for `FinalizeEmailChangeRequest`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `FinalizeEmailChangeRequest` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (FinalizeEmailChangeRequest) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System.Text.Json.Serialization. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 12 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Auth/LoginRequest.cs`
- **File overview:** Contract module for `LoginRequest`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `LoginRequest` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (LoginRequest) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 14 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Auth/RegisterJobSeekerRequest.cs`
- **File overview:** Contract module for `RegisterJobSeekerRequest`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `RegisterJobSeekerRequest` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (RegisterJobSeekerRequest) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System.ComponentModel.DataAnnotations, System.Text.Json.Serialization. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 23 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Auth/RequestEmailChangePinRequest.cs`
- **File overview:** Contract module for `RequestEmailChangePinRequest`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `RequestEmailChangePinRequest` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (RequestEmailChangePinRequest) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System.Text.Json.Serialization. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 12 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Auth/RequestPasswordResetPinRequest.cs`
- **File overview:** Contract module for `RequestPasswordResetPinRequest`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `RequestPasswordResetPinRequest` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (RequestPasswordResetPinRequest) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System.ComponentModel.DataAnnotations, System.Text.Json.Serialization. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 11 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Auth/RequestPasswordResetRequest.cs`
- **File overview:** Contract module for `RequestPasswordResetRequest`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `RequestPasswordResetRequest` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (RequestPasswordResetRequest) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System.ComponentModel.DataAnnotations. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 9 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Auth/ResetPasswordRequest.cs`
- **File overview:** Contract module for `ResetPasswordRequest`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `ResetPasswordRequest` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (ResetPasswordRequest) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System.ComponentModel.DataAnnotations. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 13 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Auth/UpdateAccountProfileRequest.cs`
- **File overview:** Contract module for `UpdateAccountProfileRequest`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `UpdateAccountProfileRequest` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (UpdateAccountProfileRequest) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System.ComponentModel.DataAnnotations, System.Text.Json.Serialization. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 15 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Auth/ValidatePasswordResetTokenRequest.cs`
- **File overview:** Contract module for `ValidatePasswordResetTokenRequest`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `ValidatePasswordResetTokenRequest` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (ValidatePasswordResetTokenRequest) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System.ComponentModel.DataAnnotations. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 12 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Auth/VerifyEmailChangePinRequest.cs`
- **File overview:** Contract module for `VerifyEmailChangePinRequest`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `VerifyEmailChangePinRequest` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (VerifyEmailChangePinRequest) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System.Text.Json.Serialization. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 12 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Auth/VerifyResetPinRequest.cs`
- **File overview:** Contract module for `VerifyResetPinRequest`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `VerifyResetPinRequest` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (VerifyResetPinRequest) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System.ComponentModel.DataAnnotations, System.Text.Json.Serialization. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 23 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Email/EmailAttachment.cs`
- **File overview:** Contract module for `EmailAttachment`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `EmailAttachment` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (EmailAttachment) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 10 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Email/EmailMessage.cs`
- **File overview:** Contract module for `EmailMessage`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `EmailMessage` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (EmailMessage) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 12 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Employees/EmployeeDtos.cs`
- **File overview:** Contract module for `EmployeeDtos`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `EmployeeRecordResponse` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (EmployeeRecordResponse) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System.Text.Json.Serialization. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 54 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Interviews/InterviewDtos.cs`
- **File overview:** Contract module for `InterviewDtos`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `InterviewTypeDto` (enum), `InterviewDto` (class), `ArchivedInterviewsQuery` (class), `CandidateInterviewSummaryDto` (class), `ScheduleInterviewRequest` (class), `RescheduleInterviewRequest` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (InterviewTypeDto, InterviewDto, ArchivedInterviewsQuery) -> compile-time consistency across layers.
- **Edge cases / constraints:** Pagination is normalized or bounded.
- **Dependencies:** Uses System.Text.Json.Serialization, SkillSense.Domain.Entities, SkillSense.Application.Contracts.Response. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 87 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Interviews/RecruiterInterviewRequests.cs`
- **File overview:** Contract module for `RecruiterInterviewRequests`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `RecruiterScheduleInterviewRequest` (record), `RecruiterRescheduleInterviewRequest` (record), `RecruiterCancelInterviewRequest` (record)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (RecruiterScheduleInterviewRequest, RecruiterRescheduleInterviewRequest, RecruiterCancelInterviewRequest) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 21 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Jobseeker/Request/ApplyToJobRequest.cs`
- **File overview:** Contract module for `ApplyToJobRequest`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `ApplyToJobRequest` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (ApplyToJobRequest) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 19 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Jobseeker/Request/JobSeekerProfileRequest.cs`
- **File overview:** Contract module for `JobSeekerProfileRequest`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `JobSeekerProfileRequest` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (JobSeekerProfileRequest) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System.Text.Json.Serialization. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 25 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Jobseeker/Response/JobSeekerApplicationResponse.cs`
- **File overview:** Contract module for `JobSeekerApplicationResponse`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `JobSeekerApplicationResponse` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (JobSeekerApplicationResponse) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System.Text.Json.Serialization, SkillSense.Application.Contracts.Offers. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 61 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Notifications/NotificationDtos.cs`
- **File overview:** Contract module for `NotificationDtos`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `NotificationDto` (class), `CreateNotificationRequest` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (NotificationDto, CreateNotificationRequest) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses SkillSense.Domain.Entities. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 25 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Offers/OfferDtos.cs`
- **File overview:** Contract module for `OfferDtos`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `SendOfferRequest` (class), `OfferResponse` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (SendOfferRequest, OfferResponse) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System.Text.Json.Serialization. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 114 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Recruiter/Request/CreateJobRequest.cs`
- **File overview:** Contract module for `CreateJobRequest`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `CreateJobRequest` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (CreateJobRequest) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 67 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Recruiter/Request/RecruiterProfileRequest.cs`
- **File overview:** Contract module for `RecruiterProfileRequest`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `RecruiterProfileRequest` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (RecruiterProfileRequest) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 13 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Recruiter/Request/UpdateJobRequest.cs`
- **File overview:** Contract module for `UpdateJobRequest`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `UpdateJobRequest` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (UpdateJobRequest) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 67 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Recruiter/Request/UpdateJobStatusRequest.cs`
- **File overview:** Contract module for `UpdateJobStatusRequest`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `UpdateJobStatusRequest` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (UpdateJobStatusRequest) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System.Text.Json.Serialization. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 9 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Recruiter/Response/ApplicantResumeDownloadResponse.cs`
- **File overview:** Contract module for `ApplicantResumeDownloadResponse`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `ApplicantResumeDownloadResponse` (class), `ApplicantResumeAccessResult` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (ApplicantResumeDownloadResponse, ApplicantResumeAccessResult) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System.Text.Json.Serialization. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 20 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Recruiter/Response/ApplicantScoresResponse.cs`
- **File overview:** Contract module for `ApplicantScoresResponse`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `ApplicantScoresResponse` (class), `ApplicantScoreItemResponse` (class), `ApplicantDetailResponse` (class), `ApplicantScoreJobFilterResponse` (class), `ApplicantScoreCountsResponse` (class), `RecommendationSettingsResponse` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (ApplicantScoresResponse, ApplicantScoreItemResponse, ApplicantDetailResponse) -> compile-time consistency across layers.
- **Edge cases / constraints:** Pagination is normalized or bounded.
- **Dependencies:** Uses System.Text.Json, System.Text.Json.Serialization, SkillSense.Application.Contracts.Interviews, SkillSense.Application.Contracts.Offers. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 226 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Recruiter/Response/CandidateEvaluationContext.cs`
- **File overview:** Contract module for `CandidateEvaluationContext`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `CandidateEvaluationSignalLevels` (class), `CandidateEvaluationContext` (class), `CandidateEvaluationJobContext` (class), `CandidateEvaluationCandidateContext` (class), `CandidateEvaluationCompatibilityContext` (class), `CandidateEvaluationSignals` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (CandidateEvaluationSignalLevels, CandidateEvaluationContext, CandidateEvaluationJobContext) -> compile-time consistency across layers.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses System.Text.Json.Serialization. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 121 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Recruiter/Response/CandidateExplanationFacts.cs`
- **File overview:** Contract module for `CandidateExplanationFacts`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `CandidateExplanationFacts` (class), `CandidateExplanationMatchStates` (class), `CandidateExplanationEvidenceItem` (class), `CandidateExplanationMatchItem` (class), `CandidateExplanationJobFacts` (class), `CandidateExplanationCandidateFacts` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (CandidateExplanationFacts, CandidateExplanationMatchStates, CandidateExplanationEvidenceItem) -> compile-time consistency across layers.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 219 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Recruiter/Response/CandidateExplanationResponse.cs`
- **File overview:** Contract module for `CandidateExplanationResponse`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `CandidateExplanationResponse` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (CandidateExplanationResponse) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 37 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Recruiter/Response/CandidateStructuredExplanation.cs`
- **File overview:** Contract module for `CandidateStructuredExplanation`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `CandidateStructuredExplanation` (class), `CandidateExplanationGenerationResult` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (CandidateStructuredExplanation, CandidateExplanationGenerationResult) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 31 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Recruiter/Response/JobListItemResponse.cs`
- **File overview:** Contract module for `JobListItemResponse`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `JobListItemResponse` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (JobListItemResponse) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 84 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Recruiter/Response/RecruiterDashboardResponse.cs`
- **File overview:** Contract module for `RecruiterDashboardResponse`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `RecruiterDashboardResponse` (class), `RecruiterDashboardFilterOptionsResponse` (class), `RecruiterDashboardSummaryResponse` (class), `MetricWithComparisonResponse` (class), `RecruiterDashboardTrendsResponse` (class), `TrendDatasetResponse` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (RecruiterDashboardResponse, RecruiterDashboardFilterOptionsResponse, RecruiterDashboardSummaryResponse) -> compile-time consistency across layers.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 91 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Recruiter/Response/RecruiterProfileResponse.cs`
- **File overview:** Contract module for `RecruiterProfileResponse`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `RecruiterProfileResponse` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (RecruiterProfileResponse) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System.Text.Json.Serialization. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 22 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Request/JobDescriptionInput.cs`
- **File overview:** Contract module for `JobDescriptionInput`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `NormalizedJobDescription` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (NormalizedJobDescription) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 36 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Request/ResumeEmbeddingRequest.cs`
- **File overview:** Contract module for `ResumeEmbeddingRequest`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `ResumeEmbeddingRequest` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (ResumeEmbeddingRequest) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System.Text.Json.Serialization. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 16 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Request/ResumeScoreRequest.cs`
- **File overview:** Contract module for `ResumeScoreRequest`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `ResumeScoreRequest` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (ResumeScoreRequest) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 12 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Response/AtsScoreResponse.cs`
- **File overview:** Contract module for `AtsScoreResponse`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `FinalMatchScore` (class), `MatchGroups` (class), `HardRequirementResult` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (FinalMatchScore, MatchGroups, HardRequirementResult) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses SkillSense.Application.Contracts.Scoring.Response. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 46 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Response/JobResponse.cs`
- **File overview:** Contract module for `JobResponse`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `JobResponse` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (JobResponse) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 19 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Response/PagedResult.cs`
- **File overview:** Contract module for `PagedResult`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `PagedResult` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (PagedResult) -> compile-time consistency across layers.
- **Edge cases / constraints:** Pagination is normalized or bounded.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 23 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Response/ResumeEmbeddingResponse.cs`
- **File overview:** Contract module for `ResumeEmbeddingResponse`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `ResumeEmbeddingResponse` (class), `SectionSimilarity` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (ResumeEmbeddingResponse, SectionSimilarity) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 33 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Response/ResumeEmbeddingSummaryResponse.cs`
- **File overview:** Contract module for `ResumeEmbeddingSummaryResponse`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `ResumeEmbeddingSummaryResponse` (class), `EmbeddingSectionSummary` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (ResumeEmbeddingSummaryResponse, EmbeddingSectionSummary) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 14 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Response/ResumeParseResult.cs`
- **File overview:** Contract module for `ResumeParseResult`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `ResumeParseEnvelope` (class), `ParsedResume` (class), `ParsedResumeDerived` (class), `PersonalInfo` (class), `WorkExperienceItem` (class), `EducationItem` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (ResumeParseEnvelope, ParsedResume, ParsedResumeDerived) -> compile-time consistency across layers.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 115 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Response/ResumeScoreResponse.cs`
- **File overview:** Contract module for `ResumeScoreResponse`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `ResumeScoreResponse` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (ResumeScoreResponse) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 21 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Response/ResumeUploadResponse.cs`
- **File overview:** Contract module for `ResumeUploadResponse`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `ResumeUploadResponse` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (ResumeUploadResponse) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System.Collections.Generic, System.Text, System.Text.Json.Serialization. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 19 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Scoring/Response/MatchEvidence.cs`
- **File overview:** Contract module for `MatchEvidence`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `MatchEvidence` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (MatchEvidence) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System.Text.Json.Serialization. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 51 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Contracts/Scoring/Response/SectionScore.cs`
- **File overview:** Contract module for `SectionScore`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `SectionScore` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (SectionScore) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 21 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## server/SkillSense.Application/Exceptions

### `server/SkillSense.Application/Exceptions/InvalidStageTransitionException.cs`
- **File overview:** Maintained module `InvalidStageTransitionException` in the codebase.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `InvalidStageTransitionException` (class)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through InvalidStageTransitionException.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 15 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## server/SkillSense.Application/Interfaces

### `server/SkillSense.Application/Interfaces/Admin/IAdminManagementService.cs`
- **File overview:** Abstraction contract for `IAdminManagementService` used to decouple higher-level workflows from implementations.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `IAdminManagementService` (interface)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (SkillSense.Application.Contracts.Admin.Request, SkillSense.Application.Contracts.Admin.Response, SkillSense.Application.Contracts.Recruiter.Response, SkillSense.Application.Contracts.Employees) -> focused transformation -> outputs leave through IAdminManagementService.
- **Edge cases / constraints:** Pagination is normalized or bounded.
- **Dependencies:** Uses SkillSense.Application.Contracts.Admin.Request, SkillSense.Application.Contracts.Admin.Response, SkillSense.Application.Contracts.Recruiter.Response, SkillSense.Application.Contracts.Employees, SkillSense.Application.Contracts.Response. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 58 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Interfaces/Auth/IAuthService.cs`
- **File overview:** Abstraction contract for `IAuthService` used to decouple higher-level workflows from implementations.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `IAuthService` (interface)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (SkillSense.Application.Contracts.Auth) -> focused transformation -> outputs leave through IAuthService.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses SkillSense.Application.Contracts.Auth. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 94 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Interfaces/Auth/IInputSanitizer.cs`
- **File overview:** Abstraction contract for `IInputSanitizer` used to decouple higher-level workflows from implementations.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `IInputSanitizer` (interface)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through IInputSanitizer.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 7 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Interfaces/Auth/ITokenService.cs`
- **File overview:** Abstraction contract for `ITokenService` used to decouple higher-level workflows from implementations.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `ITokenService` (interface), `RefreshTokenValidationResult` (record)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through ITokenService, RefreshTokenValidationResult.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 12 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Interfaces/IAppCacheService.cs`
- **File overview:** Abstraction contract for `IAppCacheService` used to decouple higher-level workflows from implementations.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `IAppCacheService` (interface)
- **Business logic:** Caching is used to reduce repeated work while relying on invalidation elsewhere.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through IAppCacheService.
- **Edge cases / constraints:** Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 22 lines. Side effects: cache reads/writes

### `server/SkillSense.Application/Interfaces/IDateTimeProvider.cs`
- **File overview:** Abstraction contract for `IDateTimeProvider` used to decouple higher-level workflows from implementations.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `IDateTimeProvider` (interface)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through IDateTimeProvider.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 12 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Interfaces/IEmailService.cs`
- **File overview:** Abstraction contract for `IEmailService` used to decouple higher-level workflows from implementations.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `IEmailService` (interface)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (SkillSense.Application.Contracts.Email) -> focused transformation -> outputs leave through IEmailService.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses SkillSense.Application.Contracts.Email. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 8 lines. Side effects: email/calendar delivery

### `server/SkillSense.Application/Interfaces/IGenerativeExplanationProvider.cs`
- **File overview:** Abstraction contract for `IGenerativeExplanationProvider` used to decouple higher-level workflows from implementations.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `IGenerativeExplanationProvider` (interface)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through IGenerativeExplanationProvider.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 10 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Interfaces/IInterviewCalendarService.cs`
- **File overview:** Abstraction contract for `IInterviewCalendarService` used to decouple higher-level workflows from implementations.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `IInterviewCalendarService` (interface)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through IInterviewCalendarService.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 6 lines. Side effects: email/calendar delivery

### `server/SkillSense.Application/Interfaces/IInterviewInviteEmailSender.cs`
- **File overview:** Abstraction contract for `IInterviewInviteEmailSender` used to decouple higher-level workflows from implementations.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `IInterviewInviteEmailSender` (interface)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through IInterviewInviteEmailSender.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 12 lines. Side effects: email/calendar delivery

### `server/SkillSense.Application/Interfaces/IInterviewService.cs`
- **File overview:** Abstraction contract for `IInterviewService` used to decouple higher-level workflows from implementations.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `IInterviewService` (interface)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (SkillSense.Application.Contracts.Interviews, SkillSense.Application.Contracts.Response) -> focused transformation -> outputs leave through IInterviewService.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses SkillSense.Application.Contracts.Interviews, SkillSense.Application.Contracts.Response. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 28 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Interfaces/IJobService.cs`
- **File overview:** Abstraction contract for `IJobService` used to decouple higher-level workflows from implementations.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `IJobService` (interface)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (SkillSense.Application.Contracts.Recruiter.Request, SkillSense.Application.Contracts.Response) -> focused transformation -> outputs leave through IJobService.
- **Edge cases / constraints:** Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses SkillSense.Application.Contracts.Recruiter.Request, SkillSense.Application.Contracts.Response. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 15 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Interfaces/INotificationService.cs`
- **File overview:** Abstraction contract for `INotificationService` used to decouple higher-level workflows from implementations.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `INotificationService` (interface)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (SkillSense.Application.Contracts.Notifications) -> focused transformation -> outputs leave through INotificationService.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses SkillSense.Application.Contracts.Notifications. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 13 lines. Side effects: notifications

### `server/SkillSense.Application/Interfaces/IObjectStorageService.cs`
- **File overview:** Abstraction contract for `IObjectStorageService` used to decouple higher-level workflows from implementations.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `IObjectStorageService` (interface)
- **Business logic:** Persistence is part of this file's transaction boundary.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through IObjectStorageService.
- **Edge cases / constraints:** File payload shape and content metadata matter here.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 11 lines. Side effects: database writes, object storage

### `server/SkillSense.Application/Interfaces/IResumeParserClient.cs`
- **File overview:** Abstraction contract for `IResumeParserClient` used to decouple higher-level workflows from implementations.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `IResumeParserClient` (interface)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through IResumeParserClient.
- **Edge cases / constraints:** File payload shape and content metadata matter here.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 14 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Interfaces/IResumeProcessingMonitor.cs`
- **File overview:** Abstraction contract for `IResumeProcessingMonitor` used to decouple higher-level workflows from implementations.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `IResumeProcessingMonitor` (interface), `ResumeProcessingMonitorSnapshot` (record)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through IResumeProcessingMonitor, ResumeProcessingMonitorSnapshot.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 22 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Interfaces/IResumeProcessingService.cs`
- **File overview:** Abstraction contract for `IResumeProcessingService` used to decouple higher-level workflows from implementations.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `IResumeProcessingService` (interface)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through IResumeProcessingService.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 12 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Interfaces/IResumeReadService.cs`
- **File overview:** Abstraction contract for `IResumeReadService` used to decouple higher-level workflows from implementations.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `IResumeReadService` (interface)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (SkillSense.Application.Contracts.Response) -> focused transformation -> outputs leave through IResumeReadService.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses SkillSense.Application.Contracts.Response. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 14 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Interfaces/IResumeScoringOrchestrator.cs`
- **File overview:** Abstraction contract for `IResumeScoringOrchestrator` used to decouple higher-level workflows from implementations.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `IResumeScoringOrchestrator` (interface)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (SkillSense.Application.Contracts.Response, SkillSense.Domain.Entities) -> focused transformation -> outputs leave through IResumeScoringOrchestrator.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses SkillSense.Application.Contracts.Response, SkillSense.Domain.Entities. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 14 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Interfaces/IResumeScoringService.cs`
- **File overview:** Abstraction contract for `IResumeScoringService` used to decouple higher-level workflows from implementations.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `IResumeScoringService` (interface)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (SkillSense.Application.Contracts.Request, SkillSense.Application.Contracts.Response) -> focused transformation -> outputs leave through IResumeScoringService.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses SkillSense.Application.Contracts.Request, SkillSense.Application.Contracts.Response. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 15 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Interfaces/ITextEmbeddingService.cs`
- **File overview:** Abstraction contract for `ITextEmbeddingService` used to decouple higher-level workflows from implementations.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `ITextEmbeddingService` (interface)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (System.Collections.Generic, System.Text) -> focused transformation -> outputs leave through ITextEmbeddingService.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System.Collections.Generic, System.Text. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 11 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Interfaces/Jobseeker/IJobSeekerService.cs`
- **File overview:** Abstraction contract for `IJobSeekerService` used to decouple higher-level workflows from implementations.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `IJobSeekerService` (interface)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (SkillSense.Application.Contracts.Jobseeker.Request, SkillSense.Application.Contracts.Jobseeker.Response, SkillSense.Application.Contracts.Offers, SkillSense.Application.Contracts.Recruiter.Response) -> focused transformation -> outputs leave through IJobSeekerService.
- **Edge cases / constraints:** Pagination is normalized or bounded. File payload shape and content metadata matter here.
- **Dependencies:** Uses SkillSense.Application.Contracts.Jobseeker.Request, SkillSense.Application.Contracts.Jobseeker.Response, SkillSense.Application.Contracts.Offers, SkillSense.Application.Contracts.Recruiter.Response, SkillSense.Application.Contracts.Response. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 30 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Interfaces/Jobseeker/IResumeUploadService.cs`
- **File overview:** Abstraction contract for `IResumeUploadService` used to decouple higher-level workflows from implementations.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `IResumeUploadService` (interface)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through IResumeUploadService.
- **Edge cases / constraints:** File payload shape and content metadata matter here.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 21 lines. Side effects: object storage

### `server/SkillSense.Application/Interfaces/Recruiter/ICandidateExplanationService.cs`
- **File overview:** Abstraction contract for `ICandidateExplanationService` used to decouple higher-level workflows from implementations.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `ICandidateExplanationService` (interface)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through ICandidateExplanationService.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 12 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Interfaces/Recruiter/IRecruiterService.cs`
- **File overview:** Abstraction contract for `IRecruiterService` used to decouple higher-level workflows from implementations.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `IRecruiterService` (interface)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (SkillSense.Application.Contracts.Recruiter.Request, SkillSense.Application.Contracts.Recruiter.Response, SkillSense.Application.Contracts.Response, SkillSense.Application.Contracts.Interviews) -> focused transformation -> outputs leave through IRecruiterService.
- **Edge cases / constraints:** Pagination is normalized or bounded.
- **Dependencies:** Uses SkillSense.Application.Contracts.Recruiter.Request, SkillSense.Application.Contracts.Recruiter.Response, SkillSense.Application.Contracts.Response, SkillSense.Application.Contracts.Interviews, SkillSense.Application.Contracts.Employees, SkillSense.Application.Contracts.Offers. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 49 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## server/SkillSense.Application/Options

### `server/SkillSense.Application/Options/PasswordResetOptions.cs`
- **File overview:** Configuration module for `PasswordResetOptions` that binds framework or runtime settings.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `PasswordResetOptions` (class)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through PasswordResetOptions.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 10 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## server/SkillSense.Application/Services

### `server/SkillSense.Application/Services/Admin/AdminManagementService.cs`
- **File overview:** Service boundary for `AdminManagementService` that centralizes operations and side effects for callers.
- **Responsibilities:** Business/application boundary: validation, orchestration, persistence, and side effects.
- **Key functions / classes:** `AdminManagementService` (class), `GetSuperAdminDashboardAsync` (method), `GetSuperAdminUsersAsync` (method), `GetCompanyAdminDashboardAsync` (method), `GetCompanyEmployeesAsync` (method), `GetCompanyApplicantBySubmissionIdAsync` (method)
- **Business logic:** This file appears to own or coordinate a feature workflow. Validation and guard clauses protect downstream workflows from invalid state. Persistence is part of this file's transaction boundary.
- **Data flow:** Callers invoke service methods -> this module coordinates Microsoft.AspNetCore.Identity, AutoMapper, Microsoft.Extensions.Logging, SkillSense.Application.Contracts.Admin.Request -> results leave through AdminManagementService, GetSuperAdminDashboardAsync, GetSuperAdminUsersAsync.
- **Edge cases / constraints:** Pagination is normalized or bounded. Input cleanup/normalization happens before comparison or persistence. Identity and access preconditions are enforced explicitly.
- **Dependencies:** Uses Microsoft.AspNetCore.Identity, AutoMapper, Microsoft.Extensions.Logging, SkillSense.Application.Contracts.Admin.Request, SkillSense.Application.Contracts.Admin.Response, SkillSense.Application.Contracts.Auth. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 571 lines. Side effects: database writes, database reads, object storage

### `server/SkillSense.Application/Services/Auth/AuthService.cs`
- **File overview:** Core identity workflow engine for registration, login, refresh, privileged-user creation, and password recovery.
- **Responsibilities:** Business/application boundary: validation, orchestration, persistence, and side effects.
- **Key functions / classes:** `AuthService` (class), `an` (record), `RegisterJobSeekerAsync` (method), `LoginAsync` (method), `RefreshAsync` (method), `IsSessionActiveAsync` (method)
- **Business logic:** This is the main authentication rule owner. It sanitizes input, enforces inactive/lockout checks, provisions roles, issues tokens, and protects recovery flows from account-enumeration leakage.
- **Data flow:** Callers invoke service methods -> this module coordinates Microsoft.AspNetCore.Identity, Microsoft.AspNetCore.WebUtilities, Microsoft.EntityFrameworkCore, Microsoft.Extensions.Logging -> results leave through AuthService, an, RegisterJobSeekerAsync.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses Microsoft.AspNetCore.Identity, Microsoft.AspNetCore.WebUtilities, Microsoft.EntityFrameworkCore, Microsoft.Extensions.Logging, Microsoft.Extensions.Options, SkillSense.Application.Contracts.Auth. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 1121 lines. Side effects: database writes, database reads, email/calendar delivery, file uploads/form data

### `server/SkillSense.Application/Services/Auth/AuthUserProfileMapper.cs`
- **File overview:** Service boundary for `AuthUserProfileMapper` that centralizes operations and side effects for callers.
- **Responsibilities:** Business/application boundary: validation, orchestration, persistence, and side effects.
- **Key functions / classes:** `AuthUserProfileMapper` (class), `ToCurrentUserResponse` (method), `ToAccountProfileResponse` (method)
- **Business logic:** This file appears to own or coordinate a feature workflow. It keeps validation, orchestration, and side effects out of callers.
- **Data flow:** Callers invoke service methods -> this module coordinates SkillSense.Application.Contracts.Auth, SkillSense.Domain.Entities -> results leave through AuthUserProfileMapper, ToCurrentUserResponse, ToAccountProfileResponse.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses SkillSense.Application.Contracts.Auth, SkillSense.Domain.Entities. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 109 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Services/Auth/InputSanitizer.cs`
- **File overview:** Service boundary for `InputSanitizer` that centralizes operations and side effects for callers.
- **Responsibilities:** Business/application boundary: validation, orchestration, persistence, and side effects.
- **Key functions / classes:** `InputSanitizer` (class), `Sanitize` (method), `SanitizeEmail` (method)
- **Business logic:** This file appears to own or coordinate a feature workflow. It keeps validation, orchestration, and side effects out of callers.
- **Data flow:** Callers invoke service methods -> this module coordinates SkillSense.Application.Interfaces.Auth -> results leave through InputSanitizer, Sanitize, SanitizeEmail.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses SkillSense.Application.Interfaces.Auth. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 18 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Services/Interviews/InterviewService.cs`
- **File overview:** Interview lifecycle owner for scheduling, conflict validation, notifications, and archival.
- **Responsibilities:** Business/application boundary: validation, orchestration, persistence, and side effects.
- **Key functions / classes:** `InterviewService` (class), `RecruiterContext` (record), `ScheduleInterviewAsync` (method), `GetRecruiterInterviewAsync` (method), `RescheduleInterviewAsync` (method), `AcceptInterviewAsync` (method)
- **Business logic:** It requires future schedules, shortlisted candidates, valid location/link details, conflict-free calendars, and only allows responses or archival when the interview is in a compatible state.
- **Data flow:** Callers invoke service methods -> this module coordinates SkillSense.Application.Contracts.Interviews, SkillSense.Application.Contracts.Notifications, SkillSense.Application.Contracts.Response, SkillSense.Application.Common.Recruiter -> results leave through InterviewService, RecruiterContext, ScheduleInterviewAsync.
- **Edge cases / constraints:** Pagination is normalized or bounded. Input cleanup/normalization happens before comparison or persistence. Identity and access preconditions are enforced explicitly.
- **Dependencies:** Uses SkillSense.Application.Contracts.Interviews, SkillSense.Application.Contracts.Notifications, SkillSense.Application.Contracts.Response, SkillSense.Application.Common.Recruiter, SkillSense.Application.Interfaces, SkillSense.Application.Exceptions. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 867 lines. Side effects: database writes, database reads, notifications, email/calendar delivery

### `server/SkillSense.Application/Services/Jobs/JobService.cs`
- **File overview:** Service boundary for `JobService` that centralizes operations and side effects for callers.
- **Responsibilities:** Business/application boundary: validation, orchestration, persistence, and side effects.
- **Key functions / classes:** `JobService` (class), `CreateAsync` (method)
- **Business logic:** This file appears to own or coordinate a feature workflow. Validation and guard clauses protect downstream workflows from invalid state. Persistence is part of this file's transaction boundary.
- **Data flow:** Callers invoke service methods -> this module coordinates System.Text.Json, AutoMapper, SkillSense.Application.Common.Jobs, SkillSense.Application.Contracts.Recruiter.Request -> results leave through JobService, CreateAsync.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System.Text.Json, AutoMapper, SkillSense.Application.Common.Jobs, SkillSense.Application.Contracts.Recruiter.Request, SkillSense.Application.Contracts.Response, SkillSense.Application.Interfaces. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 52 lines. Side effects: database writes, database reads

### `server/SkillSense.Application/Services/Jobs/JobsMappingProfile.cs`
- **File overview:** Service boundary for `JobsMappingProfile` that centralizes operations and side effects for callers.
- **Responsibilities:** Business/application boundary: validation, orchestration, persistence, and side effects.
- **Key functions / classes:** `JobsMappingProfile` (class)
- **Business logic:** This file appears to own or coordinate a feature workflow. It keeps validation, orchestration, and side effects out of callers.
- **Data flow:** Callers invoke service methods -> this module coordinates AutoMapper, SkillSense.Application.Common.Mapping, SkillSense.Application.Common.Text, SkillSense.Application.Contracts.Recruiter.Request -> results leave through JobsMappingProfile.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses AutoMapper, SkillSense.Application.Common.Mapping, SkillSense.Application.Common.Text, SkillSense.Application.Contracts.Recruiter.Request, SkillSense.Application.Contracts.Recruiter.Response, SkillSense.Application.Contracts.Response. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 71 lines. Side effects: file uploads/form data

### `server/SkillSense.Application/Services/Jobseeker/JobSeekerService.cs`
- **File overview:** Primary jobseeker workflow owner for public jobs, applications, offers, saved jobs, and profile history.
- **Responsibilities:** Business/application boundary: validation, orchestration, persistence, and side effects.
- **Key functions / classes:** `JobSeekerService` (class), `GetPublicJobsAsync` (method), `GetPublicJobAsync` (method), `ApplyAsync` (method), `GetMyApplicationsAsync` (method), `GetDashboardSummaryAsync` (method)
- **Business logic:** It blocks duplicate active applications, translates submission states into jobseeker-friendly stages, controls offer response rules, and treats hire creation as one transaction when an offer is accepted.
- **Data flow:** Callers invoke service methods -> this module coordinates System.Text.Json, SkillSense.Application.Contracts.Jobseeker.Request, SkillSense.Application.Contracts.Jobseeker.Response, SkillSense.Application.Contracts.Notifications -> results leave through JobSeekerService, GetPublicJobsAsync, GetPublicJobAsync.
- **Edge cases / constraints:** Pagination is normalized or bounded. Input cleanup/normalization happens before comparison or persistence. File payload shape and content metadata matter here.
- **Dependencies:** Uses System.Text.Json, SkillSense.Application.Contracts.Jobseeker.Request, SkillSense.Application.Contracts.Jobseeker.Response, SkillSense.Application.Contracts.Notifications, SkillSense.Application.Contracts.Offers, SkillSense.Application.Contracts.Recruiter.Response. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 579 lines. Side effects: database writes, database reads, cache reads/writes, notifications, object storage

### `server/SkillSense.Application/Services/Jobseeker/ResumeUploadService.cs`
- **File overview:** Service boundary for `ResumeUploadService` that centralizes operations and side effects for callers.
- **Responsibilities:** Business/application boundary: validation, orchestration, persistence, and side effects.
- **Key functions / classes:** `ResumeUploadService` (class), `EnqueueUploadAsync` (method), `HasActiveApplicationAsync` (method)
- **Business logic:** This file appears to own or coordinate a feature workflow. Persistence is part of this file's transaction boundary.
- **Data flow:** Callers invoke service methods -> this module coordinates SkillSense.Application.Interfaces, SkillSense.Application.Interfaces.Jobseeker, SkillSense.Domain.Entities, SkillSense.Persistence.Interfaces -> results leave through ResumeUploadService, EnqueueUploadAsync, HasActiveApplicationAsync.
- **Edge cases / constraints:** File payload shape and content metadata matter here.
- **Dependencies:** Uses SkillSense.Application.Interfaces, SkillSense.Application.Interfaces.Jobseeker, SkillSense.Domain.Entities, SkillSense.Persistence.Interfaces. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 59 lines. Side effects: database writes, database reads, object storage

### `server/SkillSense.Application/Services/Notifications/NotificationService.cs`
- **File overview:** Service boundary for `NotificationService` that centralizes operations and side effects for callers.
- **Responsibilities:** Business/application boundary: validation, orchestration, persistence, and side effects.
- **Key functions / classes:** `NotificationService` (class), `CreateNotificationAsync` (method), `GetNotificationsByUserAsync` (method), `MarkAsReadAsync` (method), `MarkAllAsReadAsync` (method), `DeleteNotificationsAsync` (method)
- **Business logic:** This file appears to own or coordinate a feature workflow. Validation and guard clauses protect downstream workflows from invalid state. Persistence is part of this file's transaction boundary.
- **Data flow:** Callers invoke service methods -> this module coordinates SkillSense.Application.Contracts.Notifications, SkillSense.Application.Interfaces, SkillSense.Domain.Entities, SkillSense.Persistence.Interfaces -> results leave through NotificationService, CreateNotificationAsync, GetNotificationsByUserAsync.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses SkillSense.Application.Contracts.Notifications, SkillSense.Application.Interfaces, SkillSense.Domain.Entities, SkillSense.Persistence.Interfaces. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 127 lines. Side effects: database writes, database reads, notifications

### `server/SkillSense.Application/Services/Recruiter/ApplicantsMappingProfile.cs`
- **File overview:** Service boundary for `ApplicantsMappingProfile` that centralizes operations and side effects for callers.
- **Responsibilities:** Business/application boundary: validation, orchestration, persistence, and side effects.
- **Key functions / classes:** `ApplicantsMappingProfile` (class), `SubmissionStatusResolver` (class), `Resolve` (method)
- **Business logic:** This file appears to own or coordinate a feature workflow. It keeps validation, orchestration, and side effects out of callers.
- **Data flow:** Callers invoke service methods -> this module coordinates AutoMapper, SkillSense.Application.Common.Mapping, SkillSense.Application.Common.Recruiter, SkillSense.Application.Contracts.Recruiter.Response -> results leave through ApplicantsMappingProfile, SubmissionStatusResolver, Resolve.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses AutoMapper, SkillSense.Application.Common.Mapping, SkillSense.Application.Common.Recruiter, SkillSense.Application.Contracts.Recruiter.Response, SkillSense.Domain.Entities, SkillSense.Persistence.Models. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 50 lines. Side effects: file uploads/form data

### `server/SkillSense.Application/Services/Recruiter/CandidateExplanationService.cs`
- **File overview:** Service boundary for `CandidateExplanationService` that centralizes operations and side effects for callers.
- **Responsibilities:** Business/application boundary: validation, orchestration, persistence, and side effects.
- **Key functions / classes:** `CandidateExplanationService` (class), `ParsedResumeRoot` (class), `ParsedResumeDerived` (class), `GenerateForShortlistedAsync` (method)
- **Business logic:** This file appears to own or coordinate a feature workflow. Persistence is part of this file's transaction boundary.
- **Data flow:** Callers invoke service methods -> this module coordinates System.Text, System.Text.Json, System.Text.RegularExpressions, Microsoft.Extensions.Logging -> results leave through CandidateExplanationService, ParsedResumeRoot, ParsedResumeDerived.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses System.Text, System.Text.Json, System.Text.RegularExpressions, Microsoft.Extensions.Logging, SkillSense.Application.Contracts.Recruiter.Response, SkillSense.Application.Contracts.Response. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 985 lines. Side effects: database writes, database reads

### `server/SkillSense.Application/Services/Recruiter/RecruiterMappingProfile.cs`
- **File overview:** Service boundary for `RecruiterMappingProfile` that centralizes operations and side effects for callers.
- **Responsibilities:** Business/application boundary: validation, orchestration, persistence, and side effects.
- **Key functions / classes:** `RecruiterMappingProfile` (class)
- **Business logic:** This file appears to own or coordinate a feature workflow. It keeps validation, orchestration, and side effects out of callers.
- **Data flow:** Callers invoke service methods -> this module coordinates AutoMapper, SkillSense.Application.Contracts.Recruiter.Response, SkillSense.Domain.Entities -> results leave through RecruiterMappingProfile.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses AutoMapper, SkillSense.Application.Contracts.Recruiter.Response, SkillSense.Domain.Entities. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 21 lines. Side effects: file uploads/form data

### `server/SkillSense.Application/Services/Recruiter/RecruiterService.cs`
- **File overview:** Primary recruiter business-rule owner for jobs, applicants, dashboard analytics, offers, and hires.
- **Responsibilities:** Business/application boundary: validation, orchestration, persistence, and side effects.
- **Key functions / classes:** `RecruiterService` (class), `GetProfileAsync` (method), `UpsertProfileAsync` (method), `CreateJobAsync` (method), `DuplicateJobAsync` (method), `UpdateJobAsync` (method)
- **Business logic:** It enforces recruiter-company ownership, validates job payloads, manages stage transitions, persists ATS-friendly job structure, calculates remaining vacancies, and invalidates recruiter-facing caches.
- **Data flow:** Callers invoke service methods -> this module coordinates System.Text.Json, System.Text.RegularExpressions, AutoMapper, Microsoft.Extensions.Logging -> results leave through RecruiterService, GetProfileAsync, UpsertProfileAsync.
- **Edge cases / constraints:** Pagination is normalized or bounded. Input cleanup/normalization happens before comparison or persistence. Identity and access preconditions are enforced explicitly.
- **Dependencies:** Uses System.Text.Json, System.Text.RegularExpressions, AutoMapper, Microsoft.Extensions.Logging, SkillSense.Application.Common.Jobs, SkillSense.Application.Common.Recruiter. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 1479 lines. Side effects: database writes, database reads, cache reads/writes, notifications, object storage

### `server/SkillSense.Application/Services/Resume/ResumeProcessingService.cs`
- **File overview:** Asynchronous ATS pipeline owner for parsing, scoring, persistence, and failure tracking.
- **Responsibilities:** Business/application boundary: validation, orchestration, persistence, and side effects.
- **Key functions / classes:** `ResumeProcessingService` (class), `ProcessPendingBatchAsync` (method)
- **Business logic:** Each queued submission is claimed, parsed, normalized against the job, scored, persisted, and either marked complete or failed with stage-level diagnostics.
- **Data flow:** Pending submission -> blob download -> parser call -> scoring -> persistence -> final submission status.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses SkillSense.Application.Common.Jobs, SkillSense.Application.Common.Scoring, SkillSense.Application.Contracts.Request, SkillSense.Application.Contracts.Response, SkillSense.Application.Interfaces, SkillSense.Domain.Entities. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 184 lines. Side effects: database writes, database reads, cache reads/writes, object storage

### `server/SkillSense.Application/Services/Resume/ResumeReadService.cs`
- **File overview:** Service boundary for `ResumeReadService` that centralizes operations and side effects for callers.
- **Responsibilities:** Business/application boundary: validation, orchestration, persistence, and side effects.
- **Key functions / classes:** `ResumeReadService` (class), `GetEmbeddingSummaryAsync` (method)
- **Business logic:** This file appears to own or coordinate a feature workflow. It keeps validation, orchestration, and side effects out of callers.
- **Data flow:** Callers invoke service methods -> this module coordinates System.Text.Json, SkillSense.Application.Contracts.Response, SkillSense.Application.Interfaces, SkillSense.Persistence.Interfaces -> results leave through ResumeReadService, GetEmbeddingSummaryAsync.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System.Text.Json, SkillSense.Application.Contracts.Response, SkillSense.Application.Interfaces, SkillSense.Persistence.Interfaces. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 30 lines. Side effects: database reads

### `server/SkillSense.Application/Services/Scoring/ResumeEmbeddingScoringOrchestrator.cs`
- **File overview:** Service boundary for `ResumeEmbeddingScoringOrchestrator` that centralizes operations and side effects for callers.
- **Responsibilities:** Business/application boundary: validation, orchestration, persistence, and side effects.
- **Key functions / classes:** `ResumeEmbeddingScoringOrchestrator` (class), `SemanticCandidateScore` (record), `ResponsibilityInput` (record), `ResponsibilityConcept` (record), `CandidateEvidenceProfile` (record), `RelatedClusterCandidateScore` (record)
- **Business logic:** This file appears to own or coordinate a feature workflow. Caching is used to reduce repeated work while relying on invalidation elsewhere.
- **Data flow:** Callers invoke service methods -> this module coordinates SkillSense.Application.Contracts.Request, SkillSense.Application.Contracts.Response, SkillSense.Application.Contracts.Scoring.Response, SkillSense.Application.Interfaces -> results leave through ResumeEmbeddingScoringOrchestrator, SemanticCandidateScore, ResponsibilityInput.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses SkillSense.Application.Contracts.Request, SkillSense.Application.Contracts.Response, SkillSense.Application.Contracts.Scoring.Response, SkillSense.Application.Interfaces, SkillSense.Domain.Entities, System.Collections.Concurrent. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 2512 lines. Side effects: cache reads/writes, file uploads/form data

### `server/SkillSense.Application/Services/Scoring/ResumeScoringService.cs`
- **File overview:** Service boundary for `ResumeScoringService` that centralizes operations and side effects for callers.
- **Responsibilities:** Business/application boundary: validation, orchestration, persistence, and side effects.
- **Key functions / classes:** `ResumeScoringService` (class), `ScoreResumeAsync` (method)
- **Business logic:** This file appears to own or coordinate a feature workflow. Validation and guard clauses protect downstream workflows from invalid state. Persistence is part of this file's transaction boundary.
- **Data flow:** Callers invoke service methods -> this module coordinates System.Text.Json, Microsoft.Extensions.Logging, SkillSense.Application.Common.Scoring, SkillSense.Application.Contracts.Request -> results leave through ResumeScoringService, ScoreResumeAsync.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses System.Text.Json, Microsoft.Extensions.Logging, SkillSense.Application.Common.Scoring, SkillSense.Application.Contracts.Request, SkillSense.Application.Contracts.Response, SkillSense.Application.Interfaces. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 54 lines. Side effects: database writes, database reads

### `server/SkillSense.Application/Services/Scoring/SimilarityMath.cs`
- **File overview:** Service boundary for `SimilarityMath` that centralizes operations and side effects for callers.
- **Responsibilities:** Business/application boundary: validation, orchestration, persistence, and side effects.
- **Key functions / classes:** `SimilarityMath` (class), `CosineSimilarity` (method)
- **Business logic:** This file appears to own or coordinate a feature workflow. It keeps validation, orchestration, and side effects out of callers.
- **Data flow:** Callers invoke service methods -> this module coordinates framework/runtime deps -> results leave through SimilarityMath, CosineSimilarity.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 28 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Application/Services/System/AppCacheService.cs`
- **File overview:** Service boundary for `AppCacheService` that centralizes operations and side effects for callers.
- **Responsibilities:** Business/application boundary: validation, orchestration, persistence, and side effects.
- **Key functions / classes:** `AppCacheService` (class), `Remove` (method), `RemoveByPrefix` (method)
- **Business logic:** This file appears to own or coordinate a feature workflow. Caching is used to reduce repeated work while relying on invalidation elsewhere.
- **Data flow:** Callers invoke service methods -> this module coordinates Microsoft.Extensions.Caching.Memory, SkillSense.Application.Interfaces -> results leave through AppCacheService, Remove, RemoveByPrefix.
- **Edge cases / constraints:** Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses Microsoft.Extensions.Caching.Memory, SkillSense.Application.Interfaces. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 65 lines. Side effects: cache reads/writes

### `server/SkillSense.Application/Services/System/SystemDateTimeProvider.cs`
- **File overview:** Service boundary for `SystemDateTimeProvider` that centralizes operations and side effects for callers.
- **Responsibilities:** Business/application boundary: validation, orchestration, persistence, and side effects.
- **Key functions / classes:** `SystemDateTimeProvider` (class)
- **Business logic:** This file appears to own or coordinate a feature workflow. It keeps validation, orchestration, and side effects out of callers.
- **Data flow:** Callers invoke service methods -> this module coordinates SkillSense.Application.Interfaces -> results leave through SystemDateTimeProvider.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses SkillSense.Application.Interfaces. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 14 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## server/SkillSense.Application/SkillSense.Application.csproj

### `server/SkillSense.Application/SkillSense.Application.csproj`
- **File overview:** Build/tooling config for the surrounding project.
- **Responsibilities:** Compilation, bundling, linting, or tooling configuration.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** No direct business rules live here. Its value is operational clarity, reproducible environments, or developer guidance.
- **Data flow:** Maintainers update this file -> tooling, environments, or readers consume it -> downstream runtime behavior stays consistent without feature code changes.
- **Edge cases / constraints:** Constraints are operational rather than domain-driven: syntax, environment compatibility, and maintainability matter most.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 31 lines. Side effects: Operational/configuration only.

## server/SkillSense.Application/Validators

### `server/SkillSense.Application/Validators/ResumeFileValidator.cs`
- **File overview:** Validation module for `ResumeFileValidator` used to fail bad inputs early.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `ResumeFileValidator` (class)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through ResumeFileValidator.
- **Edge cases / constraints:** File payload shape and content metadata matter here.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 29 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## server/SkillSense.Domain/Entities

### `server/SkillSense.Domain/Entities/AdminProfileEntity.cs`
- **File overview:** Domain entity definition for `AdminProfileEntity` persisted by the backend.
- **Responsibilities:** Persistence model that defines durable business state.
- **Key functions / classes:** `AdminProfileEntity` (class)
- **Business logic:** The structural business rules live in the fields and relationships defined here.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through AdminProfileEntity.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 10 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Domain/Entities/AppUser.cs`
- **File overview:** Domain entity definition for `AppUser` persisted by the backend.
- **Responsibilities:** Persistence model that defines durable business state.
- **Key functions / classes:** `AppUser` (class)
- **Business logic:** The structural business rules live in the fields and relationships defined here.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through AppUser.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 22 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Domain/Entities/CandidateExplanationEntity.cs`
- **File overview:** Domain entity definition for `CandidateExplanationEntity` persisted by the backend.
- **Responsibilities:** Persistence model that defines durable business state.
- **Key functions / classes:** `CandidateExplanationEntity` (class), `ExplanationStatus` (enum)
- **Business logic:** The structural business rules live in the fields and relationships defined here.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through CandidateExplanationEntity, ExplanationStatus.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 29 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Domain/Entities/CompanyEntity.cs`
- **File overview:** Domain entity definition for `CompanyEntity` persisted by the backend.
- **Responsibilities:** Persistence model that defines durable business state.
- **Key functions / classes:** `CompanyEntity` (class)
- **Business logic:** The structural business rules live in the fields and relationships defined here.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through CompanyEntity.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 13 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Domain/Entities/HireEntity.cs`
- **File overview:** Domain entity definition for `HireEntity` persisted by the backend.
- **Responsibilities:** Persistence model that defines durable business state.
- **Key functions / classes:** `HireStatus` (enum), `HireEntity` (class)
- **Business logic:** The structural business rules live in the fields and relationships defined here.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through HireStatus, HireEntity.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 30 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Domain/Entities/InterviewEntity.cs`
- **File overview:** Domain entity definition for `InterviewEntity` persisted by the backend.
- **Responsibilities:** Persistence model that defines durable business state.
- **Key functions / classes:** `InterviewStatus` (enum), `InterviewType` (enum), `InterviewEntity` (class)
- **Business logic:** The structural business rules live in the fields and relationships defined here.
- **Data flow:** Inputs arrive through callers and dependencies (System.Text.Json.Serialization) -> focused transformation -> outputs leave through InterviewStatus, InterviewType, InterviewEntity.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System.Text.Json.Serialization. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 49 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Domain/Entities/InterviewRescheduleRequestEntity.cs`
- **File overview:** Domain entity definition for `InterviewRescheduleRequestEntity` persisted by the backend.
- **Responsibilities:** Persistence model that defines durable business state.
- **Key functions / classes:** `InterviewRescheduleRequestEntity` (class)
- **Business logic:** The structural business rules live in the fields and relationships defined here.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through InterviewRescheduleRequestEntity.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 15 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Domain/Entities/JobEntity.cs`
- **File overview:** Domain entity definition for `JobEntity` persisted by the backend.
- **Responsibilities:** Persistence model that defines durable business state.
- **Key functions / classes:** `JobEntity` (class), `WorkSetup` (enum), `EmploymentType` (enum), `JobStatus` (enum)
- **Business logic:** The structural business rules live in the fields and relationships defined here.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through JobEntity, WorkSetup, EmploymentType.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 59 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Domain/Entities/JobOfferEntity.cs`
- **File overview:** Domain entity definition for `JobOfferEntity` persisted by the backend.
- **Responsibilities:** Persistence model that defines durable business state.
- **Key functions / classes:** `JobOfferStatus` (enum), `JobOfferEntity` (class)
- **Business logic:** The structural business rules live in the fields and relationships defined here.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through JobOfferStatus, JobOfferEntity.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 38 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Domain/Entities/JobSeekerProfileEntity.cs`
- **File overview:** Domain entity definition for `JobSeekerProfileEntity` persisted by the backend.
- **Responsibilities:** Persistence model that defines durable business state.
- **Key functions / classes:** `JobSeekerProfileEntity` (class)
- **Business logic:** The structural business rules live in the fields and relationships defined here.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through JobSeekerProfileEntity.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 21 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Domain/Entities/NotificationEntity.cs`
- **File overview:** Domain entity definition for `NotificationEntity` persisted by the backend.
- **Responsibilities:** Persistence model that defines durable business state.
- **Key functions / classes:** `NotificationType` (enum), `NotificationEntity` (class)
- **Business logic:** The structural business rules live in the fields and relationships defined here.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through NotificationType, NotificationEntity.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 24 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Domain/Entities/PasswordResetPinEntity.cs`
- **File overview:** Domain entity definition for `PasswordResetPinEntity` persisted by the backend.
- **Responsibilities:** Persistence model that defines durable business state.
- **Key functions / classes:** `VerificationPinPurpose` (enum), `PasswordResetPinEntity` (class)
- **Business logic:** The structural business rules live in the fields and relationships defined here.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through VerificationPinPurpose, PasswordResetPinEntity.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 23 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Domain/Entities/RecruiterProfileEntity.cs`
- **File overview:** Domain entity definition for `RecruiterProfileEntity` persisted by the backend.
- **Responsibilities:** Persistence model that defines durable business state.
- **Key functions / classes:** `RecruiterProfileEntity` (class)
- **Business logic:** The structural business rules live in the fields and relationships defined here.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through RecruiterProfileEntity.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 11 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Domain/Entities/ResumeEmbeddingEntity.cs`
- **File overview:** Domain entity definition for `ResumeEmbeddingEntity` persisted by the backend.
- **Responsibilities:** Persistence model that defines durable business state.
- **Key functions / classes:** `ResumeEmbeddingEntity` (class), `ResumeSectionTypes` (class)
- **Business logic:** The structural business rules live in the fields and relationships defined here.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through ResumeEmbeddingEntity, ResumeSectionTypes.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 28 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Domain/Entities/ResumeScoreEntity.cs`
- **File overview:** Domain entity definition for `ResumeScoreEntity` persisted by the backend.
- **Responsibilities:** Persistence model that defines durable business state.
- **Key functions / classes:** `ResumeScoreEntity` (class)
- **Business logic:** The structural business rules live in the fields and relationships defined here.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through ResumeScoreEntity.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 16 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Domain/Entities/ResumeSubmissionEntity.cs`
- **File overview:** Domain entity definition for `ResumeSubmissionEntity` persisted by the backend.
- **Responsibilities:** Persistence model that defines durable business state.
- **Key functions / classes:** `ResumeSubmissionEntity` (class), `ResumeSubmissionStatus` (enum)
- **Business logic:** The structural business rules live in the fields and relationships defined here.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through ResumeSubmissionEntity, ResumeSubmissionStatus.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 46 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Domain/Entities/SavedJobEntity.cs`
- **File overview:** Domain entity definition for `SavedJobEntity` persisted by the backend.
- **Responsibilities:** Persistence model that defines durable business state.
- **Key functions / classes:** `SavedJobEntity` (class)
- **Business logic:** The structural business rules live in the fields and relationships defined here.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through SavedJobEntity.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 12 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## server/SkillSense.Domain/SkillSense.Domain.csproj

### `server/SkillSense.Domain/SkillSense.Domain.csproj`
- **File overview:** Build/tooling config for the surrounding project.
- **Responsibilities:** Compilation, bundling, linting, or tooling configuration.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** No direct business rules live here. Its value is operational clarity, reproducible environments, or developer guidance.
- **Data flow:** Maintainers update this file -> tooling, environments, or readers consume it -> downstream runtime behavior stays consistent without feature code changes.
- **Edge cases / constraints:** Constraints are operational rather than domain-driven: syntax, environment compatibility, and maintainability matter most.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 13 lines. Side effects: Operational/configuration only.

## server/SkillSense.Infrastructure/Auth

### `server/SkillSense.Infrastructure/Auth/JwtTokenService.cs`
- **File overview:** Maintained module `JwtTokenService` in the codebase.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `JwtTokenService` (class), `CreateTokenAsync` (method), `CreateRefreshTokenAsync` (method), `ValidateRefreshTokenAsync` (method)
- **Business logic:** Validation and guard clauses protect downstream workflows from invalid state.
- **Data flow:** Inputs arrive through callers and dependencies (System.Security.Claims, System.Text, Microsoft.AspNetCore.Identity, Microsoft.EntityFrameworkCore) -> focused transformation -> outputs leave through JwtTokenService, CreateTokenAsync, CreateRefreshTokenAsync.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System.Security.Claims, System.Text, Microsoft.AspNetCore.Identity, Microsoft.EntityFrameworkCore, Microsoft.Extensions.Configuration, Microsoft.IdentityModel.JsonWebTokens. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 206 lines. Side effects: database reads

## server/SkillSense.Infrastructure/BackgroundJobs

### `server/SkillSense.Infrastructure/BackgroundJobs/ResumeProcessingMonitor.cs`
- **File overview:** Maintained module `ResumeProcessingMonitor` in the codebase.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `ResumeProcessingMonitor` (class), `RecordWorkerStarted` (method), `RecordWorkerHeartbeat` (method), `RecordWorkerFailure` (method), `RecordSubmissionStage` (method), `RecordSubmissionSucceeded` (method)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (SkillSense.Application.Interfaces) -> focused transformation -> outputs leave through ResumeProcessingMonitor, RecordWorkerStarted, RecordWorkerHeartbeat.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses SkillSense.Application.Interfaces. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 102 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Infrastructure/BackgroundJobs/ResumeProcessingWorker.cs`
- **File overview:** Maintained module `ResumeProcessingWorker` in the codebase.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `ResumeProcessingWorker` (class)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (Microsoft.Extensions.Hosting, Microsoft.Extensions.Logging, Microsoft.Extensions.Options, SkillSense.Application.Interfaces) -> focused transformation -> outputs leave through ResumeProcessingWorker.
- **Edge cases / constraints:** Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses Microsoft.Extensions.Hosting, Microsoft.Extensions.Logging, Microsoft.Extensions.Options, SkillSense.Application.Interfaces, SkillSense.Infrastructure.Options. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 85 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## server/SkillSense.Infrastructure/ConfigureInfrastructureService.cs

### `server/SkillSense.Infrastructure/ConfigureInfrastructureService.cs`
- **File overview:** Maintained module `ConfigureInfrastructureService` in the codebase.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `ConfigureInfrastructureService` (class), `AddInfrastructureServices` (method)
- **Business logic:** Validation and guard clauses protect downstream workflows from invalid state.
- **Data flow:** Inputs arrive through callers and dependencies (Microsoft.Extensions.Configuration, Microsoft.Extensions.DependencyInjection, Microsoft.Extensions.Hosting, SkillSense.Application.Interfaces) -> focused transformation -> outputs leave through ConfigureInfrastructureService, AddInfrastructureServices.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses Microsoft.Extensions.Configuration, Microsoft.Extensions.DependencyInjection, Microsoft.Extensions.Hosting, SkillSense.Application.Interfaces, SkillSense.Application.Interfaces.Auth, Microsoft.Extensions.Options. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 195 lines. Side effects: HTTP/API calls, email/calendar delivery

## server/SkillSense.Infrastructure/Options

### `server/SkillSense.Infrastructure/Options/CloudflareR2Options.cs`
- **File overview:** Configuration module for `CloudflareR2Options` that binds framework or runtime settings.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `CloudflareR2Options` (class)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through CloudflareR2Options.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 12 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Infrastructure/Options/GmailSmtpOptions.cs`
- **File overview:** Configuration module for `GmailSmtpOptions` that binds framework or runtime settings.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `GmailSmtpOptions` (class), `IsConfigured` (method)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through GmailSmtpOptions, IsConfigured.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 31 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Infrastructure/Options/GroqOptions.cs`
- **File overview:** Configuration module for `GroqOptions` that binds framework or runtime settings.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `GroqOptions` (class)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through GroqOptions.
- **Edge cases / constraints:** Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 13 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Infrastructure/Options/ResumeProcessingWorkerOptions.cs`
- **File overview:** Configuration module for `ResumeProcessingWorkerOptions` that binds framework or runtime settings.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `ResumeProcessingWorkerOptions` (class), `Validate` (method)
- **Business logic:** Validation and guard clauses protect downstream workflows from invalid state.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through ResumeProcessingWorkerOptions, Validate.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 39 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Infrastructure/Options/SbertOptions.cs`
- **File overview:** Configuration module for `SbertOptions` that binds framework or runtime settings.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `SbertOptions` (class)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through SbertOptions.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 12 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Infrastructure/Options/StorageOptions.cs`
- **File overview:** Configuration module for `StorageOptions` that binds framework or runtime settings.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `StorageOptions` (class)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through StorageOptions.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 10 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## server/SkillSense.Infrastructure/Services

### `server/SkillSense.Infrastructure/Services/CloudflareR2StorageService.cs`
- **File overview:** Service boundary for `CloudflareR2StorageService` that centralizes operations and side effects for callers.
- **Responsibilities:** Business/application boundary: validation, orchestration, persistence, and side effects.
- **Key functions / classes:** `CloudflareR2StorageService` (class), `UploadAsync` (method), `DownloadAsync` (method), `DeleteAsync` (method), `ExistsAsync` (method), `GetDownloadUrlAsync` (method)
- **Business logic:** This file appears to own or coordinate a feature workflow. Persistence is part of this file's transaction boundary.
- **Data flow:** Callers invoke service methods -> this module coordinates Amazon.S3, Amazon.S3.Model, Microsoft.Extensions.Options, SkillSense.Application.Interfaces -> results leave through CloudflareR2StorageService, UploadAsync, DownloadAsync.
- **Edge cases / constraints:** File payload shape and content metadata matter here. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses Amazon.S3, Amazon.S3.Model, Microsoft.Extensions.Options, SkillSense.Application.Interfaces, SkillSense.Infrastructure.Options, System.Net.Mime. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 98 lines. Side effects: database writes, object storage

### `server/SkillSense.Infrastructure/Services/GmailSmtpEmailService.cs`
- **File overview:** Service boundary for `GmailSmtpEmailService` that centralizes operations and side effects for callers.
- **Responsibilities:** Business/application boundary: validation, orchestration, persistence, and side effects.
- **Key functions / classes:** `GmailSmtpEmailService` (class), `SendEmailAsync` (method)
- **Business logic:** This file appears to own or coordinate a feature workflow. Validation and guard clauses protect downstream workflows from invalid state.
- **Data flow:** Callers invoke service methods -> this module coordinates System.Net, System.Net.Mail, Microsoft.Extensions.Logging, Microsoft.Extensions.Options -> results leave through GmailSmtpEmailService, SendEmailAsync.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses System.Net, System.Net.Mail, Microsoft.Extensions.Logging, Microsoft.Extensions.Options, SkillSense.Application.Contracts.Email, SkillSense.Application.Interfaces. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 84 lines. Side effects: email/calendar delivery

### `server/SkillSense.Infrastructure/Services/GroqCandidateAnalysisParser.cs`
- **File overview:** Service boundary for `GroqCandidateAnalysisParser` that centralizes operations and side effects for callers.
- **Responsibilities:** Business/application boundary: validation, orchestration, persistence, and side effects.
- **Key functions / classes:** `GroqCandidateAnalysisParseResult` (record), `GroqCandidateAnalysisParser` (class), `Parse` (method)
- **Business logic:** This file appears to own or coordinate a feature workflow. It keeps validation, orchestration, and side effects out of callers.
- **Data flow:** Callers invoke service methods -> this module coordinates System.Text.Json, SkillSense.Application.Contracts.Recruiter.Response -> results leave through GroqCandidateAnalysisParseResult, GroqCandidateAnalysisParser, Parse.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses System.Text.Json, SkillSense.Application.Contracts.Recruiter.Response. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 198 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Infrastructure/Services/GroqExplanationProvider.cs`
- **File overview:** Service boundary for `GroqExplanationProvider` that centralizes operations and side effects for callers.
- **Responsibilities:** Business/application boundary: validation, orchestration, persistence, and side effects.
- **Key functions / classes:** `GroqExplanationProvider` (class), `GenerateRecruiterExplanationAsync` (method)
- **Business logic:** This file appears to own or coordinate a feature workflow. Validation and guard clauses protect downstream workflows from invalid state.
- **Data flow:** Callers invoke service methods -> this module coordinates System.Net.Http.Headers, System.Text, System.Text.Json, Microsoft.Extensions.Hosting -> results leave through GroqExplanationProvider, GenerateRecruiterExplanationAsync.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses System.Net.Http.Headers, System.Text, System.Text.Json, Microsoft.Extensions.Hosting, Microsoft.Extensions.Logging, Microsoft.Extensions.Options. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 137 lines. Side effects: HTTP/API calls

### `server/SkillSense.Infrastructure/Services/GroqRequestOptimizer.cs`
- **File overview:** Service boundary for `GroqRequestOptimizer` that centralizes operations and side effects for callers.
- **Responsibilities:** Business/application boundary: validation, orchestration, persistence, and side effects.
- **Key functions / classes:** `GroqPromptCompressionLevel` (enum), `GroqChatMessage` (record), `GroqPromptBuildResult` (record), `GroqRequestOptimizer` (class), `EstimateTokenSize` (method), `BuildPrompt` (method)
- **Business logic:** This file appears to own or coordinate a feature workflow. Validation and guard clauses protect downstream workflows from invalid state.
- **Data flow:** Callers invoke service methods -> this module coordinates System.Text.Json, SkillSense.Application.Contracts.Recruiter.Response -> results leave through GroqPromptCompressionLevel, GroqChatMessage, GroqPromptBuildResult.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses System.Text.Json, SkillSense.Application.Contracts.Recruiter.Response. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 227 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Infrastructure/Services/InterviewCalendarService.cs`
- **File overview:** Service boundary for `InterviewCalendarService` that centralizes operations and side effects for callers.
- **Responsibilities:** Business/application boundary: validation, orchestration, persistence, and side effects.
- **Key functions / classes:** `InterviewCalendarService` (class), `BuildCalendarContent` (method)
- **Business logic:** This file appears to own or coordinate a feature workflow. It keeps validation, orchestration, and side effects out of callers.
- **Data flow:** Callers invoke service methods -> this module coordinates System.Text, SkillSense.Application.Interfaces, SkillSense.Domain.Entities -> results leave through InterviewCalendarService, BuildCalendarContent.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses System.Text, SkillSense.Application.Interfaces, SkillSense.Domain.Entities. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 141 lines. Side effects: email/calendar delivery

### `server/SkillSense.Infrastructure/Services/InterviewInviteEmailSender.cs`
- **File overview:** Service boundary for `InterviewInviteEmailSender` that centralizes operations and side effects for callers.
- **Responsibilities:** Business/application boundary: validation, orchestration, persistence, and side effects.
- **Key functions / classes:** `InterviewInviteEmailSender` (class), `SendCalendarInviteAsync` (method)
- **Business logic:** This file appears to own or coordinate a feature workflow. It keeps validation, orchestration, and side effects out of callers.
- **Data flow:** Callers invoke service methods -> this module coordinates System.Text, SkillSense.Application.Contracts.Email, SkillSense.Application.Interfaces -> results leave through InterviewInviteEmailSender, SendCalendarInviteAsync.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System.Text, SkillSense.Application.Contracts.Email, SkillSense.Application.Interfaces. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 40 lines. Side effects: email/calendar delivery

### `server/SkillSense.Infrastructure/Services/LocalObjectStorageService.cs`
- **File overview:** Service boundary for `LocalObjectStorageService` that centralizes operations and side effects for callers.
- **Responsibilities:** Business/application boundary: validation, orchestration, persistence, and side effects.
- **Key functions / classes:** `LocalObjectStorageService` (class), `UploadAsync` (method), `DownloadAsync` (method), `DeleteAsync` (method), `ExistsAsync` (method), `GetDownloadUrlAsync` (method)
- **Business logic:** This file appears to own or coordinate a feature workflow. Validation and guard clauses protect downstream workflows from invalid state. Persistence is part of this file's transaction boundary.
- **Data flow:** Callers invoke service methods -> this module coordinates Microsoft.Extensions.Logging, Microsoft.Extensions.Options, SkillSense.Application.Interfaces, SkillSense.Infrastructure.Options -> results leave through LocalObjectStorageService, UploadAsync, DownloadAsync.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. File payload shape and content metadata matter here.
- **Dependencies:** Uses Microsoft.Extensions.Logging, Microsoft.Extensions.Options, SkillSense.Application.Interfaces, SkillSense.Infrastructure.Options. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 106 lines. Side effects: database writes, object storage

### `server/SkillSense.Infrastructure/Services/ResumeParserClient.cs`
- **File overview:** Service boundary for `ResumeParserClient` that centralizes operations and side effects for callers.
- **Responsibilities:** Business/application boundary: validation, orchestration, persistence, and side effects.
- **Key functions / classes:** `ResumeParserClient` (class), `ParseAsync` (method)
- **Business logic:** This file appears to own or coordinate a feature workflow. Validation and guard clauses protect downstream workflows from invalid state.
- **Data flow:** Callers invoke service methods -> this module coordinates System.Text.Json, SkillSense.Application.Contracts.Response, SkillSense.Application.Interfaces -> results leave through ResumeParserClient, ParseAsync.
- **Edge cases / constraints:** File payload shape and content metadata matter here.
- **Dependencies:** Uses System.Text.Json, SkillSense.Application.Contracts.Response, SkillSense.Application.Interfaces. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 40 lines. Side effects: HTTP/API calls, file uploads/form data

### `server/SkillSense.Infrastructure/Services/SbertOnnxEmbeddingService.cs`
- **File overview:** Service boundary for `SbertOnnxEmbeddingService` that centralizes operations and side effects for callers.
- **Responsibilities:** Business/application boundary: validation, orchestration, persistence, and side effects.
- **Key functions / classes:** `SbertOnnxEmbeddingService` (class), `EncodedTokens` (record), `WordPieceTokenizer` (class), `EmbedAsync` (method), `Dispose` (method), `Encode` (method)
- **Business logic:** This file appears to own or coordinate a feature workflow. Validation and guard clauses protect downstream workflows from invalid state.
- **Data flow:** Callers invoke service methods -> this module coordinates Microsoft.ML.OnnxRuntime, Microsoft.ML.OnnxRuntime.Tensors, SkillSense.Application.Interfaces, SkillSense.Infrastructure.Options -> results leave through SbertOnnxEmbeddingService, EncodedTokens, WordPieceTokenizer.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses Microsoft.ML.OnnxRuntime, Microsoft.ML.OnnxRuntime.Tensors, SkillSense.Application.Interfaces, SkillSense.Infrastructure.Options, System.Text. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 284 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## server/SkillSense.Infrastructure/SkillSense.Infrastructure.csproj

### `server/SkillSense.Infrastructure/SkillSense.Infrastructure.csproj`
- **File overview:** Build/tooling config for the surrounding project.
- **Responsibilities:** Compilation, bundling, linting, or tooling configuration.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** No direct business rules live here. Its value is operational clarity, reproducible environments, or developer guidance.
- **Data flow:** Maintainers update this file -> tooling, environments, or readers consume it -> downstream runtime behavior stays consistent without feature code changes.
- **Edge cases / constraints:** Constraints are operational rather than domain-driven: syntax, environment compatibility, and maintainability matter most.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 25 lines. Side effects: Operational/configuration only.

## server/SkillSense.Persistence/Configurations

### `server/SkillSense.Persistence/Configurations/AppUserConfigurations.cs`
- **File overview:** Configuration module for `AppUserConfigurations` that binds framework or runtime settings.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `AppUserConfiguration` (class), `Configure` (method)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (Microsoft.EntityFrameworkCore.Metadata.Builders, SkillSense.Domain.Entities) -> focused transformation -> outputs leave through AppUserConfiguration, Configure.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Microsoft.EntityFrameworkCore.Metadata.Builders, SkillSense.Domain.Entities. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 32 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Persistence/Configurations/CandidateExplanationConfiguration.cs`
- **File overview:** Configuration module for `CandidateExplanationConfiguration` that binds framework or runtime settings.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `CandidateExplanationConfiguration` (class), `Configure` (method)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (Microsoft.EntityFrameworkCore.Metadata.Builders, SkillSense.Domain.Entities) -> focused transformation -> outputs leave through CandidateExplanationConfiguration, Configure.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Microsoft.EntityFrameworkCore.Metadata.Builders, SkillSense.Domain.Entities. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 58 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Persistence/Configurations/CompanyConfiguration.cs`
- **File overview:** Configuration module for `CompanyConfiguration` that binds framework or runtime settings.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `CompanyConfiguration` (class), `Configure` (method)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (Microsoft.EntityFrameworkCore, Microsoft.EntityFrameworkCore.Metadata.Builders, SkillSense.Domain.Entities) -> focused transformation -> outputs leave through CompanyConfiguration, Configure.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Microsoft.EntityFrameworkCore, Microsoft.EntityFrameworkCore.Metadata.Builders, SkillSense.Domain.Entities. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 35 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Persistence/Configurations/HireConfiguration.cs`
- **File overview:** Configuration module for `HireConfiguration` that binds framework or runtime settings.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `HireConfiguration` (class), `Configure` (method)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (Microsoft.EntityFrameworkCore, Microsoft.EntityFrameworkCore.Metadata.Builders, SkillSense.Domain.Entities) -> focused transformation -> outputs leave through HireConfiguration, Configure.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Microsoft.EntityFrameworkCore, Microsoft.EntityFrameworkCore.Metadata.Builders, SkillSense.Domain.Entities. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 58 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Persistence/Configurations/InterviewConfiguration.cs`
- **File overview:** Configuration module for `InterviewConfiguration` that binds framework or runtime settings.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `InterviewConfiguration` (class), `InterviewRescheduleRequestConfiguration` (class), `NotificationConfiguration` (class), `Configure` (method)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (Microsoft.EntityFrameworkCore, Microsoft.EntityFrameworkCore.Metadata.Builders, SkillSense.Domain.Entities) -> focused transformation -> outputs leave through InterviewConfiguration, InterviewRescheduleRequestConfiguration, NotificationConfiguration.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Microsoft.EntityFrameworkCore, Microsoft.EntityFrameworkCore.Metadata.Builders, SkillSense.Domain.Entities. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 89 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Persistence/Configurations/JobConfiguration.cs`
- **File overview:** Configuration module for `JobConfiguration` that binds framework or runtime settings.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `JobConfiguration` (class), `Configure` (method)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (Microsoft.EntityFrameworkCore, Microsoft.EntityFrameworkCore.Metadata.Builders, SkillSense.Domain.Entities) -> focused transformation -> outputs leave through JobConfiguration, Configure.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Microsoft.EntityFrameworkCore, Microsoft.EntityFrameworkCore.Metadata.Builders, SkillSense.Domain.Entities. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 87 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Persistence/Configurations/JobOfferConfiguration.cs`
- **File overview:** Configuration module for `JobOfferConfiguration` that binds framework or runtime settings.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `JobOfferConfiguration` (class), `Configure` (method)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (Microsoft.EntityFrameworkCore, Microsoft.EntityFrameworkCore.Metadata.Builders, SkillSense.Domain.Entities) -> focused transformation -> outputs leave through JobOfferConfiguration, Configure.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Microsoft.EntityFrameworkCore, Microsoft.EntityFrameworkCore.Metadata.Builders, SkillSense.Domain.Entities. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 65 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Persistence/Configurations/PasswordResetPinConfiguration.cs`
- **File overview:** Configuration module for `PasswordResetPinConfiguration` that binds framework or runtime settings.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `PasswordResetPinConfiguration` (class), `Configure` (method)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (Microsoft.EntityFrameworkCore, Microsoft.EntityFrameworkCore.Metadata.Builders, SkillSense.Domain.Entities) -> focused transformation -> outputs leave through PasswordResetPinConfiguration, Configure.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Microsoft.EntityFrameworkCore, Microsoft.EntityFrameworkCore.Metadata.Builders, SkillSense.Domain.Entities. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 30 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Persistence/Configurations/ProfileConfiguration.cs`
- **File overview:** Configuration module for `ProfileConfiguration` that binds framework or runtime settings.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `JobSeekerProfileConfiguration` (class), `RecruiterProfileConfiguration` (class), `AdminProfileConfiguration` (class), `Configure` (method)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (Microsoft.EntityFrameworkCore, Microsoft.EntityFrameworkCore.Metadata.Builders, SkillSense.Domain.Entities) -> focused transformation -> outputs leave through JobSeekerProfileConfiguration, RecruiterProfileConfiguration, AdminProfileConfiguration.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Microsoft.EntityFrameworkCore, Microsoft.EntityFrameworkCore.Metadata.Builders, SkillSense.Domain.Entities. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 54 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Persistence/Configurations/ResumeEmbeddingConfiguration.cs`
- **File overview:** Configuration module for `ResumeEmbeddingConfiguration` that binds framework or runtime settings.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `ResumeEmbeddingConfiguration` (class), `Configure` (method)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (Microsoft.EntityFrameworkCore.Metadata.Builders, SkillSense.Domain.Entities) -> focused transformation -> outputs leave through ResumeEmbeddingConfiguration, Configure.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Microsoft.EntityFrameworkCore.Metadata.Builders, SkillSense.Domain.Entities. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 20 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Persistence/Configurations/ResumeScoreConfiguration.cs`
- **File overview:** Configuration module for `ResumeScoreConfiguration` that binds framework or runtime settings.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `ResumeScoreConfiguration` (class), `Configure` (method)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (Microsoft.EntityFrameworkCore.Metadata.Builders, SkillSense.Domain.Entities) -> focused transformation -> outputs leave through ResumeScoreConfiguration, Configure.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Microsoft.EntityFrameworkCore.Metadata.Builders, SkillSense.Domain.Entities. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 19 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Persistence/Configurations/ResumeSubmissionConfiguration.cs`
- **File overview:** Configuration module for `ResumeSubmissionConfiguration` that binds framework or runtime settings.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `ResumeSubmissionConfiguration` (class), `Configure` (method)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (Microsoft.EntityFrameworkCore, Microsoft.EntityFrameworkCore.Metadata.Builders, SkillSense.Domain.Entities) -> focused transformation -> outputs leave through ResumeSubmissionConfiguration, Configure.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Microsoft.EntityFrameworkCore, Microsoft.EntityFrameworkCore.Metadata.Builders, SkillSense.Domain.Entities. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 63 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Persistence/Configurations/SavedJobConfiguration.cs`
- **File overview:** Configuration module for `SavedJobConfiguration` that binds framework or runtime settings.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `SavedJobConfiguration` (class), `Configure` (method)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (Microsoft.EntityFrameworkCore, Microsoft.EntityFrameworkCore.Metadata.Builders, SkillSense.Domain.Entities) -> focused transformation -> outputs leave through SavedJobConfiguration, Configure.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Microsoft.EntityFrameworkCore, Microsoft.EntityFrameworkCore.Metadata.Builders, SkillSense.Domain.Entities. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 27 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## server/SkillSense.Persistence/ConfigurePersistenceServices.cs

### `server/SkillSense.Persistence/ConfigurePersistenceServices.cs`
- **File overview:** Maintained module `ConfigurePersistenceServices` in the codebase.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `ConfigurePersistenceServices` (class), `AddPersistenceServices` (method)
- **Business logic:** Validation and guard clauses protect downstream workflows from invalid state.
- **Data flow:** Inputs arrive through callers and dependencies (Microsoft.AspNetCore.Identity, Microsoft.EntityFrameworkCore, Microsoft.Extensions.Configuration, Microsoft.Extensions.DependencyInjection) -> focused transformation -> outputs leave through ConfigurePersistenceServices, AddPersistenceServices.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Microsoft.AspNetCore.Identity, Microsoft.EntityFrameworkCore, Microsoft.Extensions.Configuration, Microsoft.Extensions.DependencyInjection, SkillSense.Domain.Entities, SkillSense.Persistence.Data. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 63 lines. Side effects: database reads

## server/SkillSense.Persistence/Data

### `server/SkillSense.Persistence/Data/SkillSenseDbContext.cs`
- **File overview:** Static data resource for `SkillSenseDbContext` used by runtime code.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `SkillSenseDbContext` (class)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (System.Reflection, Microsoft.AspNetCore.Identity, Microsoft.AspNetCore.Identity.EntityFrameworkCore, Microsoft.EntityFrameworkCore) -> focused transformation -> outputs leave through SkillSenseDbContext.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System.Reflection, Microsoft.AspNetCore.Identity, Microsoft.AspNetCore.Identity.EntityFrameworkCore, Microsoft.EntityFrameworkCore, SkillSense.Domain.Entities. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 38 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## server/SkillSense.Persistence/Interfaces

### `server/SkillSense.Persistence/Interfaces/IAdminManagementRepository.cs`
- **File overview:** Abstraction contract for `IAdminManagementRepository` used to decouple higher-level workflows from implementations.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `IAdminManagementRepository` (interface)
- **Business logic:** Persistence is part of this file's transaction boundary.
- **Data flow:** Inputs arrive through callers and dependencies (SkillSense.Domain.Entities, SkillSense.Persistence.Models) -> focused transformation -> outputs leave through IAdminManagementRepository.
- **Edge cases / constraints:** Pagination is normalized or bounded.
- **Dependencies:** Uses SkillSense.Domain.Entities, SkillSense.Persistence.Models. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 54 lines. Side effects: database writes, database reads

### `server/SkillSense.Persistence/Interfaces/IAuthRepository.cs`
- **File overview:** Abstraction contract for `IAuthRepository` used to decouple higher-level workflows from implementations.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `IAuthRepository` (interface)
- **Business logic:** Persistence is part of this file's transaction boundary.
- **Data flow:** Inputs arrive through callers and dependencies (SkillSense.Persistence.Models, SkillSense.Domain.Entities) -> focused transformation -> outputs leave through IAuthRepository.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses SkillSense.Persistence.Models, SkillSense.Domain.Entities. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 30 lines. Side effects: database writes, database reads

### `server/SkillSense.Persistence/Interfaces/ICandidateExplanationRepository.cs`
- **File overview:** Abstraction contract for `ICandidateExplanationRepository` used to decouple higher-level workflows from implementations.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `ICandidateExplanationRepository` (interface), `for` (record)
- **Business logic:** Persistence is part of this file's transaction boundary.
- **Data flow:** Inputs arrive through callers and dependencies (SkillSense.Domain.Entities, SkillSense.Persistence.Models) -> focused transformation -> outputs leave through ICandidateExplanationRepository, for.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses SkillSense.Domain.Entities, SkillSense.Persistence.Models. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 35 lines. Side effects: database writes, database reads

### `server/SkillSense.Persistence/Interfaces/IInterviewRepository.cs`
- **File overview:** Abstraction contract for `IInterviewRepository` used to decouple higher-level workflows from implementations.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `IInterviewRepository` (interface)
- **Business logic:** Persistence is part of this file's transaction boundary.
- **Data flow:** Inputs arrive through callers and dependencies (SkillSense.Domain.Entities, SkillSense.Persistence.Models) -> focused transformation -> outputs leave through IInterviewRepository.
- **Edge cases / constraints:** Pagination is normalized or bounded.
- **Dependencies:** Uses SkillSense.Domain.Entities, SkillSense.Persistence.Models. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 24 lines. Side effects: database writes, database reads

### `server/SkillSense.Persistence/Interfaces/IJobRepository.cs`
- **File overview:** Abstraction contract for `IJobRepository` used to decouple higher-level workflows from implementations.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `IJobRepository` (interface)
- **Business logic:** Persistence is part of this file's transaction boundary.
- **Data flow:** Inputs arrive through callers and dependencies (SkillSense.Domain.Entities) -> focused transformation -> outputs leave through IJobRepository.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses SkillSense.Domain.Entities. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 15 lines. Side effects: database writes, database reads

### `server/SkillSense.Persistence/Interfaces/IJobSeekerRepository.cs`
- **File overview:** Abstraction contract for `IJobSeekerRepository` used to decouple higher-level workflows from implementations.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `IJobSeekerRepository` (interface)
- **Business logic:** Persistence is part of this file's transaction boundary.
- **Data flow:** Inputs arrive through callers and dependencies (SkillSense.Persistence.Models) -> focused transformation -> outputs leave through IJobSeekerRepository.
- **Edge cases / constraints:** Pagination is normalized or bounded.
- **Dependencies:** Uses SkillSense.Persistence.Models. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 32 lines. Side effects: database writes, database reads

### `server/SkillSense.Persistence/Interfaces/INotificationRepository.cs`
- **File overview:** Abstraction contract for `INotificationRepository` used to decouple higher-level workflows from implementations.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `INotificationRepository` (interface)
- **Business logic:** Persistence is part of this file's transaction boundary.
- **Data flow:** Inputs arrive through callers and dependencies (SkillSense.Domain.Entities) -> focused transformation -> outputs leave through INotificationRepository.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses SkillSense.Domain.Entities. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 16 lines. Side effects: database writes, database reads

### `server/SkillSense.Persistence/Interfaces/IRecruiterRepository.cs`
- **File overview:** Abstraction contract for `IRecruiterRepository` used to decouple higher-level workflows from implementations.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `IRecruiterRepository` (interface)
- **Business logic:** Persistence is part of this file's transaction boundary.
- **Data flow:** Inputs arrive through callers and dependencies (Microsoft.EntityFrameworkCore.Storage, SkillSense.Domain.Entities, SkillSense.Persistence.Models) -> focused transformation -> outputs leave through IRecruiterRepository.
- **Edge cases / constraints:** Pagination is normalized or bounded.
- **Dependencies:** Uses Microsoft.EntityFrameworkCore.Storage, SkillSense.Domain.Entities, SkillSense.Persistence.Models. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 34 lines. Side effects: database writes, database reads

### `server/SkillSense.Persistence/Interfaces/IResumeEmbeddingRepository.cs`
- **File overview:** Abstraction contract for `IResumeEmbeddingRepository` used to decouple higher-level workflows from implementations.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `IResumeEmbeddingRepository` (interface)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through IResumeEmbeddingRepository.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 9 lines. Side effects: database reads

### `server/SkillSense.Persistence/Interfaces/IResumeScoreRepository.cs`
- **File overview:** Abstraction contract for `IResumeScoreRepository` used to decouple higher-level workflows from implementations.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `IResumeScoreRepository` (interface)
- **Business logic:** Persistence is part of this file's transaction boundary.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through IResumeScoreRepository.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 9 lines. Side effects: database writes, database reads

### `server/SkillSense.Persistence/Interfaces/IResumeSubmissionRepository.cs`
- **File overview:** Abstraction contract for `IResumeSubmissionRepository` used to decouple higher-level workflows from implementations.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `IResumeSubmissionRepository` (interface)
- **Business logic:** Persistence is part of this file's transaction boundary.
- **Data flow:** Inputs arrive through callers and dependencies (System.Collections.Generic, System.Text, SkillSense.Domain.Entities) -> focused transformation -> outputs leave through IResumeSubmissionRepository.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System.Collections.Generic, System.Text, SkillSense.Domain.Entities. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 17 lines. Side effects: database writes, database reads

## server/SkillSense.Persistence/Migrations

### `server/SkillSense.Persistence/Migrations/20260326131530_AddJobSeekerFeature.Designer.cs`
- **File overview:** Database migration artifact for `20260326131530_AddJobSeekerFeature Designer` describing one schema transition.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `AddJobSeekerFeature` (class)
- **Business logic:** Not live runtime logic, but it permanently changes what business state can be stored and queried.
- **Data flow:** Inputs arrive through callers and dependencies (System, Microsoft.EntityFrameworkCore, Microsoft.EntityFrameworkCore.Infrastructure, Microsoft.EntityFrameworkCore.Migrations) -> focused transformation -> outputs leave through AddJobSeekerFeature.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System, Microsoft.EntityFrameworkCore, Microsoft.EntityFrameworkCore.Infrastructure, Microsoft.EntityFrameworkCore.Migrations, Microsoft.EntityFrameworkCore.Storage.ValueConversion, Npgsql.EntityFrameworkCore.PostgreSQL.Metadata. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 1279 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Persistence/Migrations/20260326131530_AddJobSeekerFeature.cs`
- **File overview:** Database migration artifact for `20260326131530_AddJobSeekerFeature` describing one schema transition.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `AddJobSeekerFeature` (class)
- **Business logic:** Not live runtime logic, but it permanently changes what business state can be stored and queried.
- **Data flow:** Inputs arrive through callers and dependencies (Microsoft.EntityFrameworkCore.Migrations, Npgsql.EntityFrameworkCore.PostgreSQL.Metadata) -> focused transformation -> outputs leave through AddJobSeekerFeature.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Microsoft.EntityFrameworkCore.Migrations, Npgsql.EntityFrameworkCore.PostgreSQL.Metadata. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 872 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Persistence/Migrations/20260327072940_AddHiredEmployeeFlow.Designer.cs`
- **File overview:** Database migration artifact for `20260327072940_AddHiredEmployeeFlow Designer` describing one schema transition.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `AddHiredEmployeeFlow` (class)
- **Business logic:** Not live runtime logic, but it permanently changes what business state can be stored and queried.
- **Data flow:** Inputs arrive through callers and dependencies (System, Microsoft.EntityFrameworkCore, Microsoft.EntityFrameworkCore.Infrastructure, Microsoft.EntityFrameworkCore.Migrations) -> focused transformation -> outputs leave through AddHiredEmployeeFlow.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System, Microsoft.EntityFrameworkCore, Microsoft.EntityFrameworkCore.Infrastructure, Microsoft.EntityFrameworkCore.Migrations, Microsoft.EntityFrameworkCore.Storage.ValueConversion, Npgsql.EntityFrameworkCore.PostgreSQL.Metadata. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 1292 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Persistence/Migrations/20260327072940_AddHiredEmployeeFlow.cs`
- **File overview:** Database migration artifact for `20260327072940_AddHiredEmployeeFlow` describing one schema transition.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `AddHiredEmployeeFlow` (class)
- **Business logic:** Not live runtime logic, but it permanently changes what business state can be stored and queried.
- **Data flow:** Inputs arrive through callers and dependencies (Microsoft.EntityFrameworkCore.Migrations) -> focused transformation -> outputs leave through AddHiredEmployeeFlow.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Microsoft.EntityFrameworkCore.Migrations. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 104 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Persistence/Migrations/20260327080325_StructureOfferFieldsAndExpiration.Designer.cs`
- **File overview:** Database migration artifact for `20260327080325_StructureOfferFieldsAndExpiration Designer` describing one schema transition.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `StructureOfferFieldsAndExpiration` (class)
- **Business logic:** Not live runtime logic, but it permanently changes what business state can be stored and queried.
- **Data flow:** Inputs arrive through callers and dependencies (System, Microsoft.EntityFrameworkCore, Microsoft.EntityFrameworkCore.Infrastructure, Microsoft.EntityFrameworkCore.Migrations) -> focused transformation -> outputs leave through StructureOfferFieldsAndExpiration.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System, Microsoft.EntityFrameworkCore, Microsoft.EntityFrameworkCore.Infrastructure, Microsoft.EntityFrameworkCore.Migrations, Microsoft.EntityFrameworkCore.Storage.ValueConversion, Npgsql.EntityFrameworkCore.PostgreSQL.Metadata. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 1318 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Persistence/Migrations/20260327080325_StructureOfferFieldsAndExpiration.cs`
- **File overview:** Database migration artifact for `20260327080325_StructureOfferFieldsAndExpiration` describing one schema transition.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `StructureOfferFieldsAndExpiration` (class)
- **Business logic:** Not live runtime logic, but it permanently changes what business state can be stored and queried.
- **Data flow:** Inputs arrive through callers and dependencies (Microsoft.EntityFrameworkCore.Migrations) -> focused transformation -> outputs leave through StructureOfferFieldsAndExpiration.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Microsoft.EntityFrameworkCore.Migrations. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 89 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Persistence/Migrations/20260327090813_UpdateInterviewFlow.Designer.cs`
- **File overview:** Database migration artifact for `20260327090813_UpdateInterviewFlow Designer` describing one schema transition.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `UpdateInterviewFlow` (class)
- **Business logic:** Not live runtime logic, but it permanently changes what business state can be stored and queried.
- **Data flow:** Inputs arrive through callers and dependencies (System, Microsoft.EntityFrameworkCore, Microsoft.EntityFrameworkCore.Infrastructure, Microsoft.EntityFrameworkCore.Migrations) -> focused transformation -> outputs leave through UpdateInterviewFlow.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System, Microsoft.EntityFrameworkCore, Microsoft.EntityFrameworkCore.Infrastructure, Microsoft.EntityFrameworkCore.Migrations, Microsoft.EntityFrameworkCore.Storage.ValueConversion, Npgsql.EntityFrameworkCore.PostgreSQL.Metadata. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 1324 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Persistence/Migrations/20260327090813_UpdateInterviewFlow.cs`
- **File overview:** Database migration artifact for `20260327090813_UpdateInterviewFlow` describing one schema transition.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `UpdateInterviewFlow` (class)
- **Business logic:** Not live runtime logic, but it permanently changes what business state can be stored and queried.
- **Data flow:** Inputs arrive through callers and dependencies (Microsoft.EntityFrameworkCore.Migrations) -> focused transformation -> outputs leave through UpdateInterviewFlow.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Microsoft.EntityFrameworkCore.Migrations. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 39 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Persistence/Migrations/20260327093957_AddDedicatedHiresTable.Designer.cs`
- **File overview:** Database migration artifact for `20260327093957_AddDedicatedHiresTable Designer` describing one schema transition.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `AddDedicatedHiresTable` (class)
- **Business logic:** Not live runtime logic, but it permanently changes what business state can be stored and queried.
- **Data flow:** Inputs arrive through callers and dependencies (System, Microsoft.EntityFrameworkCore, Microsoft.EntityFrameworkCore.Infrastructure, Microsoft.EntityFrameworkCore.Migrations) -> focused transformation -> outputs leave through AddDedicatedHiresTable.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System, Microsoft.EntityFrameworkCore, Microsoft.EntityFrameworkCore.Infrastructure, Microsoft.EntityFrameworkCore.Migrations, Microsoft.EntityFrameworkCore.Storage.ValueConversion, Npgsql.EntityFrameworkCore.PostgreSQL.Metadata. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 1443 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Persistence/Migrations/20260327093957_AddDedicatedHiresTable.cs`
- **File overview:** Database migration artifact for `20260327093957_AddDedicatedHiresTable` describing one schema transition.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `AddDedicatedHiresTable` (class)
- **Business logic:** Not live runtime logic, but it permanently changes what business state can be stored and queried.
- **Data flow:** Inputs arrive through callers and dependencies (Microsoft.EntityFrameworkCore.Migrations) -> focused transformation -> outputs leave through AddDedicatedHiresTable.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Microsoft.EntityFrameworkCore.Migrations. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 121 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Persistence/Migrations/20260327094444_AddHireEntity.Designer.cs`
- **File overview:** Database migration artifact for `20260327094444_AddHireEntity Designer` describing one schema transition.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `AddHireEntity` (class)
- **Business logic:** Not live runtime logic, but it permanently changes what business state can be stored and queried.
- **Data flow:** Inputs arrive through callers and dependencies (System, Microsoft.EntityFrameworkCore, Microsoft.EntityFrameworkCore.Infrastructure, Microsoft.EntityFrameworkCore.Migrations) -> focused transformation -> outputs leave through AddHireEntity.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System, Microsoft.EntityFrameworkCore, Microsoft.EntityFrameworkCore.Infrastructure, Microsoft.EntityFrameworkCore.Migrations, Microsoft.EntityFrameworkCore.Storage.ValueConversion, Npgsql.EntityFrameworkCore.PostgreSQL.Metadata. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 1443 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Persistence/Migrations/20260327094444_AddHireEntity.cs`
- **File overview:** Database migration artifact for `20260327094444_AddHireEntity` describing one schema transition.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `AddHireEntity` (class)
- **Business logic:** Not live runtime logic, but it permanently changes what business state can be stored and queried.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through AddHireEntity.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 22 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Persistence/Migrations/20260329050957_AddUserIsActiveFlag.Designer.cs`
- **File overview:** Database migration artifact for `20260329050957_AddUserIsActiveFlag Designer` describing one schema transition.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `AddUserIsActiveFlag` (class)
- **Business logic:** Not live runtime logic, but it permanently changes what business state can be stored and queried.
- **Data flow:** Inputs arrive through callers and dependencies (System, Microsoft.EntityFrameworkCore, Microsoft.EntityFrameworkCore.Infrastructure, Microsoft.EntityFrameworkCore.Migrations) -> focused transformation -> outputs leave through AddUserIsActiveFlag.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System, Microsoft.EntityFrameworkCore, Microsoft.EntityFrameworkCore.Infrastructure, Microsoft.EntityFrameworkCore.Migrations, Microsoft.EntityFrameworkCore.Storage.ValueConversion, Npgsql.EntityFrameworkCore.PostgreSQL.Metadata. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 1448 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Persistence/Migrations/20260329050957_AddUserIsActiveFlag.cs`
- **File overview:** Database migration artifact for `20260329050957_AddUserIsActiveFlag` describing one schema transition.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `AddUserIsActiveFlag` (class)
- **Business logic:** Not live runtime logic, but it permanently changes what business state can be stored and queried.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through AddUserIsActiveFlag.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 35 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Persistence/Migrations/20260329103000_DefaultLockoutDisabled.cs`
- **File overview:** Database migration artifact for `20260329103000_DefaultLockoutDisabled` describing one schema transition.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `DefaultLockoutDisabled` (class)
- **Business logic:** Not live runtime logic, but it permanently changes what business state can be stored and queried.
- **Data flow:** Inputs arrive through callers and dependencies (Microsoft.EntityFrameworkCore.Migrations) -> focused transformation -> outputs leave through DefaultLockoutDisabled.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Microsoft.EntityFrameworkCore.Migrations. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 36 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Persistence/Migrations/20260330080043_AlignLockoutEnabledPersistence.Designer.cs`
- **File overview:** Database migration artifact for `20260330080043_AlignLockoutEnabledPersistence Designer` describing one schema transition.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `AlignLockoutEnabledPersistence` (class)
- **Business logic:** Not live runtime logic, but it permanently changes what business state can be stored and queried.
- **Data flow:** Inputs arrive through callers and dependencies (System, Microsoft.EntityFrameworkCore, Microsoft.EntityFrameworkCore.Infrastructure, Microsoft.EntityFrameworkCore.Migrations) -> focused transformation -> outputs leave through AlignLockoutEnabledPersistence.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System, Microsoft.EntityFrameworkCore, Microsoft.EntityFrameworkCore.Infrastructure, Microsoft.EntityFrameworkCore.Migrations, Microsoft.EntityFrameworkCore.Storage.ValueConversion, Npgsql.EntityFrameworkCore.PostgreSQL.Metadata. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 1448 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Persistence/Migrations/20260330080043_AlignLockoutEnabledPersistence.cs`
- **File overview:** Database migration artifact for `20260330080043_AlignLockoutEnabledPersistence` describing one schema transition.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `AlignLockoutEnabledPersistence` (class)
- **Business logic:** Not live runtime logic, but it permanently changes what business state can be stored and queried.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through AlignLockoutEnabledPersistence.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 42 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Persistence/Migrations/SkillSenseDbContextModelSnapshot.cs`
- **File overview:** Database migration artifact for `SkillSenseDbContextModelSnapshot` describing one schema transition.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `SkillSenseDbContextModelSnapshot` (class)
- **Business logic:** Not live runtime logic, but it permanently changes what business state can be stored and queried.
- **Data flow:** Inputs arrive through callers and dependencies (System, Microsoft.EntityFrameworkCore, Microsoft.EntityFrameworkCore.Infrastructure, Microsoft.EntityFrameworkCore.Storage.ValueConversion) -> focused transformation -> outputs leave through SkillSenseDbContextModelSnapshot.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses System, Microsoft.EntityFrameworkCore, Microsoft.EntityFrameworkCore.Infrastructure, Microsoft.EntityFrameworkCore.Storage.ValueConversion, Npgsql.EntityFrameworkCore.PostgreSQL.Metadata, SkillSense.Persistence.Data. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 1445 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## server/SkillSense.Persistence/Models

### `server/SkillSense.Persistence/Models/AdminDashboardModels.cs`
- **File overview:** Contract module for `AdminDashboardModels`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `SuperAdminDashboardData` (class), `SuperAdminUsersPageData` (class), `CompanyAdminDashboardData` (class), `AdminCompanyIdentityData` (class), `AdminCompanyOverviewData` (class), `AdminCompanyAdminOverviewData` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (SuperAdminDashboardData, SuperAdminUsersPageData, CompanyAdminDashboardData) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 96 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Persistence/Models/ApplicantScoreData.cs`
- **File overview:** Contract module for `ApplicantScoreData`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `ApplicantScoreData` (class), `EmployeeRecordData` (class), `JobFilterData` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (ApplicantScoreData, EmployeeRecordData, JobFilterData) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses SkillSense.Domain.Entities. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 53 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Persistence/Models/ApplicantStageContextData.cs`
- **File overview:** Contract module for `ApplicantStageContextData`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `ApplicantStageContextData` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (ApplicantStageContextData) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses SkillSense.Domain.Entities. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 11 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Persistence/Models/AuthUserCompanyAccessData.cs`
- **File overview:** Contract module for `AuthUserCompanyAccessData`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `AuthUserCompanyAccessData` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (AuthUserCompanyAccessData) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 10 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Persistence/Models/CandidateExplanationPayloadData.cs`
- **File overview:** Contract module for `CandidateExplanationPayloadData`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `CandidateExplanationPayloadData` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (CandidateExplanationPayloadData) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses SkillSense.Domain.Entities. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 10 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Persistence/Models/JobSeekerModels.cs`
- **File overview:** Contract module for `JobSeekerModels`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `ApplicationListItemData` (class), `SavedJobData` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (ApplicationListItemData, SavedJobData) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses SkillSense.Domain.Entities. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 49 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Persistence/Models/PagedData.cs`
- **File overview:** Contract module for `PagedData`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `PagedData` (class), `MyApplicationData` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (PagedData, MyApplicationData) -> compile-time consistency across layers.
- **Edge cases / constraints:** Pagination is normalized or bounded.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 20 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Persistence/Models/RecruiterDashboardFilterData.cs`
- **File overview:** Contract module for `RecruiterDashboardFilterData`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `RecruiterDashboardFilterData` (class), `DashboardOfferMetricData` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (RecruiterDashboardFilterData, DashboardOfferMetricData) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 16 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Persistence/Models/ShortlistedCandidateData.cs`
- **File overview:** Contract module for `ShortlistedCandidateData`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `ShortlistedCandidateData` (class)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (ShortlistedCandidateData) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 10 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## server/SkillSense.Persistence/Repositories

### `server/SkillSense.Persistence/Repositories/AdminManagementRepository.cs`
- **File overview:** Persistence implementation for `AdminManagementRepository` that hides query details behind a repository contract.
- **Responsibilities:** Persistence boundary: database queries and projection shaping.
- **Key functions / classes:** `AdminManagementRepository` (class), `GetSuperAdminDashboardAsync` (method), `GetSuperAdminUsersAsync` (method), `GetCompanyAdminDashboardAsync` (method), `GetCompanyEmployeesAsync` (method), `GetApplicantScoreBySubmissionIdAsync` (method)
- **Business logic:** Business behavior is expressed indirectly through query scoping and projection choices.
- **Data flow:** Application service -> repository query -> entities/projections -> service mapping.
- **Edge cases / constraints:** Pagination is normalized or bounded. Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses Microsoft.EntityFrameworkCore, SkillSense.Domain.Entities, SkillSense.Persistence.Data, SkillSense.Persistence.Interfaces, SkillSense.Persistence.Models. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 462 lines. Side effects: database writes, database reads

### `server/SkillSense.Persistence/Repositories/AuthRepository.cs`
- **File overview:** Persistence implementation for `AuthRepository` that hides query details behind a repository contract.
- **Responsibilities:** Persistence boundary: database queries and projection shaping.
- **Key functions / classes:** `AuthRepository` (class), `GetUserCompanyAccessAsync` (method), `SaveChangesAsync` (method), `GetActivePinsAsync` (method), `AddPasswordResetPinAsync` (method)
- **Business logic:** Business behavior is expressed indirectly through query scoping and projection choices.
- **Data flow:** Application service -> repository query -> entities/projections -> service mapping.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Microsoft.EntityFrameworkCore, SkillSense.Domain.Entities, SkillSense.Persistence.Data, SkillSense.Persistence.Interfaces, SkillSense.Persistence.Models. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 60 lines. Side effects: database writes, database reads

### `server/SkillSense.Persistence/Repositories/CandidateExplanationRepository.cs`
- **File overview:** Persistence implementation for `CandidateExplanationRepository` that hides query details behind a repository contract.
- **Responsibilities:** Persistence boundary: database queries and projection shaping.
- **Key functions / classes:** `CandidateExplanationRepository` (class), `for` (record), `GetBySubmissionIdAsync` (method), `GetExplanationPayloadAsync` (method), `GetSucceededExplanationAsync` (method), `AddAsync` (method)
- **Business logic:** Business behavior is expressed indirectly through query scoping and projection choices.
- **Data flow:** Application service -> repository query -> entities/projections -> service mapping.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Microsoft.EntityFrameworkCore, SkillSense.Domain.Entities, SkillSense.Persistence.Data, SkillSense.Persistence.Interfaces, SkillSense.Persistence.Models. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 67 lines. Side effects: database writes, database reads

### `server/SkillSense.Persistence/Repositories/InterviewRepository.cs`
- **File overview:** Persistence implementation for `InterviewRepository` that hides query details behind a repository contract.
- **Responsibilities:** Persistence boundary: database queries and projection shaping.
- **Key functions / classes:** `InterviewRepository` (class), `AddAsync` (method), `GetByIdAsync` (method), `GetActiveByIdAsync` (method), `GetByIdForRecruiterAsync` (method), `GetActiveByIdForRecruiterAsync` (method)
- **Business logic:** Business behavior is expressed indirectly through query scoping and projection choices.
- **Data flow:** Application service -> repository query -> entities/projections -> service mapping.
- **Edge cases / constraints:** Pagination is normalized or bounded. Input cleanup/normalization happens before comparison or persistence. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses Microsoft.EntityFrameworkCore, Microsoft.Extensions.Logging, SkillSense.Domain.Entities, SkillSense.Persistence.Data, SkillSense.Persistence.Interfaces, SkillSense.Persistence.Models. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 201 lines. Side effects: database writes, database reads

### `server/SkillSense.Persistence/Repositories/JobRepository.cs`
- **File overview:** Persistence implementation for `JobRepository` that hides query details behind a repository contract.
- **Responsibilities:** Persistence boundary: database queries and projection shaping.
- **Key functions / classes:** `JobRepository` (class), `AddAsync` (method), `UpdateAsync` (method), `DeleteAsync` (method), `GetByIdAsync` (method), `GetByIdForCompanyAsync` (method)
- **Business logic:** Business behavior is expressed indirectly through query scoping and projection choices.
- **Data flow:** Application service -> repository query -> entities/projections -> service mapping.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Microsoft.EntityFrameworkCore, SkillSense.Domain.Entities, SkillSense.Persistence.Data, SkillSense.Persistence.Interfaces. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 38 lines. Side effects: database writes, database reads

### `server/SkillSense.Persistence/Repositories/JobSeekerRepository.cs`
- **File overview:** Persistence implementation for `JobSeekerRepository` that hides query details behind a repository contract.
- **Responsibilities:** Persistence boundary: database queries and projection shaping.
- **Key functions / classes:** `JobSeekerRepository` (class), `GetPublishedJobsAsync` (method), `GetPublishedJobByIdAsync` (method), `GetApplicationsByUserAsync` (method), `GetApplicationDetailAsync` (method), `GetApplicationEntityAsync` (method)
- **Business logic:** Business behavior is expressed indirectly through query scoping and projection choices.
- **Data flow:** Application service -> repository query -> entities/projections -> service mapping.
- **Edge cases / constraints:** Pagination is normalized or bounded. Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses Microsoft.EntityFrameworkCore, Microsoft.EntityFrameworkCore.Storage, SkillSense.Domain.Entities, SkillSense.Persistence.Data, SkillSense.Persistence.Interfaces, SkillSense.Persistence.Models. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 404 lines. Side effects: database writes, database reads

### `server/SkillSense.Persistence/Repositories/NotificationRepository.cs`
- **File overview:** Persistence implementation for `NotificationRepository` that hides query details behind a repository contract.
- **Responsibilities:** Persistence boundary: database queries and projection shaping.
- **Key functions / classes:** `NotificationRepository` (class), `AddAsync` (method), `GetByUserAsync` (method), `GetByIdAsync` (method), `GetByIdForUserAsync` (method), `FindDuplicateAsync` (method)
- **Business logic:** Business behavior is expressed indirectly through query scoping and projection choices.
- **Data flow:** Application service -> repository query -> entities/projections -> service mapping.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Microsoft.EntityFrameworkCore, SkillSense.Domain.Entities, SkillSense.Persistence.Data, SkillSense.Persistence.Interfaces. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 80 lines. Side effects: database writes, database reads

### `server/SkillSense.Persistence/Repositories/RecruiterRepository.cs`
- **File overview:** Persistence implementation for `RecruiterRepository` that hides query details behind a repository contract.
- **Responsibilities:** Persistence boundary: database queries and projection shaping.
- **Key functions / classes:** `RecruiterRepository` (class), `GetProfileByUserIdAsync` (method), `GetProfileByUserAndProfileIdAsync` (method), `GetProfilesByUserIdsAsync` (method), `SaveChangesAsync` (method), `GetRecruiterJobsAsync` (method)
- **Business logic:** Business behavior is expressed indirectly through query scoping and projection choices.
- **Data flow:** Application service -> repository query -> entities/projections -> service mapping.
- **Edge cases / constraints:** Pagination is normalized or bounded. Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses Microsoft.EntityFrameworkCore, Microsoft.EntityFrameworkCore.Storage, SkillSense.Domain.Entities, SkillSense.Persistence.Data, SkillSense.Persistence.Interfaces, SkillSense.Persistence.Models. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 508 lines. Side effects: database writes, database reads

### `server/SkillSense.Persistence/Repositories/ResumeEmbeddingRepository.cs`
- **File overview:** Persistence implementation for `ResumeEmbeddingRepository` that hides query details behind a repository contract.
- **Responsibilities:** Persistence boundary: database queries and projection shaping.
- **Key functions / classes:** `ResumeEmbeddingRepository` (class), `AddRangeAsync` (method), `GetBySubmissionIdAsync` (method)
- **Business logic:** Business behavior is expressed indirectly through query scoping and projection choices.
- **Data flow:** Application service -> repository query -> entities/projections -> service mapping.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses SkillSense.Domain.Entities, SkillSense.Persistence.Data, SkillSense.Persistence.Interfaces. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 31 lines. Side effects: database writes, database reads

### `server/SkillSense.Persistence/Repositories/ResumeScoreRepository.cs`
- **File overview:** Persistence implementation for `ResumeScoreRepository` that hides query details behind a repository contract.
- **Responsibilities:** Persistence boundary: database queries and projection shaping.
- **Key functions / classes:** `ResumeScoreRepository` (class), `AddAsync` (method)
- **Business logic:** Business behavior is expressed indirectly through query scoping and projection choices.
- **Data flow:** Application service -> repository query -> entities/projections -> service mapping.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses SkillSense.Persistence.Data, SkillSense.Persistence.Interfaces. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 17 lines. Side effects: database writes, database reads

### `server/SkillSense.Persistence/Repositories/ResumeSubmissionRepository.cs`
- **File overview:** Persistence implementation for `ResumeSubmissionRepository` that hides query details behind a repository contract.
- **Responsibilities:** Persistence boundary: database queries and projection shaping.
- **Key functions / classes:** `ResumeSubmissionRepository` (class), `AddAsync` (method), `GetByIdAsync` (method), `GetNextPendingAsync` (method), `GetPendingBatchAsync` (method), `ExistsActiveApplicationAsync` (method)
- **Business logic:** Business behavior is expressed indirectly through query scoping and projection choices.
- **Data flow:** Application service -> repository query -> entities/projections -> service mapping.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses SkillSense.Domain.Entities, SkillSense.Persistence.Data, SkillSense.Persistence.Interfaces. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 40 lines. Side effects: database writes, database reads

## server/SkillSense.Persistence/Scripts

### `server/SkillSense.Persistence/Scripts/cleanup_stale_lockout_users.sql`
- **File overview:** Maintained module `cleanup_stale_lockout_users` in the codebase.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through module exports.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 22 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## server/SkillSense.Persistence/Seed

### `server/SkillSense.Persistence/Seed/50_jobs.sql`
- **File overview:** Seed/bootstrap artifact for `50_jobs` used to initialize baseline data.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through module exports.
- **Edge cases / constraints:** Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 222 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Persistence/Seed/60_dashboard_trend_seed.sql`
- **File overview:** Seed/bootstrap artifact for `60_dashboard_trend_seed` used to initialize baseline data.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through module exports.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 666 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `server/SkillSense.Persistence/Seed/IdentitySeeder.cs`
- **File overview:** Seed/bootstrap artifact for `IdentitySeeder` used to initialize baseline data.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `IdentitySeeder` (class), `SeedRole` (record), `SeedUser` (record), `IsLegacySeedUser` (method), `SeedAsync` (method)
- **Business logic:** Validation and guard clauses protect downstream workflows from invalid state. Persistence is part of this file's transaction boundary.
- **Data flow:** Inputs arrive through callers and dependencies (Microsoft.AspNetCore.Identity, Microsoft.Extensions.Configuration, Microsoft.Extensions.Hosting, SkillSense.Domain.Entities) -> focused transformation -> outputs leave through IdentitySeeder, SeedRole, SeedUser.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses Microsoft.AspNetCore.Identity, Microsoft.Extensions.Configuration, Microsoft.Extensions.Hosting, SkillSense.Domain.Entities. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 164 lines. Side effects: database writes, database reads

## server/SkillSense.Persistence/SkillSense.Persistence.csproj

### `server/SkillSense.Persistence/SkillSense.Persistence.csproj`
- **File overview:** Build/tooling config for the surrounding project.
- **Responsibilities:** Compilation, bundling, linting, or tooling configuration.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** No direct business rules live here. Its value is operational clarity, reproducible environments, or developer guidance.
- **Data flow:** Maintainers update this file -> tooling, environments, or readers consume it -> downstream runtime behavior stays consistent without feature code changes.
- **Edge cases / constraints:** Constraints are operational rather than domain-driven: syntax, environment compatibility, and maintainability matter most.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 35 lines. Side effects: Operational/configuration only.

## server/server.slnx

### `server/server.slnx`
- **File overview:** Build/tooling config for the surrounding project.
- **Responsibilities:** Compilation, bundling, linting, or tooling configuration.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** No direct business rules live here. Its value is operational clarity, reproducible environments, or developer guidance.
- **Data flow:** Maintainers update this file -> tooling, environments, or readers consume it -> downstream runtime behavior stays consistent without feature code changes.
- **Edge cases / constraints:** Constraints are operational rather than domain-driven: syntax, environment compatibility, and maintainability matter most.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 17 lines. Side effects: Operational/configuration only.
