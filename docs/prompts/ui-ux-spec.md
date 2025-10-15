UI/UX Specification: Guru Wali Digital Companion
1. Visi & Prinsip Desain
Visi: Menciptakan aplikasi yang modern, bersih, profesional, dan intuitif.

Prinsip Utama: Efisiensi alur kerja. Desain harus meminimalkan jumlah klik dan mempercepat tugas-tugas harian Guru Wali.

Platform: Aplikasi web responsif dengan pendekatan mobile-first dan kemampuan Progressive Web App (PWA).

2. Arsitektur Informasi (Peta Situs)
Aplikasi akan terdiri dari layar-layar utama berikut:

Layar Login

Wizard Pengaturan Awal (Hanya untuk penggunaan pertama kali)

Dashboard Utama

Daftar Siswa

Halaman Detail Siswa

Halaman Laporan

3. Alur Pengguna (User Flows)
Alur 1: Wizard Pengaturan Awal
Cuplikan kode

graph TD
    A[Langkah 1: Selamat Datang] --> B(Langkah 2: Isi Data Sekolah & Kota);
    B --> C(Langkah 3: Isi Identitas Guru);
    C --> D{Langkah 4: Tinjau Ringkasan Data};
    D -- Klik 'Edit' --> B;
    D -- Klik 'Selesai' --> E[Selesai & Masuk ke Dashboard];
Detail Langkah 2: Isian mencakup Nama Sekolah (wajib), Jenjang (wajib), Kota/Kabupaten (wajib), Alamat (opsional), Email Sekolah (opsional).

Detail Langkah 4: Terdapat dua tombol ajakan (CTA): "Edit" untuk kembali dan memperbaiki data, dan "Selesai" untuk menyimpan dan melanjutkan.

Alur 2: Mengunggah Data Siswa
Cuplikan kode

graph TD
    A[Dashboard Kosong] --> B{Pilih Tambah Siswa};
    B --> C[Opsi: Unggah File / Tambah Manual];
    C -- Unggah File --> D[Langkah 2: Unggah File];
    D --> E[Langkah 3: Pemetaan Kolom];
    E --> F{Langkah 4: Validasi, Pratinjau & Edit};
    F -- Perbaiki Kesalahan di Tabel --> F;
    F -- Semua Data Valid --> G[Langkah 5: Konfirmasi & Impor];
    G --> H[Langkah 6: Selesai & Tampilkan Daftar Siswa];
    C -- Tambah Manual --> H;
Fitur Kunci: Di langkah 4, pengguna dapat mengedit data yang salah secara langsung di tabel pratinjau untuk lolos validasi tanpa harus mengunggah ulang file.

Alur 3: Membuat Catatan Jurnal Baru
Cuplikan kode

graph TD
    A[Halaman Detail Siswa] --> B(Klik "Tambah Catatan Jurnal");
    B --> C{Muncul Formulir Jurnal};
    C --> D[Isi Formulir Sesuai Jenis Jurnal];
    D --> E(Klik "Simpan Catatan");
    E --> F[Konfirmasi & Catatan Baru Muncul di Riwayat];
    F --> A;
Jenis Jurnal: Pengguna dapat memilih antara "Catatan Perkembangan" (Lampiran B) atau "Catatan Pertemuan" (Lampiran C), yang akan menampilkan formulir yang berbeda.

4. Struktur Halaman & Fitur Utama
Halaman Daftar Siswa
Menampilkan data siswa dalam format tabel sesuai Lampiran A.

Fitur pencarian dan filter data siswa.

Halaman Detail Siswa
Halaman ini akan menjadi pusat informasi 360 derajat untuk setiap siswa, disusun dalam format tab untuk kemudahan navigasi.

Tab 1: Profil & Catatan Khusus

Menampilkan semua data identitas siswa dari Lampiran A.

Menyediakan area untuk "Catatan Khusus" dari Guru Wali.

Tab 2: Jurnal Perkembangan

Menampilkan semua data Aspek Pemantauan dari Lampiran B, dikelompokkan secara kronologis per bulan.

Setiap entri jurnal akan memiliki 5 aspek: Akademik, Karakter, Sosial-Emosional, Kedisiplinan, Potensi & Minat.

Tab 3: Log Pertemuan

Menampilkan semua Data Pertemuan dari Lampiran C dalam format tabel (Tanggal, Topik, Tindak Lanjut).

Fitur Laporan & Ekspor
Laporan Semester (Lampiran D): Aplikasi akan memiliki fitur untuk secara otomatis menghasilkan laporan semesteran dalam format PDF berdasarkan data yang telah diinput.

Unduh Laporan Lengkap Siswa: Di setiap Halaman Detail Siswa, akan ada tombol "Download Laporan Lengkap (PDF)" yang akan mengompilasi semua data dari ketiga tab (Profil, Jurnal Perkembangan, Log Pertemuan) menjadi satu file PDF yang komprehensif.

