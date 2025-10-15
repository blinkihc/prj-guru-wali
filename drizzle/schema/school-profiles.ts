// SchoolProfile table schema - Data sekolah
// Last updated: 2025-10-12

import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const schoolProfiles = sqliteTable("school_profiles", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  schoolName: text("school_name").notNull(),
  educationStage: text("education_stage").notNull(), // 'SD', 'SMP', 'SMA', 'SMK'
  cityDistrict: text("city_district").notNull(),
  address: text("address"), // Optional
  schoolEmail: text("school_email"), // Optional
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export type SchoolProfile = typeof schoolProfiles.$inferSelect;
export type InsertSchoolProfile = typeof schoolProfiles.$inferInsert;
