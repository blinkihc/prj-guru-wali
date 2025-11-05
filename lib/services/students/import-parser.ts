// Student import parser utilities - Phase 2 CSV handling
// Created: 2025-10-22 - Parse 32 biodata columns + social usages into StudentImportRow

import type { StudentImportRow } from "@/types/student-import";

export const MAX_SOCIAL_SLOTS = 3;

const HEADER_MAP: Record<
  keyof Omit<
    StudentImportRow,
    | "socialUsages"
    | "photoUrl"
    | "_rowId"
    | "_rowNumber"
    | "_isValid"
    | "_errors"
  >,
  string
> = {
  fullName: "Nama Lengkap",
  nis: "NIS",
  nisn: "NISN",
  classroom: "Kelas",
  gender: "Jenis Kelamin",
  birthPlace: "Tempat Lahir",
  birthDate: "Tanggal Lahir",
  religion: "Agama",
  bloodType: "Golongan Darah",
  economicStatus: "Status Ekonomi",
  address: "Alamat",
  phoneNumber: "Nomor HP Siswa",
  dream: "Cita-cita",
  extracurricular: "Ekstrakurikuler",
  hobby: "Hobi",
  parentName: "Nama Orang Tua/Wali",
  parentContact: "Kontak Orang Tua",
  fatherName: "Nama Ayah",
  fatherJob: "Pekerjaan Ayah",
  fatherIncome: "Penghasilan Ayah",
  motherName: "Nama Ibu",
  motherJob: "Pekerjaan Ibu",
  motherIncome: "Penghasilan Ibu",
  healthHistoryPast: "Riwayat Kesehatan (Dulu)",
  healthHistoryCurrent: "Riwayat Kesehatan (Sekarang)",
  healthHistoryOften: "Riwayat Kesehatan (Sering)",
  characterStrength: "Kekuatan Karakter",
  characterImprovement: "Perlu Peningkatan Karakter",
  specialNotes: "Catatan Khusus",
};

const PLACEHOLDER_HEADERS = new Set([
  "Alamat Email Siswa",
  "Nomor HP Alternatif",
]);

// Note: photoUrl and socialUsages columns are excluded from template
// These fields should be added via UI edit after import
export const STUDENT_IMPORT_HEADERS = [
  ...Object.values(HEADER_MAP),
  ...PLACEHOLDER_HEADERS,
];

type RawCsvRow = Record<string, unknown>;

const toTrimmedString = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed === "-") {
    return null;
  }
  return trimmed;
};

const toGender = (value: unknown): "L" | "P" | null => {
  const trimmed = toTrimmedString(value);
  if (!trimmed) {
    return null;
  }
  const upper = trimmed.toUpperCase();
  if (upper === "L" || upper === "LAKI-LAKI") {
    return "L";
  }
  if (upper === "P" || upper === "PEREMPUAN") {
    return "P";
  }
  return null;
};

const toInteger = (value: unknown): number | null => {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  if (typeof value === "string") {
    const trimmed = value.replace(/[^0-9-]/g, "").trim();
    if (!trimmed || trimmed === "-") {
      return null;
    }
    const parsed = Number.parseInt(trimmed, 10);
    if (Number.isNaN(parsed)) {
      return null;
    }
    return parsed;
  }
  return null;
};

const toDateString = (value: unknown): string | null => {
  const trimmed = toTrimmedString(value);
  if (!trimmed) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const match = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (match) {
    const day = match[1].padStart(2, "0");
    const month = match[2].padStart(2, "0");
    const year = match[3];
    return `${year}-${month}-${day}`;
  }

  return null;
};

export function parseCsvRows(rows: RawCsvRow[]): StudentImportRow[] {
  return rows.map((row, index) => {
    const errors: Record<string, string> = {};
    const rowId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${index}`;

    const student: StudentImportRow = {
      fullName: toTrimmedString(row[HEADER_MAP.fullName]) ?? "",
      nis: toTrimmedString(row[HEADER_MAP.nis]),
      nisn: toTrimmedString(row[HEADER_MAP.nisn]),
      classroom: toTrimmedString(row[HEADER_MAP.classroom]),
      gender: toGender(row[HEADER_MAP.gender]),
      birthPlace: toTrimmedString(row[HEADER_MAP.birthPlace]),
      birthDate: toDateString(row[HEADER_MAP.birthDate]),
      religion: toTrimmedString(row[HEADER_MAP.religion]),
      bloodType: toTrimmedString(row[HEADER_MAP.bloodType]),
      economicStatus: toTrimmedString(row[HEADER_MAP.economicStatus]),
      address: toTrimmedString(row[HEADER_MAP.address]),
      phoneNumber: toTrimmedString(row[HEADER_MAP.phoneNumber]),
      dream: toTrimmedString(row[HEADER_MAP.dream]),
      extracurricular: toTrimmedString(row[HEADER_MAP.extracurricular]),
      hobby: toTrimmedString(row[HEADER_MAP.hobby]),
      photoUrl: null, // photoUrl should be added via UI edit after import
      parentName: toTrimmedString(row[HEADER_MAP.parentName]),
      parentContact: toTrimmedString(row[HEADER_MAP.parentContact]),
      fatherName: toTrimmedString(row[HEADER_MAP.fatherName]),
      fatherJob: toTrimmedString(row[HEADER_MAP.fatherJob]),
      fatherIncome: toInteger(row[HEADER_MAP.fatherIncome]),
      motherName: toTrimmedString(row[HEADER_MAP.motherName]),
      motherJob: toTrimmedString(row[HEADER_MAP.motherJob]),
      motherIncome: toInteger(row[HEADER_MAP.motherIncome]),
      healthHistoryPast: toTrimmedString(row[HEADER_MAP.healthHistoryPast]),
      healthHistoryCurrent: toTrimmedString(
        row[HEADER_MAP.healthHistoryCurrent],
      ),
      healthHistoryOften: toTrimmedString(row[HEADER_MAP.healthHistoryOften]),
      characterStrength: toTrimmedString(row[HEADER_MAP.characterStrength]),
      characterImprovement: toTrimmedString(
        row[HEADER_MAP.characterImprovement],
      ),
      specialNotes: toTrimmedString(row[HEADER_MAP.specialNotes]),
      // socialUsages should be added via UI edit after import
      socialUsages: Array.from({ length: MAX_SOCIAL_SLOTS }, () => ({
        platform: null,
        username: null,
        isActive: false,
      })),
      _rowId: rowId,
      _rowNumber: index + 2,
      _isValid: true,
      _errors: errors,
    };

    if (!student.fullName) {
      errors.fullName = "Nama lengkap wajib diisi";
    }

    if (row[HEADER_MAP.gender] && !student.gender) {
      errors.gender = "Jenis kelamin harus 'L' atau 'P'";
    }

    if (row[HEADER_MAP.birthDate] && !student.birthDate) {
      errors.birthDate = "Format tanggal tidak valid (YYYY-MM-DD)";
    }

    if (row[HEADER_MAP.fatherIncome] && student.fatherIncome === null) {
      errors.fatherIncome = "Penghasilan ayah harus berupa angka";
    }

    if (row[HEADER_MAP.motherIncome] && student.motherIncome === null) {
      errors.motherIncome = "Penghasilan ibu harus berupa angka";
    }

    student._errors = errors;
    student._isValid = Object.keys(errors).length === 0;

    return student;
  });
}
