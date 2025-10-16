// Script to generate SQL for creating user in D1 database
// Created: 2025-10-16
// Usage: bun run scripts/create-user.ts

import { hashSync } from "bcryptjs";

interface CreateUserParams {
  email: string;
  password: string;
  fullName: string;
  nipNuptk?: string;
}

async function createUser(params: CreateUserParams) {
  const { email, password, fullName, nipNuptk } = params;

  // Generate hashed password
  const hashedPassword = hashSync(password, 10);

  // Generate user ID
  const userId = `user-${Date.now()}`;

  // Generate SQL
  const sql = `
-- Create user: ${fullName}
-- Email: ${email}
-- Password: ${password} (save this for client!)

INSERT INTO users (id, email, hashed_password, full_name, nip_nuptk, created_at)
VALUES (
  '${userId}',
  '${email.toLowerCase()}',
  '${hashedPassword}',
  '${fullName}',
  ${nipNuptk ? `'${nipNuptk}'` : 'NULL'},
  datetime('now')
);
`.trim();

  console.log("\n" + "=".repeat(80));
  console.log("SQL QUERY TO CREATE USER");
  console.log("=".repeat(80));
  console.log(sql);
  console.log("=".repeat(80));
  console.log("\nRun with wrangler:");
  console.log(
    `wrangler d1 execute guru-wali-db --remote --command="${sql.replace(/\n/g, " ").replace(/\s+/g, " ")}"`
  );
  console.log("\nCredentials to provide to client:");
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log(`URL: https://guru-wali-app.pages.dev/login`);
  console.log("=".repeat(80) + "\n");
}

// Example usage - modify these values
createUser({
  email: "aprilia3handayani@gmail.com",
  password: "guru123",
  fullName: "Aprilia Trihandayani,S.Pd",
  nipNuptk: "198404032009042001",
});
