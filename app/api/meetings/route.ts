// API Route: /api/meetings
// Handle MeetingLog CRUD operations
// Created: 2025-01-14

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export const runtime = "edge";

// Mock data storage (replace with actual D1 database later)
const mockMeetings: Array<{
  id: string;
  studentId: string;
  meetingDate: string;
  topic: string;
  followUp: string | null;
  notes: string | null;
  createdAt: string;
}> = [
  // Ahmad Rizki Pratama (Student 1)
  {
    id: "meeting-1",
    studentId: "1",
    meetingDate: "2025-01-10",
    topic: "Konsultasi Peningkatan Prestasi Akademik dan Persiapan Olimpiade",
    followUp:
      "Bapak Rizki berkomitmen memberikan bimbingan belajar tambahan di rumah, khususnya untuk persiapan olimpiade matematika dan robotika. Akan mengikuti try out olimpiade setiap minggu. Evaluasi progress setiap 2 minggu dengan guru wali.",
    notes:
      "Bapak Rizki sangat kooperatif dan sangat peduli terhadap perkembangan anaknya. Sudah mendaftarkan Ahmad ke bimbel khusus olimpiade. Berkomitmen mendampingi belajar minimal 1,5 jam per hari. Menyediakan fasilitas laptop dan kit robotika di rumah.",
    createdAt: new Date("2025-01-10T10:00:00").toISOString(),
  },
  {
    id: "meeting-2",
    studentId: "1",
    meetingDate: "2024-12-20",
    topic: "Diskusi Kegiatan Ekstrakulikuler dan Manajemen Waktu",
    followUp:
      "Ahmad akan fokus pada 2 ekskul: Basket (3x seminggu) dan Robotika (2x seminggu). Orang tua akan memfasilitasi transportasi dan peralatan. Dibuat jadwal belajar yang terstruktur agar tidak bentrok dengan latihan.",
    notes:
      "Pertemuan berjalan sangat positif. Bapak dan Ibu Rizki hadir bersama. Mereka sangat mendukung minat dan bakat Ahmad di bidang olahraga dan teknologi. Sepakat untuk monitor progress akademik agar tetap balance dengan kegiatan ekstrakurikuler.",
    createdAt: new Date("2024-12-20T14:30:00").toISOString(),
  },

  // Siti Nurhaliza (Student 2)
  {
    id: "meeting-3",
    studentId: "2",
    meetingDate: "2025-01-08",
    topic: "Pembahasan Prestasi Akademik dan Persiapan Kompetisi Seni",
    followUp:
      "Ibu Siti akan terus mendukung kegiatan seni tari Siti. Didaftarkan untuk mengikuti kompetisi tari tingkat provinsi bulan depan. Akan koordinasi dengan pembina tari untuk jadwal latihan intensif. Prestasi akademik tetap dijaga dengan jadwal belajar yang teratur.",
    notes:
      "Ibu Siti Aminah sangat bangga dengan prestasi anaknya. Apresiasi tinggi untuk dedikasi Siti dalam seni tari dan akademik. Keluarga sangat supportive. Tidak ada kendala finansial untuk mendukung kegiatan Siti.",
    createdAt: new Date("2025-01-08T13:00:00").toISOString(),
  },

  // Budi Santoso (Student 3)
  {
    id: "meeting-4",
    studentId: "3",
    meetingDate: "2025-01-12",
    topic: "Konsultasi Penurunan Nilai Matematika dan Rencana Intervensi",
    followUp:
      "Ibu Wati berkomitmen mendampingi Budi belajar matematika setiap malam minimal 1 jam. Sudah mendaftarkan Budi ke les matematika 2x seminggu. Akan monitoring PR dan tugas sekolah lebih ketat. Follow up meeting 2 minggu lagi untuk evaluasi progress.",
    notes:
      "Ibu Wati sangat concern dengan penurunan nilai Budi. Mengakui kurang monitoring selama ini karena kesibukan kerja. Berjanji akan lebih perhatian. Budi juga hadir dan menunjukkan kemauan kuat untuk perbaikan. Sudah dibuat rencana intervensi bersama.",
    createdAt: new Date("2025-01-12T15:00:00").toISOString(),
  },
  {
    id: "meeting-5",
    studentId: "3",
    meetingDate: "2024-11-25",
    topic: "Monitoring Perkembangan Akademik Rutin",
    followUp:
      "Pertahankan prestasi yang ada. Tingkatkan fokus di matematika dengan latihan soal rutin. Orang tua akan membantu memfasilitasi lingkungan belajar yang kondusif di rumah.",
    notes:
      "Pertemuan rutin semester. Saat itu nilai Budi masih stabil. Ibu Wati menunjukkan perhatian dan komitmen. Budi terlihat nyaman dan kooperatif.",
    createdAt: new Date("2024-11-25T14:00:00").toISOString(),
  },

  // Dewi Lestari (Student 4)
  {
    id: "meeting-6",
    studentId: "4",
    meetingDate: "2025-01-05",
    topic: "Konsultasi Persiapan Olimpiade Sains dan Manajemen Stres",
    followUp:
      "Bapak Lesmana akan memfasilitasi tutor privat untuk persiapan olimpiade sains. Namun juga akan monitoring agar Dewi tidak overstressed. Dibuat jadwal yang balance antara belajar, istirahat, dan refreshing. Akan rutin komunikasi dengan guru untuk monitor kondisi mental Dewi.",
    notes:
      "Bapak Lesmana sangat concern dengan prestasi Dewi tapi juga khawatir dengan tekanan yang Dewi berikan pada diri sendiri. Setuju dengan saran guru untuk mengajarkan work-life balance. Akan lebih perhatian pada aspek mental health anak, bukan hanya akademik.",
    createdAt: new Date("2025-01-05T10:30:00").toISOString(),
  },

  // Andi Wijaya (Student 5)
  {
    id: "meeting-7",
    studentId: "5",
    meetingDate: "2025-01-07",
    topic: "Koordinasi Jadwal Latihan Renang dengan Akademik",
    followUp:
      "Bapak Wijaya akan koordinasi dengan pelatih renang untuk menyesuaikan jadwal latihan agar tidak terlalu mengganggu akademik. Andi akan diberikan tugas pengganti dan materi catch-up untuk setiap pelajaran yang terlewat saat kompetisi. Akan ada tutor yang membantu Andi belajar di sela-sela waktu luang.",
    notes:
      "Bapak Wijaya sangat mendukung karir Andi sebagai atlet tapi juga sadar pentingnya pendidikan. Terbuka dengan saran sekolah. Kompetisi renang memang padat jadwalnya, tapi akan dicari solusi terbaik. Andi juga berkomitmen untuk tetap mengikuti pelajaran sebisa mungkin.",
    createdAt: new Date("2025-01-07T16:00:00").toISOString(),
  },
];

