# 📚 Guru Wali Digital Companion

> **Aplikasi pendamping guru wali untuk dokumentasi dan monitoring perkembangan siswa**

Guru Wali adalah aplikasi web modern yang membantu guru wali dalam mendokumentasikan dan memantau perkembangan siswa secara sistematis dan profesional.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-orange)](https://pages.cloudflare.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

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

## 📦 Quick Start

```bash
# Install dependencies
bun install

# Setup environment
cp .env.example .env.local

# Start development
bun run dev
```

Open http://localhost:3000

---

## 🛠️ Scripts

```bash
bun run dev              # Development server
bun run build            # Build for production
bun run check:write      # Lint & format
bun run db:generate      # Generate migrations
```

---

---

## 📄 License

MIT License

---

**Built with ❤️ for Indonesian educators**
