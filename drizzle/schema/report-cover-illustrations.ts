// ReportCoverIllustrations schema - Custom cover illustrations for reports
// Created: 2025-10-19 - Initial table for managing custom report covers

import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const reportCoverIllustrations = sqliteTable(
  "report_cover_illustrations",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    url: text("url").notNull(),
    label: text("label"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
);

export type ReportCoverIllustration =
  typeof reportCoverIllustrations.$inferSelect;
export type InsertReportCoverIllustration =
  typeof reportCoverIllustrations.$inferInsert;
