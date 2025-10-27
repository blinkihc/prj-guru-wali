-- Seed dummy data untuk semua tabel kosong
-- Created: 2025-10-19

-- 1. Insert school profile
INSERT INTO school_profiles (id, user_id, school_name, education_stage, city_district, address, school_email, created_at)
VALUES (
  'school-001',
  'test-user-001',
  'SMP Negeri 1 Jakarta',
  'SMP',
  'Jakarta Pusat',
  'Jl. Merdeka No. 123, Jakarta Pusat',
  'smpn1jakarta@example.com',
  datetime('now')
);

-- 2. Insert students (5 dummy students)
INSERT INTO students (id, user_id, full_name, nisn, classroom, gender, parent_name, parent_contact, special_notes, created_at)
VALUES 
  ('student-001', 'test-user-001', 'Ahmad Rizki', '1234567890001', '7A', 'L', 'Budi Santoso', '081234567890', 'Siswa berprestasi', datetime('now')),
  ('student-002', 'test-user-001', 'Siti Nurhaliza', '1234567890002', '7A', 'P', 'Siti Rahayu', '081234567891', 'Aktif dalam kegiatan sekolah', datetime('now')),
  ('student-003', 'test-user-001', 'Rendra Wijaya', '1234567890003', '7B', 'L', 'Wijaya Kusuma', '081234567892', 'Perlu perhatian khusus', datetime('now')),
  ('student-004', 'test-user-001', 'Dina Kusuma', '1234567890004', '7B', 'P', 'Kusuma Dewi', '081234567893', 'Siswa pendiam', datetime('now')),
  ('student-005', 'test-user-001', 'Eka Putra', '1234567890005', '7C', 'L', 'Putra Jaya', '081234567894', 'Aktif dan kreatif', datetime('now'));

-- 3. Insert meeting logs (5 dummy meeting logs)
INSERT INTO meeting_logs (id, student_id, meeting_date, topic, follow_up, notes, created_at)
VALUES 
  ('meeting-001', 'student-001', '2025-10-15', 'Diskusi Prestasi Akademik', 'Lanjutkan usaha', 'Siswa menunjukkan peningkatan nilai', datetime('now')),
  ('meeting-002', 'student-002', '2025-10-14', 'Pembahasan Perilaku', 'Monitor kedisiplinan', 'Perlu ditingkatkan kehadiran', datetime('now')),
  ('meeting-003', 'student-003', '2025-10-13', 'Konsultasi Masalah Belajar', 'Beri tutor tambahan', 'Kesulitan dalam mata pelajaran matematika', datetime('now')),
  ('meeting-004', 'student-004', '2025-10-12', 'Evaluasi Sosial', 'Dorong partisipasi', 'Perlu lebih aktif berinteraksi', datetime('now')),
  ('meeting-005', 'student-005', '2025-10-11', 'Apresiasi Prestasi', 'Pertahankan motivasi', 'Siswa sangat berprestasi', datetime('now'));

