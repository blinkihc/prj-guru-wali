# 🚀 Production Deployment Checklist

> **Panduan lengkap untuk deployment Guru Wali Digital Companion ke production**
> Last Updated: 2025-10-13

---

## 📋 Table of Contents

1. [Authentication & Security](#authentication--security)
2. [Database](#database)
3. [Environment Variables](#environment-variables)
4. [Performance](#performance)
5. [Testing](#testing)
6. [Deployment](#deployment)
7. [Monitoring & Logging](#monitoring--logging)
8. [Documentation](#documentation)

---

## 🔐 Authentication & Security

### Critical Authentication Improvements

#### 1. Database Integration (REQUIRED)
**Status:** 🔴 Must Fix

**Current State:**
```typescript
// app/api/auth/login/route.ts
// Currently using hardcoded demo credentials
const DEMO_USER = {
  id: "demo-user-001",
  email: "guru@example.com",
  password: "password123",
  fullName: "Ibu Siti Rahayu",
};
```

**Production Fix:**
```typescript
// app/api/auth/login/route.ts
import type { D1Database } from "@cloudflare/workers-types";
import { getDb } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { verifyPassword } from "@/lib/auth/password";

export async function POST(request: NextRequest) {
  const { env } = await getRequestContext<Env>();
  const db = getDb(env.DB);
  
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);
  
  if (!user) {
    return NextResponse.json(
      { error: "Email atau password salah" },
      { status: 401 }
    );
  }
  
  // Use bcrypt verification
  const isValidPassword = await verifyPassword(password, user.hashedPassword);
  
  if (!isValidPassword) {
    return NextResponse.json(
      { error: "Email atau password salah" },
      { status: 401 }
    );
  }
  
  await createSession(user.id, user.email, user.fullName);
  
  return NextResponse.json({ success: true, user });
}
```

**Files to Update:**
- [ ] `app/api/auth/login/route.ts` - Replace demo credentials with D1 lookup
- [ ] Remove hardcoded password check
- [ ] Add proper bcrypt verification

---

#### 2. Session Secret (REQUIRED)
**Status:** 🔴 Must Fix

**Current State:**
```typescript
// lib/auth/session.ts
password: process.env.SESSION_SECRET || "complex_password_at_least_32_characters_long_for_security"
```

**Production Fix:**
```bash
# Generate strong random secret
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Action Items:**
- [ ] Generate secure SESSION_SECRET (32+ bytes)
- [ ] Add to Cloudflare Pages environment variables
- [ ] Add to `.env.local` for local development
- [ ] Update `.env.example` with placeholder
- [ ] NEVER commit actual secret to git

---

#### 3. Password Features (RECOMMENDED)
**Status:** 🟡 Should Implement

**Features to Add:**

##### Forgot Password Flow
```typescript
// app/api/auth/forgot-password/route.ts
export async function POST(request: NextRequest) {
  const { email } = await request.json();
  
  // 1. Find user by email
  // 2. Generate password reset token (crypto.randomBytes)
  // 3. Store token in database with expiry (1 hour)
  // 4. Send email with reset link
  // 5. Return success (don't reveal if email exists)
}

// app/api/auth/reset-password/route.ts
export async function POST(request: NextRequest) {
  const { token, newPassword } = await request.json();
  
  // 1. Validate token and check expiry
  // 2. Hash new password with bcrypt
  // 3. Update user password
  // 4. Invalidate reset token
  // 5. Optionally: invalidate all sessions
}
```

**Files to Create:**
- [ ] `app/api/auth/forgot-password/route.ts`
- [ ] `app/api/auth/reset-password/route.ts`
- [ ] `app/(auth)/forgot-password/page.tsx`
- [ ] `app/(auth)/reset-password/page.tsx`
- [ ] Email service integration (Cloudflare Email Workers?)

---

##### Password Strength Validation
```typescript
// lib/auth/validation.ts
import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Password minimal 8 karakter")
  .regex(/[A-Z]/, "Password harus mengandung huruf besar")
  .regex(/[a-z]/, "Password harus mengandung huruf kecil")
  .regex(/[0-9]/, "Password harus mengandung angka")
  .regex(/[^A-Za-z0-9]/, "Password harus mengandung karakter special");

export const registerSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: passwordSchema,
  confirmPassword: z.string(),
  fullName: z.string().min(3, "Nama minimal 3 karakter"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});
```

**Files to Create:**
- [ ] `lib/auth/validation.ts`
- [ ] Update registration/setup wizard with validation

---

##### Change Password
```typescript
// app/api/user/change-password/route.ts
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const { currentPassword, newPassword } = await request.json();
  
  // 1. Verify current password
  // 2. Validate new password strength
  // 3. Hash new password
  // 4. Update in database
  // 5. Optionally: invalidate other sessions
}
```

**Files to Create:**
- [ ] `app/api/user/change-password/route.ts`
- [ ] `app/(main)/settings/security/page.tsx`

---

#### 4. Security Enhancements (REQUIRED)
**Status:** 🔴 Must Implement

##### Rate Limiting
```typescript
// lib/auth/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// For Cloudflare: Use Durable Objects or KV
export const loginRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "15 m"), // 5 attempts per 15 minutes
  analytics: true,
});

// app/api/auth/login/route.ts
export async function POST(request: NextRequest) {
  const ip = request.headers.get("cf-connecting-ip") || "anonymous";
  
  const { success } = await loginRateLimit.limit(ip);
  
  if (!success) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan login. Coba lagi dalam 15 menit." },
      { status: 429 }
    );
  }
  
  // Continue with login logic...
}
```

**Action Items:**
- [ ] Install `@upstash/ratelimit` and `@upstash/redis`
- [ ] Setup Upstash Redis account OR use Cloudflare KV
- [ ] Implement rate limiting on login endpoint
- [ ] Add rate limiting on password reset endpoints
- [ ] Consider rate limiting on API endpoints

---

##### CSRF Protection
```typescript
// lib/auth/csrf.ts
import { randomBytes } from "crypto";

export function generateCSRFToken(): string {
  return randomBytes(32).toString("hex");
}

export function validateCSRFToken(token: string, sessionToken: string): boolean {
  return token === sessionToken;
}

// Add to session
export interface SessionData {
  userId: string;
  email: string;
  fullName: string;
  isLoggedIn: boolean;
  csrfToken: string; // Add this
}
```

**Action Items:**
- [ ] Generate CSRF token on session creation
- [ ] Validate CSRF token on state-changing requests
- [ ] Add CSRF token to forms via hidden input
- [ ] Check CSRF token in API routes

---

##### Session Rotation
```typescript
// lib/auth/session.ts
export async function rotateSession(userId: string): Promise<void> {
  const oldSession = await getSession();
  
  // Destroy old session
  await destroySession();
  
  // Create new session with new ID
  const user = await getUserById(userId);
  await createSession(user.id, user.email, user.fullName);
}
```

**Action Items:**
- [ ] Rotate session on privilege escalation
- [ ] Rotate session periodically (e.g., every 24 hours)
- [ ] Rotate session after password change

---

## 💾 Database

### 1. Real User Registration (REQUIRED)
**Status:** 🔴 Must Implement

**Create Registration Flow:**
```typescript
// app/api/auth/register/route.ts
import { hashPassword } from "@/lib/auth/password";
import { users } from "@/drizzle/schema";

export async function POST(request: NextRequest) {
  const { email, password, fullName } = await request.json();
  
  // Validate input
  const validation = registerSchema.safeParse({ email, password, fullName });
  
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.errors },
      { status: 400 }
    );
  }
  
  const { env } = await getRequestContext<Env>();
  const db = getDb(env.DB);
  
  // Check if email already exists
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);
  
  if (existing) {
    return NextResponse.json(
      { error: "Email sudah terdaftar" },
      { status: 409 }
    );
  }
  
  // Hash password
  const hashedPassword = await hashPassword(password);
  
  // Create user
  const [newUser] = await db
    .insert(users)
    .values({
      email: email.toLowerCase(),
      hashedPassword,
      fullName,
    })
    .returning();
  
  // Create session
  await createSession(newUser.id, newUser.email, newUser.fullName);
  
  return NextResponse.json({ success: true, user: newUser });
}
```

**Files to Create:**
- [ ] `app/api/auth/register/route.ts`
- [ ] `app/(auth)/register/page.tsx` (if needed, or use wizard)

---

### 2. Database Migrations (REQUIRED)
**Status:** 🟡 Review Before Deploy

**Action Items:**
- [ ] Review all migration files in `drizzle/migrations/`
- [ ] Test migrations on local D1
- [ ] Backup production database before migration
- [ ] Run migrations on production D1:
  ```bash
  bun run db:migrate-production
  ```

---

### 3. Seed Data for Production (OPTIONAL)
**Status:** 🟢 Optional

**Current State:**
- Demo seed data exists in `drizzle/seed.ts`

**Production Considerations:**
- [ ] Remove demo seed data OR
- [ ] Create production seed data (if needed for initial setup)
- [ ] NEVER run dev seed on production database

---

## 🌍 Environment Variables

### Required Environment Variables

**Create `.env.production` (for reference, DO NOT COMMIT):**
```bash
# App Configuration
NEXT_PUBLIC_APP_NAME="Guru Wali Digital Companion"
NEXT_PUBLIC_APP_URL="https://guru-wali.pages.dev"

