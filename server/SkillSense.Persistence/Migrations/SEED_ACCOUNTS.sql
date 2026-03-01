

BEGIN;


CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Roles (Guid key schema)
INSERT INTO "AspNetRoles" ("Id", "Name", "NormalizedName", "ConcurrencyStamp")
SELECT gen_random_uuid(), r.name, UPPER(r.name), gen_random_uuid()::text
FROM (VALUES ('Admin'), ('Recruiter')) AS r(name)
WHERE NOT EXISTS (
    SELECT 1 FROM "AspNetRoles" ar WHERE ar."NormalizedName" = UPPER(r.name)
);

-- Admin account
WITH role_admin AS (
    SELECT "Id" AS role_id FROM "AspNetRoles" WHERE "NormalizedName" = 'ADMIN' LIMIT 1
),
admin_user AS (
    INSERT INTO "users" (
        "Id", "UserName", "NormalizedUserName", "Email", "NormalizedEmail",
        "EmailConfirmed", "PasswordHash", "SecurityStamp", "ConcurrencyStamp",
        "PhoneNumberConfirmed", "TwoFactorEnabled", "LockoutEnabled", "AccessFailedCount"
    )
    SELECT
        gen_random_uuid(),
        'admin@nexskill.local', 'ADMIN@NEXSKILL.LOCAL',
        'admin@nexskill.local', 'ADMIN@NEXSKILL.LOCAL',
        TRUE,
        'AQAAAAIAAYagAAAAEPXLqKQsOsJH538dtg1xdRDz2/TglPnBHz7TMWGH0lQZG2rycMiENNUWy9bf3Z7XZg==',
        gen_random_uuid()::text,
        gen_random_uuid()::text,
        FALSE, FALSE, FALSE, 0
    WHERE NOT EXISTS (
        SELECT 1 FROM "users" u WHERE u."NormalizedEmail" = 'ADMIN@NEXSKILL.LOCAL'
    )
    RETURNING "Id"
),
admin_any_user AS (
    SELECT "Id" AS user_id FROM admin_user
    UNION ALL
    SELECT "Id" AS user_id FROM "users" WHERE "NormalizedEmail" = 'ADMIN@NEXSKILL.LOCAL' LIMIT 1
)
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
SELECT a.user_id, r.role_id
FROM admin_any_user a
CROSS JOIN role_admin r
WHERE NOT EXISTS (
    SELECT 1 FROM "AspNetUserRoles" ur WHERE ur."UserId" = a.user_id AND ur."RoleId" = r.role_id
);

INSERT INTO admin_profiles ("Id", "UserId", "CreatedAtUtc")
SELECT gen_random_uuid(), u."Id", NOW() AT TIME ZONE 'UTC'
FROM "users" u
WHERE u."NormalizedEmail" = 'ADMIN@NEXSKILL.LOCAL'
  AND NOT EXISTS (SELECT 1 FROM admin_profiles p WHERE p."UserId" = u."Id");

-- Recruiter account
WITH role_recruiter AS (
    SELECT "Id" AS role_id FROM "AspNetRoles" WHERE "NormalizedName" = 'RECRUITER' LIMIT 1
),
recruiter_user AS (
    INSERT INTO "users" (
        "Id", "UserName", "NormalizedUserName", "Email", "NormalizedEmail",
        "EmailConfirmed", "PasswordHash", "SecurityStamp", "ConcurrencyStamp",
        "PhoneNumberConfirmed", "TwoFactorEnabled", "LockoutEnabled", "AccessFailedCount"
    )
    SELECT
        gen_random_uuid(),
        'recruiter@nexskill.local', 'RECRUITER@NEXSKILL.LOCAL',
        'recruiter@nexskill.local', 'RECRUITER@NEXSKILL.LOCAL',
        TRUE,
        'AQAAAAIAAYagAAAAEPrySXLonP3OeZTpH312UsOUgrAB+U4x27VJ06rsVTeFxkzYO680JgB/PkF2F61JSw==',
        gen_random_uuid()::text,
        gen_random_uuid()::text,
        FALSE, FALSE, FALSE, 0
    WHERE NOT EXISTS (
        SELECT 1 FROM "users" u WHERE u."NormalizedEmail" = 'RECRUITER@NEXSKILL.LOCAL'
    )
    RETURNING "Id"
),
recruiter_any_user AS (
    SELECT "Id" AS user_id FROM recruiter_user
    UNION ALL
    SELECT "Id" AS user_id FROM "users" WHERE "NormalizedEmail" = 'RECRUITER@NEXSKILL.LOCAL' LIMIT 1
)
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
SELECT a.user_id, r.role_id
FROM recruiter_any_user a
CROSS JOIN role_recruiter r
WHERE NOT EXISTS (
    SELECT 1 FROM "AspNetUserRoles" ur WHERE ur."UserId" = a.user_id AND ur."RoleId" = r.role_id
);

INSERT INTO recruiter_profiles ("Id", "UserId", "CreatedAtUtc")
SELECT gen_random_uuid(), u."Id", NOW() AT TIME ZONE 'UTC'
FROM "users" u
WHERE u."NormalizedEmail" = 'RECRUITER@NEXSKILL.LOCAL'
  AND NOT EXISTS (SELECT 1 FROM recruiter_profiles p WHERE p."UserId" = u."Id");

COMMIT;