/**
 * POST /api/meetings
 * Create new meeting log
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.studentId) {
      return NextResponse.json(
        { error: "studentId is required" },
        { status: 400 },
      );
    }

    if (!body.meetingDate) {
      return NextResponse.json(
        { error: "meetingDate is required" },
        { status: 400 },
      );
    }

    if (!body.topic) {
      return NextResponse.json({ error: "topic is required" }, { status: 400 });
    }

    // Create meeting log
    const meeting = {
      id: `meeting-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      studentId: body.studentId,
      meetingDate: body.meetingDate,
      topic: body.topic,
      followUp: body.followUp || null,
      notes: body.notes || null,
      createdAt: new Date().toISOString(),
    };

    // Add to mock storage
    mockMeetings.push(meeting);

    return NextResponse.json(
      {
        message: "Meeting log created successfully",
        meeting,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/meetings error:", error);
    return NextResponse.json(
      { error: "Failed to create meeting log" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/meetings
 * Get all meeting logs or filter by studentId
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    let meetings = mockMeetings;

    // Filter by studentId if provided
    if (studentId) {
      meetings = meetings.filter((m) => m.studentId === studentId);
    }

    // Sort by meetingDate desc, then createdAt desc
    meetings.sort((a, b) => {
      const dateCompare =
        new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime();
      if (dateCompare !== 0) return dateCompare;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({ meetings });
  } catch (error) {
    console.error("GET /api/meetings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch meetings" },
      { status: 500 },
    );
  }
}
