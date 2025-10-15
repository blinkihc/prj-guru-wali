# 🚀 Tutorial Setup Cloudflare - Guru Wali App

**Panduan lengkap untuk deploy aplikasi Guru Wali ke Cloudflare Pages**

---

## 📋 **YANG DIBUTUHKAN**

### 1. **Cloudflare Account**
- Free account (tidak perlu bayar untuk MVP)
- Email verified
- Domain (opsional, bisa pakai subdomain Cloudflare)

### 2. **Database: Cloudflare D1**
- Native Cloudflare database (SQLite-based)
- Free tier: 5GB storage, 5M reads/day, 100K writes/day
- Already included in Cloudflare account!
- No separate signup needed

### 3. **Git Repository**
- GitHub/GitLab/Bitbucket
- Repository harus public atau connected ke Cloudflare

---

## 🎯 **STEP-BY-STEP SETUP**

---

## **PART 1: Setup Cloudflare D1 Database** 📊

### Step 1.1: Install Wrangler CLI

```bash
# Install Wrangler (Cloudflare CLI)
npm install -g wrangler

# Atau dengan Bun (faster):
bun install -g wrangler
```

### Step 1.2: Login ke Cloudflare

```bash
# Login via browser
wrangler login
```

Browser akan terbuka, authorize Wrangler.

### Step 1.3: Create D1 Database

```bash
# Create D1 database
wrangler d1 create guru-wali-db

# Output akan seperti:
# ✅ Successfully created DB 'guru-wali-db'
# 
# [[d1_databases]]
# binding = "DB"
# database_name = "guru-wali-db"
# database_id = "xxxx-xxxx-xxxx-xxxx"
```

**SIMPAN `database_id` ini!** Akan digunakan di `wrangler.toml`.

### Step 1.4: Update wrangler.toml

File `wrangler.toml` sudah ada, tapi update `database_id`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "guru-wali-db"
database_id = "PASTE_YOUR_DATABASE_ID_HERE"  # ⬅️ Update ini!
```

### Step 1.5: Run Database Migrations

```bash
# Generate migration SQL
npm run db:generate

# Apply migrations ke D1 (production)
wrangler d1 execute guru-wali-db --remote --file=./drizzle/migrations/0000_*.sql

# Atau untuk local testing:
wrangler d1 execute guru-wali-db --local --file=./drizzle/migrations/0000_*.sql
```

**Note:** Jika ada multiple migration files, run satu per satu:
```bash
wrangler d1 execute guru-wali-db --remote --file=./drizzle/migrations/0000_initial.sql
wrangler d1 execute guru-wali-db --remote --file=./drizzle/migrations/0001_*.sql
# dst...
```

✅ **D1 Database ready!**

---

## **PART 2: Setup Cloudflare Pages** ☁️

### Step 2.1: Login ke Cloudflare Dashboard

1. Buka: https://dash.cloudflare.com
2. Login atau Sign Up (free)
3. Verify email jika baru sign up

### Step 2.2: Create Pages Project

1. **Klik "Workers & Pages"** di sidebar kiri
2. **Klik "Create application"**
3. **Pilih "Pages" tab**
4. **Klik "Connect to Git"**

### Step 2.3: Connect Git Repository

1. **Pilih Git provider**: GitHub/GitLab/Bitbucket
2. **Authorize Cloudflare** untuk akses repository
3. **Pilih repository**: `prj-guru-wali` (atau nama repo kamu)
4. **Klik "Begin setup"**

### Step 2.4: Configure Build Settings

```yaml
Project Name: guru-wali-app (atau sesuai keinginan)
Production Branch: main
Framework Preset: Next.js
Build Command: npm run build
Build Output Directory: .next
Node Version: 20.x (atau latest)
```

**JANGAN KLIK "Save and Deploy" DULU!** Kita perlu set environment variables dulu.

---

## **PART 3: Setup Environment Variables** 🔐

### Step 3.1: Scroll ke "Environment Variables"

Tambahkan semua variable berikut:

#### **Database (REQUIRED)**

**IMPORTANT:** Untuk Cloudflare D1, database binding sudah diset via `wrangler.toml`!

**Kamu TIDAK perlu set DATABASE_URL atau DATABASE_AUTH_TOKEN** karena D1 menggunakan binding `DB` otomatis.

Tapi jika ingin remote access (optional untuk development):
```
CLOUDFLARE_ACCOUNT_ID = [your-cloudflare-account-id]
CLOUDFLARE_DATABASE_ID = [your-d1-database-id]
CLOUDFLARE_D1_TOKEN = [generate-from-cloudflare-api]
```

#### **Session Secret (REQUIRED)**
```bash
# Generate secret (32+ characters random string)
SESSION_SECRET = [GENERATE_RANDOM_32_CHARS]

