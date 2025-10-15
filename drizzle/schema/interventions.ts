// Intervention Plans table schema - Rencana Intervensi
// Created: 2025-01-14
// Simple intervention tracking for students needing special attention

import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { students } from "./students";

export const interventions = sqliteTable("interventions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  studentId: text("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  title: text("title").notNull(), // Short title/summary of intervention
  issue: text("issue").notNull(), // Description of the issue/problem
  goal: text("goal").notNull(), // What we want to achieve
  actionSteps: text("action_steps").notNull(), // Steps to take (JSON array or text)
  status: text("status").notNull().default("active"), // "active", "completed", "cancelled"
  startDate: text("start_date").notNull(), // ISO date string
  endDate: text("end_date"), // ISO date string, optional
  notes: text("notes"), // Additional notes
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export type Intervention = typeof interventions.$inferSelect;
export type InsertIntervention = typeof interventions.$inferInsert;
