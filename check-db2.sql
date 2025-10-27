-- Check second database
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as student_count FROM students;
SELECT id, email, full_name FROM users LIMIT 3;
