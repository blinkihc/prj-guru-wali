// Edge-compatible PDF Generator using jsPDF
// Created: 2025-10-16
// Updated: 2025-10-17 - MODULAR REFACTOR with SOLID principles
// Legal paper (8.5" x 14"), proper margins, font standards
// Replaces @react-pdf/renderer for Cloudflare Pages compatibility

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Decorative corner design (extracted from SVG - geometric shapes)
// Based on decorative-corner.svg: Blue trapezoid + Orange accent
// No external dependencies - pure jsPDF drawing

// ==========================================
// COVER OPTIONS - Dual Cover System Support
// ==========================================
interface CoverOptions {
  type: "simple" | "illustration";
  illustrationUrl?: string; // Future: R2 image URL for illustration cover

  // Logo options for simple cover
  logoDinasPendidikan?: string; // Base64 or URL - Education Department logo
  logoSekolah?: string; // Base64 or URL - School logo

  // Basic info
  schoolName: string;
  semester: string;
  academicYear: string;
  teacherName: string;
  totalStudents: number;
}

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
  tanggal: string; // Date of meeting
  namaMurid: string; // Student name
  topikMasalah: string; // Topic/issue discussed
  tindakLanjut: string; // Follow-up action
  keterangan: string; // Notes/remarks
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
  LEGAL: { width: 612, height: 1008 }, // 8.5" x 14" in points
};

const MARGINS = {
  left: 2 * 28.35, // 2 cm
  right: 1.5 * 28.35, // 1.5 cm
  top: 3 * 28.35, // 2 cm
  bottom: 1.5 * 28.35, // 1.5 cm
};

const FONTS = {
  cover: 20, // Cover/Judul utama
  heading: 16, // Heading bab
  subheading: 14, // Heading subbab
  body: 12, // Body text
  table: 12, // Table content
};

const COLORS = {
  tableHeader: [198, 224, 180] as [number, number, number], // #C6E0B4
  black: [0, 0, 0] as [number, number, number],
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
  schoolName: string,
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
      head: [
        [
          "Aspek Pemantauan",
          "Deskripsi Perkembangan",
          "Tindak Lanjut yang Dilakukan",
          "Keterangan Tambahan",
        ],
      ],
      body: [
        [
          "Akademik",
          journals[0]?.academicProgress || "-",
          "Konseling dan kunjungan orang tua",
          "",
        ],
        [
          "Karakter",
          journals[0]?.socialBehavior || "-",
          "Menerapkan disiplin positif yang berfokus pada membangun karakter",
          "",
        ],
        [
          "Sosial-Emosional",
          journals[0]?.emotionalState || "-",
          "Membiasakan ucapan seperti 'tolong, permisi dan terima kasih'",
          "",
        ],
        [
          "Kedisiplinan",
          journals[0]?.physicalHealth || "-",
          "Mengucapkan salam, mendengarkan seksama, berprilaku tertib",
          "",
        ],
        [
          "Potensi & Minat",
          journals[0]?.spiritualDevelopment || "-",
          "Pembelajaran interaktif dan menciptakan lingkungan positif",
          "",
        ],
      ],
      theme: "grid",
      headStyles: {
        fillColor: [198, 224, 180], // #C6E0B4 (official color)
        textColor: [0, 0, 0],
        fontSize: 9,
        fontStyle: "bold",
      },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: pageWidth * 0.2 }, // 20%
        1: { cellWidth: pageWidth * 0.35 }, // 35%
        2: { cellWidth: pageWidth * 0.3 }, // 30%
        3: { cellWidth: pageWidth * 0.15 }, // 15%
      },
      margin: { left: 20, right: 20 },
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
      body: meetings.map((m) => [
        m.date,
        m.type,
        m.topic,
        `${m.notes.substring(0, 50)}...`,
      ]),
      theme: "grid",
      headStyles: { fillColor: [52, 152, 219], fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 30 },
        2: { cellWidth: 50 },
        3: { cellWidth: 65 },
      },
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
      body: interventions.map((i) => [
        i.date,
        `${i.issue.substring(0, 40)}...`,
        `${i.action.substring(0, 40)}...`,
        `${i.result.substring(0, 40)}...`,
      ]),
      theme: "grid",
      headStyles: { fillColor: [231, 76, 60], fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 50 },
        2: { cellWidth: 50 },
        3: { cellWidth: 45 },
      },
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
    year: "numeric",
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
 *
 * @param students - List of students
 * @param coverOptions - Cover page configuration (simple or illustration)
 * @param nipNuptk - Teacher ID for signature
 * @param studentJournals - Optional student journal entries
 * @param meetingRecords - Optional meeting records
 * @param meetingSummary - Optional meeting summary
 */
export function generateSemesterReportPDF(
  students: StudentData[],
  coverOptions: CoverOptions,
  nipNuptk: string,
  studentJournals?: StudentJournalEntry[],
  meetingRecords?: MeetingRecordEntry[], // Lampiran C: Individual meetings
  meetingSummary?: MeetingSummaryEntry[], // Lampiran D: Monthly summary
): Uint8Array {
  // Initialize with Legal paper size
  const doc = new jsPDF({
    unit: "pt",
    format: [PAPER.LEGAL.width, PAPER.LEGAL.height],
  });
  doc.setFont("times");

  // Decorative corners will be drawn using geometric shapes

  // ==========================================
  // STRUCTURE (CORRECT ORDER) - MODULAR & CLEAN
  // ==========================================

  // 1. Cover Page (with flexible cover options)
  addSemesterCoverPage(doc, coverOptions);

  // 2. SOP Pages (Permendikdasmen No. 11 Tahun 2025)
  addSOPPages(doc, coverOptions.schoolName, coverOptions.academicYear);

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
  addLampiranD(
    doc,
    coverOptions.teacherName,
    students,
    coverOptions.semester,
    coverOptions.academicYear,
    nipNuptk,
    meetingSummary,
  );

  // Return as Uint8Array
  const pdfOutput = doc.output("arraybuffer");
  return new Uint8Array(pdfOutput);
}

