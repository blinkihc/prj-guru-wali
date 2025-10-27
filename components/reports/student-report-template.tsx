// Student Report PDF Template
// Created: 2025-01-14
// Updated: 2025-10-20 - Gunakan tipe PDF generator agar bebas any
// Full student report dengan profile, journals, meetings, dan interventions

import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { Student } from "@/drizzle/schema/students";
import type {
  Intervention,
  JournalEntry,
  MeetingLog,
} from "@/lib/services/pdf-generator-edge";

// F4 Legal Size: 215.9mm × 330.2mm = 612pt × 936pt
// Styling matches reference PDF with green headers (#C6E0B4) and black borders

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
    fontSize: 10,
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
    borderBottom: "1pt solid #000000",
    paddingBottom: 10,
  },
  schoolName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 5,
  },
  reportTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#000000",
  },
  reportDate: {
    fontSize: 9,
    color: "#000000",
  },
  section: {
    marginTop: 15,
    marginBottom: 10,
    border: "1pt solid #000000",
    padding: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 8,
    backgroundColor: "#C6E0B4",
    padding: 6,
    borderBottom: "1pt solid #000000",
    marginLeft: -10,
    marginRight: -10,
    marginTop: -10,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  infoLabel: {
    width: "35%",
    fontWeight: "bold",
    color: "#000000",
    fontSize: 9,
  },
  infoValue: {
    width: "65%",
    color: "#000000",
    fontSize: 9,
  },
  card: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#ffffff",
    border: "1pt solid #000000",
  },
  cardTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#000000",
  },
  cardSubtitle: {
    fontSize: 9,
    color: "#000000",
    marginBottom: 6,
  },
  cardContent: {
    fontSize: 9,
    lineHeight: 1.4,
    color: "#000000",
  },
  aspectBox: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: "#ffffff",
    border: "1pt solid #000000",
  },
  aspectTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#000000",
  },
  aspectText: {
    fontSize: 9,
    lineHeight: 1.4,
    color: "#000000",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#000000",
    borderTop: "1pt solid #000000",
    paddingTop: 8,
  },
  badge: {
    display: "flex",
    padding: "2 6",
    borderRadius: 3,
    fontSize: 8,
    fontWeight: "bold",
  },
  badgeActive: {
    backgroundColor: "#dbeafe",
    color: "#1e40af",
  },
  badgeCompleted: {
    backgroundColor: "#dcfce7",
    color: "#15803d",
  },
  badgeCancelled: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
  },
});

interface StudentReportProps {
  student: Student;
  journals: JournalEntry[];
  meetings: MeetingLog[];
  interventions: Intervention[];
  schoolName?: string;
  generatedAt?: Date;
}

