# Client File Reference

This reference covers the maintained frontend source and client-side configuration. Business-heavy entries focus on auth, routing, feature services, loaders, actions, and shared API/runtime modules.

## Coverage
- Documented files: 332
- Groups: 70

## client/.dockerignore

### `client/.dockerignore`
- **File overview:** Repository or environment metadata file that shapes local development defaults without containing runtime business logic.
- **Responsibilities:** Repository support file for developer workflow and local environment conventions.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** No direct business rules live here. Its value is operational clarity, reproducible environments, or developer guidance.
- **Data flow:** Maintainers update this file -> tooling, environments, or readers consume it -> downstream runtime behavior stays consistent without feature code changes.
- **Edge cases / constraints:** Constraints are operational rather than domain-driven: syntax, environment compatibility, and maintainability matter most.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 40 lines. Side effects: Operational/configuration only.

## client/.env.example

### `client/.env.example`
- **File overview:** Repository or environment metadata file that shapes local development defaults without containing runtime business logic.
- **Responsibilities:** Repository support file for developer workflow and local environment conventions.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** No direct business rules live here. Its value is operational clarity, reproducible environments, or developer guidance.
- **Data flow:** Maintainers update this file -> tooling, environments, or readers consume it -> downstream runtime behavior stays consistent without feature code changes.
- **Edge cases / constraints:** Constraints are operational rather than domain-driven: syntax, environment compatibility, and maintainability matter most.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 1 lines. Side effects: Operational/configuration only.

## client/.gitignore

### `client/.gitignore`
- **File overview:** Repository or environment metadata file that shapes local development defaults without containing runtime business logic.
- **Responsibilities:** Repository support file for developer workflow and local environment conventions.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** No direct business rules live here. Its value is operational clarity, reproducible environments, or developer guidance.
- **Data flow:** Maintainers update this file -> tooling, environments, or readers consume it -> downstream runtime behavior stays consistent without feature code changes.
- **Edge cases / constraints:** Constraints are operational rather than domain-driven: syntax, environment compatibility, and maintainability matter most.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 24 lines. Side effects: Operational/configuration only.

## client/ARCHITECTURE.md

### `client/ARCHITECTURE.md`
- **File overview:** Human-facing project documentation for the surrounding module.
- **Responsibilities:** Existing human-facing documentation.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** No direct business rules live here. Its value is operational clarity, reproducible environments, or developer guidance.
- **Data flow:** Maintainers update this file -> tooling, environments, or readers consume it -> downstream runtime behavior stays consistent without feature code changes.
- **Edge cases / constraints:** Constraints are operational rather than domain-driven: syntax, environment compatibility, and maintainability matter most.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 53 lines. Side effects: Operational/configuration only.

## client/Dockerfile

### `client/Dockerfile`
- **File overview:** Deployment/runtime config for the surrounding project.
- **Responsibilities:** Deployment and hosting support file.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** No direct business rules live here. Its value is operational clarity, reproducible environments, or developer guidance.
- **Data flow:** Maintainers update this file -> tooling, environments, or readers consume it -> downstream runtime behavior stays consistent without feature code changes.
- **Edge cases / constraints:** Constraints are operational rather than domain-driven: syntax, environment compatibility, and maintainability matter most.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 20 lines. Side effects: Operational/configuration only.

## client/README.md

### `client/README.md`
- **File overview:** Human-facing project documentation for the surrounding module.
- **Responsibilities:** Existing human-facing documentation.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** No direct business rules live here. Its value is operational clarity, reproducible environments, or developer guidance.
- **Data flow:** Maintainers update this file -> tooling, environments, or readers consume it -> downstream runtime behavior stays consistent without feature code changes.
- **Edge cases / constraints:** Constraints are operational rather than domain-driven: syntax, environment compatibility, and maintainability matter most.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 73 lines. Side effects: Operational/configuration only.

## client/components.json

### `client/components.json`
- **File overview:** Build/tooling config for the surrounding project.
- **Responsibilities:** Compilation, bundling, linting, or tooling configuration.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** No direct business rules live here. Its value is operational clarity, reproducible environments, or developer guidance.
- **Data flow:** Maintainers update this file -> tooling, environments, or readers consume it -> downstream runtime behavior stays consistent without feature code changes.
- **Edge cases / constraints:** Constraints are operational rather than domain-driven: syntax, environment compatibility, and maintainability matter most.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 22 lines. Side effects: Operational/configuration only.

## client/eslint.config.js

### `client/eslint.config.js`
- **File overview:** Build/tooling config for the surrounding project.
- **Responsibilities:** Compilation, bundling, linting, or tooling configuration.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** No direct business rules live here. Its value is operational clarity, reproducible environments, or developer guidance.
- **Data flow:** Maintainers update this file -> tooling, environments, or readers consume it -> downstream runtime behavior stays consistent without feature code changes.
- **Edge cases / constraints:** Constraints are operational rather than domain-driven: syntax, environment compatibility, and maintainability matter most.
- **Dependencies:** Uses @eslint/js, globals, eslint-plugin-react-hooks, eslint-plugin-react-refresh, typescript-eslint, eslint/config. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 23 lines. Side effects: Operational/configuration only.

## client/index.html

### `client/index.html`
- **File overview:** Maintained module `index` in the codebase.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through module exports.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 13 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## client/nginx.conf

### `client/nginx.conf`
- **File overview:** Deployment/runtime config for the surrounding project.
- **Responsibilities:** Deployment and hosting support file.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** No direct business rules live here. Its value is operational clarity, reproducible environments, or developer guidance.
- **Data flow:** Maintainers update this file -> tooling, environments, or readers consume it -> downstream runtime behavior stays consistent without feature code changes.
- **Edge cases / constraints:** Constraints are operational rather than domain-driven: syntax, environment compatibility, and maintainability matter most.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 33 lines. Side effects: Operational/configuration only.

## client/package.json

### `client/package.json`
- **File overview:** Package manifest for the surrounding project.
- **Responsibilities:** Package/dependency definition for the surrounding project.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** No direct business rules live here. Its value is operational clarity, reproducible environments, or developer guidance.
- **Data flow:** Maintainers update this file -> tooling, environments, or readers consume it -> downstream runtime behavior stays consistent without feature code changes.
- **Edge cases / constraints:** Constraints are operational rather than domain-driven: syntax, environment compatibility, and maintainability matter most.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 57 lines. Side effects: Operational/configuration only.

## client/pnpm-lock.yaml

### `client/pnpm-lock.yaml`
- **File overview:** Dependency lockfile that freezes the exact package graph for reproducible installs.
- **Responsibilities:** Dependency reproducibility artifact rather than runtime logic.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** No direct business rules live here. Its value is operational clarity, reproducible environments, or developer guidance.
- **Data flow:** Maintainers update this file -> tooling, environments, or readers consume it -> downstream runtime behavior stays consistent without feature code changes.
- **Edge cases / constraints:** Constraints are operational rather than domain-driven: syntax, environment compatibility, and maintainability matter most.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 4062 lines. Side effects: Operational/configuration only.

## client/src/app/App.tsx

### `client/src/app/App.tsx`
- **File overview:** Maintained module `App` in the codebase.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (react, react-router-dom, @app/routes/router, @app/providers/ThemeProvider) -> focused transformation -> outputs leave through module exports.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react, react-router-dom, @app/routes/router, @app/providers/ThemeProvider, @app/providers/AuthProvider, @app/providers/SetupProvider. Used by client/src/main.tsx
- **Operational notes:** Approx. 108 lines. Side effects: local/session state changes

## client/src/app/layouts

### `client/src/app/layouts/AppShell.tsx`
- **File overview:** Maintained module `AppShell` in the codebase.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `AppShell` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (react, react-router-dom, @app/providers/AuthProvider, @shared/pages/AtsWakeLoaderSurface) -> focused transformation -> outputs leave through AppShell.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react, react-router-dom, @app/providers/AuthProvider, @shared/pages/AtsWakeLoaderSurface, @shared/components/RouteNavigationFeedback, @shared/components/Sidebar. Used by client/src/app/routes/route.helpers.tsx
- **Operational notes:** Approx. 88 lines. Side effects: local/session state changes

### `client/src/app/layouts/AuthLayout.tsx`
- **File overview:** Maintained module `AuthLayout` in the codebase.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through module exports.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 9 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## client/src/app/providers

### `client/src/app/providers/AppProviders.tsx`
- **File overview:** React context provider for `AppProviders` shared runtime state.
- **Responsibilities:** Client runtime state container near the top of the React tree.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through module exports.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 0 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/app/providers/AuthProvider.tsx`
- **File overview:** Maintains the authenticated session state in React, normalizes roles returned by the API, and exposes login/register/logout helpers.
- **Responsibilities:** Client runtime state container near the top of the React tree.
- **Key functions / classes:** `AuthProvider` (const), `useAuth` (const)
- **Business logic:** This is the canonical client session boundary. It treats `/api/auth/me` as the source of truth, normalizes supported roles, and clears stale protected-route state on logout.
- **Data flow:** UI auth events -> provider state -> shared session context -> route guards and pages.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react, @shared/types, @shared/api/http, @shared/utils/role. Used by client/src/app/App.tsx, client/src/app/layouts/AppShell.tsx, client/src/app/providers/CurrentCompanyProvider.tsx, client/src/app/providers/CurrentRecruiterProvider.tsx, client/src/app/providers/NotificationsProvider.tsx
- **Operational notes:** Approx. 216 lines. Side effects: HTTP/API calls, local/session state changes

### `client/src/app/providers/CurrentCompanyProvider.tsx`
- **File overview:** React context provider for `CurrentCompanyProvider` shared runtime state.
- **Responsibilities:** Client runtime state container near the top of the React tree.
- **Key functions / classes:** `CurrentCompanyProvider` (const), `useCurrentCompany` (const), `CurrentCompany` (interface)
- **Business logic:** Validation and guard clauses protect downstream workflows from invalid state.
- **Data flow:** Inputs arrive through callers and dependencies (react, @shared/api/http, @app/providers/AuthProvider, @app/providers/SetupProvider) -> focused transformation -> outputs leave through CurrentCompanyProvider, useCurrentCompany, CurrentCompany.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react, @shared/api/http, @app/providers/AuthProvider, @app/providers/SetupProvider, @features/auth/types/auth.types, @shared/utils/storage. Used by client/src/app/App.tsx, client/src/shared/hooks/usePermissions.ts
- **Operational notes:** Approx. 176 lines. Side effects: HTTP/API calls, local/session state changes

### `client/src/app/providers/CurrentRecruiterProvider.tsx`
- **File overview:** React context provider for `CurrentRecruiterProvider` shared runtime state.
- **Responsibilities:** Client runtime state container near the top of the React tree.
- **Key functions / classes:** `CurrentRecruiterProvider` (const), `useCurrentRecruiter` (const), `RecruiterProfileSummary` (interface)
- **Business logic:** Validation and guard clauses protect downstream workflows from invalid state.
- **Data flow:** Inputs arrive through callers and dependencies (react, @app/providers/AuthProvider, @app/providers/SetupProvider, @features/auth/types/auth.types) -> focused transformation -> outputs leave through CurrentRecruiterProvider, useCurrentRecruiter, RecruiterProfileSummary.
- **Edge cases / constraints:** Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react, @app/providers/AuthProvider, @app/providers/SetupProvider, @features/auth/types/auth.types, @shared/utils/storage, @shared/utils/permissions. Used by client/src/app/App.tsx, client/src/shared/hooks/usePermissions.ts
- **Operational notes:** Approx. 195 lines. Side effects: HTTP/API calls, local/session state changes

### `client/src/app/providers/NotificationsProvider.tsx`
- **File overview:** React context provider for `NotificationsProvider` shared runtime state.
- **Responsibilities:** Client runtime state container near the top of the React tree.
- **Key functions / classes:** `NotificationsProvider` (const), `useNotifications` (const)
- **Business logic:** Validation and guard clauses protect downstream workflows from invalid state.
- **Data flow:** Inputs arrive through callers and dependencies (@app/providers/AuthProvider, @shared/services/notification.service) -> focused transformation -> outputs leave through NotificationsProvider, useNotifications.
- **Edge cases / constraints:** Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses @app/providers/AuthProvider, @shared/services/notification.service. Used by client/src/shared/components/Topbar.tsx, client/src/shared/pages/NotificationsPage.tsx
- **Operational notes:** Approx. 300 lines. Side effects: notifications, local/session state changes

### `client/src/app/providers/SetupProvider.tsx`
- **File overview:** React context provider for `SetupProvider` shared runtime state.
- **Responsibilities:** Client runtime state container near the top of the React tree.
- **Key functions / classes:** `SetupProvider` (const), `useSetup` (const)
- **Business logic:** Validation and guard clauses protect downstream workflows from invalid state.
- **Data flow:** Inputs arrive through callers and dependencies (react, @shared/api/http, @app/providers/AuthProvider, @shared/components/setup/RecruiterInitialSetupModal) -> focused transformation -> outputs leave through SetupProvider, useSetup.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react, @shared/api/http, @app/providers/AuthProvider, @shared/components/setup/RecruiterInitialSetupModal, @shared/components/setup/CompanyAdminInitialSetupModal, @shared/utils/permissions. Used by client/src/app/App.tsx, client/src/app/providers/CurrentCompanyProvider.tsx, client/src/app/providers/CurrentRecruiterProvider.tsx, client/src/app/routes/routes.guard.tsx
- **Operational notes:** Approx. 135 lines. Side effects: HTTP/API calls, local/session state changes

### `client/src/app/providers/ThemeProvider.tsx`
- **File overview:** React context provider for `ThemeProvider` shared runtime state.
- **Responsibilities:** Client runtime state container near the top of the React tree.
- **Key functions / classes:** `ThemeProvider` (const), `useTheme` (const), `Theme` (type), `ThemePreference` (type)
- **Business logic:** Validation and guard clauses protect downstream workflows from invalid state.
- **Data flow:** Inputs arrive through callers and dependencies (react) -> focused transformation -> outputs leave through ThemeProvider, useTheme, Theme.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react. Used by client/src/app/App.tsx, client/src/shared/components/DashboardAreaChart.tsx, client/src/shared/components/Topbar.tsx
- **Operational notes:** Approx. 126 lines. Side effects: local/session state changes

### `client/src/app/providers/ToastProvider.tsx`
- **File overview:** React context provider for `ToastProvider` shared runtime state.
- **Responsibilities:** Client runtime state container near the top of the React tree.
- **Key functions / classes:** `ToastProvider` (const), `useToast` (const)
- **Business logic:** Validation and guard clauses protect downstream workflows from invalid state.
- **Data flow:** Inputs arrive through callers and dependencies (react, @shared/components/Toast) -> focused transformation -> outputs leave through ToastProvider, useToast.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react, @shared/components/Toast. Used by client/src/features/jobseeker/pages/JobDetailPage/JobDetailPage.tsx, client/src/features/jobseeker/pages/OffersPage/OffersPage.tsx, client/src/features/jobseeker/pages/ProfilePage/ProfilePage.tsx, client/src/features/jobseeker/pages/SettingsPage/SettingsPage.tsx, client/src/features/recruiter/pages/CandidateDetailPage/CandidateDetailPage.tsx
- **Operational notes:** Approx. 78 lines. Side effects: local/session state changes

### `client/src/app/providers/contextStorage.ts`
- **File overview:** React context provider for `contextStorage` shared runtime state.
- **Responsibilities:** Client runtime state container near the top of the React tree.
- **Key functions / classes:** `CURRENT_COMPANY_STORAGE_KEY` (const), `CURRENT_RECRUITER_PROFILE_STORAGE_KEY` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through CURRENT_COMPANY_STORAGE_KEY, CURRENT_RECRUITER_PROFILE_STORAGE_KEY.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 2 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/app/providers/session-store.tsx`
- **File overview:** React context provider for `session store` shared runtime state.
- **Responsibilities:** Client runtime state container near the top of the React tree.
- **Key functions / classes:** `SessionProvider` (const), `useSession` (const)
- **Business logic:** Validation and guard clauses protect downstream workflows from invalid state.
- **Data flow:** Inputs arrive through callers and dependencies (react, react, @shared/types, @shared/utils/storage) -> focused transformation -> outputs leave through SessionProvider, useSession.
- **Edge cases / constraints:** Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react, react, @shared/types, @shared/utils/storage. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 84 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## client/src/app/routes

### `client/src/app/routes/common.routes.tsx`
- **File overview:** Route composition module for `common routes` that mounts, guards, or redirects client screens.
- **Responsibilities:** Navigation composition and access policy.
- **Key functions / classes:** `commonRoutes` (const)
- **Business logic:** The key rules here are navigation and access policy: who may enter, what must load first, and where the user is redirected otherwise.
- **Data flow:** Inputs arrive through callers and dependencies (react-router-dom, @app/routes/route.helpers) -> focused transformation -> outputs leave through commonRoutes.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react-router-dom, @app/routes/route.helpers. Used by client/src/app/routes/router.tsx
- **Operational notes:** Approx. 28 lines. Side effects: redirect/navigation

### `client/src/app/routes/companyAdmin.routes.tsx`
- **File overview:** Route composition module for `companyAdmin routes` that mounts, guards, or redirects client screens.
- **Responsibilities:** Navigation composition and access policy.
- **Key functions / classes:** `companyAdminRoutes` (const)
- **Business logic:** The key rules here are navigation and access policy: who may enter, what must load first, and where the user is redirected otherwise.
- **Data flow:** Inputs arrive through callers and dependencies (@app/routes/route.helpers) -> focused transformation -> outputs leave through companyAdminRoutes.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses @app/routes/route.helpers. Used by client/src/app/routes/router.tsx
- **Operational notes:** Approx. 40 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/app/routes/jobseeker.routes.tsx`
- **File overview:** Route composition module for `jobseeker routes` that mounts, guards, or redirects client screens.
- **Responsibilities:** Navigation composition and access policy.
- **Key functions / classes:** `jobseekerRoutes` (const)
- **Business logic:** The key rules here are navigation and access policy: who may enter, what must load first, and where the user is redirected otherwise.
- **Data flow:** Inputs arrive through callers and dependencies (@app/routes/route.helpers, @features/jobseeker/actions) -> focused transformation -> outputs leave through jobseekerRoutes.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses @app/routes/route.helpers, @features/jobseeker/actions. Used by client/src/app/routes/router.tsx
- **Operational notes:** Approx. 96 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/app/routes/protectedLoader.ts`
- **File overview:** Loader-time access control, setup gating, and active company/recruiter scope resolution.
- **Responsibilities:** Navigation composition and access policy.
- **Key functions / classes:** `guardProtectedLoader` (const)
- **Business logic:** This file decides whether protected routes may load at all. It blocks unauthenticated users, redirects unsupported roles, and preserves valid stored tenant/profile scope.
- **Data flow:** Inputs arrive through callers and dependencies (react-router-dom, @features/auth/types/auth.types, @shared/utils/storage, @shared/types) -> focused transformation -> outputs leave through guardProtectedLoader.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. Identity and access preconditions are enforced explicitly.
- **Dependencies:** Uses react-router-dom, @features/auth/types/auth.types, @shared/utils/storage, @shared/types, @shared/utils/role. Used by client/src/features/admin/loaders/admin.loaders.ts, client/src/features/jobseeker/loaders/dashboard.loader.ts, client/src/features/recruiter/loaders/dashboardLoader.ts
- **Operational notes:** Approx. 149 lines. Side effects: HTTP/API calls, redirect/navigation

### `client/src/app/routes/public.routes.tsx`
- **File overview:** Route composition module for `public routes` that mounts, guards, or redirects client screens.
- **Responsibilities:** Navigation composition and access policy.
- **Key functions / classes:** `publicRoutes` (const)
- **Business logic:** The key rules here are navigation and access policy: who may enter, what must load first, and where the user is redirected otherwise.
- **Data flow:** Inputs arrive through callers and dependencies (@app/routes/route.helpers) -> focused transformation -> outputs leave through publicRoutes.
- **Edge cases / constraints:** Identity and access preconditions are enforced explicitly.
- **Dependencies:** Uses @app/routes/route.helpers. Used by client/src/app/routes/router.tsx
- **Operational notes:** Approx. 40 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/app/routes/recruiter.routes.tsx`
- **File overview:** Route composition module for `recruiter routes` that mounts, guards, or redirects client screens.
- **Responsibilities:** Navigation composition and access policy.
- **Key functions / classes:** `recruiterRoutes` (const)
- **Business logic:** The key rules here are navigation and access policy: who may enter, what must load first, and where the user is redirected otherwise.
- **Data flow:** Inputs arrive through callers and dependencies (react-router-dom, @app/routes/route.helpers) -> focused transformation -> outputs leave through recruiterRoutes.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react-router-dom, @app/routes/route.helpers. Used by client/src/app/routes/router.tsx
- **Operational notes:** Approx. 190 lines. Side effects: redirect/navigation

### `client/src/app/routes/route.config.ts`
- **File overview:** Route composition module for `route config` that mounts, guards, or redirects client screens.
- **Responsibilities:** Navigation composition and access policy.
- **Key functions / classes:** `routeAccess` (const), `AppRouteKey` (type)
- **Business logic:** The key rules here are navigation and access policy: who may enter, what must load first, and where the user is redirected otherwise.
- **Data flow:** Inputs arrive through callers and dependencies (@shared/types) -> focused transformation -> outputs leave through routeAccess, AppRouteKey.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses @shared/types. Used by client/src/app/routes/route.helpers.tsx
- **Operational notes:** Approx. 47 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/app/routes/route.helpers.tsx`
- **File overview:** Route composition module for `route helpers` that mounts, guards, or redirects client screens.
- **Responsibilities:** Navigation composition and access policy.
- **Key functions / classes:** `AppShellRoute` (const), `protectedRoute` (const), `actionOnlyRoute` (const), `publicRoute` (const), `publicOnlyElement` (const), `lazyRouteElement` (const)
- **Business logic:** The key rules here are navigation and access policy: who may enter, what must load first, and where the user is redirected otherwise.
- **Data flow:** Inputs arrive through callers and dependencies (react, react-router-dom, @app/layouts/AppShell, @shared/components/ScrollToTop) -> focused transformation -> outputs leave through AppShellRoute, protectedRoute, actionOnlyRoute.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react, react-router-dom, @app/layouts/AppShell, @shared/components/ScrollToTop, @shared/components/RouteNavigationFeedback, @shared/pages/RouteErrorPage. Used by client/src/app/routes/common.routes.tsx, client/src/app/routes/companyAdmin.routes.tsx, client/src/app/routes/jobseeker.routes.tsx, client/src/app/routes/public.routes.tsx, client/src/app/routes/recruiter.routes.tsx
- **Operational notes:** Approx. 110 lines. Side effects: redirect/navigation

