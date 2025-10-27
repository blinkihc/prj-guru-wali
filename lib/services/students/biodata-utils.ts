// Biodata utilities - Normalisasi & diff data biodata siswa
// Created: 2025-10-20 - Digunakan oleh form biodata siswa fase 2
// Updated: 2025-10-20 - Tambah type guard untuk field numerik & string agar lolos lint TS

import type {
  InsertStudentSocialUsage,
  StudentSocialUsage,
} from "@/drizzle/schema/student-social-usages";
import type { InsertStudent, Student } from "@/drizzle/schema/students";
import { isBoolean } from "@/lib/utils";

export type StudentUpdatePayload = Partial<
  Pick<
    InsertStudent,
    | "fullName"
    | "nis"
    | "nisn"
    | "classroom"
    | "gender"
    | "birthPlace"
    | "birthDate"
    | "religion"
    | "bloodType"
    | "economicStatus"
    | "address"
    | "phoneNumber"
    | "dream"
    | "extracurricular"
    | "hobby"
    | "parentName"
    | "parentContact"
    | "fatherName"
    | "motherName"
    | "fatherJob"
    | "motherJob"
    | "fatherIncome"
    | "motherIncome"
    | "healthHistoryPast"
    | "healthHistoryCurrent"
    | "healthHistoryOften"
    | "characterStrength"
    | "characterImprovement"
    | "specialNotes"
  >
>;

type StudentField = keyof StudentUpdatePayload;

export type RawSocialUsage = {
  id?: string;
  platform?: unknown;
  username?: unknown;
  isActive?: unknown;
};

export type NormalizedSocialUsage = {
  id?: string;
  platform: string;
  username: string | null;
  isActive: boolean;
};

export interface NormalizedStudentUpdates {
  studentUpdates: StudentUpdatePayload;
  socialUsages: NormalizedSocialUsage[];
}

const INTEGER_FIELD_KEYS = [
  "fatherIncome",
  "motherIncome",
] as const satisfies StudentField[];
type IntegerField = (typeof INTEGER_FIELD_KEYS)[number];
const INTEGER_FIELD_LOOKUP: Record<IntegerField, true> =
  INTEGER_FIELD_KEYS.reduce(
    (acc, key) => {
      acc[key] = true;
      return acc;
    },
    {} as Record<IntegerField, true>,
  );

const TRIMMED_STRING_FIELD_KEYS = [
  "fullName",
  "nis",
  "nisn",
  "classroom",
  "gender",
  "birthPlace",
  "birthDate",
  "religion",
  "bloodType",
  "economicStatus",
  "address",
  "phoneNumber",
  "dream",
  "extracurricular",
  "hobby",
  "parentName",
  "parentContact",
  "fatherName",
  "motherName",
  "fatherJob",
  "motherJob",
  "healthHistoryPast",
  "healthHistoryCurrent",
  "healthHistoryOften",
  "characterStrength",
  "characterImprovement",
  "specialNotes",
] as const satisfies StudentField[];
type TrimmedStringField = (typeof TRIMMED_STRING_FIELD_KEYS)[number];
const TRIMMED_STRING_FIELD_LOOKUP: Record<TrimmedStringField, true> =
  TRIMMED_STRING_FIELD_KEYS.reduce(
    (acc, key) => {
      acc[key] = true;
      return acc;
    },
    {} as Record<TrimmedStringField, true>,
  );

const STUDENT_FIELD_LOOKUP = {
  ...INTEGER_FIELD_LOOKUP,
  ...TRIMMED_STRING_FIELD_LOOKUP,
} as Record<StudentField, true>;

function isIntegerField(field: StudentField): field is IntegerField {
  return field in INTEGER_FIELD_LOOKUP;
}

function isTrimmedStringField(
  field: StudentField,
): field is TrimmedStringField {
  return field in TRIMMED_STRING_FIELD_LOOKUP;
}

function isStudentField(field: string): field is StudentField {
  return field in STUDENT_FIELD_LOOKUP;
}

