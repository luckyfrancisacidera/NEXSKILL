BEGIN;

-- Dashboard trend seed
-- Purpose:
-- - Enrich the default recruiter dashboard with believable month-over-month trend movement.
-- - Enrich the default company-admin dashboard with multi-recruiter variance, active jobs,
--   upcoming interviews, offers, and hires.
-- - Keep the seed idempotent through deterministic IDs.

CREATE OR REPLACE FUNCTION pg_temp.seed_uuid(seed_text text)
RETURNS uuid
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT (
        substr(md5(seed_text), 1, 8) || '-' ||
        substr(md5(seed_text), 9, 4) || '-' ||
        substr(md5(seed_text), 13, 4) || '-' ||
        substr(md5(seed_text), 17, 4) || '-' ||
        substr(md5(seed_text), 21, 12)
    )::uuid;
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM users
        WHERE "Id" = 'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid
    ) THEN
        RAISE EXCEPTION 'Required default recruiter user is missing.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM users
        WHERE "Id" = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid
    ) THEN
        RAISE EXCEPTION 'Required default company-admin user is missing.';
    END IF;
END $$;

CREATE TEMP TABLE trend_context AS
SELECT
    (
        SELECT rp."CompanyId"
        FROM recruiter_profiles rp
        WHERE rp."UserId" = 'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid
        LIMIT 1
    ) AS recruiter_company_id,
    (
        SELECT ap."CompanyId"
        FROM admin_profiles ap
        WHERE ap."UserId" = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid
        LIMIT 1
    ) AS company_admin_company_id;

DO $$
DECLARE
    recruiter_company uuid;
    admin_company uuid;
BEGIN
    SELECT recruiter_company_id, company_admin_company_id
    INTO recruiter_company, admin_company
    FROM trend_context;

    IF recruiter_company IS NULL THEN
        RAISE EXCEPTION 'The default recruiter is not attached to a recruiter profile/company.';
    END IF;

    IF admin_company IS NULL THEN
        RAISE EXCEPTION 'The default company admin is not attached to a company.';
    END IF;
END $$;

WITH template_password AS (
    SELECT "PasswordHash" AS password_hash
    FROM users
    WHERE "Email" = 'recruiter@nexskill.local'
    LIMIT 1
),
managed_users (
    id,
    email,
    first_name,
    last_name,
    location
) AS (
    VALUES
        ('11111111-1111-1111-1111-111111111111'::uuid, 'recruiter.ops@nexskill.local', 'Maya', 'Santos', 'Manila, Philippines'),
        ('22222222-2222-2222-2222-222222222222'::uuid, 'recruiter.product@nexskill.local', 'Ivy', 'Tan', 'Singapore'),
        ('33333333-3333-3333-3333-333333333333'::uuid, 'recruiter.data@nexskill.local', 'Noah', 'Lim', 'Singapore'),
        ('44444444-4444-4444-4444-444444444444'::uuid, 'recruiter@abc.com', 'Avery', 'Morgan', 'Cebu, Philippines'),
        ('90000000-0000-0000-0000-000000000001'::uuid, 'candidate.ava.ng@nexskill.local', 'Ava', 'Ng', 'Singapore'),
        ('90000000-0000-0000-0000-000000000002'::uuid, 'candidate.liam.cruz@nexskill.local', 'Liam', 'Cruz', 'Manila, Philippines'),
        ('90000000-0000-0000-0000-000000000003'::uuid, 'candidate.sophia.park@nexskill.local', 'Sophia', 'Park', 'Singapore'),
        ('90000000-0000-0000-0000-000000000004'::uuid, 'candidate.ethan.reyes@nexskill.local', 'Ethan', 'Reyes', 'Cebu, Philippines'),
        ('90000000-0000-0000-0000-000000000005'::uuid, 'candidate.mia.ong@nexskill.local', 'Mia', 'Ong', 'Singapore'),
        ('90000000-0000-0000-0000-000000000006'::uuid, 'candidate.lucas.yap@nexskill.local', 'Lucas', 'Yap', 'Quezon City, Philippines'),
        ('90000000-0000-0000-0000-000000000007'::uuid, 'candidate.emma.tan@nexskill.local', 'Emma', 'Tan', 'Singapore'),
        ('90000000-0000-0000-0000-000000000008'::uuid, 'candidate.james.lee@nexskill.local', 'James', 'Lee', 'Kuala Lumpur, Malaysia'),
        ('90000000-0000-0000-0000-000000000009'::uuid, 'candidate.olivia.chan@nexskill.local', 'Olivia', 'Chan', 'Singapore'),
        ('90000000-0000-0000-0000-000000000010'::uuid, 'candidate.ben.delacruz@nexskill.local', 'Ben', 'Dela Cruz', 'Taguig, Philippines'),
        ('90000000-0000-0000-0000-000000000011'::uuid, 'candidate.chloe.lim@nexskill.local', 'Chloe', 'Lim', 'Singapore'),
        ('90000000-0000-0000-0000-000000000012'::uuid, 'candidate.daniel.go@nexskill.local', 'Daniel', 'Go', 'Pasig, Philippines'),
        ('90000000-0000-0000-0000-000000000013'::uuid, 'candidate.grace.koh@nexskill.local', 'Grace', 'Koh', 'Singapore'),
        ('90000000-0000-0000-0000-000000000014'::uuid, 'candidate.henry.tiu@nexskill.local', 'Henry', 'Tiu', 'Taguig, Philippines'),
        ('90000000-0000-0000-0000-000000000015'::uuid, 'candidate.isla.navarro@nexskill.local', 'Isla', 'Navarro', 'Davao, Philippines'),
        ('90000000-0000-0000-0000-000000000016'::uuid, 'candidate.jacob.sy@nexskill.local', 'Jacob', 'Sy', 'Singapore'),
        ('90000000-0000-0000-0000-000000000017'::uuid, 'candidate.kylie.wong@nexskill.local', 'Kylie', 'Wong', 'Singapore'),
        ('90000000-0000-0000-0000-000000000018'::uuid, 'candidate.logan.fuentes@nexskill.local', 'Logan', 'Fuentes', 'Cebu, Philippines'),
        ('90000000-0000-0000-0000-000000000019'::uuid, 'candidate.nina.choi@nexskill.local', 'Nina', 'Choi', 'Singapore'),
        ('90000000-0000-0000-0000-000000000020'::uuid, 'candidate.owen.santos@nexskill.local', 'Owen', 'Santos', 'Iloilo, Philippines'),
        ('90000000-0000-0000-0000-000000000021'::uuid, 'candidate.paige.garcia@nexskill.local', 'Paige', 'Garcia', 'Baguio, Philippines'),
        ('90000000-0000-0000-0000-000000000022'::uuid, 'candidate.quentin.teo@nexskill.local', 'Quentin', 'Teo', 'Singapore'),
        ('90000000-0000-0000-0000-000000000023'::uuid, 'candidate.ruby.lopez@nexskill.local', 'Ruby', 'Lopez', 'Cagayan de Oro, Philippines'),
        ('90000000-0000-0000-0000-000000000024'::uuid, 'candidate.samuel.tan@nexskill.local', 'Samuel', 'Tan', 'Singapore')
)
INSERT INTO users (
    "Id", "FirstName", "LastName", "Location", "UserName", "NormalizedUserName", "Email", "NormalizedEmail",
    "EmailConfirmed", "PasswordHash", "SecurityStamp", "ConcurrencyStamp", "PhoneNumber", "PhoneNumberConfirmed",
    "TwoFactorEnabled", "LockoutEnd", "LockoutEnabled", "AccessFailedCount"
)
SELECT
    managed_users.id,
    managed_users.first_name,
    managed_users.last_name,
    managed_users.location,
    managed_users.email,
    upper(managed_users.email),
    managed_users.email,
    upper(managed_users.email),
    TRUE,
    template_password.password_hash,
    NULL,
    NULL,
    NULL,
    FALSE,
    FALSE,
    NULL,
    FALSE,
    0
FROM managed_users
CROSS JOIN template_password
WHERE NOT EXISTS (
    SELECT 1
    FROM users u
    WHERE u."Email" = managed_users.email
);

