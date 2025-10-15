// Test PDF Generation with Services
import { renderToBuffer } from "@react-pdf/renderer";
import { SemesterReportDocument } from "./components/reports/semester-report-template";
import { PDFGeneratorService } from "./lib/services/pdf-generator";

const testData = {
  semester: "Ganjil" as const,
  tahunAjaran: "2024/2025",
  periodeStart: "2024-07-01",
  periodeEnd: "2024-12-31",
  guruWaliName: "Test Guru",
  schoolName: "SMP Test",
  students: [
    {
      id: "1",
      fullName: "Test Student",
      classroom: "7A",
      nisn: "123456",
      gender: "L",
    },
  ],
  studentJournals: [
    {
      studentName: "Test Student",
      classroom: "7A",
      periode: "Semester Ganjil 2024/2025",
      guruWali: "Test Guru",
      academicDesc: "Test academic",
      academicAction: "Test action",
      characterDesc: "Test character",
      characterAction: "Test action",
      socialEmotionalDesc: "Test social",
      socialEmotionalAction: "Test action",
      disciplineDesc: "Test discipline",
      disciplineAction: "Test action",
      potentialInterestDesc: "Test potential",
      potentialInterestAction: "Test action",
    },
  ],
  meetingSummary: [
    { bulan: "Agustus", jumlah: 1, format: "Kelompok", persentase: "100%" },
  ],
};

async function test() {
  try {
    console.log("=== Test 1: Direct Generation ===");
    const doc = SemesterReportDocument(testData);
    const buffer = await renderToBuffer(doc);
    console.log(`✓ Success! PDF size: ${buffer.length} bytes\n`);

    console.log("=== Test 2: Service with Progress ===");
    const generator = new PDFGeneratorService();
    const doc2 = SemesterReportDocument(testData);
    const buffer2 = await generator.generate(doc2, {
      onProgress: (progress) => {
        console.log(
          `  ${progress.stage}: ${progress.progress}% - ${progress.message}`,
        );
      },
    });
    console.log(`✓ Success! PDF size: ${buffer2.length} bytes\n`);

    console.log("=== All Tests Passed! ===");
  } catch (error) {
    console.error("Error:", error);
  }
}

test();
