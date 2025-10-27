-- Check logo columns in school_profiles
-- Created: 2025-10-19
SELECT COUNT(*) AS has_logo_dinas FROM pragma_table_info('school_profiles') WHERE name='logo_dinas_url';
SELECT COUNT(*) AS has_logo_sekolah FROM pragma_table_info('school_profiles') WHERE name='logo_sekolah_url';
