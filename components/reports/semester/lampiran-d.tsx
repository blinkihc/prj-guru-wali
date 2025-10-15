// Lampiran D: Format Pelaporan Semester Guru Wali
// Based on reference PDF page 13
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
  infoRow: {
    flexDirection: "row",
    marginBottom: 5,
    alignItems: "center",
  },
  infoLabel: {
    width: 110, // atau terserah, value px
    fontSize: 12,
    fontWeight: "bold",
  },
  infoColon: {
    marginHorizontal: 2, // beri sedikit jarak antara label dan ':' jika ingin
    fontSize: 12,
    fontWeight: "bold",
  },
  infoValue: {
    marginLeft: 8, // supaya value tidak nempel ke titik dua, jangan terlalu besar
    fontSize: 12,
    flexShrink: 1, // agar teks panjang tidak overflow
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
    lineHeight: 1.3,
  },
  paragraph: {
    fontSize: 12,
    lineHeight: 1.5,
    marginBottom: 10,
    textAlign: "justify",
  },
});

interface LampiranDProps {
  guruWaliName: string;
  kelasMurid: string;
  semester: string;
  tahunAjaran: string;
  rekapPertemuan: {
    bulan: string;
    jumlah: number;
    format: string;
    persentase: string;
  }[];
}

export function LampiranD({
  guruWaliName,
  kelasMurid,
  semester,
  tahunAjaran,
  rekapPertemuan,
}: LampiranDProps) {
  return (
    <Page size={[612, 936]} style={styles.page}>
      <Text style={styles.title}>
        LAMPIRAN D: FORMAT PELAPORAN SEMESTER GURU WALI
      </Text>

      {/* Header Info */}
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Nama Guru Wali </Text>
        <Text style={styles.infoColon}>:</Text>
        <Text style={styles.infoValue}>{guruWaliName}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Kelas/Murid Dampingan </Text>
        <Text style={styles.infoColon}>:</Text>
        <Text style={styles.infoValue}>{kelasMurid}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Semester </Text>
        <Text style={styles.infoColon}>:</Text>
        <Text style={styles.infoValue}>{semester}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Tahun Ajaran </Text>
        <Text style={styles.infoColon}>:</Text>
        <Text style={styles.infoValue}>{tahunAjaran}</Text>
      </View>

      {/* Section 1: Rekapitulasi Pertemuan */}
      <Text style={styles.sectionTitle}>1. Rekapitulasi Pertemuan</Text>

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
            <Text style={styles.tableCell}>Format (Individu/Kelompok)</Text>
          </View>
          <View
            style={[styles.tableCol, { width: "25%" }, styles.tableColLast]}
          >
            <Text style={styles.tableCell}>Persentase Kehadiran</Text>
          </View>
        </View>

        {/* Data Rows */}
        {rekapPertemuan.map((row, idx) => (
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

      {/* Section 2: General Development Summary */}
      <Text style={styles.sectionTitle}>2. Catatan Perkembangan Umum</Text>
      <Text style={styles.paragraph}>
        Selama {semester} {tahunAjaran}, secara keseluruhan murid dampingan
        menunjukkan perkembangan yang positif dalam berbagai aspek. Dari sisi
        akademik, sebagian besar murid mampu mengikuti pembelajaran dengan baik
        meskipun masih ada beberapa yang memerlukan bimbingan khusus pada mata
        pelajaran tertentu.
      </Text>
      <Text style={styles.paragraph}>
        Dalam aspek pembentukan karakter, murid menunjukkan peningkatan dalam
        hal kedisiplinan, tanggung jawab, dan kemampuan bersosialisasi.
        Nilai-nilai seperti kejujuran dan empati mulai tertanam dengan baik
        melalui pendampingan berkelanjutan yang dilakukan.
      </Text>
      <Text style={styles.paragraph}>
        Perkembangan sosial-emosional murid juga menunjukkan tren positif,
        dengan meningkatnya kemampuan mereka dalam mengelola emosi dan membangun
        hubungan yang sehat dengan teman sebaya maupun guru. Beberapa murid yang
        sebelumnya cenderung pendiam mulai lebih aktif berpartisipasi dalam
        kegiatan kelompok.
      </Text>

      {/* Section 3: Follow-up Recommendations */}
      <Text style={styles.sectionTitle}>3. Rekomendasi Tindak Lanjut</Text>
      <Text style={styles.paragraph}>
        Berdasarkan hasil pemantauan selama semester ini, berikut adalah
        rekomendasi untuk semester berikutnya:
      </Text>
      <Text style={styles.paragraph}>
        a. Akademik: Perlu dilakukan program remedial khusus bagi murid yang
        masih mengalami kesulitan di mata pelajaran tertentu, serta pengayaan
        bagi murid yang sudah menunjukkan prestasi baik.
      </Text>
      <Text style={styles.paragraph}>
        b. Karakter: Melanjutkan program pembinaan karakter dengan fokus pada
        penguatan nilai-nilai integritas dan kepemimpinan. Libatkan murid dalam
        kegiatan yang melatih tanggung jawab dan kemandirian.
      </Text>
      <Text style={styles.paragraph}>
        c. Sosial-Emosional: Tingkatkan program peer support dan mentoring untuk
        membantu murid yang masih memerlukan dukungan dalam berinteraksi sosial.
        Adakan sesi sharing berkala untuk memperkuat bonding antar murid.
      </Text>
      <Text style={styles.paragraph}>
        d. Kolaborasi: Perluas koordinasi dengan orang tua melalui pertemuan
        rutin dan komunikasi intensif untuk memastikan konsistensi pendampingan
        di rumah dan sekolah.
      </Text>
    </Page>
  );
}
