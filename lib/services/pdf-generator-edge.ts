// Edge-compatible PDF Generator using jsPDF
// Created: 2025-10-16
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
  
  // === JOURNALS TABLE ===
  if (journals.length > 0) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("JURNAL BULANAN", 20, yPos);
    yPos += 5;
    
    autoTable(doc, {
      startY: yPos,
      head: [["Bulan", "Akademik", "Sosial", "Emosional", "Fisik", "Spiritual"]],
      body: journals.map(j => [
        `${j.month} ${j.year}`,
        j.academicProgress.substring(0, 30) + "...",
        j.socialBehavior.substring(0, 30) + "...",
        j.emotionalState.substring(0, 30) + "...",
        j.physicalHealth.substring(0, 30) + "...",
        j.spiritualDevelopment.substring(0, 30) + "..."
      ]),
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185], fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 30 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 },
        5: { cellWidth: 30 }
      }
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
 * Generate Semester Report PDF
 */
export function generateSemesterReportPDF(
  students: StudentData[],
  teacherName: string,
  schoolName: string,
  semester: string,
  academicYear: string
): Uint8Array {
  const doc = new jsPDF();
  
  doc.setFont("helvetica");
  let yPos = 20;
  
  // === HEADER ===
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("LAPORAN SEMESTER", 105, yPos, { align: "center" });
  yPos += 10;
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(schoolName, 105, yPos, { align: "center" });
  yPos += 7;
  doc.text(`${semester} - Tahun Ajaran ${academicYear}`, 105, yPos, { align: "center" });
  yPos += 15;
  
  // === SUMMARY ===
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("RINGKASAN", 20, yPos);
  yPos += 7;
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Total Siswa: ${students.length}`, 20, yPos);
  yPos += 6;
  doc.text(`Guru Wali: ${teacherName}`, 20, yPos);
  yPos += 12;
  
  // === STUDENTS TABLE ===
  if (students.length > 0) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("DAFTAR SISWA", 20, yPos);
    yPos += 5;
    
    autoTable(doc, {
      startY: yPos,
      head: [["No", "NISN", "Nama", "Kelas", "Jenis Kelamin"]],
      body: students.map((s, idx) => [
        (idx + 1).toString(),
        s.nisn,
        s.name,
        s.class,
        s.gender
      ]),
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185], fontSize: 10 },
      bodyStyles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 35 },
        2: { cellWidth: 60 },
        3: { cellWidth: 30 },
        4: { cellWidth: 35 }
      }
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
  }
  
  // === FOOTER ===
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
