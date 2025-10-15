// Lampiran B: Format Catatan Perkembangan Murid
// ONE PAGE PER STUDENT with header info + 5 aspects table
// STATIC structure (5 aspects), DYNAMIC data
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
  table: {
    marginTop: 15,
    border: "1pt solid #000000",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    minHeight: 60,
  },
  tableHeader: {
    backgroundColor: "#C6E0B4",
    fontWeight: "bold",
    minHeight: 40,
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

interface StudentJournal {
  studentName: string;
  classroom: string;
  periode: string;
  guruWali: string;
  // 5 aspects data
  academicDesc: string;
  academicAction: string;
  characterDesc: string;
  characterAction: string;
  socialEmotionalDesc: string;
  socialEmotionalAction: string;
  disciplineDesc: string;
  disciplineAction: string;
  potentialInterestDesc: string;
  potentialInterestAction: string;
}

interface LampiranBProps {
  journals: StudentJournal[];
}

export function LampiranB({ journals }: LampiranBProps) {
  return (
    <>
      {journals.map((journal, idx) => (
        <Page key={idx} size={[612, 936]} style={styles.page}>
          <Text style={styles.title}>
            LAMPIRAN B: FORMAT CATATAN PERKEMBANGAN MURID
          </Text>

          {/* Student Info Header */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nama Murid </Text>
            <Text style={styles.infoColon}>:</Text>
            <Text style={styles.infoValue}>{journal.studentName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Kelas </Text>
            <Text style={styles.infoColon}>:</Text>
            <Text style={styles.infoValue}>{journal.classroom}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Periode Pemantauan </Text>
            <Text style={styles.infoColon}>:</Text>
            <Text style={styles.infoValue}>{journal.periode}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Guru Wali </Text>
            <Text style={styles.infoColon}>:</Text>
            <Text style={styles.infoValue}>{journal.guruWali}</Text>
          </View>

          {/* 5 Aspects Table */}
          <View style={styles.table}>
            {/* Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={[styles.tableCol, { width: "20%" }]}>
                <Text style={styles.tableCell}>Aspek Pemantauan</Text>
              </View>
              <View style={[styles.tableCol, { width: "35%" }]}>
                <Text style={styles.tableCell}>Deskripsi Perkembangan</Text>
              </View>
              <View style={[styles.tableCol, { width: "30%" }]}>
                <Text style={styles.tableCell}>
                  Tindak Lanjut yang Dilakukan
                </Text>
              </View>
              <View
                style={[styles.tableCol, { width: "15%" }, styles.tableColLast]}
              >
                <Text style={styles.tableCell}>Keterangan Tambahan</Text>
              </View>
            </View>

            {/* Row 1: Akademik */}
            <View style={styles.tableRow}>
              <View style={[styles.tableCol, { width: "20%" }]}>
                <Text style={styles.tableCell}>Akademik</Text>
              </View>
              <View style={[styles.tableCol, { width: "35%" }]}>
                <Text style={styles.tableCell}>{journal.academicDesc}</Text>
              </View>
              <View style={[styles.tableCol, { width: "30%" }]}>
                <Text style={styles.tableCell}>{journal.academicAction}</Text>
              </View>
              <View
                style={[styles.tableCol, { width: "15%" }, styles.tableColLast]}
              >
                <Text style={styles.tableCell}></Text>
              </View>
            </View>

            {/* Row 2: Karakter */}
            <View style={styles.tableRow}>
              <View style={[styles.tableCol, { width: "20%" }]}>
                <Text style={styles.tableCell}>Karakter</Text>
              </View>
              <View style={[styles.tableCol, { width: "35%" }]}>
                <Text style={styles.tableCell}>{journal.characterDesc}</Text>
              </View>
              <View style={[styles.tableCol, { width: "30%" }]}>
                <Text style={styles.tableCell}>{journal.characterAction}</Text>
              </View>
              <View
                style={[styles.tableCol, { width: "15%" }, styles.tableColLast]}
              >
                <Text style={styles.tableCell}></Text>
              </View>
            </View>

            {/* Row 3: Sosial-Emosional */}
            <View style={styles.tableRow}>
              <View style={[styles.tableCol, { width: "20%" }]}>
                <Text style={styles.tableCell}>Sosial-Emosional</Text>
              </View>
              <View style={[styles.tableCol, { width: "35%" }]}>
                <Text style={styles.tableCell}>
                  {journal.socialEmotionalDesc}
                </Text>
              </View>
              <View style={[styles.tableCol, { width: "30%" }]}>
                <Text style={styles.tableCell}>
                  {journal.socialEmotionalAction}
                </Text>
              </View>
              <View
                style={[styles.tableCol, { width: "15%" }, styles.tableColLast]}
              >
                <Text style={styles.tableCell}></Text>
              </View>
            </View>

            {/* Row 4: Kedisiplinan */}
            <View style={styles.tableRow}>
              <View style={[styles.tableCol, { width: "20%" }]}>
                <Text style={styles.tableCell}>Kedisiplinan</Text>
              </View>
              <View style={[styles.tableCol, { width: "35%" }]}>
                <Text style={styles.tableCell}>{journal.disciplineDesc}</Text>
              </View>
              <View style={[styles.tableCol, { width: "30%" }]}>
                <Text style={styles.tableCell}>{journal.disciplineAction}</Text>
              </View>
              <View
                style={[styles.tableCol, { width: "15%" }, styles.tableColLast]}
              >
                <Text style={styles.tableCell}></Text>
              </View>
            </View>

            {/* Row 5: Potensi & Minat */}
            <View style={styles.tableRow}>
              <View style={[styles.tableCol, { width: "20%" }]}>
                <Text style={styles.tableCell}>Potensi & Minat</Text>
              </View>
              <View style={[styles.tableCol, { width: "35%" }]}>
                <Text style={styles.tableCell}>
                  {journal.potentialInterestDesc}
                </Text>
              </View>
              <View style={[styles.tableCol, { width: "30%" }]}>
                <Text style={styles.tableCell}>
                  {journal.potentialInterestAction}
                </Text>
              </View>
              <View
                style={[styles.tableCol, { width: "15%" }, styles.tableColLast]}
              >
                <Text style={styles.tableCell}></Text>
              </View>
            </View>
          </View>
        </Page>
      ))}
    </>
  );
}
