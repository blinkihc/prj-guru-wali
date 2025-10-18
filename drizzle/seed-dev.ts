/**
 * Development Seed Script
 *
 * Populates database with comprehensive mock data for testing:
 * - Dev account (email: dev@guruwali.test, password: dev123)
 * - 30 students across 3 classes (Kelas 7A, 7B, 7C)
 * - Monthly journals for all students
 * - Meeting logs (individual & group)
 * - Interventions (various categories & statuses)
 * - School profile settings
 *
 * Usage:
 * npm run db:seed:dev
 *
 * Created: 2025-10-18
 */

import { createClient } from "@libsql/client";
import * as bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/libsql";
import { nanoid } from "nanoid";
import {
  interventions,
  meetingLogs,
  monthlyJournals,
  schoolProfiles,
  students,
  users,
} from "./schema/index";

// ==========================================
// DATABASE CONNECTION
// ==========================================
// For local development, use a simple SQLite file
// This is separate from Wrangler's D1 database
// Use this for testing seed script, then copy data to Wrangler D1 if needed
const DATABASE_PATH = process.env.DATABASE_URL || "file:./local-dev.db";

const client = createClient({
  url: DATABASE_PATH,
});

const db = drizzle(client);

console.log(`📁 Using database: ${DATABASE_PATH}`);

// ==========================================
// HELPER FUNCTIONS
// ==========================================

const getRandomItem = <T>(array: T[]): T =>
  array[Math.floor(Math.random() * array.length)];

const getRandomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const getRandomDate = (start: Date, end: Date): string => {
  const date = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
  return date.toISOString();
};

// ==========================================
// MOCK DATA CONSTANTS
// ==========================================

const DEV_USER = {
  email: "dev@guruwali.test",
  password: "dev123",
  fullName: "Pak Budi Santoso, S.Pd",
  nipNuptk: "196501011990031001",
};

const STUDENT_NAMES = [
  // Kelas 7A (10 students)
  "Ahmad Hidayat",
  "Siti Nurhaliza",
  "Budi Prasetyo",
  "Rina Wulandari",
  "Dimas Anggara",
  "Putri Ayu",
  "Rizky Ramadan",
  "Dewi Sartika",
  "Eko Prasetyo",
  "Maya Angelina",
  // Kelas 7B (10 students)
  "Farel Prayoga",
  "Nabila Syakira",
  "Galih Pratama",
  "Intan Permatasari",
  "Hendra Wijaya",
  "Zahra Amelia",
  "Ilham Kurniawan",
  "Kiara Putri",
  "Joko Susilo",
  "Luna Maharani",
  // Kelas 7C (10 students)
  "Maulana Akbar",
  "Nina Safitri",
  "Oscar Ramadhan",
  "Puspita Sari",
  "Qomar Hakim",
  "Ratna Dewi",
  "Satria Wijaya",
  "Tania Maharani",
  "Umar Abdullah",
  "Vina Anggraini",
];

const JOURNAL_DESCRIPTIONS = {
  academic: [
    "Nilai rata-rata meningkat dari 75 menjadi 82",
    "Aktif bertanya dan berdiskusi di kelas",
    "Kesulitan memahami materi matematika",
    "Prestasi konsisten di semua mata pelajaran",
    "Perlu bimbingan tambahan untuk beberapa mapel",
  ],
  character: [
    "Menunjukkan sikap jujur dan bertanggung jawab",
    "Membantu teman yang kesulitan",
    "Disiplin dalam mengerjakan tugas",
    "Perlu peningkatan dalam kejujuran",
    "Menghormati guru dan teman sebaya",
  ],
  socialEmotional: [
    "Mampu bersosialisasi dengan baik",
    "Aktif dalam kegiatan kelompok",
    "Cenderung pemalu, perlu didorong",
    "Mudah beradaptasi dengan lingkungan",
    "Perlu bimbingan dalam mengelola emosi",
  ],
  discipline: [
    "Tidak pernah terlambat masuk kelas",
    "Selalu memakai seragam lengkap",
    "Sering terlambat, perlu peringatan",
    "Tertib dalam mengikuti tata tertib",
    "Perlu peningkatan kedisiplinan",
  ],
  potentialInterest: [
    "Minat tinggi pada bidang olahraga",
    "Berbakat dalam seni musik",
    "Tertarik pada eksperimen sains",
    "Potensi kepemimpinan yang baik",
    "Kreatif dalam menyelesaikan masalah",
  ],
};

