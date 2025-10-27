-- List tables in current D1 database
-- Created: 2025-10-19
SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name;
