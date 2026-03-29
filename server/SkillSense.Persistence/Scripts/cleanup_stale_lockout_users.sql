-- Review suspicious legacy lockout rows first. This script does NOT use
-- LockoutEnd to infer business inactivity.
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

-- Optional cleanup for suspicious legacy security lockouts. This only clears
-- the security lockout fields and preserves business status in IsActive.
UPDATE users
SET
    "LockoutEnd" = NULL,
    "AccessFailedCount" = 0
WHERE "LockoutEnabled" = TRUE
  AND "IsActive" = TRUE
  AND "LockoutEnd" >= TIMESTAMPTZ '9999-01-01 00:00:00+00';