function normalizePrimitiveValue(
  field: StudentField,
  value: unknown,
): string | number | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (isIntegerField(field)) {
    if (typeof value === "number") {
      return Number.isFinite(value) ? value : null;
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) {
        return null;
      }
      const parsed = Number.parseInt(trimmed, 10);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  }

  if (isTrimmedStringField(field)) {
    if (typeof value !== "string") {
      return null;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  return undefined;
}

function normalizeSocialUsage(
  raw: RawSocialUsage,
): NormalizedSocialUsage | null {
  const platformValue =
    typeof raw.platform === "string" ? raw.platform.trim() : "";
  if (!platformValue) {
    return null;
  }

  let username: string | null = null;
  if (typeof raw.username === "string") {
    const trimmed = raw.username.trim();
    username = trimmed.length > 0 ? trimmed : null;
  }

  let isActive = false;
  if (typeof raw.isActive === "string") {
    isActive = raw.isActive.trim().toLowerCase() === "true";
  } else if (typeof raw.isActive === "number") {
    isActive = raw.isActive === 1;
  } else if (isBoolean(raw.isActive)) {
    isActive = raw.isActive;
  }

  return {
    id:
      typeof raw.id === "string" && raw.id.trim().length > 0
        ? raw.id
        : undefined,
    platform: platformValue,
    username,
    isActive,
  } satisfies NormalizedSocialUsage;
}

export function normalizeStudentUpdates(
  payload: Record<string, unknown>,
): NormalizedStudentUpdates {
  const studentUpdates: StudentUpdatePayload = {};
  const mutableUpdates = studentUpdates as Record<
    StudentField,
    string | number | null | undefined
  >;

  for (const [key, value] of Object.entries(payload)) {
    if (key === "socialUsages") {
      continue;
    }

    if (!isStudentField(key)) {
      continue;
    }

    const fieldKey = key as StudentField;
    const normalized = normalizePrimitiveValue(fieldKey, value);
    if (normalized !== undefined) {
      mutableUpdates[fieldKey] = normalized;
    }
  }

  const socialUsagesRaw = Array.isArray(payload.socialUsages)
    ? (payload.socialUsages as RawSocialUsage[])
    : [];

  const socialUsages = socialUsagesRaw
    .map((usage) => normalizeSocialUsage(usage))
    .filter((usage): usage is NormalizedSocialUsage => usage !== null);

  return { studentUpdates, socialUsages } satisfies NormalizedStudentUpdates;
}

export interface SocialUsageChanges {
  toInsert: Array<
    Omit<InsertStudentSocialUsage, "studentId" | "id" | "createdAt">
  >;
  toUpdate: Array<
    Omit<InsertStudentSocialUsage, "studentId" | "createdAt"> & { id: string }
  >;
  toDelete: string[];
}

function isSameSocialUsage(
  existing: StudentSocialUsage,
  incoming: NormalizedSocialUsage,
): boolean {
  return (
    existing.platform === incoming.platform &&
    (existing.username ?? null) === incoming.username &&
    Boolean(existing.isActive) === incoming.isActive
  );
}

export function deriveSocialUsageChanges(
  existing: StudentSocialUsage[],
  incoming: NormalizedSocialUsage[],
): SocialUsageChanges {
  const toInsert: Array<
    Omit<InsertStudentSocialUsage, "studentId" | "id" | "createdAt">
  > = [];
  const toUpdate: Array<
    Omit<InsertStudentSocialUsage, "studentId" | "createdAt"> & { id: string }
  > = [];
  const toDelete = new Set(existing.map((usage) => usage.id));

  for (const usage of incoming) {
    if (!usage.id) {
      toInsert.push({
        platform: usage.platform,
        username: usage.username,
        isActive: usage.isActive ? 1 : 0,
      });
      continue;
    }

    const existingUsage = existing.find((item) => item.id === usage.id);
    if (!existingUsage) {
      // Data tidak sinkron, treat as insert baru tanpa id supaya dapat id baru
      toInsert.push({
        platform: usage.platform,
        username: usage.username,
        isActive: usage.isActive ? 1 : 0,
      });
      continue;
    }

    toDelete.delete(existingUsage.id);

    if (!isSameSocialUsage(existingUsage, usage)) {
      toUpdate.push({
        id: existingUsage.id,
        platform: usage.platform,
        username: usage.username,
        isActive: usage.isActive ? 1 : 0,
      });
    }
  }

  return {
    toInsert,
    toUpdate,
    toDelete: Array.from(toDelete),
  } satisfies SocialUsageChanges;
}

export function mergeStudentData(
  existing: Student,
  updates: StudentUpdatePayload,
): Student {
  return {
    ...existing,
    ...updates,
  } satisfies Student;
}
