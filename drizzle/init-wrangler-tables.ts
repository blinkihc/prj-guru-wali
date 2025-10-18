/**
 * Initialize Wrangler D1 Tables
 *
 * Creates all required tables in Wrangler D1 local database.
 * This bypasses migration files and creates tables directly from schema.
 *
 * Usage: tsx ./drizzle/init-wrangler-tables.ts
 */

import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@libsql/client";

const WRANGLER_DIR = ".wrangler/state/v3/d1/miniflare-D1DatabaseObject";

function getWranglerDbPath(): string {
  const wranglerPath = resolve(WRANGLER_DIR);

  if (!existsSync(wranglerPath)) {
    console.error(`❌ Wrangler D1 directory not found: ${wranglerPath}`);
    console.log("\n💡 Run dev server first:");
    console.log("   npm run dev\n");
    process.exit(1);
  }

  const sqliteFiles = readdirSync(wranglerPath).filter((f) =>
    f.endsWith(".sqlite"),
  );

  if (sqliteFiles.length === 0) {
    console.error(`❌ No SQLite database found`);
    process.exit(1);
  }

  return `file:${resolve(wranglerPath, sqliteFiles[0])}`;
}

async function initTables() {
  console.log("🔧 Initializing Wrangler D1 Tables\n");
  console.log("=".repeat(60));

  const dbPath = getWranglerDbPath();
  console.log(`\n📁 Database: ${dbPath}\n`);

  const client = createClient({ url: dbPath });

  try {
    console.log("📊 Creating tables...\n");

    // Create users table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        hashed_password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        nip_nuptk TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ users");

    // Create school_profiles table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS school_profiles (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        school_name TEXT NOT NULL,
        education_stage TEXT NOT NULL,
        city_district TEXT NOT NULL,
        address TEXT,
        school_email TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ school_profiles");

    // Create students table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        full_name TEXT NOT NULL,
        nisn TEXT,
        classroom TEXT,
        gender TEXT,
        parent_name TEXT,
        parent_contact TEXT,
        special_notes TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ students");

    // Create monthly_journals table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS monthly_journals (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        monitoring_period TEXT NOT NULL,
        academic_desc TEXT NOT NULL,
        academic_follow_up TEXT NOT NULL,
        academic_notes TEXT,
        character_desc TEXT NOT NULL,
        character_follow_up TEXT NOT NULL,
        character_notes TEXT,
        social_emotional_desc TEXT NOT NULL,
        social_emotional_follow_up TEXT NOT NULL,
        social_emotional_notes TEXT,
        discipline_desc TEXT NOT NULL,
        discipline_follow_up TEXT NOT NULL,
        discipline_notes TEXT,
        potential_interest_desc TEXT NOT NULL,
        potential_interest_follow_up TEXT NOT NULL,
        potential_interest_notes TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ monthly_journals");

    // Create meeting_logs table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS meeting_logs (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        meeting_date TEXT NOT NULL,
        topic TEXT NOT NULL,
        follow_up TEXT,
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ meeting_logs");

    // Create interventions table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS interventions (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        issue TEXT NOT NULL,
        goal TEXT NOT NULL,
        action_steps TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        start_date TEXT NOT NULL,
        end_date TEXT,
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ interventions");

    console.log(`\n${"=".repeat(60)}`);
    console.log("\n✅ All tables created successfully!");
    console.log("\n🚀 Next step: npm run db:sync:wrangler\n");
  } catch (error: any) {
    console.error("\n❌ Error:", error.message);
    console.log("\nFull error:", error);
    process.exit(1);
  } finally {
    client.close();
  }
}

initTables();
