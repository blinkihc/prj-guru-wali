-- Insert test user directly
INSERT INTO users (id, email, hashed_password, full_name, nip_nuptk, created_at)
VALUES (
  'test-user-001',
  'dev@guruwali.test',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'Pak Budi Santoso, S.Pd',
  '196501011990031001',
  datetime('now')
);

-- Verify
SELECT COUNT(*) as total FROM users;
SELECT id, email, full_name FROM users;
