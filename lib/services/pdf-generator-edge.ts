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
  // LAMPIRAN C: REKAPITULASI
  // ==========================================
  doc.addPage();
  yPos = 20;
  
  doc.setFontSize(14);
  doc.setFont("times", "bold");
  doc.text("LAMPIRAN C", 105, yPos, { align: "center" });
  yPos += 7;
  doc.setFontSize(12);
  doc.text("REKAPITULASI PEMANTAUAN SISWA", 105, yPos, { align: "center" });
  yPos += 15;
  
  doc.setFontSize(11);
  doc.setFont("times", "bold");
  doc.text("RINGKASAN STATISTIK", 20, yPos);
  yPos += 8;
  
  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.text(`Total Siswa Dampingan: ${students.length} siswa`, 20, yPos);
  yPos += 6;
  doc.text(`Siswa dengan Jurnal Lengkap: ${studentJournals?.length || 0} siswa`, 20, yPos);
  yPos += 6;
  doc.text(`Persentase Kelengkapan: ${students.length > 0 ? Math.round(((studentJournals?.length || 0) / students.length) * 100) : 0}%`, 20, yPos);
  yPos += 15;
  
  // Summary table
  autoTable(doc, {
    startY: yPos,
    head: [["Kategori", "Jumlah", "Persentase"]],
    body: [
      ["Siswa Dinilai", (studentJournals?.length || 0).toString(), `${students.length > 0 ? Math.round(((studentJournals?.length || 0) / students.length) * 100) : 0}%`],
      ["Siswa Belum Dinilai", (students.length - (studentJournals?.length || 0)).toString(), `${students.length > 0 ? Math.round(((students.length - (studentJournals?.length || 0)) / students.length) * 100) : 0}%`],
      ["Total Siswa", students.length.toString(), "100%"]
    ],
    theme: "grid",
    headStyles: { 
      fillColor: [198, 224, 180],
      fontSize: 10,
      fontStyle: "bold",
      font: "times"
    },
    bodyStyles: { fontSize: 9, font: "times" },
    margin: { left: 15, right: 15 }
  });
  
  // ==========================================
  // LAMPIRAN D: RINGKASAN PERTEMUAN
  // ==========================================
  if (meetingSummary && meetingSummary.length > 0) {
    doc.addPage();
    yPos = 20;
    
    doc.setFontSize(14);
    doc.setFont("times", "bold");
    doc.text("LAMPIRAN D", 105, yPos, { align: "center" });
    yPos += 7;
    doc.setFontSize(12);
    doc.text("RINGKASAN LOG PERTEMUAN", 105, yPos, { align: "center" });
    yPos += 10;
    
    autoTable(doc, {
      startY: yPos,
      head: [["Bulan", "Jumlah Pertemuan", "Format", "Persentase"]],
      body: meetingSummary.map(m => [
        m.bulan,
        m.jumlah.toString(),
        m.format,
        m.persentase
      ]),
      theme: "grid",
      headStyles: { 
        fillColor: [198, 224, 180],
        fontSize: 10,
        fontStyle: "bold",
        font: "times"
      },
      bodyStyles: { fontSize: 9, font: "times" },
      margin: { left: 15, right: 15 }
    });
  }
  
  // ==========================================
  // SOP PAGES (12 PAGES)
  // ==========================================
  addSOPPages(doc);
  
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
 * Add SOP Pages (12 pages of procedural guidelines)
 */