### `client/src/app/routes/router.tsx`
- **File overview:** Route composition module for `router` that mounts, guards, or redirects client screens.
- **Responsibilities:** Navigation composition and access policy.
- **Key functions / classes:** `router` (const)
- **Business logic:** The key rules here are navigation and access policy: who may enter, what must load first, and where the user is redirected otherwise.
- **Data flow:** Inputs arrive through callers and dependencies (react-router-dom, @app/routes/route.helpers, @app/routes/common.routes, @app/routes/companyAdmin.routes) -> focused transformation -> outputs leave through router.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react-router-dom, @app/routes/route.helpers, @app/routes/common.routes, @app/routes/companyAdmin.routes, @app/routes/jobseeker.routes, @app/routes/public.routes. Used by client/src/app/App.tsx
- **Operational notes:** Approx. 39 lines. Side effects: redirect/navigation

### `client/src/app/routes/routes.guard.tsx`
- **File overview:** Route composition module for `routes guard` that mounts, guards, or redirects client screens.
- **Responsibilities:** Navigation composition and access policy.
- **Key functions / classes:** `RequireAuth` (const), `RequireRole` (const), `getDefaultRouteByRole` (const), `PublicOnly` (const)
- **Business logic:** The key rules here are navigation and access policy: who may enter, what must load first, and where the user is redirected otherwise.
- **Data flow:** Inputs arrive through callers and dependencies (react, react-router-dom, @app/providers/AuthProvider, @app/providers/SetupProvider) -> focused transformation -> outputs leave through RequireAuth, RequireRole, getDefaultRouteByRole.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react, react-router-dom, @app/providers/AuthProvider, @app/providers/SetupProvider, @shared/hooks/usePermissions, @shared/types. Used by client/src/app/routes/route.helpers.tsx, client/src/app/routes/superAdmin.routes.tsx, client/src/features/auth/pages/LoginPage.tsx, client/src/shared/pages/NotAuthorized.tsx, client/src/shared/pages/NotificationsPage.tsx
- **Operational notes:** Approx. 106 lines. Side effects: redirect/navigation

### `client/src/app/routes/superAdmin.routes.tsx`
- **File overview:** Route composition module for `superAdmin routes` that mounts, guards, or redirects client screens.
- **Responsibilities:** Navigation composition and access policy.
- **Key functions / classes:** `superAdminIndexRoute` (const), `superAdminRoutes` (const)
- **Business logic:** The key rules here are navigation and access policy: who may enter, what must load first, and where the user is redirected otherwise.
- **Data flow:** Inputs arrive through callers and dependencies (react-router-dom, @app/providers/AuthProvider, @app/routes/routes.guard, @app/routes/route.helpers) -> focused transformation -> outputs leave through superAdminIndexRoute, superAdminRoutes.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react-router-dom, @app/providers/AuthProvider, @app/routes/routes.guard, @app/routes/route.helpers. Used by client/src/app/routes/router.tsx
- **Operational notes:** Approx. 64 lines. Side effects: redirect/navigation

## client/src/features/admin/AdminPlaceholderPage.tsx

### `client/src/features/admin/AdminPlaceholderPage.tsx`
- **File overview:** Route-level screen for `AdminPlaceholderPage` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `AdminPlaceholderPage` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (@shared/components/Card) -> focused transformation -> outputs leave through AdminPlaceholderPage.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses @shared/components/Card. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 12 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## client/src/features/admin/components

### `client/src/features/admin/components/AdminCompaniesTableCard.tsx`
- **File overview:** Presentation component for `AdminCompaniesTableCard` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `AdminCompaniesTableCard` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (@shared/components/Badge, @shared/components/Button, @shared/components/ui/data-table/DataTable, @shared/components/ui/data-table/IdentityCell) -> focused transformation -> outputs leave through AdminCompaniesTableCard.
- **Edge cases / constraints:** Pagination is normalized or bounded.
- **Dependencies:** Uses @shared/components/Badge, @shared/components/Button, @shared/components/ui/data-table/DataTable, @shared/components/ui/data-table/IdentityCell, @shared/components/ui/data-table/TablePagination, @shared/components/ui/data-table/TablePageSizeControl. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 127 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/admin/components/AdminCompanyAdminsTableCard.tsx`
- **File overview:** Presentation component for `AdminCompanyAdminsTableCard` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `AdminCompanyAdminsTableCard` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (@shared/components/Badge, @shared/components/Button, @shared/components/ui/data-table/DataTable, @shared/components/ui/data-table/IdentityCell) -> focused transformation -> outputs leave through AdminCompanyAdminsTableCard.
- **Edge cases / constraints:** Pagination is normalized or bounded.
- **Dependencies:** Uses @shared/components/Badge, @shared/components/Button, @shared/components/ui/data-table/DataTable, @shared/components/ui/data-table/IdentityCell, @shared/components/ui/data-table/TablePagination, @shared/components/ui/data-table/TablePageSizeControl. Used by client/src/features/admin/pages/SuperAdminCompanyAdminsPage.tsx
- **Operational notes:** Approx. 103 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/admin/components/AdminMetricCard.tsx`
- **File overview:** Presentation component for `AdminMetricCard` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `AdminMetricCard` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (@shared/components/Card) -> focused transformation -> outputs leave through AdminMetricCard.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses @shared/components/Card. Used by client/src/features/admin/pages/SuperAdminCompanyAdminsPage.tsx, client/src/features/admin/pages/SuperAdminRecruitersPage.tsx, client/src/features/admin/pages/SuperAdminUsersPage.tsx
- **Operational notes:** Approx. 25 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/admin/components/AdminPasswordField.tsx`
- **File overview:** Presentation component for `AdminPasswordField` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `AdminPasswordField` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (lucide-react) -> focused transformation -> outputs leave through AdminPasswordField.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses lucide-react. Used by client/src/features/admin/components/CreateCompanyModal.tsx, client/src/features/admin/components/CreateRecruiterModal.tsx
- **Operational notes:** Approx. 56 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/admin/components/AdminRecruitersTableCard.tsx`
- **File overview:** Presentation component for `AdminRecruitersTableCard` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `AdminRecruitersTableCard` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (@shared/components/Badge, @shared/components/Button, @shared/components/ui/data-table/DataTable, @shared/components/ui/data-table/IdentityCell) -> focused transformation -> outputs leave through AdminRecruitersTableCard.
- **Edge cases / constraints:** Pagination is normalized or bounded.
- **Dependencies:** Uses @shared/components/Badge, @shared/components/Button, @shared/components/ui/data-table/DataTable, @shared/components/ui/data-table/IdentityCell, @shared/components/ui/data-table/TablePagination, @shared/components/ui/data-table/TablePageSizeControl. Used by client/src/features/admin/pages/SuperAdminRecruitersPage.tsx
- **Operational notes:** Approx. 113 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/admin/components/AdminStatusBadge.tsx`
- **File overview:** Presentation component for `AdminStatusBadge` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `getAdminStatusClassName` (const), `AdminStatusBadge` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through getAdminStatusClassName, AdminStatusBadge.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by client/src/features/admin/components/AdminCompaniesTableCard.tsx, client/src/features/admin/components/AdminCompanyAdminsTableCard.tsx, client/src/features/admin/components/AdminRecruitersTableCard.tsx, client/src/features/admin/components/AdminUsersTableCard.tsx
- **Operational notes:** Approx. 9 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/admin/components/AdminUsersTableCard.tsx`
- **File overview:** Presentation component for `AdminUsersTableCard` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `AdminUsersTableCard` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (@shared/components/Badge, @shared/components/Button, @shared/components/ui/data-table/DataTable, @shared/components/ui/data-table/IdentityCell) -> focused transformation -> outputs leave through AdminUsersTableCard.
- **Edge cases / constraints:** Pagination is normalized or bounded.
- **Dependencies:** Uses @shared/components/Badge, @shared/components/Button, @shared/components/ui/data-table/DataTable, @shared/components/ui/data-table/IdentityCell, @shared/components/ui/data-table/TablePagination, @shared/components/ui/data-table/TablePageSizeControl. Used by client/src/features/admin/pages/SuperAdminUsersPage.tsx
- **Operational notes:** Approx. 136 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/admin/components/CreateCompanyModal.tsx`
- **File overview:** Presentation component for `CreateCompanyModal` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `CreateCompanyModal` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, @shared/components/Button, @shared/components/ModalOverlay, @features/admin/types/admin.type) -> focused transformation -> outputs leave through CreateCompanyModal.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react, @shared/components/Button, @shared/components/ModalOverlay, @features/admin/types/admin.type, @features/admin/components/AdminPasswordField. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 162 lines. Side effects: local/session state changes

### `client/src/features/admin/components/CreateRecruiterModal.tsx`
- **File overview:** Presentation component for `CreateRecruiterModal` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `CreateRecruiterModal` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, @shared/components/Button, @shared/components/ModalOverlay, @shared/components/SideDrawer) -> focused transformation -> outputs leave through CreateRecruiterModal.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react, @shared/components/Button, @shared/components/ModalOverlay, @shared/components/SideDrawer, @features/admin/types/admin.type, @features/admin/components/AdminPasswordField. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 168 lines. Side effects: local/session state changes

## client/src/features/admin/hooks

### `client/src/features/admin/hooks/useAdminActivationAction.ts`
- **File overview:** Reusable hook for `useAdminActivationAction` state, effects, and event handling.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `useAdminActivationAction` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (react, @shared/hooks/useConfirmation) -> focused transformation -> outputs leave through useAdminActivationAction.
- **Edge cases / constraints:** Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react, @shared/hooks/useConfirmation. Used by client/src/features/admin/pages/SuperAdminCompanyAdminsPage.tsx, client/src/features/admin/pages/SuperAdminRecruitersPage.tsx, client/src/features/admin/pages/SuperAdminUsersPage.tsx
- **Operational notes:** Approx. 63 lines. Side effects: local/session state changes

## client/src/features/admin/index.ts

### `client/src/features/admin/index.ts`
- **File overview:** Maintained module `index` in the codebase.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through module exports.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 7 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## client/src/features/admin/loaders

### `client/src/features/admin/loaders/admin.loaders.ts`
- **File overview:** Route-data loader for `admin loaders` that prepares screen state before render.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `superAdminDashboardLoader` (const), `superAdminCompanyAdminsLoader` (const), `superAdminRecruitersLoader` (const), `superAdminUsersLoader` (const), `companyAdminDashboardLoader` (const), `companyAdminEmployeesLoader` (const)
- **Business logic:** Validation and guard clauses protect downstream workflows from invalid state.
- **Data flow:** Navigation enters the route -> loader fetches/guards with react-router-dom, @app/routes/protectedLoader, @features/admin/service/admin.service -> preloaded data or redirect outcome returns.
- **Edge cases / constraints:** Pagination is normalized or bounded.
- **Dependencies:** Uses react-router-dom, @app/routes/protectedLoader, @features/admin/service/admin.service. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 162 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## client/src/features/admin/pages

### `client/src/features/admin/pages/CompanyAdminDashboardPage.tsx`
- **File overview:** Route-level screen for `CompanyAdminDashboardPage` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `CompanyAdminDashboardPage` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, react-router-dom, lucide-react, @shared/api/http) -> focused transformation -> outputs leave through CompanyAdminDashboardPage.
- **Edge cases / constraints:** Pagination is normalized or bounded. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react, react-router-dom, lucide-react, @shared/api/http, @shared/components/Avatar, @shared/components/Badge. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 388 lines. Side effects: redirect/navigation, local/session state changes

### `client/src/features/admin/pages/CompanyAdminEmployeesPage.tsx`
- **File overview:** Route-level screen for `CompanyAdminEmployeesPage` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `CompanyAdminEmployeesPage` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (lucide-react, react-router-dom, @features/admin/types/admin.type, @shared/components/Card) -> focused transformation -> outputs leave through CompanyAdminEmployeesPage.
- **Edge cases / constraints:** Pagination is normalized or bounded. File payload shape and content metadata matter here.
- **Dependencies:** Uses lucide-react, react-router-dom, @features/admin/types/admin.type, @shared/components/Card, @shared/components/ActionButton, @shared/components/DepartmentCell. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 162 lines. Side effects: file uploads/form data

### `client/src/features/admin/pages/SuperAdminCompanyAdminsPage.tsx`
- **File overview:** Route-level screen for `SuperAdminCompanyAdminsPage` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `SuperAdminCompanyAdminsPage` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react-router-dom, @shared/components/Card, @shared/components/DashboardPrimitives, @shared/hooks/usePermissions) -> focused transformation -> outputs leave through SuperAdminCompanyAdminsPage.
- **Edge cases / constraints:** Pagination is normalized or bounded.
- **Dependencies:** Uses react-router-dom, @shared/components/Card, @shared/components/DashboardPrimitives, @shared/hooks/usePermissions, @features/admin/components/AdminCompanyAdminsTableCard, @features/admin/components/AdminMetricCard. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 69 lines. Side effects: redirect/navigation

### `client/src/features/admin/pages/SuperAdminDashboardPage.tsx`
- **File overview:** Route-level screen for `SuperAdminDashboardPage` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `SuperAdminDashboardPage` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, react-router-dom, lucide-react, @shared/api/http) -> focused transformation -> outputs leave through SuperAdminDashboardPage.
- **Edge cases / constraints:** Pagination is normalized or bounded. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react, react-router-dom, lucide-react, @shared/api/http, @shared/components/Avatar, @shared/components/Button. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 274 lines. Side effects: redirect/navigation, local/session state changes

### `client/src/features/admin/pages/SuperAdminRecruitersPage.tsx`
- **File overview:** Route-level screen for `SuperAdminRecruitersPage` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `SuperAdminRecruitersPage` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react-router-dom, @shared/components/Card, @shared/components/DashboardPrimitives, @shared/hooks/usePermissions) -> focused transformation -> outputs leave through SuperAdminRecruitersPage.
- **Edge cases / constraints:** Pagination is normalized or bounded.
- **Dependencies:** Uses react-router-dom, @shared/components/Card, @shared/components/DashboardPrimitives, @shared/hooks/usePermissions, @features/admin/components/AdminMetricCard, @features/admin/components/AdminRecruitersTableCard. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 69 lines. Side effects: redirect/navigation

### `client/src/features/admin/pages/SuperAdminUsersPage.tsx`
- **File overview:** Route-level screen for `SuperAdminUsersPage` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `SuperAdminUsersPage` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react-router-dom, @app/providers/AuthProvider, @shared/components/Card, @shared/components/DashboardPrimitives) -> focused transformation -> outputs leave through SuperAdminUsersPage.
- **Edge cases / constraints:** Pagination is normalized or bounded.
- **Dependencies:** Uses react-router-dom, @app/providers/AuthProvider, @shared/components/Card, @shared/components/DashboardPrimitives, @shared/hooks/usePermissions, @features/admin/components/AdminMetricCard. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 71 lines. Side effects: redirect/navigation

## client/src/features/admin/service

### `client/src/features/admin/service/admin.service.ts`
- **File overview:** Service boundary for `admin service` that centralizes operations and side effects for callers.
- **Responsibilities:** Business/application boundary: validation, orchestration, persistence, and side effects.
- **Key functions / classes:** `adminService` (const)
- **Business logic:** This file appears to own or coordinate a feature workflow. It keeps validation, orchestration, and side effects out of callers.
- **Data flow:** Callers invoke service methods -> this module coordinates @shared/api/http -> results leave through adminService.
- **Edge cases / constraints:** Pagination is normalized or bounded.
- **Dependencies:** Uses @shared/api/http. Used by client/src/features/admin/loaders/admin.loaders.ts, client/src/features/admin/pages/SuperAdminCompanyAdminsPage.tsx, client/src/features/admin/pages/SuperAdminRecruitersPage.tsx, client/src/features/recruiter/pages/CandidateDetailPage/CandidateDetailPage.tsx
- **Operational notes:** Approx. 106 lines. Side effects: HTTP/API calls

## client/src/features/admin/types

### `client/src/features/admin/types/admin.type.ts`
- **File overview:** Contract module for `admin type`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `Paged` (interface), `SuperAdminDashboardDto` (interface), `SuperAdminCompanyAdminsPageDto` (interface), `SuperAdminRecruitersPageDto` (interface), `SuperAdminUsersPageDto` (interface), `CompanyAdminDashboardDto` (interface)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (Paged, SuperAdminDashboardDto, SuperAdminCompanyAdminsPageDto) -> compile-time consistency across layers.
- **Edge cases / constraints:** Pagination is normalized or bounded.
- **Dependencies:** Uses Framework/runtime only.. Used by client/src/features/admin/components/AdminCompaniesTableCard.tsx, client/src/features/admin/components/AdminCompanyAdminsTableCard.tsx, client/src/features/admin/components/AdminRecruitersTableCard.tsx, client/src/features/admin/components/AdminUsersTableCard.tsx, client/src/features/admin/components/CreateCompanyModal.tsx
- **Operational notes:** Approx. 146 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## client/src/features/auth/components

### `client/src/features/auth/components/AuthCheckbox.tsx`
- **File overview:** Presentation component for `AuthCheckbox` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through module exports.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 2 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/auth/components/AuthRouteTransition.tsx`
- **File overview:** Presentation component for `AuthRouteTransition` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `AuthRouteTransition` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, @shared/utils/cn) -> focused transformation -> outputs leave through AuthRouteTransition.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react, @shared/utils/cn. Used by client/src/features/auth/components/LegalDocumentPage.tsx, client/src/features/auth/pages/LoginPage.tsx, client/src/features/auth/pages/RegisterPage.tsx
- **Operational notes:** Approx. 32 lines. Side effects: local/session state changes

### `client/src/features/auth/components/LegalDocumentPage.tsx`
- **File overview:** Route-level screen for `LegalDocumentPage` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `LegalDocumentPage` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react-router-dom, lucide-react, @shared/components/Card, @shared/utils/viewTransition) -> focused transformation -> outputs leave through LegalDocumentPage.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react-router-dom, lucide-react, @shared/components/Card, @shared/utils/viewTransition, @features/auth/components/AuthRouteTransition. Used by client/src/features/auth/pages/PrivacyPolicyPage.tsx, client/src/features/auth/pages/TermsOfServicePage.tsx
- **Operational notes:** Approx. 97 lines. Side effects: redirect/navigation

### `client/src/features/auth/components/ResetPasswordPinModal.tsx`
- **File overview:** Presentation component for `ResetPasswordPinModal` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `ResetPasswordPinModal` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, lucide-react, @features/auth/services/auth.service, @shared/api/http) -> focused transformation -> outputs leave through ResetPasswordPinModal.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react, lucide-react, @features/auth/services/auth.service, @shared/api/http, @shared/ui/buttons/Button, @shared/ui/modals/ModalFrame. Used by client/src/features/jobseeker/pages/ProfilePage/ProfilePage.tsx, client/src/features/jobseeker/pages/SettingsPage/SettingsPage.tsx
- **Operational notes:** Approx. 381 lines. Side effects: local/session state changes

## client/src/features/auth/index.ts

### `client/src/features/auth/index.ts`
- **File overview:** Maintained module `index` in the codebase.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through module exports.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 1 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## client/src/features/auth/pages

### `client/src/features/auth/pages/ForgotPasswordPage.tsx`
- **File overview:** Route-level screen for `ForgotPasswordPage` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `ForgotPasswordPage` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, react-router-dom, lucide-react, @shared/api/http) -> focused transformation -> outputs leave through ForgotPasswordPage.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react, react-router-dom, lucide-react, @shared/api/http, @shared/components/Button, @shared/components/Card. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 205 lines. Side effects: local/session state changes

### `client/src/features/auth/pages/LoginPage.tsx`
- **File overview:** Route-level screen for `LoginPage` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, react-router-dom, @shared/assets/Lightbrand_logo.png, @shared/assets/BuildingImage.jpg) -> focused transformation -> outputs leave through module exports.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react, react-router-dom, @shared/assets/Lightbrand_logo.png, @shared/assets/BuildingImage.jpg, lucide-react, @app/providers/AuthProvider. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 214 lines. Side effects: redirect/navigation, local/session state changes

### `client/src/features/auth/pages/PrivacyPolicyPage.tsx`
- **File overview:** Route-level screen for `PrivacyPolicyPage` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (@features/auth/components/LegalDocumentPage) -> focused transformation -> outputs leave through module exports.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses @features/auth/components/LegalDocumentPage. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 63 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/auth/pages/RegisterPage.tsx`
- **File overview:** Route-level screen for `RegisterPage` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `legalRouteState` (object)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, react-router-dom, @shared/assets/Lightbrand_logo.png, @shared/assets/BuildingImage.jpg) -> focused transformation -> outputs leave through legalRouteState.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react, react-router-dom, @shared/assets/Lightbrand_logo.png, @shared/assets/BuildingImage.jpg, lucide-react, @app/providers/AuthProvider. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 294 lines. Side effects: redirect/navigation, local/session state changes

### `client/src/features/auth/pages/ResetPasswordPage.tsx`
- **File overview:** Route-level screen for `ResetPasswordPage` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `ResetPasswordPage` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, react-router-dom, lucide-react, @shared/api/http) -> focused transformation -> outputs leave through ResetPasswordPage.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react, react-router-dom, lucide-react, @shared/api/http, @shared/components/Button, @shared/components/Card. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 348 lines. Side effects: redirect/navigation, local/session state changes

### `client/src/features/auth/pages/TermsOfServicePage.tsx`
- **File overview:** Route-level screen for `TermsOfServicePage` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (@features/auth/components/LegalDocumentPage) -> focused transformation -> outputs leave through module exports.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses @features/auth/components/LegalDocumentPage. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 62 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/auth/pages/index.ts`
- **File overview:** Route-level screen for `index` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through module exports.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 6 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## client/src/features/auth/services

### `client/src/features/auth/services/auth.service.ts`
- **File overview:** Service boundary for `auth service` that centralizes operations and side effects for callers.
- **Responsibilities:** Business/application boundary: validation, orchestration, persistence, and side effects.
- **Key functions / classes:** `authService` (const)
- **Business logic:** This file appears to own or coordinate a feature workflow. It keeps validation, orchestration, and side effects out of callers.
- **Data flow:** Callers invoke service methods -> this module coordinates @shared/api/http -> results leave through authService.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses @shared/api/http. Used by client/src/features/auth/components/ResetPasswordPinModal.tsx, client/src/features/auth/pages/ForgotPasswordPage.tsx, client/src/features/auth/pages/ResetPasswordPage.tsx, client/src/features/jobseeker/pages/ProfilePage/ProfilePage.tsx, client/src/features/jobseeker/pages/SettingsPage/SettingsPage.tsx
- **Operational notes:** Approx. 82 lines. Side effects: HTTP/API calls, file uploads/form data

## client/src/features/auth/types