const JOURNAL_FOLLOW_UPS = {
  academic: [
    "Pertahankan motivasi belajar",
    "Remedial teaching 2x seminggu",
    "Bimbingan peer tutoring",
    "Konsultasi dengan guru mapel",
  ],
  character: [
    "Diberi kesempatan menjadi ketua kelas",
    "Pembinaan karakter intensif",
    "Program mentoring dengan kakak kelas",
    "Penguatan nilai-nilai moral",
  ],
  socialEmotional: [
    "Terapi kelompok dengan BK",
    "Program peer support",
    "Konseling individual",
    "Kegiatan ice breaking",
  ],
  discipline: [
    "Pemberian reward konsistensi",
    "Pembinaan kedisiplinan",
    "Monitoring harian",
    "Kontrak perilaku",
  ],
  potentialInterest: [
    "Direkomendasikan untuk mengikuti ekstrakurikuler basket",
    "Didaftarkan les musik",
    "Ikut serta dalam lomba sains",
    "Diberi tanggung jawab dalam OSIS",
  ],
};

const MEETING_TOPICS = [
  "Perkembangan Akademik",
  "Masalah Kedisiplinan",
  "Konseling Pribadi",
  "Bimbingan Karir",
  "Motivasi Belajar",
  "Persiapan Ujian",
  "Relasi Sosial",
  "Manajemen Waktu",
  "Target Pembelajaran",
  "Evaluasi Semester",
];

const INTERVENTIONS_DATA = [
  {
    title: "Peningkatan Prestasi Akademik",
    issue: "Nilai matematika turun drastis dari 80 menjadi 65",
    goal: "Meningkatkan nilai matematika minimal menjadi 75",
    actionSteps:
      "1. Remedial teaching 2x/minggu\n2. Bimbingan peer tutoring\n3. Konsultasi dengan guru mapel",
  },
  {
    title: "Pembinaan Karakter dan Kedisiplinan",
    issue: "Sering terlambat masuk kelas (5x dalam sebulan)",
    goal: "Meningkatkan kedisiplinan dan ketepatan waktu",
    actionSteps:
      "1. Pembinaan kedisiplinan\n2. Panggilan orang tua\n3. Kontrak perilaku\n4. Monitoring harian",
  },
  {
    title: "Dukungan Sosial-Emosional",
    issue: "Sering menyendiri dan kurang berinteraksi dengan teman",
    goal: "Meningkatkan keterampilan sosial dan kepercayaan diri",
    actionSteps:
      "1. Konseling individual 1x/minggu\n2. Kegiatan ice breaking kelompok\n3. Program peer support",
  },
  {
    title: "Pemantauan Kehadiran",
    issue: "Absen tanpa keterangan 3x dalam sebulan",
    goal: "Meningkatkan kehadiran menjadi 95%",
    actionSteps:
      "1. Koordinasi dengan orang tua\n2. Sistem buddy check\n3. Home visit\n4. Pemantauan intensif",
  },
  {
    title: "Penanganan Masalah Kesehatan",
    issue: "Sering mengeluh sakit kepala dan terlihat kelelahan",
    goal: "Memastikan kondisi kesehatan optimal untuk belajar",
    actionSteps:
      "1. Rujukan ke UKS\n2. Koordinasi dengan orang tua\n3. Pemeriksaan kesehatan\n4. Penyesuaian beban belajar",
  },
  {
    title: "Dukungan Situasi Keluarga",
    issue: "Orang tua bercerai, siswa mengalami tekanan emosional",
    goal: "Memberikan dukungan emosional dan stabilitas",
    actionSteps:
      "1. Home visit\n2. Konseling keluarga\n3. Koordinasi dengan wali murid\n4. Pendampingan berkelanjutan",
  },
  {
    title: "Pengembangan Minat dan Bakat",
    issue: "Siswa memiliki potensi tinggi tapi tidak aktif di ekstrakurikuler",
    goal: "Mengembangkan potensi melalui kegiatan ekstrakurikuler",
    actionSteps:
      "1. Motivasi bergabung ekstrakurikuler\n2. Identifikasi minat\n3. Koordinasi dengan pembina ekskul",
  },
  {
    title: "Remedial Pembelajaran",
    issue: "Kesulitan memahami materi IPA sejak awal semester",
    goal: "Memahami konsep dasar IPA dan meningkatkan nilai",
    actionSteps:
      "1. Bimbingan belajar khusus 3x/minggu\n2. Tugas tambahan terstruktur\n3. Evaluasi berkala",
  },
  {
    title: "Manajemen Emosi",
    issue: "Mudah marah dan konflik dengan teman sekelas",
    goal: "Meningkatkan kemampuan mengelola emosi",
    actionSteps:
      "1. Terapi kelompok dengan BK\n2. Latihan mindfulness\n3. Role playing situasi konflik",
  },
  {
    title: "Peningkatan Motivasi Belajar",
    issue: "Kehilangan motivasi belajar, tidak mengerjakan tugas",
    goal: "Membangun kembali motivasi dan tanggung jawab belajar",
    actionSteps:
      "1. Konseling motivasi\n2. Goal setting bersama\n3. Reward system\n4. Monitoring progres",
  },
];