function addSOPPages(doc: jsPDF) {
  const sopContent = [
    {
      title: "SOP 1: PEMANTAUAN RUTIN",
      content: [
        "1. Lakukan pemantauan siswa minimal 1x per bulan",
        "2. Dokumentasikan dalam jurnal 5 aspek",
        "3. Fokus pada perkembangan akademik dan non-akademik",
        "4. Identifikasi siswa yang membutuhkan perhatian khusus",
        "5. Koordinasi dengan wali kelas dan guru mata pelajaran"
      ]
    },
    {
      title: "SOP 2: PERTEMUAN DENGAN SISWA",
      content: [
        "1. Jadwalkan pertemuan individual minimal 1x per semester",
        "2. Buat catatan pertemuan yang detail",
        "3. Dengarkan aktif kebutuhan dan keluhan siswa",
        "4. Berikan bimbingan sesuai kebutuhan",
        "5. Follow up hasil pertemuan"
      ]
    },
    {
      title: "SOP 3: KOMUNIKASI ORANG TUA",
      content: [
        "1. Lakukan komunikasi rutin dengan orang tua",
        "2. Sampaikan perkembangan siswa secara berkala",
        "3. Diskusikan kendala dan solusi bersama",
        "4. Dokumentasikan hasil komunikasi",
        "5. Koordinasi untuk penanganan kasus khusus"
      ]
    },
    {
      title: "SOP 4: PENANGANAN KASUS",
      content: [
        "1. Identifikasi kasus yang memerlukan intervensi",
        "2. Lakukan assessment awal",
        "3. Buat rencana tindak lanjut",
        "4. Koordinasi dengan pihak terkait (BK, Orang Tua)",
        "5. Monitoring dan evaluasi berkala"
      ]
    },
    {
      title: "SOP 5: DOKUMENTASI",
      content: [
        "1. Catat semua aktivitas pemantauan secara sistematis",
        "2. Gunakan template yang tersedia",
        "3. Update jurnal secara berkala",
        "4. Simpan dokumen dengan rapi",
        "5. Backup data secara rutin"
      ]
    },
    {
      title: "SOP 6: PELAPORAN",
      content: [
        "1. Buat laporan semester secara lengkap",
        "2. Sertakan data statistik dan analisis",
        "3. Dokumentasikan best practices",
        "4. Identifikasi area perbaikan",
        "5. Submit laporan tepat waktu"
      ]
    },
    {
      title: "SOP 7: KOORDINASI TIM",
      content: [
        "1. Koordinasi dengan guru mata pelajaran",
        "2. Kolaborasi dengan guru BK",
        "3. Komunikasi dengan wali kelas",
        "4. Rapat koordinasi berkala",
        "5. Sharing best practices"
      ]
    },
    {
      title: "SOP 8: PENGEMBANGAN DIRI",
      content: [
        "1. Ikuti pelatihan dan workshop",
        "2. Update knowledge tentang psikologi remaja",
        "3. Pelajari teknik konseling dasar",
        "4. Refleksi diri berkala",
        "5. Continuous improvement"
      ]
    },
    {
      title: "SOP 9: ETIKA PROFESI",
      content: [
        "1. Jaga kerahasiaan data siswa",
        "2. Bersikap profesional dan objektif",
        "3. Hindari konflik kepentingan",
        "4. Hormati hak siswa dan orang tua",
        "5. Patuhi kode etik guru"
      ]
    },
    {
      title: "SOP 10: EVALUASI PROGRAM",
      content: [
        "1. Lakukan evaluasi program secara berkala",
        "2. Kumpulkan feedback dari siswa dan orang tua",
        "3. Analisis efektivitas program",
        "4. Identifikasi area perbaikan",
        "5. Implement continuous improvement"
      ]
    },
    {
      title: "SOP 11: EMERGENCY PROTOCOL",
      content: [
        "1. Identifikasi situasi darurat",
        "2. Segera laporkan ke pihak terkait",
        "3. Berikan first aid jika diperlukan",
        "4. Koordinasi dengan orang tua",
        "5. Dokumentasikan kejadian"
      ]
    },
    {
      title: "SOP 12: REFERRAL SYSTEM",
      content: [
        "1. Identifikasi kasus yang perlu dirujuk",
        "2. Koordinasi dengan guru BK atau psikolog",
        "3. Sampaikan data pendukung lengkap",
        "4. Follow up hasil rujukan",
        "5. Dokumentasikan proses rujukan"
      ]
    }
  ];
  
  sopContent.forEach((sop, idx) => {
    doc.addPage();
    let yPos = 30;
    
    // SOP Title
    doc.setFontSize(14);
    doc.setFont("times", "bold");
    doc.text(sop.title, 105, yPos, { align: "center" });
    yPos += 15;
    
    // SOP Content
    doc.setFontSize(11);
    doc.setFont("times", "normal");
    sop.content.forEach(line => {
      doc.text(line, 20, yPos);
      yPos += 8;
    });
  });
}
