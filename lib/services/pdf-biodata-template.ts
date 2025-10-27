// Biodata PDF Generator - Exact Template Match
// Created: 2025-10-22
// Template: D:\Code\docs\BioSiswa123.png

import { jsPDF } from "jspdf";

export interface StudentBiodataData {
  fullName: string;
  nis: string | null;
  nisn: string | null;
  classroom: string | null;
  gender: "L" | "P" | null;
  birthPlace: string | null;
  birthDate: string | null;
  religion: string | null;
  bloodType: string | null;
  economicStatus: string | null;
  address: string | null;
  phoneNumber: string | null;
  dream: string | null;
  extracurricular: string | null;
  hobby: string | null;
  photoUrl: string | null;
  parentName: string | null;
  parentContact: string | null;
  fatherName: string | null;
  fatherJob: string | null;
  fatherIncome: number | null;
  motherName: string | null;
  motherJob: string | null;
  motherIncome: number | null;
  healthHistoryPast: string | null;
  healthHistoryCurrent: string | null;
  healthHistoryOften: string | null;
  characterStrength: string | null;
  characterImprovement: string | null;
  specialNotes: string | null;
  socialUsages: Array<{
    platform: string;
    username: string | null;
    isActive: boolean;
  }>;
}

/**
 * Generate Biodata PDF matching exact template layout
 * Template reference: BioSiswa123.png
 */