### `client/src/features/auth/types/auth.types.ts`
- **File overview:** Contract module for `auth types`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `RequestPasswordResetPayload` (interface), `RequestPasswordResetPinPayload` (interface), `VerifyResetPinPayload` (interface), `ValidatePasswordResetTokenPayload` (interface), `ResetPasswordPayload` (interface), `ChangePasswordPayload` (interface)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (RequestPasswordResetPayload, RequestPasswordResetPinPayload, VerifyResetPinPayload) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by client/src/app/providers/CurrentCompanyProvider.tsx, client/src/app/providers/CurrentRecruiterProvider.tsx, client/src/app/routes/protectedLoader.ts
- **Operational notes:** Approx. 90 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## client/src/features/jobseeker/actions

### `client/src/features/jobseeker/actions/action.utils.ts`
- **File overview:** UI mutation helper for `action utils` that turns user intent into a typed request.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `getString` (const), `getApiErrorMessage` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** User action -> payload shaping -> collaborator call (@shared/api/http, @features/jobseeker/types) -> mutation result back to the UI.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. File payload shape and content metadata matter here. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses @shared/api/http, @features/jobseeker/types. Used by client/src/features/jobseeker/actions/withdraw-application.action.ts
- **Operational notes:** Approx. 23 lines. Side effects: file uploads/form data

### `client/src/features/jobseeker/actions/apply-job.action.ts`
- **File overview:** UI mutation helper for `apply job action` that turns user intent into a typed request.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `applyJobAction` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** User action -> payload shaping -> collaborator call (react-router-dom, @features/jobseeker/service/jobseeker.service) -> mutation result back to the UI.
- **Edge cases / constraints:** File payload shape and content metadata matter here. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react-router-dom, @features/jobseeker/service/jobseeker.service. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 60 lines. Side effects: redirect/navigation, file uploads/form data

### `client/src/features/jobseeker/actions/index.ts`
- **File overview:** UI mutation helper for `index` that turns user intent into a typed request.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** User action -> payload shaping -> collaborator call (framework/runtime deps) -> mutation result back to the UI.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by client/src/app/routes/jobseeker.routes.tsx
- **Operational notes:** Approx. 4 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/jobseeker/actions/save-job.action.ts`
- **File overview:** UI mutation helper for `save job action` that turns user intent into a typed request.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `saveJobAction` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** User action -> payload shaping -> collaborator call (react-router-dom, @features/jobseeker/service/jobseeker.service) -> mutation result back to the UI.
- **Edge cases / constraints:** Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react-router-dom, @features/jobseeker/service/jobseeker.service. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 35 lines. Side effects: file uploads/form data

### `client/src/features/jobseeker/actions/update-profile.action.ts`
- **File overview:** UI mutation helper for `update profile action` that turns user intent into a typed request.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `updateProfileAction` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** User action -> payload shaping -> collaborator call (react-router-dom, @features/jobseeker/service/jobseeker.service, @shared/utils/richText) -> mutation result back to the UI.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react-router-dom, @features/jobseeker/service/jobseeker.service, @shared/utils/richText. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 43 lines. Side effects: file uploads/form data

### `client/src/features/jobseeker/actions/withdraw-application.action.ts`
- **File overview:** UI mutation helper for `withdraw application action` that turns user intent into a typed request.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `withdrawApplicationAction` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** User action -> payload shaping -> collaborator call (react-router-dom, @features/jobseeker/service/jobseeker.service, @features/jobseeker/actions/action.utils) -> mutation result back to the UI.
- **Edge cases / constraints:** Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react-router-dom, @features/jobseeker/service/jobseeker.service, @features/jobseeker/actions/action.utils. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 23 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## client/src/features/jobseeker/components

### `client/src/features/jobseeker/components/SavedJobsEmptyState.tsx`
- **File overview:** Presentation component for `SavedJobsEmptyState` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `SavedJobsEmptyState` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (lucide-react, react-router-dom, @shared/utils/cn) -> focused transformation -> outputs leave through SavedJobsEmptyState.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses lucide-react, react-router-dom, @shared/utils/cn. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 49 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/jobseeker/components/SearchField.tsx`
- **File overview:** Presentation component for `SearchField` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `SearchField` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through SearchField.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 32 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/jobseeker/components/index.ts`
- **File overview:** Presentation component for `index` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through module exports.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by client/src/features/jobseeker/pages/ApplicationsPage/ApplicationsPage.tsx, client/src/features/jobseeker/pages/DashboardPage/DashboardPage.tsx, client/src/features/jobseeker/pages/JobsPage/JobsPage.tsx, client/src/features/jobseeker/pages/SavedJobsPage/SavedJobsPage.tsx
- **Operational notes:** Approx. 2 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## client/src/features/jobseeker/data

### `client/src/features/jobseeker/data/data.ts`
- **File overview:** Static data resource for `data` used by runtime code.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `jobs` (const), `weeklyAnalytics` (const), `profileChecklist` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (@shared/types) -> focused transformation -> outputs leave through jobs, weeklyAnalytics, profileChecklist.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses @shared/types. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 29 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## client/src/features/jobseeker/hooks

### `client/src/features/jobseeker/hooks/index.ts`
- **File overview:** Reusable hook for `index` state, effects, and event handling.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through module exports.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by client/src/features/jobseeker/pages/ApplicationsPage/ApplicationsPage.tsx, client/src/features/jobseeker/pages/OffersPage/OffersPage.tsx, client/src/features/jobseeker/pages/SavedJobsPage/SavedJobsPage.tsx
- **Operational notes:** Approx. 5 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/jobseeker/hooks/useApplications.ts`
- **File overview:** Reusable hook for `useApplications` state, effects, and event handling.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `useApplications` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (react, @features/jobseeker/service/jobseeker.service, @features/jobseeker/types, @shared/api/http) -> focused transformation -> outputs leave through useApplications.
- **Edge cases / constraints:** Pagination is normalized or bounded. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react, @features/jobseeker/service/jobseeker.service, @features/jobseeker/types, @shared/api/http. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 196 lines. Side effects: local/session state changes

### `client/src/features/jobseeker/hooks/useArchivedInterviews.ts`
- **File overview:** Reusable hook for `useArchivedInterviews` state, effects, and event handling.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `useArchivedInterviews` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (react, @shared/api/http, @features/jobseeker/services/interview.service) -> focused transformation -> outputs leave through useArchivedInterviews.
- **Edge cases / constraints:** Pagination is normalized or bounded. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react, @shared/api/http, @features/jobseeker/services/interview.service. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 131 lines. Side effects: local/session state changes

### `client/src/features/jobseeker/hooks/useDashboardData.ts`
- **File overview:** Reusable hook for `useDashboardData` state, effects, and event handling.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `useDashboardData` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (react, @features/jobseeker/service/jobseeker.service, @features/jobseeker/types) -> focused transformation -> outputs leave through useDashboardData.
- **Edge cases / constraints:** Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react, @features/jobseeker/service/jobseeker.service, @features/jobseeker/types. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 27 lines. Side effects: local/session state changes

### `client/src/features/jobseeker/hooks/useProfileForm.ts`
- **File overview:** Reusable hook for `useProfileForm` state, effects, and event handling.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `useProfileForm` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (react, @features/jobseeker/service/jobseeker.service) -> focused transformation -> outputs leave through useProfileForm.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react, @features/jobseeker/service/jobseeker.service. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 28 lines. Side effects: local/session state changes, file uploads/form data

### `client/src/features/jobseeker/hooks/useSavedJobs.ts`
- **File overview:** Reusable hook for `useSavedJobs` state, effects, and event handling.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `useSavedJobs` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (react, @features/jobseeker/service/jobseeker.service) -> focused transformation -> outputs leave through useSavedJobs.
- **Edge cases / constraints:** Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react, @features/jobseeker/service/jobseeker.service. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 28 lines. Side effects: local/session state changes

## client/src/features/jobseeker/index.ts

### `client/src/features/jobseeker/index.ts`
- **File overview:** Maintained module `index` in the codebase.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through module exports.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 7 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## client/src/features/jobseeker/loaders

### `client/src/features/jobseeker/loaders/applications.loader.ts`
- **File overview:** Route-data loader for `applications loader` that prepares screen state before render.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `applicationsLoader` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Navigation enters the route -> loader fetches/guards with react-router-dom, @features/jobseeker/service/jobseeker.service -> preloaded data or redirect outcome returns.
- **Edge cases / constraints:** Pagination is normalized or bounded. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react-router-dom, @features/jobseeker/service/jobseeker.service. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 30 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/jobseeker/loaders/archived-interviews.loader.ts`
- **File overview:** Route-data loader for `archived interviews loader` that prepares screen state before render.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `archivedInterviewsLoader` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Navigation enters the route -> loader fetches/guards with react-router-dom, @features/jobseeker/services/interview.service, @features/jobseeker/types -> preloaded data or redirect outcome returns.
- **Edge cases / constraints:** Pagination is normalized or bounded. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react-router-dom, @features/jobseeker/services/interview.service, @features/jobseeker/types. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 24 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/jobseeker/loaders/dashboard.loader.ts`
- **File overview:** Route-data loader for `dashboard loader` that prepares screen state before render.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `dashboardLoader` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Navigation enters the route -> loader fetches/guards with react-router-dom, @app/routes/protectedLoader, @features/jobseeker/service/jobseeker.service, @features/jobseeker/loaders/loader.utils -> preloaded data or redirect outcome returns.
- **Edge cases / constraints:** Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react-router-dom, @app/routes/protectedLoader, @features/jobseeker/service/jobseeker.service, @features/jobseeker/loaders/loader.utils. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 47 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/jobseeker/loaders/index.ts`
- **File overview:** Route-data loader for `index` that prepares screen state before render.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Navigation enters the route -> loader fetches/guards with framework/runtime deps -> preloaded data or redirect outcome returns.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 7 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/jobseeker/loaders/job-detail.loader.ts`
- **File overview:** Route-data loader for `job detail loader` that prepares screen state before render.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `jobDetailLoader` (const)
- **Business logic:** Validation and guard clauses protect downstream workflows from invalid state.
- **Data flow:** Navigation enters the route -> loader fetches/guards with react-router-dom, @features/jobseeker/service/jobseeker.service, @features/jobseeker/types, @features/jobseeker/loaders/loader.utils -> preloaded data or redirect outcome returns.
- **Edge cases / constraints:** Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react-router-dom, @features/jobseeker/service/jobseeker.service, @features/jobseeker/types, @features/jobseeker/loaders/loader.utils. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 18 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/jobseeker/loaders/jobs.loader.ts`
- **File overview:** Route-data loader for `jobs loader` that prepares screen state before render.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `jobsLoader` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Navigation enters the route -> loader fetches/guards with @features/jobseeker/service/jobseeker.service, @features/jobseeker/types -> preloaded data or redirect outcome returns.
- **Edge cases / constraints:** Pagination is normalized or bounded. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses @features/jobseeker/service/jobseeker.service, @features/jobseeker/types. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 29 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/jobseeker/loaders/loader.utils.ts`
- **File overview:** Route-data loader for `loader utils` that prepares screen state before render.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `rethrowAsRouteError` (const), `getPositiveNumber` (const)
- **Business logic:** Validation and guard clauses protect downstream workflows from invalid state.
- **Data flow:** Navigation enters the route -> loader fetches/guards with react-router-dom, @shared/api/http -> preloaded data or redirect outcome returns.
- **Edge cases / constraints:** Identity and access preconditions are enforced explicitly. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react-router-dom, @shared/api/http. Used by client/src/features/jobseeker/loaders/dashboard.loader.ts, client/src/features/jobseeker/loaders/job-detail.loader.ts, client/src/features/jobseeker/loaders/profile.loader.ts, client/src/features/jobseeker/loaders/saved-jobs.loader.ts
- **Operational notes:** Approx. 35 lines. Side effects: redirect/navigation

### `client/src/features/jobseeker/loaders/profile.loader.ts`
- **File overview:** Route-data loader for `profile loader` that prepares screen state before render.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `profileLoader` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Navigation enters the route -> loader fetches/guards with @features/jobseeker/service/jobseeker.service, @features/jobseeker/types, @features/jobseeker/loaders/loader.utils -> preloaded data or redirect outcome returns.
- **Edge cases / constraints:** Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses @features/jobseeker/service/jobseeker.service, @features/jobseeker/types, @features/jobseeker/loaders/loader.utils. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 11 lines. Side effects: file uploads/form data

### `client/src/features/jobseeker/loaders/saved-jobs.loader.ts`
- **File overview:** Route-data loader for `saved jobs loader` that prepares screen state before render.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `savedJobsLoader` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Navigation enters the route -> loader fetches/guards with react-router-dom, @features/jobseeker/service/jobseeker.service, @features/jobseeker/types, @features/jobseeker/loaders/loader.utils -> preloaded data or redirect outcome returns.
- **Edge cases / constraints:** Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react-router-dom, @features/jobseeker/service/jobseeker.service, @features/jobseeker/types, @features/jobseeker/loaders/loader.utils. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 17 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## client/src/features/jobseeker/pages

### `client/src/features/jobseeker/pages/ApplicationsPage/ApplicationsPage.tsx`
- **File overview:** Route-level screen for `ApplicationsPage` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `ApplicationsPage` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, react-router-dom, lucide-react, @shared/components/Card) -> focused transformation -> outputs leave through ApplicationsPage.
- **Edge cases / constraints:** Pagination is normalized or bounded. Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses react, react-router-dom, lucide-react, @shared/components/Card, @features/jobseeker/components, @features/jobseeker/hooks. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 181 lines. Side effects: local/session state changes

### `client/src/features/jobseeker/pages/ApplicationsPage/components/ApplicationListSkeleton.tsx`
- **File overview:** Route-level screen for `ApplicationListSkeleton` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `ApplicationListSkeleton` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (@shared/components/skeletons/TableRowsSkeleton) -> focused transformation -> outputs leave through ApplicationListSkeleton.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses @shared/components/skeletons/TableRowsSkeleton. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 8 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/jobseeker/pages/ApplicationsPage/components/ApplicationStatusBadge.tsx`
- **File overview:** Route-level screen for `ApplicationStatusBadge` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `ApplicationStatusBadge` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (@shared/components/StatusBadge) -> focused transformation -> outputs leave through ApplicationStatusBadge.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses @shared/components/StatusBadge. Used by client/src/features/jobseeker/pages/ApplicationsPage/components/ApplicationsTable.tsx
- **Operational notes:** Approx. 11 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/jobseeker/pages/ApplicationsPage/components/ApplicationsEmptyState.tsx`
- **File overview:** Route-level screen for `ApplicationsEmptyState` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `ApplicationsEmptyState` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (lucide-react) -> focused transformation -> outputs leave through ApplicationsEmptyState.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses lucide-react. Used by client/src/features/jobseeker/pages/ApplicationsPage/ApplicationsPage.tsx
- **Operational notes:** Approx. 25 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/jobseeker/pages/ApplicationsPage/components/ApplicationsTable.tsx`
- **File overview:** Route-level screen for `ApplicationsTable` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `ApplicationsTable` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (lucide-react, react-router-dom, @features/jobseeker/types, @features/jobseeker/pages/ApplicationsPage/components/ApplicationStatusBadge) -> focused transformation -> outputs leave through ApplicationsTable.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses lucide-react, react-router-dom, @features/jobseeker/types, @features/jobseeker/pages/ApplicationsPage/components/ApplicationStatusBadge, @features/jobseeker/utils/applicationActionRules, @shared/components/ActionButton. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 148 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/jobseeker/pages/ArchivedApplicationsPage/ArchivedApplicationsPage.tsx`
- **File overview:** Route-level screen for `ArchivedApplicationsPage` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `ArchivedApplicationsPage` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (lucide-react, react-router-dom, @shared/components/Card, @shared/components/ActionButton) -> focused transformation -> outputs leave through ArchivedApplicationsPage.
- **Edge cases / constraints:** Pagination is normalized or bounded.
- **Dependencies:** Uses lucide-react, react-router-dom, @shared/components/Card, @shared/components/ActionButton, @shared/components/JobTitleCell, @shared/components/ui/data-table/DataTable. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 235 lines. Side effects: local/session state changes

### `client/src/features/jobseeker/pages/ArchivedInterviewsPage/ArchivedInterviewsPage.tsx`
- **File overview:** Route-level screen for `ArchivedInterviewsPage` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `ArchivedInterviewsPage` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, lucide-react, react-router-dom, @shared/components/ActionButton) -> focused transformation -> outputs leave through ArchivedInterviewsPage.
- **Edge cases / constraints:** Pagination is normalized or bounded. Input cleanup/normalization happens before comparison or persistence. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react, lucide-react, react-router-dom, @shared/components/ActionButton, @shared/components/Card, @shared/components/RichTextContent. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 441 lines. Side effects: local/session state changes

### `client/src/features/jobseeker/pages/DashboardPage/DashboardPage.tsx`
- **File overview:** Route-level screen for `DashboardPage` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `DashboardPage` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react-router-dom, react, @shared/components/DashboardAreaChart, @shared/components/DashboardGreeting) -> focused transformation -> outputs leave through DashboardPage.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react-router-dom, react, @shared/components/DashboardAreaChart, @shared/components/DashboardGreeting, @app/providers/AuthProvider, @features/jobseeker/components. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 426 lines. Side effects: local/session state changes

### `client/src/features/jobseeker/pages/DashboardPage/components/DashboardStatsSkeleton.tsx`
- **File overview:** Route-level screen for `DashboardStatsSkeleton` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `DashboardStatsSkeleton` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (@shared/components/skeletons/SkeletonBlock) -> focused transformation -> outputs leave through DashboardStatsSkeleton.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses @shared/components/skeletons/SkeletonBlock. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 67 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/jobseeker/pages/InterviewPage/InterviewPage.tsx`
- **File overview:** Route-level screen for `InterviewPage` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `InterviewPage` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, react-router-dom, @shared/hooks/useConfirmation, @shared/components/Card) -> focused transformation -> outputs leave through InterviewPage.
- **Edge cases / constraints:** Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react, react-router-dom, @shared/hooks/useConfirmation, @shared/components/Card, @shared/components/RichTextContent, @shared/components/SideDrawer. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 497 lines. Side effects: local/session state changes

### `client/src/features/jobseeker/pages/InterviewPage/components/InterviewCalendarSkeleton.tsx`
- **File overview:** Route-level screen for `InterviewCalendarSkeleton` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `InterviewCalendarSkeleton` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (@shared/components/skeletons/SkeletonBlock) -> focused transformation -> outputs leave through InterviewCalendarSkeleton.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses @shared/components/skeletons/SkeletonBlock. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 48 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/jobseeker/pages/InterviewPage/components/JobseekerInterviewCalendar.tsx`
- **File overview:** Route-level screen for `JobseekerInterviewCalendar` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `JobseekerInterviewCalendar` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, lucide-react, @fullcalendar/react, @fullcalendar/daygrid) -> focused transformation -> outputs leave through JobseekerInterviewCalendar.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react, lucide-react, @fullcalendar/react, @fullcalendar/daygrid, @fullcalendar/timegrid, @fullcalendar/interaction. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 556 lines. Side effects: redirect/navigation, local/session state changes

### `client/src/features/jobseeker/pages/InterviewPage/components/JobseekerInterviewCard.tsx`
- **File overview:** Route-level screen for `JobseekerInterviewCard` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `JobseekerInterviewCard` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (@features/jobseeker/types, ./RescheduleRequestModal, react, @shared/utils/calendar) -> focused transformation -> outputs leave through JobseekerInterviewCard.
- **Edge cases / constraints:** Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses @features/jobseeker/types, ./RescheduleRequestModal, react, @shared/utils/calendar, @shared/utils/notifications, @shared/components/RichTextContent. Used by client/src/features/jobseeker/pages/InterviewPage/components/JobseekerInterviewList.tsx
- **Operational notes:** Approx. 198 lines. Side effects: local/session state changes

### `client/src/features/jobseeker/pages/InterviewPage/components/JobseekerInterviewList.tsx`
- **File overview:** Route-level screen for `JobseekerInterviewList` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `JobseekerInterviewList` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, @shared/components/Card, @features/jobseeker/types, ./JobseekerInterviewCard) -> focused transformation -> outputs leave through JobseekerInterviewList.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react, @shared/components/Card, @features/jobseeker/types, ./JobseekerInterviewCard, @shared/utils/interviewStatus. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 178 lines. Side effects: local/session state changes

### `client/src/features/jobseeker/pages/InterviewPage/components/RescheduleRequestForm.tsx`
- **File overview:** Route-level screen for `RescheduleRequestForm` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `RescheduleRequestForm` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, @shared/components/Button, @shared/components/RichTextField, @shared/utils/richText) -> focused transformation -> outputs leave through RescheduleRequestForm.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react, @shared/components/Button, @shared/components/RichTextField, @shared/utils/richText. Used by client/src/features/jobseeker/pages/InterviewPage/components/RescheduleRequestModal.tsx
- **Operational notes:** Approx. 79 lines. Side effects: local/session state changes

### `client/src/features/jobseeker/pages/InterviewPage/components/RescheduleRequestModal.tsx`
- **File overview:** Route-level screen for `RescheduleRequestModal` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `RescheduleRequestModal` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (@shared/components/SideDrawer, ./RescheduleRequestForm) -> focused transformation -> outputs leave through RescheduleRequestModal.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses @shared/components/SideDrawer, ./RescheduleRequestForm. Used by client/src/features/jobseeker/pages/InterviewPage/components/JobseekerInterviewCard.tsx
- **Operational notes:** Approx. 29 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/jobseeker/pages/JobDetailPage/JobDetailPage.tsx`
- **File overview:** Route-level screen for `JobDetailPage` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `JobDetailPage` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, react-router-dom, lucide-react, @app/providers/ToastProvider) -> focused transformation -> outputs leave through JobDetailPage.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. File payload shape and content metadata matter here. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react, react-router-dom, lucide-react, @app/providers/ToastProvider, @shared/components/Card, @shared/components/DetailBlock. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 374 lines. Side effects: local/session state changes, file uploads/form data

### `client/src/features/jobseeker/pages/JobDetailPage/components/ApplyModalWizard.tsx`
- **File overview:** Route-level screen for `ApplyModalWizard` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `ApplyModalWizard` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, @features/jobseeker/pages/JobDetailPage/components/ApplyWizardStepper, @shared/hooks/useConfirmation) -> focused transformation -> outputs leave through ApplyModalWizard.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. File payload shape and content metadata matter here.
- **Dependencies:** Uses react, @features/jobseeker/pages/JobDetailPage/components/ApplyWizardStepper, @shared/hooks/useConfirmation. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 358 lines. Side effects: local/session state changes, file uploads/form data

### `client/src/features/jobseeker/pages/JobDetailPage/components/ApplyWizardStepper.tsx`
- **File overview:** Route-level screen for `ApplyWizardStepper` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `ApplyWizardStepper` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through ApplyWizardStepper.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by client/src/features/jobseeker/pages/JobDetailPage/components/ApplyModalWizard.tsx
- **Operational notes:** Approx. 46 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/jobseeker/pages/JobsPage/JobsPage.tsx`
- **File overview:** Route-level screen for `JobsPage` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `JobsPage` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, react-router-dom, @features/jobseeker/components, @features/jobseeker/service/jobseeker.service) -> focused transformation -> outputs leave through JobsPage.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react, react-router-dom, @features/jobseeker/components, @features/jobseeker/service/jobseeker.service, @features/jobseeker/types, @shared/components/Card. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 423 lines. Side effects: local/session state changes

