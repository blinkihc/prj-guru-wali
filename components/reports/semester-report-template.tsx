// Semester Report PDF Template - Main Orchestrator
// SOLID principles - delegates to modular components
// Font: Times New Roman, Header 14, Body 12

import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { LampiranA } from "./semester/lampiran-a";
import { LampiranB } from "./semester/lampiran-b";
import { LampiranC } from "./semester/lampiran-c";
import { LampiranD } from "./semester/lampiran-d";
import { SOPPages } from "./semester/sop-pages";

const coverStyles = StyleSheet.create({
  page: {
    padding: 60,
    fontFamily: "Times-Roman",
    fontSize: 12,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10,
  },
  info: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 8,
  },
});

interface SemesterReportProps {
  semester: "Ganjil" | "Genap";
  tahunAjaran: string;
  periodeStart: string;
  periodeEnd: string;
  guruWaliName: string;
  schoolName: string;
  students: any[];
  studentJournals: any[]; // Per student data for Lampiran B
  meetingSummary: any[]; // For Lampiran D
}

export function SemesterReportDocument({
  semester,
  tahunAjaran,
  periodeStart,
  periodeEnd,
  guruWaliName,
  schoolName,
  students,
  studentJournals,
  meetingSummary,
}: SemesterReportProps) {
  // Calculate meeting statistics for Lampiran C
  const totalPertemuan = meetingSummary.reduce(
    (sum, item) => sum + item.jumlah,
    0,
  );
  const avgKehadiran =
    meetingSummary.reduce((sum, item) => {
      const pct = Number.parseFloat(item.persentase.replace("%", "")) || 0;
      return sum + pct;
    }, 0) / (meetingSummary.length || 1);
  const rataRataKehadiran = `${avgKehadiran.toFixed(1)}%`;

  return (
    <Document>
      {/* Cover Page */}
      <Page size={[612, 936]} style={coverStyles.page}>
        <Text style={coverStyles.title}>LAPORAN GURU WALI</Text>
        <Text style={coverStyles.subtitle}>{schoolName}</Text>
        <View style={{ marginTop: 40 }}>
          <Text style={coverStyles.info}>Semester {semester}</Text>
          <Text style={coverStyles.info}>Tahun Ajaran {tahunAjaran}</Text>
        </View>
        <View style={{ marginTop: 60 }}>
          <Text style={coverStyles.info}>Guru Wali:</Text>
          <Text
            style={[coverStyles.info, { fontWeight: "bold", fontSize: 14 }]}
          >
            {guruWaliName}
          </Text>
        </View>
      </Page>

      {/* SOP Pages (Static - Pages 2-4) */}
      <SOPPages schoolName={schoolName} tahunAjaran={tahunAjaran} />

      {/* Lampiran A: Daftar Siswa */}
      <LampiranA students={students} />

      {/* Lampiran B: Per Student (One page per student) */}
      <LampiranB journals={studentJournals} />

      {/* Lampiran C: Rekap Kegiatan */}
      <LampiranC
        meetingSummary={meetingSummary}
        totalPertemuan={totalPertemuan}
        rataRataKehadiran={rataRataKehadiran}
      />

      {/* Lampiran D: Pelaporan Semester */}
      <LampiranD
        guruWaliName={guruWaliName}
        kelasMurid={`Kelas ${students[0]?.classroom || "7"} - ${students.length} Siswa`}
        semester={semester}
        tahunAjaran={tahunAjaran}
        rekapPertemuan={meetingSummary}
      />
    </Document>
  );
}
