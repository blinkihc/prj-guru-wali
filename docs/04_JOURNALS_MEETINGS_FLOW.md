# Journals & Meetings Flow

> **Last Updated:** 2025-01-14

## 1. Create Journal/Meeting - Entry Point

**URL:** `/journals/new`

### Step 1: Select Type

```
User navigates to /journals/new
      ↓
Display 2 options:
┌─────────────────────────────────┐
│ [ 📊 Jurnal Bulanan ]           │
│ 5 aspek pemantauan siswa        │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ [ 👥 Log Pertemuan ]            │
│ Catatan pertemuan dengan siswa  │
└─────────────────────────────────┘
      ↓
User clicks one option
```

### Step 2: Select Student

```
Display student dropdown
      ↓
User selects student
      ↓
Show appropriate form
```

---

## 2. Monthly Journal (Jurnal Bulanan)

### 2.1 Form Structure

**5 Aspek Pemantauan:**

1. **Akademik** - Prestasi & kemampuan belajar
2. **Karakter** - Sikap, nilai, perilaku
3. **Sosial-Emosional** - Interaksi & manajemen emosi
4. **Kedisiplinan** - Kepatuhan aturan
5. **Potensi & Minat** - Bakat & minat

**Each Aspek has 3 fields:**
- Deskripsi Perkembangan (textarea)
- Tindak Lanjut (textarea)
- Catatan Tambahan (input)

### 2.2 Period Selection

```
Dropdown with options:
- Januari 2025 (current month)
- Desember 2024
- November 2024
- Oktober 2024

Default: Current month
```

### 2.3 Creation Flow

```
Fill form fields
(No required fields except period & studentId)
      ↓
Click "Simpan Jurnal"
      ↓
API: POST /api/journals
{
  studentId: "uuid",
  monitoringPeriod: "Januari 2025",
  academicDesc: "...",
  academicFollowUp: "...",
  academicNotes: "...",
  characterDesc: "...",
  characterFollowUp: "...",
  characterNotes: "...",
  socialEmotionalDesc: "...",
  socialEmotionalFollowUp: "...",
  socialEmotionalNotes: "...",
  disciplineDesc: "...",
  disciplineFollowUp: "...",
  disciplineNotes: "...",
  potentialInterestDesc: "...",
  potentialInterestFollowUp: "...",
  potentialInterestNotes: "..."
}
      ↓
Success? ──┬─→ Yes → Toast: "Jurnal berhasil disimpan"
           │         Redirect to /journals
           └─→ No → Show error toast
                    Stay on form
```

### 2.4 View Journals

**In Student Detail:** `/students/[id]` → Tab "Jurnal"

```
Display as cards (timeline):
┌─────────────────────────────────┐
│ Januari 2025                    │
│ Jurnal Bulanan • 14 Jan 2025    │
│                                 │
│ 📚 Akademik                     │
│ Nilai matematika meningkat...   │
│                                 │
│ ⭐ Karakter                     │
│ Mulai menunjukkan sikap...      │
│                                 │
│ (3 more aspects if filled)      │
└─────────────────────────────────┘

Sorted by: createdAt DESC
Show only: Filled fields
```

### Key Files
- `components/journals/monthly-journal-form.tsx` - Form component
- `app/api/journals/route.ts` - Journal API
- `drizzle/schema/monthly-journals.ts` - Database schema

---

## 3. Meeting Log (Log Pertemuan)

### 3.1 Form Structure

**Fields:**
- Tanggal Pertemuan (date, required)
- Topik Pertemuan (text, required)
- Tindak Lanjut (textarea, optional)
- Catatan Tambahan (textarea, optional)

### 3.2 Creation Flow

```
Fill form fields
(Required: meetingDate, topic)
      ↓
Click "Simpan Log Pertemuan"
      ↓
API: POST /api/meetings
{
  studentId: "uuid",
  meetingDate: "2025-01-14",
  topic: "Konsultasi penurunan nilai",
  followUp: "Orang tua berikan les tambahan",
  notes: "Bapak sangat kooperatif"
}
      ↓
Success? ──┬─→ Yes → Toast: "Log pertemuan berhasil disimpan"
           │         Redirect to /journals
           └─→ No → Show error toast
                    Stay on form
```