export async function generateBiodataPDF(
  student: StudentBiodataData,
  schoolName: string,
  teacherName: string,
  academicYear: string,
): Promise<Uint8Array> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Colors from template (as tuples for jsPDF) - EXACT MATCH
  const TEAL: [number, number, number] = [0, 140, 140];
  const ORANGE: [number, number, number] = [235, 125, 70];
  const CREAM: [number, number, number] = [245, 230, 195];
  const BLACK: [number, number, number] = [0, 0, 0];
  const GRAY: [number, number, number] = [128, 128, 128];
  const ORANGE_STAR: [number, number, number] = [255, 165, 0];

  const pageWidth = 210; // A4 width in mm
  const margin = 7; // Reduced margin for wider frame (more lega)
  const usableWidth = pageWidth - 2 * margin;

  // Helper untuk display value
  const val = (v: string | number | null | undefined): string => {
    if (!v || v === "") return "";
    return String(v);
  };

  // === DECORATIVE HEADER - EXACT TEMPLATE MATCH ===
  // Shadow layer (darker teal)
  doc.setFillColor(0, 100, 100);
  doc.roundedRect(margin - 2, 4, usableWidth + 4, 50, 5, 5, "F");

  // Main teal header background
  doc.setFillColor(...TEAL);
  doc.roundedRect(margin, 6, usableWidth, 46, 4, 4, "F");

  // Cream banner inside (WIDER - more breathing room)
  doc.setFillColor(...CREAM);
  doc.roundedRect(margin + 2, 9, usableWidth - 4, 40, 3, 3, "F");

  // === DECORATIVE STARS (BIGGER & PROMINENT) ===
  doc.setFillColor(...ORANGE_STAR);

  // Top-left star
  const star1X = margin + 10;
  const star1Y = 18;
  const starSize = 9;
  doc.circle(star1X, star1Y, starSize, "F");
  doc.setFillColor(...CREAM);
  doc.circle(star1X, star1Y, starSize * 0.35, "F");

  // Bottom-right star (larger, more prominent)
  const star2X = pageWidth - margin - 10;
  const star2Y = 44;
  const star2Size = 10;
  doc.setFillColor(...ORANGE_STAR);
  doc.circle(star2X, star2Y, star2Size, "F");

  // === TITLE: "BIODATA PESERTA DIDIK" - Bebas Neue Style ===
  // Using helvetica-bold as Bebas Neue alternative (condensed, uppercase)
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BLACK);
  doc.setFontSize(70);
  doc.text("BIODATA", 14, 28);
  doc.setFontSize(46);
  doc.text("PESERTA DIDIK", 14, 41);

  // === "GURU WALI" label FIRST (di atas badges) - Arial style ===
  const guruWaliX = 165;
  doc.setFontSize(40);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BLACK);
  // Line spacing proper - 1 line between GURU and WALI
  doc.text("GURU", guruWaliX, 20, { align: "center" });
  doc.text("WALI", guruWaliX, 32, { align: "center" }); // +12mm spacing

  // === BADGES: SCHOOL NAME & TEACHER NAME (di bawah GURU WALI) ===
  const badgeX = 135;
  const badge1Y = 36; // Di bawah GURU WALI
  const badge2Y = 46; // Di bawah school badge
  const badgeWidth = 60;
  const badgeHeight = 8;

  // School name badge - Arial style (using helvetica)
  doc.setFillColor(...CREAM);
  doc.setDrawColor(...BLACK);
  doc.setLineWidth(0.4);
  doc.roundedRect(badgeX, badge1Y, badgeWidth, badgeHeight, 2, 2, "FD");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold"); // helvetica = Arial equivalent in jsPDF
  doc.setTextColor(...BLACK);
  doc.text(schoolName.toUpperCase(), badgeX + badgeWidth / 2, badge1Y + 5.5, {
    align: "center",
  });

  // Teacher name badge - Arial style (using helvetica)
  doc.setFillColor(...CREAM);
  doc.roundedRect(badgeX, badge2Y, badgeWidth, badgeHeight, 2, 2, "FD");
  doc.text(teacherName.toUpperCase(), badgeX + badgeWidth / 2, badge2Y + 5.5, {
    align: "center",
  });

  // === "TAHUN" - LARGE at bottom left - Arial style ===
  // Line spacing proper dengan text di atasnya
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BLACK);
  doc.text(`TAHUN ${academicYear}`, 14, 51); // Spacing better dari PESERTA DIDIK

  let yPos = 58; // Start content lebih bawah karena header lebih tinggi

  // === SECTION: DATA DIRI SISWA ===
  doc.setFillColor(...ORANGE);
  doc.rect(margin, yPos, usableWidth, 6, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("DATA DIRI SISWA", margin + 2, yPos + 4);

  yPos += 10;
  doc.setTextColor(...BLACK);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  // Photo box (kanan atas) - with border and student photo if available
  const photoX = pageWidth - margin - 28;
  const photoY = yPos;
  const photoW = 24;
  const photoH = 32;

  // Draw photo border
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.rect(photoX, photoY, photoW, photoH, "S");

  // Load and embed student photo from URL (DISABLED for now)
  const PHOTO_LOADING_ENABLED = false; // TODO: Enable after fixing fetch issues
  if (
    student.photoUrl &&
    student.photoUrl.trim() !== "" &&
    PHOTO_LOADING_ENABLED
  ) {
    try {
      // Fetch image from URL and convert to base64
      const response = await fetch(student.photoUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const base64String = btoa(String.fromCharCode(...uint8Array));

      // Determine image format from URL or content-type
      const contentType = response.headers.get("content-type") || "";
      let format = "JPEG"; // default
      if (
        contentType.includes("png") ||
        student.photoUrl.toLowerCase().includes(".png")
      ) {
        format = "PNG";
      } else if (
        contentType.includes("gif") ||
        student.photoUrl.toLowerCase().includes(".gif")
      ) {
        format = "GIF";
      }

      const dataUrl = `data:${contentType || "image/jpeg"};base64,${base64String}`;

      // Add image to PDF
      doc.addImage(
        dataUrl,
        format,
        photoX + 1,
        photoY + 1,
        photoW - 2,
        photoH - 2,
      );
    } catch (_error) {
      // Fallback to error placeholder if photo loading fails
      doc.setFillColor(255, 240, 240);
      doc.rect(photoX + 1, photoY + 1, photoW - 2, photoH - 2, "F");
      doc.setFontSize(6);
      doc.setTextColor(180, 70, 70);
      doc.text("Photo", photoX + photoW / 2, photoY + photoH / 2 - 1, {
        align: "center",
      });
      doc.text("Error", photoX + photoW / 2, photoY + photoH / 2 + 3, {
        align: "center",
      });
    }
  } else {
    // No photo - show placeholder
    doc.setFillColor(235, 235, 235);
    doc.rect(photoX + 1, photoY + 1, photoW - 2, photoH - 2, "F");
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text("Foto", photoX + photoW / 2, photoY + photoH / 2 - 3, {
      align: "center",
    });
    doc.text("Terbaru", photoX + photoW / 2, photoY + photoH / 2 + 1, {
      align: "center",
    });
    doc.text("3 x 4", photoX + photoW / 2, photoY + photoH / 2 + 5, {
      align: "center",
    });
  }

  // Fields
  const labelX = margin + 2;
  const underlineStart = margin + 50;
  const underlineEnd = photoX - 3;
  const lineHeight = 6;

  doc.setTextColor(...BLACK);

  // Row 1: Nama Lengkap
  doc.setFontSize(11); // Pertanyaan font 11
  doc.text(`Nama Lengkap :`, labelX, yPos);
  const namaValue = val(student.fullName);
  if (namaValue) {
    doc.setFontSize(10); // Jawaban font 10
    doc.text(namaValue, underlineStart + 2, yPos);
  } else {
    doc.line(underlineStart, yPos + 0.5, underlineEnd, yPos + 0.5);
  }
  yPos += lineHeight;

  // Row 2: NIS, NISN, No HP (3 columns) - no underline if has value
  const nisVal = val(student.nis);
  const nisnVal = val(student.nisn);
  const hpVal = val(student.phoneNumber);

  doc.setFontSize(11); // Pertanyaan font 11
  doc.text(`NIS :`, labelX, yPos);
  if (nisVal) {
    doc.setFontSize(10); // Jawaban font 10
    doc.text(nisVal, labelX + 12, yPos);
  } else {
    doc.text(`________`, labelX + 12, yPos);
  }

  doc.setFontSize(11); // Pertanyaan font 11
  doc.text(`NISN :`, labelX + 55, yPos);
  if (nisnVal) {
    doc.setFontSize(10); // Jawaban font 10
    doc.text(nisnVal, labelX + 68, yPos);
  } else {
    doc.text(`______________`, labelX + 68, yPos);
  }

  doc.setFontSize(11); // Pertanyaan font 11
  doc.text(`No HP :`, labelX + 120, yPos);
  if (hpVal) {
    doc.setFontSize(10); // Jawaban font 10
    doc.text(hpVal, labelX + 135, yPos);
  } else {
    doc.text(`______________`, labelX + 135, yPos);
  }
  yPos += lineHeight;

  // Row 3: Tempat & Tanggal Lahir - no underline if has value
  doc.setFontSize(11); // Pertanyaan font 11
  doc.text(`Tempat & Tanggal Lahir : `, labelX, yPos);
  const birthInfo =
    val(student.birthPlace) || val(student.birthDate)
      ? `${val(student.birthPlace)}${val(student.birthPlace) && val(student.birthDate) ? ", " : ""}${val(student.birthDate)}`
      : "";
  if (birthInfo) {
    doc.setFontSize(10); // Jawaban font 10
    doc.text(birthInfo, underlineStart + 12, yPos);
  } else {
    doc.line(underlineStart + 10, yPos + 0.5, underlineEnd, yPos + 0.5);
  }
  yPos += lineHeight;

  // Row 4: Jenis Kelamin (checkbox with clear checked state) + Agama
  doc.setFontSize(11); // Pertanyaan font 11
  doc.text(`Jenis Kelamin :`, labelX, yPos);
  const genderX = labelX + 30;

  // Checkbox Pria - FILLED if checked
  doc.setLineWidth(0.3);
  doc.rect(genderX, yPos - 3, 3, 3, "S");
  if (student.gender === "L") {
    doc.setFillColor(...BLACK);
    doc.rect(genderX + 0.3, yPos - 2.7, 2.4, 2.4, "F");
  }
  doc.setFontSize(10); // Jawaban font 10
  doc.text("Pria", genderX + 5, yPos);

  // Checkbox Wanita - FILLED if checked
  doc.rect(genderX + 20, yPos - 3, 3, 3, "S");
  if (student.gender === "P") {
    doc.setFillColor(...BLACK);
    doc.rect(genderX + 20.3, yPos - 2.7, 2.4, 2.4, "F");
  }
  doc.text("Wanita", genderX + 25, yPos);

  doc.setFontSize(11); // Pertanyaan font 11
  doc.text(`Agama : `, genderX + 45, yPos);
  const religionVal = val(student.religion);
  if (religionVal) {
    doc.setFontSize(10); // Jawaban font 10
    doc.text(religionVal, genderX + 60, yPos);
  } else {
    doc.line(genderX + 60, yPos + 0.5, underlineEnd, yPos + 0.5);
  }
  yPos += lineHeight;

  // Row 5: Golongan Darah (checkbox with FILLED state) + Lainnya
  doc.setFontSize(11); // Pertanyaan font 11
  doc.text(`Golongan Darah :`, labelX, yPos);
  const bloodX = labelX + 32;
  const bloodTypes = ["A", "B", "AB", "O"];
  bloodTypes.forEach((type, idx) => {
    const x = bloodX + idx * 12;
    doc.setLineWidth(0.3);
    doc.rect(x, yPos - 3, 3, 3, "S");
    if (student.bloodType === type) {
      doc.setFillColor(...BLACK);
      doc.rect(x + 0.3, yPos - 2.7, 2.4, 2.4, "F");
    }
    doc.setFontSize(10); // Jawaban font 10
    doc.text(type, x + 5, yPos);
  });

  doc.setFontSize(11); // Pertanyaan font 11
  doc.text(`Lainnya :`, bloodX + 52, yPos);
  const bloodOther =
    student.bloodType && !["A", "B", "AB", "O"].includes(student.bloodType)
      ? student.bloodType
      : "";
  if (bloodOther) {
    doc.setFontSize(10); // Jawaban font 10
    doc.text(bloodOther, bloodX + 65, yPos);
  } else {
    doc.line(bloodX + 65, yPos + 0.5, underlineEnd, yPos + 0.5);
  }
  yPos += lineHeight;

  // Row 6: Klasifikasi Status Ekonomi (checkbox with FILLED state)
  doc.setFontSize(11); // Pertanyaan font 11
  doc.text(`Klasifikasi Status Ekonomi :`, labelX, yPos);
  const ecoX = labelX + 52;
  const ecoOptions = [
    { label: "TINGGI", value: "TINGGI" },
    { label: "MENENGAH", value: "MENENGAH" },
    { label: "RENDAH", value: "RENDAH" },
  ];

  // Debug: Clean and normalize economic status value
  const cleanEconomicStatus =
    student.economicStatus?.trim().toUpperCase() || "";

  // Temporary debug - will remove after testing
  console.log("DEBUG Economic Status:", {
    raw: student.economicStatus,
    clean: cleanEconomicStatus,
    type: typeof student.economicStatus,
  });

  ecoOptions.forEach((opt, idx) => {
    const x = ecoX + idx * 35;
    doc.setLineWidth(0.3);
    doc.rect(x, yPos - 3, 3, 3, "S");

    // Improved comparison with normalization
    if (cleanEconomicStatus === opt.value.toUpperCase()) {
      doc.setFillColor(...BLACK);
      doc.rect(x + 0.3, yPos - 2.7, 2.4, 2.4, "F");
    }
    doc.setFontSize(10); // Jawaban font 10
    doc.text(opt.label, x + 5, yPos);
  });
  yPos += lineHeight;

  // Row 7: Alamat siswa - no underline if has value
  doc.setFontSize(11); // Pertanyaan font 11
  doc.text(`Alamat siswa :`, labelX, yPos);
  const addrVal = val(student.address);
  if (addrVal) {
    doc.setFontSize(10); // Jawaban font 10
    const addrLines = doc.splitTextToSize(
      addrVal,
      underlineEnd - underlineStart + 10,
    );
    doc.text(addrLines[0], underlineStart - 8, yPos);
    if (addrLines[1]) {
      yPos += lineHeight;
      doc.text(addrLines[1], labelX + 2, yPos);
    }
  } else {
    doc.line(underlineStart - 10, yPos + 0.5, underlineEnd, yPos + 0.5);
  }
  yPos += lineHeight;

  // Row 8: Cita-cita - no underline if has value
  doc.setFontSize(11); // Pertanyaan font 11
  doc.text(`Cita-cita :`, labelX, yPos);
  const dreamVal = val(student.dream);
  if (dreamVal) {
    doc.setFontSize(10); // Jawaban font 10
    doc.text(dreamVal, underlineStart - 18, yPos);
  } else {
    doc.line(underlineStart - 20, yPos + 0.5, underlineEnd, yPos + 0.5);
  }
  yPos += lineHeight;

  // Row 9: Ekskul Diikuti - no underline if has value
  doc.setFontSize(11); // Pertanyaan font 11
  doc.text(`Ekskul Diikuti :`, labelX, yPos);
  const ekskulVal = val(student.extracurricular);
  if (ekskulVal) {
    doc.setFontSize(10); // Jawaban font 10
    doc.text(ekskulVal, underlineStart - 13, yPos);
  } else {
    doc.line(underlineStart - 15, yPos + 0.5, underlineEnd, yPos + 0.5);
  }
  yPos += lineHeight;

  // Row 10: Hobi - no underline if has value
  doc.setFontSize(11); // Pertanyaan font 11
  doc.text(`Hobi :`, labelX, yPos);
  const hobbyVal = val(student.hobby);
  if (hobbyVal) {
    doc.setFontSize(10); // Jawaban font 10
    doc.text(hobbyVal, underlineStart - 23, yPos);
  } else {
    doc.line(underlineStart - 25, yPos + 0.5, underlineEnd, yPos + 0.5);
  }
  yPos += lineHeight;

  // Row 11: Penggunaan Akun Media (with PNG icons from public/Social Icon/)
  doc.setFontSize(11); // Pertanyaan font 11
  doc.text(`Penggunaan Akun Media :`, labelX, yPos);
  const socialX = labelX + 48;

  // Social media platforms with PNG file mapping
  const socials: Array<{
    name: string;
    pngFile: string;
    color: [number, number, number];
  }> = [
    { name: "WhatsApp", pngFile: "Whatsapp.png", color: [37, 211, 102] },
    { name: "Facebook", pngFile: "Facebook.png", color: [66, 103, 178] },
    { name: "Instagram", pngFile: "Instragram.png", color: [225, 48, 108] },
    { name: "TikTok", pngFile: "Tiktok.png", color: [0, 0, 0] },
    { name: "YouTube", pngFile: "Youtube.png", color: [255, 0, 0] },
    { name: "Telegram", pngFile: "Telegram.png", color: [0, 136, 204] },
  ];

  // Load and embed social media icons
  for (let idx = 0; idx < socials.length; idx++) {
    const social = socials[idx];
    const x = socialX + idx * 18;
    const usage = student.socialUsages.find((s) =>
      s.platform?.toLowerCase().includes(social.name.toLowerCase()),
    );

    // Draw checkbox above
    doc.setLineWidth(0.3);
    doc.setDrawColor(0, 0, 0);
    doc.rect(x, yPos - 4, 3, 3, "S");
    if (usage?.isActive) {
      doc.setFillColor(...BLACK);
      doc.rect(x + 0.3, yPos - 3.7, 2.4, 2.4, "F");
    }

    // For now, use colored rectangles (PNG loading disabled)
    // TODO: Fix PNG loading or implement base64 constants
    doc.setFillColor(...social.color);
    doc.roundedRect(x, yPos + 1, 12, 8, 1, 1, "F");
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    const iconText = social.name.substring(0, 2).toUpperCase();
    doc.text(iconText, x + 6, yPos + 6, { align: "center" });
    doc.setTextColor(...BLACK);
  }
  yPos += 12;

  // === SECTION: DATA ORANG TUA KANDUNG ===
  doc.setFillColor(...ORANGE);
  doc.rect(margin, yPos, usableWidth, 6, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("DATA ORANG TUA KANDUNG", margin + 2, yPos + 4);

  yPos += 10;
  doc.setTextColor(...BLACK);
  doc.setFont("helvetica", "normal");

  // Fixed column positions untuk alignment yang sejajar
  const colonX = labelX + 45; // Posisi titik dua (:) yang konsisten
  const valueX = colonX + 5; // Posisi nilai/jawaban

  // Nama Lengkap Ayah
  doc.setFontSize(11); // Pertanyaan font 11
  doc.text(`Nama Lengkap Ayah`, labelX, yPos);
  doc.text(`:`, colonX, yPos);
  const fatherNameVal = val(student.fatherName);
  if (fatherNameVal) {
    doc.setFontSize(10); // Jawaban font 10
    doc.text(fatherNameVal, valueX, yPos);
  } else {
    doc.line(valueX, yPos + 0.5, pageWidth - margin - 2, yPos + 0.5);
  }
  yPos += lineHeight;

  // Nama Lengkap Ibu
  doc.setFontSize(11); // Pertanyaan font 11
  doc.text(`Nama Lengkap Ibu`, labelX, yPos);
  doc.text(`:`, colonX, yPos);
  const motherNameVal = val(student.motherName);
  if (motherNameVal) {
    doc.setFontSize(10); // Jawaban font 10
    doc.text(motherNameVal, valueX, yPos);
  } else {
    doc.line(valueX, yPos + 0.5, pageWidth - margin - 2, yPos + 0.5);
  }
  yPos += lineHeight;

  // Pekerjaan Ayah
  doc.setFontSize(11); // Pertanyaan font 11
  doc.text(`Pekerjaan Ayah`, labelX, yPos);
  doc.text(`:`, colonX, yPos);
  const fatherJobVal = val(student.fatherJob);
  if (fatherJobVal) {
    doc.setFontSize(10); // Jawaban font 10
    doc.text(fatherJobVal, valueX, yPos);
  } else {
    doc.line(valueX, yPos + 0.5, pageWidth - margin - 2, yPos + 0.5);
  }
  yPos += lineHeight;

  // Pekerjaan Ibu
  doc.setFontSize(11); // Pertanyaan font 11
  doc.text(`Pekerjaan Ibu`, labelX, yPos);
  doc.text(`:`, colonX, yPos);
  const motherJobVal = val(student.motherJob);
  if (motherJobVal) {
    doc.setFontSize(10); // Jawaban font 10
    doc.text(motherJobVal, valueX, yPos);
  } else {
    doc.line(valueX, yPos + 0.5, pageWidth - margin - 2, yPos + 0.5);
  }
  yPos += lineHeight;

  // Penghasilan Ayah /bulan + Penghasilan Ibu /bulan (2 columns)
  doc.setFontSize(11); // Pertanyaan font 11
  doc.text(`Penghasilan Ayah /bulan`, labelX, yPos);
  doc.text(`:`, colonX, yPos);
  const fatherIncome = student.fatherIncome
    ? `Rp ${student.fatherIncome.toLocaleString("id-ID")}`
    : "";
  if (fatherIncome) {
    doc.setFontSize(10); // Jawaban font 10
    doc.text(fatherIncome, valueX, yPos);
  } else {
    doc.line(valueX, yPos + 0.5, labelX + 90, yPos + 0.5);
  }

  // Penghasilan Ibu (column 2)
  const col2X = labelX + 95;
  const colon2X = col2X + 40;
  const value2X = colon2X + 5;
  doc.setFontSize(11); // Pertanyaan font 11
  doc.text(`Penghasilan Ibu /bulan`, col2X, yPos);
  doc.text(`:`, colon2X, yPos);
  const motherIncome = student.motherIncome
    ? `Rp ${student.motherIncome.toLocaleString("id-ID")}`
    : "";
  if (motherIncome) {
    doc.setFontSize(10); // Jawaban font 10
    doc.text(motherIncome, value2X, yPos);
  } else {
    doc.line(value2X, yPos + 0.5, pageWidth - margin - 2, yPos + 0.5);
  }
  yPos += 8;

  // === SECTION: RIWAYAT KESEHATAN SISWA ===
  doc.setFillColor(...ORANGE);
  doc.rect(margin, yPos, usableWidth, 6, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("RIWAYAT KESEHATAN SISWA", margin + 2, yPos + 4);

  yPos += 10;
  doc.setTextColor(...BLACK);
  doc.setFont("helvetica", "normal");

  // Fixed column positions untuk RIWAYAT KESEHATAN SISWA
  const healthColonX = labelX + 70; // Posisi titik dua (:) yang konsisten
  const healthValueX = healthColonX + 5; // Posisi nilai/jawaban

  // Penyakit Berat Yang Pernah Diderita
  doc.setFontSize(11); // Pertanyaan font 11
  doc.text(`Penyakit Berat Yang Pernah Diderita`, labelX, yPos);
  doc.text(`:`, healthColonX, yPos);
  const healthPastVal = val(student.healthHistoryPast);
  if (healthPastVal) {
    doc.setFontSize(10); // Jawaban font 10
    doc.text(healthPastVal, healthValueX, yPos);
  } else {
    doc.line(healthValueX, yPos + 0.5, pageWidth - margin - 2, yPos + 0.5);
  }
  yPos += lineHeight;

  // Penyakit Berat Yang Sedang Diderita
  doc.setFontSize(11); // Pertanyaan font 11
  doc.text(`Penyakit Berat Yang Sedang Diderita`, labelX, yPos);
  doc.text(`:`, healthColonX, yPos);
  const healthCurrentVal = val(student.healthHistoryCurrent);
  if (healthCurrentVal) {
    doc.setFontSize(10); // Jawaban font 10
    doc.text(healthCurrentVal, healthValueX, yPos);
  } else {
    doc.line(healthValueX, yPos + 0.5, pageWidth - margin - 2, yPos + 0.5);
  }
  yPos += lineHeight;

  // Penyakit Yang Sering Dialami
  doc.setFontSize(11); // Pertanyaan font 11
  doc.text(`Penyakit Yang Sering Dialami`, labelX, yPos);
  doc.text(`:`, healthColonX, yPos);
  const healthOftenVal = val(student.healthHistoryOften);
  if (healthOftenVal) {
    doc.setFontSize(10); // Jawaban font 10
    doc.text(healthOftenVal, healthValueX, yPos);
  } else {
    doc.line(healthValueX, yPos + 0.5, pageWidth - margin - 2, yPos + 0.5);
  }
  yPos += 8;

  // === SECTION: SIFAT/PERILAKU SISWA ===
  doc.setFillColor(...ORANGE);
  doc.rect(margin, yPos, usableWidth, 6, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("SIFAT/PERILAKU SISWA", margin + 2, yPos + 4);

  yPos += 10;
  doc.setTextColor(...BLACK);
  doc.setFont("helvetica", "normal");

  // Fixed column positions untuk SIFAT/PERILAKU SISWA
  const charColonX = labelX + 75; // Posisi titik dua (:) yang konsisten
  const charValueX = charColonX + 5; // Posisi nilai/jawaban

  // Sifat/Perilaku Yang Menonjol
  doc.setFontSize(11); // Pertanyaan font 11
  doc.text(`Sifat/Perilaku Yang Menonjol`, labelX, yPos);
  doc.text(`:`, charColonX, yPos);
  const charStrengthVal = val(student.characterStrength);
  if (charStrengthVal) {
    doc.setFontSize(10); // Jawaban font 10
    doc.text(charStrengthVal, charValueX, yPos);
  } else {
    doc.line(charValueX, yPos + 0.5, pageWidth - margin - 2, yPos + 0.5);
  }
  yPos += lineHeight;

  // Sifat/Perilaku Yang Perlu Ditingkatkan
  doc.setFontSize(11); // Pertanyaan font 11
  doc.text(`Sifat/Perilaku Yang Perlu Ditingkatkan`, labelX, yPos);
  doc.text(`:`, charColonX, yPos);
  const charImprovementVal = val(student.characterImprovement);
  if (charImprovementVal) {
    doc.setFontSize(10); // Jawaban font 10
    doc.text(charImprovementVal, charValueX, yPos);
  } else {
    doc.line(charValueX, yPos + 0.5, pageWidth - margin - 2, yPos + 0.5);
  }
  yPos += 10;

  // === FOOTER: SIGNATURE AREA ===
  doc.setFillColor(...CREAM);
  doc.rect(margin, yPos, usableWidth, 35, "F"); // Fix 1: Increased height from 20 to 35

  doc.setTextColor(...BLACK);
  doc.setFontSize(11); // Footer font size diperbesar
  doc.setFont("helvetica", "normal");

  // Left: Orang Tua / Wali Siswa
  doc.text("ORANG TUA / WALI SISWA", labelX + 10, yPos + 5);

  // Fix 2: Dynamic parent signature with proper width
  const parentName = val(student.parentName);
  const parentNameWidth = doc.getTextWidth(parentName);
  const leftSignatureX = labelX;

  // Signature line Y position (same for both sides)
  const signatureY = yPos + 28;

  // Left side - parent signature (dynamic width)
  doc.text("(", leftSignatureX, signatureY);
  doc.text(parentName, leftSignatureX + 5, signatureY);
  doc.text(")", leftSignatureX + 5 + parentNameWidth + 5, signatureY);

  // Right: Location, date, Student signature
  const rightX = pageWidth - margin - 60;
  const today = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Fix 3: Complete date format (full date instead of just day)
  doc.text(`BUAY RAWAN, ${today}`, rightX - 10, yPos + 5);
  doc.text("PESERTA DIDIK", rightX + 10, yPos + 12);

  // Right side - student signature with student name
  const studentName = val(student.fullName);
  const studentNameWidth = doc.getTextWidth(studentName);
  const rightSignatureX = pageWidth - margin - 80;

  doc.text("(", rightSignatureX, signatureY);
  doc.text(studentName, rightSignatureX + 5, signatureY);
  doc.text(")", rightSignatureX + 5 + studentNameWidth + 5, signatureY);

  return new Uint8Array(doc.output("arraybuffer") as ArrayBuffer);
}
