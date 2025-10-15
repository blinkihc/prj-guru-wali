// SOP Pages Component (Pages 2-4)
// STATIC content exactly from reference PDF
// Font: Times New Roman 12 (body), 14 (header)

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
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    textAlign: "left",
    marginBottom: 3,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
  },
  paragraph: {
    fontSize: 12,
    lineHeight: 1.5,
    marginBottom: 8,
    textAlign: "justify",
  },
  bulletItem: {
    fontSize: 12,
    marginLeft: 20,
    marginBottom: 4,
  },
  table: {
    marginTop: 10,
    marginBottom: 10,
    border: "1pt solid #000000",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
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
});

interface SOPPagesProps {
  schoolName: string;
  tahunAjaran: string;
}

export function SOPPages({ schoolName, tahunAjaran }: SOPPagesProps) {
  return (
    <>
      {/* Page 2: SOP Guru Wali */}
      <Page size={[612, 936]} style={styles.page}>
        <Text style={styles.title}>STANDAR OPERASIONAL PROSEDUR (SOP)</Text>
        <Text style={styles.title}>GURU WALI</Text>
        <Text style={styles.subtitle}>Satuan Pendidikan: {schoolName}</Text>
        <Text style={styles.subtitle}>Tahun Ajaran: {tahunAjaran}</Text>

        <Text style={styles.sectionTitle}>I. Dasar Hukum</Text>
        <Text style={styles.bulletItem}>
          1. Permendikdasmen No. 11 Tahun 2025 tentang Pemenuhan Beban Kerja
          Guru
        </Text>
        <Text style={styles.bulletItem}>
          2. Pasal 9 ayat (1-5): Kewajiban dan ruang lingkup tugas Guru Wali
        </Text>
        <Text style={styles.bulletItem}>
          3. Pasal 14: Ekuivalensi tugas Guru Wali setara 2 JP per minggu
        </Text>
        <Text style={styles.bulletItem}>
          4. Pasal 17 dan 18: Penetapan, pelaksanaan, dan penghitungan beban
          kerja
        </Text>

        <Text style={styles.sectionTitle}>II. Pengertian</Text>
        <Text style={styles.paragraph}>
          <Text style={{ fontWeight: "bold" }}>Guru Wali</Text> adalah guru mata
          pelajaran yang diberi tugas mendampingi perkembangan akademik,
          karakter, keterampilan, dan kompetensi murid dari saat masuk hingga
          lulus pada satuan pendidikan yang sama.
        </Text>

        <Text style={styles.sectionTitle}>III. Tujuan</Text>
        <Text style={styles.paragraph}>Adapun tujuan guru wali yaitu :</Text>
        <Text style={styles.bulletItem}>
          • Menjamin pelaksanaan pendampingan murid secara menyeluruh dan
          berkesinambungan.
        </Text>
        <Text style={styles.bulletItem}>
          • Meningkatkan keterlibatan guru dalam pendidikan karakter dan
          pengembangan potensi murid.
        </Text>
        <Text style={styles.bulletItem}>
          • Memberikan dukungan sistematis terhadap pertumbuhan akademik dan
          non-akademik peserta didik.
        </Text>

        <Text style={styles.sectionTitle}>IV. Ruang Lingkup Tugas</Text>
        <Text style={styles.paragraph}>
          Berdasarkan Pasal 9 ayat (2), Guru Wali melaksanakan tugas sebagai
          berikut:
        </Text>

        <Text style={{ ...styles.bulletItem, fontWeight: "bold" }}>
          1. Pendampingan Akademik
        </Text>
        <Text style={styles.paragraph}>
          Membantu murid dalam perencanaan dan refleksi belajar.
        </Text>

        <Text style={{ ...styles.bulletItem, fontWeight: "bold" }}>
          2. Pengembangan Kompetensi dan Keterampilan
        </Text>
        <Text style={styles.paragraph}>
          Mendorong minat bakat serta pengembangan soft skills.
        </Text>

        <Text style={{ ...styles.bulletItem, fontWeight: "bold" }}>
          3. Pembinaan Karakter
        </Text>
        <Text style={styles.paragraph}>
          Menanamkan nilai kedisiplinan, kejujuran, tanggung jawab, dan empati.
        </Text>

        <Text style={{ ...styles.bulletItem, fontWeight: "bold" }}>
          4. Pendampingan Berkelanjutan
        </Text>
        <Text style={styles.paragraph}>
          Menjadi pendamping murid dari awal hingga akhir masa belajar.
        </Text>

        <Text style={styles.sectionTitle}>V. Prosedur Pelaksanaan</Text>

        <Text style={{ ...styles.paragraph, fontWeight: "bold" }}>
          1. Penunjukan Guru Wali
        </Text>
        <Text style={styles.bulletItem}>
          • Dilakukan oleh Kepala Sekolah (Pasal 18 ayat 1).
        </Text>
        <Text style={styles.bulletItem}>
          • Berdasarkan rasio jumlah murid dengan jumlah guru mata pelajaran
          (Pasal 18 ayat 2).
        </Text>
      </Page>

      {/* Page 3: Prosedur Pelaksanaan */}
      <Page size={[612, 936]} style={styles.page}>
        <Text
          style={{ ...styles.paragraph, fontWeight: "bold", marginTop: 10 }}
        >
          2. Pelaksanaan Tugas
        </Text>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={[styles.tableCol, { width: "5%" }]}>
              <Text style={styles.tableCell}>No</Text>
            </View>
            <View style={[styles.tableCol, { width: "35%" }]}>
              <Text style={styles.tableCell}>Kegiatan</Text>
            </View>
            <View style={[styles.tableCol, { width: "35%" }]}>
              <Text style={styles.tableCell}>Penjelasan</Text>
            </View>
            <View
              style={[styles.tableCol, { width: "25%" }, styles.tableColLast]}
            >
              <Text style={styles.tableCell}>Waktu Pelaksanaan</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: "5%" }]}>
              <Text style={styles.tableCell}>1</Text>
            </View>
            <View style={[styles.tableCol, { width: "35%" }]}>
              <Text style={styles.tableCell}>Identifikasi murid dampingan</Text>
            </View>
            <View style={[styles.tableCol, { width: "35%" }]}>
              <Text style={styles.tableCell}>
                Memahami latar belakang, potensi, dan tantangan murid
              </Text>
            </View>
            <View
              style={[styles.tableCol, { width: "25%" }, styles.tableColLast]}
            >
              <Text style={styles.tableCell}>Awal tahun ajaran</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: "5%" }]}>
              <Text style={styles.tableCell}>2</Text>
            </View>
            <View style={[styles.tableCol, { width: "35%" }]}>
              <Text style={styles.tableCell}>
                Penyusunan dan pelaksanaan rencana pendampingan
              </Text>
            </View>
            <View style={[styles.tableCol, { width: "35%" }]}>
              <Text style={styles.tableCell}>
                Disesuaikan dengan kebutuhan murid
              </Text>
            </View>
            <View
              style={[styles.tableCol, { width: "25%" }, styles.tableColLast]}
            >
              <Text style={styles.tableCell}>Per semester</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: "5%" }]}>
              <Text style={styles.tableCell}>3</Text>
            </View>
            <View style={[styles.tableCol, { width: "35%" }]}>
              <Text style={styles.tableCell}>
                Pertemuan berkala dengan murid
              </Text>
            </View>
            <View style={[styles.tableCol, { width: "35%" }]}>
              <Text style={styles.tableCell}>
                Secara individual atau kelompok kecil
              </Text>
            </View>
            <View
              style={[styles.tableCol, { width: "25%" }, styles.tableColLast]}
            >
              <Text style={styles.tableCell}>4x seminggu</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: "5%" }]}>
              <Text style={styles.tableCell}>4</Text>
            </View>
            <View style={[styles.tableCol, { width: "35%" }]}>
              <Text style={styles.tableCell}>
                Kolaborasi dengan guru BK & wali kelas
              </Text>
            </View>
            <View style={[styles.tableCol, { width: "35%" }]}>
              <Text style={styles.tableCell}>
                Untuk tindak lanjut masalah tertentu
              </Text>
            </View>
            <View
              style={[styles.tableCol, { width: "25%" }, styles.tableColLast]}
            >
              <Text style={styles.tableCell}>Sesuai kebutuhan</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: "5%" }]}>
              <Text style={styles.tableCell}>5</Text>
            </View>
            <View style={[styles.tableCol, { width: "35%" }]}>
              <Text style={styles.tableCell}>Pelaporan perkembangan murid</Text>
            </View>
            <View style={[styles.tableCol, { width: "35%" }]}>
              <Text style={styles.tableCell}>
                Secara berkala (bulanan/semester)
              </Text>
            </View>
            <View
              style={[styles.tableCol, { width: "25%" }, styles.tableColLast]}
            >
              <Text style={styles.tableCell}>
                Setiap akhir bulan atau semester
              </Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: "5%" }]}>
              <Text style={styles.tableCell}>6</Text>
            </View>
            <View style={[styles.tableCol, { width: "35%" }]}>
              <Text style={styles.tableCell}>Dokumentasi dan refleksi</Text>
            </View>
            <View style={[styles.tableCol, { width: "35%" }]}>
              <Text style={styles.tableCell}>
                Catatan kemajuan, hambatan, dan rekomendasi
              </Text>
            </View>
            <View
              style={[styles.tableCol, { width: "25%" }, styles.tableColLast]}
            >
              <Text style={styles.tableCell}>Berkelanjutan</Text>
            </View>
          </View>
        </View>
        <Text style={styles.sectionTitle}>VI. Evaluasi dan Pelaporan</Text>
        <Text style={styles.bulletItem}>
          • Guru Wali menyusun laporan singkat setiap semester berisi:
        </Text>
        <Text style={{ ...styles.bulletItem, marginLeft: 40 }}>
          o Rekap pertemuan dan kegiatan
        </Text>
        <Text style={{ ...styles.bulletItem, marginLeft: 40 }}>
          o Catatan perkembangan murid
        </Text>
        <Text style={{ ...styles.bulletItem, marginLeft: 40 }}>
          o Rekomendasi tindak lanjut
        </Text>
        <Text style={styles.bulletItem}>
          • Laporan dikumpulkan ke Wakil Kepala Sekolah bidang Kesiswaan atau
          Kurikulum.
        </Text>

        <Text style={styles.sectionTitle}>VII. Ekuivalensi Beban Kerja</Text>
        <Text style={styles.paragraph}>
          • Tugas Guru Wali{" "}
          <Text style={{ fontWeight: "bold" }}>
            setara dengan 2 jam Tatap Muka per minggu
          </Text>
          (Pasal 14 dan Lampiran Permendikdasmen No. 11 Tahun 2025)
        </Text>

        <Text style={styles.sectionTitle}>VIII. Penutup</Text>
        <Text style={styles.paragraph}>
          SOP ini menjadi acuan pelaksanaan tugas Guru Wali untuk memastikan
          pendampingan murid berjalan sistematis, profesional, dan berdampak
          pada perkembangan peserta didik secara utuh.
        </Text>
      </Page>
    </>
  );
}
