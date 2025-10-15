// Student table schema - Data siswa
// Last updated: 2025-10-14
// Added: parentName field for parent/guardian name

import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const students = sqliteTable("students", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
  nisn: text("nisn"), // Nomor Induk Siswa Nasional (optional)
  classroom: text("classroom"), // e.g., "7A", "7B"
  gender: text("gender"), // 'L' or 'P'
  parentName: text("parent_name"), // Nama orang tua/wali (optional)
  parentContact: text("parent_contact"), // Phone number or contact info
  specialNotes: text("special_notes"), // Catatan khusus yang selalu terlihat
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export type Student = typeof students.$inferSelect;
export type InsertStudent = typeof students.$inferInsert;
