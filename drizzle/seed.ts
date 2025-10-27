// Seed data for local development
// Run with: bun run db:seed
// Last updated: 2025-10-19 - Added logo URLs, student photo defaults, and cover illustrations

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// Sample data for development
const sampleData = {
  user: {
    id: "user-001",
    email: "guru@example.com",
    hashedPassword: "$2a$10$hashedPasswordPlaceholder", // In real app, use bcrypt
    fullName: "Ibu Siti Rahayu",
    nipNuptk: "123456789012345678",
  },
  schoolProfile: {
    id: "school-001",
    userId: "user-001",
    schoolName: "SMP Negeri 1 Jakarta",
    educationStage: "SMP",
    cityDistrict: "Jakarta Selatan",
    address: "Jl. Pendidikan No. 123, Jakarta Selatan",
    schoolEmail: "info@smpn1jakarta.sch.id",
    logoDinasUrl: "https://april.tigasama.com/covers/user-001/logo-dinas.png",
    logoSekolahUrl:
      "https://april.tigasama.com/covers/user-001/logo-sekolah.png",
  },
  students: [
    {
      id: "student-001",
      userId: "user-001",
      fullName: "Ahmad Fauzi",
      nisn: "1234567890",
      classroom: "7A",
      gender: "L",
      parentContact: "081234567890",
      specialNotes: "Aktif dalam kegiatan olahraga",
      photoUrl: null,
    },
    {
      id: "student-002",
      userId: "user-001",
      fullName: "Dewi Kartika",
      nisn: "1234567891",
      classroom: "7A",
      gender: "P",
      parentContact: "081234567891",
      specialNotes: "Berprestasi dalam bidang seni",
      photoUrl: null,
    },
    {
      id: "student-003",
      userId: "user-001",
      fullName: "Budi Santoso",
      nisn: "1234567892",
      classroom: "7B",
      gender: "L",
      parentContact: "081234567892",
      specialNotes: null,
      photoUrl: null,
    },
  ],
  monthlyJournals: [
    {
      id: "journal-001",
      studentId: "student-001",
      monitoringPeriod: "Oktober 2025",
      academicDesc: "Nilai rata-rata meningkat dari 75 menjadi 82",
      academicFollowUp: "Pertahankan motivasi belajar",
      academicNotes: "Aktif bertanya di kelas",
      characterDesc: "Menunjukkan sikap jujur dan bertanggung jawab",
      characterFollowUp: "Diberi kesempatan menjadi ketua kelas",
      characterNotes: null,
      socialEmotionalDesc: "Mampu bersosialisasi dengan baik",
      socialEmotionalFollowUp: null,
      socialEmotionalNotes: null,
      disciplineDesc: "Tidak pernah terlambat masuk kelas",
      disciplineFollowUp: null,
      disciplineNotes: null,
      potentialInterestDesc: "Minat tinggi pada bidang olahraga",
      potentialInterestFollowUp:
        "Direkomendasikan untuk mengikuti ekstrakurikuler basket",
      potentialInterestNotes: null,
    },
  ],
  meetingLogs: [
    {
      id: "meeting-001",
      studentId: "student-001",
      meetingDate: "2025-10-10",
      topic: "Diskusi rencana karir dan minat belajar",
      followUp: "Orang tua akan mendampingi belajar di rumah",
      notes: "Pertemuan berlangsung positif",
    },
  ],
  reportCoverIllustrations: [
    {
      id: "cover-001",
      url: "https://april.tigasama.com/covers/user-001/cover-illustration-default.png",
      label: "Default Illustration",
    },
  ],
};

async function seed() {
  console.log("🌱 Starting database seeding...");

  // Connect to local D1 database
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("❌ DATABASE_URL not set. Cannot seed database.");
    console.log(
      "For local D1, you need to run migrations first with: bun run db:migrate",
    );
    return;
  }

  const client = createClient({ url });
  const db = drizzle(client, { schema });

  try {
    // Insert user
    console.log("Inserting user...");
    await db.insert(schema.users).values(sampleData.user);

    // Insert school profile
    console.log("Inserting school profile...");
    await db.insert(schema.schoolProfiles).values(sampleData.schoolProfile);

    // Insert students
    console.log("Inserting students...");
    await db.insert(schema.students).values(sampleData.students);

    // Insert monthly journals
    console.log("Inserting monthly journals...");
    await db.insert(schema.monthlyJournals).values(sampleData.monthlyJournals);

    // Insert meeting logs
    console.log("Inserting meeting logs...");
    await db.insert(schema.meetingLogs).values(sampleData.meetingLogs);

    // Insert report cover illustrations
    console.log("Inserting report cover illustrations...");
    await db
      .insert(schema.reportCoverIllustrations)
      .values(sampleData.reportCoverIllustrations);

    console.log("✅ Seed data inserted successfully!");
    console.log("\nSummary:");
    console.log(`- 1 user`);
    console.log(`- 1 school profile`);
    console.log(`- ${sampleData.students.length} students`);
    console.log(`- ${sampleData.monthlyJournals.length} monthly journals`);
    console.log(`- ${sampleData.meetingLogs.length} meeting logs`);
    console.log(
      `- ${sampleData.reportCoverIllustrations.length} report cover illustrations`,
    );
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
