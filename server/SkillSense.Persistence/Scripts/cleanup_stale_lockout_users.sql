-- Review first:
SELECT
    "Id",
    "Email",
    "IsActive",
    "LockoutEnabled",
    "LockoutEnd",
    "AccessFailedCount"
FROM users
WHERE "LockoutEnd" >= TIMESTAMPTZ '9999-01-01 00:00:00+00'
ORDER BY "Email";

-- Reactivate accounts that were unintentionally marked inactive by the old
-- LockoutEnd-based activation logic. Keep the WHERE clause targeted if you
-- need to exclude intentionally deactivated accounts.
UPDATE users
SET
    "IsActive" = TRUE,
    "LockoutEnd" = NULL,
    "AccessFailedCount" = 0
WHERE "LockoutEnd" >= TIMESTAMPTZ '9999-01-01 00:00:00+00';
