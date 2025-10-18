/**
 * Sync data from local-dev.db to Wrangler D1 local database
 *
 * This script reads data from local-dev.db and inserts it into
 * Wrangler's local D1 database for use with dev server.
 *
 * Usage:
 * npm run db:sync:wrangler
 *
 * Created: 2025-10-18
 */

import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema/index";

// Source: local-dev.db
const SOURCE_DB = "file:./local-dev.db";

// Target: Wrangler D1 local database
const WRANGLER_DIR = ".wrangler/state/v3/d1/miniflare-D1DatabaseObject";

function getWranglerDbPath(): string {
  const wranglerPath = resolve(WRANGLER_DIR);

  if (!existsSync(wranglerPath)) {
    console.error(`❌ Wrangler D1 directory not found: ${wranglerPath}`);
    console.log("\n💡 Run this first to initialize Wrangler D1:");
    console.log("   npm run dev");
    console.log("   (then stop the dev server and run this script)\n");
    process.exit(1);
  }

  const sqliteFiles = readdirSync(wranglerPath).filter((f) =>
    f.endsWith(".sqlite"),
  );

  if (sqliteFiles.length === 0) {
    console.error(`❌ No SQLite database found in: ${wranglerPath}`);
    console.log("\n💡 Run dev server once to create the database:");
    console.log("   npm run dev\n");
    process.exit(1);
  }

  return `file:${resolve(wranglerPath, sqliteFiles[0])}`;
}

async function main() {
  console.log("🔄 Syncing data from local-dev.db to Wrangler D1...\n");

  // Check if source database exists
  if (!existsSync("./local-dev.db")) {
    console.error("❌ local-dev.db not found!");
    console.log("\n💡 Run this first:");
    console.log("   npm run db:setup:dev\n");
    process.exit(1);
  }

  const targetDbPath = getWranglerDbPath();

  console.log(`📁 Source: ${SOURCE_DB}`);
  console.log(`📁 Target: ${targetDbPath}`);
  console.log(
    `💡 Tip: If tables don't exist in Wrangler D1, run: npm run db:migrate\n`,
  );

  // Connect to both databases
  const sourceClient = createClient({ url: SOURCE_DB });
  const targetClient = createClient({ url: targetDbPath });

  const sourceDb = drizzle(sourceClient, { schema });
  const targetDb = drizzle(targetClient, { schema });

  try {
    console.log("📊 Reading data from local-dev.db...\n");

    // Read all data from source
    const users = await sourceDb.select().from(schema.users);
    const students = await sourceDb.select().from(schema.students);
    const monthlyJournals = await sourceDb
      .select()
      .from(schema.monthlyJournals);
    const meetingLogs = await sourceDb.select().from(schema.meetingLogs);
    const interventions = await sourceDb.select().from(schema.interventions);
    const schoolProfiles = await sourceDb.select().from(schema.schoolProfiles);

    console.log(`   Users: ${users.length}`);
    console.log(`   Students: ${students.length}`);
    console.log(`   Monthly Journals: ${monthlyJournals.length}`);
    console.log(`   Meeting Logs: ${meetingLogs.length}`);
    console.log(`   Interventions: ${interventions.length}`);
    console.log(`   School Profiles: ${schoolProfiles.length}\n`);

    console.log("🗑️  Clearing existing data in Wrangler D1...\n");

    // Clear target database (in reverse order due to foreign keys)
    // Use try-catch for each table in case table doesn't exist yet
    try {
      await targetDb.delete(schema.interventions);
    } catch (_e) {
      console.log("   ⚠️  interventions table not found, skipping...");
    }
    try {
      await targetDb.delete(schema.meetingLogs);
    } catch (_e) {
      console.log("   ⚠️  meetingLogs table not found, skipping...");
    }
    try {
      await targetDb.delete(schema.monthlyJournals);
    } catch (_e) {
      console.log("   ⚠️  monthlyJournals table not found, skipping...");
    }
    try {
      await targetDb.delete(schema.schoolProfiles);
    } catch (_e) {
      console.log("   ⚠️  schoolProfiles table not found, skipping...");
    }
    try {
      await targetDb.delete(schema.students);
    } catch (_e) {
      console.log("   ⚠️  students table not found, skipping...");
    }
    try {
      await targetDb.delete(schema.users);
    } catch (_e) {
      console.log("   ⚠️  users table not found, skipping...");
    }

    console.log("✅ Existing data cleared\n");

    console.log("📥 Inserting data into Wrangler D1...\n");

    // Insert data in correct order (respecting foreign keys)
    // Wrap each insert in try-catch in case table doesn't exist
    if (users.length > 0) {
      try {
        await targetDb.insert(schema.users).values(users);
        console.log(`   ✓ ${users.length} users`);
      } catch (e: any) {
        console.log(`   ❌ Failed to insert users: ${e.message}`);
        console.log(`   💡 Run: npm run db:migrate`);
      }
    }

    if (schoolProfiles.length > 0) {
      try {
        await targetDb.insert(schema.schoolProfiles).values(schoolProfiles);
        console.log(`   ✓ ${schoolProfiles.length} school profiles`);
      } catch (e: any) {
        console.log(`   ❌ Failed to insert school profiles: ${e.message}`);
      }
    }

    if (students.length > 0) {
      try {
        await targetDb.insert(schema.students).values(students);
        console.log(`   ✓ ${students.length} students`);
      } catch (e: any) {
        console.log(`   ❌ Failed to insert students: ${e.message}`);
      }
    }

    if (monthlyJournals.length > 0) {
      try {
        await targetDb.insert(schema.monthlyJournals).values(monthlyJournals);
        console.log(`   ✓ ${monthlyJournals.length} monthly journals`);
      } catch (e: any) {
        console.log(`   ❌ Failed to insert monthly journals: ${e.message}`);
      }
    }

    if (meetingLogs.length > 0) {
      try {
        await targetDb.insert(schema.meetingLogs).values(meetingLogs);
        console.log(`   ✓ ${meetingLogs.length} meeting logs`);
      } catch (e: any) {
        console.log(`   ❌ Failed to insert meeting logs: ${e.message}`);
      }
    }

    if (interventions.length > 0) {
      try {
        await targetDb.insert(schema.interventions).values(interventions);
        console.log(`   ✓ ${interventions.length} interventions`);
      } catch (e: any) {
        console.log(`   ❌ Failed to insert interventions: ${e.message}`);
      }
    }

    console.log("\n✅ Sync completed successfully!\n");

    console.log("🚀 Next steps:");
    console.log("   1. Start dev server: npm run dev");
    console.log("   2. Login: http://localhost:3000");
    console.log("   3. Email: dev@guruwali.test");
    console.log("   4. Password: dev123\n");
  } catch (error) {
    console.error("\n❌ Sync failed:", error);
    process.exit(1);
  } finally {
    sourceClient.close();
    targetClient.close();
  }
}

main();
