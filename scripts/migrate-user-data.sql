-- Reassigns all data owned by FROM_USER to TO_USER.
-- Affected tables: items, list_entries, inventory_notes.
-- Sessions are NOT migrated (they're tied to login cookies).
--
-- Usage:
--   1. Stop the app (so nothing writes mid-migration).
--   2. Back up the DB:    cp data/db.sqlite data/db.sqlite.bak
--   3. Edit FROM_USERNAME and TO_USERNAME below.
--   4. Run:               sqlite3 data/db.sqlite < scripts/migrate-user-data.sql
--   5. Restart the app.

BEGIN TRANSACTION;

-- === EDIT THESE TWO LINES ===
CREATE TEMP TABLE _migration AS
SELECT
  (SELECT id FROM users WHERE username = 'dev')        AS from_id,
  (SELECT id FROM users WHERE username = 'REPLACE_ME') AS to_id;
-- ============================

-- Sanity check: both users must exist and must differ.
-- A failed CHECK constraint aborts the transaction (RAISE() only works inside triggers).
CREATE TEMP TABLE _guard (
  ok INTEGER CHECK (ok = 1)
);
INSERT INTO _guard (ok) VALUES (
  CASE
    WHEN (SELECT from_id FROM _migration) IS NULL THEN 0  -- FROM user not found
    WHEN (SELECT to_id   FROM _migration) IS NULL THEN 0  -- TO user not found
    WHEN (SELECT from_id FROM _migration)
       = (SELECT to_id   FROM _migration) THEN 0          -- FROM and TO are the same
    ELSE 1
  END
);

-- Show counts before.
SELECT 'items (before)' AS label, COUNT(*) AS n FROM items         WHERE user_id = (SELECT from_id FROM _migration)
UNION ALL
SELECT 'list_entries (before)',    COUNT(*)   FROM list_entries    WHERE user_id = (SELECT from_id FROM _migration)
UNION ALL
SELECT 'inventory_notes (before)', COUNT(*)   FROM inventory_notes WHERE user_id = (SELECT from_id FROM _migration);

UPDATE items
   SET user_id = (SELECT to_id FROM _migration)
 WHERE user_id = (SELECT from_id FROM _migration);

UPDATE list_entries
   SET user_id = (SELECT to_id FROM _migration)
 WHERE user_id = (SELECT from_id FROM _migration);

UPDATE inventory_notes
   SET user_id = (SELECT to_id FROM _migration)
 WHERE user_id = (SELECT from_id FROM _migration);

-- Show counts after (should be 0 for FROM, populated for TO).
SELECT 'items (from, after)' AS label, COUNT(*) AS n FROM items         WHERE user_id = (SELECT from_id FROM _migration)
UNION ALL
SELECT 'items (to, after)',            COUNT(*)   FROM items         WHERE user_id = (SELECT to_id FROM _migration)
UNION ALL
SELECT 'list_entries (to, after)',     COUNT(*)   FROM list_entries  WHERE user_id = (SELECT to_id FROM _migration)
UNION ALL
SELECT 'inventory_notes (to, after)',  COUNT(*)   FROM inventory_notes WHERE user_id = (SELECT to_id FROM _migration);

COMMIT;