### `client/src/features/jobseeker/pages/OffersPage/OffersPage.tsx`
- **File overview:** Route-level screen for `OffersPage` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `OffersPage` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, react-router-dom, lucide-react, @app/providers/ToastProvider) -> focused transformation -> outputs leave through OffersPage.
- **Edge cases / constraints:** Pagination is normalized or bounded. Input cleanup/normalization happens before comparison or persistence. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react, react-router-dom, lucide-react, @app/providers/ToastProvider, @features/jobseeker/hooks, @features/jobseeker/services/interview.service. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 386 lines. Side effects: local/session state changes

### `client/src/features/jobseeker/pages/OffersPage/components/OfferDetailsModal.tsx`
- **File overview:** Route-level screen for `OfferDetailsModal` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `OfferDetailsModal` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (lucide-react, ./OfferPipelineCard, @shared/ui/buttons/Button, @shared/ui/modals/ModalFrame) -> focused transformation -> outputs leave through OfferDetailsModal.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses lucide-react, ./OfferPipelineCard, @shared/ui/buttons/Button, @shared/ui/modals/ModalFrame, @shared/components/StatusBadge, @shared/utils/richText. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 207 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/jobseeker/pages/OffersPage/components/OfferPipelineCard.tsx`
- **File overview:** Route-level screen for `OfferPipelineCard` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `OfferPipelineCard` (const), `OfferPipelineCardData` (interface)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (lucide-react, react-router-dom, @features/jobseeker/types, @features/jobseeker/utils/applicationActionRules) -> focused transformation -> outputs leave through OfferPipelineCard, OfferPipelineCardData.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses lucide-react, react-router-dom, @features/jobseeker/types, @features/jobseeker/utils/applicationActionRules, @shared/components/ActionButton, @shared/components/Badge. Used by client/src/features/jobseeker/pages/OffersPage/components/OfferDetailsModal.tsx
- **Operational notes:** Approx. 250 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/jobseeker/pages/OffersPage/components/OfferStageTimeline.tsx`
- **File overview:** Route-level screen for `OfferStageTimeline` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `resolveTimelineStage` (const), `OfferStageTimeline` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (lucide-react, @features/jobseeker/types) -> focused transformation -> outputs leave through resolveTimelineStage, OfferStageTimeline.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses lucide-react, @features/jobseeker/types. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 117 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/jobseeker/pages/ProfilePage/ProfilePage.tsx`
- **File overview:** Route-level screen for `ProfilePage` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `ProfilePage` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, lucide-react, @app/providers/AuthProvider, @app/providers/ToastProvider) -> focused transformation -> outputs leave through ProfilePage.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react, lucide-react, @app/providers/AuthProvider, @app/providers/ToastProvider, @features/auth/components/ResetPasswordPinModal, @features/auth/services/auth.service. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 513 lines. Side effects: local/session state changes, file uploads/form data

### `client/src/features/jobseeker/pages/ProfilePage/components/ProfileForm.tsx`
- **File overview:** Route-level screen for `ProfileForm` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `ProfileForm` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, @shared/components/Button) -> focused transformation -> outputs leave through ProfileForm.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react, @shared/components/Button. Used by client/src/features/jobseeker/pages/ProfilePage/ProfilePage.tsx
- **Operational notes:** Approx. 89 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/jobseeker/pages/SavedJobsPage/SavedJobsPage.tsx`
- **File overview:** Route-level screen for `SavedJobsPage` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `SavedJobsPage` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, @features/jobseeker/components, @features/jobseeker/hooks, @features/jobseeker/service/jobseeker.service) -> focused transformation -> outputs leave through SavedJobsPage.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses react, @features/jobseeker/components, @features/jobseeker/hooks, @features/jobseeker/service/jobseeker.service, @shared/components/Card, @shared/components/JobCard. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 72 lines. Side effects: local/session state changes

### `client/src/features/jobseeker/pages/SettingsPage/SettingsPage.tsx`
- **File overview:** Route-level screen for `SettingsPage` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `SettingsPage` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, react-router-dom, lucide-react, @app/providers/AuthProvider) -> focused transformation -> outputs leave through SettingsPage.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react, react-router-dom, lucide-react, @app/providers/AuthProvider, @app/providers/ToastProvider, @features/auth/components/ResetPasswordPinModal. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 319 lines. Side effects: local/session state changes

### `client/src/features/jobseeker/pages/index.ts`
- **File overview:** Route-level screen for `index` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through module exports.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 10 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## client/src/features/jobseeker/service

### `client/src/features/jobseeker/service/jobseeker.service.ts`
- **File overview:** Service boundary for `jobseeker service` that centralizes operations and side effects for callers.
- **Responsibilities:** Business/application boundary: validation, orchestration, persistence, and side effects.
- **Key functions / classes:** `jobseekerService` (const)
- **Business logic:** This file appears to own or coordinate a feature workflow. Caching is used to reduce repeated work while relying on invalidation elsewhere.
- **Data flow:** Callers invoke service methods -> this module coordinates @shared/api/http, @shared/utils/richText -> results leave through jobseekerService.
- **Edge cases / constraints:** Pagination is normalized or bounded. Input cleanup/normalization happens before comparison or persistence. File payload shape and content metadata matter here.
- **Dependencies:** Uses @shared/api/http, @shared/utils/richText. Used by client/src/features/jobseeker/actions/apply-job.action.ts, client/src/features/jobseeker/actions/save-job.action.ts, client/src/features/jobseeker/actions/update-profile.action.ts, client/src/features/jobseeker/actions/withdraw-application.action.ts, client/src/features/jobseeker/hooks/useApplications.ts
- **Operational notes:** Approx. 203 lines. Side effects: HTTP/API calls, cache reads/writes, file uploads/form data

## client/src/features/jobseeker/services

### `client/src/features/jobseeker/services/interview.service.ts`
- **File overview:** Service boundary for `interview service` that centralizes operations and side effects for callers.
- **Responsibilities:** Business/application boundary: validation, orchestration, persistence, and side effects.
- **Key functions / classes:** `jobseekerInterviewService` (const)
- **Business logic:** This file appears to own or coordinate a feature workflow. It keeps validation, orchestration, and side effects out of callers.
- **Data flow:** Callers invoke service methods -> this module coordinates @shared/api/http, @shared/utils/richText -> results leave through jobseekerInterviewService.
- **Edge cases / constraints:** Pagination is normalized or bounded. Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses @shared/api/http, @shared/utils/richText. Used by client/src/features/jobseeker/hooks/useArchivedInterviews.ts, client/src/features/jobseeker/loaders/archived-interviews.loader.ts, client/src/features/jobseeker/pages/InterviewPage/InterviewPage.tsx, client/src/features/jobseeker/pages/OffersPage/OffersPage.tsx
- **Operational notes:** Approx. 127 lines. Side effects: HTTP/API calls

## client/src/features/jobseeker/types

### `client/src/features/jobseeker/types/api.type.ts`
- **File overview:** Contract module for `api type`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `ApiMessageResponse` (interface)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (ApiMessageResponse) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 4 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/jobseeker/types/application.type.ts`
- **File overview:** Contract module for `application type`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `JobseekerApplicationInput` (interface), `ApplyToJobResponse` (interface), `JobseekerOfferDto` (interface), `JobseekerApplicationDto` (interface), `JobseekerApplicationsQueryParams` (interface), `ApplyJobActionData` (interface)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (JobseekerApplicationInput, ApplyToJobResponse, JobseekerOfferDto) -> compile-time consistency across layers.
- **Edge cases / constraints:** Pagination is normalized or bounded.
- **Dependencies:** Uses @features/recruiter/types. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 95 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/jobseeker/types/dashboard.type.ts`
- **File overview:** Contract module for `dashboard type`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `JobseekerStatusSummary` (interface), `SavedJobDto` (interface), `RecentApplicationDto` (interface), `DashboardAnalyticsDto` (interface), `DashboardDto` (interface), `DashboardLoaderData` (interface)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (JobseekerStatusSummary, SavedJobDto, RecentApplicationDto) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by client/src/features/jobseeker/types/profile.type.ts
- **Operational notes:** Approx. 51 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/jobseeker/types/index.ts`
- **File overview:** Contract module for `index`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (module exports) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by client/src/features/jobseeker/actions/action.utils.ts, client/src/features/jobseeker/hooks/useApplications.ts, client/src/features/jobseeker/hooks/useDashboardData.ts, client/src/features/jobseeker/loaders/archived-interviews.loader.ts, client/src/features/jobseeker/loaders/job-detail.loader.ts
- **Operational notes:** Approx. 6 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/jobseeker/types/interview.types.ts`
- **File overview:** Contract module for `interview types`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `JobseekerInterview` (interface), `JobseekerArchivedInterviewsQueryParams` (interface), `JobseekerArchivedInterviewsLoaderData` (interface), `JobseekerInterviewStatus` (type)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (JobseekerInterview, JobseekerArchivedInterviewsQueryParams, JobseekerArchivedInterviewsLoaderData) -> compile-time consistency across layers.
- **Edge cases / constraints:** Pagination is normalized or bounded.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 41 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/jobseeker/types/job.type.ts`
- **File overview:** Contract module for `job type`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `JobListItemDto` (interface), `PublicJobsQueryParams` (interface), `JobsLoaderData` (interface), `JobDetailLoaderData` (type)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (JobListItemDto, PublicJobsQueryParams, JobsLoaderData) -> compile-time consistency across layers.
- **Edge cases / constraints:** Pagination is normalized or bounded.
- **Dependencies:** Uses @features/recruiter/types. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 19 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/jobseeker/types/profile.type.ts`
- **File overview:** Contract module for `profile type`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `JobseekerProfileDto` (interface), `JobseekerProfileUpdatePayload` (interface), `ProfileLoaderData` (type), `SavedJobsLoaderData` (type)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (JobseekerProfileDto, JobseekerProfileUpdatePayload, ProfileLoaderData) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses @features/jobseeker/types/dashboard.type. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 30 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/jobseeker/types/types.ts`
- **File overview:** Contract module for `types`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `ProfileFormState` (type), `PasswordFormState` (type), `PasswordVisibilityState` (type)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (ProfileFormState, PasswordFormState, PasswordVisibilityState) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 16 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## client/src/features/jobseeker/utils

### `client/src/features/jobseeker/utils/applicationActionRules.ts`
- **File overview:** Shared helper for `applicationActionRules` that packages reusable transformations or policy logic.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `getJobseekerListActions` (const), `canDeleteJobseekerHistory` (const), `canWithdrawJobseekerApplication` (const), `JobseekerListAction` (type), `JobseekerActionContext` (type)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (@shared/utils/applicationStatus) -> focused transformation -> outputs leave through getJobseekerListActions, canDeleteJobseekerHistory, canWithdrawJobseekerApplication.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses @shared/utils/applicationStatus. Used by client/src/features/jobseeker/pages/ApplicationsPage/components/ApplicationsTable.tsx, client/src/features/jobseeker/pages/OffersPage/components/OfferPipelineCard.tsx
- **Operational notes:** Approx. 34 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/jobseeker/utils/interviewMutationSync.ts`
- **File overview:** Shared helper for `interviewMutationSync` that packages reusable transformations or policy logic.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `publishJobseekerInterviewMutation` (const), `readLatestJobseekerInterviewMutation` (const), `subscribeJobseekerInterviewMutations` (const), `JobseekerInterviewMutationPayload` (interface), `JobseekerInterviewMutationType` (type)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (@features/jobseeker/types) -> focused transformation -> outputs leave through publishJobseekerInterviewMutation, readLatestJobseekerInterviewMutation, subscribeJobseekerInterviewMutations.
- **Edge cases / constraints:** Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses @features/jobseeker/types. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 75 lines. Side effects: local/session state changes

## client/src/features/recruiter/actions

### `client/src/features/recruiter/actions/cancelInterviewAction.ts`
- **File overview:** UI mutation helper for `cancelInterviewAction` that turns user intent into a typed request.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `cancelInterviewAction` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** User action -> payload shaping -> collaborator call (react-router-dom) -> mutation result back to the UI.
- **Edge cases / constraints:** Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react-router-dom. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 48 lines. Side effects: file uploads/form data

### `client/src/features/recruiter/actions/candidatesAction.ts`
- **File overview:** UI mutation helper for `candidatesAction` that turns user intent into a typed request.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `candidatesAction` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** User action -> payload shaping -> collaborator call (react-router-dom, @features/recruiter/types, @features/recruiter/service/recruiter.service, @features/recruiter/actions/utils) -> mutation result back to the UI.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react-router-dom, @features/recruiter/types, @features/recruiter/service/recruiter.service, @features/recruiter/actions/utils. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 105 lines. Side effects: file uploads/form data

### `client/src/features/recruiter/actions/createJobAction.ts`
- **File overview:** UI mutation helper for `createJobAction` that turns user intent into a typed request.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `createJobAction` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** User action -> payload shaping -> collaborator call (react-router-dom, @features/recruiter/service/recruiter.service, @shared/api/http, @features/recruiter/actions/jobPayload) -> mutation result back to the UI.
- **Edge cases / constraints:** Identity and access preconditions are enforced explicitly. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react-router-dom, @features/recruiter/service/recruiter.service, @shared/api/http, @features/recruiter/actions/jobPayload, @features/recruiter/utils/jobMutationSync. Used by client/src/features/recruiter/actions/updateJobAction.ts
- **Operational notes:** Approx. 47 lines. Side effects: redirect/navigation, file uploads/form data

### `client/src/features/recruiter/actions/deleteJobAction.ts`
- **File overview:** UI mutation helper for `deleteJobAction` that turns user intent into a typed request.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `deleteJobAction` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** User action -> payload shaping -> collaborator call (react-router-dom, @features/recruiter/service/recruiter.service, @shared/api/http, @features/recruiter/actions/utils) -> mutation result back to the UI.
- **Edge cases / constraints:** Identity and access preconditions are enforced explicitly. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react-router-dom, @features/recruiter/service/recruiter.service, @shared/api/http, @features/recruiter/actions/utils, @features/recruiter/utils/jobMutationSync. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 36 lines. Side effects: redirect/navigation

