# 📚 Guru Wali Digital Companion

> **Aplikasi pendamping guru wali untuk dokumentasi dan monitoring perkembangan siswa**

Guru Wali adalah aplikasi web modern yang membantu guru wali dalam mendokumentasikan dan memantau perkembangan siswa secara sistematis dan profesional.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-orange)](https://pages.cloudflare.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## 🚀 **QUICK DEPLOY** 

**Siap deploy dalam 15 menit!** Ikuti tutorial lengkap:

| 📖 Tutorial | 📝 Deskripsi |
|------------|-------------|
| **[⚡ QUICK_START.md](./QUICK_START.md)** | **Start here!** Deploy dalam 15 menit |
| [🔧 CLOUDFLARE_SETUP.md](./CLOUDFLARE_SETUP.md) | Tutorial lengkap setup Cloudflare |
| [🔐 ENV_VARIABLES.md](./ENV_VARIABLES.md) | Reference environment variables |
| [📦 DEPLOYMENT.md](./DEPLOYMENT.md) | Production deployment guide |

**New to Cloudflare?** → [CLOUDFLARE_SETUP.md](./CLOUDFLARE_SETUP.md)  
**Ready to deploy?** → [QUICK_START.md](./QUICK_START.md)

---

## 🎯 Fitur Utama

- ✅ **Manajemen Data Siswa** - Kelola profil siswa dengan mudah
- ✅ **Jurnal Bulanan** - Catat perkembangan siswa dalam 5 aspek pemantauan
- ✅ **Log Pertemuan** - Dokumentasi pertemuan dengan siswa/orangtua
- ✅ **Laporan Profesional** - Generate laporan PDF siap cetak
- ✅ **Dashboard Analytics** - Visualisasi progress dan insights
- ✅ **Import CSV/Excel** - Bulk import data siswa
- ✅ **PWA Ready** - Install sebagai aplikasi mobile

---

## 🚀 Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod

### Backend
- **Runtime:** Cloudflare Pages (Edge)
- **Database:** Cloudflare D1 (SQLite)
- **ORM:** Drizzle ORM
- **Auth:** Custom (bcryptjs + iron-session)
- **Storage:** Cloudflare R2 (future)

### Development
- **Package Manager:** Bun
- **Linter/Formatter:** Biome
- **Testing:** Vitest (planned)
- **E2E:** Playwright (planned)

---

## 📦 Installation

### Prerequisites
- [Bun](https://bun.sh/) >= 1.0
- [Node.js](https://nodejs.org/) >= 18 (for compatibility)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (optional)

### Setup Steps

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd prj-guru-wali
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add:
   ```bash
   SESSION_SECRET="[generate with: openssl rand -base64 32]"
   ```

4. **Setup database**
   ```bash
   # Create local D1 database
   bun run db:create

   # Run migrations
   bun run db:migrate

   # (Optional) Seed demo data
   bun run db:seed
   ```

5. **Start development server**
   ```bash
   bun run dev
   ```

6. **Open browser**
   ```
   http://localhost:3000
   ```

---

## 🔑 Demo Credentials

For testing purposes (MVP only):

```
Email: guru@example.com
Password: password123
```

⚠️ **Note:** This is hardcoded for MVP. Replace with real database auth before production.

---

## 📁 Project Structure

```
prj-guru-wali/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication routes (no layout)
│   │   ├── login/           # Login page
│   │   └── layout.tsx       # Auth layout
│   ├── (main)/              # Main app routes (with AppShell)
│   │   ├── page.tsx         # Dashboard
│   │   └── layout.tsx       # Main layout
│   ├── api/                 # API routes
│   │   └── auth/            # Auth endpoints
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   └── layout/              # Layout components (Header, Sidebar, AppShell)
├── drizzle/                 # Database
│   ├── schema/              # Drizzle schemas
│   └── migrations/          # SQL migrations
├── lib/                     # Utilities
│   ├── auth/                # Auth utilities (password, session)
│   ├── db/                  # Database client
│   └── utils.ts             # Helper functions
├── public/                  # Static assets
├── middleware.ts            # Next.js middleware (route protection)
├── drizzle.config.ts        # Drizzle configuration
├── next.config.ts           # Next.js configuration
├── wrangler.toml            # Cloudflare configuration
├── TASKS.md                 # Development roadmap
├── PRODUCTION-CHECKLIST.md  # Production deployment guide
└── TECHNICAL-DEBT.md        # Technical debt tracker
```

---

## 🛠️ Available Scripts

### Development
```bash
bun run dev          # Start dev server (localhost:3000)
bun run build        # Build for production
bun run start        # Start production server
bun run preview      # Preview production build locally
```

### Code Quality
```bash
bun run typecheck    # TypeScript type checking
bun run check        # Biome linter check
bun run check:write  # Biome linter fix
bun run format       # Format code with Biome
```

### Database
```bash
bun run db:create              # Create local D1 database
bun run db:generate            # Generate migration from schema
bun run db:migrate             # Apply migrations (local)
bun run db:migrate-production  # Apply migrations (production)
bun run db:studio              # Open Drizzle Studio
bun run db:seed                # Seed demo data
```

### Deployment
```bash
bun run deploy:preview    # Deploy to preview environment
bun run deploy:prod       # Deploy to production
```

---

## 🎨 Development Workflow

### 1. Create Feature Branch
```bash
git checkout -b feature/[epic-number]-[short-description]
# Example: git checkout -b feature/epic1-student-import
```

### 2. Develop Feature
- Write code following patterns in `AGENTS.md`
- Keep components small (<300 lines)
- Use TypeScript strictly
- Follow shadcn/ui patterns

### 3. Quality Checks
```bash
# Before committing
bun run typecheck
bun run check:write
```

### 4. Test Locally
```bash
bun run dev
# Test in browser
```

### 5. Commit & Push
```bash
git add .
git commit -m "feat(epic1): Add student import feature"
git push origin feature/epic1-student-import
```

---

## 📖 Documentation

### For Developers
- **[TASKS.md](./TASKS.md)** - Complete development roadmap with Epics & Stories
- **[AGENTS.md](./AGENTS.md)** - Development guidelines & best practices
- **[TECHNICAL-DEBT.md](./TECHNICAL-DEBT.md)** - Technical debt tracker
- **[PRODUCTION-CHECKLIST.md](./PRODUCTION-CHECKLIST.md)** - Production deployment guide

### For Users
- **User Guide** - *(Coming soon)*
- **FAQ** - *(Coming soon)*

---

## 🚀 Deployment

### Cloudflare Pages (Production)

1. **Prerequisites**
   - Cloudflare account
   - D1 database created
   - Environment variables configured

2. **Deploy via GitHub**
   - Connect repository to Cloudflare Pages
   - Auto-deploy on push to `main`

3. **Deploy via CLI**
   ```bash
   # Deploy to production
   bun run deploy:prod
   
   # Run production migrations
   bun run db:migrate-production
   ```

4. **Post-Deployment**
   - Verify D1 bindings
   - Test auth flow
   - Check error logs

**📚 Full deployment guide:** [PRODUCTION-CHECKLIST.md](./PRODUCTION-CHECKLIST.md)

---

## 🧪 Testing

### Current Status
- ✅ TypeScript strict mode enabled
- ✅ Biome linter configured
- ⏳ Unit tests (planned)
- ⏳ Integration tests (planned)
- ⏳ E2E tests (planned)

### Run Tests (when implemented)
```bash
bun run test           # Run unit tests
bun run test:watch     # Run in watch mode
bun run test:e2e       # Run E2E tests
bun run test:coverage  # Coverage report
```

---

## 🤝 Contributing

### Development Rules
1. **Always** follow guidelines in `AGENTS.md`
2. **Always** run linter before committing
3. **Always** write tests for new features (when testing setup)
4. **Never** commit secrets or API keys
5. **Never** modify code unrelated to your task

### Code Style
- **Language:** Indonesian (UI, comments, docs)
- **Components:** Functional components with TypeScript
- **Formatting:** Biome (auto-format on save)
- **Commits:** Conventional commits (feat, fix, docs, etc.)

---

## 📊 Project Status

### Current Progress
- **Epic 0: Project Setup** - ✅ 100% Complete (5/5 stories)
- **Epic 1: Fondasi & Onboarding** - ⚪ Not Started (0/3 stories)
- **Epic 2: Jurnal & Pendampingan** - ⚪ Not Started (0/3 stories)
- **Epic 3: Analitik & Pelaporan** - ⚪ Not Started (0/2 stories)

**Overall MVP Progress:** 38% (5/13 stories)

### Recent Updates
- ✅ 2025-10-13: Authentication system completed
- ✅ 2025-10-12: UI components & layouts setup
- ✅ 2025-10-12: Database schema & migrations

**📈 Detailed progress:** [TASKS.md](./TASKS.md)

---

## 🐛 Known Issues

### Critical (Before Production)
- 🔴 Demo credentials hardcoded (replace with DB auth)
- 🔴 SESSION_SECRET needs to be generated

### High Priority
- 🟡 No rate limiting on auth endpoints
- 🟡 No CSRF protection
- 🟡 No error monitoring

**📋 Full list:** [TECHNICAL-DEBT.md](./TECHNICAL-DEBT.md)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

### Technologies
- [Next.js](https://nextjs.org/) - React framework
- [Cloudflare Pages](https://pages.cloudflare.com/) - Hosting & edge runtime
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling

### Resources
- [fullstack-next-cloudflare](https://github.com/ifindev/fullstack-next-cloudflare) - Base template
- [OWASP](https://owasp.org/) - Security guidelines

---

## 📞 Support

- **Issues:** Open an issue in this repository
- **Documentation:** Check `TASKS.md` and `PRODUCTION-CHECKLIST.md`
- **Technical Debt:** See `TECHNICAL-DEBT.md`

---

**Built with ❤️ for Indonesian educators**

**Last Updated:** 2025-10-13