export function StudentReportDocument({
  student,
  journals,
  meetings,
  interventions,
  schoolName = "Sekolah Default",
  generatedAt = new Date(),
}: StudentReportProps) {
  return (
    <Document>
      <Page size={[612, 936]} style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.schoolName}>{schoolName}</Text>
          <Text style={styles.reportTitle}>Laporan Lengkap Siswa</Text>
          <Text style={styles.reportDate}>
            Dicetak:{" "}
            {generatedAt.toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>

        {/* Student Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Siswa</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nama Lengkap:</Text>
            <Text style={styles.infoValue}>{student.fullName}</Text>
          </View>

          {student.nisn && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>NISN:</Text>
              <Text style={styles.infoValue}>{student.nisn}</Text>
            </View>
          )}

          {student.classroom && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Kelas:</Text>
              <Text style={styles.infoValue}>{student.classroom}</Text>
            </View>
          )}

          {student.gender && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Jenis Kelamin:</Text>
              <Text style={styles.infoValue}>
                {student.gender === "L" ? "Laki-laki" : "Perempuan"}
              </Text>
            </View>
          )}

          {student.parentName && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nama Orang Tua:</Text>
              <Text style={styles.infoValue}>{student.parentName}</Text>
            </View>
          )}

          {student.parentContact && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Kontak Orang Tua:</Text>
              <Text style={styles.infoValue}>+{student.parentContact}</Text>
            </View>
          )}

          {student.specialNotes && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Catatan Khusus:</Text>
              <Text style={styles.infoValue}>{student.specialNotes}</Text>
            </View>
          )}
        </View>

        {/* Summary Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ringkasan</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Jurnal:</Text>
            <Text style={styles.infoValue}>{journals.length} catatan</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Pertemuan:</Text>
            <Text style={styles.infoValue}>{meetings.length} pertemuan</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Rencana Intervensi:</Text>
            <Text style={styles.infoValue}>{interventions.length} rencana</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Laporan ini digenerate otomatis oleh Guru Wali Digital Companion
        </Text>
      </Page>

      {/* Journals Pages */}
      {journals.length > 0 &&
        journals.map((journal) => (
          <Page key={journal.id} size="A4" style={styles.page}>
            <View style={styles.header}>
              <Text style={styles.reportTitle}>
                Jurnal Bulanan - {journal.month} {journal.year}
              </Text>
              <Text style={styles.reportDate}>
                Dibuat:{" "}
                {new Date(
                  `${journal.year}-${journal.month}-01`,
                ).toLocaleDateString("id-ID")}
              </Text>
            </View>

            {journal.academicProgress && (
              <View style={styles.aspectBox}>
                <Text style={styles.aspectTitle}>📚 Aspek Akademik</Text>
                <Text style={styles.aspectText}>
                  {journal.academicProgress}
                </Text>
              </View>
            )}

            {journal.socialBehavior && (
              <View style={styles.aspectBox}>
                <Text style={styles.aspectTitle}>⭐ Aspek Karakter</Text>
                <Text style={styles.aspectText}>{journal.socialBehavior}</Text>
              </View>
            )}

            {journal.emotionalState && (
              <View style={styles.aspectBox}>
                <Text style={styles.aspectTitle}>
                  🤝 Aspek Sosial-Emosional
                </Text>
                <Text style={styles.aspectText}>{journal.emotionalState}</Text>
              </View>
            )}

            {journal.physicalHealth && (
              <View style={styles.aspectBox}>
                <Text style={styles.aspectTitle}>📋 Aspek Kedisiplinan</Text>
                <Text style={styles.aspectText}>{journal.physicalHealth}</Text>
              </View>
            )}

            {journal.spiritualDevelopment && (
              <View style={styles.aspectBox}>
                <Text style={styles.aspectTitle}>🎯 Aspek Potensi & Minat</Text>
                <Text style={styles.aspectText}>
                  {journal.spiritualDevelopment}
                </Text>
              </View>
            )}

            <Text style={styles.footer}>Jurnal Bulanan</Text>
          </Page>
        ))}

      {/* Meetings & Interventions Page */}
      {(meetings.length > 0 || interventions.length > 0) && (
        <Page size={[612, 936]} style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.reportTitle}>Pertemuan & Intervensi</Text>
          </View>

          {/* Meetings */}
          {meetings.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Log Pertemuan</Text>

              {meetings.slice(0, 5).map((meeting) => (
                <View key={meeting.id} style={styles.card}>
                  <Text style={styles.cardTitle}>{meeting.topic}</Text>
                  <Text style={styles.cardSubtitle}>
                    {new Date(meeting.date).toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Text>
                  {meeting.type && (
                    <Text style={styles.cardContent}>
                      Format: {meeting.type}
                    </Text>
                  )}
                  {meeting.notes && (
                    <Text style={styles.cardContent}>
                      Catatan: {meeting.notes}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Interventions */}
          {interventions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Rencana Intervensi</Text>

              {interventions.slice(0, 3).map((intervention) => (
                <View key={intervention.id} style={styles.card}>
                  <Text style={styles.cardTitle}>{intervention.issue}</Text>
                  <Text style={styles.cardContent}>
                    Langkah: {intervention.action}
                  </Text>
                  <Text style={styles.cardContent}>
                    Hasil: {intervention.result}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <Text style={styles.footer}>
            Halaman Terakhir - Pertemuan & Intervensi
          </Text>
        </Page>
      )}
    </Document>
  );
}