### `client/src/features/recruiter/actions/index.ts`
- **File overview:** UI mutation helper for `index` that turns user intent into a typed request.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** User action -> payload shaping -> collaborator call (framework/runtime deps) -> mutation result back to the UI.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 15 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/actions/jobPayload.ts`
- **File overview:** UI mutation helper for `jobPayload` that turns user intent into a typed request.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `normalizeJobStringArray` (const), `getJobPayload` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** User action -> payload shaping -> collaborator call (@features/recruiter/actions/utils) -> mutation result back to the UI.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. File payload shape and content metadata matter here.
- **Dependencies:** Uses @features/recruiter/actions/utils. Used by client/src/features/recruiter/actions/createJobAction.ts, client/src/features/recruiter/actions/updateJobAction.ts
- **Operational notes:** Approx. 39 lines. Side effects: file uploads/form data

### `client/src/features/recruiter/actions/updateCandidateAction.ts`
- **File overview:** UI mutation helper for `updateCandidateAction` that turns user intent into a typed request.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `updateCandidateAction` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** User action -> payload shaping -> collaborator call (react-router-dom, @features/recruiter/service/recruiter.service) -> mutation result back to the UI.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react-router-dom, @features/recruiter/service/recruiter.service. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 63 lines. Side effects: file uploads/form data

### `client/src/features/recruiter/actions/updateJobAction.ts`
- **File overview:** UI mutation helper for `updateJobAction` that turns user intent into a typed request.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `updateJobAction` (const), `upsertJobAction` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** User action -> payload shaping -> collaborator call (react-router-dom, @features/recruiter/actions/createJobAction, @features/recruiter/service/recruiter.service, @shared/api/http) -> mutation result back to the UI.
- **Edge cases / constraints:** Identity and access preconditions are enforced explicitly. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react-router-dom, @features/recruiter/actions/createJobAction, @features/recruiter/service/recruiter.service, @shared/api/http, @features/recruiter/actions/jobPayload, @features/recruiter/utils/jobMutationSync. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 62 lines. Side effects: redirect/navigation, file uploads/form data

### `client/src/features/recruiter/actions/updateJobStatusAction.ts`
- **File overview:** UI mutation helper for `updateJobStatusAction` that turns user intent into a typed request.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `updateJobStatusAction` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** User action -> payload shaping -> collaborator call (react-router-dom, @features/recruiter/service/recruiter.service, @shared/api/http, @features/recruiter/utils/jobMutationSync) -> mutation result back to the UI.
- **Edge cases / constraints:** Identity and access preconditions are enforced explicitly. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react-router-dom, @features/recruiter/service/recruiter.service, @shared/api/http, @features/recruiter/utils/jobMutationSync. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 43 lines. Side effects: redirect/navigation, file uploads/form data

### `client/src/features/recruiter/actions/upsertInterviewAction.ts`
- **File overview:** UI mutation helper for `upsertInterviewAction` that turns user intent into a typed request.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `upsertInterviewAction` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** User action -> payload shaping -> collaborator call (react-router-dom, @features/recruiter/types) -> mutation result back to the UI.
- **Edge cases / constraints:** Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react-router-dom, @features/recruiter/types. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 107 lines. Side effects: redirect/navigation, file uploads/form data

### `client/src/features/recruiter/actions/utils.ts`
- **File overview:** UI mutation helper for `utils` that turns user intent into a typed request.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `getString` (const), `getNum` (const), `getApiErrorMessage` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** User action -> payload shaping -> collaborator call (@shared/api/http) -> mutation result back to the UI.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. File payload shape and content metadata matter here. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses @shared/api/http. Used by client/src/features/recruiter/actions/candidatesAction.ts, client/src/features/recruiter/actions/deleteJobAction.ts, client/src/features/recruiter/actions/jobPayload.ts
- **Operational notes:** Approx. 34 lines. Side effects: file uploads/form data

## client/src/features/recruiter/components

### `client/src/features/recruiter/components/JobFilterDropdown.tsx`
- **File overview:** Presentation component for `JobFilterDropdown` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `JobFilterDropdown` (function)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (@shared/components/Dropdown) -> focused transformation -> outputs leave through JobFilterDropdown.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses @shared/components/Dropdown. Used by client/src/features/recruiter/pages/CandidatesPage/components/CandidatesFilters.tsx
- **Operational notes:** Approx. 55 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/components/RecruiterFieldLabel.tsx`
- **File overview:** Presentation component for `RecruiterFieldLabel` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `RecruiterFieldLabel` (const), `RecruiterFieldLabelProps` (interface)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react) -> focused transformation -> outputs leave through RecruiterFieldLabel, RecruiterFieldLabelProps.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react. Used by client/src/features/recruiter/components/RecruiterInputField.tsx, client/src/features/recruiter/components/RecruiterSelectField.tsx, client/src/features/recruiter/components/RecruiterTextareaField.tsx, client/src/features/recruiter/pages/JobFormPage/JobFormPage.tsx
- **Operational notes:** Approx. 16 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/components/RecruiterHeader.tsx`
- **File overview:** Presentation component for `RecruiterHeader` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `RecruiterHeader` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react-router-dom) -> focused transformation -> outputs leave through RecruiterHeader.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react-router-dom. Used by client/src/features/recruiter/pages/JobPostsPage/JobPostsPage.tsx, client/src/features/recruiter/pages/RecruiterDashboardPage/RecruiterDashboardPage.tsx
- **Operational notes:** Approx. 14 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/components/RecruiterInputField.tsx`
- **File overview:** Presentation component for `RecruiterInputField` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `RecruiterInputField` (const), `RecruiterInputFieldProps` (interface)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, @features/recruiter/components/RecruiterFieldLabel, @features/recruiter/components/recruiterForm.shared) -> focused transformation -> outputs leave through RecruiterInputField, RecruiterInputFieldProps.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react, @features/recruiter/components/RecruiterFieldLabel, @features/recruiter/components/recruiterForm.shared. Used by client/src/features/recruiter/pages/JobFormPage/JobFormPage.tsx
- **Operational notes:** Approx. 30 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/components/RecruiterLabeledField.tsx`
- **File overview:** Presentation component for `RecruiterLabeledField` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `RecruiterLabeledField` (const), `RecruiterLabeledFieldProps` (interface)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react) -> focused transformation -> outputs leave through RecruiterLabeledField, RecruiterLabeledFieldProps.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 17 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/components/RecruiterSectionCard.tsx`
- **File overview:** Presentation component for `RecruiterSectionCard` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `RecruiterSectionCard` (const), `RecruiterSectionCardProps` (interface)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, @shared/components/Card) -> focused transformation -> outputs leave through RecruiterSectionCard, RecruiterSectionCardProps.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react, @shared/components/Card. Used by client/src/features/recruiter/pages/CandidateDetailPage/CandidateDetailPage.tsx, client/src/features/recruiter/pages/JobFormPage/JobFormPage.tsx
- **Operational notes:** Approx. 44 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/components/RecruiterSelectField.tsx`
- **File overview:** Presentation component for `RecruiterSelectField` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `RecruiterSelectField` (const), `RecruiterSelectFieldProps` (interface)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, @features/recruiter/components/RecruiterFieldLabel, @features/recruiter/components/recruiterForm.shared) -> focused transformation -> outputs leave through RecruiterSelectField, RecruiterSelectFieldProps.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react, @features/recruiter/components/RecruiterFieldLabel, @features/recruiter/components/recruiterForm.shared. Used by client/src/features/recruiter/pages/CandidateDetailPage/components/OfferModal.tsx, client/src/features/recruiter/pages/JobFormPage/JobFormPage.tsx
- **Operational notes:** Approx. 25 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/components/RecruiterTextareaField.tsx`
- **File overview:** Presentation component for `RecruiterTextareaField` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `RecruiterTextareaField` (const), `RecruiterTextareaFieldProps` (interface)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, @features/recruiter/components/RecruiterFieldLabel, @features/recruiter/components/recruiterForm.shared) -> focused transformation -> outputs leave through RecruiterTextareaField, RecruiterTextareaFieldProps.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react, @features/recruiter/components/RecruiterFieldLabel, @features/recruiter/components/recruiterForm.shared. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 22 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/components/recruiterForm.shared.ts`
- **File overview:** Presentation component for `recruiterForm shared` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `recruiterInputClassName` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through recruiterInputClassName.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by client/src/features/recruiter/components/RecruiterInputField.tsx, client/src/features/recruiter/components/RecruiterSelectField.tsx, client/src/features/recruiter/components/RecruiterTextareaField.tsx, client/src/features/recruiter/pages/CandidateDetailPage/components/OfferModal.tsx, client/src/shared/components/PredictiveInput.tsx
- **Operational notes:** Approx. 3 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## client/src/features/recruiter/data

### `client/src/features/recruiter/data/storage.ts`
- **File overview:** Static data resource for `storage` used by runtime code.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `getRecruiterState` (const), `saveRecruiterState` (const), `withRecruiterState` (const), `createId` (const), `runAutomations` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (@shared/utils/storage) -> focused transformation -> outputs leave through getRecruiterState, saveRecruiterState, withRecruiterState.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses @shared/utils/storage. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 168 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## client/src/features/recruiter/hooks

### `client/src/features/recruiter/hooks/useSearchParamToast.ts`
- **File overview:** Reusable hook for `useSearchParamToast` state, effects, and event handling.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `useSearchParamToast` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (react) -> focused transformation -> outputs leave through useSearchParamToast.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 56 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## client/src/features/recruiter/index.ts

### `client/src/features/recruiter/index.ts`
- **File overview:** Maintained module `index` in the codebase.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through module exports.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 11 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## client/src/features/recruiter/loaders

### `client/src/features/recruiter/loaders/candidateDetailLoader.ts`
- **File overview:** Route-data loader for `candidateDetailLoader` that prepares screen state before render.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `recruiterCandidateDetailLoader` (const)
- **Business logic:** Validation and guard clauses protect downstream workflows from invalid state.
- **Data flow:** Navigation enters the route -> loader fetches/guards with react-router-dom, @features/recruiter/service/recruiter.service, @features/recruiter/loaders/utils -> preloaded data or redirect outcome returns.
- **Edge cases / constraints:** Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react-router-dom, @features/recruiter/service/recruiter.service, @features/recruiter/loaders/utils. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 34 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/loaders/candidatesLoader.ts`
- **File overview:** Route-data loader for `candidatesLoader` that prepares screen state before render.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `recruiterCandidatesLoader` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Navigation enters the route -> loader fetches/guards with react-router-dom, @features/recruiter/service/recruiter.service, @features/recruiter/loaders/utils -> preloaded data or redirect outcome returns.
- **Edge cases / constraints:** Pagination is normalized or bounded. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react-router-dom, @features/recruiter/service/recruiter.service, @features/recruiter/loaders/utils. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 91 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/loaders/dashboardLoader.ts`
- **File overview:** Route-data loader for `dashboardLoader` that prepares screen state before render.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `recruiterDashboardLoader` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Navigation enters the route -> loader fetches/guards with react-router-dom, @app/routes/protectedLoader, @features/recruiter/service/recruiter.service, @features/recruiter/types -> preloaded data or redirect outcome returns.
- **Edge cases / constraints:** Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react-router-dom, @app/routes/protectedLoader, @features/recruiter/service/recruiter.service, @features/recruiter/types, @features/recruiter/loaders/utils. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 60 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/loaders/hiredEmployeesLoader.ts`
- **File overview:** Route-data loader for `hiredEmployeesLoader` that prepares screen state before render.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `recruiterHiredEmployeesLoader` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Navigation enters the route -> loader fetches/guards with react-router-dom, @features/recruiter/service/recruiter.service, @features/recruiter/loaders/utils -> preloaded data or redirect outcome returns.
- **Edge cases / constraints:** Pagination is normalized or bounded. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react-router-dom, @features/recruiter/service/recruiter.service, @features/recruiter/loaders/utils. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 34 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/loaders/index.ts`
- **File overview:** Route-data loader for `index` that prepares screen state before render.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Navigation enters the route -> loader fetches/guards with framework/runtime deps -> preloaded data or redirect outcome returns.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 15 lines. Side effects: redirect/navigation

### `client/src/features/recruiter/loaders/interviewDetailLoader.ts`
- **File overview:** Route-data loader for `interviewDetailLoader` that prepares screen state before render.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `recruiterInterviewDetailLoader` (const)
- **Business logic:** Validation and guard clauses protect downstream workflows from invalid state.
- **Data flow:** Navigation enters the route -> loader fetches/guards with react-router-dom, @features/recruiter/services/interview.service, @features/recruiter/loaders/utils -> preloaded data or redirect outcome returns.
- **Edge cases / constraints:** Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react-router-dom, @features/recruiter/services/interview.service, @features/recruiter/loaders/utils. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 23 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/loaders/interviewsLoader.ts`
- **File overview:** Route-data loader for `interviewsLoader` that prepares screen state before render.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `recruiterInterviewsLoader` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Navigation enters the route -> loader fetches/guards with @features/recruiter/services/interview.service, @features/recruiter/loaders/utils -> preloaded data or redirect outcome returns.
- **Edge cases / constraints:** Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses @features/recruiter/services/interview.service, @features/recruiter/loaders/utils. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 11 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/loaders/jobDetailsLoader.ts`
- **File overview:** Route-data loader for `jobDetailsLoader` that prepares screen state before render.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `recruiterJobDetailLoader` (const)
- **Business logic:** Validation and guard clauses protect downstream workflows from invalid state.
- **Data flow:** Navigation enters the route -> loader fetches/guards with react-router-dom, @features/recruiter/service/recruiter.service, @features/recruiter/types, @features/recruiter/loaders/utils -> preloaded data or redirect outcome returns.
- **Edge cases / constraints:** Pagination is normalized or bounded. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react-router-dom, @features/recruiter/service/recruiter.service, @features/recruiter/types, @features/recruiter/loaders/utils. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 91 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/loaders/jobsLoader.ts`
- **File overview:** Route-data loader for `jobsLoader` that prepares screen state before render.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `recruiterJobsLoader` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Navigation enters the route -> loader fetches/guards with react-router-dom, @features/recruiter/service/recruiter.service, @features/recruiter/loaders/utils -> preloaded data or redirect outcome returns.
- **Edge cases / constraints:** Pagination is normalized or bounded. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react-router-dom, @features/recruiter/service/recruiter.service, @features/recruiter/loaders/utils. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 49 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/loaders/utils.ts`
- **File overview:** Route-data loader for `utils` that prepares screen state before render.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `rethrowAsRouteError` (const)
- **Business logic:** Validation and guard clauses protect downstream workflows from invalid state.
- **Data flow:** Navigation enters the route -> loader fetches/guards with react-router-dom, @shared/api/http -> preloaded data or redirect outcome returns.
- **Edge cases / constraints:** Identity and access preconditions are enforced explicitly. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react-router-dom, @shared/api/http. Used by client/src/features/recruiter/loaders/candidateDetailLoader.ts, client/src/features/recruiter/loaders/candidatesLoader.ts, client/src/features/recruiter/loaders/dashboardLoader.ts, client/src/features/recruiter/loaders/hiredEmployeesLoader.ts, client/src/features/recruiter/loaders/interviewDetailLoader.ts
- **Operational notes:** Approx. 30 lines. Side effects: redirect/navigation

## client/src/features/recruiter/pages

### `client/src/features/recruiter/pages/CandidateDetailPage/CandidateDetailPage.tsx`
- **File overview:** Route-level screen for `CandidateDetailPage` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `CandidateDetailPage` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, react-router-dom, @app/providers/AuthProvider, @app/providers/ToastProvider) -> focused transformation -> outputs leave through CandidateDetailPage.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react, react-router-dom, @app/providers/AuthProvider, @app/providers/ToastProvider, @features/admin/service/admin.service, @features/recruiter/components/RecruiterSectionCard. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 1293 lines. Side effects: local/session state changes

### `client/src/features/recruiter/pages/CandidateDetailPage/components/InterviewModal.tsx`
- **File overview:** Route-level screen for `InterviewModal` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `InterviewModal` (const), `InterviewFormValues` (interface), `InterviewModalProps` (interface)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, @shared/components/Button, @shared/components/SideDrawer, @shared/components/RichTextField) -> focused transformation -> outputs leave through InterviewModal, InterviewFormValues, InterviewModalProps.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react, @shared/components/Button, @shared/components/SideDrawer, @shared/components/RichTextField. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 232 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/pages/CandidateDetailPage/components/OfferModal.tsx`
- **File overview:** Route-level screen for `OfferModal` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `OFFER_EMPLOYMENT_TYPE_OPTIONS` (const), `OFFER_WORK_SETUP_OPTIONS` (const), `OFFER_SALARY_TYPE_OPTIONS` (const), `OFFER_CURRENCY_OPTIONS` (const), `offerEmploymentTypeRequiresEndDate` (const), `offerEmploymentTypeSupportsOptionalEndDate` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, lucide-react, @features/recruiter/components/RecruiterSelectField, @features/recruiter/components/recruiterForm.shared) -> focused transformation -> outputs leave through OFFER_EMPLOYMENT_TYPE_OPTIONS, OFFER_WORK_SETUP_OPTIONS, OFFER_SALARY_TYPE_OPTIONS.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses react, lucide-react, @features/recruiter/components/RecruiterSelectField, @features/recruiter/components/recruiterForm.shared, @shared/components/Button, @shared/components/ModalOverlay. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 394 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/pages/CandidateDetailPage/components/ProjectCard.tsx`
- **File overview:** Route-level screen for `ProjectCard` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `ProjectCard` (const), `ProjectCardProps` (interface)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (@features/recruiter/types) -> focused transformation -> outputs leave through ProjectCard, ProjectCardProps.
- **Edge cases / constraints:** Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses @features/recruiter/types. Used by client/src/features/recruiter/pages/CandidateDetailPage/CandidateDetailPage.tsx
- **Operational notes:** Approx. 37 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/pages/CandidateDetailPage/components/WorkExperienceCard.tsx`
- **File overview:** Route-level screen for `WorkExperienceCard` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `WorkExperienceCard` (const), `WorkExperienceCardProps` (interface)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (@features/recruiter/types) -> focused transformation -> outputs leave through WorkExperienceCard, WorkExperienceCardProps.
- **Edge cases / constraints:** Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses @features/recruiter/types. Used by client/src/features/recruiter/pages/CandidateDetailPage/CandidateDetailPage.tsx
- **Operational notes:** Approx. 45 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/pages/CandidatesPage/CandidatesPage.tsx`
- **File overview:** Route-level screen for `CandidatesPage` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `CandidatesPage` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, react-router-dom, @app/providers/ToastProvider, @features/recruiter/pages/CandidatesPage/components/BulkActionsBar) -> focused transformation -> outputs leave through CandidatesPage.
- **Edge cases / constraints:** Pagination is normalized or bounded. Input cleanup/normalization happens before comparison or persistence. File payload shape and content metadata matter here.
- **Dependencies:** Uses react, react-router-dom, @app/providers/ToastProvider, @features/recruiter/pages/CandidatesPage/components/BulkActionsBar, @features/recruiter/pages/CandidatesPage/components/CandidateListSkeleton, @features/recruiter/pages/CandidatesPage/components/CandidateStageTabs. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 464 lines. Side effects: cache reads/writes, redirect/navigation, local/session state changes, file uploads/form data

### `client/src/features/recruiter/pages/CandidatesPage/components/BulkActionsBar.tsx`
- **File overview:** Route-level screen for `BulkActionsBar` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `BulkActionsBar` (const), `BulkActionsBarProps` (interface)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (@shared/utils/cn, @features/recruiter/types) -> focused transformation -> outputs leave through BulkActionsBar, BulkActionsBarProps.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses @shared/utils/cn, @features/recruiter/types. Used by client/src/features/recruiter/pages/CandidatesPage/CandidatesPage.tsx
- **Operational notes:** Approx. 54 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/pages/CandidatesPage/components/CandidateListSkeleton.tsx`
- **File overview:** Route-level screen for `CandidateListSkeleton` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `CandidateListSkeleton` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (@shared/components/skeletons/TableRowsSkeleton) -> focused transformation -> outputs leave through CandidateListSkeleton.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses @shared/components/skeletons/TableRowsSkeleton. Used by client/src/features/recruiter/pages/CandidatesPage/CandidatesPage.tsx
- **Operational notes:** Approx. 8 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/pages/CandidatesPage/components/CandidateStageTabs.tsx`
- **File overview:** Route-level screen for `CandidateStageTabs` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `CandidateStageTabs` (const), `CandidateStageTabsProps` (interface)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, react-router-dom, @features/recruiter/types, @shared/utils/applicationStatus) -> focused transformation -> outputs leave through CandidateStageTabs, CandidateStageTabsProps.
- **Edge cases / constraints:** Pagination is normalized or bounded.
- **Dependencies:** Uses react, react-router-dom, @features/recruiter/types, @shared/utils/applicationStatus. Used by client/src/features/recruiter/pages/CandidatesPage/CandidatesPage.tsx
- **Operational notes:** Approx. 93 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/pages/CandidatesPage/components/CandidatesFilters.tsx`
- **File overview:** Route-level screen for `CandidatesFilters` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `CandidatesFilters` (const), `CandidatesFiltersProps` (interface)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, react-router-dom, @features/recruiter/components/JobFilterDropdown, @features/recruiter/types) -> focused transformation -> outputs leave through CandidatesFilters, CandidatesFiltersProps.
- **Edge cases / constraints:** Pagination is normalized or bounded.
- **Dependencies:** Uses react, react-router-dom, @features/recruiter/components/JobFilterDropdown, @features/recruiter/types, @shared/components/Dropdown, @shared/hooks/useDebounce. Used by client/src/features/recruiter/pages/CandidatesPage/CandidatesPage.tsx
- **Operational notes:** Approx. 109 lines. Side effects: local/session state changes

### `client/src/features/recruiter/pages/CandidatesPage/components/CandidatesTable.tsx`
- **File overview:** Route-level screen for `CandidatesTable` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `CandidatesTable` (const), `CandidatesTableProps` (interface)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, lucide-react, react-router-dom, @features/recruiter/types) -> focused transformation -> outputs leave through CandidatesTable, CandidatesTableProps.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses react, lucide-react, react-router-dom, @features/recruiter/types, @shared/components/ActionButton, @shared/components/Checkbox. Used by client/src/features/recruiter/pages/CandidatesPage/CandidatesPage.tsx
- **Operational notes:** Approx. 261 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/pages/HiredEmployeesPage/HiredEmployeesPage.tsx`
- **File overview:** Route-level screen for `HiredEmployeesPage` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `HiredEmployeesPage` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (lucide-react, react-router-dom, @features/recruiter/types, @shared/components/Card) -> focused transformation -> outputs leave through HiredEmployeesPage.
- **Edge cases / constraints:** Pagination is normalized or bounded. File payload shape and content metadata matter here.
- **Dependencies:** Uses lucide-react, react-router-dom, @features/recruiter/types, @shared/components/Card, @shared/components/ActionButton, @shared/components/DepartmentCell. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 160 lines. Side effects: file uploads/form data

### `client/src/features/recruiter/pages/InterviewFormPage/InterviewFormPage.tsx`
- **File overview:** Route-level screen for `InterviewFormPage` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `InterviewFormPage` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, react-router-dom, @app/providers/ToastProvider, @shared/hooks/useConfirmation) -> focused transformation -> outputs leave through InterviewFormPage.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react, react-router-dom, @app/providers/ToastProvider, @shared/hooks/useConfirmation, @features/recruiter/services/interview.service, @shared/components/Card. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 417 lines. Side effects: local/session state changes

### `client/src/features/recruiter/pages/InterviewFormPage/components/InterviewCalendar.tsx`
- **File overview:** Route-level screen for `InterviewCalendar` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `InterviewCalendar` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, lucide-react, @fullcalendar/react, @fullcalendar/daygrid) -> focused transformation -> outputs leave through InterviewCalendar.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react, lucide-react, @fullcalendar/react, @fullcalendar/daygrid, @fullcalendar/timegrid, @fullcalendar/interaction. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 527 lines. Side effects: redirect/navigation, local/session state changes

### `client/src/features/recruiter/pages/InterviewFormPage/components/InterviewCard.tsx`
- **File overview:** Route-level screen for `InterviewCard` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `InterviewCard` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (@features/recruiter/types/interview.types, @shared/utils/calendar, @shared/utils/notifications) -> focused transformation -> outputs leave through InterviewCard.
- **Edge cases / constraints:** Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses @features/recruiter/types/interview.types, @shared/utils/calendar, @shared/utils/notifications. Used by client/src/features/recruiter/pages/InterviewFormPage/components/InterviewList.tsx
- **Operational notes:** Approx. 169 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/pages/InterviewFormPage/components/InterviewList.tsx`
- **File overview:** Route-level screen for `InterviewList` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `InterviewList` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, @features/recruiter/types/interview.types, @shared/components/Card, ./InterviewCard) -> focused transformation -> outputs leave through InterviewList.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react, @features/recruiter/types/interview.types, @shared/components/Card, ./InterviewCard. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 96 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/pages/InterviewFormPage/components/InterviewSchedulerForm.tsx`
- **File overview:** Route-level screen for `InterviewSchedulerForm` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `InterviewSchedulerForm` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, @features/recruiter/types, @features/recruiter/service/recruiter.service, @features/recruiter/services/interview.service) -> focused transformation -> outputs leave through InterviewSchedulerForm.
- **Edge cases / constraints:** Pagination is normalized or bounded. Input cleanup/normalization happens before comparison or persistence. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react, @features/recruiter/types, @features/recruiter/service/recruiter.service, @features/recruiter/services/interview.service, @shared/components/Button, @shared/components/RichTextField. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 620 lines. Side effects: local/session state changes

### `client/src/features/recruiter/pages/JobDetailPage/JobDetailPage.tsx`
- **File overview:** Route-level screen for `JobDetailPage` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `JobDetailPage` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, react-router-dom, lucide-react, @app/providers/ToastProvider) -> focused transformation -> outputs leave through JobDetailPage.
- **Edge cases / constraints:** Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react, react-router-dom, lucide-react, @app/providers/ToastProvider, @features/recruiter/pages/JobDetailPage/components/ApplicantsCard, @features/recruiter/pages/JobDetailPage/components/ApplicantsTrendCard. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 337 lines. Side effects: redirect/navigation, local/session state changes

### `client/src/features/recruiter/pages/JobDetailPage/components/ApplicantsCard.tsx`
- **File overview:** Route-level screen for `ApplicantsCard` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `ApplicantsCard` (const), `ApplicantsCardProps` (interface)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react-router-dom, @features/recruiter/types, @shared/components/Card, @shared/components/StatusBadge) -> focused transformation -> outputs leave through ApplicantsCard, ApplicantsCardProps.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react-router-dom, @features/recruiter/types, @shared/components/Card, @shared/components/StatusBadge. Used by client/src/features/recruiter/pages/JobDetailPage/JobDetailPage.tsx
- **Operational notes:** Approx. 32 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/pages/JobDetailPage/components/ApplicantsTrendCard.tsx`
- **File overview:** Route-level screen for `ApplicantsTrendCard` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `ApplicantsTrendCard` (const), `ApplicantsTrendCardProps` (interface)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (@features/recruiter/types, @shared/components/Card, @shared/components/DashboardAreaChart) -> focused transformation -> outputs leave through ApplicantsTrendCard, ApplicantsTrendCardProps.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses @features/recruiter/types, @shared/components/Card, @shared/components/DashboardAreaChart. Used by client/src/features/recruiter/pages/JobDetailPage/JobDetailPage.tsx
- **Operational notes:** Approx. 35 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/pages/JobDetailPage/components/BulletList.tsx`
- **File overview:** Route-level screen for `BulletList` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `BulletList` (const), `BulletListProps` (interface)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through BulletList, BulletListProps.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by client/src/features/recruiter/pages/JobDetailPage/JobDetailPage.tsx
- **Operational notes:** Approx. 13 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/pages/JobDetailPage/components/MetadataBadge.tsx`
- **File overview:** Route-level screen for `MetadataBadge` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `MetadataBadge` (const), `MetadataBadgeProps` (interface)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react) -> focused transformation -> outputs leave through MetadataBadge, MetadataBadgeProps.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses react. Used by client/src/features/recruiter/pages/JobDetailPage/JobDetailPage.tsx
- **Operational notes:** Approx. 15 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/pages/JobDetailPage/components/SkillList.tsx`
- **File overview:** Route-level screen for `SkillList` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `SkillList` (const), `SkillListProps` (interface)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through SkillList, SkillListProps.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 24 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/pages/JobFormPage/JobFormPage.tsx`
- **File overview:** Route-level screen for `JobFormPage` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `JobFormPage` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, react-router-dom, @features/recruiter/components/RecruiterFieldLabel, @features/recruiter/components/RecruiterInputField) -> focused transformation -> outputs leave through JobFormPage.
- **Edge cases / constraints:** Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react, react-router-dom, @features/recruiter/components/RecruiterFieldLabel, @features/recruiter/components/RecruiterInputField, @features/recruiter/components/RecruiterSectionCard, @features/recruiter/components/RecruiterSelectField. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 259 lines. Side effects: local/session state changes

### `client/src/features/recruiter/pages/JobPostsPage/JobPostsPage.tsx`
- **File overview:** Route-level screen for `JobPostsPage` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `JobPostsPage` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, lucide-react, react-router-dom, @app/providers/ToastProvider) -> focused transformation -> outputs leave through JobPostsPage.
- **Edge cases / constraints:** Pagination is normalized or bounded. Input cleanup/normalization happens before comparison or persistence. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react, lucide-react, react-router-dom, @app/providers/ToastProvider, @features/recruiter/components/RecruiterHeader, @features/recruiter/pages/JobPostsPage/components/JobPostsFilters. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 370 lines. Side effects: redirect/navigation, local/session state changes

