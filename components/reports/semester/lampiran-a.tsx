// Lampiran A: Format Identitas Murid Dampingan
// STATIC structure, DYNAMIC data
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
});

interface Student {
  id: string;
  fullName: string;
  nisn?: string;
  classroom?: string;
  gender?: string;
  parentName?: string;
  parentContact?: string;
  notes?: string;
}

interface LampiranAProps {
  students: Student[];
}

export function LampiranA({ students }: LampiranAProps) {
  return (
    <Page size={[612, 936]} style={styles.page}>
      <Text style={styles.title}>
        LAMPIRAN A: FORMAT IDENTITAS MURID DAMPINGAN
      </Text>

      <View style={styles.table}>
        {/* Header */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={[styles.tableCol, { width: "5%" }]}>
            <Text style={styles.tableCell}>No.</Text>
          </View>
          <View style={[styles.tableCol, { width: "25%" }]}>
            <Text style={styles.tableCell}>Nama Murid</Text>
          </View>
          <View style={[styles.tableCol, { width: "15%" }]}>
            <Text style={styles.tableCell}>NIS/NISN</Text>
          </View>
          <View style={[styles.tableCol, { width: "10%" }]}>
            <Text style={styles.tableCell}>Kelas</Text>
          </View>
          <View style={[styles.tableCol, { width: "15%" }]}>
            <Text style={styles.tableCell}>Jenis Kelamin</Text>
          </View>
          <View style={[styles.tableCol, { width: "15%" }]}>
            <Text style={styles.tableCell}>Kontak Orang Tua</Text>
          </View>
          <View
            style={[styles.tableCol, { width: "15%" }, styles.tableColLast]}
          >
            <Text style={styles.tableCell}>Catatan Khusus (jika ada)</Text>
          </View>
        </View>

        {/* Data Rows */}
        {students.map((student, index) => (
          <View key={student.id} style={styles.tableRow}>
            <View style={[styles.tableCol, { width: "5%" }]}>
              <Text style={styles.tableCell}>{index + 1}.</Text>
            </View>
            <View style={[styles.tableCol, { width: "25%" }]}>
              <Text style={styles.tableCell}>{student.fullName}</Text>
            </View>
            <View style={[styles.tableCol, { width: "15%" }]}>
              <Text style={styles.tableCell}>{student.nisn || ""}</Text>
            </View>
            <View style={[styles.tableCol, { width: "10%" }]}>
              <Text style={styles.tableCell}>{student.classroom || ""}</Text>
            </View>
            <View style={[styles.tableCol, { width: "15%" }]}>
              <Text style={styles.tableCell}>{student.gender || ""}</Text>
            </View>
            <View style={[styles.tableCol, { width: "15%" }]}>
              <Text style={styles.tableCell}>
                {student.parentContact || ""}
              </Text>
            </View>
            <View
              style={[styles.tableCol, { width: "15%" }, styles.tableColLast]}
            >
              <Text style={styles.tableCell}>{student.notes || ""}</Text>
            </View>
          </View>
        ))}
      </View>
    </Page>
  );
}