WITH recruiter_role_assignments (email, role_name) AS (
    VALUES
        ('recruiter@abc.com', 'Recruiter'),
        ('recruiter.ops@nexskill.local', 'Recruiter'),
        ('recruiter.product@nexskill.local', 'Recruiter'),
        ('recruiter.data@nexskill.local', 'Recruiter')
)
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
SELECT
    u."Id",
    r."Id"
FROM recruiter_role_assignments a
JOIN users u ON u."Email" = a.email
JOIN "AspNetRoles" r ON r."Name" = a.role_name
WHERE NOT EXISTS (
    SELECT 1
    FROM "AspNetUserRoles" ur
    WHERE ur."UserId" = u."Id"
      AND ur."RoleId" = r."Id"
);

WITH ctx AS (
    SELECT company_admin_company_id
    FROM trend_context
),
profiles (profile_id, email, created_at_utc) AS (
    VALUES
        ('55555555-5555-5555-5555-555555555555'::uuid, 'recruiter@abc.com', TIMESTAMPTZ '2025-10-01 02:00:00+00'),
        ('66666666-6666-6666-6666-666666666666'::uuid, 'recruiter.ops@nexskill.local', TIMESTAMPTZ '2025-10-04 02:00:00+00'),
        ('77777777-7777-7777-7777-777777777777'::uuid, 'recruiter.product@nexskill.local', TIMESTAMPTZ '2025-11-02 02:00:00+00'),
        ('88888888-8888-8888-8888-888888888888'::uuid, 'recruiter.data@nexskill.local', TIMESTAMPTZ '2026-01-05 02:00:00+00')
)
INSERT INTO recruiter_profiles (
    "Id",
    "UserId",
    "CompanyId",
    "CreatedAtUtc"
)
SELECT
    p.profile_id,
    u."Id",
    ctx.company_admin_company_id,
    p.created_at_utc
FROM profiles p
JOIN users u ON u."Email" = p.email
CROSS JOIN ctx
WHERE NOT EXISTS (
    SELECT 1
    FROM recruiter_profiles rp
    WHERE rp."UserId" = u."Id"
);

WITH abc_jobs (
    id,
    recruiter_email,
    title,
    description,
    responsibilities,
    required_skills,
    preferred_skills,
    experience_level,
    min_years,
    education,
    department,
    benefits,
    salary_min,
    salary_max,
    currency,
    location,
    schedule,
    work_setup,
    employment_type,
    status,
    created_at_utc,
    posted_at_utc,
    vacancies
) AS (
    VALUES
        ('a1000000-0000-0000-0000-000000000001'::uuid, 'recruiter@abc.com', 'Senior Full Stack Engineer', 'Lead full-stack delivery for core hiring workflows used by fast-growing regional customers.', ARRAY['Own recruiter workflow features from API contract to production UI','Improve reliability across search, pipelines, and profile views','Coordinate releases with QA and product on high-signal experiments','Help set engineering standards for maintainability and observability']::text[], ARRAY['React','TypeScript','.NET','PostgreSQL','REST APIs','System Design']::text[], ARRAY['Azure','Redis','Playwright','Monitoring']::text[], 'Senior', 5, 'Bachelor''s Degree', 'Engineering', 'Equity refresh, premium healthcare, annual learning stipend', 5400000.00, 7600000.00, 'PHP', 'Singapore', 'Mon-Fri', 1, 0, 1, TIMESTAMPTZ '2025-10-03 03:00:00+00', TIMESTAMPTZ '2025-10-05 03:00:00+00', 2),
        ('a1000000-0000-0000-0000-000000000002'::uuid, 'recruiter@abc.com', 'Platform Reliability Engineer', 'Scale infrastructure and production operations for an expanding B2B hiring platform.', ARRAY['Improve deployment safety and rollback readiness','Harden runtime observability for recruiter and jobseeker traffic','Own infrastructure guardrails, automation, and incident follow-through','Partner with backend engineers on capacity and reliability work']::text[], ARRAY['AWS','Terraform','Docker','Kubernetes','Monitoring','SRE']::text[], ARRAY['Grafana','Prometheus','GitHub Actions','Cost Optimization']::text[], 'Senior', 5, 'Bachelor''s Degree', 'Platform', 'On-call pay, hybrid setup, healthcare', 5000000.00, 7200000.00, 'PHP', 'Singapore', 'Mon-Fri with rotation', 1, 0, 1, TIMESTAMPTZ '2025-11-02 04:15:00+00', TIMESTAMPTZ '2025-11-04 04:15:00+00', 1),
        ('a1000000-0000-0000-0000-000000000003'::uuid, 'recruiter@abc.com', 'AI Solutions Engineer', 'Bridge applied AI delivery with customer-facing implementation work for automation-heavy teams.', ARRAY['Translate customer workflows into AI-backed product solutions','Partner with engineering on deployment readiness and guardrails','Support proof-of-value work for strategic accounts','Document implementation patterns and feedback loops']::text[], ARRAY['Python','APIs','Prompt Design','Customer Delivery','SQL','AI Workflows']::text[], ARRAY['LLM Evaluation','Cloud Services','Solution Design','Analytics']::text[], 'Senior', 4, 'Bachelor''s Degree', 'AI', 'Hybrid work, healthcare, bonus', 5200000.00, 7400000.00, 'PHP', 'Singapore', 'Mon-Fri', 1, 0, 2, TIMESTAMPTZ '2025-12-08 01:45:00+00', TIMESTAMPTZ '2025-12-09 01:45:00+00', 1),
        ('a1000000-0000-0000-0000-000000000004'::uuid, 'recruiter.ops@nexskill.local', 'Customer Support Specialist', 'Help customers onboard quickly and resolve account issues with empathy and speed.', ARRAY['Resolve inbound support tickets with strong product knowledge','Triage recurring issues and surface patterns to product and engineering','Keep help-center content accurate and actionable','Maintain clear customer communication during active incidents']::text[], ARRAY['Customer Support','SaaS','Troubleshooting','Documentation','Communication','CRM']::text[], ARRAY['Zendesk','SQL','Knowledge Base Management','Escalation Handling']::text[], 'Mid', 2, 'Diploma', 'Support', 'Shift allowance, healthcare, remote support budget', 2500000.00, 3400000.00, 'PHP', 'Remote', 'Shifting schedule', 2, 0, 1, TIMESTAMPTZ '2025-10-10 00:30:00+00', TIMESTAMPTZ '2025-10-12 00:30:00+00', 3),
        ('a1000000-0000-0000-0000-000000000005'::uuid, 'recruiter.ops@nexskill.local', 'Implementation Specialist', 'Guide new customers through setup, rollout, and training for fast-moving hiring teams.', ARRAY['Run structured onboarding and launch plans','Translate customer requirements into configuration steps','Coordinate handoff between sales, support, and product teams','Track launch risks, blockers, and adoption milestones']::text[], ARRAY['Implementation','Project Coordination','Stakeholder Communication','Process Mapping','SaaS','Training']::text[], ARRAY['Change Management','Technical Writing','Customer Success','Analytics']::text[], 'Mid', 3, 'Bachelor''s Degree', 'Operations', 'Performance bonus, healthcare, flexible hours', 3200000.00, 4300000.00, 'PHP', 'Manila, Philippines', 'Mon-Fri', 1, 0, 1, TIMESTAMPTZ '2025-11-18 02:40:00+00', TIMESTAMPTZ '2025-11-20 02:40:00+00', 2),
        ('a1000000-0000-0000-0000-000000000006'::uuid, 'recruiter.ops@nexskill.local', 'Revenue Operations Analyst', 'Improve routing, reporting, and operational quality across customer-facing teams.', ARRAY['Maintain dashboards and operational SLAs','Audit funnel leakage and handoff quality across teams','Partner with support and success leaders on staffing data','Improve data hygiene across CRM and internal tools']::text[], ARRAY['Operations','Analytics','SQL','CRM','Reporting','Process Improvement']::text[], ARRAY['Tableau','Forecasting','Automation','Data Quality']::text[], 'Mid', 3, 'Bachelor''s Degree', 'Revenue Operations', 'Hybrid work, wellness budget, bonus', 3600000.00, 4700000.00, 'PHP', 'Singapore', 'Mon-Fri', 1, 0, 2, TIMESTAMPTZ '2026-01-09 03:15:00+00', TIMESTAMPTZ '2026-01-11 03:15:00+00', 1),
        ('a1000000-0000-0000-0000-000000000007'::uuid, 'recruiter.product@nexskill.local', 'Product Designer', 'Shape a polished, conversion-aware product experience for recruiters and candidates.', ARRAY['Design recruiter and candidate workflows with strong interaction detail','Prototype solutions for high-friction funnel moments','Partner with product and engineering on release quality','Maintain coherent visual patterns across core dashboard surfaces']::text[], ARRAY['Product Design','Figma','UX Research','Prototyping','Interaction Design','Design Systems']::text[], ARRAY['Journey Mapping','Usability Testing','Motion Design','Content Strategy']::text[], 'Mid', 4, 'Bachelor''s Degree', 'Design', 'Remote-friendly, equipment budget, healthcare', 3800000.00, 5200000.00, 'PHP', 'Remote', 'Mon-Fri', 2, 0, 1, TIMESTAMPTZ '2025-12-02 05:10:00+00', TIMESTAMPTZ '2025-12-03 05:10:00+00', 1),
        ('a1000000-0000-0000-0000-000000000008'::uuid, 'recruiter.product@nexskill.local', 'Technical Product Manager', 'Own roadmap execution for core workflow automation and recruiter productivity features.', ARRAY['Define roadmap priorities with measurable hiring outcomes','Partner with engineering on sequencing and release tradeoffs','Use funnel data to shape experiments and backlog decisions','Communicate progress and risks clearly to stakeholders']::text[], ARRAY['Product Management','Analytics','Roadmapping','Stakeholder Management','Agile','Experimentation']::text[], ARRAY['B2B SaaS','Metrics','AI Product Thinking','SQL']::text[], 'Senior', 5, 'Bachelor''s Degree', 'Product', 'Bonus, healthcare, hybrid setup', 5200000.00, 7000000.00, 'PHP', 'Singapore', 'Mon-Fri', 1, 0, 1, TIMESTAMPTZ '2026-01-06 01:20:00+00', TIMESTAMPTZ '2026-01-08 01:20:00+00', 1),
        ('a1000000-0000-0000-0000-000000000009'::uuid, 'recruiter.data@nexskill.local', 'Data Scientist', 'Build decision-support models that improve hiring efficiency and funnel conversion quality.', ARRAY['Develop forecasting and conversion models for hiring workflows','Turn noisy operational data into decision-ready insight','Design experiments that improve recruiter productivity','Communicate assumptions and model limits clearly']::text[], ARRAY['Python','SQL','Statistics','Experimentation','Forecasting','Data Storytelling']::text[], ARRAY['Causal Inference','dbt','Looker','MLOps']::text[], 'Senior', 5, 'Master''s Degree', 'Data', 'Research budget, healthcare, hybrid setup', 5600000.00, 7600000.00, 'PHP', 'Singapore', 'Mon-Fri', 1, 0, 1, TIMESTAMPTZ '2026-01-20 04:05:00+00', TIMESTAMPTZ '2026-01-22 04:05:00+00', 1),
        ('a1000000-0000-0000-0000-000000000010'::uuid, 'recruiter.data@nexskill.local', 'ML Engineer', 'Operationalize specialized AI workflows that support matching, ranking, and quality assurance.', ARRAY['Deploy and maintain production ML pipelines','Partner with data scientists on model packaging and observability','Improve evaluation and rollback safety for ML-backed features','Collaborate with platform and product teams on production readiness']::text[], ARRAY['Python','Machine Learning','APIs','MLOps','Data Pipelines','Monitoring']::text[], ARRAY['Feature Stores','Kubernetes','Prompt Evaluation','Azure']::text[], 'Senior', 4, 'Bachelor''s Degree', 'AI', 'Hybrid work, healthcare, learning stipend', 5400000.00, 7300000.00, 'PHP', 'Singapore', 'Mon-Fri', 1, 0, 1, TIMESTAMPTZ '2026-02-10 02:50:00+00', TIMESTAMPTZ '2026-02-12 02:50:00+00', 1)
)
INSERT INTO jobs (
    "Id","CompanyId","RecruiterId","Title","Description","DescriptionEmbeddingJson","ResponsibilitiesText","RequiredSkillsJson","PreferredSkillsJson","ExperienceLevel","MinYears","Education","Department","Benefits","SalaryMinPerAnnum","SalaryMaxPerAnnum","Currency","Location","Schedule","WorkSetup","EmploymentType","PostedDateUtc","CompanyNameSnapshot","CompanyEmailSnapshot","JobDescriptionStructuredJson","NumberOfVacancies","Status","CreatedAtUtc"
)
SELECT
    j.id,
    ctx.company_admin_company_id,
    u."Id",
    j.title,
    j.description,
    jsonb_build_array(0.21, 0.34, 0.55),
    array_to_string(j.responsibilities, E'\n'),
    to_jsonb(j.required_skills),
    to_jsonb(j.preferred_skills),
    j.experience_level,
    j.min_years,
    j.education,
    j.department,
    j.benefits,
    j.salary_min,
    j.salary_max,
    j.currency,
    j.location,
    j.schedule,
    j.work_setup,
    j.employment_type,
    j.posted_at_utc,
    c."Name",
    c."PrimaryEmail",
    jsonb_build_object(
        'Title', j.title,
        'Description', j.description,
        'Responsibilities', to_jsonb(j.responsibilities),
        'RequiredSkills', to_jsonb(j.required_skills),
        'PreferredSkills', to_jsonb(j.preferred_skills),
        'MinimumYearsExperience', j.min_years,
        'MinimumEducationLevel', j.education,
        'Metadata', jsonb_build_object('department', j.department, 'experience_level', j.experience_level)
    ),
    j.vacancies,
    j.status,
    j.created_at_utc