/**
 * Add decorative corners - SIMPLE VERSION (NO PNG)
 * Uses diagonal background lines only
 * Updated: 2025-10-18 - Removed PNG corners to fix signature errors
 */
function addDecorativeCorners(doc: jsPDF): void {
  console.log("🎨 [NEW CODE] addDecorativeCorners - diagonal lines only");
  const pageWidth = PAPER.LEGAL.width;
  const pageHeight = PAPER.LEGAL.height;

  // Corner margins (in cm converted to pt)
  const marginTop = 0.5 * 28.35; // 0.5 cm from top
  const marginLeft = 0.5 * 28.35; // 0.5 cm from left
  const marginBottom = 0.3 * 28.35; // 0.3 cm from bottom

  // BACKGROUND FIRST: Subtle diagonal lines (white with light shadow)
  // Draw this FIRST so corners appear on top

  // First pass: Light gray shadow (slightly offset)
  doc.setDrawColor(220, 220, 220); // Very light gray for shadow
  doc.setLineWidth(0.3);
  doc.saveGraphicsState();
  (doc as any).setGState((doc as any).GState({ opacity: 0.15 })); // Very subtle
  const spacing = 60;
  for (
    let offset = -pageHeight;
    offset < pageWidth + pageHeight;
    offset += spacing
  ) {
    doc.line(offset + 1, pageHeight + 1, offset + pageHeight + 1, 1); // Shadow offset
  }

  // Second pass: White lines on top
  doc.setDrawColor(255, 255, 255); // White
  doc.setLineWidth(0.5);
  (doc as any).setGState((doc as any).GState({ opacity: 0.08 })); // Super tipis
  for (
    let offset = -pageHeight;
    offset < pageWidth + pageHeight;
    offset += spacing
  ) {
    doc.line(offset, pageHeight, offset + pageHeight, 0);
  }

  // Reset opacity for corners and content
  doc.restoreGraphicsState();

  // TOP-LEFT CORNER: Blue trapezoid + Orange accent (SMALLER & with margins)
  const blueWidth = 170; // Horizontal width
  const blueHeight = 30; // Reduced from 50px to 30px
  const orangeHeight = 15; // Reduced from 30px to 15px

  // Blue angular trapezoid shape (#246A96) - with margins
  doc.setFillColor(36, 106, 150); // #246A96
  // Draw as filled rectangle + triangle to form trapezoid (with margins)
  doc.rect(marginLeft, marginTop, blueWidth - 20, blueHeight, "F"); // Main rectangle
  doc.triangle(
    marginLeft + blueWidth - 20,
    marginTop,
    marginLeft + blueWidth,
    marginTop,
    marginLeft + blueWidth - 20,
    marginTop + blueHeight,
    "F",
  ); // Angled edge

  // Add white text inside blue shape (11pt bold)
  doc.setTextColor(255, 255, 255); // White text
  doc.setFontSize(11); // Larger, more readable
  doc.setFont("times", "bold");
  doc.text("Laporan", marginLeft + 10, marginTop + 13); // Line 1
  doc.text("Guru Wali", marginLeft + 10, marginTop + 23); // Line 2

  // Reset text color to black for rest of document
  doc.setTextColor(0, 0, 0);

  // Orange accent below (#FEBD59) - with margins
  doc.setFillColor(254, 189, 89); // #FEBD59
  const orangeWidth = blueWidth * 0.55; // Proportional to blue
  doc.rect(
    marginLeft,
    marginTop + blueHeight,
    orangeWidth - 15,
    orangeHeight,
    "F",
  ); // Main rectangle
  doc.triangle(
    marginLeft + orangeWidth - 15,
    marginTop + blueHeight,
    marginLeft + orangeWidth,
    marginTop + blueHeight,
    marginLeft + orangeWidth - 15,
    marginTop + blueHeight + orangeHeight,
    "F",
  ); // Angled edge

  // BOTTOM-RIGHT CORNER: Mirrored design (with margin, no text)
  // Blue angular shape (flipped)
  doc.setFillColor(36, 106, 150);
  doc.rect(
    pageWidth - blueWidth + 20 - marginLeft,
    pageHeight - blueHeight - marginBottom,
    blueWidth - 20,
    blueHeight,
    "F",
  ); // Main rectangle
  doc.triangle(
    pageWidth - blueWidth + 20 - marginLeft,
    pageHeight - blueHeight - marginBottom,
    pageWidth - blueWidth + 20 - marginLeft,
    pageHeight - marginBottom,
    pageWidth - blueWidth - marginLeft,
    pageHeight - marginBottom,
    "F",
  ); // Angled edge

  // Orange accent (flipped)
  doc.setFillColor(254, 189, 89);
  doc.rect(
    pageWidth - orangeWidth + 15 - marginLeft,
    pageHeight - blueHeight - orangeHeight - marginBottom,
    orangeWidth - 15,
    orangeHeight,
    "F",
  ); // Main rectangle
  doc.triangle(
    pageWidth - orangeWidth + 15 - marginLeft,
    pageHeight - blueHeight - orangeHeight - marginBottom,
    pageWidth - orangeWidth + 15 - marginLeft,
    pageHeight - blueHeight - marginBottom,
    pageWidth - orangeWidth - marginLeft,
    pageHeight - blueHeight - marginBottom,
    "F",
  ); // Angled edge
}

