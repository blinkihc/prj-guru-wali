// MeetingLog table schema - Rekap Pertemuan (Lampiran C)
// Last updated: 2025-10-12

import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { students } from "./students";

export const meetingLogs = sqliteTable("meeting_logs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  studentId: text("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  meetingDate: text("meeting_date").notNull(), // ISO date string format
  topic: text("topic").notNull(),
  followUp: text("follow_up"),
  notes: text("notes"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export type MeetingLog = typeof meetingLogs.$inferSelect;
export type InsertMeetingLog = typeof meetingLogs.$inferInsert;