FROM abc_jobs j
JOIN users u ON u."Email" = j.recruiter_email
CROSS JOIN trend_context ctx
JOIN companies c ON c."Id" = ctx.company_admin_company_id
ON CONFLICT ("Id") DO NOTHING;

WITH manual_progressed (
    app_key, scope_key, candidate_email, job_title, status, created_at_utc, updated_at_utc, full_name, submission_email, location, postal_code
) AS (
    VALUES
        ('fbi-shortlist-front-end-sep', 'fbi', 'candidate.ava.ng@nexskill.local', 'Frontend Developer', 'Shortlisted', TIMESTAMPTZ '2025-09-11 03:20:00+00', TIMESTAMPTZ '2025-09-14 02:00:00+00', 'Ava Ng', 'candidate.ava.ng@nexskill.local', 'Singapore', '238801'),
        ('fbi-interview-backend-nov', 'fbi', 'candidate.liam.cruz@nexskill.local', 'Senior Backend Developer', 'Interview', TIMESTAMPTZ '2025-11-13 02:45:00+00', TIMESTAMPTZ '2025-11-15 04:15:00+00', 'Liam Cruz', 'candidate.liam.cruz@nexskill.local', 'Manila, Philippines', '1630'),
        ('fbi-offer-data-dec', 'fbi', 'candidate.sophia.park@nexskill.local', 'Data Analyst', 'Offer', TIMESTAMPTZ '2025-12-08 06:10:00+00', TIMESTAMPTZ '2025-12-18 06:10:00+00', 'Sophia Park', 'candidate.sophia.park@nexskill.local', 'Singapore', '048616'),
        ('fbi-hired-ml-jan', 'fbi', 'candidate.ethan.reyes@nexskill.local', 'Machine Learning Engineer', 'Hired', TIMESTAMPTZ '2026-01-09 04:30:00+00', TIMESTAMPTZ '2026-01-31 03:15:00+00', 'Ethan Reyes', 'candidate.ethan.reyes@nexskill.local', 'Cebu, Philippines', '6000'),
        ('fbi-hired-devops-feb', 'fbi', 'candidate.mia.ong@nexskill.local', 'DevOps Engineer', 'Hired', TIMESTAMPTZ '2026-02-03 05:20:00+00', TIMESTAMPTZ '2026-02-24 04:40:00+00', 'Mia Ong', 'candidate.mia.ong@nexskill.local', 'Singapore', '188021'),
        ('fbi-shortlist-data-science-feb', 'fbi', 'candidate.lucas.yap@nexskill.local', 'Data Scientist', 'Shortlisted', TIMESTAMPTZ '2026-02-11 03:35:00+00', TIMESTAMPTZ '2026-02-15 02:30:00+00', 'Lucas Yap', 'candidate.lucas.yap@nexskill.local', 'Quezon City, Philippines', '1100'),
        ('fbi-rejected-product-feb', 'fbi', 'candidate.grace.koh@nexskill.local', 'Product Manager', 'Rejected', TIMESTAMPTZ '2026-02-18 02:10:00+00', TIMESTAMPTZ '2026-02-21 02:10:00+00', 'Grace Koh', 'candidate.grace.koh@nexskill.local', 'Singapore', '228211'),
        ('fbi-interview-support-mar', 'fbi', 'candidate.emma.tan@nexskill.local', 'Technical Support Engineer', 'Interview', TIMESTAMPTZ '2026-03-04 01:25:00+00', TIMESTAMPTZ '2026-03-18 01:25:00+00', 'Emma Tan', 'candidate.emma.tan@nexskill.local', 'Singapore', '018956'),
        ('fbi-offer-product-mar', 'fbi', 'candidate.james.lee@nexskill.local', 'Product Manager', 'Offer', TIMESTAMPTZ '2026-03-06 05:15:00+00', TIMESTAMPTZ '2026-03-20 05:15:00+00', 'James Lee', 'candidate.james.lee@nexskill.local', 'Kuala Lumpur, Malaysia', '50088'),
        ('fbi-hired-frontend-mar', 'fbi', 'candidate.olivia.chan@nexskill.local', 'Frontend Developer', 'Hired', TIMESTAMPTZ '2026-03-07 06:30:00+00', TIMESTAMPTZ '2026-03-22 04:10:00+00', 'Olivia Chan', 'candidate.olivia.chan@nexskill.local', 'Singapore', '178884'),
        ('fbi-rejected-backend-mar', 'fbi', 'candidate.henry.tiu@nexskill.local', 'Senior Backend Developer', 'Rejected', TIMESTAMPTZ '2026-03-11 01:15:00+00', TIMESTAMPTZ '2026-03-14 01:15:00+00', 'Henry Tiu', 'candidate.henry.tiu@nexskill.local', 'Taguig, Philippines', '1632'),
        ('fbi-shortlist-mlops-mar', 'fbi', 'candidate.ben.delacruz@nexskill.local', 'MLOps Engineer', 'Shortlisted', TIMESTAMPTZ '2026-03-09 03:10:00+00', TIMESTAMPTZ '2026-03-13 03:10:00+00', 'Ben Dela Cruz', 'candidate.ben.delacruz@nexskill.local', 'Taguig, Philippines', '1634'),
        ('fbi-interview-data-analyst-mar', 'fbi', 'candidate.chloe.lim@nexskill.local', 'Data Analyst', 'Interview', TIMESTAMPTZ '2026-03-12 02:20:00+00', TIMESTAMPTZ '2026-03-19 02:20:00+00', 'Chloe Lim', 'candidate.chloe.lim@nexskill.local', 'Singapore', '038989'),
        ('fbi-shortlist-backend-mar', 'fbi', 'candidate.daniel.go@nexskill.local', 'Senior Backend Developer', 'Shortlisted', TIMESTAMPTZ '2026-03-17 04:55:00+00', TIMESTAMPTZ '2026-03-20 04:55:00+00', 'Daniel Go', 'candidate.daniel.go@nexskill.local', 'Pasig, Philippines', '1605'),
        ('abc-hired-support-oct', 'abc', 'candidate.grace.koh@nexskill.local', 'Customer Support Specialist', 'Hired', TIMESTAMPTZ '2025-10-18 01:40:00+00', TIMESTAMPTZ '2025-11-06 03:30:00+00', 'Grace Koh', 'candidate.grace.koh@nexskill.local', 'Singapore', '228211'),
        ('abc-hired-implementation-nov', 'abc', 'candidate.henry.tiu@nexskill.local', 'Implementation Specialist', 'Hired', TIMESTAMPTZ '2025-11-24 04:05:00+00', TIMESTAMPTZ '2025-12-16 02:55:00+00', 'Henry Tiu', 'candidate.henry.tiu@nexskill.local', 'Taguig, Philippines', '1632'),
        ('abc-shortlist-product-dec', 'abc', 'candidate.isla.navarro@nexskill.local', 'Product Designer', 'Shortlisted', TIMESTAMPTZ '2025-12-09 02:35:00+00', TIMESTAMPTZ '2025-12-12 01:45:00+00', 'Isla Navarro', 'candidate.isla.navarro@nexskill.local', 'Davao, Philippines', '8000'),
        ('abc-offer-fullstack-jan', 'abc', 'candidate.jacob.sy@nexskill.local', 'Senior Full Stack Engineer', 'Offer', TIMESTAMPTZ '2026-01-15 05:20:00+00', TIMESTAMPTZ '2026-01-29 05:20:00+00', 'Jacob Sy', 'candidate.jacob.sy@nexskill.local', 'Singapore', '059817'),
        ('abc-rejected-platform-feb', 'abc', 'candidate.olivia.chan@nexskill.local', 'Platform Reliability Engineer', 'Rejected', TIMESTAMPTZ '2026-02-09 02:45:00+00', TIMESTAMPTZ '2026-02-13 02:45:00+00', 'Olivia Chan', 'candidate.olivia.chan@nexskill.local', 'Singapore', '178884'),
        ('abc-hired-tech-pm-feb', 'abc', 'candidate.kylie.wong@nexskill.local', 'Technical Product Manager', 'Hired', TIMESTAMPTZ '2026-02-04 03:45:00+00', TIMESTAMPTZ '2026-02-28 02:35:00+00', 'Kylie Wong', 'candidate.kylie.wong@nexskill.local', 'Singapore', '039802'),
        ('abc-offer-product-mar', 'abc', 'candidate.logan.fuentes@nexskill.local', 'Product Designer', 'Offer', TIMESTAMPTZ '2026-03-03 02:25:00+00', TIMESTAMPTZ '2026-03-18 02:25:00+00', 'Logan Fuentes', 'candidate.logan.fuentes@nexskill.local', 'Cebu, Philippines', '6000'),
        ('abc-interview-support-mar', 'abc', 'candidate.nina.choi@nexskill.local', 'Customer Support Specialist', 'Interview', TIMESTAMPTZ '2026-03-05 03:55:00+00', TIMESTAMPTZ '2026-03-15 03:55:00+00', 'Nina Choi', 'candidate.nina.choi@nexskill.local', 'Singapore', '068908'),
        ('abc-offer-revops-mar', 'abc', 'candidate.owen.santos@nexskill.local', 'Revenue Operations Analyst', 'Offer', TIMESTAMPTZ '2026-03-08 04:15:00+00', TIMESTAMPTZ '2026-03-22 04:15:00+00', 'Owen Santos', 'candidate.owen.santos@nexskill.local', 'Iloilo, Philippines', '5000'),
        ('abc-hired-data-science-mar', 'abc', 'candidate.paige.garcia@nexskill.local', 'Data Scientist', 'Hired', TIMESTAMPTZ '2026-03-09 06:10:00+00', TIMESTAMPTZ '2026-03-24 04:30:00+00', 'Paige Garcia', 'candidate.paige.garcia@nexskill.local', 'Baguio, Philippines', '2600'),
        ('abc-rejected-ai-mar', 'abc', 'candidate.mia.ong@nexskill.local', 'AI Solutions Engineer', 'Rejected', TIMESTAMPTZ '2026-03-11 04:20:00+00', TIMESTAMPTZ '2026-03-16 04:20:00+00', 'Mia Ong', 'candidate.mia.ong@nexskill.local', 'Singapore', '188021'),
        ('abc-interview-ml-mar', 'abc', 'candidate.quentin.teo@nexskill.local', 'ML Engineer', 'Interview', TIMESTAMPTZ '2026-03-10 02:40:00+00', TIMESTAMPTZ '2026-03-20 02:40:00+00', 'Quentin Teo', 'candidate.quentin.teo@nexskill.local', 'Singapore', '138636'),
        ('abc-shortlist-platform-mar', 'abc', 'candidate.ruby.lopez@nexskill.local', 'Platform Reliability Engineer', 'Shortlisted', TIMESTAMPTZ '2026-03-13 05:05:00+00', TIMESTAMPTZ '2026-03-17 05:05:00+00', 'Ruby Lopez', 'candidate.ruby.lopez@nexskill.local', 'Cagayan de Oro, Philippines', '9000'),
        ('abc-offer-ai-solutions-mar', 'abc', 'candidate.samuel.tan@nexskill.local', 'AI Solutions Engineer', 'Offer', TIMESTAMPTZ '2026-03-14 03:00:00+00', TIMESTAMPTZ '2026-03-23 03:00:00+00', 'Samuel Tan', 'candidate.samuel.tan@nexskill.local', 'Singapore', '238879')
)
INSERT INTO resume_submissions (
    "Id","CompanyId","FileName","ContentType","BlobObjectKey","JobId","AppliedJobPosition","FullName","Email","PostalCode","Location","JobSeekerUserId","Status","ParsedResumeJson","IsHiddenFromJobSeekerHistory","JobSeekerHistoryArchivedAtUtc","JobSeekerHistoryDeletedAtUtc","HireDateUtc","HiredByRecruiterId","AcceptedOfferId","CreatedAtUtc","UpdatedAtUtc"
)
SELECT
    pg_temp.seed_uuid('manual-application:' || mp.app_key),
    j."CompanyId",
    'resume-' || mp.app_key || '.pdf',
    'application/pdf',
    'seed/dashboard/' || mp.scope_key || '/' || mp.app_key || '.pdf',
    j."Id",
    j."Title",
    mp.full_name,
    mp.submission_email,
    mp.postal_code,
    mp.location,
    u."Id",
    mp.status,
    jsonb_build_object('seed', true, 'app_key', mp.app_key, 'scope', mp.scope_key),
    FALSE,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    mp.created_at_utc,
    mp.updated_at_utc