### `client/src/features/recruiter/pages/JobPostsPage/components/JobListSkeleton.tsx`
- **File overview:** Route-level screen for `JobListSkeleton` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `JobListSkeleton` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (@shared/components/skeletons/TableRowsSkeleton) -> focused transformation -> outputs leave through JobListSkeleton.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses @shared/components/skeletons/TableRowsSkeleton. Used by client/src/features/recruiter/pages/JobPostsPage/JobPostsPage.tsx
- **Operational notes:** Approx. 8 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/pages/JobPostsPage/components/JobPostsFilters.tsx`
- **File overview:** Route-level screen for `JobPostsFilters` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `JobPostsFilters` (const), `JobPostsFiltersProps` (interface)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through JobPostsFilters, JobPostsFiltersProps.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by client/src/features/recruiter/pages/JobPostsPage/JobPostsPage.tsx
- **Operational notes:** Approx. 51 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/pages/JobPostsPage/components/JobPostsTable.tsx`
- **File overview:** Route-level screen for `JobPostsTable` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `JobPostsTable` (const), `JobPostsTableProps` (interface)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (lucide-react, react-router-dom, @features/recruiter/types, @shared/components/ActionButton) -> focused transformation -> outputs leave through JobPostsTable, JobPostsTableProps.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses lucide-react, react-router-dom, @features/recruiter/types, @shared/components/ActionButton, @shared/components/DepartmentCell, @shared/components/EmploymentTypeCell. Used by client/src/features/recruiter/pages/JobPostsPage/JobPostsPage.tsx
- **Operational notes:** Approx. 136 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/pages/RecruiterDashboardPage/RecruiterDashboardPage.tsx`
- **File overview:** Route-level screen for `RecruiterDashboardPage` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `RecruiterDashboardPage` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, react-router-dom, @features/recruiter/components/RecruiterHeader, @features/recruiter/pages/RecruiterDashboardPage/components/DashboardFilters) -> focused transformation -> outputs leave through RecruiterDashboardPage.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses react, react-router-dom, @features/recruiter/components/RecruiterHeader, @features/recruiter/pages/RecruiterDashboardPage/components/DashboardFilters, @features/recruiter/pages/RecruiterDashboardPage/components/MetricCard, @features/recruiter/pages/RecruiterDashboardPage/components/RecruiterDashboardSkeleton. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 414 lines. Side effects: redirect/navigation, local/session state changes

### `client/src/features/recruiter/pages/RecruiterDashboardPage/components/DashboardFilters.tsx`
- **File overview:** Route-level screen for `DashboardFilters` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `DashboardFilters` (const), `DashboardFiltersValue` (interface), `DashboardFiltersProps` (interface)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (@shared/components/DatePicker, @shared/components/Dropdown) -> focused transformation -> outputs leave through DashboardFilters, DashboardFiltersValue, DashboardFiltersProps.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses @shared/components/DatePicker, @shared/components/Dropdown. Used by client/src/features/recruiter/pages/RecruiterDashboardPage/RecruiterDashboardPage.tsx
- **Operational notes:** Approx. 80 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/pages/RecruiterDashboardPage/components/MetricCard.tsx`
- **File overview:** Route-level screen for `MetricCard` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `MetricCard` (const), `MetricCardProps` (interface)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (lucide-react, @shared/components/Card) -> focused transformation -> outputs leave through MetricCard, MetricCardProps.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses lucide-react, @shared/components/Card. Used by client/src/features/recruiter/pages/RecruiterDashboardPage/RecruiterDashboardPage.tsx
- **Operational notes:** Approx. 40 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/pages/RecruiterDashboardPage/components/RecruiterDashboardSkeleton.tsx`
- **File overview:** Route-level screen for `RecruiterDashboardSkeleton` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `RecruiterDashboardSkeleton` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (@shared/components/skeletons/SkeletonBlock) -> focused transformation -> outputs leave through RecruiterDashboardSkeleton.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses @shared/components/skeletons/SkeletonBlock. Used by client/src/features/recruiter/pages/RecruiterDashboardPage/RecruiterDashboardPage.tsx
- **Operational notes:** Approx. 66 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/pages/RecruiterDashboardPage/components/TrendChartCard.tsx`
- **File overview:** Route-level screen for `TrendChartCard` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `TrendChartCard` (const), `TrendChartCardProps` (interface)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, lucide-react, @features/recruiter/types, @shared/components/Card) -> focused transformation -> outputs leave through TrendChartCard, TrendChartCardProps.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react, lucide-react, @features/recruiter/types, @shared/components/Card, @shared/components/DashboardAreaChart, @shared/components/DashboardPrimitives. Used by client/src/features/recruiter/pages/RecruiterDashboardPage/RecruiterDashboardPage.tsx
- **Operational notes:** Approx. 148 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## client/src/features/recruiter/service

### `client/src/features/recruiter/service/recruiter.service.ts`
- **File overview:** Service boundary for `recruiter service` that centralizes operations and side effects for callers.
- **Responsibilities:** Business/application boundary: validation, orchestration, persistence, and side effects.
- **Key functions / classes:** `recruiterService` (const), `RecruiterProfileUpdatePayload` (interface), `RecruiterJobPayload` (interface), `RecruiterJobsQueryParams` (interface), `ApplicantScoresQueryParams` (interface), `UpdateApplicantStatusesPayload` (interface)
- **Business logic:** This file appears to own or coordinate a feature workflow. It keeps validation, orchestration, and side effects out of callers.
- **Data flow:** Callers invoke service methods -> this module coordinates @shared/api/http -> results leave through recruiterService, RecruiterProfileUpdatePayload, RecruiterJobPayload.
- **Edge cases / constraints:** Pagination is normalized or bounded.
- **Dependencies:** Uses @shared/api/http. Used by client/src/features/recruiter/actions/candidatesAction.ts, client/src/features/recruiter/actions/createJobAction.ts, client/src/features/recruiter/actions/deleteJobAction.ts, client/src/features/recruiter/actions/updateCandidateAction.ts, client/src/features/recruiter/actions/updateJobAction.ts
- **Operational notes:** Approx. 202 lines. Side effects: HTTP/API calls, file uploads/form data

## client/src/features/recruiter/services

### `client/src/features/recruiter/services/interview.service.ts`
- **File overview:** Service boundary for `interview service` that centralizes operations and side effects for callers.
- **Responsibilities:** Business/application boundary: validation, orchestration, persistence, and side effects.
- **Key functions / classes:** `recruiterInterviewService` (const)
- **Business logic:** This file appears to own or coordinate a feature workflow. It keeps validation, orchestration, and side effects out of callers.
- **Data flow:** Callers invoke service methods -> this module coordinates @shared/api/http -> results leave through recruiterInterviewService.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses @shared/api/http. Used by client/src/features/recruiter/loaders/interviewDetailLoader.ts, client/src/features/recruiter/loaders/interviewsLoader.ts, client/src/features/recruiter/pages/InterviewFormPage/InterviewFormPage.tsx, client/src/features/recruiter/pages/InterviewFormPage/components/InterviewSchedulerForm.tsx
- **Operational notes:** Approx. 142 lines. Side effects: HTTP/API calls

## client/src/features/recruiter/types

### `client/src/features/recruiter/types/automation.type.ts`
- **File overview:** Contract module for `automation type`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `AutomationRule` (interface), `AutomationAuditLog` (interface), `AutomationOutboxEmail` (interface), `AutomationTrigger` (type)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (AutomationRule, AutomationAuditLog, AutomationOutboxEmail) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses @features/recruiter/types/candidate.type. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 42 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/types/candidate.type.ts`
- **File overview:** Contract module for `candidate type`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `OfferDto` (interface), `RecruiterCandidate` (interface), `ApplicantScoreItemDto` (interface), `ParsedResumeProjectDto` (interface), `ParsedResumeWorkExperienceDto` (interface), `ParsedResumeEducationDto` (interface)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (OfferDto, RecruiterCandidate, ApplicantScoreItemDto) -> compile-time consistency across layers.
- **Edge cases / constraints:** Pagination is normalized or bounded. Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses Framework/runtime only.. Used by client/src/features/recruiter/types/automation.type.ts, client/src/features/recruiter/types/recruiter-state.type.ts
- **Operational notes:** Approx. 281 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/types/dashboard.type.ts`
- **File overview:** Contract module for `dashboard type`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `DashboardMetric` (interface), `DashboardTrendDataset` (interface), `DashboardDto` (interface), `DashboardGroupBy` (type), `DashboardQuickRange` (type)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (DashboardMetric, DashboardTrendDataset, DashboardDto) -> compile-time consistency across layers.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 38 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/types/index.ts`
- **File overview:** Contract module for `index`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (module exports) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by client/src/features/jobseeker/types/application.type.ts, client/src/features/jobseeker/types/job.type.ts, client/src/features/recruiter/actions/candidatesAction.ts, client/src/features/recruiter/actions/upsertInterviewAction.ts, client/src/features/recruiter/loaders/dashboardLoader.ts
- **Operational notes:** Approx. 8 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/types/interview.type.ts`
- **File overview:** Contract module for `interview type`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `RecruiterInterview` (interface), `InterviewStatus` (type)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (RecruiterInterview, InterviewStatus) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by client/src/features/recruiter/types/recruiter-state.type.ts
- **Operational notes:** Approx. 14 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/types/interview.types.ts`
- **File overview:** Contract module for `interview types`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `Interview` (interface), `ShortlistedCandidateOption` (interface), `ScheduleInterviewInput` (interface), `CancelInterviewInput` (interface), `RescheduleInterviewInput` (interface), `InterviewStatus` (type)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (Interview, ShortlistedCandidateOption, ScheduleInterviewInput) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by client/src/features/recruiter/pages/InterviewFormPage/components/InterviewCard.tsx, client/src/features/recruiter/pages/InterviewFormPage/components/InterviewList.tsx
- **Operational notes:** Approx. 62 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/types/job.type.ts`
- **File overview:** Contract module for `job type`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `JobDescriptionSections` (interface), `RecruiterJob` (interface), `JobDto` (interface), `RecruiterProfileDto` (interface), `JobListItem` (interface), `JobListFilters` (interface)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (JobDescriptionSections, RecruiterJob, JobDto) -> compile-time consistency across layers.
- **Edge cases / constraints:** Pagination is normalized or bounded.
- **Dependencies:** Uses Framework/runtime only.. Used by client/src/features/recruiter/types/recruiter-state.type.ts
- **Operational notes:** Approx. 112 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/types/paged.type.ts`
- **File overview:** Contract module for `paged type`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `Paged` (interface)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (Paged) -> compile-time consistency across layers.
- **Edge cases / constraints:** Pagination is normalized or bounded.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 7 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/types/recruiter-state.type.ts`
- **File overview:** Contract module for `recruiter state type`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `RecruiterState` (interface)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (RecruiterState) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses @features/recruiter/types/candidate.type, @features/recruiter/types/interview.type, @features/recruiter/types/job.type, @features/recruiter/types/settings.type. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 19 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/types/settings.type.ts`
- **File overview:** Contract module for `settings type`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `DayHours` (interface), `RecruiterSettings` (interface)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (DayHours, RecruiterSettings) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by client/src/features/recruiter/types/recruiter-state.type.ts
- **Operational notes:** Approx. 17 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## client/src/features/recruiter/utils

### `client/src/features/recruiter/utils/candidateStageRules.ts`
- **File overview:** Shared helper for `candidateStageRules` that packages reusable transformations or policy logic.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `canShortlistCandidate` (const), `getShortlistWarningMessage` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (@features/recruiter/types) -> focused transformation -> outputs leave through canShortlistCandidate, getShortlistWarningMessage.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses @features/recruiter/types. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 25 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/features/recruiter/utils/jobMutationSync.ts`
- **File overview:** Shared helper for `jobMutationSync` that packages reusable transformations or policy logic.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `toJobListItem` (const), `publishRecruiterJobMutation` (const), `readLatestRecruiterJobMutation` (const), `subscribeRecruiterJobMutations` (const), `jobMatchesCurrentFilters` (const), `applyRecruiterJobMutation` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (@features/recruiter/types, @shared/utils/search) -> focused transformation -> outputs leave through toJobListItem, publishRecruiterJobMutation, readLatestRecruiterJobMutation.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses @features/recruiter/types, @shared/utils/search. Used by client/src/features/recruiter/actions/createJobAction.ts, client/src/features/recruiter/actions/deleteJobAction.ts, client/src/features/recruiter/actions/updateJobAction.ts, client/src/features/recruiter/actions/updateJobStatusAction.ts
- **Operational notes:** Approx. 126 lines. Side effects: local/session state changes

## client/src/index.css

### `client/src/index.css`
- **File overview:** Maintained module `index` in the codebase.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through module exports.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by client/src/main.tsx
- **Operational notes:** Approx. 534 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## client/src/main.tsx

### `client/src/main.tsx`
- **File overview:** Maintained module `main` in the codebase.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (react, react-dom/client, @app/App, react-loading-skeleton/dist/skeleton.css) -> focused transformation -> outputs leave through module exports.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react, react-dom/client, @app/App, react-loading-skeleton/dist/skeleton.css, ./index.css. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 16 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## client/src/shared/Readme.md

### `client/src/shared/Readme.md`
- **File overview:** Human-facing project documentation for the surrounding module.
- **Responsibilities:** Existing human-facing documentation.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** No direct business rules live here. Its value is operational clarity, reproducible environments, or developer guidance.
- **Data flow:** Maintainers update this file -> tooling, environments, or readers consume it -> downstream runtime behavior stays consistent without feature code changes.
- **Edge cases / constraints:** Constraints are operational rather than domain-driven: syntax, environment compatibility, and maintainability matter most.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 0 lines. Side effects: Operational/configuration only.

## client/src/shared/api

### `client/src/shared/api/backendReadiness.ts`
- **File overview:** Maintained module `backendReadiness` in the codebase.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `ensureBackendReadiness` (const)
- **Business logic:** Validation and guard clauses protect downstream workflows from invalid state.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through ensureBackendReadiness.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses Framework/runtime only.. Used by client/src/shared/hooks/useBackendWakeIndicator.ts
- **Operational notes:** Approx. 66 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/api/backendWakeStore.ts`
- **File overview:** Maintained module `backendWakeStore` in the codebase.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `beginBackendReadinessProbe` (const), `completeBackendReadinessProbe` (const), `getBackendWakeSnapshot` (const), `subscribeToBackendWake` (const), `BackendWakeSnapshot` (interface)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through beginBackendReadinessProbe, completeBackendReadinessProbe, getBackendWakeSnapshot.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 86 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/api/http.ts`
- **File overview:** Central HTTP transport with scope headers and token refresh retry logic.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `http` (const), `setActiveCompanyHeader` (const), `setActiveRecruiterProfileHeader` (const), `ApiError` (class)
- **Business logic:** It keeps concurrent 401 handling safe by sharing one refresh request and injecting active company/profile context at the transport layer.
- **Data flow:** Inputs arrive through callers and dependencies (axios) -> focused transformation -> outputs leave through http, setActiveCompanyHeader, setActiveRecruiterProfileHeader.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses axios. Used by client/src/app/providers/AuthProvider.tsx, client/src/app/providers/CurrentCompanyProvider.tsx, client/src/app/providers/SetupProvider.tsx, client/src/features/admin/pages/CompanyAdminDashboardPage.tsx, client/src/features/admin/pages/SuperAdminDashboardPage.tsx
- **Operational notes:** Approx. 168 lines. Side effects: HTTP/API calls

## client/src/shared/components

### `client/src/shared/components/ActionButton.tsx`
- **File overview:** Presentation component for `ActionButton` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through module exports.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by client/src/features/admin/pages/CompanyAdminEmployeesPage.tsx, client/src/features/jobseeker/pages/ApplicationsPage/components/ApplicationsTable.tsx, client/src/features/jobseeker/pages/ArchivedApplicationsPage/ArchivedApplicationsPage.tsx, client/src/features/jobseeker/pages/ArchivedInterviewsPage/ArchivedInterviewsPage.tsx, client/src/features/jobseeker/pages/OffersPage/components/OfferPipelineCard.tsx
- **Operational notes:** Approx. 6 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/components/AppLoadingScreen.tsx`
- **File overview:** Presentation component for `AppLoadingScreen` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `AppLoadingScreen` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (@shared/pages/AtsWakeLoaderSurface) -> focused transformation -> outputs leave through AppLoadingScreen.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses @shared/pages/AtsWakeLoaderSurface. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 7 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/components/Avatar.tsx`
- **File overview:** Presentation component for `Avatar` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `Avatar` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (@shared/utils/cn, @shared/utils/avatar) -> focused transformation -> outputs leave through Avatar.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses @shared/utils/cn, @shared/utils/avatar. Used by client/src/features/admin/pages/CompanyAdminDashboardPage.tsx, client/src/features/admin/pages/SuperAdminDashboardPage.tsx, client/src/shared/components/Topbar.tsx, client/src/shared/components/ui/data-table/IdentityCell.tsx
- **Operational notes:** Approx. 37 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/components/Badge.tsx`
- **File overview:** Presentation component for `Badge` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `Badge` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react) -> focused transformation -> outputs leave through Badge.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react. Used by client/src/features/admin/components/AdminCompaniesTableCard.tsx, client/src/features/admin/components/AdminCompanyAdminsTableCard.tsx, client/src/features/admin/components/AdminRecruitersTableCard.tsx, client/src/features/admin/components/AdminUsersTableCard.tsx, client/src/features/admin/pages/CompanyAdminDashboardPage.tsx
- **Operational notes:** Approx. 7 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/components/Button.tsx`
- **File overview:** Presentation component for `Button` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through module exports.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by client/src/features/admin/components/AdminCompaniesTableCard.tsx, client/src/features/admin/components/AdminCompanyAdminsTableCard.tsx, client/src/features/admin/components/AdminRecruitersTableCard.tsx, client/src/features/admin/components/AdminUsersTableCard.tsx, client/src/features/admin/components/CreateCompanyModal.tsx
- **Operational notes:** Approx. 1 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/components/Card.tsx`
- **File overview:** Presentation component for `Card` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `Card` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, @shared/utils/cn) -> focused transformation -> outputs leave through Card.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react, @shared/utils/cn. Used by client/src/features/admin/AdminPlaceholderPage.tsx, client/src/features/admin/components/AdminMetricCard.tsx, client/src/features/admin/pages/CompanyAdminDashboardPage.tsx, client/src/features/admin/pages/CompanyAdminEmployeesPage.tsx, client/src/features/admin/pages/SuperAdminCompanyAdminsPage.tsx
- **Operational notes:** Approx. 11 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/components/Checkbox.tsx`
- **File overview:** Presentation component for `Checkbox` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `Checkbox` (const), `CheckboxProps` (type)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, lucide-react, @shared/utils/cn) -> focused transformation -> outputs leave through Checkbox, CheckboxProps.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react, lucide-react, @shared/utils/cn. Used by client/src/features/recruiter/pages/CandidatesPage/components/CandidatesTable.tsx
- **Operational notes:** Approx. 49 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/components/ConfirmationModal.tsx`
- **File overview:** Presentation component for `ConfirmationModal` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through module exports.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by client/src/shared/hooks/useConfirmation.tsx
- **Operational notes:** Approx. 1 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/components/DashboardAreaChart.tsx`
- **File overview:** Presentation component for `DashboardAreaChart` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `DashboardAreaChart` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react-chartjs-2, @app/providers/ThemeProvider) -> focused transformation -> outputs leave through DashboardAreaChart.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react-chartjs-2, @app/providers/ThemeProvider. Used by client/src/features/jobseeker/pages/DashboardPage/DashboardPage.tsx, client/src/features/recruiter/pages/JobDetailPage/components/ApplicantsTrendCard.tsx, client/src/features/recruiter/pages/RecruiterDashboardPage/components/TrendChartCard.tsx
- **Operational notes:** Approx. 75 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/components/DashboardGreeting.tsx`
- **File overview:** Presentation component for `DashboardGreeting` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `DashboardGreeting` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, react, lucide-react, lucide-react) -> focused transformation -> outputs leave through DashboardGreeting.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses react, react, lucide-react, lucide-react, @app/providers/AuthProvider, @shared/utils/cn. Used by client/src/features/admin/pages/SuperAdminDashboardPage.tsx, client/src/features/jobseeker/pages/DashboardPage/DashboardPage.tsx, client/src/features/recruiter/pages/RecruiterDashboardPage/RecruiterDashboardPage.tsx
- **Operational notes:** Approx. 103 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/components/DashboardPrimitives.tsx`
- **File overview:** Presentation component for `DashboardPrimitives` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `DashboardPageHeader` (const), `DashboardStatCard` (const), `DashboardSectionCard` (const), `DashboardEmptyState` (const), `DashboardRankItem` (const), `DashboardListLink` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, lucide-react, react-router-dom, @shared/components/Card) -> focused transformation -> outputs leave through DashboardPageHeader, DashboardStatCard, DashboardSectionCard.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react, lucide-react, react-router-dom, @shared/components/Card, @shared/utils/cn. Used by client/src/features/admin/pages/SuperAdminCompanyAdminsPage.tsx, client/src/features/admin/pages/SuperAdminRecruitersPage.tsx, client/src/features/admin/pages/SuperAdminUsersPage.tsx, client/src/features/recruiter/pages/RecruiterDashboardPage/components/TrendChartCard.tsx
- **Operational notes:** Approx. 197 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/components/DatePicker.tsx`
- **File overview:** Presentation component for `DatePicker` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (lucide-react, react) -> focused transformation -> outputs leave through module exports.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses lucide-react, react. Used by client/src/features/recruiter/pages/RecruiterDashboardPage/components/DashboardFilters.tsx
- **Operational notes:** Approx. 164 lines. Side effects: local/session state changes

### `client/src/shared/components/DepartmentCell.tsx`
- **File overview:** Presentation component for `DepartmentCell` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `DepartmentCell` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (@shared/utils/cn, @shared/utils/departmentIcons) -> focused transformation -> outputs leave through DepartmentCell.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses @shared/utils/cn, @shared/utils/departmentIcons. Used by client/src/features/admin/pages/CompanyAdminEmployeesPage.tsx, client/src/features/recruiter/pages/HiredEmployeesPage/HiredEmployeesPage.tsx, client/src/features/recruiter/pages/JobPostsPage/components/JobPostsTable.tsx
- **Operational notes:** Approx. 31 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/components/DetailBlock.tsx`
- **File overview:** Presentation component for `DetailBlock` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `DetailBlock` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react) -> focused transformation -> outputs leave through DetailBlock.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react. Used by client/src/features/jobseeker/pages/JobDetailPage/JobDetailPage.tsx
- **Operational notes:** Approx. 14 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/components/Dropdown.tsx`
- **File overview:** Presentation component for `Dropdown` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through module exports.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by client/src/features/jobseeker/pages/DashboardPage/DashboardPage.tsx, client/src/features/recruiter/components/JobFilterDropdown.tsx, client/src/features/recruiter/pages/CandidatesPage/components/CandidatesFilters.tsx, client/src/features/recruiter/pages/RecruiterDashboardPage/components/DashboardFilters.tsx, client/src/features/recruiter/pages/RecruiterDashboardPage/components/TrendChartCard.tsx
- **Operational notes:** Approx. 1 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/components/EmailVerificationModal.tsx`
- **File overview:** Presentation component for `EmailVerificationModal` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `EmailVerificationModal` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, lucide-react, @shared/ui/buttons/Button, @shared/ui/modals/ModalFrame) -> focused transformation -> outputs leave through EmailVerificationModal.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react, lucide-react, @shared/ui/buttons/Button, @shared/ui/modals/ModalFrame. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 124 lines. Side effects: local/session state changes

