
---

### **File 3: `architecture.md`**

```markdown
# Architecture Document: Guru Wali Digital Companion

## 1. Ringkasan Teknis

Dokumen ini menguraikan arsitektur teknis untuk aplikasi Guru Wali MVP. Arsitektur ini dirancang untuk kesederhanaan, kecepatan pengembangan, dan keandalan, dengan memanfaatkan ekosistem Cloudflare.

* **Arsitektur:** Monolith, Single-User per Tenant.
* **Platform:** Next.js di atas Cloudflare Pages.
* **Database:** Cloudflare D1 (kompatibel dengan SQLite).
* **Penyimpanan File:** Cloudflare R2.
* **UI:** Tailwind CSS + shadcn/ui.

## 2. Skema Database

### Struktur Tabel

```sql
-- Tabel untuk menyimpan data pengguna utama (Guru Wali)
CREATE TABLE User (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    hashed_password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    nip_nuptk TEXT, -- Opsional
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk menyimpan profil sekolah milik pengguna
CREATE TABLE SchoolProfile (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    school_name TEXT NOT NULL,
    education_stage TEXT NOT NULL, -- 'SD', 'SMP', 'SMA'
    city_district TEXT NOT NULL,
    address TEXT, -- Opsional
    school_email TEXT, -- Opsional
    FOREIGN KEY (user_id) REFERENCES User(id)
);

-- Tabel untuk menyimpan data identitas setiap siswa
CREATE TABLE Student (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL, -- Terhubung langsung ke guru
    full_name TEXT NOT NULL,
    nisn TEXT, -- Nomor Induk Siswa Nasional, opsional
    classroom TEXT, -- Misal: '7A', '7B'
    gender TEXT, -- 'L' atau 'P'
    parent_contact TEXT,
    special_notes TEXT, -- Catatan khusus yang selalu terlihat
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User(id)
);

-- Tabel ini merefleksikan struktur Lampiran B: Catatan Perkembangan Bulanan
CREATE TABLE MonthlyJournal (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    monitoring_period TEXT NOT NULL, -- Misal: 'Juli 2025'
    
    -- Kolom untuk setiap aspek pemantauan
    academic_desc TEXT,
    academic_follow_up TEXT,
    academic_notes TEXT,
    
    character_desc TEXT,
    character_follow_up TEXT,
    character_notes TEXT,
    
    social_emotional_desc TEXT,
    social_emotional_follow_up TEXT,
    social_emotional_notes TEXT,
    
    discipline_desc TEXT,
    discipline_follow_up TEXT,
    discipline_notes TEXT,
    
    potential_interest_desc TEXT,
    potential_interest_follow_up TEXT,
    potential_interest_notes TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES Student(id)
);

-- Tabel ini merefleksikan struktur Lampiran C: Rekap Pertemuan
CREATE TABLE MeetingLog (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    meeting_date DATE NOT NULL,
    topic TEXT NOT NULL,
    follow_up TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES Student(id)
);
Diagram Relasi Entitas
Cuplikan kode

erDiagram
    User ||--o{ SchoolProfile : "has"
    User ||--o{ Student : "manages"
    Student ||--o{ MonthlyJournal : "has"
    Student ||--o{ MeetingLog : "has"

    User {
        TEXT id PK
        TEXT email
        TEXT full_name
    }
    SchoolProfile {
        TEXT id PK
        TEXT user_id FK
        TEXT school_name
    }
    Student {
        TEXT id PK
        TEXT user_id FK
        TEXT full_name
        TEXT classroom
    }
    MonthlyJournal {
        TEXT id PK
        TEXT student_id FK
        TEXT monitoring_period
        TEXT academic_desc
        TEXT character_desc
        TEXT social_emotional_desc
        TEXT discipline_desc
        TEXT potential_interest_desc
    }
    MeetingLog {
        TEXT id PK
        TEXT student_id FK
        DATE meeting_date
        TEXT topic
    }
3. Struktur Aplikasi (Folder & File)
Plaintext

/
├── app/                  # Direktori utama untuk routing & halaman
│   ├── (auth)/           # Grup untuk halaman otentikasi
│   │   └── login/
│   ├── (main)/           # Grup untuk halaman utama setelah login
│   │   ├── dashboard/
│   │   ├── students/
│   │   │   └── [studentId]/ # Halaman detail siswa
│   │   └── reports/
│   └── api/              # Di sini letak "pintu-pintu" API kita
│       ├── students/
│       └── journals/
├── components/           # Komponen UI yang bisa dipakai ulang (shadcn/ui)
│   └── ui/
├── lib/                  # Logika bisnis, koneksi database, utilitas
│   ├── db.ts             # Konfigurasi koneksi database D1
│   ├── actions.ts        # Fungsi-fungsi server (misal: simpan jurnal)
│   └── utils.ts
├── prisma/               # (atau Drizzle) Skema database ORM
│   └── schema.prisma
└── public/               # File statis (gambar, template CSV)
4. API Endpoints
Otentikasi & Pengguna

POST /api/auth/login: Untuk proses login guru.

POST /api/auth/setup: Untuk menyimpan data dari wizard pengaturan awal.

GET /api/me: Untuk mendapatkan data guru yang sedang login.

Manajemen Siswa

POST /api/students/import: Untuk menangani unggahan file CSV/Excel.

GET /api/students: Untuk mendapatkan daftar semua siswa.

POST /api/students: Untuk menambah satu siswa baru secara manual.

GET /api/students/[studentId]: Untuk mendapatkan detail lengkap satu siswa.

PUT /api/students/[studentId]: Untuk memperbarui data siswa.

Jurnal & Pertemuan

POST /api/journals: Untuk menyimpan "Catatan Perkembangan Bulanan" baru (Lampiran B).

POST /api/meetings: Untuk menyimpan "Catatan Pertemuan" baru (Lampiran C).

Laporan

GET /api/reports/semester?studentId=...: Untuk menghasilkan Laporan Semester (Lampiran D).

GET /api/reports/full?studentId=...: Untuk menghasilkan Laporan Lengkap per siswa dalam format PDF.