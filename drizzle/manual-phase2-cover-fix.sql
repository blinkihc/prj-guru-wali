-- Manual patch: ensure cover-related schema exists
-- Created: 2025-10-19
CREATE TABLE IF NOT EXISTS report_cover_illustrations (
  id TEXT PRIMARY KEY NOT NULL,
  url TEXT NOT NULL,
  label TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE school_profiles ADD COLUMN logo_dinas_url TEXT;
ALTER TABLE school_profiles ADD COLUMN logo_sekolah_url TEXT;
