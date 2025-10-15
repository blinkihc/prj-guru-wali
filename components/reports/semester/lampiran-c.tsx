// Lampiran C: Rekap Kegiatan/Pertemuan
// Display meeting summaries with details
// Font: Times New Roman 12

import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Times-Roman",
    fontSize: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  paragraph: {
    fontSize: 12,
    lineHeight: 1.5,
    marginBottom: 10,
    textAlign: "justify",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
  },
  table: {
    marginTop: 10,
    border: "1pt solid #000000",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    minHeight: 30,
  },
  tableHeader: {
    backgroundColor: "#C6E0B4",
    fontWeight: "bold",
  },
  tableCol: {
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: "#000000",
    justifyContent: "center",
  },
  tableColLast: {
    borderRightWidth: 0,
  },
  tableCell: {
    fontSize: 12,
    lineHeight: 1.4,
  },
});

interface MeetingSummary {
  bulan: string;
  jumlah: number;
  format: string;
  persentase: string;
}

interface LampiranCProps {
  meetingSummary: MeetingSummary[];
  totalPertemuan: number;
  rataRataKehadiran: string;
}

export function LampiranC({
  meetingSummary,
  totalPertemuan,
  rataRataKehadiran,
}: LampiranCProps) {
  return (
    <Page size={[612, 936]} style={styles.page}>
      <Text style={styles.title}>
        LAMPIRAN C: REKAPITULASI KEGIATAN PERTEMUAN
      </Text>

      <Text style={styles.paragraph}>
        Berikut adalah rekapitulasi kegiatan pertemuan guru wali dengan murid
        dampingan selama periode semester ini:
      </Text>

      {/* Meeting Summary Table */}
      <View style={styles.table}>
        {/* Header */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={[styles.tableCol, { width: "25%" }]}>
            <Text style={styles.tableCell}>Bulan</Text>
          </View>
          <View style={[styles.tableCol, { width: "25%" }]}>
            <Text style={styles.tableCell}>Jumlah Pertemuan</Text>
          </View>
          <View style={[styles.tableCol, { width: "25%" }]}>
            <Text style={styles.tableCell}>Format Pertemuan</Text>
          </View>
          <View
            style={[styles.tableCol, { width: "25%" }, styles.tableColLast]}
          >
            <Text style={styles.tableCell}>Persentase Kehadiran</Text>
          </View>
        </View>

        {/* Data Rows */}
        {meetingSummary.map((row, idx) => (
          <View key={idx} style={styles.tableRow}>
            <View style={[styles.tableCol, { width: "25%" }]}>
              <Text style={styles.tableCell}>{row.bulan}</Text>
            </View>
            <View style={[styles.tableCol, { width: "25%" }]}>
              <Text style={styles.tableCell}>{row.jumlah}</Text>
            </View>
            <View style={[styles.tableCol, { width: "25%" }]}>
              <Text style={styles.tableCell}>{row.format}</Text>
            </View>
            <View
              style={[styles.tableCol, { width: "25%" }, styles.tableColLast]}
            >
              <Text style={styles.tableCell}>{row.persentase}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Summary Statistics */}
      <Text style={styles.sectionTitle}>Ringkasan:</Text>
      <Text style={styles.paragraph}>
        • Total Pertemuan: {totalPertemuan} kali
      </Text>
      <Text style={styles.paragraph}>
        • Rata-rata Kehadiran: {rataRataKehadiran}
      </Text>
      <Text style={styles.paragraph}>
        • Catatan: Pertemuan dilakukan secara individu dan kelompok sesuai
        dengan kebutuhan dan kondisi murid dampingan.
      </Text>
    </Page>
  );
}
