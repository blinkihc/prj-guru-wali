// Edge-compatible PDF Generator using jsPDF
// Created: 2025-10-16
// Updated: 2025-10-17 - MODULAR REFACTOR with SOLID principles
// Legal paper (8.5" x 14"), proper margins, font standards
// Replaces @react-pdf/renderer for Cloudflare Pages compatibility

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface StudentData {
  id: string;
  name: string;
  nisn: string;
  class: string;
  gender: string;
}

interface JournalEntry {
  id: string;
  month: string;
  year: number;
  academicProgress: string;
  socialBehavior: string;
  emotionalState: string;
  physicalHealth: string;
  spiritualDevelopment: string;
}

interface MeetingLog {
  id: string;
  date: string;
  type: string;
  topic: string;
  notes: string;
}

interface Intervention {
  id: string;
  date: string;
  issue: string;
  action: string;
  result: string;
}

// Lampiran B: Per-student journal entry
interface StudentJournalEntry {
  studentName: string;
  classroom: string;
  periode: string;
  guruWali: string;
  academicDesc: string;
  academicAction: string;
  characterDesc: string;
  characterAction: string;
  socialEmotionalDesc: string;
  socialEmotionalAction: string;
  disciplineDesc: string;
  disciplineAction: string;
  potentialInterestDesc: string;
  potentialInterestAction: string;
}

// Lampiran D: Meeting summary entry
interface MeetingSummaryEntry {
  bulan: string;
  jumlah: number;
  format: string;
  persentase: string;
}

// ==========================================
// CONSTANTS - Paper & Typography Standards
// ==========================================
const PAPER = {
  LEGAL: { width: 612, height: 1008 } // 8.5" x 14" in points
};

const MARGINS = {
  left: 4 * 28.35,   // 4 cm
  right: 3 * 28.35,  // 3 cm  
  top: 4 * 28.35,    // 4 cm
  bottom: 3 * 28.35  // 3 cm
};

const FONTS = {
  cover: 14,       // Cover/Judul utama
  heading: 14,     // Heading bab
  subheading: 12,  // Heading subbab
  body: 12,        // Body text
  table: 10        // Table content
};

const COLORS = {
  tableHeader: [198, 224, 180] as [number, number, number], // #C6E0B4
  black: [0, 0, 0] as [number, number, number]
};

const LINE_SPACING = 1.5;

// Calculate usable width
const USABLE_WIDTH = PAPER.LEGAL.width - MARGINS.left - MARGINS.right;

/**
 * Generate Student Report PDF
 */