const INTERVENTION_STATUSES = ["active", "completed", "cancelled"] as const;

// ==========================================
// SEED FUNCTIONS
// ==========================================

async function seedDevUser() {
  console.log("🔐 Seeding dev user...");

  const hashedPassword = await bcrypt.hash(DEV_USER.password, 10);
  const userId = nanoid();

  await db.insert(users).values({
    id: userId,
    email: DEV_USER.email,
    hashedPassword,
    fullName: DEV_USER.fullName,
    nipNuptk: DEV_USER.nipNuptk,
    createdAt: new Date().toISOString(),
  });

  console.log(`✅ Dev user created:`);
  console.log(`   Email: ${DEV_USER.email}`);
  console.log(`   Password: ${DEV_USER.password}`);
  console.log(`   User ID: ${userId}`);

  return userId;
}

async function seedStudents(userId: string) {
  console.log("\n👥 Seeding students...");

  const classes = ["7A", "7B", "7C"];
  const studentsPerClass = 10;
  const studentIds: string[] = [];

  for (let classIdx = 0; classIdx < classes.length; classIdx++) {
    const className = classes[classIdx];
    const startIdx = classIdx * studentsPerClass;
    const endIdx = startIdx + studentsPerClass;

    for (let i = startIdx; i < endIdx; i++) {
      const studentId = nanoid();
      const nisn = `00${1000 + i}${getRandomInt(10000, 99999)}`;

      await db.insert(students).values({
        id: studentId,
        userId,
        fullName: STUDENT_NAMES[i],
        nisn,
        classroom: className,
        gender: i % 2 === 0 ? "L" : "P",
        parentName: `Orang Tua ${STUDENT_NAMES[i]}`,
        parentContact: `08${getRandomInt(1000000000, 9999999999)}`,
        specialNotes: Math.random() > 0.7 ? "Perlu perhatian khusus" : null,
        createdAt: new Date().toISOString(),
      });

      studentIds.push(studentId);
    }

    console.log(`   ✓ Class ${className}: ${studentsPerClass} students`);
  }

  console.log(`✅ Total ${studentIds.length} students created`);
  return studentIds;
}

async function seedMonthlyJournals(_userId: string, studentIds: string[]) {
  console.log("\n📝 Seeding monthly journals...");

  const months = [
    "Juli 2024",
    "Agustus 2024",
    "September 2024",
    "Oktober 2024",
  ];
  let journalCount = 0;

  for (const studentId of studentIds) {
    // Random: 60% students have journals
    if (Math.random() < 0.6) {
      const numMonths = getRandomInt(1, months.length);

      for (let i = 0; i < numMonths; i++) {
        await db.insert(monthlyJournals).values({
          id: nanoid(),
          studentId,
          monitoringPeriod: months[i],
          academicDesc: getRandomItem(JOURNAL_DESCRIPTIONS.academic),
          academicFollowUp: getRandomItem(JOURNAL_FOLLOW_UPS.academic),
          academicNotes:
            Math.random() > 0.5 ? "Catatan tambahan akademik" : null,
          characterDesc: getRandomItem(JOURNAL_DESCRIPTIONS.character),
          characterFollowUp: getRandomItem(JOURNAL_FOLLOW_UPS.character),
          characterNotes: null,
          socialEmotionalDesc: getRandomItem(
            JOURNAL_DESCRIPTIONS.socialEmotional,
          ),
          socialEmotionalFollowUp: getRandomItem(
            JOURNAL_FOLLOW_UPS.socialEmotional,
          ),
          socialEmotionalNotes: null,
          disciplineDesc: getRandomItem(JOURNAL_DESCRIPTIONS.discipline),
          disciplineFollowUp: getRandomItem(JOURNAL_FOLLOW_UPS.discipline),
          disciplineNotes: null,
          potentialInterestDesc: getRandomItem(
            JOURNAL_DESCRIPTIONS.potentialInterest,
          ),
          potentialInterestFollowUp: getRandomItem(
            JOURNAL_FOLLOW_UPS.potentialInterest,
          ),
          potentialInterestNotes: null,
          createdAt: getRandomDate(
            new Date(2024, 6 + i, 1),
            new Date(2024, 6 + i, 28),
          ),
        });

        journalCount++;
      }
    }
  }

  console.log(`✅ ${journalCount} monthly journals created`);
}