-- 4. Insert monthly journals (5 dummy monthly journals)
INSERT INTO monthly_journals (
  id, student_id, monitoring_period,
  academic_desc, academic_follow_up, academic_notes,
  character_desc, character_follow_up, character_notes,
  social_emotional_desc, social_emotional_follow_up, social_emotional_notes,
  discipline_desc, discipline_follow_up, discipline_notes,
  potential_interest_desc, potential_interest_follow_up, potential_interest_notes,
  created_at
)
VALUES 
  (
    'journal-001', 'student-001', 'Oktober 2025',
    'Nilai akademik meningkat', 'Pertahankan prestasi', 'Siswa rajin mengerjakan tugas',
    'Perilaku baik dan sopan', 'Terus dijaga', 'Menghormati guru dan teman',
    'Interaksi sosial baik', 'Tingkatkan kepemimpinan', 'Banyak teman',
    'Disiplin tinggi', 'Pertahankan', 'Selalu tepat waktu',
    'Minat pada seni', 'Dukung bakat seni', 'Aktif di klub seni',
    datetime('now')
  ),
  (
    'journal-002', 'student-002', 'Oktober 2025',
    'Nilai stabil', 'Tingkatkan fokus', 'Perlu lebih konsentrasi',
    'Karakter baik', 'Monitor terus', 'Jujur dan bertanggung jawab',
    'Sosial aktif', 'Pertahankan', 'Banyak teman dan disukai',
    'Disiplin cukup', 'Tingkatkan kehadiran', 'Kadang terlambat',
    'Minat pada olahraga', 'Dukung partisipasi', 'Aktif di tim bola voli',
    datetime('now')
  ),
  (
    'journal-003', 'student-003', 'Oktober 2025',
    'Nilai perlu ditingkatkan', 'Beri bimbingan intensif', 'Kesulitan matematika',
    'Perlu perbaikan sikap', 'Monitor perilaku', 'Kadang tidak menghormati',
    'Interaksi terbatas', 'Dorong partisipasi', 'Pemalu dan tertutup',
    'Disiplin kurang', 'Tingkatkan kedisiplinan', 'Sering tidak mengerjakan tugas',
    'Minat pada teknologi', 'Fasilitasi bakat', 'Suka membongkar barang elektronik',
    datetime('now')
  ),
  (
    'journal-004', 'student-004', 'Oktober 2025',
    'Nilai cukup', 'Pertahankan', 'Siswa cukup rajin',
    'Karakter baik', 'Terus dijaga', 'Sopan dan hormat',
    'Sosial pasif', 'Dorong partisipasi', 'Kurang aktif bergaul',
    'Disiplin baik', 'Pertahankan', 'Selalu mengumpulkan tugas',
    'Minat pada membaca', 'Dukung minat literasi', 'Sering membaca buku',
    datetime('now')
  ),
  (
    'journal-005', 'student-005', 'Oktober 2025',
    'Nilai sangat baik', 'Pertahankan prestasi', 'Siswa sangat berprestasi',
    'Karakter sangat baik', 'Jadikan teladan', 'Jujur, bertanggung jawab, sopan',
    'Sosial sangat aktif', 'Pertahankan kepemimpinan', 'Pemimpin kelas yang baik',
    'Disiplin sangat tinggi', 'Pertahankan', 'Selalu disiplin dan tepat waktu',
    'Minat pada kepemimpinan', 'Dukung pengembangan', 'Aktif di organisasi sekolah',
    datetime('now')
  );

-- 5. Insert interventions (3 dummy interventions)
INSERT INTO interventions (id, student_id, title, issue, goal, action_steps, status, start_date, end_date, notes, created_at, updated_at)
VALUES 
  (
    'intervention-001', 'student-003', 'Bimbingan Matematika', 'Kesulitan memahami konsep matematika', 'Meningkatkan nilai matematika ke minimal 75', 'Tutor pribadi 2x seminggu, latihan soal harian, konsultasi dengan guru', 'active', '2025-10-01', NULL, 'Siswa menunjukkan peningkatan', datetime('now'), datetime('now')
  ),
  (
    'intervention-002', 'student-004', 'Peningkatan Partisipasi Sosial', 'Siswa kurang aktif dalam interaksi sosial', 'Meningkatkan kepercayaan diri dan partisipasi', 'Ajak bergabung dalam kelompok diskusi, dorong presentasi, kegiatan kelompok', 'active', '2025-10-05', NULL, 'Mulai menunjukkan peningkatan', datetime('now'), datetime('now')
  ),
  (
    'intervention-003', 'student-001', 'Pengembangan Bakat Seni', 'Siswa memiliki bakat seni yang perlu dikembangkan', 'Mengasah kemampuan seni dan kreativitas', 'Ikuti kelas seni tambahan, ikuti kompetisi seni, bimbingan dari guru seni', 'active', '2025-10-08', NULL, 'Siswa sangat antusias', datetime('now'), datetime('now')
  );