export function generateStudentReportPDF(
  student: StudentData,
  journals: JournalEntry[],
  meetings: MeetingLog[],
  interventions: Intervention[],
  teacherName: string,
  schoolName: string
): Uint8Array {
  const doc = new jsPDF();
  
  // Set font
  doc.setFont("helvetica");
  
  let yPos = 20;
  
  // === HEADER ===
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("LAPORAN GURU WALI", 105, yPos, { align: "center" });
  yPos += 10;
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(schoolName, 105, yPos, { align: "center" });
  yPos += 15;
  
  // === STUDENT INFO ===
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("DATA SISWA", 20, yPos);
  yPos += 7;
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Nama: ${student.name}`, 20, yPos);
  yPos += 6;
  doc.text(`NISN: ${student.nisn}`, 20, yPos);
  yPos += 6;
  doc.text(`Kelas: ${student.class}`, 20, yPos);
  yPos += 6;
  doc.text(`Jenis Kelamin: ${student.gender}`, 20, yPos);
  yPos += 12;
  
  // === LAMPIRAN B: 5 ASPECTS TABLE (Official Format) ===
  if (journals.length > 0) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("CATATAN PERKEMBANGAN (5 ASPEK PEMANTAUAN)", 20, yPos);
    yPos += 5;
    
    // Use official Lampiran B structure: 4 columns
    // 20% Aspek | 35% Deskripsi | 30% Tindak Lanjut | 15% Keterangan
    const pageWidth = 175; // Available width
    
    autoTable(doc, {
      startY: yPos,
      head: [[
        "Aspek Pemantauan",
        "Deskripsi Perkembangan",
        "Tindak Lanjut yang Dilakukan",
        "Keterangan Tambahan"
      ]],
      body: [
        [
          "Akademik",
          journals[0]?.academicProgress || "-",
          "Konseling dan kunjungan orang tua",
          ""
        ],
        [
          "Karakter",
          journals[0]?.socialBehavior || "-",
          "Menerapkan disiplin positif yang berfokus pada membangun karakter",
          ""
        ],
        [
          "Sosial-Emosional",
          journals[0]?.emotionalState || "-",
          "Membiasakan ucapan seperti 'tolong, permisi dan terima kasih'",
          ""
        ],
        [
          "Kedisiplinan",
          journals[0]?.physicalHealth || "-",
          "Mengucapkan salam, mendengarkan seksama, berprilaku tertib",
          ""
        ],
        [
          "Potensi & Minat",
          journals[0]?.spiritualDevelopment || "-",
          "Pembelajaran interaktif dan menciptakan lingkungan positif",
          ""
        ]
      ],
      theme: "grid",
      headStyles: { 
        fillColor: [198, 224, 180], // #C6E0B4 (official color)
        textColor: [0, 0, 0],
        fontSize: 9,
        fontStyle: "bold"
      },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: pageWidth * 0.20 }, // 20%
        1: { cellWidth: pageWidth * 0.35 }, // 35%
        2: { cellWidth: pageWidth * 0.30 }, // 30%
        3: { cellWidth: pageWidth * 0.15 }  // 15%
      },
      margin: { left: 20, right: 20 }
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // === MEETINGS TABLE ===
  if (meetings.length > 0) {
    // Check if need new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("LOG PERTEMUAN", 20, yPos);
    yPos += 5;
    
    autoTable(doc, {
      startY: yPos,
      head: [["Tanggal", "Tipe", "Topik", "Catatan"]],
      body: meetings.map(m => [
        m.date,
        m.type,
        m.topic,
        m.notes.substring(0, 50) + "..."
      ]),
      theme: "grid",
      headStyles: { fillColor: [52, 152, 219], fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 30 },
        2: { cellWidth: 50 },
        3: { cellWidth: 65 }
      }
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // === INTERVENTIONS TABLE ===
  if (interventions.length > 0) {
    // Check if need new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("INTERVENSI", 20, yPos);
    yPos += 5;
    
    autoTable(doc, {
      startY: yPos,
      head: [["Tanggal", "Masalah", "Tindakan", "Hasil"]],
      body: interventions.map(i => [
        i.date,
        i.issue.substring(0, 40) + "...",
        i.action.substring(0, 40) + "...",
        i.result.substring(0, 40) + "..."
      ]),
      theme: "grid",
      headStyles: { fillColor: [231, 76, 60], fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 50 },
        2: { cellWidth: 50 },
        3: { cellWidth: 45 }
      }
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
  }
  
  // === FOOTER ===
  // Check if need new page for footer
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const today = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  doc.text(`Dibuat pada: ${today}`, 20, yPos);
  yPos += 15;
  
  doc.text(`Guru Wali,`, 140, yPos);
  yPos += 20;
  doc.text(teacherName, 140, yPos);
  
  // Return as Uint8Array
  const pdfOutput = doc.output("arraybuffer");
  return new Uint8Array(pdfOutput);
}

/**
 * Generate Semester Report PDF with Full Lampirans
 * MODULAR APPROACH with SOLID principles
 * Legal paper, proper margins, professional layout
 */
export function generateSemesterReportPDF(
  students: StudentData[],
  teacherName: string,
  schoolName: string,
  semester: string,
  academicYear: string,
  studentJournals?: StudentJournalEntry[],
  meetingSummary?: MeetingSummaryEntry[]
): Uint8Array {
  // Initialize with Legal paper size
  const doc = new jsPDF({
    unit: 'pt',
    format: [PAPER.LEGAL.width, PAPER.LEGAL.height]
  });
  doc.setFont("times");
  
  // STRUCTURE (CORRECT ORDER):
  // 1. Cover Page
  addSemesterCoverPage(doc, semester, academicYear, teacherName, schoolName, students.length);
  
  // 2. SOP Pages (after cover!)
  addSOPPages(doc, schoolName, academicYear);
  
  // 3-7. Lampirans and signature (keeping minimal for now, will enhance)
  // TODO: Proper Lampiran A, B, C, D with correct formatting and margins
  
  // Return as Uint8Array
  const pdfOutput = doc.output("arraybuffer");
  return new Uint8Array(pdfOutput);
}

/**
 * Add SOP Pages (3 pages) - EXACT content from sop-pages.tsx template
 * Based on Permendikdasmen No. 11 Tahun 2025
 */
function addSOPPages(doc: jsPDF, schoolName: string, tahunAjaran: string) {
  // ==========================================
  // PAGE 1: SOP GURU WALI - Dasar Hukum & Ruang Lingkup
  // ==========================================
  doc.addPage();
  let yPos = 30;
  
  doc.setFontSize(14);
  doc.setFont("times", "bold");
  doc.text("STANDAR OPERASIONAL PROSEDUR (SOP)", 105, yPos, { align: "center" });
  yPos += 7;
  doc.text("GURU WALI", 105, yPos, { align: "center" });
  yPos += 10;
  
  doc.setFontSize(12);
  doc.setFont("times", "normal");
  doc.text(`Satuan Pendidikan: ${schoolName}`, 20, yPos);
  yPos += 6;
  doc.text(`Tahun Ajaran: ${tahunAjaran}`, 20, yPos);
  yPos += 12;
  
  // I. Dasar Hukum
  doc.setFont("times", "bold");
  doc.text("I. Dasar Hukum", 20, yPos);
  yPos += 6;
  doc.setFont("times", "normal");
  doc.text("1. Permendikdasmen No. 11 Tahun 2025 tentang Pemenuhan Beban Kerja", 25, yPos);
  yPos += 5;
  doc.text("   Guru", 25, yPos);
  yPos += 6;
  doc.text("2. Pasal 9 ayat (1-5): Kewajiban dan ruang lingkup tugas Guru Wali", 25, yPos);
  yPos += 6;
  doc.text("3. Pasal 14: Ekuivalensi tugas Guru Wali setara 2 JP per minggu", 25, yPos);
  yPos += 6;
  doc.text("4. Pasal 17 dan 18: Penetapan, pelaksanaan, dan penghitungan beban", 25, yPos);
  yPos += 5;
  doc.text("   kerja", 25, yPos);
  yPos += 10;
  
  // II. Pengertian
  doc.setFont("times", "bold");
  doc.text("II. Pengertian", 20, yPos);
  yPos += 6;
  doc.setFont("times", "bold");
  const pengertiText1 = "Guru Wali";
  doc.text(pengertiText1, 20, yPos);
  const w1 = doc.getTextWidth(pengertiText1);
  doc.setFont("times", "normal");
  doc.text(" adalah guru mata pelajaran yang diberi tugas mendampingi", 20 + w1, yPos);
  yPos += 6;
  doc.text("perkembangan akademik, karakter, keterampilan, dan kompetensi murid dari saat", 20, yPos);
  yPos += 6;
  doc.text("masuk hingga lulus pada satuan pendidikan yang sama.", 20, yPos);
  yPos += 10;
  
  // III. Tujuan
  doc.setFont("times", "bold");
  doc.text("III. Tujuan", 20, yPos);
  yPos += 6;
  doc.setFont("times", "normal");
  doc.text("Adapun tujuan guru wali yaitu :", 20, yPos);
  yPos += 6;
  doc.text("\u2022 Menjamin pelaksanaan pendampingan murid secara menyeluruh dan", 25, yPos);
  yPos += 5;
  doc.text("  berkesinambungan.", 25, yPos);
  yPos += 6;
  doc.text("\u2022 Meningkatkan keterlibatan guru dalam pendidikan karakter dan", 25, yPos);
  yPos += 5;
  doc.text("  pengembangan potensi murid.", 25, yPos);
  yPos += 6;
  doc.text("\u2022 Memberikan dukungan sistematis terhadap pertumbuhan akademik dan", 25, yPos);
  yPos += 5;
  doc.text("  non-akademik peserta didik.", 25, yPos);
  yPos += 10;
  
  // IV. Ruang Lingkup Tugas
  doc.setFont("times", "bold");
  doc.text("IV. Ruang Lingkup Tugas", 20, yPos);
  yPos += 6;
  doc.setFont("times", "normal");
  doc.text("Berdasarkan Pasal 9 ayat (2), Guru Wali melaksanakan tugas sebagai berikut:", 20, yPos);
  yPos += 8;
  
  doc.setFont("times", "bold");
  doc.text("1. Pendampingan Akademik", 25, yPos);
  yPos += 6;
  doc.setFont("times", "normal");
  doc.text("Membantu murid dalam perencanaan dan refleksi belajar.", 20, yPos);
  yPos += 8;
  
  doc.setFont("times", "bold");
  doc.text("2. Pengembangan Kompetensi dan Keterampilan", 25, yPos);
  yPos += 6;
  doc.setFont("times", "normal");
  doc.text("Mendorong minat bakat serta pengembangan soft skills.", 20, yPos);
  yPos += 8;
  
  doc.setFont("times", "bold");
  doc.text("3. Pembinaan Karakter", 25, yPos);
  yPos += 6;
  doc.setFont("times", "normal");
  doc.text("Menanamkan nilai kedisiplinan, kejujuran, tanggung jawab, dan empati.", 20, yPos);
  yPos += 8;
  
  doc.setFont("times", "bold");
  doc.text("4. Pendampingan Berkelanjutan", 25, yPos);
  yPos += 6;
  doc.setFont("times", "normal");
  doc.text("Menjadi pendamping murid dari awal hingga akhir masa belajar.", 20, yPos);
  yPos += 10;
  
  // V. Prosedur Pelaksanaan
  doc.setFont("times", "bold");
  doc.text("V. Prosedur Pelaksanaan", 20, yPos);
  yPos += 8;
  
  doc.text("1. Penunjukan Guru Wali", 20, yPos);
  yPos += 6;
  doc.setFont("times", "normal");
  doc.text("\u2022 Dilakukan oleh Kepala Sekolah (Pasal 18 ayat 1).", 25, yPos);
  yPos += 6;
  doc.text("\u2022 Berdasarkan rasio jumlah murid dengan jumlah guru mata pelajaran", 25, yPos);
  yPos += 5;
  doc.text("  (Pasal 18 ayat 2).", 25, yPos);
  
  // ==========================================
  // PAGE 2: Prosedur Pelaksanaan (Table)
  // ==========================================
  doc.addPage();
  yPos = 30;
  
  doc.setFont("times", "bold");
  doc.text("2. Pelaksanaan Tugas", 20, yPos);
  yPos += 8;
  
  // Table for Kegiatan
  autoTable(doc, {
    startY: yPos,
    head: [["No", "Kegiatan", "Penjelasan", "Waktu Pelaksanaan"]],
    body: [
      ["1", "Identifikasi murid dampingan", "Memahami latar belakang, potensi, dan tantangan murid", "Awal tahun ajaran"],
      ["2", "Penyusunan dan pelaksanaan rencana pendampingan", "Disesuaikan dengan kebutuhan murid", "Per semester"],
      ["3", "Pertemuan berkala dengan murid", "Secara individual atau kelompok kecil", "4x seminggu"],
      ["4", "Kolaborasi dengan guru BK & wali kelas", "Untuk tindak lanjut masalah tertentu", "Sesuai kebutuhan"],
      ["5", "Pelaporan perkembangan murid", "Secara berkala (bulanan/semester)", "Setiap akhir bulan atau semester"],
      ["6", "Dokumentasi dan refleksi", "Catatan kemajuan, hambatan, dan rekomendasi", "Berkelanjutan"]
    ],
    theme: "grid",
    headStyles: { 
      fillColor: [198, 224, 180],
      textColor: [0, 0, 0],
      fontSize: 10,
      fontStyle: "bold",
      font: "times"
    },
    bodyStyles: { fontSize: 9, font: "times" },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 55 },
      2: { cellWidth: 60 },
      3: { cellWidth: 50 }
    },
    margin: { left: 15, right: 15 }
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  // VI. Evaluasi dan Pelaporan
  doc.setFont("times", "bold");
  doc.text("VI. Evaluasi dan Pelaporan", 20, yPos);
  yPos += 6;
  doc.setFont("times", "normal");
  doc.text("\u2022 Guru Wali menyusun laporan singkat setiap semester berisi:", 25, yPos);
  yPos += 6;
  doc.text("o Rekap pertemuan dan kegiatan", 35, yPos);
  yPos += 6;
  doc.text("o Catatan perkembangan murid", 35, yPos);
  yPos += 6;
  doc.text("o Rekomendasi tindak lanjut", 35, yPos);
  yPos += 6;
  doc.text("\u2022 Laporan dikumpulkan ke Wakil Kepala Sekolah bidang Kesiswaan atau", 25, yPos);
  yPos += 5;
  doc.text("  Kurikulum.", 25, yPos);
  yPos += 10;
  
  // VII. Ekuivalensi Beban Kerja
  doc.setFont("times", "bold");
  doc.text("VII. Ekuivalensi Beban Kerja", 20, yPos);
  yPos += 6;
  doc.setFont("times", "normal");
  const ekvText1 = "\u2022 Tugas Guru Wali ";
  doc.text(ekvText1, 25, yPos);
  const w2 = doc.getTextWidth(ekvText1);
  doc.setFont("times", "bold");
  const ekvText2 = "setara dengan 2 jam Tatap Muka per minggu";
  doc.text(ekvText2, 25 + w2, yPos);
  yPos += 5;
  doc.setFont("times", "normal");
  doc.text("  (Pasal 14 dan Lampiran Permendikdasmen No. 11 Tahun 2025)", 25, yPos);
  yPos += 10;
  
  // VIII. Penutup
  doc.setFont("times", "bold");
  doc.text("VIII. Penutup", 20, yPos);
  yPos += 6;
  doc.setFont("times", "normal");
  doc.text("SOP ini menjadi acuan pelaksanaan tugas Guru Wali untuk memastikan", 20, yPos);
  yPos += 6;
  doc.text("pendampingan murid berjalan sistematis, profesional, dan berdampak pada", 20, yPos);
  yPos += 6;
  doc.text("perkembangan peserta didik secara utuh.", 20, yPos);
}

// ==========================================
// MODULAR HELPER FUNCTIONS - SEMESTER REPORT
// ==========================================

/**
 * Helper: Check if we need a new page
 */
function checkPageBreak(doc: jsPDF, currentY: number, requiredSpace: number): number {
  const maxY = PAPER.LEGAL.height - MARGINS.bottom;
  if (currentY + requiredSpace > maxY) {
    doc.addPage();
    return MARGINS.top;
  }
  return currentY;
}

/**
 * Helper: Add text with proper line spacing
 */
function addBodyText(doc: jsPDF, text: string, x: number, y: number, maxWidth?: number): number {
  doc.setFontSize(FONTS.body);
  doc.setFont("times", "normal");
  
  if (maxWidth) {
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + (lines.length * FONTS.body * LINE_SPACING * 0.35); // Convert to points
  } else {
    doc.text(text, x, y);
    return y + (FONTS.body * LINE_SPACING * 0.35);
  }
}

/**
 * MODULAR SECTION 1: Add Cover Page
 */
function addSemesterCoverPage(
  doc: jsPDF,
  semester: string,
  academicYear: string,
  teacherName: string,
  schoolName: string,
  totalStudents: number
): void {
  let yPos = PAPER.LEGAL.height / 2 - 60; // Center vertically
  const centerX = PAPER.LEGAL.width / 2;
  
  // Title - 14pt bold, KAPITAL
  doc.setFontSize(FONTS.cover);
  doc.setFont("times", "bold");
  doc.text("LAPORAN PEMANTAUAN GURU WALI", centerX, yPos, { align: "center" });
  yPos += FONTS.cover * 1.5;
  
  doc.text(`SEMESTER ${semester.toUpperCase()}`, centerX, yPos, { align: "center" });
  yPos += FONTS.cover * 1.2;
  doc.text(`TAHUN AJARAN ${academicYear}`, centerX, yPos, { align: "center" });
  yPos += FONTS.body * 3;
  
  // Body info - 12pt normal
  doc.setFontSize(FONTS.body);
  doc.setFont("times", "normal");
  doc.text(schoolName, centerX, yPos, { align: "center" });
  yPos += FONTS.body * LINE_SPACING;
  doc.text(`Guru Wali: ${teacherName}`, centerX, yPos, { align: "center" });
  yPos += FONTS.body * LINE_SPACING;
  doc.text(`Total Siswa Dampingan: ${totalStudents} siswa`, centerX, yPos, { align: "center" });
  yPos += FONTS.body * 3;
  
  const today = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  doc.text(`Dibuat pada: ${today}`, centerX, yPos, { align: "center" });
}