FROM manual_progressed mp
JOIN users u ON u."Email" = mp.candidate_email
JOIN jobs j
    ON j."Title" = mp.job_title
   AND (
        (mp.scope_key = 'fbi' AND j."CompanyId" = (SELECT recruiter_company_id FROM trend_context))
        OR
        (mp.scope_key = 'abc' AND j."CompanyId" = (SELECT company_admin_company_id FROM trend_context))
   )
ON CONFLICT ("Id") DO NOTHING;

WITH fbi_jobs (job_title, job_scale, reject_scale) AS (
    VALUES
        ('Frontend Developer', 1.20::numeric, 0.45::numeric),
        ('Senior Backend Developer', 1.05::numeric, 0.42::numeric),
        ('Data Analyst', 0.72::numeric, 0.22::numeric),
        ('Data Scientist', 0.52::numeric, 0.18::numeric),
        ('Product Manager', 0.44::numeric, 0.16::numeric),
        ('Technical Support Engineer', 0.66::numeric, 0.24::numeric),
        ('MLOps Engineer', 0.56::numeric, 0.20::numeric),
        ('DevOps Engineer', 0.70::numeric, 0.22::numeric)
),
month_curve (month_start, base_completed, base_rejected, day_offset) AS (
    VALUES
        (DATE '2025-08-01', 1, 0, 2),
        (DATE '2025-09-01', 1, 0, 6),
        (DATE '2025-10-01', 2, 0, 4),
        (DATE '2025-11-01', 2, 1, 8),
        (DATE '2025-12-01', 2, 1, 5),
        (DATE '2026-01-01', 3, 1, 3),
        (DATE '2026-02-01', 4, 1, 7),
        (DATE '2026-03-01', 4, 1, 12)
),
resolved_jobs AS (
    SELECT fj.job_title, fj.job_scale, fj.reject_scale, j."Id" AS job_id, j."CompanyId" AS company_id
    FROM fbi_jobs fj
    JOIN jobs j ON j."Title" = fj.job_title AND j."RecruiterId" = 'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid
),
completed_rows AS (
    SELECT rj.job_id, rj.company_id, rj.job_title, mc.month_start, mc.day_offset, gs.n
    FROM resolved_jobs rj
    CROSS JOIN month_curve mc
    CROSS JOIN LATERAL generate_series(1, GREATEST(0, floor(mc.base_completed * rj.job_scale)::int)) AS gs(n)
),
rejected_rows AS (
    SELECT rj.job_id, rj.company_id, rj.job_title, mc.month_start, mc.day_offset, gs.n
    FROM resolved_jobs rj
    CROSS JOIN month_curve mc
    CROSS JOIN LATERAL generate_series(1, GREATEST(0, floor(mc.base_rejected * rj.reject_scale)::int)) AS gs(n)
)
INSERT INTO resume_submissions (
    "Id","CompanyId","FileName","ContentType","BlobObjectKey","JobId","AppliedJobPosition","FullName","Email","PostalCode","Location","JobSeekerUserId","Status","ParsedResumeJson","IsHiddenFromJobSeekerHistory","JobSeekerHistoryArchivedAtUtc","JobSeekerHistoryDeletedAtUtc","HireDateUtc","HiredByRecruiterId","AcceptedOfferId","CreatedAtUtc","UpdatedAtUtc"
)
SELECT
    pg_temp.seed_uuid('bulk:fbi:completed:' || job_id::text || ':' || month_start::text || ':' || n::text),
    company_id,
    'resume-fbi-completed-' || n || '.pdf',
    'application/pdf',
    'seed/dashboard/fbi/completed/' || job_id::text || '/' || month_start::text || '/' || n::text || '.pdf',
    job_id,
    job_title,
    'FBI Applicant ' || n || ' - ' || job_title,
    'fbi.completed.' || replace(lower(job_title), ' ', '.') || '.' || to_char(month_start, 'YYYYMM') || '.' || n || '@example.test',
    NULL,
    CASE
        WHEN job_title IN ('Frontend Developer', 'Senior Backend Developer', 'DevOps Engineer', 'MLOps Engineer') THEN 'Singapore'
        WHEN job_title IN ('Data Analyst', 'Data Scientist') THEN 'Quezon City, Philippines'
        WHEN job_title = 'Technical Support Engineer' THEN 'Remote'
        ELSE 'Singapore'
    END,
    NULL::uuid,
    'Completed',
    jsonb_build_object('seed', true, 'type', 'bulk-completed', 'scope', 'fbi'),
    FALSE, NULL::timestamp with time zone, NULL::timestamp with time zone, NULL::timestamp with time zone, NULL::uuid, NULL::uuid,
    (month_start::timestamp + make_interval(days => LEAST(26, ((n * 2) + day_offset) % 27), hours => 8 + ((n * 3) % 9), mins => (n * 11) % 60)) AT TIME ZONE 'UTC',
    ((month_start::timestamp + make_interval(days => LEAST(26, ((n * 2) + day_offset) % 27), hours => 8 + ((n * 3) % 9), mins => (n * 11) % 60)) AT TIME ZONE 'UTC') + INTERVAL '2 days'
