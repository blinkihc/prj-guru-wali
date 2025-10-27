// Biodata utils tests - Validasi utilitas normalisasi biodata siswa
// Created: 2025-10-20 - Tambah skenario untuk perubahan sosial media & pembaruan field

import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import type { StudentSocialUsage } from "@/drizzle/schema/student-social-usages";
import {
  deriveSocialUsageChanges,
  type NormalizedSocialUsage,
  normalizeStudentUpdates,
} from "@/lib/services/students/biodata-utils";

function buildExistingUsage(overrides: Partial<StudentSocialUsage> = {}) {
  return {
    id: overrides.id ?? randomUUID(),
    studentId: overrides.studentId ?? "student-1",
    platform: overrides.platform ?? "Instagram",
    isActive: overrides.isActive ?? 1,
    username: overrides.username ?? "siswa123",
    createdAt: overrides.createdAt ?? new Date().toISOString(),
  } satisfies StudentSocialUsage;
}

describe("normalizeStudentUpdates", () => {
  it("membersihkan string, mengonversi angka, dan mengabaikan field kosong", () => {
    const result = normalizeStudentUpdates({
      fullName: "  Arya Kusuma  ",
      fatherIncome: "2500000",
      motherIncome: " ",
      address: "",
      phoneNumber: "+62 81234567890 ",
      socialUsages: [
        {
          platform: " Instagram ",
          username: "  arya.id  ",
          isActive: "true",
        },
      ],
      unknownField: "ignored",
    });

    expect(result.studentUpdates.fullName).toBe("Arya Kusuma");
    expect(result.studentUpdates.fatherIncome).toBe(2_500_000);
    expect(result.studentUpdates.motherIncome).toBeNull();
    expect(result.studentUpdates.address).toBeNull();
    expect(result.studentUpdates.phoneNumber).toBe("+62 81234567890");
    expect(result.studentUpdates).not.toHaveProperty("unknownField");

    expect(result.socialUsages).toEqual<NormalizedSocialUsage[]>([
      {
        platform: "Instagram",
        username: "arya.id",
        isActive: true,
      },
    ]);
  });

  it("tidak menambahkan field bila tidak ada data dan mempertahankan nilai boolean", () => {
    const result = normalizeStudentUpdates({
      nisn: undefined,
      dream: null,
      socialUsages: [
        {
          id: "usage-1",
          platform: "YouTube",
          username: "channel-id",
          isActive: false,
        },
      ],
    });

    expect(result.studentUpdates).not.toHaveProperty("nisn");
    expect(result.studentUpdates.dream).toBeNull();
    expect(result.socialUsages).toEqual<NormalizedSocialUsage[]>([
      {
        id: "usage-1",
        platform: "YouTube",
        username: "channel-id",
        isActive: false,
      },
    ]);
  });
});

describe("deriveSocialUsageChanges", () => {
  it("menghasilkan daftar insert, update, dan delete yang tepat", () => {
    const existing: StudentSocialUsage[] = [
      buildExistingUsage({
        id: "usage-1",
        platform: "Instagram",
        username: "lama",
        isActive: 1,
      }),
      buildExistingUsage({
        id: "usage-2",
        platform: "TikTok",
        username: "@tiktok",
        isActive: 0,
      }),
    ];

    const incoming: NormalizedSocialUsage[] = [
      {
        id: "usage-1",
        platform: "Instagram",
        username: "baru",
        isActive: true,
      },
      {
        platform: "YouTube",
        username: "channel-baru",
        isActive: true,
      },
    ];

    const changes = deriveSocialUsageChanges(existing, incoming);

    expect(changes.toInsert).toEqual([
      {
        platform: "YouTube",
        username: "channel-baru",
        isActive: 1,
      },
    ]);

    expect(changes.toUpdate).toEqual([
      {
        id: "usage-1",
        platform: "Instagram",
        username: "baru",
        isActive: 1,
      },
    ]);

    expect(changes.toDelete).toEqual(["usage-2"]);
  });

  it("tidak membuat perubahan ketika data sama persis", () => {
    const existing: StudentSocialUsage[] = [
      buildExistingUsage({
        id: "usage-1",
        platform: "Instagram",
        username: "sama",
        isActive: 1,
      }),
    ];

    const incoming: NormalizedSocialUsage[] = [
      {
        id: "usage-1",
        platform: "Instagram",
        username: "sama",
        isActive: true,
      },
    ];

    const changes = deriveSocialUsageChanges(existing, incoming);

    expect(changes.toInsert).toHaveLength(0);
    expect(changes.toUpdate).toHaveLength(0);
    expect(changes.toDelete).toHaveLength(0);
  });
});
