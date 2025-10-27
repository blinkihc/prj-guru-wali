-- Check presence of Phase 2 tables/columns
-- Created: 2025-10-19
SELECT name FROM sqlite_master WHERE type='table' AND name='report_cover_illustrations';
SELECT COUNT(*) AS has_logo_dinas FROM pragma_table_info('school_profiles') WHERE name='logo_dinas_url';
SELECT COUNT(*) AS has_photo_url FROM pragma_table_info('students') WHERE name='photo_url';
