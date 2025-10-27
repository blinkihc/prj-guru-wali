// Student social usage table schema - Platform aktivitas siswa
// Created: 2025-10-20 - Phase 2 biodata expansion

import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { students } from "./students";

export const studentSocialUsages = sqliteTable("student_social_usages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  studentId: text("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(),
  isActive: integer("is_active").notNull().default(0),
  username: text("username"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export type StudentSocialUsage = typeof studentSocialUsages.$inferSelect;
export type InsertStudentSocialUsage = typeof studentSocialUsages.$inferInsert;
