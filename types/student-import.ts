// Student Import Types
// Created: 2025-01-14

export interface StudentImportRow {
  fullName: string;
  nisn?: string;
  classroom?: string;
  gender?: "L" | "P" | "";
  parentName?: string;
  parentContact?: string;
  specialNotes?: string;

  // Internal fields for validation
  _rowId: number;
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
