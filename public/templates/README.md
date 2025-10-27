# Template Import Data Siswa

## File Template CSV

Download: [students-import-template.csv](./students-import-template.csv)

---

## Format Kolom

**Catatan Penting:**
- ⚠️ Template CSV berisi **29 kolom biodata utama** + 2 kolom placeholder
- ⚠️ **Photo URL** dan **Social Media** TIDAK termasuk dalam CSV
- Tambahkan Photo URL dan Social Media melalui fitur **Edit Siswa** di UI setelah import

### Kolom Utama

| Kategori | Nama Kolom | Deskripsi | Wajib? |
|----------|------------|-----------|--------|
| **Identitas** | fullName | Nama lengkap siswa | ✅ Ya |
| | nis | Nomor Induk Sekolah | ❌ Tidak |
| | nisn | NISN (10 digit) | ❌ Tidak |
| | classroom | Kelas | ❌ Tidak |
| | gender | Jenis kelamin (L/P) | ❌ Tidak |
| | birthPlace | Tempat lahir | ❌ Tidak |
| | birthDate | Tanggal lahir (YYYY-MM-DD) | ❌ Tidak |
| | religion | Agama | ❌ Tidak |
| | bloodType | Golongan darah | ❌ Tidak |
| | economicStatus | Status ekonomi | ❌ Tidak |
| | address | Alamat lengkap | ❌ Tidak |
| | phoneNumber | Nomor HP siswa (628xxx) | ❌ Tidak |
| **Minat** | dream | Cita-cita | ❌ Tidak |
| | extracurricular | Ekstrakurikuler | ❌ Tidak |
| | hobby | Hobi | ❌ Tidak |
| **Orang Tua** | parentName | Nama orang tua/wali | ❌ Tidak |
| | parentContact | Kontak orang tua (628xxx) | ❌ Tidak |
| | fatherName | Nama ayah | ❌ Tidak |
| | fatherJob | Pekerjaan ayah | ❌ Tidak |
| | fatherIncome | Penghasilan ayah (angka) | ❌ Tidak |
| | motherName | Nama ibu | ❌ Tidak |
| | motherJob | Pekerjaan ibu | ❌ Tidak |
| | motherIncome | Penghasilan ibu (angka) | ❌ Tidak |
| **Kesehatan** | healthHistoryPast | Riwayat kesehatan dulu | ❌ Tidak |
| | healthHistoryCurrent | Riwayat kesehatan sekarang | ❌ Tidak |
| | healthHistoryOften | Riwayat kesehatan sering | ❌ Tidak |
| **Karakter** | characterStrength | Kekuatan karakter | ❌ Tidak |
| | characterImprovement | Perlu peningkatan | ❌ Tidak |
| **Lainnya** | specialNotes | Catatan khusus | ❌ Tidak |
| **Placeholder** | Alamat Email Siswa | Email siswa (opsional) | ❌ Tidak |
| | Nomor HP Alternatif | HP alternatif (opsional) | ❌ Tidak |

---

## Aturan Validasi

### Nama Siswa (fullName)
- ✅ **Wajib diisi**
- Minimal 2 karakter
- Maksimal 100 karakter

### NISN
- ❌ Opsional
- Jika diisi, harus 10 digit angka
- Contoh: `0012345678`

### Kelas (classroom)
- ❌ Opsional
- Format bebas (7A, VIII-B, etc.)
- Maksimal 10 karakter

### Jenis Kelamin (gender)
- ❌ Opsional
- Harus `L` (Laki-laki) atau `P` (Perempuan)
- Case insensitive (l, L, p, P diterima)

### Nama Orang Tua (parentName)
- ❌ Opsional
- Maksimal 100 karakter

### Kontak Orang Tua (parentContact)
- ❌ Opsional
- Format Indonesia: `628xxxxxxxxx` (tanpa +)
- Digit pertama setelah 62 harus 8
- Panjang: 10-13 digit setelah 62
- Contoh valid: `628123456789`

### Catatan Khusus (specialNotes)
- ❌ Opsional
- Maksimal 500 karakter

---

## Contoh Data Valid

Lihat file [students-import-template.csv](./students-import-template.csv) untuk contoh lengkap dengan 29 kolom biodata.

**Catatan:**
- Kolom yang tidak diisi bisa dikosongkan atau diisi dengan tanda "-"
- Tanggal harus format `YYYY-MM-DD` atau `DD/MM/YYYY` (akan dinormalisasi otomatis)
- Penghasilan harus angka tanpa titik/koma pemisah ribuan

---

## Tips Mengisi Data

### ✅ DO:
- Gunakan format CSV dengan encoding UTF-8
- Pastikan header kolom sesuai dengan nama di atas
- Biarkan kosong jika data opsional tidak tersedia
- Gunakan format nomor telepon 628xxx (tanpa +, spasi, atau tanda hubung)

### ❌ DON'T:
- Jangan menggunakan karakter khusus di NISN (hanya angka)
- Jangan menggunakan format nomor selain 628xxx
- Jangan gunakan spasi atau simbol di nomor telepon
- Jangan kosongkan kolom fullName (wajib diisi)
- Jangan isi Photo URL dan Social Media di CSV (tidak akan diproses)

---

## Proses Import

1. **Download Template**
   - Klik tombol "Download Template CSV"
   - File akan terdownload dengan nama `students-import-template.csv`

2. **Isi Data**
   - Buka file dengan Excel, Google Sheets, atau text editor
   - Isi data siswa sesuai format
   - Simpan sebagai CSV (UTF-8)

3. **Upload File**
   - Kembali ke aplikasi Guru Wali
   - Klik "Import dari CSV" atau drag & drop file
   - Pilih file CSV yang sudah diisi

4. **Preview & Validasi**
   - Sistem akan menampilkan preview data
   - Data yang error ditandai dengan warna merah
   - Edit data langsung di tabel preview jika perlu

5. **Konfirmasi Import**
   - Periksa data sekali lagi
   - Klik "Import Semua" untuk menyimpan ke database
   - Sistem akan menampilkan hasil import

---

## Troubleshooting

### Error: "Nama siswa wajib diisi"
- Pastikan kolom `fullName` tidak kosong di setiap baris

### Error: "NISN harus 10 digit"
- Cek NISN, harus tepat 10 angka
- Jika tidak ada NISN, kosongkan saja (tidak wajib)

### Error: "Jenis kelamin harus L atau P"
- Pastikan kolom `gender` diisi dengan `L` atau `P` saja
- Huruf besar/kecil tidak masalah (l/L/p/P diterima)

### Error: "Format nomor telepon tidak valid"
- Format yang benar: `628xxxxxxxxx`
- Digit pertama setelah 62 harus 8
- Contoh: `628123456789` ✅
- Salah: `+628123456789` ❌
- Salah: `08123456789` ❌
- Salah: `62 812 3456 789` ❌

### Data tidak muncul di preview?
- Pastikan file berformat CSV
- Cek encoding file (harus UTF-8)
- Pastikan header kolom sesuai dengan nama di template

---

## Batasan

- **Maksimal file size:** 5 MB
- **Maksimal baris:** 1000 siswa per import
- **Format file:** CSV (Comma-Separated Values)
- **Encoding:** UTF-8

---

## Support

Jika mengalami kesulitan, silakan hubungi tim support atau baca dokumentasi lengkap di aplikasi.

---

**Last Updated:** 2025-01-14  
**Version:** 1.0
