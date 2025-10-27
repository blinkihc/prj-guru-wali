-- Verify dev user password hash
SELECT email, hashed_password FROM users WHERE email = 'dev@guruwali.test';
