Product Requirements Document (PRD): Guru Wali Digital Companion
1. Goal, Objective and Context
Goal: Menyediakan alat bantu digital personal yang terorganisir, efisien, dan andal bagi setiap Guru Wali di Indonesia untuk menjalankan tugas pendampingan siswa secara holistik sesuai amanat Permendikdasmen No. 11 Tahun 2025.

Objective: Untuk MVP, tujuannya adalah meluncurkan aplikasi web PWA (Progressive Web App) single-user yang stabil dan intuitif, yang memungkinkan guru untuk secara efisien mencatat, mengelola, dan melaporkan data perkembangan siswa, sehingga membuktikan nilai produk dan membangun fondasi untuk pengembangan di masa depan.

Context: Saat ini, Guru Wali tidak memiliki perangkat lunak khusus untuk peran mereka, memaksa mereka menggunakan metode manual yang tidak efisien dan tidak terstruktur. Aplikasi ini mengisi kekosongan tersebut dengan menyediakan solusi digital yang fokus pada kebutuhan inti seorang Guru Wali: pencatatan terpusat, pencarian cepat, dan pelaporan profesional.

2. Functional Requirements (MVP)
Pengguna (Guru Wali) dapat melakukan setup awal untuk identitas sekolah dan pribadi.

Pengguna dapat mengunggah dan mengelola data profil siswa.

Pengguna dapat membuat, melihat, dan mengelola catatan jurnal untuk setiap siswa.

Pengguna dapat membuat dan melacak rencana intervensi sederhana.

Pengguna dapat melihat ringkasan data melalui dashboard.

Pengguna dapat menghasilkan laporan perkembangan siswa dalam format PDF.

3. Non-Functional Requirements (MVP)
Platform: Aplikasi harus berupa Progressive Web App (PWA), dapat diakses melalui browser di desktop dan mobile, serta dapat di-install di perangkat.

Stabilitas: Aplikasi harus berjalan dengan andal tanpa keluhan teknis yang signifikan dari pengguna awal.

Keamanan: Data pribadi siswa harus disimpan dengan aman, memanfaatkan fitur keamanan platform yang digunakan (Cloudflare).

Performa: Aplikasi harus responsif dan cepat, bahkan saat mengelola data untuk beberapa kelas sekaligus.

4. User Interaction and Design Goals
Aplikasi akan memiliki tampilan yang modern, mengikuti tren web terbaru, bersih, profesional, dan intuitif. Alur kerja harus dirancang untuk meminimalkan jumlah klik dan mempercepat tugas-tugas yang sering dilakukan seperti menambah catatan jurnal. Desain harus responsif penuh (mobile-first) untuk memastikan pengalaman pengguna yang konsisten di semua perangkat.

5. Technical Assumptions
Model Arsitektur: Untuk MVP, aplikasi ini dirancang sebagai aplikasi single-user, di mana setiap guru yang membeli aplikasi adalah satu tenant yang terisolasi.

Tech Stack: Pengembangan akan menggunakan tumpukan teknologi yang telah disetujui: Next.js dan ekosistem Cloudflare (Pages, D1, R2). Kombinasi spesifik yang diutamakan adalah Next.js + Tailwind CSS + shadcn/ui.

Repository & Service Architecture: Proyek akan menggunakan struktur Monorepo dan arsitektur Monolith pada awalnya, karena ini adalah pendekatan yang paling efisien untuk aplikasi single-user.

Integrasi Eksternal: MVP tidak akan memiliki integrasi dengan sistem eksternal manapun.

Testing Requirements: Kualitas adalah kunci. Semua fungsionalitas inti yang dikembangkan harus didukung oleh pengujian otomatis (misalnya, unit test dan integration test) untuk memastikan stabilitas aplikasi dan mencegah kemunduran (regresi) pada versi mendatang.

6. Epic Overview
Epic 1: Fondasi Aplikasi & Onboarding Guru
Goal: Mempersiapkan seluruh fondasi teknis proyek dan menyediakan alur kerja yang mulus bagi Guru Wali baru untuk melakukan pengaturan awal aplikasi dan mengimpor data siswa mereka.