FROM completed_rows
UNION ALL
SELECT
    pg_temp.seed_uuid('bulk:fbi:rejected:' || job_id::text || ':' || month_start::text || ':' || n::text),
    company_id,
    'resume-fbi-rejected-' || n || '.pdf',
    'application/pdf',
    'seed/dashboard/fbi/rejected/' || job_id::text || '/' || month_start::text || '/' || n::text || '.pdf',
    job_id,
    job_title,
    'FBI Rejected Candidate ' || n || ' - ' || job_title,
    'fbi.rejected.' || replace(lower(job_title), ' ', '.') || '.' || to_char(month_start, 'YYYYMM') || '.' || n || '@example.test',
    NULL,
    'Singapore',
    NULL::uuid,
    'Rejected',
    jsonb_build_object('seed', true, 'type', 'bulk-rejected', 'scope', 'fbi'),
    FALSE, NULL::timestamp with time zone, NULL::timestamp with time zone, NULL::timestamp with time zone, NULL::uuid, NULL::uuid,
    (month_start::timestamp + make_interval(days => LEAST(24, ((n * 3) + day_offset + 4) % 25), hours => 10 + ((n * 2) % 7), mins => (n * 13) % 60)) AT TIME ZONE 'UTC',
    ((month_start::timestamp + make_interval(days => LEAST(24, ((n * 3) + day_offset + 4) % 25), hours => 10 + ((n * 2) % 7), mins => (n * 13) % 60)) AT TIME ZONE 'UTC') + INTERVAL '1 day'