### 3.3 View All Meetings

**URL:** `/meetings`

```
Display all meeting logs:
┌─────────────────────────────────┐
│ Konsultasi penurunan nilai      │
│ Ahmad Fadil • Senin, 14 Jan 2025│
│                                 │
│ 📝 Tindak Lanjut                │
│ Orang tua berikan les tambahan  │
│                                 │
│ 💬 Catatan                      │
│ Bapak sangat kooperatif         │
└─────────────────────────────────┘

Features:
- Sorted by meetingDate DESC
- Shows student name + date
- Clickable → Navigate to student detail
```

### 3.4 View Student Meetings

**In Student Detail:** `/students/[id]` → Tab "Pertemuan"

```
Similar to /meetings page
But filtered by studentId
```

### Key Files
- `components/journals/meeting-log-form.tsx` - Form component
- `app/(main)/meetings/page.tsx` - All meetings list
- `app/api/meetings/route.ts` - Meeting API
- `drizzle/schema/meeting-logs.ts` - Database schema

---

## 4. Navigation Patterns

### From Sidebar
```
Click "Jurnal Bulanan"
→ /journals (placeholder page)
→ Click "Buat Jurnal Baru"
→ /journals/new

Click "Log Pertemuan"
→ /meetings (all meetings list)
→ Click "Buat Log Pertemuan"
→ /journals/new (select type)
```

### From Student Detail
```
Student detail page header:
[+ Buat Jurnal Baru]
→ /journals/new

Empty state in tabs:
[Buat Jurnal] or [Buat Log Pertemuan]
→ /journals/new
```

### From Meetings List
```
Click meeting card
→ /students/[id]?tab=meetings
(Navigate to student detail, meetings tab)
```

---

## 5. API Endpoints

### Journals
```
GET  /api/journals                 - List all journals
GET  /api/journals?studentId=xxx   - Filter by student
POST /api/journals                 - Create journal
```

### Meetings
```
GET    /api/meetings                 - List all meetings
GET    /api/meetings?studentId=xxx   - Filter by student
POST   /api/meetings                 - Create meeting
GET    /api/meetings/[id]            - Get single meeting
PUT    /api/meetings/[id]            - Update meeting
DELETE /api/meetings/[id]            - Delete meeting
```

### Example Responses

**Journal:**
```json
{
  "journals": [{
    "id": "uuid",
    "studentId": "uuid",
    "monitoringPeriod": "Januari 2025",
    "academicDesc": "Nilai matematika meningkat...",
    "academicFollowUp": "Pertahankan dengan...",
    "academicNotes": "Sangat baik",
    "characterDesc": "...",
    "createdAt": "2025-01-14T..."
  }]
}
```

**Meeting:**
```json
{
  "meetings": [{
    "id": "uuid",
    "studentId": "uuid",
    "meetingDate": "2025-01-14",
    "topic": "Konsultasi penurunan nilai",
    "followUp": "Orang tua berikan les...",
    "notes": "Bapak sangat kooperatif",
    "createdAt": "2025-01-14T..."
  }]
}
```

---

## 6. Data Display Patterns

### Journal Cards

**Layout:**
- Title: Period (e.g., "Januari 2025")
- Subtitle: "Jurnal Bulanan • [created date]"
- Content: Each filled aspek with icon
- Only show filled fields
- Collapsible sections (future)

### Meeting Cards

**Layout:**
- Title: Topic
- Subtitle: "Student Name • [long date format]"
- Content: Follow-up and Notes sections
- Only show filled fields
- Date format: "Senin, 14 Januari 2025"

---

## 7. Empty States

### No Journals
```
Icon: FileText
Title: "Belum Ada Jurnal"
Message: "Belum ada catatan jurnal bulanan untuk siswa ini"
Action: [Buat Jurnal]
```

### No Meetings
```
Icon: Users
Title: "Belum Ada Log Pertemuan"
Message: "Belum ada catatan pertemuan untuk siswa ini"
Action: [Buat Log Pertemuan]
```

---

## 8. Future Enhancements

- [ ] Edit existing journals/meetings
- [ ] Delete journals/meetings
- [ ] Filter by date range
- [ ] Export to PDF
- [ ] Attach files/images
- [ ] Tags/categories
- [ ] Search functionality
