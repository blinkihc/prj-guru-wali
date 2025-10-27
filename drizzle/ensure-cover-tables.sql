-- Ensure cover-related tables exist (idempotent)
-- Run this if you get "table not found" errors

-- Create report_cover_illustrations table if not exists
CREATE TABLE IF NOT EXISTS `report_cover_illustrations` (
	`id` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`label` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Note: SQLite doesn't support ADD COLUMN IF NOT EXISTS
-- You need to check manually if columns exist before running:
-- ALTER TABLE `school_profiles` ADD `logo_dinas_url` text;
-- ALTER TABLE `school_profiles` ADD `logo_sekolah_url` text;

-- Check if columns exist
PRAGMA table_info(school_profiles);
