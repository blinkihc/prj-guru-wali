// Tests for import parser - Created: 2025-10-22
import { describe, expect, it } from "vitest";
import { MAX_SOCIAL_SLOTS, parseCsvRows } from "./import-parser";

describe("parseCsvRows", () => {
  it("menormalkan nilai dan sosial media valid", () => {
    const rows = parseCsvRows([
      {
        "Nama Lengkap": "  Budi Santoso  ",
        NIS: " 771231 ",
        NISN: "0012345678",
        Kelas: " 7A ",
        "Jenis Kelamin": "l",
        "Tempat Lahir": " Bandung ",
        "Tanggal Lahir": "12/8/2010",
        Agama: " Islam ",
        "Golongan Darah": " O ",
        "Status Ekonomi": "Menengah",
        Alamat: "Jl. Merdeka",
        "Nomor HP Siswa": "081234567890",
        "Cita-cita": "Dokter",
        Ekstrakurikuler: "Basket",
        Hobi: "Membaca",
        "URL Foto": " https://example.com/photo.jpg ",
        "Nama Orang Tua/Wali": "Ibu Ani",
        "Kontak Orang Tua": "628123456780",
        "Nama Ayah": "Pak Santoso",
        "Pekerjaan Ayah": "Guru",
        "Penghasilan Ayah": "2.500.000",
        "Nama Ibu": "Ibu Sari",
        "Pekerjaan Ibu": "Wiraswasta",
        "Penghasilan Ibu": "3500000",
        "Riwayat Kesehatan (Dulu)": "Asma",
        "Riwayat Kesehatan (Sekarang)": "-",
        "Riwayat Kesehatan (Sering)": "Batuk",
        "Kekuatan Karakter": "Disiplin",
        "Perlu Peningkatan Karakter": "Konsentrasi",
        "Catatan Khusus": "Perlu perhatian di matematika",
        "Alamat Email Siswa": "-",
        "Nomor HP Alternatif": "-",
        "Sosial 1 Platform": "Instagram ",
        "Sosial 1 Username": " budi.ig ",
        "Sosial 1 Status": "Aktif",
        "Sosial 2 Platform": "-",
        "Sosial 2 Username": "",
        "Sosial 2 Status": "-",
        "Sosial 3 Platform": "",
        "Sosial 3 Username": "",
        "Sosial 3 Status": "",
      },
    ]);

    expect(rows).toHaveLength(1);
    const row = rows[0];
    expect(row.fullName).toBe("Budi Santoso");
    expect(row.gender).toBe("L");
    expect(row.birthDate).toBe("2010-08-12");
    expect(row.fatherIncome).toBe(2500000);
    expect(row.motherIncome).toBe(3500000);
    expect(row.photoUrl).toBe("https://example.com/photo.jpg");
    expect(row.socialUsages).toHaveLength(MAX_SOCIAL_SLOTS);
    expect(row.socialUsages[0]).toEqual({
      platform: "Instagram",
      username: "budi.ig",
      isActive: true,
    });
    expect(row.socialUsages[1]).toEqual({
      platform: null,
      username: null,
      isActive: false,
    });
    expect(row._isValid).toBe(true);
    expect(Object.keys(row._errors)).toHaveLength(0);
    expect(row._rowNumber).toBe(2);
    expect(typeof row._rowId).toBe("string");
  });

  it("menandai error untuk data yang tidak valid", () => {
    const rows = parseCsvRows([
      {
        "Nama Lengkap": "",
        NIS: "-",
        NISN: "",
        Kelas: "8B",
        "Jenis Kelamin": "X",
        "Tempat Lahir": "Jakarta",
        "Tanggal Lahir": "invalid-date",
        Agama: "Islam",
        "Golongan Darah": "A",
        "Status Ekonomi": "-",
        Alamat: "-",
        "Nomor HP Siswa": "",
        "Cita-cita": "",
        Ekstrakurikuler: "",
        Hobi: "",
        "URL Foto": "",
        "Nama Orang Tua/Wali": "",
        "Kontak Orang Tua": "",
        "Nama Ayah": "",
        "Pekerjaan Ayah": "",
        "Penghasilan Ayah": "abc",
        "Nama Ibu": "",
        "Pekerjaan Ibu": "",
        "Penghasilan Ibu": "xyz",
        "Riwayat Kesehatan (Dulu)": "",
        "Riwayat Kesehatan (Sekarang)": "",
        "Riwayat Kesehatan (Sering)": "",
        "Kekuatan Karakter": "",
        "Perlu Peningkatan Karakter": "",
        "Catatan Khusus": "",
        "Alamat Email Siswa": "",
        "Nomor HP Alternatif": "",
        "Sosial 1 Platform": "",
        "Sosial 1 Username": "",
        "Sosial 1 Status": "",
        "Sosial 2 Platform": "",
        "Sosial 2 Username": "",
        "Sosial 2 Status": "",
        "Sosial 3 Platform": "",
        "Sosial 3 Username": "",
        "Sosial 3 Status": "",
      },
    ]);

    expect(rows).toHaveLength(1);
    const row = rows[0];
    expect(row.fullName).toBe("");
    expect(row.gender).toBeNull();
    expect(row.birthDate).toBeNull();
    expect(row.fatherIncome).toBeNull();
    expect(row.motherIncome).toBeNull();
    expect(row._isValid).toBe(false);
    expect(row._errors.fullName).toBe("Nama lengkap wajib diisi");
    expect(row._errors.gender).toBe("Jenis kelamin harus 'L' atau 'P'");
    expect(row._errors.birthDate).toBe(
      "Format tanggal tidak valid (YYYY-MM-DD)",
    );
    expect(row._errors.fatherIncome).toBe(
      "Penghasilan ayah harus berupa angka",
    );
    expect(row._errors.motherIncome).toBe("Penghasilan ibu harus berupa angka");
    expect(row.socialUsages).toHaveLength(MAX_SOCIAL_SLOTS);
  });
});
