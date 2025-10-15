# 🔐 Environment Variables Reference

**Untuk Cloudflare Pages deployment**

Copy semua variable ini ke **Cloudflare Pages Dashboard → Settings → Environment Variables**

---

## 📋 **REQUIRED VARIABLES**

### 1️⃣ **Database (Cloudflare D1)**

**GOOD NEWS:** D1 database TIDAK membutuhkan environment variables! 🎉

Database binding sudah diset via `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "guru-wali-db"
database_id = "your-database-id"
```

Cloudflare Pages otomatis inject binding ini ke runtime environment.

**Optional** (hanya jika butuh remote access untuk development):
```bash
CLOUDFLARE_ACCOUNT_ID=[from-dashboard]
CLOUDFLARE_DATABASE_ID=[from-wrangler-d1-create]
CLOUDFLARE_D1_TOKEN=[from-api-tokens]
```

---

### 2️⃣ **Session Management (iron-session)**

```bash
SESSION_SECRET=[GENERATE_32_RANDOM_CHARS_MINIMUM]
```

**Generate secret di PowerShell:**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Output contoh:
# bX9kY3JpcHRqcytpcm9uLXNlc3Npb24=
```

**Atau online:** https://generate-secret.vercel.app/32

**IMPORTANT:** 
- **MINIMAL 32 karakter** untuk keamanan iron-session
- Jangan share atau commit ke Git!
- Gunakan secret berbeda untuk Production vs Preview

---

## 🎨 **OPTIONAL VARIABLES**

### 3️⃣ **R2 Storage (PDF Caching)**

**Skip jika tidak pakai R2 (app tetap jalan tanpa ini)**

```bash
R2_ACCOUNT_ID=[your-cloudflare-account-id]
R2_ACCESS_KEY_ID=[from-r2-api-token]
R2_SECRET_ACCESS_KEY=[from-r2-api-token]
R2_BUCKET_NAME=guru-wali-pdfs
```

**Cara dapat:**
1. Cloudflare Dashboard → R2
2. Create bucket: `guru-wali-pdfs`
3. R2 → Manage R2 API Tokens → Create API Token
4. Permission: **Object Read & Write**
5. Copy Access Key ID & Secret Access Key
6. Account ID ada di R2 dashboard URL

---

### 4️⃣ **Node.js Version**

```bash
NODE_VERSION=20
```

**Atau** set di `Build configuration`:
- Node version: `20.x`

---

## ✅ **VERIFICATION CHECKLIST**

Sebelum deploy, pastikan:

```
✅ D1 database created & database_id di wrangler.toml
✅ SESSION_SECRET minimal 32 karakter random
✅ NODE_VERSION set ke 20
✅ Semua variable di-set untuk Production & Preview
✅ R2 configured (optional, untuk PDF caching)
```

---

## 🎯 **QUICK COPY-PASTE TEMPLATE**

```bash
# ===== REQUIRED =====
SESSION_SECRET=
NODE_VERSION=20

# ===== OPTIONAL =====
# R2_ACCOUNT_ID=
# R2_ACCESS_KEY_ID=
# R2_SECRET_ACCESS_KEY=
# R2_BUCKET_NAME=guru-wali-pdfs

# D1 Remote Access (optional, for development)
# CLOUDFLARE_ACCOUNT_ID=
# CLOUDFLARE_DATABASE_ID=
# CLOUDFLARE_D1_TOKEN=
```

---

## 🚨 **COMMON MISTAKES**

### ❌ **Short Secret**
```bash
# SALAH (terlalu pendek):
SESSION_SECRET=123456
SESSION_SECRET=myapp

# BENAR (minimal 32 chars):
SESSION_SECRET=Abc123XYZ789RandomString32Chars!@#$
SESSION_SECRET=bX9kY3JpcHRqcytpcm9uLXNlc3Npb24=
```

### ❌ **Weak Secret**
```bash
# SALAH (predictable):
SESSION_SECRET=password123456789012345678901234

# BENAR (random):
SESSION_SECRET=Kx9$mP2#vL8@wQ5!nR7&jF4%tY6^bH3*
```

---

## 📱 **WHERE TO SET**

### Cloudflare Pages:

1. **Login** → https://dash.cloudflare.com
2. **Workers & Pages** → Select your project
3. **Settings** → **Environment Variables**
4. Add each variable:
   - Variable name: `DATABASE_URL`
   - Value: `libsql://...`
   - Environment: **Production** & **Preview**
5. **Save**
6. **Redeploy** (trigger push atau manual)

---

## 🔄 **UPDATE VARIABLES**

Jika perlu update variable setelah deploy:

1. **Dashboard** → **Settings** → **Environment Variables**
2. **Edit** variable yang ingin diubah
3. **Save**
4. **Redeploy** project (push commit baru atau manual redeploy)

**Note:** Changes tidak langsung apply, perlu redeploy!

---

## 🆘 **TROUBLESHOOTING**

### "Database connection failed"
```
✅ Verify D1 database created: wrangler d1 list
✅ Check wrangler.toml has correct database_id
✅ Verify D1 binding configured in Pages dashboard
✅ Test connection: wrangler d1 execute guru-wali-db --remote --command "SELECT 1"
```

### "Authentication error" atau "Session invalid"
```
✅ Check SESSION_SECRET is set (minimal 32 chars)
✅ Verify same SESSION_SECRET for all instances
✅ Clear browser cookies and try again
✅ Check cookie settings (secure, httpOnly, sameSite)
```

### "Build failed - environment variable not found"
```
✅ Verify variable names exact match (case-sensitive!)
✅ Check set for correct environment (Production/Preview)
✅ Wait 2-3 minutes after setting, then redeploy
```

---

**Ready?** Lanjut ke [CLOUDFLARE_SETUP.md](./CLOUDFLARE_SETUP.md) untuk tutorial lengkap! 🚀