FROM rejected_rows
ON CONFLICT ("Id") DO NOTHING;

WITH manual_interviews (
    app_key, interview_status, scheduled_at_utc, interview_type, location_or_link, message, created_at_utc, is_archived, archived_at_utc, cancel_reason
) AS (
    VALUES
        ('fbi-interview-backend-nov', 6, TIMESTAMPTZ '2025-11-20 02:00:00+00', 0, 'https://meet.nexskill.local/fbi-backend-nov', 'Panel interview completed after a strong technical take-home.', TIMESTAMPTZ '2025-11-15 04:15:00+00', FALSE, NULL, NULL),
        ('fbi-hired-ml-jan', 6, TIMESTAMPTZ '2026-01-18 03:00:00+00', 0, 'https://meet.nexskill.local/fbi-ml-jan', 'Final hiring manager round completed successfully.', TIMESTAMPTZ '2026-01-14 03:15:00+00', FALSE, NULL, NULL),
        ('fbi-hired-devops-feb', 6, TIMESTAMPTZ '2026-02-12 01:30:00+00', 1, 'FBI HQ - Ops War Room', 'Onsite systems design and incident review round.', TIMESTAMPTZ '2026-02-07 04:40:00+00', FALSE, NULL, NULL),
        ('fbi-interview-support-mar', 0, TIMESTAMPTZ '2026-03-30 02:00:00+00', 0, 'https://meet.nexskill.local/fbi-support-mar', 'Customer empathy and troubleshooting interview.', TIMESTAMPTZ '2026-03-18 01:25:00+00', FALSE, NULL, NULL),
        ('fbi-interview-data-analyst-mar', 1, TIMESTAMPTZ '2026-03-31 03:30:00+00', 0, 'https://meet.nexskill.local/fbi-data-analyst-mar', 'Analytical case review with hiring manager.', TIMESTAMPTZ '2026-03-19 02:20:00+00', FALSE, NULL, NULL),
        ('fbi-hired-frontend-mar', 6, TIMESTAMPTZ '2026-03-14 04:00:00+00', 0, 'https://meet.nexskill.local/fbi-frontend-mar', 'Final portfolio review completed successfully.', TIMESTAMPTZ '2026-03-10 04:10:00+00', FALSE, NULL, NULL),
        ('abc-hired-support-oct', 6, TIMESTAMPTZ '2025-10-24 01:00:00+00', 0, 'https://meet.nexskill.local/abc-support-oct', 'Fast-turn support hiring screen completed.', TIMESTAMPTZ '2025-10-20 03:30:00+00', FALSE, NULL, NULL),
        ('abc-hired-implementation-nov', 6, TIMESTAMPTZ '2025-12-02 02:00:00+00', 0, 'https://meet.nexskill.local/abc-impl-nov', 'Implementation walkthrough and stakeholder panel.', TIMESTAMPTZ '2025-11-28 02:55:00+00', FALSE, NULL, NULL),
        ('abc-hired-tech-pm-feb', 6, TIMESTAMPTZ '2026-02-16 03:00:00+00', 0, 'https://meet.nexskill.local/abc-tpm-feb', 'Product case and roadmap presentation.', TIMESTAMPTZ '2026-02-10 02:35:00+00', FALSE, NULL, NULL),
        ('abc-interview-support-mar', 1, TIMESTAMPTZ '2026-03-29 01:30:00+00', 0, 'https://meet.nexskill.local/abc-support-mar', 'Support simulation with team lead.', TIMESTAMPTZ '2026-03-15 03:55:00+00', FALSE, NULL, NULL),
        ('abc-interview-ml-mar', 0, TIMESTAMPTZ '2026-04-01 04:00:00+00', 0, 'https://meet.nexskill.local/abc-ml-mar', 'Model deployment and observability discussion.', TIMESTAMPTZ '2026-03-20 02:40:00+00', FALSE, NULL, NULL),
        ('abc-hired-data-science-mar', 6, TIMESTAMPTZ '2026-03-16 05:30:00+00', 0, 'https://meet.nexskill.local/abc-ds-mar', 'Data science hiring committee round.', TIMESTAMPTZ '2026-03-12 04:30:00+00', FALSE, NULL, NULL),
        ('abc-offer-product-mar', 5, TIMESTAMPTZ '2026-03-12 02:00:00+00', 0, 'https://meet.nexskill.local/abc-product-mar', 'Candidate paused the process after portfolio review.', TIMESTAMPTZ '2026-03-10 02:25:00+00', TRUE, TIMESTAMPTZ '2026-03-13 01:30:00+00', 'Candidate availability conflict after final scheduling')
)
INSERT INTO interviews (
    "Id","CompanyId","JobId","RecruiterId","JobSeekerId","ScheduledDateTimeUtc","InterviewType","LocationOrMeetingLink","Message","Status","CancelReason","CancelledAtUtc","IsArchived","ArchivedAtUtc","CreatedAtUtc"
)
SELECT
    pg_temp.seed_uuid('interview:' || mi.app_key),
    rs."CompanyId",
    rs."JobId",
    j."RecruiterId",
    rs."JobSeekerUserId",
    mi.scheduled_at_utc,
    mi.interview_type::integer,
    mi.location_or_link,
    mi.message,
    mi.interview_status,
    mi.cancel_reason,
    CASE WHEN mi.interview_status = 5 THEN mi.archived_at_utc ELSE NULL END,
    mi.is_archived,
    mi.archived_at_utc,
    mi.created_at_utc
FROM manual_interviews mi
JOIN resume_submissions rs ON rs."Id" = pg_temp.seed_uuid('manual-application:' || mi.app_key)
JOIN jobs j ON j."Id" = rs."JobId"
WHERE rs."JobSeekerUserId" IS NOT NULL
ON CONFLICT ("Id") DO NOTHING;