Story 1.1: Sebagai Guru Wali, saya ingin menyelesaikan wizard pengaturan awal saat pertama kali membuka aplikasi, sehingga saya bisa memasukkan detail sekolah dan identitas pribadi saya untuk digunakan pada laporan.

Story 1.2: Sebagai Guru Wali, saya ingin mengunggah daftar siswa dari file CSV/Excel, sehingga saya bisa memasukkan data seluruh siswa saya ke dalam sistem dengan cepat dan efisien.

Story 1.3: Sebagai Guru Wali, saya ingin dapat menambah, melihat, dan mengedit profil siswa secara manual, sehingga saya bisa memastikan data siswa selalu akurat dan terkini.

Epic 2: Manajemen Pendampingan & Jurnal Harian
Goal: Menyediakan fitur inti bagi Guru Wali untuk melakukan pencatatan perkembangan siswa dan merencanakan tindak lanjut yang diperlukan dalam aktivitas sehari-hari mereka.

Story 2.1: Sebagai Guru Wali, saya ingin membuat catatan jurnal baru untuk seorang siswa dengan kategori (akademik, karakter, insiden), sehingga saya bisa mendokumentasikan setiap observasi penting secara terstruktur.

Story 2.2: Sebagai Guru Wali, saya ingin melihat semua riwayat jurnal seorang siswa dalam satu halaman, sehingga saya dapat dengan mudah meninjau perkembangan mereka dari waktu ke waktu.

Story 2.3: Sebagai Guru Wali, saya ingin membuat rencana intervensi sederhana untuk siswa yang membutuhkan perhatian khusus, sehingga saya bisa mencatat tujuan dan langkah-langkah tindak lanjutnya.

Epic 3: Analitik Sederhana & Pelaporan Profesional
Goal: Memberikan kemampuan kepada Guru Wali untuk melihat gambaran umum kondisi siswa secara sekilas dan menghasilkan laporan profesional untuk keperluan evaluasi dan komunikasi.

Story 3.1: Sebagai Guru Wali, saya ingin melihat dashboard utama yang menampilkan ringkasan aktivitas terbaru dan daftar siswa yang mungkin memerlukan perhatian, sehingga saya bisa memprioritaskan pekerjaan saya.

Story 3.2: Sebagai Guru Wali, saya ingin menghasilkan laporan perkembangan siswa per periode (bulanan/semester) dalam format PDF, sehingga saya memiliki dokumen profesional untuk dibagikan kepada orang tua atau kepala sekolah.

7. Out of Scope Ideas Post MVP
Fitur Formulir Siswa via Link (Prioritas Tinggi untuk V2): Menyediakan link unik yang bisa dibagikan kepada siswa untuk mengisi masukan atau cerita mereka sendiri, yang kemudian akan terintegrasi langsung ke dalam aplikasi Guru Wali.

Fitur Kolaborasi Multi-User (Guru BK, Kepala Sekolah).

Analitik & Peringatan Otomatis (Rule Engine).

Fitur Komunikasi Internal (Komentar).

Kustomisasi Laporan (Report Builder).

8. Key Reference Documents
Project Brief: Guru Wali Digital Companion

Prompt untuk Design Architect (UI/UX Specification Mode)
Objective: Menguraikan aspek UI/UX dari produk yang didefinisikan dalam PRD ini.
Mode: UI/UX Specification Mode
Input: Dokumen PRD ini yang sudah lengkap.
Tugas Utama:

Tinjau tujuan produk, user stories, dan catatan terkait UI di dalam dokumen ini.

Secara kolaboratif, definisikan alur pengguna (user flows) yang detail, wireframe (konseptual), dan deskripsi layar utama.

Spesifikasikan persyaratan kegunaan (usability) dan pertimbangan aksesibilitas (accessibility).

Buat atau isi dokumen front-end-spec-tmpl.

Pastikan PRD ini diperbarui atau secara jelas mereferensikan spesifikasi UI/UX yang detail, sehingga menjadi fondasi yang komprehensif untuk fase arsitektur dan pengembangan selanjutnya.