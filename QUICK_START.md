# ⚡ Quick Start - Deploy dalam 15 Menit

**Ikuti steps ini untuk deploy Guru Wali app ke production!**

---

## 📝 **PRE-REQUISITES**

```
✅ Cloudflare account (free)
✅ GitHub account
✅ Repository sudah di GitHub
✅ Code sudah di-commit
✅ 15 menit waktu luang ☕
```

---

## 🚀 **5 LANGKAH DEPLOY**

### **STEP 1: Setup Cloudflare D1 Database** (3 menit)

```bash
# Install Wrangler CLI (if not installed)
bun install -g wrangler

# Login to Cloudflare
wrangler login

# Create D1 database
wrangler d1 create guru-wali-db

# Output akan ada database_id, SIMPAN INI!
```

**Output akan seperti:**
```
✅ Successfully created DB 'guru-wali-db'

[[d1_databases]]
binding = "DB"
database_name = "guru-wali-db"
database_id = "xxxx-yyyy-zzzz-1234"  # ⬅️ SIMPAN INI!
```

**Update wrangler.toml** dengan database_id yang didapat.

✅ **Database created!**

---

### **STEP 2: Run Database Migrations** (2 menit)

```bash
# Generate migration files (if not exists)
npm run db:generate

# Apply migrations to D1 (production)
wrangler d1 execute guru-wali-db --remote --file=./drizzle/migrations/0000_*.sql

# If multiple migration files, run one by one:
# wrangler d1 execute guru-wali-db --remote --file=./drizzle/migrations/0000_initial.sql
# wrangler d1 execute guru-wali-db --remote --file=./drizzle/migrations/0001_*.sql
```

**Expected output:**
```
🌀 Executing on remote database guru-wali-db (xxxx-yyyy-zzzz):
🌀 To execute on your local development database, remove the --remote flag from your wrangler command.
🚣 Executed 10 commands in 0.5ms
```

✅ **Tables created in D1!**

---

### **STEP 3: Setup Cloudflare Pages** (5 menit)

1. **Login:** https://dash.cloudflare.com
2. **Workers & Pages** → **Create application**
3. **Pages** tab → **Connect to Git**
4. **Select repository** → `prj-guru-wali`
5. **Configure build:**
   ```
   Framework: Next.js
   Build command: npm run build
   Build output: .next
   Node version: 20.x
   ```

**JANGAN DEPLOY DULU!** ⬇️

---

### **STEP 4: Set Environment Variables** (2 menit)

Scroll ke **Environment Variables** section, tambahkan:

```bash
# Session Secret (REQUIRED - minimal 32 chars)
SESSION_SECRET=[GENERATE_RANDOM_32_CHARS]

# Node Version
NODE_VERSION=20
```

**NOTE:** D1 database TIDAK perlu env vars! Sudah auto-bind via `wrangler.toml`.

**Generate session secret:**
```powershell
# PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Output contoh:
# bX9kY3JpcHRqcytpcm9uLXNlc3Npb24=
```

**IMPORTANT:** 
- Minimal 32 karakter untuk iron-session security
- Set untuk **Production** DAN **Preview**!

✅ **Variables configured!**

---

### **STEP 5: Deploy!** (1 menit)

1. **Klik "Save and Deploy"**
2. **Tunggu 3-5 menit** build selesai
3. **Copy deployment URL**
4. **Done!** App sudah live!

✅ **DEPLOYED!** 🎉

---

## 🎯 **VERIFY DEPLOYMENT**

Test URL deployment kamu:

```bash
# Open in browser
https://[your-app].pages.dev

# Should see:
✅ Login page loads
✅ No console errors
✅ Can navigate to pages
```

---

## 🔥 **NEXT: Create First User**

Aplikasi dimulai dengan database kosong!

**Option 1: Via Database**
```bash
# Connect to Turso
turso db shell guru-wali-db

# Create admin user (manual SQL)
INSERT INTO users (id, email, name, role) VALUES 
  ('user-1', 'admin@example.com', 'Admin User', 'teacher');
```

**Option 2: Via Signup** (jika ada signup endpoint)

**Option 3: Via Initial Setup** (future feature)

---

## 📚 **FULL TUTORIALS**

Butuh detail lengkap? Baca:

- 📖 [CLOUDFLARE_SETUP.md](./CLOUDFLARE_SETUP.md) - Tutorial lengkap
- 🔐 [ENV_VARIABLES.md](./ENV_VARIABLES.md) - Reference env vars
- 🚀 [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide

---

## 🆘 **TROUBLESHOOTING**

### Build Failed?

```bash
# 1. Check Node version
NODE_VERSION=20 (set di env vars)

# 2. Clear build cache
Cloudflare Pages → Settings → Clear build cache

# 3. Redeploy
```

### Login Not Working?

```bash
# 1. Check BETTER_AUTH_SECRET is set
# 2. Verify BETTER_AUTH_URL matches deployment URL
# 3. Check database migrations ran: npm run db:push
```

### Can't See Data?

```bash
# Database kosong! Normal untuk deployment pertama.
# Buat user pertama via database atau signup.
```

---

## 💡 **PRO TIPS**

### Automatic Deployments

```bash
# Every git push will auto-deploy!
git add .
git commit -m "feat: new feature"
git push origin main

# Cloudflare will automatically:
# 1. Build (~2-3 min)
# 2. Deploy
# 3. Update live site
```

### Branch Previews

```bash
# Push to any branch = preview deployment
git checkout -b feature/new-ui
git push origin feature/new-ui

# Get preview URL:
# https://feature-new-ui.your-app.pages.dev
```

### Monitor Logs

```bash
# Real-time logs
wrangler pages deployment tail

# Or via Dashboard:
# Pages → Logs tab
```

---

## ✅ **DEPLOYMENT CHECKLIST**

```
✅ Turso database created
✅ Database migrations applied
✅ Cloudflare Pages project created
✅ Environment variables set (Production & Preview)
✅ Build successful
✅ Deployment URL working
✅ BETTER_AUTH_URL updated
✅ Login page accessible
✅ No console errors
```

---

## 🎊 **CONGRATULATIONS!**

Your app is now **LIVE** on Cloudflare Pages! 🚀

**Share your URL:**
```
https://[your-app].pages.dev
```

**Need help?** Join:
- Cloudflare Discord: https://discord.gg/cloudflaredev
- Turso Discord: https://discord.gg/turso

---

**Time to celebrate!** 🎉 Your MVP is deployed!

Next: Gather user feedback → Plan v1.1.0 features → Iterate! 💪
