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
export interface StudentJournalEntry {
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

// Lampiran C: Individual meeting record entry
export interface MeetingRecordEntry {
  tanggal: string;           // Date of meeting
  namaMurid: string;         // Student name
  topikMasalah: string;      // Topic/issue discussed
  tindakLanjut: string;      // Follow-up action
  keterangan: string;        // Notes/remarks
}

// Lampiran D: Meeting summary entry (monthly aggregation)
export interface MeetingSummaryEntry {
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
  left: 2 * 28.35,   // 4 cm
  right: 1.5 * 28.35,  // 3 cm  
  top: 2 * 28.35,    // 4 cm
  bottom: 1.5 * 28.35  // 3 cm
};

const FONTS = {
  cover: 20,       // Cover/Judul utama
  heading: 16,     // Heading bab
  subheading: 14,  // Heading subbab
  body: 12,        // Body text
  table: 12        // Table content
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
  meetingRecords?: MeetingRecordEntry[],      // Lampiran C: Individual meetings
  meetingSummary?: MeetingSummaryEntry[]      // Lampiran D: Monthly summary
): Uint8Array {
  // Initialize with Legal paper size
  const doc = new jsPDF({
    unit: 'pt',
    format: [PAPER.LEGAL.width, PAPER.LEGAL.height]
  });
  doc.setFont("times");
  
  // ==========================================
  // STRUCTURE (CORRECT ORDER) - MODULAR & CLEAN
  // ==========================================
  
  // 1. Cover Page
  addSemesterCoverPage(doc, semester, academicYear, teacherName, schoolName, students.length);
  
  // 2. SOP Pages (Permendikdasmen No. 11 Tahun 2025)
  addSOPPages(doc, schoolName, academicYear);
  
  // 3. Lampiran A - Student List
  addLampiranA(doc, students);
  
  // 4. Lampiran B - Per-Student Journals (5 aspects)
  if (studentJournals && studentJournals.length > 0) {
    addLampiranB(doc, studentJournals);
  }
  
  // 5. Lampiran C - Individual Meeting Records
  if (meetingRecords && meetingRecords.length > 0) {
    addLampiranC(doc, meetingRecords);
  }
  
  // 6. Lampiran D - Pelaporan Semester (with signature at the end)
  addLampiranD(doc, teacherName, students, semester, academicYear, meetingSummary);
  
  // Return as Uint8Array
  const pdfOutput = doc.output("arraybuffer");
  return new Uint8Array(pdfOutput);
}

/**
 * HELPER: Add decorative geometric corners to page
 * Upper left and bottom right corners with simple shapes
 */
function addDecorativeCorners(doc: jsPDF): void {
  const cornerSize = 40;
  const color = COLORS.tableHeader; // Use same green as tables [198, 224, 180]
  
  // Upper left corner - L-shape
  doc.setFillColor(color[0], color[1], color[2]);
  doc.setDrawColor(color[0] - 20, color[1] - 20, color[2] - 20);
  
  // Horizontal bar (top)
  doc.roundedRect(0, 0, cornerSize * 2, 8, 2, 2, 'FD');
  // Vertical bar (left)
  doc.roundedRect(0, 0, 8, cornerSize * 2, 2, 2, 'FD');
  
  // Bottom right corner - L-shape
  const pageWidth = PAPER.LEGAL.width;
  const pageHeight = PAPER.LEGAL.height;
  
  // Horizontal bar (bottom)
  doc.roundedRect(pageWidth - cornerSize * 2, pageHeight - 8, cornerSize * 2, 8, 2, 2, 'FD');
  // Vertical bar (right)
  doc.roundedRect(pageWidth - 8, pageHeight - cornerSize * 2, 8, cornerSize * 2, 2, 2, 'FD');
}

/**
 * Add SOP Pages (3 pages) - EXACT content from sop-pages.tsx template
 * Based on Permendikdasmen No. 11 Tahun 2025
 * 
 * TODO: Full refactor needed - replace ALL hardcoded positions (20, 25, etc)
 * with leftMargin and indent variables throughout (~600 lines)
 * Current fix: Top margin and header positioning corrected
 */
function addSOPPages(doc: jsPDF, schoolName: string, tahunAjaran: string) {
  // ==========================================
  // PAGE 1: SOP GURU WALI - Dasar Hukum & Ruang Lingkup
  // ==========================================
  doc.addPage();
  addDecorativeCorners(doc); // Add decorative corners
  
  let yPos = MARGINS.top;
  const centerX = PAPER.LEGAL.width / 2;
  const leftMargin = MARGINS.left;
  const indent = leftMargin + 15;
  
  doc.setFontSize(FONTS.heading);
  doc.setFont("times", "bold");
  doc.text("STANDAR OPERASIONAL PROSEDUR (SOP)", centerX, yPos, { align: "center" });
  yPos += FONTS.heading * 1.2;
  doc.text("GURU WALI", centerX, yPos, { align: "center" });
  yPos += FONTS.body * 2;
  
  doc.setFontSize(FONTS.body);
  doc.setFont("times", "normal");
  doc.text(`Satuan Pendidikan: ${schoolName}`, leftMargin, yPos);
  yPos += FONTS.body * LINE_SPACING;
  doc.text(`Tahun Ajaran: ${tahunAjaran}`, leftMargin, yPos);
  yPos += FONTS.body * 2;
  
  // I. Dasar Hukum
  doc.setFont("times", "bold");
  doc.text("I. Dasar Hukum", leftMargin, yPos);
  yPos += 6;
  doc.setFont("times", "normal");
  doc.text("1. Permendikdasmen No. 11 Tahun 2025 tentang Pemenuhan Beban Kerja", indent, yPos);
  yPos += 5;
  doc.text("   Guru", indent, yPos);
  yPos += 6;
  doc.text("2. Pasal 9 ayat (1-5): Kewajiban dan ruang lingkup tugas Guru Wali", indent, yPos);
  yPos += 6;
  doc.text("3. Pasal 14: Ekuivalensi tugas Guru Wali setara 2 JP per minggu", indent, yPos);
  yPos += 6;
  doc.text("4. Pasal 17 dan 18: Penetapan, pelaksanaan, dan penghitungan beban", indent, yPos);
  yPos += 5;
  doc.text("   kerja", indent, yPos);
  yPos += 10;
  
  // II. Pengertian
  doc.setFont("times", "bold");
  doc.text("II. Pengertian", leftMargin, yPos);
  yPos += 6;
  doc.setFont("times", "bold");
  const pengertiText1 = "Guru Wali";
  doc.text(pengertiText1, leftMargin, yPos);
  const w1 = doc.getTextWidth(pengertiText1);
  doc.setFont("times", "normal");
  doc.text(" adalah guru mata pelajaran yang diberi tugas mendampingi", leftMargin + w1, yPos);
  yPos += 6;
  doc.text("perkembangan akademik, karakter, keterampilan, dan kompetensi murid dari saat", leftMargin, yPos);
  yPos += 6;
  doc.text("masuk hingga lulus pada satuan pendidikan yang sama.", leftMargin, yPos);
  yPos += 10;
  
  // III. Tujuan
  doc.setFont("times", "bold");
  doc.text("III. Tujuan", leftMargin, yPos);
  yPos += 6;
  doc.setFont("times", "normal");
  doc.text("Adapun tujuan guru wali yaitu :", leftMargin, yPos);
  yPos += 6;
  doc.text("\u2022 Menjamin pelaksanaan pendampingan murid secara menyeluruh dan", indent, yPos);
  yPos += 5;
  doc.text("  berkesinambungan.", indent, yPos);
  yPos += 6;
  doc.text("\u2022 Meningkatkan keterlibatan guru dalam pendidikan karakter dan", indent, yPos);
  yPos += 5;
  doc.text("  pengembangan potensi murid.", indent, yPos);
  yPos += 6;
  doc.text("\u2022 Memberikan dukungan sistematis terhadap pertumbuhan akademik dan", indent, yPos);
  yPos += 5;
  doc.text("  non-akademik peserta didik.", indent, yPos);
  yPos += 10;
  
  // IV. Ruang Lingkup Tugas
  doc.setFont("times", "bold");
  doc.text("IV. Ruang Lingkup Tugas", leftMargin, yPos);
  yPos += 6;
  doc.setFont("times", "normal");
  doc.text("Berdasarkan Pasal 9 ayat (2), Guru Wali melaksanakan tugas sebagai berikut:", leftMargin, yPos);
  yPos += 8;
  
  doc.setFont("times", "bold");
  doc.text("1. Pendampingan Akademik", indent, yPos);
  yPos += 6;
  doc.setFont("times", "normal");
  doc.text("Membantu murid dalam perencanaan dan refleksi belajar.", leftMargin, yPos);
  yPos += 8;
  
  doc.setFont("times", "bold");
  doc.text("2. Pengembangan Kompetensi dan Keterampilan", indent, yPos);
  yPos += 6;
  doc.setFont("times", "normal");
  doc.text("Mendorong minat bakat serta pengembangan soft skills.", leftMargin, yPos);
  yPos += 8;
  
  doc.setFont("times", "bold");
  doc.text("3. Pembinaan Karakter", indent, yPos);
  yPos += 6;
  doc.setFont("times", "normal");
  doc.text("Menanamkan nilai kedisiplinan, kejujuran, tanggung jawab, dan empati.", leftMargin, yPos);
  yPos += 8;
  
  doc.setFont("times", "bold");
  doc.text("4. Pendampingan Berkelanjutan", indent, yPos);
  yPos += 6;
  doc.setFont("times", "normal");
  doc.text("Menjadi pendamping murid dari awal hingga akhir masa belajar.", leftMargin, yPos);
  yPos += 10;
  
  // V. Prosedur Pelaksanaan
  doc.setFont("times", "bold");
  doc.text("V. Prosedur Pelaksanaan", leftMargin, yPos);
  yPos += 8;
  
  doc.text("1. Penunjukan Guru Wali", leftMargin, yPos);
  yPos += 6;
  doc.setFont("times", "normal");
  doc.text("\u2022 Dilakukan oleh Kepala Sekolah (Pasal 18 ayat 1).", indent, yPos);
  yPos += 6;
  doc.text("\u2022 Berdasarkan rasio jumlah murid dengan jumlah guru mata pelajaran", indent, yPos);
  yPos += 5;
  doc.text("  (Pasal 18 ayat 2).", indent, yPos);
  
  // ==========================================
  // PAGE 2: Prosedur Pelaksanaan (Table)
  // ==========================================
  doc.addPage();
  addDecorativeCorners(doc); // Add decorative corners
  yPos = MARGINS.top;
  
  doc.setFont("times", "bold");
  doc.text("2. Pelaksanaan Tugas", leftMargin, yPos);
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
  doc.text("VI. Evaluasi dan Pelaporan", leftMargin, yPos);
  yPos += 6;
  doc.setFont("times", "normal");
  doc.text("\u2022 Guru Wali menyusun laporan singkat setiap semester berisi:", indent, yPos);
  yPos += 6;
  doc.text("o Rekap pertemuan dan kegiatan", indent + 15, yPos);
  yPos += 6;
  doc.text("o Catatan perkembangan murid", indent + 15, yPos);
  yPos += 6;
  doc.text("o Rekomendasi tindak lanjut", indent + 15, yPos);
  yPos += 6;
  doc.text("\u2022 Laporan dikumpulkan ke Wakil Kepala Sekolah bidang Kesiswaan atau", indent, yPos);
  yPos += 5;
  doc.text("  Kurikulum.", indent, yPos);
  yPos += 10;
  
  // VII. Ekuivalensi Beban Kerja
  doc.setFont("times", "bold");
  doc.text("VII. Ekuivalensi Beban Kerja", leftMargin, yPos);
  yPos += 6;
  doc.setFont("times", "normal");
  const ekvText1 = "\u2022 Tugas Guru Wali ";
  doc.text(ekvText1, indent, yPos);
  const w2 = doc.getTextWidth(ekvText1);
  doc.setFont("times", "bold");
  const ekvText2 = "setara dengan 2 jam Tatap Muka per minggu";
  doc.text(ekvText2, indent + w2, yPos);
  yPos += 5;
  doc.setFont("times", "normal");
  doc.text("  (Pasal 14 dan Lampiran Permendikdasmen No. 11 Tahun 2025)", indent, yPos);
  yPos += 10;
  
  // VIII. Penutup
  doc.setFont("times", "bold");
  doc.text("VIII. Penutup", leftMargin, yPos);
  yPos += 6;
  doc.setFont("times", "normal");
  doc.text("SOP ini menjadi acuan pelaksanaan tugas Guru Wali untuk memastikan", leftMargin, yPos);
  yPos += 6;
  doc.text("pendampingan murid berjalan sistematis, profesional, dan berdampak pada", leftMargin, yPos);
  yPos += 6;
  doc.text("perkembangan peserta didik secara utuh.", leftMargin, yPos);
}

// ==========================================
// MODULAR HELPER FUNCTIONS - SEMESTER REPORT
// ==========================================

/**
 * Helper: Check for page break and add new page if needed
 * Decorative corners added to all new pages (not cover)
 */
function checkPageBreak(doc: jsPDF, currentY: number, requiredSpace: number): number {
  const maxY = PAPER.LEGAL.height - MARGINS.bottom;
  if (currentY + requiredSpace > maxY) {
    doc.addPage();
    addDecorativeCorners(doc); // Add corners to new page
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
  // NO decorative corners on cover page (page 1 only)
  
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

/**
 * MODULAR SECTION 2: Add Lampiran A (Student List)
 */
function addLampiranA(doc: jsPDF, students: StudentData[]): void {
  doc.addPage();
  addDecorativeCorners(doc);
  let yPos = MARGINS.top;
  const centerX = PAPER.LEGAL.width / 2;
  
  // Title - 14pt bold
  doc.setFontSize(FONTS.heading);
  doc.setFont("times", "bold");
  doc.text("LAMPIRAN A", centerX, yPos, { align: "center" });
  yPos += FONTS.heading * 1.2;
  
  doc.setFontSize(FONTS.subheading);
  doc.text("FORMAT IDENTITAS MURID DAMPINGAN", centerX, yPos, { align: "center" });
  yPos += FONTS.subheading * 2;
  
  if (students.length > 0) {
    autoTable(doc, {
      startY: yPos,
      head: [["No.", "Nama Lengkap", "NIS/NISN", "Kelas", "Jenis Kelamin", "Kontak Ortu", "Catatan"]],
      body: students.map((s, idx) => [
        (idx + 1).toString(),
        s.name,
        s.nisn || "-",
        s.class || "-",
        s.gender || "-",
        "-",
        "-"
      ]),
      theme: "grid",
      headStyles: {
        fillColor: COLORS.tableHeader,
        textColor: COLORS.black,
        fontSize: FONTS.table,
        fontStyle: "bold",
        font: "times"
      },
      bodyStyles: { fontSize: FONTS.table - 1, font: "times" },
      margin: { left: MARGINS.left, right: MARGINS.right },
      styles: { cellPadding: 4 }
    });
  }
}

/**
 * MODULAR SECTION 3: Add Lampiran B (Per-Student Journals)
 * Note: "LAMPIRAN B" header only shows on FIRST page (as per reference)
 */
function addLampiranB(doc: jsPDF, journals: StudentJournalEntry[]): void {
  if (!journals || journals.length === 0) return;
  
  journals.forEach((journal, idx) => {
    doc.addPage();
    addDecorativeCorners(doc);
    let yPos = MARGINS.top;
    const centerX = PAPER.LEGAL.width / 2;
    
    // Title - ONLY ON FIRST PAGE (idx === 0)
    if (idx === 0) {
      doc.setFontSize(FONTS.heading);
      doc.setFont("times", "bold");
      doc.text("LAMPIRAN B", centerX, yPos, { align: "center" });
      yPos += FONTS.heading * 1.2;
      
      doc.setFontSize(FONTS.subheading);
      doc.text("FORMAT CATATAN PERKEMBANGAN MURID", centerX, yPos, { align: "center" });
      yPos += FONTS.subheading * 2;
    }
    
    // Student Info - with proper spacing
    doc.setFontSize(FONTS.body);
    doc.setFont("times", "bold");
    doc.text("Nama Murid", MARGINS.left, yPos);
    doc.setFont("times", "normal");
    doc.text(`: ${journal.studentName}`, MARGINS.left + 110, yPos);
    yPos += FONTS.body * LINE_SPACING;
    
    doc.setFont("times", "bold");
    doc.text("Kelas", MARGINS.left, yPos);
    doc.setFont("times", "normal");
    doc.text(`: ${journal.classroom}`, MARGINS.left + 110, yPos);
    yPos += FONTS.body * LINE_SPACING;
    
    doc.setFont("times", "bold");
    doc.text("Periode Pemantauan", MARGINS.left, yPos);
    doc.setFont("times", "normal");
    doc.text(`: ${journal.periode}`, MARGINS.left + 110, yPos);
    yPos += FONTS.body * LINE_SPACING;
    
    doc.setFont("times", "bold");
    doc.text("Guru Wali", MARGINS.left, yPos);
    doc.setFont("times", "normal");
    doc.text(`: ${journal.guruWali}`, MARGINS.left + 110, yPos);
    yPos += FONTS.body * 2;
    
    // 5 Aspects Table with proper margins
    autoTable(doc, {
      startY: yPos,
      head: [["Aspek Pemantauan", "Deskripsi Perkembangan", "Tindak Lanjut yang Dilakukan", "Keterangan Tambahan"]],
      body: [
        ["Akademik", journal.academicDesc || "-", journal.academicAction || "-", ""],
        ["Karakter", journal.characterDesc || "-", journal.characterAction || "-", ""],
        ["Sosial-Emosional", journal.socialEmotionalDesc || "-", journal.socialEmotionalAction || "-", ""],
        ["Kedisiplinan", journal.disciplineDesc || "-", journal.disciplineAction || "-", ""],
        ["Potensi & Minat", journal.potentialInterestDesc || "-", journal.potentialInterestAction || "-", ""]
      ],
      theme: "grid",
      headStyles: {
        fillColor: COLORS.tableHeader,
        textColor: COLORS.black,
        fontSize: FONTS.table,
        fontStyle: "bold",
        font: "times"
      },
      bodyStyles: { fontSize: FONTS.table - 1, font: "times", valign: "top" },
      columnStyles: {
        0: { cellWidth: (USABLE_WIDTH * 0.20) },
        1: { cellWidth: (USABLE_WIDTH * 0.35) },
        2: { cellWidth: (USABLE_WIDTH * 0.30) },
        3: { cellWidth: (USABLE_WIDTH * 0.15) }
      },
      margin: { left: MARGINS.left, right: MARGINS.right },
      styles: { cellPadding: 4, minCellHeight: 50 }
    });
  });
}

/**
 * MODULAR SECTION 4: Add Lampiran C (Individual Meeting Records)
 * Format from reference: Individual meeting log with date, student, topic, action, notes
 */
function addLampiranC(doc: jsPDF, meetingRecords: MeetingRecordEntry[]): void {
  if (!meetingRecords || meetingRecords.length === 0) return;
  
  doc.addPage();
  addDecorativeCorners(doc);
  let yPos = MARGINS.top;
  const centerX = PAPER.LEGAL.width / 2;
  
  // Title - 16pt bold
  doc.setFontSize(FONTS.heading);
  doc.setFont("times", "bold");
  doc.text("LAMPIRAN C: FORMAT REKAP PERTEMUAN DENGAN MURID", centerX, yPos, { align: "center" });
  yPos += FONTS.heading * 2;
  
  // Individual Meeting Records Table (6 columns)
  autoTable(doc, {
    startY: yPos,
    head: [[
      "No.",
      "Tanggal\nPertemuan",
      "Nama Murid",
      "Topik atau\nMasalah yang\nDibahas",
      "Tindak\nLanjut",
      "Keterangan"
    ]],
    body: meetingRecords.map((record, idx) => [
      (idx + 1).toString(),
      record.tanggal,
      record.namaMurid,
      record.topikMasalah,
      record.tindakLanjut,
      record.keterangan
    ]),
    theme: "grid",
    headStyles: {
      fillColor: COLORS.tableHeader,
      textColor: COLORS.black,
      fontSize: FONTS.table,
      fontStyle: "bold",
      font: "times",
      halign: "center",
      valign: "middle"
    },
    bodyStyles: { 
      fontSize: FONTS.table - 1, 
      font: "times",
      valign: "top"
    },
    columnStyles: {
      0: { cellWidth: (USABLE_WIDTH * 0.08), halign: "center" },  // No.
      1: { cellWidth: (USABLE_WIDTH * 0.15), halign: "center" },  // Tanggal
      2: { cellWidth: (USABLE_WIDTH * 0.17) },                    // Nama Murid
      3: { cellWidth: (USABLE_WIDTH * 0.25) },                    // Topik/Masalah
      4: { cellWidth: (USABLE_WIDTH * 0.20) },                    // Tindak Lanjut
      5: { cellWidth: (USABLE_WIDTH * 0.15) }                     // Keterangan
    },
    margin: { left: MARGINS.left, right: MARGINS.right },
    styles: { cellPadding: 4, minCellHeight: 15 }
  });
}

/**
 * MODULAR SECTION 5: Add Lampiran D (Pelaporan Semester)
 */
function addLampiranD(
  doc: jsPDF,
  teacherName: string,
  students: StudentData[],
  semester: string,
  academicYear: string,
  meetingSummary?: MeetingSummaryEntry[]
): void {
  doc.addPage();
  addDecorativeCorners(doc);
  let yPos = MARGINS.top;
  const centerX = PAPER.LEGAL.width / 2;
  
  // Title - 14pt bold
  doc.setFontSize(FONTS.heading);
  doc.setFont("times", "bold");
  doc.text("LAMPIRAN D: FORMAT PELAPORAN SEMESTER GURU WALI", centerX, yPos, { align: "center" });
  yPos += FONTS.heading * 2;
  
  // Header Info
  doc.setFontSize(FONTS.body);
  doc.setFont("times", "bold");
  doc.text("Nama Guru Wali", MARGINS.left, yPos);
  doc.setFont("times", "normal");
  doc.text(`: ${teacherName}`, MARGINS.left + 130, yPos);
  yPos += FONTS.body * LINE_SPACING;
  
  doc.setFont("times", "bold");
  const kelasMurid = students.length > 0 ? `Kelas ${students[0]?.class || "7"} - ${students.length} Siswa` : `${students.length} Siswa`;
  doc.text("Kelas/Murid Dampingan", MARGINS.left, yPos);
  doc.setFont("times", "normal");
  doc.text(`: ${kelasMurid}`, MARGINS.left + 130, yPos);
  yPos += FONTS.body * LINE_SPACING;
  
  doc.setFont("times", "bold");
  doc.text("Semester", MARGINS.left, yPos);
  doc.setFont("times", "normal");
  doc.text(`: ${semester}`, MARGINS.left + 130, yPos);
  yPos += FONTS.body * LINE_SPACING;
  
  doc.setFont("times", "bold");
  doc.text("Tahun Ajaran", MARGINS.left, yPos);
  doc.setFont("times", "normal");
  doc.text(`: ${academicYear}`, MARGINS.left + 130, yPos);
  yPos += FONTS.body * 2;
  
  // Section 1: Rekapitulasi Pertemuan
  doc.setFont("times", "bold");
  doc.text("1. Rekapitulasi Pertemuan", MARGINS.left, yPos);
  yPos += FONTS.body * 1.5;
  
  autoTable(doc, {
    startY: yPos,
    head: [["Bulan", "Jumlah Pertemuan", "Format (Individu/Kelompok)", "Persentase Kehadiran"]],
    body: (meetingSummary && meetingSummary.length > 0) ? meetingSummary.map(m => [
      m.bulan, m.jumlah.toString(), m.format, m.persentase
    ]) : [
      ["Juli", "2", "Individual", "100%"],
      ["Agustus", "3", "Kelompok", "90%"]
    ],
    theme: "grid",
    headStyles: {
      fillColor: COLORS.tableHeader,
      textColor: COLORS.black,
      fontSize: FONTS.table,
      fontStyle: "bold",
      font: "times"
    },
    bodyStyles: { fontSize: FONTS.table - 1, font: "times" },
    margin: { left: MARGINS.left, right: MARGINS.right },
    styles: { cellPadding: 4 }
  });
  
  yPos = (doc as any).lastAutoTable.finalY + (FONTS.body * 2);
  
  // Section 2: Catatan Perkembangan Umum
  yPos = checkPageBreak(doc, yPos, 150);
  doc.setFont("times", "bold");
  doc.text("2. Catatan Perkembangan Umum", MARGINS.left, yPos);
  yPos += FONTS.body * LINE_SPACING;
  
  doc.setFont("times", "normal");
  const paragraph1 = doc.splitTextToSize(
    `Selama ${semester} ${academicYear}, secara keseluruhan murid dampingan menunjukkan perkembangan yang positif dalam berbagai aspek. Dari sisi akademik, sebagian besar murid mampu mengikuti pembelajaran dengan baik meskipun masih ada beberapa yang memerlukan bimbingan khusus pada mata pelajaran tertentu.`,
    USABLE_WIDTH
  );
  doc.text(paragraph1, MARGINS.left, yPos);
  yPos += (paragraph1.length * FONTS.body * LINE_SPACING);
  
  const paragraph2 = doc.splitTextToSize(
    "Dalam aspek pembentukan karakter, murid menunjukkan peningkatan dalam hal kedisiplinan, tanggung jawab, dan kemampuan bersosialisasi. Nilai-nilai seperti kejujuran dan empati mulai tertanam dengan baik melalui pendampingan berkelanjutan yang dilakukan.",
    USABLE_WIDTH
  );
  doc.text(paragraph2, MARGINS.left, yPos);
  yPos += (paragraph2.length * FONTS.body * LINE_SPACING);
  
  const paragraph3 = doc.splitTextToSize(
    "Perkembangan sosial-emosional murid juga menunjukkan tren positif, dengan meningkatnya kemampuan mereka dalam mengelola emosi dan membangun hubungan yang sehat dengan teman sebaya maupun guru. Beberapa murid yang sebelumnya cenderung pendiam mulai lebih aktif berpartisipasi dalam kegiatan kelompok.",
    USABLE_WIDTH
  );
  doc.text(paragraph3, MARGINS.left, yPos);
  yPos += (paragraph3.length * FONTS.body * LINE_SPACING);
  
  // Section 3: Rekomendasi Tindak Lanjut
  yPos = checkPageBreak(doc, yPos, 150);
  doc.setFont("times", "bold");
  doc.text("3. Rekomendasi Tindak Lanjut", MARGINS.left, yPos);
  yPos += FONTS.body * LINE_SPACING;
  
  doc.setFont("times", "normal");
  const intro = doc.splitTextToSize(
    "Berdasarkan hasil pemantauan selama semester ini, berikut adalah rekomendasi untuk semester berikutnya:",
    USABLE_WIDTH
  );
  doc.text(intro, MARGINS.left, yPos);
  yPos += (intro.length * FONTS.body * LINE_SPACING);
  
  const recs = [
    "a. Akademik: Perlu dilakukan program remedial khusus bagi murid yang masih mengalami kesulitan di mata pelajaran tertentu, serta pengayaan bagi murid yang sudah menunjukkan prestasi baik.",
    "b. Karakter: Melanjutkan program pembinaan karakter dengan fokus pada penguatan nilai-nilai integritas dan kepemimpinan. Libatkan murid dalam kegiatan yang melatih tanggung jawab dan kemandirian.",
    "c. Sosial-Emosional: Tingkatkan program peer support dan mentoring untuk membantu murid yang masih memerlukan dukungan dalam berinteraksi sosial. Adakan sesi sharing berkala untuk memperkuat bonding antar murid.",
    "d. Kolaborasi: Perluas koordinasi dengan orang tua melalui pertemuan rutin dan komunikasi intensif untuk memastikan konsistensi pendampingan di rumah dan sekolah."
  ];
  
  recs.forEach(rec => {
    yPos = checkPageBreak(doc, yPos, 50);
    const recLines = doc.splitTextToSize(rec, USABLE_WIDTH);
    doc.text(recLines, MARGINS.left, yPos);
    yPos += (recLines.length * FONTS.body * LINE_SPACING);
  });
  
  // Add signature section (1 line space, then signature fields)
  yPos += FONTS.body * LINE_SPACING; // 1 blank line
  yPos = checkPageBreak(doc, yPos, 80); // Ensure space for signature
  
  doc.setFontSize(FONTS.body);
  doc.setFont("times", "normal");
  
  doc.text("Nama", MARGINS.left, yPos);
  doc.text(": .............................................................................................​", MARGINS.left + 100, yPos);
  yPos += FONTS.body * LINE_SPACING * 2;
  
  doc.text("Tanda Tangan", MARGINS.left, yPos);
  doc.text(": .............................................................................................​", MARGINS.left + 100, yPos);
  yPos += FONTS.body * LINE_SPACING * 2;
  
  doc.text("Tanggal", MARGINS.left, yPos);
  doc.text(": .............................................................................................​", MARGINS.left + 100, yPos);
}

// NOTE: Signature section removed - now integrated at end of Lampiran D
