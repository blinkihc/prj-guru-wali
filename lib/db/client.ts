// Database client configuration
// Supports both local (Wrangler) and production (Cloudflare D1) environments
// Last updated: 2025-10-12

import type { D1Database } from "@cloudflare/workers-types";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "@/drizzle/schema";

let db: DrizzleD1Database<typeof schema> | null = null;

/**
 * Get database instance
 * In production, this will be called with the D1 binding from Cloudflare
 * In development, this will use the local D1 database from Wrangler
 *
 * @param d1Binding - D1 database binding from Cloudflare environment
 * @returns Drizzle database instance
 */
export function getDb(d1Binding: D1Database): DrizzleD1Database<typeof schema> {
  if (!db) {
    db = drizzle(d1Binding, { schema });
  }
  return db;
}

/**
 * Type-safe database instance
 * Use this type when passing db around in your application
 */
export type Database = DrizzleD1Database<typeof schema>;