# Example generator di PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

```
SESSION_SECRET = Abc123XYZ789...32chars_minimum
```

**Note:** Minimal 32 karakter untuk keamanan iron-session!

#### **R2 Storage (OPTIONAL - untuk PDF caching)**
```
R2_ACCOUNT_ID = [your-cloudflare-account-id]
R2_ACCESS_KEY_ID = [generate-from-r2-dashboard]
R2_SECRET_ACCESS_KEY = [generate-from-r2-dashboard]
R2_BUCKET_NAME = guru-wali-pdfs
```

**Cara get R2 credentials:**
1. Dashboard → R2 → Create Bucket → "guru-wali-pdfs"
2. R2 → Manage R2 API Tokens → Create API Token
3. Copy Access Key ID & Secret Access Key

#### **Node Environment**
```
NODE_VERSION = 20
```

### Step 3.2: Set Variables untuk Production & Preview

**PENTING:** Set semua variable untuk **Production** DAN **Preview** environment!

1. Pilih dropdown "Environment": **Production**
2. Add semua variables
3. Ulangi untuk "Environment": **Preview**

---

## **PART 4: Deploy!** 🚀

### Step 4.1: Save and Deploy

1. **Klik "Save and Deploy"**
2. Cloudflare akan otomatis:
   - Clone repository
   - Install dependencies
   - Run build command
   - Deploy ke edge network
3. **Tunggu ~3-5 menit** untuk build pertama

### Step 4.2: Monitor Build

Di halaman deployment:
- ✅ **Initialize build environment** (~30s)
- ✅ **Clone repository** (~10s)
- ✅ **Install dependencies** (~1-2 min)
- ✅ **Build application** (~1-2 min)
- ✅ **Deploy to Cloudflare edge** (~30s)

### Step 4.3: Build Success!

Jika berhasil, akan muncul:
```
✅ Success! Deployed to:
   https://guru-wali-app.pages.dev
```

---

## **PART 5: Post-Deployment Setup** ⚙️

### Step 5.1: Update BETTER_AUTH_URL

Setelah deploy pertama kali, update environment variable:

```
BETTER_AUTH_URL = https://guru-wali-app-abc123.pages.dev
```

(Ganti dengan URL actual dari deployment)

Kemudian **redeploy** (bisa trigger dengan push commit baru).

### Step 5.2: Setup Custom Domain (OPTIONAL)

Jika punya domain:

1. **Pages → Custom domains → Set up a custom domain**
2. Masukkan domain: `guruwali.yourdomain.com`
3. Cloudflare akan otomatis setup DNS
4. Update `BETTER_AUTH_URL` dengan domain baru

### Step 5.3: Create First Admin User

**IMPORTANT:** Aplikasi dimulai dengan database kosong!

1. Buka URL deployment
2. Akan redirect ke `/login`
3. Masukkan credentials (gunakan admin email yang valid)
4. User pertama otomatis jadi admin

**ATAU** setup via `/setup` page (jika diimplementasikan nanti).

---

## **PART 6: Verify Deployment** ✅

### Checklist:

```
✅ Build successful
✅ App URL accessible
✅ Login page loads
✅ Can login (create user via database atau signup)
✅ Dashboard loads after login
✅ No console errors
✅ Database connection working
✅ Can create students/journals/meetings
```

### Test Commands:

