# 07. PDF Reports Flow

> **Last Updated:** 2025-01-14  
> **Feature:** Generate and download PDF reports for students  
> **Status:** ✅ Implemented (Story 3.2 - 80% complete)

---

## 📄 Overview

Sistem laporan PDF memungkinkan guru wali untuk mengunduh laporan lengkap siswa yang berisi:
- Data profil siswa
- Semua jurnal bulanan (5 aspek pemantauan)
- Riwayat pertemuan dengan orang tua
- Rencana intervensi yang aktif

PDF di-generate secara on-demand (tidak ada pre-generated files) dan langsung diunduh ke device user.

---

## 🎯 User Flow

### **Main Flow: Download Student Report**

```
User at Student Detail Page
         ↓
Click "Unduh Laporan PDF" button (in header)
         ↓
[Loading state] "Mengunduh..."
         ↓
API generates PDF from student data
         ↓
Browser automatically downloads PDF
         ↓
User opens PDF from Downloads folder
```

### **Step-by-Step Process**

#### **Step 1: Navigate to Student Detail**
```
URL: /students/[id]
Location: Click any student from /students list
```

#### **Step 2: Click Download Button**
```
Location: Top-right header next to "Buat Jurnal Baru"
Button Label: "Unduh Laporan PDF"
Icon: Download icon (lucide-react)
```

#### **Step 3: Wait for Generation**
```
Button State: Disabled
Button Text: "Mengunduh..."
Duration: 1-3 seconds (depends on data amount)
```

#### **Step 4: Auto Download**
```
Browser: Downloads automatically
Filename: Laporan_[StudentName]_[Date].pdf
Example: Laporan_Ahmad_Rizki_Pratama_2025-01-14.pdf
```

---

## 🏗️ Technical Architecture

### **Components**

**1. UI Component**
- File: `app/(main)/students/[id]/page.tsx`
- Button: "Unduh Laporan PDF" with Download icon
- State: `isDownloading` for loading state
- Handler: `handleDownloadPDF()` function

**2. API Endpoint**
- Route: `GET /api/reports/student/[id]`
- File: `app/api/reports/student/[id]/route.ts`
- Runtime: `nodejs` (PDF generation requires Node.js)
- Library: `@react-pdf/renderer`

**3. PDF Template**
- File: `components/reports/student-report-template.tsx`
- Component: `StudentReportDocument`
- Format: A4 pages, professional styling
- Features: Multi-page, auto-pagination

---

## 📊 PDF Structure

### **Page 1: Overview & Summary**

```
┌────────────────────────────────────┐
│ [School Name]                      │
│ Laporan Lengkap Siswa              │
│ Dicetak: [Tanggal Lengkap]         │
├────────────────────────────────────┤
│                                    │
│ DATA SISWA                         │
│ --------------------------------   │
│ Nama Lengkap: [Name]               │
│ NISN: [NISN]                       │
│ Kelas: [Class]                     │
│ Jenis Kelamin: [L/P]               │
│ Nama Orang Tua: [Parent]           │
│ Kontak: +[Phone]                   │
│ Catatan Khusus: [Notes]            │
│                                    │
│ RINGKASAN                          │
│ --------------------------------   │
│ Total Jurnal: X catatan            │
│ Total Pertemuan: X pertemuan       │
│ Rencana Intervensi: X rencana      │
│                                    │
└────────────────────────────────────┘
```

### **Page 2+: Journal Pages (One per Journal)**

```
┌────────────────────────────────────┐
│ Jurnal Bulanan - [Period]          │
│ Dibuat: [Date]                     │
├────────────────────────────────────┤
│                                    │
│ 📚 ASPEK AKADEMIK                  │
│ [Description paragraph]            │
│                                    │
│ ⭐ ASPEK KARAKTER                  │
│ [Description paragraph]            │
│                                    │
│ 🤝 ASPEK SOSIAL-EMOSIONAL          │
│ [Description paragraph]            │
│                                    │
│ 📋 ASPEK KEDISIPLINAN              │
│ [Description paragraph]            │
│                                    │
│ 🎯 ASPEK POTENSI & MINAT           │
│ [Description paragraph]            │
│                                    │
└────────────────────────────────────┘
```

### **Last Page: Meetings & Interventions**

```
┌────────────────────────────────────┐
│ Pertemuan & Intervensi             │
├────────────────────────────────────┤
│                                    │
│ LOG PERTEMUAN                      │
│ --------------------------------   │
│ [Top 5 meetings with details]      │
│                                    │
│ RENCANA INTERVENSI                 │
│ --------------------------------   │
│ [Top 3 interventions with status]  │
│                                    │
└────────────────────────────────────┘
```

---

## 🔌 API Specification

### **Endpoint: GET /api/reports/student/[id]**

**Request**
```http
GET /api/reports/student/1
Headers:
  Cookie: session=[user-session]
```

**Response (Success)**
```http
Status: 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="Laporan_Ahmad_Rizki_Pratama_2025-01-14.pdf"
Content-Length: [byte-size]

[Binary PDF Data]
```

**Response (Error)**
```json
Status: 404 Not Found
{
  "error": "Student not found"
}
```

```json
Status: 401 Unauthorized
{
  "error": "Unauthorized"
}
```

---

## 🎨 Styling & Design

### **Color Scheme**
```
Primary Blue: #1e40af (headers, titles)
Background: #ffffff (white)
Cards: #f9fafb (light gray)
Borders: #e5e7eb (gray)
Text: #1f2937 (dark gray)
Muted: #6b7280 (medium gray)
```

### **Typography**
```
Font Family: Helvetica (default PDF-safe font)
Title: 16pt bold
Section Header: 12pt bold
Body Text: 10pt regular
Subtitle: 9pt regular
Footer: 8pt regular
```