# Session & Auth (REQUIRED - Generate new secret!)
SESSION_SECRET="[GENERATE_WITH: openssl rand -base64 32]"

# Cloudflare (Auto-injected by Pages)
# These are provided by Cloudflare, no need to set manually
# CLOUDFLARE_ACCOUNT_ID
# CLOUDFLARE_DATABASE_ID
# DB (D1 binding)

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=""

# Optional: Email Service (for password reset)
RESEND_API_KEY=""
EMAIL_FROM="noreply@guru-wali.com"
```

---

### Cloudflare Pages Environment Variables Setup

**Via Dashboard:**
1. Go to Cloudflare Pages dashboard
2. Select your project
3. Settings > Environment Variables
4. Add the following:

| Variable | Value | Environment |
|----------|-------|-------------|
| `SESSION_SECRET` | [Generated 32-byte secret] | Production & Preview |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.pages.dev` | Production |
| `NEXT_PUBLIC_APP_URL` | `https://preview.your-domain.pages.dev` | Preview |

**Via Wrangler CLI:**
```bash
# Set secret
npx wrangler pages secret put SESSION_SECRET

# List secrets
npx wrangler pages secret list
```

---

### Update `.env.example`

**Action Items:**
- [ ] Update `.env.example` with all required variables
- [ ] Add comments explaining each variable
- [ ] Ensure no actual secrets in example file

