# Intervention Plans Flow

> **Last Updated:** 2025-01-14

## Overview

Rencana Intervensi adalah fitur untuk membuat dan melacak rencana tindakan bagi siswa yang membutuhkan perhatian khusus.

---

## 1. Create Intervention Plan

### 1.1 Entry Points

**Option 1: Manual Student Selection**
```
URL: /interventions/new
→ User selects student from dropdown
```

**Option 2: Pre-filled Student (Recommended)**
```
URL: /interventions/new?studentId=xxx
→ Student already selected
→ Skip student selection step
```

### 1.2 Navigation Sources

```
From Student Detail:
- Click "Intervensi" tab
- Empty state: Click [Buat Rencana Intervensi]
→ /interventions/new?studentId=xxx

From Sidebar (future):
- Click "Intervensi"
→ /interventions/new
```

---

## 2. Intervention Form

### 2.1 Form Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **Judul Rencana** | Text | ✅ | Short title/summary |
| **Deskripsi Masalah** | Textarea | ✅ | Detailed problem description |
| **Tujuan Intervensi** | Textarea | ✅ | What we want to achieve |
| **Langkah Tindakan** | Textarea | ✅ | Action steps (multi-line) |
| **Tanggal Mulai** | Date | ✅ | Start date |
| **Tanggal Target** | Date | ❌ | Target completion date |
| **Status** | Select | ✅ | Active/Completed/Cancelled |
| **Catatan Tambahan** | Textarea | ❌ | Additional notes |

### 2.2 Status Options

```
🔵 Aktif (active)
- Default status
- Intervention is ongoing
- Badge color: Blue

✅ Selesai (completed)
- Goal achieved
- Intervention completed
- Badge color: Green

❌ Dibatalkan (cancelled)
- Intervention stopped
- Not continued
- Badge color: Red
```

---

## 3. Creation Flow

```
User navigates to /interventions/new
      ↓
┌─────────────────────────────┐
│ Step 1: Select Student      │
│ (Skip if pre-filled)        │
│ [Dropdown Siswa]            │
└─────────────────────────────┘
      ↓
User selects student
      ↓
┌─────────────────────────────┐
│ Step 2: Fill Form           │
│                             │
│ Judul: [__________]         │
│ Masalah: [__________]       │
│ Tujuan: [__________]        │
│ Langkah: [__________]       │
│ Tanggal Mulai: [____]       │
│ Target: [____]              │
│ Status: [Aktif ▼]           │
│ Catatan: [__________]       │
└─────────────────────────────┘
      ↓
Validate required fields
      ↓
Click "Buat Rencana"
      ↓
API: POST /api/interventions
{
  studentId: "uuid",
  title: "Perbaikan Nilai Matematika",
  issue: "Nilai turun dari 80 ke 60...",
  goal: "Naikkan ke 75 dalam 1 bulan...",
  actionSteps: "1. Les tambahan\n2. Konsultasi guru\n3. Monitoring ortu",
  startDate: "2025-01-14",
  endDate: "2025-02-14",
  status: "active",
  notes: "Siswa kooperatif..."
}
      ↓
Success? ──┬─→ Yes → Toast: "Rencana intervensi berhasil dibuat"
           │         Redirect to /students/[id]?tab=interventions
           └─→ No → Show error toast
                    Stay on form
```

---

## 4. View Interventions

### 4.1 In Student Detail Page

**URL:** `/students/[id]` → Tab "Intervensi"

```
Display intervention cards:
┌─────────────────────────────────────┐
│ Perbaikan Nilai Matematika          │
│                         [🔵 Aktif]   │
│ Mulai: 14 Jan • Target: 14 Feb      │
│                                     │
│ 🔍 Masalah                          │
│ Nilai turun dari 80 ke 60...        │
│                                     │
│ 🎯 Tujuan                           │
│ Naikkan ke 75 dalam 1 bulan...      │
│                                     │
│ 📋 Langkah Tindakan                 │
│ 1. Berikan soal latihan             │
│ 2. Konsultasi dengan guru           │
│ 3. Hubungi orang tua                │
│ 4. Evaluasi progress mingguan       │
│                                     │
│ 💬 Catatan                          │
│ Siswa kooperatif dan termotivasi    │
└─────────────────────────────────────┘

Features:
- Sorted by createdAt DESC
- Color-coded status badges
- Multi-line action steps preserved
- Only show filled fields
```

### 4.2 Badge Color Mapping