### **Layout**
```
Page Size: A4 (210 x 297 mm)
Margins: 40pt all sides
Line Height: 1.3-1.4
Spacing: Consistent padding/margins
```

---

## ⚙️ Implementation Details

### **Data Fetching**
```typescript
// Fetch student + related data
const student = mockStudents.find(s => s.id === id);
const journals = mockJournals.filter(j => j.studentId === id);
const meetings = mockMeetings.filter(m => m.studentId === id);
const interventions = mockInterventions.filter(i => i.studentId === id);
```

### **PDF Generation**
```typescript
// Create React PDF Document
const pdfDocument = StudentReportDocument({
  student,
  journals,
  meetings,
  interventions,
  schoolName: session.schoolName || "SMP Negeri 1",
  generatedAt: new Date(),
});

// Render to buffer
const pdfBuffer = await renderToBuffer(pdfDocument);
```

### **Download Handler**
```typescript
const handleDownloadPDF = async () => {
  setIsDownloading(true);
  
  const response = await fetch(`/api/reports/student/${studentId}`);
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  
  window.URL.revokeObjectURL(url);
  setIsDownloading(false);
};
```

---

## ❓ FAQ & Clarifications

### **Q: Mengapa button "Unduh PDF" tidak ada di /students (list page)?**

**A:** Design decision yang disengaja:
- PDF adalah laporan **individual per siswa**
- Harus masuk ke student detail dulu untuk context
- Mencegah accidental download untuk semua siswa
- User flow: List → Detail → Download

### **Q: Apakah ada page /reports untuk mengelola laporan?**

**A:** Tidak ada dedicated page `/reports` karena:
- PDF di-generate **on-demand**, tidak disimpan
- Download langsung via API endpoint
- Tidak ada history/archive sistem (by design)
- Simple flow: Click button → Download PDF

### **Q: Bagaimana kalau mau download multiple students?**

**A:** Saat ini belum support bulk download:
- Harus download satu per satu
- Feature bulk download bisa jadi **Post-MVP enhancement**
- Option 1: Download all as ZIP
- Option 2: Combined PDF untuk selected students
- Option 3: Semester report (all students summary)

### **Q: Apakah PDF disimpan di server?**

**A:** Tidak:
- Generated **in-memory** (buffer)
- Langsung di-stream ke browser
- Tidak ada file storage
- Efficient & tidak butuh cleanup

### **Q: Bagaimana dengan semester reports?**

**A:** Planned tapi optional (Story 3.2):
- URL: `/api/reports/semester`
- Summary **multiple students**
- Aggregated statistics
- Currently **NOT implemented** (can skip for MVP)

---

## 🧪 Testing Checklist

### **Functional Tests**

- [ ] Button muncul di student detail header
- [ ] Button disabled saat downloading
- [ ] PDF ter-generate tanpa error
- [ ] PDF auto-download di browser
- [ ] Filename correct format
- [ ] All student data muncul di PDF
- [ ] Journals pagination correct (1 journal = 1 page)
- [ ] Meetings & interventions muncul di last page
- [ ] Empty states handled gracefully (no journals/meetings)
- [ ] Error handling jika student not found

### **UI/UX Tests**

- [ ] Loading state clear ("Mengunduh...")
- [ ] Error message jika gagal
- [ ] Button style consistent dengan design system
- [ ] Icon visible dan appropriate (Download)
- [ ] Button accessible via keyboard
- [ ] Responsive pada mobile (button stack)

### **PDF Quality Tests**

- [ ] Professional appearance
- [ ] Text readable dan tidak terpotong
- [ ] Emojis rendered correctly (📚⭐🤝📋🎯)
- [ ] Long text wrapped properly
- [ ] Page breaks natural (tidak split mid-content)
- [ ] Footer pada setiap page
- [ ] School name muncul di header
- [ ] Date format Indonesia (id-ID)
- [ ] Phone number format correct (+628xxx)

---

## 🚀 Future Enhancements

### **Phase 2 (Post-MVP)**

1. **Semester Report**
   - Summary all students in one period
   - Aggregated statistics
   - Charts & graphs

2. **Bulk Download**
   - Select multiple students
   - Download as ZIP file
   - Or combined single PDF

3. **Custom Templates**
   - Multiple report templates
   - School branding customization
   - Logo upload

4. **Report Scheduling**
   - Auto-generate monthly reports
   - Email to parents
   - Archive system

5. **Print Optimization**
   - CSS @media print styling
   - Direct print without download
   - Print preview

---

## 📁 Key Files

### **Frontend**
```
app/(main)/students/[id]/page.tsx
  → Download button & handler
```

### **Backend**
```
app/api/reports/student/[id]/route.ts
  → API endpoint for PDF generation
```

### **Components**
```
components/reports/student-report-template.tsx
  → PDF template using @react-pdf/renderer
```

### **Mock Data**
```
app/api/students/route.ts     → mockStudents
app/api/journals/route.ts     → mockJournals
app/api/meetings/route.ts     → mockMeetings
app/api/interventions/route.ts → mockInterventions
```

---

## 🔗 Related Documentation

- [Student Detail View](./06_STUDENT_DETAIL_VIEW.md) - Where the button is located
- [Journals Flow](./04_JOURNALS_MEETINGS_FLOW.md) - Data included in PDF
- [Interventions Flow](./05_INTERVENTION_FLOW.md) - Data included in PDF

---

**Last Updated:** 2025-01-14  
**Feature Status:** ✅ Implemented & Ready for Testing  
**Dependencies:** @react-pdf/renderer@4.3.1
