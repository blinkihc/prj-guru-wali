// MonthlyJournal table schema - Catatan Perkembangan Bulanan (Lampiran B)
// Last updated: 2025-10-12

import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { students } from "./students";

export const monthlyJournals = sqliteTable("monthly_journals", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  studentId: text("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  monitoringPeriod: text("monitoring_period").notNull(), // e.g., "Juli 2025", "Agustus 2025"

  // Aspek 1: Akademik
  academicDesc: text("academic_desc"),
  academicFollowUp: text("academic_follow_up"),
  academicNotes: text("academic_notes"),

  // Aspek 2: Karakter
  characterDesc: text("character_desc"),
  characterFollowUp: text("character_follow_up"),
  characterNotes: text("character_notes"),

  // Aspek 3: Sosial-Emosional
  socialEmotionalDesc: text("social_emotional_desc"),
  socialEmotionalFollowUp: text("social_emotional_follow_up"),
  socialEmotionalNotes: text("social_emotional_notes"),

  // Aspek 4: Kedisiplinan
  disciplineDesc: text("discipline_desc"),
  disciplineFollowUp: text("discipline_follow_up"),
  disciplineNotes: text("discipline_notes"),

  // Aspek 5: Potensi & Minat
  potentialInterestDesc: text("potential_interest_desc"),
  potentialInterestFollowUp: text("potential_interest_follow_up"),
  potentialInterestNotes: text("potential_interest_notes"),

  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export type MonthlyJournal = typeof monthlyJournals.$inferSelect;
export type InsertMonthlyJournal = typeof monthlyJournals.$inferInsert;