```bash
# Test health
curl https://guru-wali-app.pages.dev

# Should return 200 OK
```

---

## **🔧 TROUBLESHOOTING**

### **Build Failed**

#### Error: "Module not found"
```bash
# Solution: Clear build cache
# Di Cloudflare Pages → Settings → Builds → Clear build cache
```

#### Error: "Database connection failed"
```bash
# Check:
1. DATABASE_URL correct?
2. DATABASE_AUTH_TOKEN valid?
3. Turso database active? (turso db list)
```

#### Error: "Edge Runtime incompatible"
```bash
# Check file imports:
- NO "fs" or "crypto" (use Web Crypto API)
- NO Node.js-only modules
- Use "edge" runtime in route.ts files
```

### **Login Not Working**

```bash
# Check:
1. BETTER_AUTH_SECRET set?
2. BETTER_AUTH_URL matches deployment URL?
3. Database tables created? (run migrations)
```

### **PDF Generation Failed**

```bash
# R2 optional, app will work without it
# Check console for specific errors
```

---

## **📊 MONITORING & LOGS**

### View Logs:

1. **Cloudflare Dashboard** → **Workers & Pages**
2. **Select your project** → **guru-wali-app**
3. **Logs** tab

### Real-time Logs:

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login
wrangler login

# Tail logs
wrangler pages deployment tail
```

---

## **🔄 CONTINUOUS DEPLOYMENT**

Cloudflare Pages otomatis deploy setiap kali push ke Git!

```bash
# Workflow:
git add .
git commit -m "feat: new feature"
git push origin main

# Cloudflare will automatically:
# 1. Detect push
# 2. Start build
# 3. Deploy new version
# 4. Update live site (~3-5 min)
```

### Branch Deployments:

- `main` branch → Production (guru-wali-app.pages.dev)
- Other branches → Preview (feature-abc123.guru-wali-app.pages.dev)

---

## **💰 COST BREAKDOWN**

### Free Tier (MVP):
```
✅ Cloudflare Pages: Free (unlimited requests)
✅ Cloudflare D1: Free (5GB storage, 5M reads/day, 100K writes/day)
✅ R2 Storage: Free (10GB storage, 1M reads/month)
✅ CDN: Free (global edge network)
✅ SSL: Free (automatic HTTPS)
✅ DDoS Protection: Free

Total Cost: $0/month for MVP! 🎉
```

### Scale (Production):
```
Cloudflare Pages Pro: $20/month
- Advanced analytics
- Higher build limits
- Priority support

D1 Paid: Pay-as-you-go after free tier
- $0.001 per 1M reads
- $1 per 1M writes
- $0.75/GB/month storage

R2: $0.015/GB/month after free tier

Total estimate for 1000 users: ~$5-10/month
```

---

## **📚 RESOURCES**

- Cloudflare Pages Docs: https://developers.cloudflare.com/pages
- Cloudflare D1 Docs: https://developers.cloudflare.com/d1
- Wrangler CLI Docs: https://developers.cloudflare.com/workers/wrangler
- Better Auth Docs: https://better-auth.dev
- Next.js Edge Runtime: https://nextjs.org/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes
- Drizzle ORM Docs: https://orm.drizzle.team

---

## **🆘 NEED HELP?**

### Community:
- Cloudflare Discord: https://discord.gg/cloudflaredev
- Cloudflare Community: https://community.cloudflare.com
- Stack Overflow: Tag `cloudflare-pages`, `cloudflare-d1`, `nextjs`

### Support:
- Cloudflare Support: https://support.cloudflare.com
- Cloudflare Status: https://www.cloudflarestatus.com

---

## **✅ NEXT STEPS AFTER DEPLOYMENT**

1. ✅ Test all features thoroughly
2. ✅ Monitor logs for 24-48 hours
3. ✅ Gather user feedback
4. ✅ Setup monitoring (Sentry, LogRocket)
5. ✅ Plan v1.1.0 features
6. ✅ Setup automated backups

---

**READY TO DEPLOY?** 🚀

Ikuti steps di atas satu per satu, jangan skip! Good luck! 💪
