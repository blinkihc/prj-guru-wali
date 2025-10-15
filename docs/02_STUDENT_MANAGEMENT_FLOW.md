# Student Management Flow

> **Last Updated:** 2025-01-14

## 1. View Students List

**Entry Point:** `/students`

### Features
- Search functionality
- Sortable table
- Clickable rows → Navigate to student detail
- Action menu (View/Edit/Delete)

### Table Columns
- Avatar + Name + Special Notes
- NISN (10-digit identifier)
- Classroom
- Gender (L/P)
- Parent Name
- Parent Contact

### Key Files
- `app/(main)/students/page.tsx` - Main page
- `components/students/student-table.tsx` - Table component

---

## 2. Add New Student

**Trigger:** Click "Tambah Siswa" button

### Form Fields

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Nama Lengkap | Text | ✅ | Min 3 characters |
| NISN | Text | ❌ | 10 digits if provided |
| Kelas | Text | ❌ | Any format (e.g., "7A") |
| Jenis Kelamin | Select | ❌ | L or P |
| Nama Orang Tua | Text | ❌ | - |
| Kontak Ortu | PhoneInput | ❌ | +62 8XXXXXXXXX |
| Catatan Khusus | Textarea | ❌ | - |

### Flow
```
Click "Tambah Siswa"
      ↓
Open dialog with form
      ↓
Fill required fields
      ↓
Submit
      ↓
API: POST /api/students
- Validate data
- Insert to database
      ↓
Success? ──┬─→ Yes → Close dialog + Refresh list
           └─→ No → Show error toast
```

### Key Files
- `components/students/student-dialog.tsx` - Form dialog
- `app/api/students/route.ts` - Create API

---

## 3. Edit Student

**Trigger:** Click "Edit" from row action menu

### Flow
```
Click "Edit"
      ↓
Open dialog pre-filled with existing data
      ↓
Modify fields
      ↓
Submit
      ↓
API: PUT /api/students/[id]
- Validate data
- Update database
      ↓
Success? ──┬─→ Yes → Close dialog + Refresh list
           └─→ No → Show error toast
```

### Key Files
- `components/students/student-dialog.tsx` - Form dialog (reused)
- `app/api/students/[id]/route.ts` - Update API

---

## 4. Delete Student

**Trigger:** Click "Hapus" from row action menu

### Flow
```
Click "Hapus"
      ↓
Show confirmation dialog
⚠️  "Yakin ingin menghapus [Name]?"
"Data jurnal, pertemuan, dan intervensi akan terhapus."
      ↓
User confirms
      ↓
API: DELETE /api/students/[id]
- Cascade delete related data:
  * Monthly journals
  * Meeting logs
  * Interventions
      ↓
Success? ──┬─→ Yes → Close dialog + Refresh list
           └─→ No → Show error toast
```

### Cascade Deletion
Database schema enforces `onDelete: "cascade"` for:
- `monthlyJournals.studentId`
- `meetingLogs.studentId`
- `interventions.studentId`

### Key Files
- `app/api/students/[id]/route.ts` - Delete API
- `drizzle/schema/` - Database schemas

---

## 5. Navigation from Students List

### Click Row
```
Click anywhere on student row
      ↓
Navigate to /students/[id]
      ↓
Opens student detail page with tabs
```

### Click Action Menu
```
Click ⋮ menu
      ↓
Options:
- 👁️ Lihat Detail → /students/[id]
- ✏️ Edit → Opens edit dialog
- 🗑️ Hapus → Shows confirmation
```

---

## 6. API Endpoints

```
GET    /api/students          - List all students (with search)
POST   /api/students          - Create new student
GET    /api/students/[id]     - Get single student
PUT    /api/students/[id]     - Update student
DELETE /api/students/[id]     - Delete student (cascade)
```

### Example Response
```json
{
  "students": [
    {
      "id": "uuid",
      "fullName": "Ahmad Fadil",
      "nisn": "0012345678",
      "classroom": "7A",
      "gender": "L",
      "parentName": "Bapak Ahmad",
      "parentContact": "628123456789",
      "specialNotes": "Alergi makanan laut",
      "createdAt": "2025-01-14T..."
    }
  ]
}
```