### `client/src/shared/components/EmploymentTypeCell.tsx`
- **File overview:** Presentation component for `EmploymentTypeCell` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `EmploymentTypeCell` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (@shared/utils/cn, @shared/utils/employmentTypeIcons) -> focused transformation -> outputs leave through EmploymentTypeCell.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses @shared/utils/cn, @shared/utils/employmentTypeIcons. Used by client/src/features/recruiter/pages/JobPostsPage/components/JobPostsTable.tsx
- **Operational notes:** Approx. 31 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/components/EmptyState.tsx`
- **File overview:** Presentation component for `EmptyState` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `EmptyState` (const), `EmptyStateProps` (interface)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, lucide-react, @shared/components/Button, @shared/utils/cn) -> focused transformation -> outputs leave through EmptyState, EmptyStateProps.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react, lucide-react, @shared/components/Button, @shared/utils/cn. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 47 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/components/GlobalSearchBar.tsx`
- **File overview:** Presentation component for `GlobalSearchBar` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `GlobalSearchBar` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, react-router-dom, lucide-react, @app/providers/AuthProvider) -> focused transformation -> outputs leave through GlobalSearchBar.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react, react-router-dom, lucide-react, @app/providers/AuthProvider, @shared/config/searchableRoutes, @shared/hooks/useGlobalSearch. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 271 lines. Side effects: redirect/navigation, local/session state changes

### `client/src/shared/components/HighRiskVerificationModal.tsx`
- **File overview:** Presentation component for `HighRiskVerificationModal` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `HighRiskVerificationModal` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, lucide-react, @shared/ui/buttons/Button, @shared/ui/modals/ModalFrame) -> focused transformation -> outputs leave through HighRiskVerificationModal.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses react, lucide-react, @shared/ui/buttons/Button, @shared/ui/modals/ModalFrame. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 105 lines. Side effects: local/session state changes

### `client/src/shared/components/IconActionButton.tsx`
- **File overview:** Presentation component for `IconActionButton` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through module exports.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 4 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/components/JobCard.tsx`
- **File overview:** Presentation component for `JobCard` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `JobCard` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, react-router-dom, @shared/components/ActionButton, @shared/components/Badge) -> focused transformation -> outputs leave through JobCard.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react, react-router-dom, @shared/components/ActionButton, @shared/components/Badge, @shared/components/Button, @shared/components/Card. Used by client/src/features/jobseeker/pages/JobsPage/JobsPage.tsx, client/src/features/jobseeker/pages/SavedJobsPage/SavedJobsPage.tsx
- **Operational notes:** Approx. 139 lines. Side effects: local/session state changes

### `client/src/shared/components/JobTitleCell.tsx`
- **File overview:** Presentation component for `JobTitleCell` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `JobTitleCell` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (@shared/utils/cn, @shared/utils/jobIcons) -> focused transformation -> outputs leave through JobTitleCell.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses @shared/utils/cn, @shared/utils/jobIcons. Used by client/src/features/jobseeker/pages/ApplicationsPage/components/ApplicationsTable.tsx, client/src/features/jobseeker/pages/ArchivedApplicationsPage/ArchivedApplicationsPage.tsx, client/src/features/recruiter/pages/CandidatesPage/components/CandidatesTable.tsx, client/src/features/recruiter/pages/HiredEmployeesPage/HiredEmployeesPage.tsx, client/src/features/recruiter/pages/JobPostsPage/components/JobPostsTable.tsx
- **Operational notes:** Approx. 39 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/components/ModalOverlay.tsx`
- **File overview:** Presentation component for `ModalOverlay` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through module exports.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by client/src/features/admin/components/CreateCompanyModal.tsx, client/src/features/admin/components/CreateRecruiterModal.tsx, client/src/features/recruiter/pages/CandidateDetailPage/components/OfferModal.tsx, client/src/shared/components/setup/CompanyAdminInitialSetupModal.tsx, client/src/shared/components/setup/RecruiterInitialSetupModal.tsx
- **Operational notes:** Approx. 1 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/components/PredictiveInput.tsx`
- **File overview:** Presentation component for `PredictiveInput` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `PredictiveInput` (const), `PredictiveInputProps` (interface)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, react-dom, @features/recruiter/components/recruiterForm.shared) -> focused transformation -> outputs leave through PredictiveInput, PredictiveInputProps.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses react, react-dom, @features/recruiter/components/recruiterForm.shared. Used by client/src/features/recruiter/pages/CandidateDetailPage/components/OfferModal.tsx
- **Operational notes:** Approx. 231 lines. Side effects: local/session state changes

### `client/src/shared/components/Progress.tsx`
- **File overview:** Presentation component for `Progress` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `Progress` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through Progress.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 9 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/components/RichTextContent.tsx`
- **File overview:** Presentation component for `RichTextContent` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `RichTextContent` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (@shared/utils/cn, @shared/utils/richText) -> focused transformation -> outputs leave through RichTextContent.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses @shared/utils/cn, @shared/utils/richText. Used by client/src/features/jobseeker/pages/ArchivedInterviewsPage/ArchivedInterviewsPage.tsx, client/src/features/jobseeker/pages/InterviewPage/InterviewPage.tsx, client/src/features/jobseeker/pages/InterviewPage/components/JobseekerInterviewCard.tsx, client/src/features/jobseeker/pages/JobDetailPage/JobDetailPage.tsx
- **Operational notes:** Approx. 45 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/components/RichTextEditor.tsx`
- **File overview:** Presentation component for `RichTextEditor` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `RichTextEditor` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, @tiptap/react, @tiptap/starter-kit, @tiptap/extension-link) -> focused transformation -> outputs leave through RichTextEditor.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses react, @tiptap/react, @tiptap/starter-kit, @tiptap/extension-link, @tiptap/extension-placeholder, @tiptap/extension-underline. Used by client/src/shared/components/RichTextField.tsx
- **Operational notes:** Approx. 219 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/components/RichTextField.tsx`
- **File overview:** Presentation component for `RichTextField` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `RichTextField` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (@shared/components/RichTextEditor, @shared/utils/richText) -> focused transformation -> outputs leave through RichTextField.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses @shared/components/RichTextEditor, @shared/utils/richText. Used by client/src/features/jobseeker/pages/InterviewPage/components/RescheduleRequestForm.tsx, client/src/features/recruiter/pages/CandidateDetailPage/components/InterviewModal.tsx, client/src/features/recruiter/pages/CandidateDetailPage/components/OfferModal.tsx, client/src/features/recruiter/pages/InterviewFormPage/components/InterviewSchedulerForm.tsx
- **Operational notes:** Approx. 60 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/components/RouteNavigationFeedback.tsx`
- **File overview:** Presentation component for `RouteNavigationFeedback` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `RouteNavigationFeedback` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, react-router-dom, @shared/utils/cn) -> focused transformation -> outputs leave through RouteNavigationFeedback.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react, react-router-dom, @shared/utils/cn. Used by client/src/app/layouts/AppShell.tsx, client/src/app/routes/route.helpers.tsx
- **Operational notes:** Approx. 40 lines. Side effects: local/session state changes

### `client/src/shared/components/ScrollToTop.tsx`
- **File overview:** Presentation component for `ScrollToTop` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `ScrollToTop` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, react-router-dom) -> focused transformation -> outputs leave through ScrollToTop.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react, react-router-dom. Used by client/src/app/routes/route.helpers.tsx
- **Operational notes:** Approx. 17 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/components/SearchField.tsx`
- **File overview:** Presentation component for `SearchField` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `SearchField` (function)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through SearchField.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 35 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/components/Searchbar.tsx`
- **File overview:** Presentation component for `Searchbar` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `Searchbar` (function)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (lucide-react) -> focused transformation -> outputs leave through Searchbar.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses lucide-react. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 15 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/components/SideDrawer.tsx`
- **File overview:** Presentation component for `SideDrawer` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `SideDrawer` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, lucide-react, @shared/utils/cn) -> focused transformation -> outputs leave through SideDrawer.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react, lucide-react, @shared/utils/cn. Used by client/src/features/admin/components/CreateRecruiterModal.tsx, client/src/features/jobseeker/pages/ArchivedInterviewsPage/ArchivedInterviewsPage.tsx, client/src/features/jobseeker/pages/InterviewPage/InterviewPage.tsx, client/src/features/jobseeker/pages/InterviewPage/components/RescheduleRequestModal.tsx, client/src/features/recruiter/pages/CandidateDetailPage/components/InterviewModal.tsx
- **Operational notes:** Approx. 138 lines. Side effects: local/session state changes

### `client/src/shared/components/Sidebar.tsx`
- **File overview:** Presentation component for `Sidebar` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `Sidebar` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (lucide-react, react-router-dom, react, @shared/utils/cn) -> focused transformation -> outputs leave through Sidebar.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses lucide-react, react-router-dom, react, @shared/utils/cn, @shared/hooks/usePermissions. Used by client/src/app/layouts/AppShell.tsx
- **Operational notes:** Approx. 228 lines. Side effects: redirect/navigation

### `client/src/shared/components/StatusBadge.tsx`
- **File overview:** Presentation component for `StatusBadge` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `StatusBadge` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (@shared/utils/cn, @shared/utils/applicationStatus) -> focused transformation -> outputs leave through StatusBadge.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses @shared/utils/cn, @shared/utils/applicationStatus. Used by client/src/features/jobseeker/pages/ApplicationsPage/components/ApplicationStatusBadge.tsx, client/src/features/jobseeker/pages/OffersPage/components/OfferDetailsModal.tsx, client/src/features/recruiter/pages/JobDetailPage/components/ApplicantsCard.tsx
- **Operational notes:** Approx. 38 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/components/Toast.tsx`
- **File overview:** Presentation component for `Toast` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `AppToast` (const), `ToastTone` (type)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, lucide-react) -> focused transformation -> outputs leave through AppToast, ToastTone.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react, lucide-react. Used by client/src/app/providers/ToastProvider.tsx
- **Operational notes:** Approx. 70 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/components/Topbar.tsx`
- **File overview:** Presentation component for `Topbar` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `Topbar` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, react-router-dom, lucide-react, @shared/components/Avatar) -> focused transformation -> outputs leave through Topbar.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses react, react-router-dom, lucide-react, @shared/components/Avatar, @shared/components/SideDrawer, @app/providers/AuthProvider. Used by client/src/app/layouts/AppShell.tsx
- **Operational notes:** Approx. 323 lines. Side effects: redirect/navigation, local/session state changes

### `client/src/shared/components/setup/CompanyAdminInitialSetupModal.tsx`
- **File overview:** Presentation component for `CompanyAdminInitialSetupModal` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `CompanyAdminInitialSetupModal` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, @shared/components/ModalOverlay, @shared/api/http) -> focused transformation -> outputs leave through CompanyAdminInitialSetupModal.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react, @shared/components/ModalOverlay, @shared/api/http. Used by client/src/app/providers/SetupProvider.tsx
- **Operational notes:** Approx. 137 lines. Side effects: HTTP/API calls, local/session state changes

### `client/src/shared/components/setup/RecruiterInitialSetupModal.tsx`
- **File overview:** Presentation component for `RecruiterInitialSetupModal` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `RecruiterInitialSetupModal` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, @shared/components/ModalOverlay, @shared/api/http) -> focused transformation -> outputs leave through RecruiterInitialSetupModal.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react, @shared/components/ModalOverlay, @shared/api/http. Used by client/src/app/providers/SetupProvider.tsx
- **Operational notes:** Approx. 106 lines. Side effects: HTTP/API calls, local/session state changes

### `client/src/shared/components/skeletons/JobCardSkeleton.tsx`
- **File overview:** Presentation component for `JobCardSkeleton` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `JobCardSkeleton` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (@shared/components/skeletons/SkeletonBlock) -> focused transformation -> outputs leave through JobCardSkeleton.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses @shared/components/skeletons/SkeletonBlock. Used by client/src/shared/components/skeletons/JobListSkeleton.tsx
- **Operational notes:** Approx. 34 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/components/skeletons/JobListSkeleton.tsx`
- **File overview:** Presentation component for `JobListSkeleton` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `JobListSkeleton` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (@shared/components/skeletons/JobCardSkeleton) -> focused transformation -> outputs leave through JobListSkeleton.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses @shared/components/skeletons/JobCardSkeleton. Used by client/src/features/jobseeker/pages/SavedJobsPage/SavedJobsPage.tsx
- **Operational notes:** Approx. 13 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/components/skeletons/SkeletonBlock.tsx`
- **File overview:** Presentation component for `SkeletonBlock` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `SkeletonBlock` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react-loading-skeleton, @shared/utils/cn) -> focused transformation -> outputs leave through SkeletonBlock.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react-loading-skeleton, @shared/utils/cn. Used by client/src/features/jobseeker/pages/DashboardPage/components/DashboardStatsSkeleton.tsx, client/src/features/jobseeker/pages/InterviewPage/components/InterviewCalendarSkeleton.tsx, client/src/features/recruiter/pages/RecruiterDashboardPage/components/RecruiterDashboardSkeleton.tsx, client/src/shared/components/skeletons/JobCardSkeleton.tsx, client/src/shared/components/skeletons/TableRowsSkeleton.tsx
- **Operational notes:** Approx. 13 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/components/skeletons/TableRowsSkeleton.tsx`
- **File overview:** Presentation component for `TableRowsSkeleton` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `TableRowsSkeleton` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (@shared/components/skeletons/SkeletonBlock) -> focused transformation -> outputs leave through TableRowsSkeleton.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses @shared/components/skeletons/SkeletonBlock. Used by client/src/features/jobseeker/pages/ApplicationsPage/components/ApplicationListSkeleton.tsx, client/src/features/recruiter/pages/CandidatesPage/components/CandidateListSkeleton.tsx, client/src/features/recruiter/pages/JobPostsPage/components/JobListSkeleton.tsx
- **Operational notes:** Approx. 54 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/components/ui/data-table/DataTable.tsx`
- **File overview:** Presentation component for `DataTable` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `DataTable` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, react, react-loading-skeleton, @shared/components/ui/data-table/SortableHeader) -> focused transformation -> outputs leave through DataTable.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react, react, react-loading-skeleton, @shared/components/ui/data-table/SortableHeader, @shared/utils/cn. Used by client/src/features/admin/components/AdminCompaniesTableCard.tsx, client/src/features/admin/components/AdminCompanyAdminsTableCard.tsx, client/src/features/admin/components/AdminRecruitersTableCard.tsx, client/src/features/admin/components/AdminUsersTableCard.tsx, client/src/features/admin/pages/CompanyAdminEmployeesPage.tsx
- **Operational notes:** Approx. 245 lines. Side effects: local/session state changes

### `client/src/shared/components/ui/data-table/IdentityCell.tsx`
- **File overview:** Presentation component for `IdentityCell` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `IdentityCell` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (@shared/components/Avatar, @shared/utils/cn) -> focused transformation -> outputs leave through IdentityCell.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses @shared/components/Avatar, @shared/utils/cn. Used by client/src/features/admin/components/AdminCompaniesTableCard.tsx, client/src/features/admin/components/AdminCompanyAdminsTableCard.tsx, client/src/features/admin/components/AdminRecruitersTableCard.tsx, client/src/features/admin/components/AdminUsersTableCard.tsx, client/src/features/admin/pages/CompanyAdminEmployeesPage.tsx
- **Operational notes:** Approx. 38 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/components/ui/data-table/SortableHeader.tsx`
- **File overview:** Presentation component for `SortableHeader` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `SortableHeader` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (lucide-react, @shared/utils/cn, @shared/components/ui/data-table/table-types) -> focused transformation -> outputs leave through SortableHeader.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses lucide-react, @shared/utils/cn, @shared/components/ui/data-table/table-types. Used by client/src/shared/components/ui/data-table/DataTable.tsx
- **Operational notes:** Approx. 45 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/components/ui/data-table/TablePageSizeControl.tsx`
- **File overview:** Presentation component for `TablePageSizeControl` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `TablePageSizeControl` (const), `TablePageSizeOption` (interface)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (lucide-react, @shared/utils/cn) -> focused transformation -> outputs leave through TablePageSizeControl, TablePageSizeOption.
- **Edge cases / constraints:** Pagination is normalized or bounded. Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses lucide-react, @shared/utils/cn. Used by client/src/features/admin/components/AdminCompaniesTableCard.tsx, client/src/features/admin/components/AdminCompanyAdminsTableCard.tsx, client/src/features/admin/components/AdminRecruitersTableCard.tsx, client/src/features/admin/components/AdminUsersTableCard.tsx, client/src/features/jobseeker/pages/ArchivedApplicationsPage/ArchivedApplicationsPage.tsx
- **Operational notes:** Approx. 78 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/components/ui/data-table/TablePagination.tsx`
- **File overview:** Presentation component for `TablePagination` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `TablePagination` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (lucide-react, react-router-dom, @shared/utils/cn, @shared/components/ui/data-table/TablePageSizeControl) -> focused transformation -> outputs leave through TablePagination.
- **Edge cases / constraints:** Pagination is normalized or bounded. Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses lucide-react, react-router-dom, @shared/utils/cn, @shared/components/ui/data-table/TablePageSizeControl. Used by client/src/features/admin/components/AdminCompaniesTableCard.tsx, client/src/features/admin/components/AdminCompanyAdminsTableCard.tsx, client/src/features/admin/components/AdminRecruitersTableCard.tsx, client/src/features/admin/components/AdminUsersTableCard.tsx, client/src/features/jobseeker/pages/ArchivedApplicationsPage/ArchivedApplicationsPage.tsx
- **Operational notes:** Approx. 175 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/components/ui/data-table/table-types.ts`
- **File overview:** Presentation component for `table types` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `DataTableSortState` (interface), `DataTableColumn` (interface), `DataTableRowConfig` (interface), `DataTableSortDirection` (type), `DataTableSortType` (type)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react) -> focused transformation -> outputs leave through DataTableSortState, DataTableColumn, DataTableRowConfig.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react. Used by client/src/shared/components/ui/data-table/SortableHeader.tsx
- **Operational notes:** Approx. 32 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## client/src/shared/config

### `client/src/shared/config/appNavigation.ts`
- **File overview:** Maintained module `appNavigation` in the codebase.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `resolveNavigationSection` (const), `getNavigationContext` (const), `isNavigationItemActive` (const), `getNavigationPageTitle` (const), `AppNavigationItem` (interface), `NavigationContext` (interface)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (lucide-react) -> focused transformation -> outputs leave through resolveNavigationSection, getNavigationContext, isNavigationItemActive.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses lucide-react. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 146 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/config/backendWakeRoutes.ts`
- **File overview:** Maintained module `backendWakeRoutes` in the codebase.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `isAtsWakeRoute` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through isAtsWakeRoute.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by client/src/app/layouts/AppShell.tsx
- **Operational notes:** Approx. 14 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/config/searchableRoutes.ts`
- **File overview:** Maintained module `searchableRoutes` in the codebase.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `searchableRoutes` (const), `resolveSearchRoleContext` (const), `SearchableRouteItem` (interface), `SearchRoleContext` (type)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (lucide-react, @shared/types) -> focused transformation -> outputs leave through searchableRoutes, resolveSearchRoleContext, SearchableRouteItem.
- **Edge cases / constraints:** Pagination is normalized or bounded.
- **Dependencies:** Uses lucide-react, @shared/types. Used by client/src/shared/components/GlobalSearchBar.tsx
- **Operational notes:** Approx. 306 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## client/src/shared/data

### `client/src/shared/data/currency.ts`
- **File overview:** Static data resource for `currency` used by runtime code.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `CURRENCY_SYMBOL_MAP` (const), `getCurrencySymbol` (const), `formatCurrencyAmount` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through CURRENCY_SYMBOL_MAP, getCurrencySymbol, formatCurrencyAmount.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses Framework/runtime only.. Used by client/src/features/jobseeker/pages/JobDetailPage/JobDetailPage.tsx, client/src/shared/components/JobCard.tsx
- **Operational notes:** Approx. 24 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## client/src/shared/hooks

### `client/src/shared/hooks/useBackendWakeIndicator.ts`
- **File overview:** Reusable hook for `useBackendWakeIndicator` state, effects, and event handling.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `useBackendWakeIndicator` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (react, @shared/api/backendReadiness) -> focused transformation -> outputs leave through useBackendWakeIndicator.
- **Edge cases / constraints:** Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react, @shared/api/backendReadiness. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 53 lines. Side effects: local/session state changes

### `client/src/shared/hooks/useConfirmation.tsx`
- **File overview:** Reusable hook for `useConfirmation` state, effects, and event handling.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `ConfirmationProvider` (const), `useConfirmation` (const), `ConfirmationOptions` (interface)
- **Business logic:** Validation and guard clauses protect downstream workflows from invalid state.
- **Data flow:** Inputs arrive through callers and dependencies (react, @shared/components/ConfirmationModal) -> focused transformation -> outputs leave through ConfirmationProvider, useConfirmation, ConfirmationOptions.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react, @shared/components/ConfirmationModal. Used by client/src/features/admin/hooks/useAdminActivationAction.ts, client/src/features/jobseeker/pages/InterviewPage/InterviewPage.tsx, client/src/features/jobseeker/pages/JobDetailPage/components/ApplyModalWizard.tsx, client/src/features/recruiter/pages/InterviewFormPage/InterviewFormPage.tsx, client/src/shared/pages/NotificationsPage.tsx
- **Operational notes:** Approx. 100 lines. Side effects: local/session state changes

### `client/src/shared/hooks/useDebounce.ts`
- **File overview:** Reusable hook for `useDebounce` state, effects, and event handling.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `useDebounce` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (react) -> focused transformation -> outputs leave through useDebounce.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react. Used by client/src/features/recruiter/pages/CandidatesPage/components/CandidatesFilters.tsx
- **Operational notes:** Approx. 12 lines. Side effects: local/session state changes

### `client/src/shared/hooks/useGlobalSearch.ts`
- **File overview:** Reusable hook for `useGlobalSearch` state, effects, and event handling.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `useGlobalSearch` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (react) -> focused transformation -> outputs leave through useGlobalSearch.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react. Used by client/src/shared/components/GlobalSearchBar.tsx
- **Operational notes:** Approx. 97 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/hooks/useMediaQuery.ts`
- **File overview:** Reusable hook for `useMediaQuery` state, effects, and event handling.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `useMediaQuery` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (react) -> focused transformation -> outputs leave through useMediaQuery.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react. Used by client/src/features/admin/components/CreateRecruiterModal.tsx, client/src/shared/components/RichTextEditor.tsx
- **Operational notes:** Approx. 31 lines. Side effects: local/session state changes

### `client/src/shared/hooks/usePermissions.ts`
- **File overview:** Reusable hook for `usePermissions` state, effects, and event handling.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `usePermissions` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (react, @app/providers/AuthProvider, @app/providers/CurrentCompanyProvider, @app/providers/CurrentRecruiterProvider) -> focused transformation -> outputs leave through usePermissions.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react, @app/providers/AuthProvider, @app/providers/CurrentCompanyProvider, @app/providers/CurrentRecruiterProvider, @shared/utils/permissions. Used by client/src/app/routes/routes.guard.tsx, client/src/features/admin/pages/SuperAdminCompanyAdminsPage.tsx, client/src/features/admin/pages/SuperAdminDashboardPage.tsx, client/src/features/admin/pages/SuperAdminRecruitersPage.tsx, client/src/features/admin/pages/SuperAdminUsersPage.tsx
- **Operational notes:** Approx. 21 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## client/src/shared/pages

### `client/src/shared/pages/ATSOffline.css`
- **File overview:** Route-level screen for `ATSOffline` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through module exports.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by client/src/shared/pages/ATSOffline.tsx
- **Operational notes:** Approx. 496 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/pages/ATSOffline.tsx`
- **File overview:** Route-level screen for `ATSOffline` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `ATSOffline` (function)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, ./ATSOffline.css) -> focused transformation -> outputs leave through ATSOffline.
- **Edge cases / constraints:** Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react, ./ATSOffline.css. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 486 lines. Side effects: local/session state changes