```css
Active (🔵 Aktif):
- bg-blue-500/10
- text-blue-600
- border-blue-500/20

Completed (✅ Selesai):
- bg-green-500/10
- text-green-600
- border-green-500/20

Cancelled (❌ Dibatalkan):
- bg-destructive/10
- text-destructive
- border-destructive/20
```

---

## 5. Empty State

```
Icon: Target
Title: "Belum Ada Rencana Intervensi"
Message: "Belum ada rencana intervensi untuk siswa ini"
Action: [Buat Rencana Intervensi]
→ /interventions/new?studentId=xxx
```

---

## 6. API Endpoints

```
GET    /api/interventions                 - List all interventions
GET    /api/interventions?studentId=xxx   - Filter by student
GET    /api/interventions?status=active   - Filter by status
POST   /api/interventions                 - Create intervention
GET    /api/interventions/[id]            - Get single intervention
PUT    /api/interventions/[id]            - Update intervention
DELETE /api/interventions/[id]            - Delete intervention
```

### Example Response

```json
{
  "interventions": [{
    "id": "uuid",
    "studentId": "uuid",
    "title": "Perbaikan Nilai Matematika",
    "issue": "Nilai matematika turun dari 80 menjadi 60...",
    "goal": "Meningkatkan nilai matematika kembali ke minimal 75...",
    "actionSteps": "1. Berikan soal latihan tambahan\n2. Konsultasi dengan guru\n3. Hubungi orang tua",
    "status": "active",
    "startDate": "2025-01-14",
    "endDate": "2025-02-14",
    "notes": "Siswa kooperatif dan termotivasi",
    "createdAt": "2025-01-14T...",
    "updatedAt": "2025-01-14T..."
  }]
}
```

---

## 7. Key Features

### Multi-line Action Steps

**Input:**
```
1. Berikan soal latihan tambahan setiap hari
2. Konsultasi dengan guru matematika
3. Hubungi orang tua untuk monitoring di rumah
4. Evaluasi progress setiap minggu
```

**Display:**
```tsx
<p className="whitespace-pre-line">
  {intervention.actionSteps}
</p>
```

Result: Each line preserved as new line in display

---

### Date Formatting

**Start Date:**
```js
new Date("2025-01-14").toLocaleDateString("id-ID")
// Output: "14/01/2025"
```

**Date Range:**
```
Mulai: 14 Jan • Target: 14 Feb
```

---

## 8. Validation Rules

### Required Fields
- `title` - Min 3 characters
- `issue` - Min 10 characters
- `goal` - Min 10 characters
- `actionSteps` - Min 10 characters
- `startDate` - Valid date
- `status` - One of: active, completed, cancelled

### Optional Fields
- `endDate` - Must be after startDate if provided
- `notes` - Any length

---

## 9. Use Cases

### Use Case 1: Academic Decline
```
Title: Perbaikan Nilai Matematika
Issue: Nilai turun dari 80 ke 60 dalam 2 bulan
Goal: Naikkan ke 75 dalam 1 bulan
Actions:
  1. Les tambahan 3x seminggu
  2. Konsultasi guru matematika
  3. Monitoring orang tua
  4. Evaluasi progress mingguan
Status: Aktif
Duration: 14 Jan - 14 Feb (30 days)
```

### Use Case 2: Behavioral Issue
```
Title: Perbaikan Kedisiplinan
Issue: Sering terlambat dan tidak mengumpulkan PR
Goal: Kehadiran tepat waktu dan PR lengkap
Actions:
  1. Buat jadwal harian dengan orang tua
  2. Sistem reward untuk ketepatan
  3. Check-in harian
  4. Meeting mingguan dengan wali kelas
Status: Aktif
Duration: 14 Jan - 14 Mar (60 days)
```

### Use Case 3: Completed Intervention
```
Title: Perbaikan Nilai Matematika
Status: ✅ Selesai
Notes: Target tercapai, nilai naik ke 78
Badge: Green
```

---

## 10. Key Files

### Frontend
- `app/(main)/interventions/new/page.tsx` - New intervention page
- `components/interventions/intervention-form.tsx` - Form component

### Backend
- `app/api/interventions/route.ts` - CRUD API
- `app/api/interventions/[id]/route.ts` - Single intervention API

### Database
- `drizzle/schema/interventions.ts` - Database schema

---

## 11. Future Enhancements

- [ ] Edit existing interventions
- [ ] Delete interventions
- [ ] Status change history
- [ ] Progress tracking (percentage)
- [ ] Notification/reminder system
- [ ] Attach documents/files
- [ ] Print intervention plan
- [ ] Share with parents
- [ ] Intervention templates
- [ ] Success metrics tracking
