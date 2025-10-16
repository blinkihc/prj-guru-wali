-- Guru Wali Database Schema
-- Generated: 2025-10-16

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  hashed_password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  nip_nuptk TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  nisn TEXT NOT NULL UNIQUE,
  classroom TEXT NOT NULL,
  gender TEXT NOT NULL,
  birth_date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Monthly journals table
CREATE TABLE IF NOT EXISTS monthly_journals (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  academic_progress TEXT NOT NULL,
  social_behavior TEXT NOT NULL,
  emotional_state TEXT NOT NULL,
  physical_health TEXT NOT NULL,
  spiritual_development TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Meeting logs table
CREATE TABLE IF NOT EXISTS meeting_logs (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  meeting_date TEXT NOT NULL,
  meeting_type TEXT NOT NULL,
  topic TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Interventions table
CREATE TABLE IF NOT EXISTS interventions (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  issue_description TEXT NOT NULL,
  action_taken TEXT NOT NULL,
  result TEXT NOT NULL,
  intervention_date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- School profiles table
CREATE TABLE IF NOT EXISTS school_profiles (
  id TEXT PRIMARY KEY,
  school_name TEXT NOT NULL,
  education_stage TEXT NOT NULL,
  city_district TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes will be created after tables are confirmed working
-- CREATE INDEX IF NOT EXISTS idx_students_nisn ON students(nisn);
-- CREATE INDEX IF NOT EXISTS idx_monthly_journals_student ON monthly_journals(student_id);
-- CREATE INDEX IF NOT EXISTS idx_monthly_journals_date ON monthly_journals(year, month);
-- CREATE INDEX IF NOT EXISTS idx_meeting_logs_student ON meeting_logs(student_id);
-- CREATE INDEX IF NOT EXISTS idx_interventions_student ON interventions(student_id);
