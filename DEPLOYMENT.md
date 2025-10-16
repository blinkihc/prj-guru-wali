# Deployment Guide - Guru Wali App

## 🚀 Production Deployment Flow

### **IMPORTANT: User Creation Strategy**

This app uses a **developer-managed user creation** approach:

1. ✅ **Developer** creates user accounts directly in D1 database
2. ✅ **Developer** provides credentials to clients
3. ✅ **Client** logs in with provided credentials
4. ✅ **Client** completes setup wizard (school info, teacher profile)
5. ✅ **Client** starts using the app

**Note:** The `/setup` page is for **profile completion**, NOT user registration!

---

## 📊 Database Setup

### **1. Create D1 Database**

```bash
# Create D1 database
wrangler d1 create guru-wali-db

# Note the database_id from output
# Add to wrangler.toml
```

### **2. Run Migrations**

```bash
# Apply schema
wrangler d1 execute guru-wali-db --remote --file=./drizzle/schema.sql
```

---

## 👤 Creating Users (Developer Task)

### **Method 1: Via Wrangler CLI**

```bash
# Create user with hashed password
wrangler d1 execute guru-wali-db --remote --command="
INSERT INTO users (id, email, password, role, createdAt, updatedAt)
VALUES (
  'user-' || lower(hex(randomblob(16))),
  'guru@sekolah.com',
  '\$2a\$10\$HASHED_PASSWORD_HERE',
  'teacher',
  datetime('now'),
  datetime('now')
);
"
```

### **Method 2: Create User Script**

Create file: `scripts/create-user.ts`

```typescript
import bcrypt from "bcryptjs";

async function createUser(email: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = `user-${Date.now()}`;
  
  console.log(`
-- SQL to create user
INSERT INTO users (id, email, password, role, createdAt, updatedAt)
VALUES (
  '${userId}',
  '${email}',
  '${hashedPassword}',
  'teacher',
  datetime('now'),
  datetime('now')
);
  `);
}

// Usage
createUser("guru@sekolah.com", "password123");
```

Run:
```bash
bun run scripts/create-user.ts
# Copy the SQL output
# Run via wrangler d1 execute
```

---

## 🔐 Password Hashing

### **Generate Bcrypt Hash**

```bash
# Using Node.js
node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"

# Or using Bun
bun -e "console.log(require('bcryptjs').hashSync('your-password', 10))"
```

**Example:**
```
Password: guru123
Hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
```

---

## 📝 Client Onboarding Process

### **Step 1: Developer Creates User**

```sql
INSERT INTO users (id, email, password, role, createdAt, updatedAt)
VALUES (
  'user-abc123',
  'bu.siti@smpn1.sch.id',
  '$2a$10$HASHED_PASSWORD',
  'teacher',
  datetime('now'),
  datetime('now')
);
```

### **Step 2: Provide Credentials to Client**

```
Email: bu.siti@smpn1.sch.id
Password: [temporary-password]
URL: https://guru-wali-app.pages.dev/login
```

### **Step 3: Client First Login**

1. Client visits `/login`
2. Enters provided credentials
3. Successfully logs in
4. Redirected to `/setup` (if not completed)

### **Step 4: Client Completes Setup**

Setup wizard collects:
- School name
- Education stage (SMP/SMA)
- City/District
- Teacher full name
- NIP/NUPTK

### **Step 5: Client Uses App**

After setup completion:
- ✅ Access dashboard
- ✅ Manage students
- ✅ Create journals
- ✅ Generate reports

---

## 🔧 Environment Variables

### **Cloudflare Pages Settings**

```bash
# Required
SESSION_SECRET=your-32-char-random-secret
NODE_VERSION=20

# Optional
ENVIRONMENT=production
```

### **Generate SESSION_SECRET**

```bash
# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 🗄️ Database Bindings

### **wrangler.toml Configuration**

```toml
# D1 Database
[[d1_databases]]
binding = "DB"
database_name = "guru-wali-db"
database_id = "your-database-id"

# R2 Storage (optional, for file uploads)
[[r2_buckets]]
binding = "STORAGE"
bucket_name = "guru-wali-storage"
```

---

## 🚀 Deployment Commands

```bash
# Install dependencies
bun install

# Build locally
bun run build

# Deploy to Cloudflare Pages
git push origin main
# Auto-deploys via GitHub integration

# Or manual deploy
wrangler pages deploy .vercel/output/static
```

---

## ✅ Post-Deployment Checklist

- [ ] D1 database created and migrated
- [ ] Environment variables set
- [ ] Database bindings configured
- [ ] First user created in DB
- [ ] Test login with created user
- [ ] Test setup wizard completion
- [ ] Test core features (students, journals, reports)
- [ ] Verify PDF generation works

---

## 📞 Client Support

### **Common Issues:**

**1. Cannot login**
- Verify user exists in DB
- Check password hash is correct
- Ensure email matches exactly

**2. Setup wizard shows "Unauthorized"**
- User must login first
- Check session is valid
- Verify middleware allows /setup for authenticated users

**3. PDF generation fails**
- Check nodejs_compat flag is enabled
- Verify jsPDF dependencies installed
- Check browser console for errors

---

## 🔄 User Management

### **List All Users**

```bash
wrangler d1 execute guru-wali-db --remote --command="
SELECT id, email, role, createdAt FROM users;
"
```

### **Update User Password**

```bash
# Generate new hash first
NEW_HASH=$(node -e "console.log(require('bcryptjs').hashSync('new-password', 10))")

# Update in DB
wrangler d1 execute guru-wali-db --remote --command="
UPDATE users 
SET password = '$NEW_HASH', updatedAt = datetime('now')
WHERE email = 'guru@sekolah.com';
"
```

### **Delete User**

```bash
wrangler d1 execute guru-wali-db --remote --command="
DELETE FROM users WHERE email = 'guru@sekolah.com';
"
```

---

## 📊 Monitoring

### **Check Database**

```bash
# View users
wrangler d1 execute guru-wali-db --remote --command="SELECT * FROM users;"

# View students
wrangler d1 execute guru-wali-db --remote --command="SELECT COUNT(*) FROM students;"

# View journals
wrangler d1 execute guru-wali-db --remote --command="SELECT COUNT(*) FROM journals;"
```

### **View Logs**

```bash
# Cloudflare Pages logs
wrangler pages deployment tail
```

---

## 🎯 Business Model

### **SaaS Approach:**

1. **Developer** creates tenant account
2. **Developer** provides credentials
3. **Client** completes setup (school info)
4. **Client** pays subscription
5. **Client** uses app

### **Pricing Tiers:**

- **Basic:** 1 teacher, 50 students
- **Pro:** 5 teachers, 200 students
- **School:** Unlimited teachers/students

---

## 📝 Notes

- Setup wizard requires authentication (user must exist)
- No self-registration feature (by design)
- Developer manages all user accounts
- Clients only manage their school data
- Perfect for B2B SaaS model

---

**Last Updated:** 2025-10-16
