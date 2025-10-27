// Student Import Types
// Last updated: 2025-10-22 - Support 32 biodata fields + social usages for Phase 2 CSV pipeline

export interface StudentImportSocialUsage {
  platform: string | null;
  username: string | null;
  isActive: boolean;
}

export interface StudentImportRow {
  fullName: string;
  nis?: string | null;
  nisn?: string | null;
  classroom?: string | null;
  gender?: "L" | "P" | null;
  birthPlace?: string | null;
  birthDate?: string | null;
  religion?: string | null;
  bloodType?: string | null;
  economicStatus?: string | null;
  address?: string | null;
  phoneNumber?: string | null;
  dream?: string | null;
  extracurricular?: string | null;
  hobby?: string | null;
  photoUrl?: string | null;
  parentName?: string | null;
  parentContact?: string | null;
  fatherName?: string | null;
  fatherJob?: string | null;
  fatherIncome?: number | null;
  motherName?: string | null;
  motherJob?: string | null;
  motherIncome?: number | null;
  healthHistoryPast?: string | null;
  healthHistoryCurrent?: string | null;
  healthHistoryOften?: string | null;
  characterStrength?: string | null;
  characterImprovement?: string | null;
  specialNotes?: string | null;
  socialUsages: StudentImportSocialUsage[];

  // Internal metadata untuk preview & validasi
  _rowId: string;
  _rowNumber: number;
  _isValid: boolean;
  _errors: Record<string, string>;
}

export interface ImportValidationError {
  row: number;
  field: string;
  message: string;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors?: ImportValidationError[];
}
