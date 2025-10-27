-- Check if tables exist in Wrangler D1
SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;
