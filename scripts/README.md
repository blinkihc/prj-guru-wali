# Scripts

## create-user.ts

Generate SQL to create user in D1 database.

### Usage

```bash
bun run scripts/create-user.ts
```

### Modify Parameters

Edit `create-user.ts` and change these values:

```typescript
createUser({
  email: "guru@sekolah.com",
  password: "guru123",
  fullName: "Ibu Siti Rahayu",
  nipNuptk: "198405102006042002", // Optional
});
```

### Output

The script will output:
1. SQL query to create user
2. Wrangler command to execute
3. Credentials to provide to client

### Execute in Production

Copy the wrangler command from output and run it:

```bash
wrangler d1 execute guru-wali-db --remote --command="INSERT INTO users..."
```

### Security Notes

- Password is hashed with bcrypt (10 rounds)
- Always save the plain password to provide to client
- Use strong passwords for production
- Consider implementing password reset flow later