WITH manual_offers (
    app_key, offer_status, title, benefits, salary_text, salary_amount, salary_type, currency, employment_type, work_setup, start_date, end_date, expiration_date, sent_at_utc, responded_at_utc, created_at_utc, updated_at_utc, message
) AS (
    VALUES
        ('fbi-offer-data-dec', 'Expired', 'Data Analyst Offer', 'Healthcare, learning stipend, hybrid allowance', 'PHP 4,200,000 / year', 4200000.00, 'Annual', 'PHP', 'Full-time', 'Hybrid', DATE '2026-01-12', NULL, DATE '2025-12-30', TIMESTAMPTZ '2025-12-18 06:10:00+00', TIMESTAMPTZ '2025-12-31 02:10:00+00', TIMESTAMPTZ '2025-12-18 06:10:00+00', TIMESTAMPTZ '2025-12-31 02:10:00+00', 'Offer expired after the candidate paused for another process.'),
        ('fbi-hired-ml-jan', 'Accepted', 'Machine Learning Engineer Offer', 'Healthcare, hybrid setup, annual bonus', 'PHP 6,100,000 / year', 6100000.00, 'Annual', 'PHP', 'Full-time', 'Hybrid', DATE '2026-02-16', NULL, DATE '2026-02-05', TIMESTAMPTZ '2026-01-24 03:30:00+00', TIMESTAMPTZ '2026-01-29 03:00:00+00', TIMESTAMPTZ '2026-01-24 03:30:00+00', TIMESTAMPTZ '2026-01-29 03:00:00+00', 'Accepted after a strong ML systems interview.'),
        ('fbi-hired-devops-feb', 'Accepted', 'DevOps Engineer Offer', 'Healthcare, on-call stipend, remote support budget', 'PHP 6,300,000 / year', 6300000.00, 'Annual', 'PHP', 'Full-time', 'Hybrid', DATE '2026-03-16', NULL, DATE '2026-03-01', TIMESTAMPTZ '2026-02-16 02:15:00+00', TIMESTAMPTZ '2026-02-21 01:00:00+00', TIMESTAMPTZ '2026-02-16 02:15:00+00', TIMESTAMPTZ '2026-02-21 01:00:00+00', 'Accepted after the onsite reliability round.'),
        ('fbi-offer-product-mar', 'Pending', 'Product Manager Offer', 'Healthcare, equity refresh, leadership coaching', 'PHP 5,500,000 / year', 5500000.00, 'Annual', 'PHP', 'Full-time', 'Hybrid', DATE '2026-04-20', NULL, DATE '2026-04-05', TIMESTAMPTZ '2026-03-20 05:15:00+00', NULL, TIMESTAMPTZ '2026-03-20 05:15:00+00', TIMESTAMPTZ '2026-03-20 05:15:00+00', 'Offer is pending candidate review.'),
        ('fbi-hired-frontend-mar', 'Accepted', 'Frontend Developer Offer', 'Healthcare, home office budget, annual learning stipend', 'PHP 5,100,000 / year', 5100000.00, 'Annual', 'PHP', 'Full-time', 'Hybrid', DATE '2026-04-14', NULL, DATE '2026-03-28', TIMESTAMPTZ '2026-03-16 04:20:00+00', TIMESTAMPTZ '2026-03-20 06:05:00+00', TIMESTAMPTZ '2026-03-16 04:20:00+00', TIMESTAMPTZ '2026-03-20 06:05:00+00', 'Accepted quickly after the final portfolio round.'),
        ('abc-hired-support-oct', 'Accepted', 'Customer Support Specialist Offer', 'Healthcare, shift allowance, remote stipend', 'PHP 2,900,000 / year', 2900000.00, 'Annual', 'PHP', 'Full-time', 'Remote', DATE '2025-11-17', NULL, DATE '2025-11-03', TIMESTAMPTZ '2025-10-27 02:10:00+00', TIMESTAMPTZ '2025-10-31 01:10:00+00', TIMESTAMPTZ '2025-10-27 02:10:00+00', TIMESTAMPTZ '2025-10-31 01:10:00+00', 'Accepted in a fast-moving support hiring sprint.'),
        ('abc-hired-implementation-nov', 'Accepted', 'Implementation Specialist Offer', 'Healthcare, flexible hours, rollout bonus', 'PHP 3,900,000 / year', 3900000.00, 'Annual', 'PHP', 'Full-time', 'Hybrid', DATE '2026-01-05', NULL, DATE '2025-12-18', TIMESTAMPTZ '2025-12-08 03:15:00+00', TIMESTAMPTZ '2025-12-12 02:30:00+00', TIMESTAMPTZ '2025-12-08 03:15:00+00', TIMESTAMPTZ '2025-12-12 02:30:00+00', 'Accepted after implementation case and stakeholder panel.'),
        ('abc-offer-fullstack-jan', 'Pending', 'Senior Full Stack Engineer Offer', 'Equity, healthcare, hybrid setup', 'PHP 6,800,000 / year', 6800000.00, 'Annual', 'PHP', 'Full-time', 'Hybrid', DATE '2026-03-02', NULL, DATE '2026-02-06', TIMESTAMPTZ '2026-01-29 05:20:00+00', NULL, TIMESTAMPTZ '2026-01-29 05:20:00+00', TIMESTAMPTZ '2026-01-29 05:20:00+00', 'Offer remains open during notice-period discussions.'),
        ('abc-hired-tech-pm-feb', 'Accepted', 'Technical Product Manager Offer', 'Bonus, healthcare, hybrid setup', 'PHP 6,200,000 / year', 6200000.00, 'Annual', 'PHP', 'Full-time', 'Hybrid', DATE '2026-03-17', NULL, DATE '2026-03-05', TIMESTAMPTZ '2026-02-21 03:15:00+00', TIMESTAMPTZ '2026-02-26 02:20:00+00', TIMESTAMPTZ '2026-02-21 03:15:00+00', TIMESTAMPTZ '2026-02-26 02:20:00+00', 'Accepted after a strong cross-functional case presentation.'),
        ('abc-offer-product-mar', 'Cancelled', 'Product Designer Offer', 'Equipment allowance, healthcare, remote-friendly setup', 'PHP 4,400,000 / year', 4400000.00, 'Annual', 'PHP', 'Full-time', 'Remote', DATE '2026-04-21', NULL, DATE '2026-03-26', TIMESTAMPTZ '2026-03-18 02:25:00+00', TIMESTAMPTZ '2026-03-25 02:05:00+00', TIMESTAMPTZ '2026-03-18 02:25:00+00', TIMESTAMPTZ '2026-03-25 02:05:00+00', 'Offer was cancelled after schedule and availability changed.'),
        ('abc-offer-revops-mar', 'Expired', 'Revenue Operations Analyst Offer', 'Hybrid setup, healthcare, wellness budget', 'PHP 4,100,000 / year', 4100000.00, 'Annual', 'PHP', 'Full-time', 'Hybrid', DATE '2026-04-27', NULL, DATE '2026-03-31', TIMESTAMPTZ '2026-03-22 04:15:00+00', TIMESTAMPTZ '2026-04-01 01:10:00+00', TIMESTAMPTZ '2026-03-22 04:15:00+00', TIMESTAMPTZ '2026-04-01 01:10:00+00', 'Offer expired after the candidate accepted a competing role.'),
        ('abc-hired-data-science-mar', 'Accepted', 'Data Scientist Offer', 'Research budget, healthcare, hybrid work', 'PHP 6,600,000 / year', 6600000.00, 'Annual', 'PHP', 'Full-time', 'Hybrid', DATE '2026-04-20', NULL, DATE '2026-03-27', TIMESTAMPTZ '2026-03-18 05:10:00+00', TIMESTAMPTZ '2026-03-22 03:45:00+00', TIMESTAMPTZ '2026-03-18 05:10:00+00', TIMESTAMPTZ '2026-03-22 03:45:00+00', 'Accepted after the final model evaluation discussion.'),
        ('abc-offer-ai-solutions-mar', 'Pending', 'AI Solutions Engineer Offer', 'Bonus, healthcare, hybrid work', 'PHP 6,000,000 / year', 6000000.00, 'Annual', 'PHP', 'Full-time', 'Hybrid', DATE '2026-04-28', NULL, DATE '2026-04-04', TIMESTAMPTZ '2026-03-23 03:00:00+00', NULL, TIMESTAMPTZ '2026-03-23 03:00:00+00', TIMESTAMPTZ '2026-03-23 03:00:00+00', 'Offer is open while the candidate reviews travel expectations.')
)
INSERT INTO job_offers (
    "Id","ApplicationId","SentByUserId","Title","Message","Benefits","SalaryText","SalaryAmount","SalaryType","Currency","EmploymentType","WorkSetup","StartDate","EndDate","ExpirationDate","Status","SentAtUtc","RespondedAtUtc","CreatedAtUtc","UpdatedAtUtc"
)
SELECT
    pg_temp.seed_uuid('offer:' || mo.app_key),
    rs."Id",
    j."RecruiterId",
    mo.title,
    mo.message,
    mo.benefits,
    mo.salary_text,
    mo.salary_amount,
    mo.salary_type,
    mo.currency,
    mo.employment_type,
    mo.work_setup,
    mo.start_date::date,
    mo.end_date::date,
    mo.expiration_date::date,
    mo.offer_status,
    mo.sent_at_utc,
    mo.responded_at_utc,
    mo.created_at_utc,
    mo.updated_at_utc
FROM manual_offers mo
JOIN resume_submissions rs ON rs."Id" = pg_temp.seed_uuid('manual-application:' || mo.app_key)
JOIN jobs j ON j."Id" = rs."JobId"
ON CONFLICT ("Id") DO NOTHING;

