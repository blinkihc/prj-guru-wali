-- Debug Login Issue
-- Check if user exists and data is correct

-- 1. Check if users table exists
SELECT name FROM sqlite_master WHERE type='table' AND name='users';

-- 2. Check if dev user exists
SELECT id, email, full_name, 
       substr(hashed_password, 1, 10) as hash_prefix,
       created_at 
FROM users 
WHERE email = 'dev@guruwali.test';

-- 3. Count total users
SELECT COUNT(*) as total_users FROM users;

-- 4. List all users (without password)
SELECT id, email, full_name, nip_nuptk, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 5;