/**
 * Add SOP Pages (3 pages) - EXACT content from sop-pages.tsx template
 * Based on Permendikdasmen No. 11 Tahun 2025
 *
 * TODO: Full refactor needed - replace ALL hardcoded positions (20, 25, etc)
 * with leftMargin and indent variables throughout (~600 lines)
 * Current fix: Top margin and header positioning corrected
 */
function addSOPPages(
  doc: jsPDF,
  schoolName: string,
  tahunAjaran: string,
): void {
  // ==========================================
  // PAGE 1: SOP GURU WALI - Dasar Hukum & Ruang Lingkup
  // ==========================================
  doc.addPage();
  addDecorativeCorners(doc);

  let yPos = MARGINS.top;
  const centerX = PAPER.LEGAL.width / 2;
  const leftMargin = MARGINS.left;
  const indent = leftMargin + 15;

  doc.setFontSize(FONTS.heading);
  doc.setFont("times", "bold");
  doc.text("STANDAR OPERASIONAL PROSEDUR (SOP)", centerX, yPos, {
    align: "center",
  });
  yPos += FONTS.heading * 1.2;
  doc.text("GURU WALI", centerX, yPos, { align: "center" });
  yPos += FONTS.body * 2;

  doc.setFontSize(FONTS.body);
  doc.setFont("times", "normal");
  doc.text(`Satuan Pendidikan: ${schoolName}`, centerX, yPos, {
    align: "center",
  });
  yPos += FONTS.body * LINE_SPACING;
  doc.text(`Jenjang Sekolah: SMP`, centerX, yPos, { align: "center" });
  yPos += FONTS.body * LINE_SPACING;
  doc.text(`Tahun Ajaran: ${tahunAjaran}`, centerX, yPos, { align: "center" });
  yPos += FONTS.body * 2;

  // I. Dasar Hukum
  doc.setFont("times", "bold");
  doc.text("I. Dasar Hukum", leftMargin, yPos);
  yPos += FONTS.body * LINE_SPACING;
  doc.setFont("times", "normal");
  const item1 =
    "1. Permendikdasmen No. 11 Tahun 2025 tentang Pemenuhan Beban Kerja Guru";
  const item1Lines = doc.splitTextToSize(item1, USABLE_WIDTH - 15);
  doc.text(item1Lines, indent, yPos);
  yPos += item1Lines.length * FONTS.body * LINE_SPACING;
  doc.text(
    "2. Pasal 9 ayat (1-5): Kewajiban dan ruang lingkup tugas Guru Wali",
    indent,
    yPos,
  );
  yPos += FONTS.body * LINE_SPACING;
  doc.text(
    "3. Pasal 14: Ekuivalensi tugas Guru Wali setara 2 JP per minggu",
    indent,
    yPos,
  );
  yPos += FONTS.body * LINE_SPACING;
  const item4 =
    "4. Pasal 17 dan 18: Penetapan, pelaksanaan, dan penghitungan beban kerja";
  const item4Lines = doc.splitTextToSize(item4, USABLE_WIDTH - 15);
  doc.text(item4Lines, indent, yPos);
  yPos += item4Lines.length * FONTS.body * LINE_SPACING;
  yPos += FONTS.body * LINE_SPACING;

  // II. Pengertian
  doc.setFont("times", "bold");
  doc.text("II. Pengertian", leftMargin, yPos);
  yPos += FONTS.body * LINE_SPACING;

  // Use splitTextToSize for proper text wrapping
  doc.setFont("times", "normal");
  const pengertiText =
    "Guru Wali adalah guru mata pelajaran yang diberi tugas mendampingi perkembangan akademik, karakter, keterampilan, dan kompetensi murid dari saat masuk hingga lulus pada satuan pendidikan yang sama.";
  const pengertiLines = doc.splitTextToSize(pengertiText, USABLE_WIDTH);
  doc.text(pengertiLines, leftMargin, yPos);
  yPos += pengertiLines.length * FONTS.body * LINE_SPACING;
  yPos += FONTS.body * LINE_SPACING;

  // III. Tujuan
  doc.setFont("times", "bold");
  doc.text("III. Tujuan", leftMargin, yPos);
  yPos += FONTS.body * LINE_SPACING;
  doc.setFont("times", "normal");
  doc.text("Adapun tujuan guru wali yaitu :", leftMargin, yPos);
  yPos += FONTS.body * LINE_SPACING;

  // Bullet 1 - with text wrapping
  const tujuan1 =
    "• Menjamin pelaksanaan pendampingan murid secara menyeluruh dan berkesinambungan.";
  const tujuan1Lines = doc.splitTextToSize(tujuan1, USABLE_WIDTH - 15);
  doc.text(tujuan1Lines, indent, yPos);
  yPos += tujuan1Lines.length * FONTS.body * LINE_SPACING;

  // Bullet 2
  const tujuan2 =
    "• Meningkatkan keterlibatan guru dalam pendidikan karakter dan pengembangan potensi murid.";
  const tujuan2Lines = doc.splitTextToSize(tujuan2, USABLE_WIDTH - 15);
  doc.text(tujuan2Lines, indent, yPos);
  yPos += tujuan2Lines.length * FONTS.body * LINE_SPACING;

  // Bullet 3
  const tujuan3 =
    "• Memberikan dukungan sistematis terhadap pertumbuhan akademik dan non-akademik peserta didik.";
  const tujuan3Lines = doc.splitTextToSize(tujuan3, USABLE_WIDTH - 15);
  doc.text(tujuan3Lines, indent, yPos);
  yPos += tujuan3Lines.length * FONTS.body * LINE_SPACING;
  yPos += FONTS.body * LINE_SPACING;

  // IV. Ruang Lingkup Tugas
  doc.setFont("times", "bold");
  doc.text("IV. Ruang Lingkup Tugas", leftMargin, yPos);
  yPos += FONTS.body * LINE_SPACING;
  doc.setFont("times", "normal");
  const introText =
    "Berdasarkan Pasal 9 ayat (2), Guru Wali melaksanakan tugas sebagai berikut:";
  const introLines = doc.splitTextToSize(introText, USABLE_WIDTH);
  doc.text(introLines, leftMargin, yPos);
  yPos += introLines.length * FONTS.body * LINE_SPACING + FONTS.body * 0.5;

  doc.setFont("times", "bold");
  doc.text("1. Pendampingan Akademik", indent, yPos);
  yPos += FONTS.body * LINE_SPACING;
  doc.setFont("times", "normal");
  const desc1 = "Membantu murid dalam perencanaan dan refleksi belajar.";
  const desc1Lines = doc.splitTextToSize(desc1, USABLE_WIDTH - 15);
  doc.text(desc1Lines, indent, yPos);
  yPos += desc1Lines.length * FONTS.body * LINE_SPACING + FONTS.body * 0.5;

  doc.setFont("times", "bold");
  doc.text("2. Pengembangan Kompetensi dan Keterampilan", indent, yPos);
  yPos += FONTS.body * LINE_SPACING;
  doc.setFont("times", "normal");
  const desc2 = "Mendorong minat bakat serta pengembangan soft skills.";
  const desc2Lines = doc.splitTextToSize(desc2, USABLE_WIDTH - 15);
  doc.text(desc2Lines, indent, yPos);
  yPos += desc2Lines.length * FONTS.body * LINE_SPACING + FONTS.body * 0.5;

  doc.setFont("times", "bold");
  doc.text("3. Pembinaan Karakter", indent, yPos);
  yPos += FONTS.body * LINE_SPACING;
  doc.setFont("times", "normal");
  const desc3 =
    "Menanamkan nilai kedisiplinan, kejujuran, tanggung jawab, dan empati.";
  const desc3Lines = doc.splitTextToSize(desc3, USABLE_WIDTH - 15);
  doc.text(desc3Lines, indent, yPos);
  yPos += desc3Lines.length * FONTS.body * LINE_SPACING + FONTS.body * 0.5;

  doc.setFont("times", "bold");
  doc.text("4. Pendampingan Berkelanjutan", indent, yPos);
  yPos += FONTS.body * LINE_SPACING;
  doc.setFont("times", "normal");
  const desc4 = "Menjadi pendamping murid dari awal hingga akhir masa belajar.";
  const desc4Lines = doc.splitTextToSize(desc4, USABLE_WIDTH - 15);
  doc.text(desc4Lines, indent, yPos);
  yPos +=
    desc4Lines.length * FONTS.body * LINE_SPACING + FONTS.body * LINE_SPACING;

  // V. Prosedur Pelaksanaan
  doc.setFont("times", "bold");
  doc.text("V. Prosedur Pelaksanaan", leftMargin, yPos);
  yPos += FONTS.body * LINE_SPACING * 1.5;

  doc.text("1. Penunjukan Guru Wali", leftMargin, yPos);
  yPos += FONTS.body * LINE_SPACING;
  doc.setFont("times", "normal");
  const penunjukan1 = "• Dilakukan oleh Kepala Sekolah (Pasal 18 ayat 1).";
  const penunjukan1Lines = doc.splitTextToSize(penunjukan1, USABLE_WIDTH - 15);
  doc.text(penunjukan1Lines, indent, yPos);
  yPos += penunjukan1Lines.length * FONTS.body * LINE_SPACING;

  const penunjukan2 =
    "• Berdasarkan rasio jumlah murid dengan jumlah guru mata pelajaran (Pasal 18 ayat 2).";
  const penunjukan2Lines = doc.splitTextToSize(penunjukan2, USABLE_WIDTH - 15);
  doc.text(penunjukan2Lines, indent, yPos);
  yPos += penunjukan2Lines.length * FONTS.body * LINE_SPACING;

  // ==========================================
  // PAGE 2: Prosedur Pelaksanaan (Table)
  // ==========================================
  doc.addPage();
  addDecorativeCorners(doc);
  yPos = MARGINS.top;

  doc.setFont("times", "bold");
  doc.text("2. Pelaksanaan Tugas", leftMargin, yPos);
  yPos += FONTS.body * LINE_SPACING * 1.5;

  // IMPORTANT: Set font size BEFORE table to ensure proper rendering
  doc.setFontSize(FONTS.body); // Ensure 12pt before table

  // Table for Kegiatan - use full USABLE_WIDTH with proper margins
  autoTable(doc, {
    startY: yPos,
    head: [["No", "Kegiatan", "Penjelasan", "Waktu Pelaksanaan"]],
    body: [
      [
        "1",
        "Identifikasi murid dampingan",
        "Memahami latar belakang, potensi, dan tantangan murid",
        "Awal tahun ajaran",
      ],
      [
        "2",
        "Penyusunan dan pelaksanaan rencana pendampingan",
        "Disesuaikan dengan kebutuhan murid",
        "Per semester",
      ],
      [
        "3",
        "Pertemuan berkala dengan murid",
        "Secara individual atau kelompok kecil",
        "4x seminggu",
      ],
      [
        "4",
        "Kolaborasi dengan guru BK & wali kelas",
        "Untuk tindak lanjut masalah tertentu",
        "Sesuai kebutuhan",
      ],
      [
        "5",
        "Pelaporan perkembangan murid",
        "Secara berkala (bulanan/semester)",
        "Setiap akhir bulan atau semester",
      ],
      [
        "6",
        "Dokumentasi dan refleksi",
        "Catatan kemajuan, hambatan, dan rekomendasi",
        "Berkelanjutan",
      ],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [198, 224, 180],
      textColor: [0, 0, 0],
      fontSize: 14,
      fontStyle: "bold",
      font: "times",
    },
    bodyStyles: { fontSize: 12, font: "times" },
    columnStyles: {
      0: { cellWidth: 25 }, // No - narrower
      1: { cellWidth: "auto" }, // Kegiatan - auto width
      2: { cellWidth: "auto" }, // Penjelasan - auto width
      3: { cellWidth: 85 }, // Waktu - medium width
    },
    margin: { left: MARGINS.left, right: MARGINS.right },
    tableWidth: "auto",
  });

  yPos = (doc as any).lastAutoTable.finalY + FONTS.body * LINE_SPACING * 2;

  // IMPORTANT: Reset font size after autoTable (autoTable changes it)
  doc.setFontSize(FONTS.body); // Reset to 12pt

  // VI. Evaluasi dan Pelaporan
  doc.setFont("times", "bold");
  doc.text("VI. Evaluasi dan Pelaporan", leftMargin, yPos);
  yPos += FONTS.body * LINE_SPACING;
  doc.setFont("times", "normal");
  const laporan1 =
    "• Guru Wali menyusun laporan singkat setiap semester berisi:";
  const laporan1Lines = doc.splitTextToSize(laporan1, USABLE_WIDTH - 15);
  doc.text(laporan1Lines, indent, yPos);
  yPos += laporan1Lines.length * FONTS.body * LINE_SPACING;

  doc.text("   o Rekap pertemuan dan kegiatan", indent, yPos);
  yPos += FONTS.body * LINE_SPACING;
  doc.text("   o Catatan perkembangan murid", indent, yPos);
  yPos += FONTS.body * LINE_SPACING;
  doc.text("   o Rekomendasi tindak lanjut", indent, yPos);
  yPos += FONTS.body * LINE_SPACING;

  const laporan2 =
    "• Laporan dikumpulkan ke Wakil Kepala Sekolah bidang Kesiswaan atau Kurikulum.";
  const laporan2Lines = doc.splitTextToSize(laporan2, USABLE_WIDTH - 15);
  doc.text(laporan2Lines, indent, yPos);
  yPos += laporan2Lines.length * FONTS.body * LINE_SPACING;
  yPos += FONTS.body * LINE_SPACING;

  // VII. Ekuivalensi Beban Kerja
  doc.setFont("times", "bold");
  doc.text("VII. Ekuivalensi Beban Kerja", leftMargin, yPos);
  yPos += FONTS.body * LINE_SPACING;
  doc.setFont("times", "normal");
  const ekvText =
    "• Tugas Guru Wali setara dengan 2 jam Tatap Muka per minggu (Pasal 14 dan Lampiran Permendikdasmen No. 11 Tahun 2025)";
  const ekvLines = doc.splitTextToSize(ekvText, USABLE_WIDTH - 15);
  doc.text(ekvLines, indent, yPos);
  yPos += ekvLines.length * FONTS.body * LINE_SPACING;
  yPos += FONTS.body * LINE_SPACING;

  // VIII. Penutup
  doc.setFont("times", "bold");
  doc.text("VIII. Penutup", leftMargin, yPos);
  yPos += FONTS.body * LINE_SPACING;
  doc.setFont("times", "normal");
  const penutupText =
    "SOP ini menjadi acuan pelaksanaan tugas Guru Wali untuk memastikan pendampingan murid berjalan sistematis, profesional, dan berdampak pada perkembangan peserta didik secara utuh.";
  const penutupLines = doc.splitTextToSize(penutupText, USABLE_WIDTH);
  doc.text(penutupLines, leftMargin, yPos);
  yPos += penutupLines.length * FONTS.body * LINE_SPACING;
}

