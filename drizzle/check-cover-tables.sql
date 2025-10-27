-- Check if cover-related tables and columns exist
-- Run this to verify Phase 2 cover migration

-- Check if report_cover_illustrations table exists
SELECT name FROM sqlite_master WHERE type='table' AND name='report_cover_illustrations';

-- Check if school_profiles has logo columns
PRAGMA table_info(school_profiles);

-- Count illustrations
SELECT COUNT(*) as illustration_count FROM report_cover_illustrations;

-- Check school profiles with logos
SELECT 
  id,
  user_id,
  school_name,
  logo_dinas_url,
  logo_sekolah_url
FROM school_profiles;
