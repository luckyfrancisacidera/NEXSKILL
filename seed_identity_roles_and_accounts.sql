BEGIN;

-- ==========================================================
-- ASP.NET Core Identity seed data for PostgreSQL
-- Project-specific schema note:
-- - roles table:      "AspNetRoles"
-- - users table:      "users"
-- - user-role table:  "AspNetUserRoles"
--
-- Safe to run multiple times.
-- Default password for all seeded users: P@ssword123
-- ==========================================================

-- ----------------------------------------------------------
-- Seed roles into "AspNetRoles"
-- ----------------------------------------------------------
INSERT INTO "AspNetRoles" ("Id", "Name", "NormalizedName", "ConcurrencyStamp")
SELECT
    '11111111-1111-1111-1111-111111111111'::uuid,
    'SuperAdmin',
    'SUPERADMIN',
    '11111111-aaaa-4444-8888-111111111111'
WHERE NOT EXISTS (
    SELECT 1
    FROM "AspNetRoles"
    WHERE "NormalizedName" = 'SUPERADMIN'
);

INSERT INTO "AspNetRoles" ("Id", "Name", "NormalizedName", "ConcurrencyStamp")
SELECT
    '22222222-2222-2222-2222-222222222222'::uuid,
    'CompanyAdmin',
    'COMPANYADMIN',
    '22222222-bbbb-4444-8888-222222222222'
WHERE NOT EXISTS (
    SELECT 1
    FROM "AspNetRoles"
    WHERE "NormalizedName" = 'COMPANYADMIN'
);

INSERT INTO "AspNetRoles" ("Id", "Name", "NormalizedName", "ConcurrencyStamp")
SELECT
    '33333333-3333-3333-3333-333333333333'::uuid,
    'Recruiter',
    'RECRUITER',
    '33333333-cccc-4444-8888-333333333333'
WHERE NOT EXISTS (
    SELECT 1
    FROM "AspNetRoles"
    WHERE "NormalizedName" = 'RECRUITER'
);

-- ----------------------------------------------------------
-- Seed users into "users"
-- Password hash values were generated using the standard
-- ASP.NET Core Identity PasswordHasher for password:
-- P@ssword123
-- ----------------------------------------------------------
INSERT INTO "users"
(
    "Id",
    "UserName",
    "NormalizedUserName",
    "Email",
    "NormalizedEmail",
    "EmailConfirmed",
    "PasswordHash",
    "SecurityStamp",
    "ConcurrencyStamp",
    "PhoneNumberConfirmed",
    "TwoFactorEnabled",
    "LockoutEnabled",
    "AccessFailedCount"
)
SELECT
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
    'superadmin@nexskill.local',
    'SUPERADMIN@NEXSKILL.LOCAL',
    'superadmin@nexskill.local',
    'SUPERADMIN@NEXSKILL.LOCAL',
    TRUE,
    'AQAAAAEAAYagAAAAEPceGFSXsiM22hvWkayXr3bY20/TsRCFDCitxhz9RYYZ/3CoBJ1P5RihbaeWRbQw/Q==',
    'aaaaaaaa-1111-4444-8888-aaaaaaaaaaaa',
    'aaaaaaaa-2222-4444-8888-aaaaaaaaaaaa',
    FALSE,
    FALSE,
    FALSE,
    0
WHERE NOT EXISTS (
    SELECT 1
    FROM "users"
    WHERE "NormalizedEmail" = 'SUPERADMIN@NEXSKILL.LOCAL'
);

INSERT INTO "users"
(
    "Id",
    "UserName",
    "NormalizedUserName",
    "Email",
    "NormalizedEmail",
    "EmailConfirmed",
    "PasswordHash",
    "SecurityStamp",
    "ConcurrencyStamp",
    "PhoneNumberConfirmed",
    "TwoFactorEnabled",
    "LockoutEnabled",
    "AccessFailedCount"
)
SELECT
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
    'companyadmin@nexskill.local',
    'COMPANYADMIN@NEXSKILL.LOCAL',
    'companyadmin@nexskill.local',
    'COMPANYADMIN@NEXSKILL.LOCAL',
    TRUE,
    'AQAAAAEAAYagAAAAEETrrwJCA605s0ylmmjEaZakBtQcXNMS9YhjUVTXXW+sjUU856zwmBjCcqhSgTewlQ==',
    'bbbbbbbb-1111-4444-8888-bbbbbbbbbbbb',
    'bbbbbbbb-2222-4444-8888-bbbbbbbbbbbb',
    FALSE,
    FALSE,
    FALSE,
    0
WHERE NOT EXISTS (
    SELECT 1
    FROM "users"
    WHERE "NormalizedEmail" = 'COMPANYADMIN@NEXSKILL.LOCAL'
);

INSERT INTO "users"
(
    "Id",
    "UserName",
    "NormalizedUserName",
    "Email",
    "NormalizedEmail",
    "EmailConfirmed",
    "PasswordHash",
    "SecurityStamp",
    "ConcurrencyStamp",
    "PhoneNumberConfirmed",
    "TwoFactorEnabled",
    "LockoutEnabled",
    "AccessFailedCount"
)
SELECT
    'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid,
    'recruiter@nexskill.local',
    'RECRUITER@NEXSKILL.LOCAL',
    'recruiter@nexskill.local',
    'RECRUITER@NEXSKILL.LOCAL',
    TRUE,
    'AQAAAAEAAYagAAAAEKKhHTNOgwXBbtNCS6M+bbta2HhBGVFS2Qu+1FrWGQioG107J2oaQTyHNjoxzPVzsA==',
    'cccccccc-1111-4444-8888-cccccccccccc',
    'cccccccc-2222-4444-8888-cccccccccccc',
    FALSE,
    FALSE,
    FALSE,
    0
WHERE NOT EXISTS (
    SELECT 1
    FROM "users"
    WHERE "NormalizedEmail" = 'RECRUITER@NEXSKILL.LOCAL'
);

-- ----------------------------------------------------------
-- Assign users to roles through "AspNetUserRoles"
-- ----------------------------------------------------------
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
SELECT
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid
WHERE NOT EXISTS (
    SELECT 1
    FROM "AspNetUserRoles"
    WHERE "UserId" = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid
      AND "RoleId" = '11111111-1111-1111-1111-111111111111'::uuid
);

INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
SELECT
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
    '22222222-2222-2222-2222-222222222222'::uuid
WHERE NOT EXISTS (
    SELECT 1
    FROM "AspNetUserRoles"
    WHERE "UserId" = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid
      AND "RoleId" = '22222222-2222-2222-2222-222222222222'::uuid
);

INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
SELECT
    'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid,
    '33333333-3333-3333-3333-333333333333'::uuid
WHERE NOT EXISTS (
    SELECT 1
    FROM "AspNetUserRoles"
    WHERE "UserId" = 'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid
      AND "RoleId" = '33333333-3333-3333-3333-333333333333'::uuid
);

COMMIT;
