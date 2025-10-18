// Drizzle config for local development database (separate from Wrangler D1)
// This is used for testing seed scripts with a simple local SQLite file
// Created: 2025-10-18

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle/migrations",
  schema: "./drizzle/schema",
  dialect: "sqlite",
  casing: "snake_case",
  dbCredentials: {
    url: "./local-dev.db",
  },
});
