# 🔧 Technical Debt Tracker

> **Tracking technical shortcuts and temporary solutions that need to be addressed**
> Last Updated: 2025-10-13

---

## 📊 Overview

| Category | Count | Priority |
|----------|-------|----------|
| Critical (🔴) | 2 | Must fix before production |
| High (🟡) | 5 | Should fix soon |
| Medium (🟢) | 3 | Can fix later |
| **Total** | **10** | |

---

## 🔴 Critical Priority

### 1. Demo Credentials in Login API
**File:** `app/api/auth/login/route.ts`  
**Lines:** 26-33  
**Created:** 2025-10-13  
**Priority:** 🔴 Critical

**Issue:**
```typescript
// TODO: In production, get D1 binding from getRequestContext()
// For MVP demo, use hardcoded credentials
const DEMO_USER = {
  id: "demo-user-001",
  email: "guru@example.com",
  password: "password123",
  fullName: "Ibu Siti Rahayu",
};
```

**Impact:**
- 🚨 Security vulnerability
- 🚨 Cannot have real users
- 🚨 No multi-user support

**Solution:**
Replace with actual database query using Drizzle + D1.

**Estimated Effort:** 2 hours

**Related:**
- PRODUCTION-CHECKLIST.md > Database Integration
- Need to implement user registration first

**Blockers:**
- Need Cloudflare D1 binding in production environment
- Need to decide: registration flow vs admin-created users

---

### 2. Default Session Secret
**File:** `lib/auth/session.ts`  
**Line:** 19  
**Created:** 2025-10-13  
**Priority:** 🔴 Critical

**Issue:**
```typescript
password: process.env.SESSION_SECRET || "complex_password_at_least_32_characters_long_for_security",
```

**Impact:**
- 🚨 Security vulnerability if deployed without SESSION_SECRET
- 🚨 Predictable session encryption key

**Solution:**
1. Generate strong secret: `openssl rand -base64 32`
2. Add to environment variables
3. Remove fallback in production build

**Estimated Effort:** 15 minutes

**Action Items:**
- [ ] Generate SESSION_SECRET
- [ ] Add to .env.local
- [ ] Add to Cloudflare Pages environment variables
- [ ] Add warning if SESSION_SECRET not set

---

## 🟡 High Priority

### 3. No Rate Limiting on Auth Endpoints
**Files:** `app/api/auth/login/route.ts`, `app/api/auth/logout/route.ts`  
**Created:** 2025-10-13  
**Priority:** 🟡 High

**Issue:**
No protection against brute force attacks on login endpoint.

**Impact:**
- ⚠️ Vulnerable to credential stuffing
- ⚠️ Vulnerable to DDoS
- ⚠️ Resource exhaustion

**Solution:**
Implement rate limiting using Upstash Redis or Cloudflare KV.

**Estimated Effort:** 3 hours

**Dependencies:**
- Choose between Upstash Redis vs Cloudflare KV
- Install rate limiting library

---

### 4. No CSRF Protection
**Files:** All API routes with POST/PUT/DELETE  
**Created:** 2025-10-13  
**Priority:** 🟡 High

**Issue:**
API routes don't verify CSRF tokens.

**Impact:**
- ⚠️ Vulnerable to CSRF attacks
- ⚠️ Unauthorized actions possible

**Solution:**
1. Generate CSRF token on session creation
2. Add token to forms
3. Validate token in API routes

**Estimated Effort:** 4 hours

**Related:**
- Update SessionData interface
- Update all forms
- Update all API routes

---

### 5. No Password Strength Validation
**Files:** Future registration/setup wizard  
**Created:** 2025-10-13  
**Priority:** 🟡 High

**Issue:**
No validation for password complexity when creating accounts.

**Impact:**
- ⚠️ Weak passwords possible
- ⚠️ Account security risk

**Solution:**
Implement Zod schema with password strength rules:
- Min 8 characters
- At least 1 uppercase
- At least 1 lowercase
- At least 1 number
- At least 1 special character

**Estimated Effort:** 2 hours

**Blockers:**
- Need to implement registration flow first

---

### 6. Unused Password Utilities
**File:** `lib/auth/password.ts`  
**Created:** 2025-10-13  
**Priority:** 🟡 High

**Issue:**
Password hashing functions (`hashPassword`, `verifyPassword`) are created but not currently used in login flow.

**Impact:**
- 📦 Dead code (until production auth is implemented)
- 🤔 Confusion about which auth mechanism is active

