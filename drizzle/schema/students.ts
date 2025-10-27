// Student table schema - Data siswa
// Last updated: 2025-10-20 - Added biodata fields for Phase 2

import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const students = sqliteTable("students", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
  nis: text("nis"),
  nisn: text("nisn"), // Nomor Induk Siswa Nasional (optional)
  classroom: text("classroom"), // e.g., "7A", "7B"
  gender: text("gender"), // 'L' or 'P'
  birthPlace: text("birth_place"),
  birthDate: text("birth_date"),
  religion: text("religion"),
  bloodType: text("blood_type"),
  economicStatus: text("economic_status"),
  address: text("address"),
  phoneNumber: text("phone_number"),
  dream: text("dream"),
  extracurricular: text("extracurricular"),
  hobby: text("hobby"),
  parentName: text("parent_name"), // Nama orang tua/wali (optional)
  parentContact: text("parent_contact"), // Phone number or contact info
  fatherName: text("father_name"),
  motherName: text("mother_name"),
  fatherJob: text("father_job"),
  motherJob: text("mother_job"),
  fatherIncome: integer("father_income"),
  motherIncome: integer("mother_income"),
  healthHistoryPast: text("health_history_past"),
  healthHistoryCurrent: text("health_history_current"),
  healthHistoryOften: text("health_history_often"),
  characterStrength: text("character_strength"),
  characterImprovement: text("character_improvement"),
  specialNotes: text("special_notes"), // Catatan khusus yang selalu terlihat
  photoUrl: text("photo_url"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export type Student = typeof students.$inferSelect;
export type InsertStudent = typeof students.$inferInsert;