### `client/src/shared/pages/ATSWakingLoader.css`
- **File overview:** Route-level screen for `ATSWakingLoader` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through module exports.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by client/src/shared/pages/ATSWakingLoader.tsx
- **Operational notes:** Approx. 413 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/pages/ATSWakingLoader.tsx`
- **File overview:** Route-level screen for `ATSWakingLoader` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `ATSWakingLoader` (function)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, ./ATSWakingLoader.css) -> focused transformation -> outputs leave through ATSWakingLoader.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react, ./ATSWakingLoader.css. Used by client/src/shared/pages/AtsWakeLoaderSurface.tsx
- **Operational notes:** Approx. 291 lines. Side effects: local/session state changes

### `client/src/shared/pages/AtsWakeLoaderSurface.tsx`
- **File overview:** Route-level screen for `AtsWakeLoaderSurface` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `AtsWakeLoaderSurface` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (@shared/pages/ATSWakingLoader) -> focused transformation -> outputs leave through AtsWakeLoaderSurface.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses @shared/pages/ATSWakingLoader. Used by client/src/app/layouts/AppShell.tsx, client/src/shared/components/AppLoadingScreen.tsx
- **Operational notes:** Approx. 27 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/pages/NotAuthorized.tsx`
- **File overview:** Route-level screen for `NotAuthorized` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `NotAuthorized` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (framer-motion, react-router-dom, @app/providers/AuthProvider, @app/routes/routes.guard) -> focused transformation -> outputs leave through NotAuthorized.
- **Edge cases / constraints:** Identity and access preconditions are enforced explicitly.
- **Dependencies:** Uses framer-motion, react-router-dom, @app/providers/AuthProvider, @app/routes/routes.guard, lucide-react. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 353 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/pages/NotificationsPage.tsx`
- **File overview:** Route-level screen for `NotificationsPage` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `NotificationsPage` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, lucide-react, react-router-dom, @app/providers/AuthProvider) -> focused transformation -> outputs leave through NotificationsPage.
- **Edge cases / constraints:** Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses react, lucide-react, react-router-dom, @app/providers/AuthProvider, @app/routes/routes.guard, @shared/components/Card. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 257 lines. Side effects: redirect/navigation, local/session state changes

### `client/src/shared/pages/RouteErrorPage.tsx`
- **File overview:** Route-level screen for `RouteErrorPage` that composes data, hooks, and UI.
- **Responsibilities:** Feature entrypoint screen.
- **Key functions / classes:** `RouteErrorPage` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (framer-motion, react-router-dom, @shared/api/http, lucide-react) -> focused transformation -> outputs leave through RouteErrorPage.
- **Edge cases / constraints:** Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses framer-motion, react-router-dom, @shared/api/http, lucide-react. Used by client/src/app/routes/route.helpers.tsx
- **Operational notes:** Approx. 431 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## client/src/shared/services

### `client/src/shared/services/notification.service.ts`
- **File overview:** Service boundary for `notification service` that centralizes operations and side effects for callers.
- **Responsibilities:** Business/application boundary: validation, orchestration, persistence, and side effects.
- **Key functions / classes:** `notificationService` (const), `NotificationDto` (interface)
- **Business logic:** This file appears to own or coordinate a feature workflow. It keeps validation, orchestration, and side effects out of callers.
- **Data flow:** Callers invoke service methods -> this module coordinates @shared/api/http -> results leave through notificationService, NotificationDto.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses @shared/api/http. Used by client/src/app/providers/NotificationsProvider.tsx
- **Operational notes:** Approx. 41 lines. Side effects: HTTP/API calls, notifications

## client/src/shared/theme

### `client/src/shared/theme/tokens.ts`
- **File overview:** Maintained module `tokens` in the codebase.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `palette` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through palette.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 8 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## client/src/shared/types

### `client/src/shared/types/index.ts`
- **File overview:** Contract module for `index`. It defines compile-time shapes shared across the stack.
- **Responsibilities:** Type contract layer with no primary runtime behavior.
- **Key functions / classes:** `Job` (interface), `ApplicationRecord` (interface), `User` (interface), `RouteMeta` (interface), `DashboardAnalyticsPoint` (interface), `Role` (type)
- **Business logic:** No direct runtime rules live here; the business value is keeping contracts stable and discoverable across modules.
- **Data flow:** Other modules import these contracts (Job, ApplicationRecord, User) -> compile-time consistency across layers.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by client/src/app/providers/AuthProvider.tsx, client/src/app/providers/session-store.tsx, client/src/app/routes/protectedLoader.ts, client/src/app/routes/route.config.ts, client/src/app/routes/routes.guard.tsx
- **Operational notes:** Approx. 39 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## client/src/shared/ui

### `client/src/shared/ui/buttons/ActionButton.tsx`
- **File overview:** Presentation component for `ActionButton` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `actionButtonClassName` (const), `ActionButton` (const), `ActionButtonClassNameOptions` (interface), `ActionButtonProps` (interface)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, lucide-react, @shared/utils/cn) -> focused transformation -> outputs leave through actionButtonClassName, ActionButton, ActionButtonClassNameOptions.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react, lucide-react, @shared/utils/cn. Used by client/src/shared/ui/buttons/IconActionButton.tsx, client/src/shared/ui/buttons/IconActionButton.tsx
- **Operational notes:** Approx. 90 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/ui/buttons/Button.tsx`
- **File overview:** Presentation component for `Button` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `Button` (const), `ButtonProps` (type)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, lucide-react, @shared/utils/cn) -> focused transformation -> outputs leave through Button, ButtonProps.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react, lucide-react, @shared/utils/cn. Used by client/src/features/auth/components/ResetPasswordPinModal.tsx, client/src/features/jobseeker/pages/OffersPage/components/OfferDetailsModal.tsx, client/src/shared/components/EmailVerificationModal.tsx, client/src/shared/components/HighRiskVerificationModal.tsx, client/src/shared/ui/modals/ConfirmationModal.tsx
- **Operational notes:** Approx. 46 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/ui/buttons/IconActionButton.tsx`
- **File overview:** Presentation component for `IconActionButton` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `iconActionButtonClassName` (const), `IconActionButton` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (@shared/ui/buttons/ActionButton, @shared/ui/buttons/ActionButton) -> focused transformation -> outputs leave through iconActionButtonClassName, IconActionButton.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses @shared/ui/buttons/ActionButton, @shared/ui/buttons/ActionButton. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 28 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/ui/buttons/index.ts`
- **File overview:** Presentation component for `index` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through module exports.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 3 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/ui/dropdowns/Dropdown.tsx`
- **File overview:** Presentation component for `Dropdown` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `Dropdown` (function), `DropdownOption` (type), `DropdownProps` (type)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, lucide-react) -> focused transformation -> outputs leave through Dropdown, DropdownOption, DropdownProps.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react, lucide-react. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 164 lines. Side effects: local/session state changes

### `client/src/shared/ui/dropdowns/index.ts`
- **File overview:** Presentation component for `index` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through module exports.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 2 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/ui/modals/ConfirmationModal.tsx`
- **File overview:** Presentation component for `ConfirmationModal` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `ConfirmationModal` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, lucide-react, @shared/ui/buttons/Button, @shared/ui/modals/ModalFrame) -> focused transformation -> outputs leave through ConfirmationModal.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react, lucide-react, @shared/ui/buttons/Button, @shared/ui/modals/ModalFrame. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 98 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/ui/modals/ModalFrame.tsx`
- **File overview:** Presentation component for `ModalFrame` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `ModalFrame` (const)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react, lucide-react, @shared/utils/cn, @shared/ui/modals/ModalOverlay) -> focused transformation -> outputs leave through ModalFrame.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react, lucide-react, @shared/utils/cn, @shared/ui/modals/ModalOverlay. Used by client/src/features/auth/components/ResetPasswordPinModal.tsx, client/src/features/jobseeker/pages/OffersPage/components/OfferDetailsModal.tsx, client/src/shared/components/EmailVerificationModal.tsx, client/src/shared/components/HighRiskVerificationModal.tsx, client/src/shared/ui/modals/ConfirmationModal.tsx
- **Operational notes:** Approx. 78 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/ui/modals/ModalOverlay.tsx`
- **File overview:** Presentation component for `ModalOverlay` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** `ModalOverlay` (const), `ModalOverlayProps` (interface)
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (react) -> focused transformation -> outputs leave through ModalOverlay, ModalOverlayProps.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses react. Used by client/src/shared/ui/modals/ModalFrame.tsx
- **Operational notes:** Approx. 52 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/ui/modals/index.ts`
- **File overview:** Presentation component for `index` used by a feature or the shared design system.
- **Responsibilities:** Reusable rendering unit.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** Most business rules are delegated outward; this file mainly presents workflow state and user actions.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through module exports.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 3 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## client/src/shared/utils

### `client/src/shared/utils/applicationStatus.ts`
- **File overview:** Shared helper for `applicationStatus` that packages reusable transformations or policy logic.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `normalizeApplicationStatusKey` (const), `getApplicationStatusAppearance` (const), `ApplicationStatusKey` (type)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through normalizeApplicationStatusKey, getApplicationStatusAppearance, ApplicationStatusKey.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses Framework/runtime only.. Used by client/src/features/jobseeker/utils/applicationActionRules.ts, client/src/features/recruiter/pages/CandidatesPage/components/CandidateStageTabs.tsx, client/src/shared/components/StatusBadge.tsx
- **Operational notes:** Approx. 207 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/utils/avatar.ts`
- **File overview:** Shared helper for `avatar` that packages reusable transformations or policy logic.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `getAvatarInitials` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through getAvatarInitials.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses Framework/runtime only.. Used by client/src/shared/components/Avatar.tsx
- **Operational notes:** Approx. 24 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/utils/calendar.ts`
- **File overview:** Shared helper for `calendar` that packages reusable transformations or policy logic.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `downloadInterviewICS` (const), `CalendarDownloadRole` (type)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (@shared/api/http) -> focused transformation -> outputs leave through downloadInterviewICS, CalendarDownloadRole.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence. Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses @shared/api/http. Used by client/src/features/jobseeker/pages/InterviewPage/components/JobseekerInterviewCard.tsx, client/src/features/recruiter/pages/InterviewFormPage/components/InterviewCard.tsx
- **Operational notes:** Approx. 49 lines. Side effects: HTTP/API calls

### `client/src/shared/utils/cn.ts`
- **File overview:** Shared helper for `cn` that packages reusable transformations or policy logic.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `cn` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (tailwind-merge) -> focused transformation -> outputs leave through cn.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses tailwind-merge. Used by client/src/features/auth/components/AuthRouteTransition.tsx, client/src/features/jobseeker/components/SavedJobsEmptyState.tsx, client/src/features/recruiter/pages/CandidatesPage/components/BulkActionsBar.tsx, client/src/shared/components/Avatar.tsx, client/src/shared/components/Card.tsx
- **Operational notes:** Approx. 4 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/utils/departmentIcons.ts`
- **File overview:** Shared helper for `departmentIcons` that packages reusable transformations or policy logic.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `getDepartmentIcon` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (lucide-react) -> focused transformation -> outputs leave through getDepartmentIcon.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses lucide-react. Used by client/src/shared/components/DepartmentCell.tsx
- **Operational notes:** Approx. 67 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/utils/employmentTypeIcons.ts`
- **File overview:** Shared helper for `employmentTypeIcons` that packages reusable transformations or policy logic.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `getEmploymentTypeIcon` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (lucide-react) -> focused transformation -> outputs leave through getEmploymentTypeIcon.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses lucide-react. Used by client/src/shared/components/EmploymentTypeCell.tsx
- **Operational notes:** Approx. 29 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/utils/format.ts`
- **File overview:** Shared helper for `format` that packages reusable transformations or policy logic.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `formatSalary` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through formatSalary.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 4 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/utils/formatText.ts`
- **File overview:** Shared helper for `formatText` that packages reusable transformations or policy logic.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `splitToBullets` (const), `toList` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (@shared/utils/richText) -> focused transformation -> outputs leave through splitToBullets, toList.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses @shared/utils/richText. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 21 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/utils/interviewStatus.ts`
- **File overview:** Shared helper for `interviewStatus` that packages reusable transformations or policy logic.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `interviewStatusChipClassName` (const), `interviewStatusCalendarPillClassName` (const), `isTerminalInterviewStatus` (const), `DisplayInterviewStatus` (type)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through interviewStatusChipClassName, interviewStatusCalendarPillClassName, isTerminalInterviewStatus.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by client/src/features/jobseeker/pages/DashboardPage/DashboardPage.tsx, client/src/features/jobseeker/pages/InterviewPage/components/JobseekerInterviewList.tsx
- **Operational notes:** Approx. 39 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/utils/jobActionButtonStyles.ts`
- **File overview:** Shared helper for `jobActionButtonStyles` that packages reusable transformations or policy logic.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through module exports.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 3 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/utils/jobIcons.ts`
- **File overview:** Shared helper for `jobIcons` that packages reusable transformations or policy logic.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `getJobIcon` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (lucide-react) -> focused transformation -> outputs leave through getJobIcon.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses lucide-react. Used by client/src/shared/components/JobTitleCell.tsx
- **Operational notes:** Approx. 79 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/utils/jobLabels.ts`
- **File overview:** Shared helper for `jobLabels` that packages reusable transformations or policy logic.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `formatJobLabel` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through formatJobLabel.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 49 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/utils/jobPostingDate.ts`
- **File overview:** Shared helper for `jobPostingDate` that packages reusable transformations or policy logic.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `getPostedDateValue` (const), `formatPostedDateLabel` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through getPostedDateValue, formatPostedDateLabel.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 45 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/utils/jobStatusAccent.ts`
- **File overview:** Shared helper for `jobStatusAccent` that packages reusable transformations or policy logic.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `getJobStatusAccent` (const), `JobStatus` (type)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through getJobStatusAccent, JobStatus.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 33 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/utils/notifications.ts`
- **File overview:** Shared helper for `notifications` that packages reusable transformations or policy logic.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `emitNotification` (const), `notificationEventName` (const), `formatNotificationTimestamp` (const), `AppNotificationPayload` (interface), `AppNotification` (interface), `NotificationActor` (type)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through emitNotification, notificationEventName, formatNotificationTimestamp.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by client/src/features/jobseeker/pages/InterviewPage/components/JobseekerInterviewCard.tsx, client/src/features/recruiter/pages/InterviewFormPage/components/InterviewCard.tsx
- **Operational notes:** Approx. 58 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/utils/offerCompensation.ts`
- **File overview:** Shared helper for `offerCompensation` that packages reusable transformations or policy logic.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `formatPhpCurrency` (const), `formatOfferCompensation` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through formatPhpCurrency, formatOfferCompensation.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 12 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/utils/permissions.ts`
- **File overview:** Shared helper for `permissions` that packages reusable transformations or policy logic.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `isSuperAdminRole` (const), `isCompanyAdminRole` (const), `isRecruiterRole` (const), `hasAnyAllowedRole` (const), `getDefaultRouteForRoles` (const), `resolvePermissions` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (@shared/types) -> focused transformation -> outputs leave through isSuperAdminRole, isCompanyAdminRole, isRecruiterRole.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses @shared/types. Used by client/src/app/providers/CurrentRecruiterProvider.tsx, client/src/app/providers/SetupProvider.tsx, client/src/shared/hooks/usePermissions.ts
- **Operational notes:** Approx. 47 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/utils/richText.ts`
- **File overview:** Shared helper for `richText` that packages reusable transformations or policy logic.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `sanitizeRichText` (const), `stripRichText` (const), `hasRichTextContent` (const), `normalizeStringArray` (const), `extractListItemsFromHtml` (const), `richTextToList` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (dompurify) -> focused transformation -> outputs leave through sanitizeRichText, stripRichText, hasRichTextContent.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses dompurify. Used by client/src/features/jobseeker/actions/update-profile.action.ts, client/src/features/jobseeker/pages/InterviewPage/components/RescheduleRequestForm.tsx, client/src/features/jobseeker/pages/OffersPage/components/OfferDetailsModal.tsx, client/src/features/jobseeker/service/jobseeker.service.ts, client/src/features/jobseeker/services/interview.service.ts
- **Operational notes:** Approx. 206 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/utils/role.ts`
- **File overview:** Shared helper for `role` that packages reusable transformations or policy logic.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `normalizeRole` (const), `normalizeRoles` (const), `normalizeSetupType` (const), `SetupType` (type)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (@shared/types) -> focused transformation -> outputs leave through normalizeRole, normalizeRoles, normalizeSetupType.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses @shared/types. Used by client/src/app/providers/AuthProvider.tsx, client/src/app/providers/SetupProvider.tsx, client/src/app/routes/protectedLoader.ts
- **Operational notes:** Approx. 38 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/utils/search.ts`
- **File overview:** Shared helper for `search` that packages reusable transformations or policy logic.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `normalizeSearchInput` (const), `tokenizeSearchText` (const), `matchesSearchFields` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through normalizeSearchInput, tokenizeSearchText, matchesSearchFields.
- **Edge cases / constraints:** Input cleanup/normalization happens before comparison or persistence.
- **Dependencies:** Uses Framework/runtime only.. Used by client/src/features/recruiter/utils/jobMutationSync.ts
- **Operational notes:** Approx. 45 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

### `client/src/shared/utils/storage.ts`
- **File overview:** Shared helper for `storage` that packages reusable transformations or policy logic.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `readStorage` (const), `writeStorage` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through readStorage, writeStorage.
- **Edge cases / constraints:** Failures are translated into stable response or UI behavior.
- **Dependencies:** Uses Framework/runtime only.. Used by client/src/app/providers/CurrentCompanyProvider.tsx, client/src/app/providers/CurrentRecruiterProvider.tsx, client/src/app/providers/session-store.tsx, client/src/app/routes/protectedLoader.ts, client/src/features/recruiter/data/storage.ts
- **Operational notes:** Approx. 15 lines. Side effects: local/session state changes

### `client/src/shared/utils/viewTransition.ts`
- **File overview:** Shared helper for `viewTransition` that packages reusable transformations or policy logic.
- **Responsibilities:** Focused support module inside the project architecture.
- **Key functions / classes:** `runViewTransition` (const)
- **Business logic:** This file supports surrounding workflows without being the main owner of domain rules.
- **Data flow:** Inputs arrive through callers and dependencies (framework/runtime deps) -> focused transformation -> outputs leave through runViewTransition.
- **Edge cases / constraints:** No unusual edge-case handling stands out beyond the file's normal responsibility.
- **Dependencies:** Uses Framework/runtime only.. Used by client/src/features/auth/components/LegalDocumentPage.tsx
- **Operational notes:** Approx. 18 lines. Side effects: No significant side effects; primarily configuration, structure, or pure helper behavior.

## client/tsconfig.app.json

### `client/tsconfig.app.json`
- **File overview:** Build/tooling config for the surrounding project.
- **Responsibilities:** Compilation, bundling, linting, or tooling configuration.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** No direct business rules live here. Its value is operational clarity, reproducible environments, or developer guidance.
- **Data flow:** Maintainers update this file -> tooling, environments, or readers consume it -> downstream runtime behavior stays consistent without feature code changes.
- **Edge cases / constraints:** Constraints are operational rather than domain-driven: syntax, environment compatibility, and maintainability matter most.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 40 lines. Side effects: Operational/configuration only.

## client/tsconfig.json

### `client/tsconfig.json`
- **File overview:** Build/tooling config for the surrounding project.
- **Responsibilities:** Compilation, bundling, linting, or tooling configuration.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** No direct business rules live here. Its value is operational clarity, reproducible environments, or developer guidance.
- **Data flow:** Maintainers update this file -> tooling, environments, or readers consume it -> downstream runtime behavior stays consistent without feature code changes.
- **Edge cases / constraints:** Constraints are operational rather than domain-driven: syntax, environment compatibility, and maintainability matter most.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 17 lines. Side effects: Operational/configuration only.

## client/tsconfig.node.json

### `client/tsconfig.node.json`
- **File overview:** Build/tooling config for the surrounding project.
- **Responsibilities:** Compilation, bundling, linting, or tooling configuration.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** No direct business rules live here. Its value is operational clarity, reproducible environments, or developer guidance.
- **Data flow:** Maintainers update this file -> tooling, environments, or readers consume it -> downstream runtime behavior stays consistent without feature code changes.
- **Edge cases / constraints:** Constraints are operational rather than domain-driven: syntax, environment compatibility, and maintainability matter most.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 26 lines. Side effects: Operational/configuration only.

## client/vercel.json

### `client/vercel.json`
- **File overview:** Build/tooling config for the surrounding project.
- **Responsibilities:** Compilation, bundling, linting, or tooling configuration.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** No direct business rules live here. Its value is operational clarity, reproducible environments, or developer guidance.
- **Data flow:** Maintainers update this file -> tooling, environments, or readers consume it -> downstream runtime behavior stays consistent without feature code changes.
- **Edge cases / constraints:** Constraints are operational rather than domain-driven: syntax, environment compatibility, and maintainability matter most.
- **Dependencies:** Uses Framework/runtime only.. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 9 lines. Side effects: Operational/configuration only.

## client/vite.config.ts

### `client/vite.config.ts`
- **File overview:** Build/tooling config for the surrounding project.
- **Responsibilities:** Compilation, bundling, linting, or tooling configuration.
- **Key functions / classes:** No major exported/runtime symbols detected; this file is mostly configuration, data, or a barrel surface.
- **Business logic:** No direct business rules live here. Its value is operational clarity, reproducible environments, or developer guidance.
- **Data flow:** Maintainers update this file -> tooling, environments, or readers consume it -> downstream runtime behavior stays consistent without feature code changes.
- **Edge cases / constraints:** Constraints are operational rather than domain-driven: syntax, environment compatibility, and maintainability matter most.
- **Dependencies:** Uses vite, @vitejs/plugin-react, @tailwindcss/vite, path. Used by Imported/consumed by adjacent modules, DI, or framework discovery.
- **Operational notes:** Approx. 26 lines. Side effects: Operational/configuration only.