---

## ⚡ Performance

### 1. Edge Runtime Optimization
**Status:** 🟢 Already Good

**Current State:**
- ✅ Using `export const runtime = "edge"` on API routes
- ✅ Minimal dependencies (edge-compatible)

**Additional Optimizations:**
- [ ] Audit bundle size: `bun run build && @cloudflare/next-on-pages`
- [ ] Check for Node.js-only dependencies
- [ ] Ensure all API routes use edge runtime

---

### 2. Database Query Optimization
**Status:** 🟡 Monitor After Deploy

**Action Items:**
- [ ] Add database indexes on frequently queried fields:
  ```sql
  CREATE INDEX idx_students_user_id ON students(user_id);
  CREATE INDEX idx_monthly_journals_student_id ON monthly_journals(student_id);
  CREATE INDEX idx_meeting_logs_student_id ON meeting_logs(student_id);
  ```
- [ ] Use `.limit()` on all queries
- [ ] Implement pagination for large lists
- [ ] Cache frequently accessed data

---

### 3. Image Optimization
**Status:** 🟢 Using Next.js Image

**Action Items:**
- [ ] Ensure all images use `next/image`
- [ ] Configure image domains in `next.config.ts`
- [ ] Consider Cloudflare Images for user uploads

---

## 🧪 Testing

