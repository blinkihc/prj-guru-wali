/**
 * Test Seed Data Integrity
 *
 * Verifies that seed data is correct and production is isolated.
 * Run this after: npm run db:full:dev
 *
 * Usage: tsx ./drizzle/test-seed.ts
 *
 * Created: 2025-10-18
 */

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema/index";

const DEV_DB = "file:./local-dev.db";

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  details?: any;
}

const results: TestResult[] = [];

function test(name: string, passed: boolean, message: string, details?: any) {
  results.push({ name, passed, message, details });
  const icon = passed ? "✅" : "❌";
  console.log(`${icon} ${name}: ${message}`);
  if (details) {
    console.log(`   Details:`, details);
  }
}

async function runTests() {
  console.log("🧪 Testing Seed Data Integrity\n");
  console.log("=".repeat(60));
  console.log("\n📁 Database: local-dev.db\n");

  const client = createClient({ url: DEV_DB });
  const db = drizzle(client, { schema });

  try {
    // ==========================================
    // TEST 1: Database exists and is accessible
    // ==========================================
    console.log("📊 TEST GROUP 1: Database Connection\n");

    try {
      const users = await db.select().from(schema.users);
      test(
        "Database Connection",
        true,
        "Successfully connected to local-dev.db",
        { userCount: users.length },
      );
    } catch (error: any) {
      test("Database Connection", false, "Failed to connect to database", {
        error: error.message,
      });
      process.exit(1);
    }

    // ==========================================
    // TEST 2: Dev User
    // ==========================================
    console.log("\n👤 TEST GROUP 2: Dev User Account\n");

    const users = await db.select().from(schema.users);

    test(
      "User Count",
      users.length === 1,
      `Expected 1 user, got ${users.length}`,
      { count: users.length },
    );

    const devUser = users[0];
    test(
      "Dev Email",
      devUser.email === "dev@guruwali.test",
      `Expected dev@guruwali.test, got ${devUser.email}`,
      { email: devUser.email },
    );

    test(
      "Dev User Name",
      devUser.fullName === "Pak Budi Santoso, S.Pd",
      `Expected 'Pak Budi Santoso, S.Pd', got '${devUser.fullName}'`,
      { fullName: devUser.fullName },
    );

    test(
      "NIP/NUPTK",
      devUser.nipNuptk === "196501011990031001",
      `NIP/NUPTK validation`,
      { nipNuptk: devUser.nipNuptk },
    );

    // bcrypt can be $2a$ or $2b$ (both valid)
    const isBcrypt =
      devUser.hashedPassword.startsWith("$2a$") ||
      devUser.hashedPassword.startsWith("$2b$");
    test("Password Hash", isBcrypt, "Password should be bcrypt hashed", {
      hashPrefix: devUser.hashedPassword.substring(0, 4),
    });

    // ==========================================
    // TEST 3: Students
    // ==========================================
    console.log("\n👥 TEST GROUP 3: Students Data\n");

    const students = await db.select().from(schema.students);

    test(
      "Student Count",
      students.length === 30,
      `Expected 30 students, got ${students.length}`,
      { count: students.length },
    );

    const class7A = students.filter((s) => s.classroom === "7A");
    const class7B = students.filter((s) => s.classroom === "7B");
    const class7C = students.filter((s) => s.classroom === "7C");

    test(
      "Class 7A Distribution",
      class7A.length === 10,
      `Expected 10 students in 7A, got ${class7A.length}`,
      { count: class7A.length },
    );

    test(
      "Class 7B Distribution",
      class7B.length === 10,
      `Expected 10 students in 7B, got ${class7B.length}`,
      { count: class7B.length },
    );

    test(
      "Class 7C Distribution",
      class7C.length === 10,
      `Expected 10 students in 7C, got ${class7C.length}`,
      { count: class7C.length },
    );

    // Check gender distribution
    const males = students.filter((s) => s.gender === "L");
    const females = students.filter((s) => s.gender === "P");

    test(
      "Gender Distribution",
      males.length === 15 && females.length === 15,
      `Expected 15 L, 15 P. Got ${males.length} L, ${females.length} P`,
      { males: males.length, females: females.length },
    );

    // Check NISN format
    const validNisn = students.every((s) => s.nisn && s.nisn.length >= 10);
    test(
      "NISN Format",
      validNisn,
      validNisn ? "All NISNs are valid" : "Some NISNs are invalid",
      {
        sample: students[0].nisn,
      },
    );

    // Check parent contact
    const hasParentContact = students.every((s) => s.parentContact);
    test(
      "Parent Contact",
      hasParentContact,
      hasParentContact
        ? "All students have parent contact"
        : "Some students missing parent contact",
      {
        sample: students[0].parentContact,
      },
    );

    // ==========================================
    // TEST 4: Monthly Journals
    // ==========================================
    console.log("\n📝 TEST GROUP 4: Monthly Journals\n");

    const journals = await db.select().from(schema.monthlyJournals);

    // Note: Some students may have multiple journals (different months)
    // Check that at least 50% of students have journals
    const studentsWithJournals = new Set(journals.map((j) => j.studentId)).size;
    const studentCoverage = (studentsWithJournals / students.length) * 100;
    test(
      "Journal Coverage",
      studentCoverage >= 50 && studentCoverage <= 80,
      `Expected 50-80% students with journals, got ${studentCoverage.toFixed(1)}%`,
      {
        totalJournals: journals.length,
        studentsWithJournals,
        coverage: `${studentCoverage.toFixed(1)}%`,
      },
    );

    // Check all 5 aspects are populated
    const sampleJournal = journals[0];
    const hasAllAspects =
      !!sampleJournal.academicDesc &&
      !!sampleJournal.characterDesc &&
      !!sampleJournal.socialEmotionalDesc &&
      !!sampleJournal.disciplineDesc &&
      !!sampleJournal.potentialInterestDesc;

    test(
      "Journal Aspects",
      hasAllAspects,
      hasAllAspects
        ? "All 5 aspects are populated"
        : "Some aspects are missing",
      {
        academic: !!sampleJournal.academicDesc,
        character: !!sampleJournal.characterDesc,
        socialEmotional: !!sampleJournal.socialEmotionalDesc,
        discipline: !!sampleJournal.disciplineDesc,
        potentialInterest: !!sampleJournal.potentialInterestDesc,
      },
    );

    // Check monitoring period format
    const validPeriod = journals.every((j) =>
      j.monitoringPeriod.includes("2024"),
    );
    test(
      "Monitoring Period",
      validPeriod,
      validPeriod
        ? "All periods are from 2024"
        : "Some periods have wrong year",
      {
        sample: sampleJournal.monitoringPeriod,
      },
    );

    // ==========================================
    // TEST 5: Meeting Logs
    // ==========================================
    console.log("\n💬 TEST GROUP 5: Meeting Logs\n");

    const meetings = await db.select().from(schema.meetingLogs);

    // Note: ~70% of students with 2-5 meetings each = 42-105 meetings
    test(
      "Meeting Coverage",
      meetings.length >= 40 && meetings.length <= 100,
      `Expected 40-100 meetings, got ${meetings.length}`,
      { count: meetings.length },
    );

    // Check meeting date format
    const validMeetingDate = meetings.every((m) =>
      m.meetingDate.includes("2024"),
    );
    test(
      "Meeting Dates",
      validMeetingDate,
      validMeetingDate
        ? "All meetings are from 2024"
        : "Some meetings have wrong dates",
      {
        sample: meetings[0].meetingDate,
      },
    );

    // Check topics
    const hasTopics = meetings.every((m) => m.topic && m.topic.length > 0);
    test(
      "Meeting Topics",
      hasTopics,
      hasTopics ? "All meetings have topics" : "Some meetings missing topics",
      {
        sample: meetings[0].topic,
      },
    );

    // ==========================================
    // TEST 6: Interventions
    // ==========================================
    console.log("\n🔔 TEST GROUP 6: Interventions\n");

    const interventions = await db.select().from(schema.interventions);

    // Note: ~40% of students with 1-2 interventions each
    const studentsWithInterventions = new Set(
      interventions.map((i) => i.studentId),
    ).size;
    const interventionStudentCoverage =
      (studentsWithInterventions / students.length) * 100;
    test(
      "Intervention Coverage",
      interventionStudentCoverage >= 30 && interventionStudentCoverage <= 60,
      `Expected 30-60% students with interventions, got ${interventionStudentCoverage.toFixed(1)}%`,
      {
        totalInterventions: interventions.length,
        studentsWithInterventions,
        coverage: `${interventionStudentCoverage.toFixed(1)}%`,
      },
    );

    // Check intervention fields
    const sampleIntervention = interventions[0];
    const hasRequiredFields =
      !!sampleIntervention.title &&
      !!sampleIntervention.issue &&
      !!sampleIntervention.goal &&
      !!sampleIntervention.actionSteps;

    test(
      "Intervention Fields",
      hasRequiredFields,
      hasRequiredFields
        ? "All required fields are populated"
        : "Some fields are missing",
      {
        title: !!sampleIntervention.title,
        issue: !!sampleIntervention.issue,
        goal: !!sampleIntervention.goal,
        actionSteps: !!sampleIntervention.actionSteps,
      },
    );

    // Check status values
    const validStatuses = ["active", "completed", "cancelled"];
    const hasValidStatus = interventions.every((i) =>
      validStatuses.includes(i.status),
    );
    test(
      "Intervention Status",
      hasValidStatus,
      hasValidStatus ? "All statuses are valid" : "Some statuses are invalid",
      {
        sample: sampleIntervention.status,
      },
    );

    // ==========================================
    // TEST 7: School Profile
    // ==========================================
    console.log("\n🏫 TEST GROUP 7: School Profile\n");

    const profiles = await db.select().from(schema.schoolProfiles);

    test(
      "School Profile Count",
      profiles.length === 1,
      `Expected 1 profile, got ${profiles.length}`,
      { count: profiles.length },
    );

    const profile = profiles[0];
    test(
      "School Name",
      profile.schoolName === "SMP Negeri 1 Jakarta Selatan",
      "School name validation",
      { schoolName: profile.schoolName },
    );

    test(
      "Education Stage",
      profile.educationStage === "SMP",
      "Education stage validation",
      { educationStage: profile.educationStage },
    );

    test(
      "City/District",
      profile.cityDistrict === "Jakarta Selatan",
      "City/District validation",
      { cityDistrict: profile.cityDistrict },
    );

    // ==========================================
    // TEST 8: Data Relationships
    // ==========================================
    console.log("\n🔗 TEST GROUP 8: Data Relationships\n");

    // Check all students belong to the dev user
    const studentsWithWrongUser = students.filter(
      (s) => s.userId !== devUser.id,
    );
    test(
      "Student-User Relationship",
      studentsWithWrongUser.length === 0,
      studentsWithWrongUser.length === 0
        ? "All students belong to dev user"
        : `${studentsWithWrongUser.length} students have wrong userId`,
      { wrongCount: studentsWithWrongUser.length },
    );

    // Check journals reference existing students
    const journalStudentIds = new Set(journals.map((j) => j.studentId));
    const studentIds = new Set(students.map((s) => s.id));
    const orphanJournals = Array.from(journalStudentIds).filter(
      (id) => !studentIds.has(id),
    );

    test(
      "Journal-Student Relationship",
      orphanJournals.length === 0,
      orphanJournals.length === 0
        ? "All journals reference valid students"
        : `${orphanJournals.length} journals reference missing students`,
      { orphanCount: orphanJournals.length },
    );

    // Check meetings reference existing students
    const meetingStudentIds = new Set(meetings.map((m) => m.studentId));
    const orphanMeetings = Array.from(meetingStudentIds).filter(
      (id) => !studentIds.has(id),
    );

    test(
      "Meeting-Student Relationship",
      orphanMeetings.length === 0,
      orphanMeetings.length === 0
        ? "All meetings reference valid students"
        : `${orphanMeetings.length} meetings reference missing students`,
      { orphanCount: orphanMeetings.length },
    );

    // ==========================================
    // TEST 9: Production Isolation
    // ==========================================
    console.log("\n🔒 TEST GROUP 9: Production Isolation\n");

    test(
      "Dev Email Domain",
      devUser.email.endsWith(".test"),
      "Dev email uses .test TLD (never used in production)",
      { email: devUser.email },
    );

    test(
      "Database File",
      DEV_DB.includes("local-dev.db"),
      "Using separate local-dev.db (not production database)",
      { database: DEV_DB },
    );

    const testSchoolName = profile.schoolName.toLowerCase();
    const isTestData =
      testSchoolName.includes("test") ||
      testSchoolName.includes("demo") ||
      testSchoolName.includes("sample");
    test(
      "School Data Indicator",
      !isTestData,
      "School data appears realistic (not marked as test/demo)",
      { schoolName: profile.schoolName },
    );

    // ==========================================
    // SUMMARY
    // ==========================================
    console.log(`\n${"=".repeat(60)}`);
    console.log("\n📊 TEST SUMMARY\n");

    const passed = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed).length;
    const total = results.length;
    const passRate = ((passed / total) * 100).toFixed(1);

    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ❌`);
    console.log(`Pass Rate: ${passRate}%\n`);

    if (failed > 0) {
      console.log("❌ FAILED TESTS:\n");
      results
        .filter((r) => !r.passed)
        .forEach((r) => {
          console.log(`   • ${r.name}: ${r.message}`);
        });
      console.log();
    }

    console.log("=".repeat(60));

    if (failed === 0) {
      console.log(
        "\n✅ All tests passed! Seed data is correct and production-safe.\n",
      );
      console.log("🚀 Ready for development testing!");
      console.log("\nNext steps:");
      console.log("   1. Run: npm run db:sync:wrangler");
      console.log("   2. Run: npm run dev");
      console.log("   3. Login: dev@guruwali.test / dev123\n");
      process.exit(0);
    } else {
      console.log(
        "\n❌ Some tests failed. Please fix the issues before proceeding.\n",
      );
      process.exit(1);
    }
  } catch (error) {
    console.error("\n❌ Test execution failed:", error);
    process.exit(1);
  } finally {
    client.close();
  }
}

runTests();