async function seedMeetingLogs(_userId: string, studentIds: string[]) {
  console.log("\n💬 Seeding meeting logs...");

  let meetingCount = 0;
  const startDate = new Date(2024, 6, 1); // July 2024
  const endDate = new Date(2024, 9, 18); // October 2024

  for (const studentId of studentIds) {
    // Random: 70% students have meetings
    if (Math.random() < 0.7) {
      const numMeetings = getRandomInt(2, 5);

      for (let i = 0; i < numMeetings; i++) {
        const topic = getRandomItem(MEETING_TOPICS);
        const meetingDate = getRandomDate(startDate, endDate);

        await db.insert(meetingLogs).values({
          id: nanoid(),
          studentId,
          meetingDate,
          topic,
          followUp: `Tindak lanjut: ${topic.toLowerCase()}`,
          notes: `Pembahasan tentang ${topic.toLowerCase()}. Siswa aktif dan kooperatif dalam diskusi.`,
          createdAt: meetingDate,
        });

        meetingCount++;
      }
    }
  }

  console.log(`✅ ${meetingCount} meeting logs created`);
}

async function seedInterventions(_userId: string, studentIds: string[]) {
  console.log("\n🔔 Seeding interventions...");

  let interventionCount = 0;
  const startDate = new Date(2024, 6, 1);
  const endDate = new Date(2024, 9, 18);

  for (const studentId of studentIds) {
    // Random: 40% students have interventions
    if (Math.random() < 0.4) {
      const numInterventions = getRandomInt(1, 2);

      for (let i = 0; i < numInterventions; i++) {
        const intervention = getRandomItem(INTERVENTIONS_DATA);
        const status = getRandomItem(INTERVENTION_STATUSES);
        const startDateStr = getRandomDate(startDate, endDate);
        const endDateStr =
          status === "completed"
            ? getRandomDate(new Date(startDateStr), endDate)
            : null;

        await db.insert(interventions).values({
          id: nanoid(),
          studentId,
          title: intervention.title,
          issue: intervention.issue,
          goal: intervention.goal,
          actionSteps: intervention.actionSteps,
          status,
          startDate: startDateStr,
          endDate: endDateStr,
          notes:
            status === "completed"
              ? "Intervensi berhasil diselesaikan"
              : "Dalam proses pendampingan",
          createdAt: startDateStr,
          updatedAt: startDateStr,
        });

        interventionCount++;
      }
    }
  }

  console.log(`✅ ${interventionCount} interventions created`);
}

async function seedSchoolProfile(userId: string) {
  console.log("\n🏫 Seeding school profile...");

  await db.insert(schoolProfiles).values({
    id: nanoid(),
    userId,
    schoolName: "SMP Negeri 1 Jakarta Selatan",
    educationStage: "SMP",
    cityDistrict: "Jakarta Selatan",
    address: "Jl. Melawai Raya No. 14, Jakarta Selatan",
    schoolEmail: "smpn1jaksel@kemdikbud.go.id",
    createdAt: new Date().toISOString(),
  });

  console.log(`✅ School profile created`);
}

// ==========================================
// MAIN SEED FUNCTION
// ==========================================

async function main() {
  console.log("🌱 Starting development seed...\n");
  console.log("=".repeat(50));

  try {
    // 1. Create dev user
    const userId = await seedDevUser();

    // 2. Create students
    const studentIds = await seedStudents(userId);

    // 3. Create monthly journals
    await seedMonthlyJournals(userId, studentIds);

    // 4. Create meeting logs
    await seedMeetingLogs(userId, studentIds);

    // 5. Create interventions
    await seedInterventions(userId, studentIds);

    // 6. Create school profile
    await seedSchoolProfile(userId);

    console.log(`\n${"=".repeat(50)}`);
    console.log("✅ Development seed completed successfully!\n");

    console.log("📊 Summary:");
    console.log(`   • 1 dev user`);
    console.log(`   • ${studentIds.length} students (across 3 classes)`);
    console.log(`   • Monthly journals (~60% coverage)`);
    console.log(`   • Meeting logs (~70% coverage)`);
    console.log(`   • Interventions (~40% coverage)`);
    console.log(`   • 1 school profile\n`);

    console.log("🔑 Login Credentials:");
    console.log(`   Email: ${DEV_USER.email}`);
    console.log(`   Password: ${DEV_USER.password}\n`);

    console.log("🚀 Ready for testing!");
  } catch (error) {
    console.error("\n❌ Seed failed:", error);
    process.exit(1);
  } finally {
    client.close();
  }
}

// Run the seed
main();
