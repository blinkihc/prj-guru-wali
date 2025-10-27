-- Create user: Aprilia Trihandayani,S.Pd
-- Email: aprilia3handayani@gmail.com
-- Password: guru123 (SAVE THIS!)

INSERT INTO users (id, email, hashed_password, full_name, nip_nuptk, created_at)
VALUES (
  'user-1760624257240',
  'aprilia3handayani@gmail.com',
  '$2b$10$DVPKCByJGeeMDqIsNbhVteDIwUFo4A3clpFajhcREHn7oataw1F2a',
  'Aprilia Trihandayani,S.Pd',
  '198404032009042001',
  datetime('now')
);