**Solution:**
Will be used when replacing demo credentials (Technical Debt #1).

**Estimated Effort:** Included in #1

**Status:** ⏳ Waiting for database integration

---

### 7. No Error Monitoring
**Files:** All API routes  
**Created:** 2025-10-13  
**Priority:** 🟡 High

**Issue:**
Errors only logged to console, no centralized error tracking.

**Impact:**
- ⚠️ Hard to debug production issues
- ⚠️ No visibility into error frequency
- ⚠️ No alerting on critical errors

**Solution:**
Integrate Sentry or similar error tracking service.

**Estimated Effort:** 2 hours

**Cost:** Sentry free tier should be sufficient for MVP

---

## 🟢 Medium Priority

### 8. Missing Input Sanitization
**Files:** All API routes receiving user input  
**Created:** 2025-10-13  
**Priority:** 🟢 Medium

**Issue:**
User input not sanitized before database operations.

**Impact:**
- ⚠️ Potential for injection attacks
- ⚠️ XSS vulnerabilities

**Solution:**
1. Use Zod for input validation on all API routes
2. Sanitize HTML in user-generated content
3. Use parameterized queries (already using Drizzle ORM, which helps)

**Estimated Effort:** 3 hours

**Note:** Drizzle ORM provides some protection, but explicit validation needed.

---

### 9. No Session Expiry/Rotation
**File:** `lib/auth/session.ts`  
**Created:** 2025-10-13  
**Priority:** 🟢 Medium

**Issue:**
Sessions last 7 days with no rotation or idle timeout.

**Impact:**
- 🔐 Longer exposure window if session stolen
- 🔐 No forced re-authentication

**Solution:**
1. Implement idle timeout (e.g., 30 minutes)
2. Rotate session ID periodically
3. Rotate on privilege escalation

**Estimated Effort:** 4 hours

**Complexity:** Medium - requires tracking last activity

---

### 10. Middleware Public Routes Hardcoded
**File:** `middleware.ts`  
**Lines:** 10  
**Created:** 2025-10-13  
**Priority:** 🟢 Medium

**Issue:**
```typescript
const publicRoutes = ["/login", "/api/auth/login"];
```

Public routes list is hardcoded and may need updates as app grows.

**Impact:**
- 🔧 Maintenance burden
- 🐛 Easy to forget to update when adding new auth routes

**Solution:**
Create configuration file for public routes.

**Estimated Effort:** 1 hour

**Example:**
```typescript
// config/routes.ts
export const PUBLIC_ROUTES = [
  "/login",
  "/register", // if added later
  "/forgot-password",
  "/reset-password",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/forgot-password",
] as const;
```

---

## 📋 Resolution Workflow

### Before Addressing Technical Debt:

1. **Prioritize** based on:
   - Security impact
   - User impact
   - Development blocker
   - Effort required

2. **Create Task** in TASKS.md if substantial work

3. **Branch** from main:
   ```bash
   git checkout -b fix/tech-debt-[number]-[short-description]
   ```

4. **Fix** the issue with proper testing

5. **Update** this document:
   - Move item to "Resolved" section below
   - Add resolution date
   - Note any learnings

6. **PR & Review** before merging

---

## ✅ Resolved Technical Debt

### #11: Static Export Config Blocking Dynamic Routes
**Resolved:** 2025-10-13  
**Resolution Time:** 15 minutes  
**Issue:** `output: "export"` in `next.config.ts` prevented dynamic rendering needed for auth  
**Fix:** Removed `output: "export"` - not needed for Cloudflare Pages with `@cloudflare/next-on-pages`  
**Files:** `next.config.ts`

### #12: Middleware Blocking Auth API Routes
**Resolved:** 2025-10-13  
**Resolution Time:** 20 minutes  
**Issue:** Middleware redirecting `/api/auth/login` when session exists, causing 500 errors  
**Fix:** Separated public pages from public API routes - APIs never redirect  
**Files:** `middleware.ts`  
**Impact:** Login flow now works correctly

### #13: Missing Dynamic Rendering Declaration
**Resolved:** 2025-10-13  
**Resolution Time:** 10 minutes  
**Issue:** Layout using `cookies()` without `dynamic = "force-dynamic"` declaration  
**Fix:** Added `export const dynamic = "force-dynamic"` to main layout  
**Files:** `app/(main)/layout.tsx`

---

## 📊 Tracking Metrics

| Metric | Current | Goal |
|--------|---------|------|
| Total Open Items | 10 | < 5 |
| Critical Items | 2 | 0 |
| High Priority Items | 5 | < 2 |
| Avg Age (days) | 0 | < 30 |
| Resolution Rate | 0% | > 80% |

---

## 🎯 Sprint Planning

### Next Sprint Priorities:
1. 🔴 #1: Database Integration (Critical)
2. 🔴 #2: Session Secret (Critical)
3. 🟡 #3: Rate Limiting (High)

### Deferred to Later:
- 🟢 #8: Input Sanitization (Medium)
- 🟢 #9: Session Rotation (Medium)
- 🟢 #10: Middleware Config (Medium)

---

## 📚 References

- [PRODUCTION-CHECKLIST.md](./PRODUCTION-CHECKLIST.md) - Production deployment guide
- [TASKS.md](./TASKS.md) - Overall development roadmap
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) - Security best practices

---

**Last Updated:** 2025-10-13  
**Maintained By:** Development Team  
**Review Frequency:** Weekly