### Unit Tests
**Status:** 🔴 Not Started

**Action Items:**
- [ ] Setup Vitest (already in dependencies)
- [ ] Write tests for auth utilities:
  - `lib/auth/password.ts` - hash & verify
  - `lib/auth/session.ts` - session management
- [ ] Write tests for validation schemas
- [ ] Target: 80%+ code coverage

---

### Integration Tests
**Status:** 🔴 Not Started

**Action Items:**
- [ ] Test API endpoints (login, logout, CRUD)
- [ ] Test database transactions
- [ ] Test file upload/import flow (Story 1.2)

---

### E2E Tests
**Status:** 🔴 Not Started

**Action Items:**
- [ ] Setup Playwright
- [ ] Test complete user flows:
  - Login → Dashboard → Logout
  - Add Student → View Student
  - Create Journal → View Journal
- [ ] Test on multiple browsers

---

## 🚀 Deployment

### Pre-Deployment Checklist

#### Code Quality
- [ ] All TypeScript errors resolved (`bun run typecheck`)
- [ ] All linter errors resolved (`bun run check`)
- [ ] No console.logs in production code
- [ ] All TODOs addressed or documented

#### Security
- [ ] SESSION_SECRET generated and configured
- [ ] Database authentication implemented
- [ ] Rate limiting enabled
- [ ] HTTPS enforced (automatic with Cloudflare Pages)

#### Database
- [ ] Migrations tested locally
- [ ] Backup strategy in place
- [ ] D1 database created on Cloudflare

#### Testing
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Manual testing completed

---

### Deployment Steps

#### 1. Build & Test Locally
```bash
# Clean install
rm -rf node_modules .next
bun install

# Type check
bun run typecheck

# Lint
bun run check

# Build
bun run build

# Test build locally
bun run preview
```

---

#### 2. Deploy to Cloudflare Pages

**Via GitHub Integration (Recommended):**
1. Push to `main` branch
2. Cloudflare Pages auto-deploys
3. Monitor build logs in dashboard

**Via Wrangler CLI:**
```bash
# Deploy preview
bun run deploy:preview

# Deploy production
bun run deploy:prod
```

---

#### 3. Run Database Migrations
```bash
# Production D1 migration
bun run db:migrate-production
```

---

#### 4. Configure D1 Bindings

**In `wrangler.toml`:**
```toml
[[d1_databases]]
binding = "DB"
database_name = "guru-wali-db"
database_id = "YOUR_PRODUCTION_DATABASE_ID"
```

**Verify binding in Cloudflare Pages:**
- Settings > Functions > D1 database bindings
- Ensure `DB` binding is configured

---

#### 5. Test Production Deployment
- [ ] Visit production URL
- [ ] Test login flow
- [ ] Test all critical features
- [ ] Check console for errors
- [ ] Verify database writes

---

## 📊 Monitoring & Logging

### 1. Error Tracking (RECOMMENDED)
**Status:** 🟡 Should Implement

**Options:**
- Sentry
- Cloudflare Workers Analytics
- LogFlare

