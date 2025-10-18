/**
 * Check Wrangler D1 Database Status
 *
 * This script checks if Wrangler D1 database exists and has tables.
 * Run before sync to diagnose issues.
 *
 * Usage: tsx ./drizzle/check-wrangler-db.ts
 */

import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

const WRANGLER_DIR = ".wrangler/state/v3/d1/miniflare-D1DatabaseObject";

function getWranglerDbPath(): string {
  const wranglerPath = resolve(WRANGLER_DIR);

  if (!existsSync(wranglerPath)) {
    console.error(`❌ Wrangler D1 directory not found: ${wranglerPath}`);
    console.log("\n💡 Run dev server first to create Wrangler D1:");
    console.log("   npm run dev\n");
    process.exit(1);
  }

  const sqliteFiles = readdirSync(wranglerPath).filter((f) =>
    f.endsWith(".sqlite"),
  );

  if (sqliteFiles.length === 0) {
    console.error(`❌ No SQLite database found in: ${wranglerPath}`);
    process.exit(1);
  }

  return `file:${resolve(wranglerPath, sqliteFiles[0])}`;
}

async function checkDatabase() {
  console.log("🔍 Checking Wrangler D1 Database Status\n");
  console.log("=".repeat(60));

  const dbPath = getWranglerDbPath();
  console.log(`\n📁 Database: ${dbPath}\n`);

  const client = createClient({ url: dbPath });
  const _db = drizzle(client);

  try {
    // Check if database is accessible
    console.log("📊 Checking database connection...");
    const _result = await client.execute("SELECT 1 as test");
    console.log("✅ Database connection successful\n");

    // List all tables
    console.log("📋 Listing tables...");
    const tables = await client.execute(`
      SELECT name, type 
      FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name
    `);

    if (tables.rows.length === 0) {
      console.log("❌ No tables found in database!");
      console.log("\n💡 Run migrations:");
      console.log("   npm run db:migrate\n");
      process.exit(1);
    }

    console.log(`\n✅ Found ${tables.rows.length} tables:\n`);

    const expectedTables = [
      "users",
      "students",
      "school_profiles",
      "monthly_journals",
      "meeting_logs",
      "interventions",
    ];

    const foundTables = tables.rows.map((row: any) => row.name);

    for (const tableName of expectedTables) {
      const exists = foundTables.includes(tableName);
      const icon = exists ? "✅" : "❌";
      console.log(`   ${icon} ${tableName}`);

      if (exists) {
        // Count rows in table
        try {
          const countResult = await client.execute(
            `SELECT COUNT(*) as count FROM ${tableName}`,
          );
          const count = (countResult.rows[0] as any).count;
          console.log(`      → ${count} rows`);
        } catch (e: any) {
          console.log(`      → Error counting: ${e.message}`);
        }
      }
    }

    // Check for unexpected tables
    const unexpectedTables = foundTables.filter(
      (t) => !expectedTables.includes(t),
    );
    if (unexpectedTables.length > 0) {
      console.log(`\n📌 Other tables found:`);
      unexpectedTables.forEach((t) => console.log(`   • ${t}`));
    }

    console.log(`\n${"=".repeat(60)}`);

    // Summary
    const missingTables = expectedTables.filter(
      (t) => !foundTables.includes(t),
    );

    if (missingTables.length > 0) {
      console.log("\n⚠️  Missing tables:");
      missingTables.forEach((t) => console.log(`   • ${t}`));
      console.log("\n💡 Run: npm run db:migrate\n");
      process.exit(1);
    }

    console.log("\n✅ All required tables exist!");

    // Check if tables are empty
    let totalRows = 0;
    for (const tableName of expectedTables) {
      const countResult = await client.execute(
        `SELECT COUNT(*) as count FROM ${tableName}`,
      );
      totalRows += (countResult.rows[0] as any).count;
    }

    if (totalRows === 0) {
      console.log("⚠️  All tables are EMPTY - ready for sync!");
      console.log("\n🚀 Next step: npm run db:sync:wrangler\n");
    } else {
      console.log(`📊 Total data: ${totalRows} rows across all tables`);
      console.log(
        "\n💡 To resync, clear data first or sync will skip existing records.\n",
      );
    }
  } catch (error: any) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  } finally {
    client.close();
  }
}

checkDatabase();