// ==========================================
// MODULAR HELPER FUNCTIONS - SEMESTER REPORT
// ==========================================

/**
 * Helper: Check for page break and add new page if needed
 * Decorative corners added to all new pages (not cover)
 */
function checkPageBreak(
  doc: jsPDF,
  currentY: number,
  requiredSpace: number,
): number {
  const maxY = PAPER.LEGAL.height - MARGINS.bottom;
  if (currentY + requiredSpace > maxY) {
    doc.addPage();
    addDecorativeCorners(doc);
    return MARGINS.top;
  }
  return currentY;
}

/**
 * Helper: Add text with proper line spacing
 */
function _addBodyText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth?: number,
): number {
  doc.setFontSize(FONTS.body);
  doc.setFont("times", "normal");

  if (maxWidth) {
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + lines.length * FONTS.body * LINE_SPACING * 0.35; // Convert to points
  } else {
    doc.text(text, x, y);
    return y + FONTS.body * LINE_SPACING * 0.35;
  }
}

/**
 * MODULAR SECTION 1: Add Cover Page
 * Supports dual cover system: simple (text-only) or illustration (image + text)
 */
function addSemesterCoverPage(doc: jsPDF, options: CoverOptions): void {
  // NO decorative corners on cover page (page 1 only)
  const centerX = PAPER.LEGAL.width / 2;

  if (options.type === "illustration" && options.illustrationUrl) {
    // ==========================================
    // ILLUSTRATION COVER (Future implementation)
    // ==========================================
    // TODO Phase 2: Load image from R2, add as background
    // For now, fallback to simple cover
    console.log(
      "Illustration cover requested but not yet implemented. Using simple cover.",
    );
    addSimpleCover(doc, options, centerX);
  } else {
    // ==========================================
    // SIMPLE TEXT COVER (Current default)
    // ==========================================
    addSimpleCover(doc, options, centerX);
  }
}

