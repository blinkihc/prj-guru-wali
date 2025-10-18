-- Insert Dev User for Manual Testing
-- Use this if sync script fails
-- 
-- Run with: wrangler d1 execute DB --local --file=drizzle/insert-dev-user.sql
-- 
-- Credentials:
-- Email: dev@guruwali.test
-- Password: dev123

INSERT INTO users (id, email, hashed_password, full_name, nip_nuptk, created_at)
VALUES (
  'dev-user-manual-001',
  'dev@guruwali.test',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'Pak Budi Santoso, S.Pd',
  '196501011990031001',
  datetime('now')
);

-- Verify insert
SELECT id, email, full_name FROM users WHERE email = 'dev@guruwali.test';
