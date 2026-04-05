# Client Architecture

## Overview

The client is organized around route-level app composition, feature modules, and a shared UI/types/utilities layer.

## Main Areas

- `src/app/`: app shell, providers, router composition, auth guards, and route loaders.
- `src/features/`: domain-specific feature folders for auth, recruiter, jobseeker, and admin experiences.
- `src/shared/`: reusable UI, hooks, config, utilities, API helpers, and shared types.

## Route Organization

- `src/app/routes/router.tsx`: top-level router composition only.
- `src/app/routes/public.routes.tsx`: login, register, password recovery, and legal pages.
- `src/app/routes/jobseeker.routes.tsx`: jobseeker dashboard and self-service flows.
- `src/app/routes/recruiter.routes.tsx`: recruiter dashboard, jobs, candidates, interviews, and offers.
- `src/app/routes/companyAdmin.routes.tsx`: company admin dashboard and employee management.
- `src/app/routes/superAdmin.routes.tsx`: superadmin dashboard and tenant management.
- `src/app/routes/common.routes.tsx`: shared authenticated routes such as profile and notifications.

## Shared UI

- `src/shared/ui/buttons/`: shared button primitives and action button variants.
- `src/shared/ui/dropdowns/`: shared dropdown shell and option typing.
- `src/shared/ui/modals/`: shared modal overlay, frame, and confirmation modal.
- `src/shared/components/`: compatibility exports plus components that still wrap shared primitives.

## Roles

Client role handling is normalized through `src/shared/utils/role.ts`.
Canonical client roles are:

- `superadmin`
- `companyadmin`
- `recruiter`
- `jobseeker`

Legacy `"admin"` values are normalized only for compatibility with incoming persisted/auth payloads.

## Search Labels

- `ROUTER COMPOSITION`
- `JOBSEEKER ROUTES`
- `RECRUITER ROUTES`
- `COMPANY ADMIN ROUTES`
- `SUPERADMIN ROUTES`
- `AUTH GUARDS`
- `SHARED BUTTON`
- `SHARED DROPDOWN`
- `SHARED MODAL`
- `SHARED TYPES`