WITH manual_hires (app_key, hired_at_utc, hire_status) AS (
    VALUES
        ('fbi-hired-ml-jan', TIMESTAMPTZ '2026-01-31 03:15:00+00', 'Active'),
        ('fbi-hired-devops-feb', TIMESTAMPTZ '2026-02-24 04:40:00+00', 'Active'),
        ('fbi-hired-frontend-mar', TIMESTAMPTZ '2026-03-22 04:10:00+00', 'Active'),
        ('abc-hired-support-oct', TIMESTAMPTZ '2025-11-06 03:30:00+00', 'Active'),
        ('abc-hired-implementation-nov', TIMESTAMPTZ '2025-12-16 02:55:00+00', 'Active'),
        ('abc-hired-tech-pm-feb', TIMESTAMPTZ '2026-02-28 02:35:00+00', 'Active'),
        ('abc-hired-data-science-mar', TIMESTAMPTZ '2026-03-24 04:30:00+00', 'Active')
)
INSERT INTO hires (
    "Id","CompanyId","RecruiterId","JobSeekerId","JobId","OfferId","ApplicationId","HiredAtUtc","Status","CreatedAtUtc","UpdatedAtUtc"
)
SELECT
    pg_temp.seed_uuid('hire:' || mh.app_key),
    rs."CompanyId",
    j."RecruiterId",
    rs."JobSeekerUserId",
    rs."JobId",
    pg_temp.seed_uuid('offer:' || mh.app_key),
    rs."Id",
    mh.hired_at_utc,
    mh.hire_status,
    mh.hired_at_utc,
    mh.hired_at_utc + INTERVAL '1 hour'
FROM manual_hires mh
JOIN resume_submissions rs ON rs."Id" = pg_temp.seed_uuid('manual-application:' || mh.app_key)
JOIN jobs j ON j."Id" = rs."JobId"
WHERE rs."JobSeekerUserId" IS NOT NULL
ON CONFLICT ("Id") DO NOTHING;

UPDATE resume_submissions rs
SET
    "HireDateUtc" = h."HiredAtUtc",
    "HiredByRecruiterId" = h."RecruiterId",
    "AcceptedOfferId" = h."OfferId",
    "UpdatedAtUtc" = GREATEST(rs."UpdatedAtUtc", h."HiredAtUtc")
FROM hires h
WHERE rs."Id" = h."ApplicationId";

UPDATE companies
SET "UpdatedAtUtc" = TIMESTAMPTZ '2026-03-27 07:30:00+00'
WHERE "Id" = (SELECT recruiter_company_id FROM trend_context);

UPDATE companies
SET "UpdatedAtUtc" = TIMESTAMPTZ '2026-03-27 08:15:00+00'
WHERE "Id" = (SELECT company_admin_company_id FROM trend_context);

COMMIT;

WITH abc_jobs (job_title, job_scale, reject_scale) AS (
    VALUES
        ('Senior Full Stack Engineer', 0.92::numeric, 0.22::numeric),
        ('Platform Reliability Engineer', 0.62::numeric, 0.14::numeric),
        ('AI Solutions Engineer', 0.34::numeric, 0.09::numeric),
        ('Customer Support Specialist', 1.05::numeric, 0.24::numeric),
        ('Implementation Specialist', 0.84::numeric, 0.20::numeric),
        ('Revenue Operations Analyst', 0.52::numeric, 0.16::numeric),
        ('Product Designer', 0.42::numeric, 0.10::numeric),
        ('Technical Product Manager', 0.46::numeric, 0.12::numeric),
        ('Data Scientist', 0.36::numeric, 0.09::numeric),
        ('ML Engineer', 0.30::numeric, 0.08::numeric)
),
month_curve (month_start, base_completed, base_rejected, day_offset) AS (
    VALUES
        (DATE '2025-10-01', 1, 0, 1),
        (DATE '2025-11-01', 1, 0, 5),
        (DATE '2025-12-01', 1, 1, 8),
        (DATE '2026-01-01', 2, 1, 4),
        (DATE '2026-02-01', 3, 1, 7),
        (DATE '2026-03-01', 3, 1, 10)
),
resolved_jobs AS (
    SELECT aj.job_title, aj.job_scale, aj.reject_scale, j."Id" AS job_id, j."CompanyId" AS company_id
    FROM abc_jobs aj
    JOIN jobs j ON j."Title" = aj.job_title AND j."CompanyId" = (SELECT company_admin_company_id FROM trend_context)
),
completed_rows AS (
    SELECT rj.job_id, rj.company_id, rj.job_title, mc.month_start, mc.day_offset, gs.n
    FROM resolved_jobs rj
    CROSS JOIN month_curve mc
    CROSS JOIN LATERAL generate_series(1, GREATEST(0, floor(mc.base_completed * rj.job_scale)::int)) AS gs(n)
),
rejected_rows AS (
    SELECT rj.job_id, rj.company_id, rj.job_title, mc.month_start, mc.day_offset, gs.n
    FROM resolved_jobs rj
    CROSS JOIN month_curve mc
    CROSS JOIN LATERAL generate_series(1, GREATEST(0, floor(mc.base_rejected * rj.reject_scale)::int)) AS gs(n)
)
INSERT INTO resume_submissions (
    "Id","CompanyId","FileName","ContentType","BlobObjectKey","JobId","AppliedJobPosition","FullName","Email","PostalCode","Location","JobSeekerUserId","Status","ParsedResumeJson","IsHiddenFromJobSeekerHistory","JobSeekerHistoryArchivedAtUtc","JobSeekerHistoryDeletedAtUtc","HireDateUtc","HiredByRecruiterId","AcceptedOfferId","CreatedAtUtc","UpdatedAtUtc"
)
SELECT
    pg_temp.seed_uuid('bulk:abc:completed:' || job_id::text || ':' || month_start::text || ':' || n::text),
    company_id,
    'resume-abc-completed-' || n || '.pdf',
    'application/pdf',
    'seed/dashboard/abc/completed/' || job_id::text || '/' || month_start::text || '/' || n::text || '.pdf',
    job_id,
    job_title,
    'ABC Applicant ' || n || ' - ' || job_title,
    'abc.completed.' || replace(lower(job_title), ' ', '.') || '.' || to_char(month_start, 'YYYYMM') || '.' || n || '@example.test',
    NULL,
    CASE WHEN job_title IN ('Customer Support Specialist', 'Implementation Specialist') THEN 'Manila, Philippines' ELSE 'Singapore' END,
    NULL::uuid,
    'Completed',
    jsonb_build_object('seed', true, 'type', 'bulk-completed', 'scope', 'abc'),
    FALSE, NULL::timestamp with time zone, NULL::timestamp with time zone, NULL::timestamp with time zone, NULL::uuid, NULL::uuid,
    (month_start::timestamp + make_interval(days => LEAST(25, ((n * 2) + day_offset) % 26), hours => 9 + ((n * 4) % 8), mins => (n * 7) % 60)) AT TIME ZONE 'UTC',
    ((month_start::timestamp + make_interval(days => LEAST(25, ((n * 2) + day_offset) % 26), hours => 9 + ((n * 4) % 8), mins => (n * 7) % 60)) AT TIME ZONE 'UTC') + INTERVAL '2 days'
FROM completed_rows
UNION ALL
SELECT
    pg_temp.seed_uuid('bulk:abc:rejected:' || job_id::text || ':' || month_start::text || ':' || n::text),
    company_id,
    'resume-abc-rejected-' || n || '.pdf',
    'application/pdf',
    'seed/dashboard/abc/rejected/' || job_id::text || '/' || month_start::text || '/' || n::text || '.pdf',
    job_id,
    job_title,
    'ABC Rejected Candidate ' || n || ' - ' || job_title,
    'abc.rejected.' || replace(lower(job_title), ' ', '.') || '.' || to_char(month_start, 'YYYYMM') || '.' || n || '@example.test',
    NULL,
    'Singapore',
    NULL::uuid,
    'Rejected',
    jsonb_build_object('seed', true, 'type', 'bulk-rejected', 'scope', 'abc'),
    FALSE, NULL::timestamp with time zone, NULL::timestamp with time zone, NULL::timestamp with time zone, NULL::uuid, NULL::uuid,
    (month_start::timestamp + make_interval(days => LEAST(22, ((n * 4) + day_offset + 2) % 23), hours => 10 + ((n * 2) % 7), mins => (n * 17) % 60)) AT TIME ZONE 'UTC',
    ((month_start::timestamp + make_interval(days => LEAST(22, ((n * 4) + day_offset + 2) % 23), hours => 10 + ((n * 2) % 7), mins => (n * 17) % 60)) AT TIME ZONE 'UTC') + INTERVAL '1 day'
FROM rejected_rows
ON CONFLICT ("Id") DO NOTHING;