**Implementation:**
```typescript
// lib/monitoring/sentry.ts (example)
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

**Action Items:**
- [ ] Choose error tracking service
- [ ] Install & configure SDK
- [ ] Add error boundaries in React components
- [ ] Configure source maps for better stack traces

---

### 2. Analytics (OPTIONAL)
**Status:** 🟢 Optional

**Options:**
- Cloudflare Web Analytics (privacy-friendly)
- Google Analytics
- Plausible Analytics

**Action Items:**
- [ ] Choose analytics service
- [ ] Add tracking script
- [ ] Configure privacy settings
- [ ] Comply with privacy regulations

---

### 3. Logging Best Practices
**Status:** 🟡 Should Improve

**Current State:**
```typescript
console.error("Login error:", error); // Basic logging
```

**Production Best Practice:**
```typescript
// lib/monitoring/logger.ts
export const logger = {
  error: (message: string, meta?: Record<string, unknown>) => {
    console.error(JSON.stringify({ level: "error", message, meta, timestamp: new Date().toISOString() }));
  },
  warn: (message: string, meta?: Record<string, unknown>) => {
    console.warn(JSON.stringify({ level: "warn", message, meta, timestamp: new Date().toISOString() }));
  },
  info: (message: string, meta?: Record<string, unknown>) => {
    console.info(JSON.stringify({ level: "info", message, meta, timestamp: new Date().toISOString() }));
  },
};

// Usage
logger.error("Login failed", { email, ip });
```

**Action Items:**
- [ ] Create structured logger
- [ ] Replace all console.log with logger
- [ ] Add request IDs for tracing
- [ ] Configure log levels by environment

---

## 📚 Documentation

### User Documentation
**Status:** 🔴 Not Started

**Action Items:**
- [ ] Create user manual (`docs/USER-GUIDE.md`)
- [ ] Add screenshots of key features
- [ ] Write FAQ section
- [ ] Create video tutorials (optional)

---

### Developer Documentation
**Status:** 🟡 In Progress

**Current Docs:**
- ✅ README.md
- ✅ TASKS.md
- ✅ AGENTS.md
- ✅ PRODUCTION-CHECKLIST.md (this file)

**Additional Docs Needed:**
- [ ] API documentation (`docs/API.md`)
- [ ] Database schema documentation
- [ ] Deployment guide (`docs/DEPLOYMENT.md`)
- [ ] Contributing guide (`docs/CONTRIBUTING.md`)

---

## 🔄 Maintenance & Updates

### Regular Tasks

#### Weekly
- [ ] Review error logs
- [ ] Check performance metrics
- [ ] Monitor user feedback

#### Monthly
- [ ] Update dependencies: `bun update`
- [ ] Review and rotate secrets
- [ ] Backup database

#### Quarterly
- [ ] Security audit
- [ ] Performance optimization review
- [ ] Feature usage analytics review

---

## ✅ Final Production Readiness Checklist

### Critical (Must Do Before Launch)
- [ ] Replace demo credentials with real database authentication
- [ ] Generate and configure SESSION_SECRET
- [ ] Run database migrations on production D1
- [ ] Configure D1 bindings in Cloudflare Pages
- [ ] Test complete auth flow on production
- [ ] Implement rate limiting on login endpoint
- [ ] All TypeScript errors resolved
- [ ] All linter errors resolved

### Important (Should Do Before Launch)
- [ ] Implement password reset flow
- [ ] Add password strength validation
- [ ] Setup error tracking (Sentry)
- [ ] Add basic unit tests for auth utilities
- [ ] Configure CSRF protection
- [ ] Implement session rotation
- [ ] Create user documentation
- [ ] Setup monitoring & alerts

### Nice to Have (Post-Launch)
- [ ] Implement change password feature
- [ ] Add E2E tests
- [ ] Setup analytics
- [ ] Optimize database queries with indexes
- [ ] Create video tutorials
- [ ] Add multi-language support (if needed)

---

## 📞 Support & Resources

### Cloudflare Resources
- [Pages Documentation](https://developers.cloudflare.com/pages/)
- [D1 Database](https://developers.cloudflare.com/d1/)
- [Workers Runtime API](https://developers.cloudflare.com/workers/runtime-apis/)

### Framework Resources
- [Next.js on Cloudflare](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [shadcn/ui Docs](https://ui.shadcn.com/)

### Security Resources
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/security)

---

**Last Updated:** 2025-10-13  
**Status:** Ready for Epic 0 → Epic 1 Transition  
**Next Review:** Before Production Deployment
