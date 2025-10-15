# CSV Import Flow

> **Last Updated:** 2025-01-14

## Overview

Bulk import student data from CSV/Excel files with validation, preview, and inline editing.

**Entry Point:** `/students/import`

---

## 1. Import Process Flow

### Step 1: Download Template (Optional)

```
Click "Download Template CSV"
      ↓
Downloads: student-import-template.csv
Contains: Sample data with correct format
```

**Template Location:** `public/templates/student-import-template.csv`

**Template Format:**
```csv
fullName,nisn,classroom,gender,parentName,parentContact,specialNotes
Ahmad Fadil,0012345678,7A,L,Bapak Ahmad,628123456789,Alergi makanan laut
Siti Nurhaliza,0023456789,7A,P,Ibu Siti,628234567890,
```

---

### Step 2: Upload CSV File

```
User uploads CSV
      ↓
Validation Checks:
- File type: .csv only
- File size: Max 5 MB
- Row count: Max 1000 rows
      ↓
Valid? ──┬─→ Yes → Parse with PapaParse
         └─→ No → Show error message
```

**Upload Methods:**
1. **Drag & Drop** - Drag file into upload zone
2. **Click to Browse** - Click zone or "Pilih File" button

---

### Step 3: Preview & Edit

```
CSV parsed successfully
      ↓
Display Preview Table
- All rows shown
- Inline editing enabled
- Validation errors highlighted
      ↓
User can:
- Edit any field inline
- Fix validation errors
- Review all data
      ↓
Click "Import X Siswa"
```

#### Preview Table Features

**Editable Columns:**
- Nama Lengkap (Input)
- NISN (Input)
- Kelas (Input)
- Jenis Kelamin (Select: L/P)
- Nama Orang Tua (Input)
- Kontak Ortu (PhoneInput)
- Catatan Khusus (Input)

**Validation Indicators:**
- ✅ Green: Valid data
- ❌ Red background: Invalid data
- Red text: Error message below field

---

### Step 4: Bulk Import

```
Click "Import X Siswa"
      ↓
API: POST /api/students/import
{
  students: [
    {
      fullName: "...",
      nisn: "...",
      classroom: "...",
      gender: "L",
      parentName: "...",
      parentContact: "628...",
      specialNotes: "..."
    },
    // ... more students
  ]
}
      ↓
Server-side validation
      ↓
Bulk insert with transaction
(All or nothing)
      ↓
Success? ──┬─→ Yes → Redirect to /students
           │         Show success toast
           └─→ No → Show error details
                    Stay on import page
```

---

## 2. Validation Rules

### Client-Side (Preview Table)

| Field | Validation |
|-------|------------|
| fullName | Required, min 3 characters |
| nisn | Optional, must be 10 digits if provided |
| classroom | Optional, any format |
| gender | Optional, must be 'L' or 'P' if provided |
| parentName | Optional |
| parentContact | Optional, must match +62 8XXXXXXXXX if provided |
| specialNotes | Optional |

### Server-Side (Import API)

**Additional Checks:**
- Duplicate NISN detection (if NISN provided)
- Data type validation
- SQL injection prevention
- Transaction rollback on any error

---

## 3. Error Handling

### File Upload Errors

```
Wrong file type
→ "Hanya file CSV yang diperbolehkan"

File too large (>5MB)
→ "Ukuran file maksimal 5 MB"

Too many rows (>1000)
→ "Maksimal 1000 baris per file"

Parse error
→ "Format CSV tidak valid"
```

### Validation Errors

```
In Preview Table:
- Highlight invalid cells
- Show error message below field
- Prevent submit until all fixed

Example:
Row 3, Gender column:
"X" → ❌ "L atau P"
```

### Import Errors

```
Server error
→ Toast: "Gagal mengimport data"
→ Show detailed error message
→ Stay on import page

Partial success not allowed
→ Transaction ensures all-or-nothing
```

---

## 4. Key Files

### Frontend
- `app/(main)/students/import/page.tsx` - Import page
- `components/students/import-preview-table.tsx` - Preview table with inline edit

### Backend
- `app/api/students/import/route.ts` - Bulk import API

### Assets
- `public/templates/student-import-template.csv` - Template file
- `public/templates/README.md` - Template documentation

---

## 5. User Experience

### Success Flow

```
1. Download template ✅
2. Fill data in Excel ✅
3. Save as CSV ✅
4. Upload to app ✅
5. Review in preview ✅
6. Fix any errors ✅
7. Import successfully ✅
8. Redirect to students list ✅
9. See all new students ✅
```

### Features

- ✅ **Template** - Pre-formatted with sample data
- ✅ **Validation** - Real-time error checking
- ✅ **Inline Editing** - Fix errors without re-upload
- ✅ **Preview** - See all data before import
- ✅ **Bulk Insert** - Fast transaction-based import
- ✅ **Error Recovery** - Clear error messages with guidance

---

## 6. API Specification

### POST /api/students/import

**Request Body:**
```json
{
  "students": [
    {
      "fullName": "Ahmad Fadil",
      "nisn": "0012345678",
      "classroom": "7A",
      "gender": "L",
      "parentName": "Bapak Ahmad",
      "parentContact": "628123456789",
      "specialNotes": "Alergi makanan laut"
    }
  ]
}
```

**Success Response (201):**
```json
{
  "message": "Import berhasil",
  "imported": 5,
  "students": [
    { "id": "uuid-1", "fullName": "..." },
    { "id": "uuid-2", "fullName": "..." }
  ]
}
```

**Error Response (400):**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "row": 3,
      "field": "gender",
      "message": "Must be 'L' or 'P'"
    }
  ]
}
```
