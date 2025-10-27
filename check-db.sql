-- Check database contents
-- Usage: bunx wrangler d1 execute DB --local --file=check-db.sql

-- Count users
SELECT COUNT(*) as user_count FROM users;

-- Count students
SELECT COUNT(*) as student_count FROM students;

-- Count journals
SELECT COUNT(*) as journal_count FROM monthly_journals;

-- Show dev user
SELECT id, email, full_name FROM users WHERE email = 'dev@guruwali.test';
