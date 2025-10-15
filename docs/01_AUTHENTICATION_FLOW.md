# Authentication & Onboarding Flow

> **Last Updated:** 2025-01-14

## 1. Login Flow

**Entry Point:** `/login`

### Flow Diagram

```
User visits /login
      ↓
[Email Input]
[Password Input]
[Masuk Button]
      ↓
Submit Form
      ↓
API: POST /api/auth
- Validate credentials
- Create session
- Set cookie
      ↓
Success? ──┬─→ Yes → Check onboarding status
           │          ↓
           │     Completed? ──┬─→ Yes → Dashboard
           │                  └─→ No → /setup
           │
           └─→ No → Show error toast
```

### Key Files
- `app/(auth)/login/page.tsx` - Login UI
- `app/api/auth/route.ts` - Authentication API
- `lib/auth/session.ts` - Session management

### Demo Credentials
- Email: `guru@example.com`
- Password: `password123`

---

## 2. Onboarding Wizard Flow

**Entry Point:** `/setup` (auto-redirect if not completed)

### Steps

#### Step 1: Welcome
- Introduction message
- Continue button

#### Step 2: School Profile
**Fields:**
- School Name (required)
- School Address (required)
- Principal Name (required)

#### Step 3: User Profile
**Fields:**
- Full Name (required)
- Phone Number (+62 format)

### Completion
```
Submit final step
      ↓
API: POST /api/onboarding
- Mark onboarding complete
- Save to session
- Update database
      ↓
Redirect to /dashboard
```

### Key Files
- `app/(main)/setup/page.tsx` - Wizard container
- `components/wizard/steps/` - Step components
- `app/api/onboarding/route.ts` - Completion API
