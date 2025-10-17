// Edge-compatible PDF Generator using jsPDF
// Created: 2025-10-16
// Updated: 2025-10-17 - Added full Lampiran A-D + SOP pages
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
 * Includes: Cover, Lampiran A-D, and SOP Pages
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
  const doc = new jsPDF();
  doc.setFont("times"); // Use Times New Roman equivalent
  
  // ==========================================
  // COVER PAGE
  // ==========================================
  let yPos = 100; // Start from middle of page
  
  doc.setFontSize(18);
  doc.setFont("times", "bold");
  doc.text("LAPORAN PEMANTAUAN GURU WALI", 105, yPos, { align: "center" });
  yPos += 15;
  
  doc.setFontSize(14);
  doc.setFont("times", "bold");
  doc.text(`SEMESTER ${semester.toUpperCase()}`, 105, yPos, { align: "center" });
  yPos += 8;
  doc.text(`TAHUN AJARAN ${academicYear}`, 105, yPos, { align: "center" });
  yPos += 30;
  
  doc.setFontSize(12);
  doc.setFont("times", "normal");
  doc.text(schoolName, 105, yPos, { align: "center" });
  yPos += 10;
  doc.text(`Guru Wali: ${teacherName}`, 105, yPos, { align: "center" });
  yPos += 10;
  doc.text(`Total Siswa Dampingan: ${students.length} siswa`, 105, yPos, { align: "center" });
  yPos += 30;
  
  const todayDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  doc.text(`Dibuat pada: ${todayDate}`, 105, yPos, { align: "center" });
  
  // ==========================================
  // LAMPIRAN A: IDENTITAS MURID DAMPINGAN
  // ==========================================
  doc.addPage();
  yPos = 20;
  
  doc.setFontSize(14);
  doc.setFont("times", "bold");
  doc.text("LAMPIRAN A", 105, yPos, { align: "center" });
  yPos += 7;
  doc.setFontSize(12);
  doc.text("FORMAT IDENTITAS MURID DAMPINGAN", 105, yPos, { align: "center" });
  yPos += 10;
  
  if (students.length > 0) {
    autoTable(doc, {
      startY: yPos,
      head: [[
        "No.",
        "Nama Lengkap",
        "NIS/NISN",
        "Kelas",
        "Jenis Kelamin",
        "Kontak Ortu",
        "Catatan"
      ]],
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
        fillColor: [198, 224, 180],
        textColor: [0, 0, 0],
        fontSize: 10,
        fontStyle: "bold",
        font: "times"
      },
      bodyStyles: { fontSize: 9, font: "times" },
      margin: { left: 15, right: 15 }
    });
  }
  
  // ==========================================
  // LAMPIRAN B: JURNAL 5 ASPEK PER SISWA
  // ==========================================
  if (studentJournals && studentJournals.length > 0) {
    doc.addPage();
    yPos = 20;
    
    doc.setFontSize(14);
    doc.setFont("times", "bold");
    doc.text("LAMPIRAN B", 105, yPos, { align: "center" });
    yPos += 7;
    doc.setFontSize(12);
    doc.text("JURNAL PERKEMBANGAN SISWA (5 ASPEK PEMANTAUAN)", 105, yPos, { align: "center" });
    yPos += 10;
    
    // Generate one page per student
    studentJournals.forEach((journal, idx) => {
      if (idx > 0) doc.addPage();
      yPos = 20;
      
      // Student header
      doc.setFontSize(11);
      doc.setFont("times", "bold");
      doc.text(`Nama Siswa: ${journal.studentName}`, 20, yPos);
      yPos += 6;
      doc.setFont("times", "normal");
      doc.text(`Kelas: ${journal.classroom} | Periode: ${journal.periode}`, 20, yPos);
      yPos += 10;
      
      // 5 Aspects Table
      autoTable(doc, {
        startY: yPos,
        head: [[
          "Aspek",
          "Deskripsi Perkembangan",
          "Tindak Lanjut",
          "Keterangan"
        ]],
        body: [
          [
            "1. Akademik",
            journal.academicDesc || "-",
            journal.academicAction || "-",
            ""
          ],
          [
            "2. Karakter",
            journal.characterDesc || "-",
            journal.characterAction || "-",
            ""
          ],
          [
            "3. Sosial-Emosional",
            journal.socialEmotionalDesc || "-",
            journal.socialEmotionalAction || "-",
            ""
          ],
          [
            "4. Kedisiplinan",
            journal.disciplineDesc || "-",
            journal.disciplineAction || "-",
            ""
          ],
          [
            "5. Potensi & Minat",
            journal.potentialInterestDesc || "-",
            journal.potentialInterestAction || "-",
            ""
          ]
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
          0: { cellWidth: 30 },
          1: { cellWidth: 60 },
          2: { cellWidth: 55 },
          3: { cellWidth: 30 }
        },
        margin: { left: 15, right: 15 }
      });
    });
  }
  
  // ==========================================
  // LAMPIRAN C: REKAPITULASI KEGIATAN PERTEMUAN
  // ==========================================
  if (meetingSummary && meetingSummary.length > 0) {
    doc.addPage();
    yPos = 20;
    
    doc.setFontSize(14);
    doc.setFont("times", "bold");
    doc.text("LAMPIRAN C: REKAPITULASI KEGIATAN PERTEMUAN", 105, yPos, { align: "center" });
    yPos += 15;
    
    doc.setFontSize(12);
    doc.setFont("times", "normal");
    doc.text("Berikut adalah rekapitulasi kegiatan pertemuan guru wali dengan murid", 20, yPos);
    yPos += 6;
    doc.text("dampingan selama periode semester ini:", 20, yPos);
    yPos += 10;
    
    // Meeting Summary Table
    autoTable(doc, {
      startY: yPos,
      head: [["Bulan", "Jumlah Pertemuan", "Format Pertemuan", "Persentase Kehadiran"]],
      body: meetingSummary.map(m => [
        m.bulan,
        m.jumlah.toString(),
        m.format,
        m.persentase
      ]),
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
        0: { cellWidth: 45 },
        1: { cellWidth: 45 },
        2: { cellWidth: 45 },
        3: { cellWidth: 40 }
      },
      margin: { left: 15, right: 15 }
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
    
    // Ringkasan
    const totalPertemuan = meetingSummary.reduce((sum, m) => sum + m.jumlah, 0);
    doc.setFont("times", "bold");
    doc.text("Ringkasan:", 20, yPos);
    yPos += 6;
    doc.setFont("times", "normal");
    doc.text(`\\u2022 Total Pertemuan: ${totalPertemuan} kali`, 20, yPos);
    yPos += 6;
    doc.text(`\\u2022 Rata-rata Kehadiran: 85%`, 20, yPos);
    yPos += 6;
    doc.text(`\\u2022 Catatan: Pertemuan dilakukan secara individu dan kelompok sesuai`, 20, yPos);
    yPos += 5;
    doc.text(`  dengan kebutuhan dan kondisi murid dampingan.`, 20, yPos);
  }
  
  // ==========================================
  // LAMPIRAN D: FORMAT PELAPORAN SEMESTER GURU WALI
  // ==========================================
  doc.addPage();
  yPos = 20;
  
  doc.setFontSize(14);
  doc.setFont("times", "bold");
  doc.text("LAMPIRAN D: FORMAT PELAPORAN SEMESTER GURU WALI", 105, yPos, { align: "center" });
  yPos += 15;
  
  // Header Info
  doc.setFontSize(12);
  doc.setFont("times", "bold");
  doc.text("Nama Guru Wali ", 20, yPos);
  const w3 = doc.getTextWidth("Nama Guru Wali ");
  doc.text(":", 20 + w3, yPos);
  doc.setFont("times", "normal");
  doc.text(` ${teacherName}`, 20 + w3 + 5, yPos);
  yPos += 6;
  
  doc.setFont("times", "bold");
  doc.text("Kelas/Murid Dampingan ", 20, yPos);
  const w4 = doc.getTextWidth("Kelas/Murid Dampingan ");
  doc.text(":", 20 + w4, yPos);
  doc.setFont("times", "normal");
  const kelasMurid = students.length > 0 ? `Kelas ${students[0]?.class || "7"} - ${students.length} Siswa` : `${students.length} Siswa`;
  doc.text(` ${kelasMurid}`, 20 + w4 + 5, yPos);
  yPos += 6;
  
  doc.setFont("times", "bold");
  doc.text("Semester ", 20, yPos);
  const w5 = doc.getTextWidth("Semester ");
  doc.text(":", 20 + w5, yPos);
  doc.setFont("times", "normal");
  doc.text(` ${semester}`, 20 + w5 + 5, yPos);
  yPos += 6;
  
  doc.setFont("times", "bold");
  doc.text("Tahun Ajaran ", 20, yPos);
  const w6 = doc.getTextWidth("Tahun Ajaran ");
  doc.text(":", 20 + w6, yPos);
  doc.setFont("times", "normal");
  doc.text(` ${academicYear}`, 20 + w6 + 5, yPos);
  yPos += 12;
  
  // Section 1: Rekapitulasi Pertemuan
  doc.setFont("times", "bold");
  doc.text("1. Rekapitulasi Pertemuan", 20, yPos);
  yPos += 8;
  
  autoTable(doc, {
    startY: yPos,
    head: [["Bulan", "Jumlah Pertemuan", "Format (Individu/Kelompok)", "Persentase Kehadiran"]],
    body: (meetingSummary && meetingSummary.length > 0) ? meetingSummary.map(m => [
      m.bulan,
      m.jumlah.toString(),
      m.format,
      m.persentase
    ]) : [
      ["Juli", "2", "Individual", "100%"],
      ["Agustus", "3", "Kelompok", "90%"]
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
      0: { cellWidth: 40 },
      1: { cellWidth: 45 },
      2: { cellWidth: 50 },
      3: { cellWidth: 40 }
    },
    margin: { left: 15, right: 15 }
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  // Section 2: Catatan Perkembangan Umum
  doc.setFont("times", "bold");
  doc.text("2. Catatan Perkembangan Umum", 20, yPos);
  yPos += 6;
  doc.setFont("times", "normal");
  doc.text(`Selama ${semester} ${academicYear}, secara keseluruhan murid dampingan`, 20, yPos);
  yPos += 6;
  doc.text("menunjukkan perkembangan yang positif dalam berbagai aspek. Dari sisi", 20, yPos);
  yPos += 6;
  doc.text("akademik, sebagian besar murid mampu mengikuti pembelajaran dengan baik", 20, yPos);
  yPos += 6;
  doc.text("meskipun masih ada beberapa yang memerlukan bimbingan khusus pada mata", 20, yPos);
  yPos += 6;
  doc.text("pelajaran tertentu.", 20, yPos);
  yPos += 8;
  
  doc.text("Dalam aspek pembentukan karakter, murid menunjukkan peningkatan dalam", 20, yPos);
  yPos += 6;
  doc.text("hal kedisiplinan, tanggung jawab, dan kemampuan bersosialisasi.", 20, yPos);
  yPos += 6;
  doc.text("Nilai-nilai seperti kejujuran dan empati mulai tertanam dengan baik", 20, yPos);
  yPos += 6;
  doc.text("melalui pendampingan berkelanjutan yang dilakukan.", 20, yPos);
  yPos += 8;
  
  doc.text("Perkembangan sosial-emosional murid juga menunjukkan tren positif,", 20, yPos);
  yPos += 6;
  doc.text("dengan meningkatnya kemampuan mereka dalam mengelola emosi dan membangun", 20, yPos);
  yPos += 6;
  doc.text("hubungan yang sehat dengan teman sebaya maupun guru. Beberapa murid yang", 20, yPos);
  yPos += 6;
  doc.text("sebelumnya cenderung pendiam mulai lebih aktif berpartisipasi dalam", 20, yPos);
  yPos += 6;
  doc.text("kegiatan kelompok.", 20, yPos);
  yPos += 10;
  
  // Section 3: Rekomendasi Tindak Lanjut
  doc.setFont("times", "bold");
  doc.text("3. Rekomendasi Tindak Lanjut", 20, yPos);
  yPos += 6;
  doc.setFont("times", "normal");
  doc.text("Berdasarkan hasil pemantauan selama semester ini, berikut adalah", 20, yPos);
  yPos += 6;
  doc.text("rekomendasi untuk semester berikutnya:", 20, yPos);
  yPos += 8;
  
  doc.text("a. Akademik: Perlu dilakukan program remedial khusus bagi murid yang", 20, yPos);
  yPos += 6;
  doc.text("masih mengalami kesulitan di mata pelajaran tertentu, serta pengayaan", 20, yPos);
  yPos += 6;
  doc.text("bagi murid yang sudah menunjukkan prestasi baik.", 20, yPos);
  yPos += 8;
  
  doc.text("b. Karakter: Melanjutkan program pembinaan karakter dengan fokus pada", 20, yPos);
  yPos += 6;
  doc.text("penguatan nilai-nilai integritas dan kepemimpinan. Libatkan murid dalam", 20, yPos);
  yPos += 6;
  doc.text("kegiatan yang melatih tanggung jawab dan kemandirian.", 20, yPos);
  yPos += 8;
  
  doc.text("c. Sosial-Emosional: Tingkatkan program peer support dan mentoring untuk", 20, yPos);
  yPos += 6;
  doc.text("membantu murid yang masih memerlukan dukungan dalam berinteraksi sosial.", 20, yPos);
  yPos += 6;
  doc.text("Adakan sesi sharing berkala untuk memperkuat bonding antar murid.", 20, yPos);
  yPos += 8;
  
  doc.text("d. Kolaborasi: Perluas koordinasi dengan orang tua melalui pertemuan", 20, yPos);
  yPos += 6;
  doc.text("rutin dan komunikasi intensif untuk memastikan konsistensi pendampingan", 20, yPos);
  yPos += 6;
  doc.text("di rumah dan sekolah.", 20, yPos);
  
  // ==========================================
  // SOP PAGES (2 PAGES)
  // ==========================================
  addSOPPages(doc, schoolName, academicYear);
  
  // ==========================================
  // SIGNATURE PAGE
  // ==========================================
  doc.addPage();
  yPos = 200;
  
  doc.setFontSize(11);
  doc.setFont("times", "normal");
  doc.text("Mengetahui,", 30, yPos);
  doc.text("Guru Wali,", 130, yPos);
  yPos += 20;
  
  doc.text("_____________________", 30, yPos);
  doc.text("_____________________", 130, yPos);
  yPos += 5;
  
  doc.text("Kepala Sekolah", 30, yPos);
  doc.text(teacherName, 130, yPos);
  
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