/**
 * Helper: Render simple text-based cover
 */
function addSimpleCover(
  doc: jsPDF,
  options: CoverOptions,
  centerX: number,
): void {
  let yPos = PAPER.LEGAL.height / 2 - 150; // Start higher to accommodate logos

  // ==========================================
  // LOGO SECTION (Optional - uploaded in settings)
  // ==========================================
  const hasLogoDinas = !!options.logoDinasPendidikan;
  const hasLogoSekolah = !!options.logoSekolah;
  const logoHeight = 80; // Standard logo height in pt
  const logoSpacing = 30; // Space between logos if side by side

  if (hasLogoDinas || hasLogoSekolah) {
    try {
      if (hasLogoDinas && hasLogoSekolah) {
        // CASE 1: Both logos - side by side
        const totalWidth = logoHeight * 2 + logoSpacing;
        const startX = centerX - totalWidth / 2;

        // Left logo (Dinas Pendidikan)
        doc.addImage(
          options.logoDinasPendidikan!,
          "PNG",
          startX,
          yPos,
          logoHeight,
          logoHeight,
        );

        // Right logo (Sekolah)
        doc.addImage(
          options.logoSekolah!,
          "PNG",
          startX + logoHeight + logoSpacing,
          yPos,
          logoHeight,
          logoHeight,
        );
      } else if (hasLogoDinas) {
        // CASE 2: Only Dinas logo - centered
        doc.addImage(
          options.logoDinasPendidikan!,
          "PNG",
          centerX - logoHeight / 2,
          yPos,
          logoHeight,
          logoHeight,
        );
      } else if (hasLogoSekolah) {
        // CASE 3: Only School logo - centered
        doc.addImage(
          options.logoSekolah!,
          "PNG",
          centerX - logoHeight / 2,
          yPos,
          logoHeight,
          logoHeight,
        );
      }

      yPos += logoHeight + 40; // Move down after logos (40pt spacing)
    } catch (error) {
      console.error("Error adding logos to cover:", error);
      // Continue without logos if error
    }
  } else {
    // No logos - adjust starting position
    yPos = PAPER.LEGAL.height / 2 - 60;
  }

  // ==========================================
  // TITLE SECTION
  // ==========================================
  doc.setFontSize(FONTS.cover);
  doc.setFont("times", "bold");
  doc.text("LAPORAN PEMANTAUAN GURU WALI", centerX, yPos, { align: "center" });
  yPos += FONTS.cover * 1.5;

  doc.text(`SEMESTER ${options.semester.toUpperCase()}`, centerX, yPos, {
    align: "center",
  });
  yPos += FONTS.cover * 1.2;
  doc.text(`TAHUN AJARAN ${options.academicYear}`, centerX, yPos, {
    align: "center",
  });
  yPos += FONTS.body * 3;

  // Body info - 12pt normal
  doc.setFontSize(FONTS.body);
  doc.setFont("times", "normal");
  doc.text(options.schoolName, centerX, yPos, { align: "center" });
  yPos += FONTS.body * LINE_SPACING;
  doc.text(`Guru Wali: ${options.teacherName}`, centerX, yPos, {
    align: "center",
  });
  yPos += FONTS.body * LINE_SPACING;
  doc.text(
    `Total Siswa Dampingan: ${options.totalStudents} siswa`,
    centerX,
    yPos,
    { align: "center" },
  );
  yPos += FONTS.body * 3;

  const today = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
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
  doc.text("FORMAT IDENTITAS MURID DAMPINGAN", centerX, yPos, {
    align: "center",
  });
  yPos += FONTS.subheading * 2;

  if (students.length > 0) {
    autoTable(doc, {
      startY: yPos,
      head: [
        [
          "No.",
          "Nama Lengkap",
          "NIS/NISN",
          "Kelas",
          "Jenis Kelamin",
          "Kontak Ortu",
          "Catatan",
        ],
      ],
      body: students.map((s, idx) => [
        (idx + 1).toString(),
        s.name,
        s.nisn || "-",
        s.class || "-",
        s.gender || "-",
        "-",
        "-",
      ]),
      theme: "grid",
      headStyles: {
        fillColor: COLORS.tableHeader,
        textColor: COLORS.black,
        fontSize: FONTS.table,
        fontStyle: "bold",
        font: "times",
      },
      bodyStyles: { fontSize: FONTS.table - 1, font: "times" },
      margin: { left: MARGINS.left, right: MARGINS.right },
      styles: { cellPadding: 4 },
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
      doc.text("FORMAT CATATAN PERKEMBANGAN MURID", centerX, yPos, {
        align: "center",
      });
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
      head: [
        [
          "Aspek Pemantauan",
          "Deskripsi Perkembangan",
          "Tindak Lanjut yang Dilakukan",
          "Keterangan Tambahan",
        ],
      ],
      body: [
        [
          "Akademik",
          journal.academicDesc || "-",
          journal.academicAction || "-",
          "",
        ],
        [
          "Karakter",
          journal.characterDesc || "-",
          journal.characterAction || "-",
          "",
        ],
        [
          "Sosial-Emosional",
          journal.socialEmotionalDesc || "-",
          journal.socialEmotionalAction || "-",
          "",
        ],
        [
          "Kedisiplinan",
          journal.disciplineDesc || "-",
          journal.disciplineAction || "-",
          "",
        ],
        [
          "Potensi & Minat",
          journal.potentialInterestDesc || "-",
          journal.potentialInterestAction || "-",
          "",
        ],
      ],
      theme: "grid",
      headStyles: {
        fillColor: COLORS.tableHeader,
        textColor: COLORS.black,
        fontSize: FONTS.table,
        fontStyle: "bold",
        font: "times",
      },
      bodyStyles: { fontSize: FONTS.table - 1, font: "times", valign: "top" },
      columnStyles: {
        0: { cellWidth: USABLE_WIDTH * 0.2 },
        1: { cellWidth: USABLE_WIDTH * 0.35 },
        2: { cellWidth: USABLE_WIDTH * 0.3 },
        3: { cellWidth: USABLE_WIDTH * 0.15 },
      },
      margin: { left: MARGINS.left, right: MARGINS.right },
      styles: { cellPadding: 4, minCellHeight: 50 },
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
  doc.text("LAMPIRAN C: FORMAT REKAP PERTEMUAN DENGAN MURID", centerX, yPos, {
    align: "center",
  });
  yPos += FONTS.heading * 2;

  // Individual Meeting Records Table (6 columns)
  autoTable(doc, {
    startY: yPos,
    head: [
      [
        "No.",
        "Tanggal\nPertemuan",
        "Nama Murid",
        "Topik atau\nMasalah yang\nDibahas",
        "Tindak\nLanjut",
        "Keterangan",
      ],
    ],
    body: meetingRecords.map((record, idx) => [
      (idx + 1).toString(),
      record.tanggal,
      record.namaMurid,
      record.topikMasalah,
      record.tindakLanjut,
      record.keterangan,
    ]),
    theme: "grid",
    headStyles: {
      fillColor: COLORS.tableHeader,
      textColor: COLORS.black,
      fontSize: FONTS.table,
      fontStyle: "bold",
      font: "times",
      halign: "center",
      valign: "middle",
    },
    bodyStyles: {
      fontSize: FONTS.table - 1,
      font: "times",
      valign: "top",
    },
    columnStyles: {
      0: { cellWidth: USABLE_WIDTH * 0.08, halign: "center" }, // No.
      1: { cellWidth: USABLE_WIDTH * 0.15, halign: "center" }, // Tanggal
      2: { cellWidth: USABLE_WIDTH * 0.17 }, // Nama Murid
      3: { cellWidth: USABLE_WIDTH * 0.25 }, // Topik/Masalah
      4: { cellWidth: USABLE_WIDTH * 0.2 }, // Tindak Lanjut
      5: { cellWidth: USABLE_WIDTH * 0.15 }, // Keterangan
    },
    margin: { left: MARGINS.left, right: MARGINS.right },
    styles: { cellPadding: 4, minCellHeight: 15 },
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
  nipNuptk: string,
  meetingSummary?: MeetingSummaryEntry[],
): void {
  doc.addPage();
  addDecorativeCorners(doc);
  let yPos = MARGINS.top;
  const centerX = PAPER.LEGAL.width / 2;

  // Title - 14pt bold
  doc.setFontSize(FONTS.heading);
  doc.setFont("times", "bold");
  doc.text("LAMPIRAN D: FORMAT PELAPORAN SEMESTER GURU WALI", centerX, yPos, {
    align: "center",
  });
  yPos += FONTS.heading * 2;

  // Header Info
  doc.setFontSize(FONTS.body);
  doc.setFont("times", "bold");
  doc.text("Nama Guru Wali", MARGINS.left, yPos);
  doc.setFont("times", "normal");
  doc.text(`: ${teacherName}`, MARGINS.left + 130, yPos);
  yPos += FONTS.body * LINE_SPACING;

  doc.setFont("times", "bold");
  const kelasMurid =
    students.length > 0
      ? `Kelas ${students[0]?.class || "7"} - ${students.length} Siswa`
      : `${students.length} Siswa`;
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
    head: [
      [
        "Bulan",
        "Jumlah Pertemuan",
        "Format (Individu/Kelompok)",
        "Persentase Kehadiran",
      ],
    ],
    body:
      meetingSummary && meetingSummary.length > 0
        ? meetingSummary.map((m) => [
            m.bulan,
            m.jumlah.toString(),
            m.format,
            m.persentase,
          ])
        : [
            ["Juli", "2", "Individual", "100%"],
            ["Agustus", "3", "Kelompok", "90%"],
          ],
    theme: "grid",
    headStyles: {
      fillColor: COLORS.tableHeader,
      textColor: COLORS.black,
      fontSize: FONTS.table,
      fontStyle: "bold",
      font: "times",
    },
    bodyStyles: { fontSize: FONTS.table - 1, font: "times" },
    margin: { left: MARGINS.left, right: MARGINS.right },
    styles: { cellPadding: 4 },
  });

  yPos = (doc as any).lastAutoTable.finalY + FONTS.body * 2;

  // Section 2: Catatan Perkembangan Umum
  yPos = checkPageBreak(doc, yPos, 150);
  doc.setFont("times", "bold");
  doc.text("2. Catatan Perkembangan Umum", MARGINS.left, yPos);
  yPos += FONTS.body * LINE_SPACING;

  doc.setFont("times", "normal");
  const paragraph1 = doc.splitTextToSize(
    `Selama ${semester} ${academicYear}, secara keseluruhan murid dampingan menunjukkan perkembangan yang positif dalam berbagai aspek. Dari sisi akademik, sebagian besar murid mampu mengikuti pembelajaran dengan baik meskipun masih ada beberapa yang memerlukan bimbingan khusus pada mata pelajaran tertentu.`,
    USABLE_WIDTH,
  );
  doc.text(paragraph1, MARGINS.left, yPos);
  yPos += paragraph1.length * FONTS.body * LINE_SPACING;

  const paragraph2 = doc.splitTextToSize(
    "Dalam aspek pembentukan karakter, murid menunjukkan peningkatan dalam hal kedisiplinan, tanggung jawab, dan kemampuan bersosialisasi. Nilai-nilai seperti kejujuran dan empati mulai tertanam dengan baik melalui pendampingan berkelanjutan yang dilakukan.",
    USABLE_WIDTH,
  );
  doc.text(paragraph2, MARGINS.left, yPos);
  yPos += paragraph2.length * FONTS.body * LINE_SPACING;

  const paragraph3 = doc.splitTextToSize(
    "Perkembangan sosial-emosional murid juga menunjukkan tren positif, dengan meningkatnya kemampuan mereka dalam mengelola emosi dan membangun hubungan yang sehat dengan teman sebaya maupun guru. Beberapa murid yang sebelumnya cenderung pendiam mulai lebih aktif berpartisipasi dalam kegiatan kelompok.",
    USABLE_WIDTH,
  );
  doc.text(paragraph3, MARGINS.left, yPos);
  yPos += paragraph3.length * FONTS.body * LINE_SPACING;

  // Section 3: Rekomendasi Tindak Lanjut
  yPos = checkPageBreak(doc, yPos, 150);
  doc.setFont("times", "bold");
  doc.text("3. Rekomendasi Tindak Lanjut", MARGINS.left, yPos);
  yPos += FONTS.body * LINE_SPACING;

  doc.setFont("times", "normal");
  const intro = doc.splitTextToSize(
    "Berdasarkan hasil pemantauan selama semester ini, berikut adalah rekomendasi untuk semester berikutnya:",
    USABLE_WIDTH,
  );
  doc.text(intro, MARGINS.left, yPos);
  yPos += intro.length * FONTS.body * LINE_SPACING;

  const recs = [
    "a. Akademik: Perlu dilakukan program remedial khusus bagi murid yang masih mengalami kesulitan di mata pelajaran tertentu, serta pengayaan bagi murid yang sudah menunjukkan prestasi baik.",
    "b. Karakter: Melanjutkan program pembinaan karakter dengan fokus pada penguatan nilai-nilai integritas dan kepemimpinan. Libatkan murid dalam kegiatan yang melatih tanggung jawab dan kemandirian.",
    "c. Sosial-Emosional: Tingkatkan program peer support dan mentoring untuk membantu murid yang masih memerlukan dukungan dalam berinteraksi sosial. Adakan sesi sharing berkala untuk memperkuat bonding antar murid.",
    "d. Kolaborasi: Perluas koordinasi dengan orang tua melalui pertemuan rutin dan komunikasi intensif untuk memastikan konsistensi pendampingan di rumah dan sekolah.",
  ];

  recs.forEach((rec) => {
    yPos = checkPageBreak(doc, yPos, 50);
    const recLines = doc.splitTextToSize(rec, USABLE_WIDTH);
    doc.text(recLines, MARGINS.left, yPos);
    yPos += recLines.length * FONTS.body * LINE_SPACING;
  });

  // Add formal signature section (without Kepsek column)
  yPos += FONTS.body * LINE_SPACING * 2; // 2 blank lines
  yPos = checkPageBreak(doc, yPos, 100); // Ensure space for signature

  doc.setFontSize(FONTS.body);
  doc.setFont("times", "normal");

  // Location and date on the right
  const today = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const rightX = PAPER.LEGAL.width - MARGINS.right - 150;
  doc.text(`....................., ${today}`, rightX, yPos);
  yPos += FONTS.body * LINE_SPACING;

  doc.setFont("times", "bold");
  doc.text("Guru Wali,", rightX, yPos);
  yPos += FONTS.body * LINE_SPACING * 4; // Space for signature

  doc.setFont("times", "normal");
  doc.text(teacherName, rightX, yPos);
  yPos += FONTS.body * LINE_SPACING;
  doc.text(`NIP/NUPTK: ${nipNuptk || "-"}`, rightX, yPos);
}

// NOTE: Signature section removed - now integrated at end of Lampiran D
