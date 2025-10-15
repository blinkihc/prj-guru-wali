# Student Detail View Flow

> **Last Updated:** 2025-01-14

## Overview

Student Detail Page adalah hub central untuk melihat semua informasi siswa dengan navigasi tab untuk berbagai jenis data.

**URL Pattern:** `/students/[id]`

---

## 1. Page Structure

```
┌─────────────────────────────────────────────┐
│  [← Back]  Student Name                     │
│  Kelas 7A • NISN: 0012345678                │
│            [+ Buat Jurnal Baru]             │
│                                             │
│  ┌────────────────────────────────────┐    │
│  │ [Profil] [Jurnal(2)] [Pertemuan(1)]│    │
│  │         [Intervensi(1)]            │    │
│  └────────────────────────────────────┘    │
│                                             │
│  [Active Tab Content Here]                 │
└─────────────────────────────────────────────┘
```

### Components

**Header:**
- Back button → Navigate to `/students`
- Student name (h1)
- Classroom + NISN (subtitle)
- "Buat Jurnal Baru" button → `/journals/new`

**Tab Navigation:**
- 4 tabs with badge counts
- Active tab highlighted
- Badge shows data count per tab

**Content Area:**
- Dynamic content based on active tab
- Empty states when no data
- Loading states while fetching

---

## 2. Data Fetching

### On Page Load

```
Navigate to /students/[id]
      ↓
Unwrap params (Next.js 15)
      ↓
Fetch data in parallel:
┌─────────────────────────────┐
│ API: GET /api/students/[id] │
│ API: GET /api/journals?studentId=xxx
│ API: GET /api/meetings?studentId=xxx
│ API: GET /api/interventions?studentId=xxx
└─────────────────────────────┘
      ↓
All responses received
      ↓
Update state:
- student
- journals[]
- meetings[]
- interventions[]
      ↓
Render page with data
```

### Error Handling

```
Student not found (404)
→ Show error state
→ [Kembali ke Daftar Siswa]

Network error
→ Show error state
→ [Coba Lagi]
```

---

## 3. Tab 1: Profil

### Layout

```
┌─────────────────────────────────────────────┐
│  Informasi Siswa                            │
│                                             │
│  ┌─────────────────┬─────────────────┐     │
│  │ Nama Lengkap:   │ NISN:           │     │
│  │ Ahmad Fadil     │ 0012345678      │     │
│  ├─────────────────┼─────────────────┤     │
│  │ Kelas:          │ Jenis Kelamin:  │     │
│  │ 7A              │ Laki-laki       │     │
│  ├─────────────────┼─────────────────┤     │
│  │ Nama Orang Tua: │ Kontak Ortu:    │     │
│  │ Bapak Ahmad     │ +628123456789   │     │
│  └─────────────────┴─────────────────┘     │
│                                             │
│  Catatan Khusus:                            │
│  ┌───────────────────────────────────┐     │
│  │ Alergi makanan laut               │     │
│  └───────────────────────────────────┘     │
└─────────────────────────────────────────────┘
```

### Features

- **2-column grid** for efficient space usage
- **Mono font** for NISN and phone numbers
- **Highlighted box** for special notes
- **Fallback** "-" for empty optional fields
- **Phone format** "+62" prefix

### Data Display

```tsx
Gender mapping:
"L" → "Laki-laki"
"P" → "Perempuan"
null → "-"

Phone format:
"628123456789" → "+628123456789"
```

---

## 4. Tab 2: Jurnal

### Empty State

```
Icon: FileText (lucide)
Title: "Belum Ada Jurnal"
Message: "Belum ada catatan jurnal bulanan untuk siswa ini"
Button: [Buat Jurnal]
→ /journals/new
```

### With Data

```
┌─────────────────────────────────────────────┐
│  Januari 2025                               │
│  Jurnal Bulanan • 14 Januari 2025           │
│                                             │
│  📚 Akademik                                │
│  Nilai matematika meningkat dari 70 ke 85  │
│                                             │
│  ⭐ Karakter                                │
│  Mulai menunjukkan sikap peduli...          │
│                                             │
│  🤝 Sosial-Emosional                        │
│  Lebih mudah bergaul dengan teman...        │
│                                             │
│  📋 Kedisiplinan                            │
│  Jarang terlambat, selalu tepat waktu...    │
│                                             │
│  🎯 Potensi & Minat                         │
│  Menunjukkan minat tinggi dalam musik...    │
└─────────────────────────────────────────────┘

(More cards...)
```

### Card Structure

**Header:**
- Title: Monitoring period (e.g., "Januari 2025")
- Subtitle: "Jurnal Bulanan • [created date]"

**Content:**
- 5 sections with icons (only if filled)
- Only description shown (not follow-up/notes)
- Text truncated/limited for preview

**Sorting:**
- Newest first (createdAt DESC)

**Count Badge:**
- Tab shows "Jurnal (X)" where X = total journals

---

## 5. Tab 3: Pertemuan

### Empty State

```
Icon: Users (lucide)
Title: "Belum Ada Log Pertemuan"
Message: "Belum ada catatan pertemuan untuk siswa ini"
Button: [Buat Log Pertemuan]
→ /journals/new
```

### With Data

```
┌─────────────────────────────────────────────┐
│  Konsultasi penurunan nilai matematika      │
│  Pertemuan • Senin, 14 Januari 2025         │
│                                             │
│  📝 Tindak Lanjut                           │
│  Orang tua akan memberikan les tambahan     │
│  di rumah setiap hari                       │
│                                             │
│  💬 Catatan                                 │
│  Bapak Ahmad sangat kooperatif dan peduli   │
│  terhadap perkembangan anaknya              │
└─────────────────────────────────────────────┘

(More cards...)
```

### Card Structure

**Header:**
- Title: Meeting topic
- Subtitle: "Pertemuan • [long date format]"

**Date Format:**
```js
new Date(meetingDate).toLocaleDateString("id-ID", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
})
// Output: "Senin, 14 Januari 2025"
```

**Content:**
- Follow-up section (if filled)
- Notes section (if filled)
- Only show filled fields

**Sorting:**
- By meeting date DESC, then createdAt DESC

**Count Badge:**
- Tab shows "Pertemuan (X)" where X = total meetings

---

## 6. Tab 4: Intervensi

### Empty State

```
Icon: Target (lucide)
Title: "Belum Ada Rencana Intervensi"
Message: "Belum ada rencana intervensi untuk siswa ini"
Button: [Buat Rencana Intervensi]
→ /interventions/new?studentId=xxx
(Pre-fills student ID)
```

### With Data

```
┌─────────────────────────────────────────────┐
│  Perbaikan Nilai Matematika    [🔵 Aktif]   │
│  Mulai: 14 Jan • Target: 14 Feb             │
│                                             │
│  🔍 Masalah                                 │
│  Nilai matematika turun dari 80 menjadi 60 │
│  dalam 2 bulan terakhir                     │
│                                             │
│  🎯 Tujuan                                  │
│  Meningkatkan nilai kembali ke minimal 75   │
│  dalam 1 bulan melalui bimbingan intensif   │
│                                             │
│  📋 Langkah Tindakan                        │
│  1. Berikan soal latihan tambahan           │
│  2. Konsultasi dengan guru matematika       │
│  3. Hubungi orang tua untuk monitoring      │
│  4. Evaluasi progress setiap minggu         │
│                                             │
│  💬 Catatan                                 │
│  Siswa kooperatif dan termotivasi           │
└─────────────────────────────────────────────┘

(More cards...)
```

### Card Structure

**Header:**
- Title: Intervention title
- Badge: Status with color-coding
- Dates: Start date • Target date

**Status Badges:**
```
🔵 Aktif (blue)
✅ Selesai (green)
❌ Dibatalkan (red)
```

**Content:**
- 🔍 Issue description
- 🎯 Goal description
- 📋 Action steps (multi-line preserved)
- 💬 Notes (if filled)

**Action Steps Display:**
```tsx
<p className="whitespace-pre-line">
  {intervention.actionSteps}
</p>
```
Preserves line breaks from textarea input

**Sorting:**
- Newest first (createdAt DESC)

**Count Badge:**
- Tab shows "Intervensi (X)" where X = total interventions

---

## 7. Navigation Actions

### From Tab to Create

**Tab: Jurnal**
```
Empty state button
→ /journals/new
(User selects type: Monthly Journal)
```

**Tab: Pertemuan**
```
Empty state button
→ /journals/new
(User selects type: Meeting Log)
```

**Tab: Intervensi**
```
Empty state button
→ /interventions/new?studentId=xxx
(Student pre-filled)
```

### Click Row/Card

**Journals Tab:**
- Future: Click to expand/view full details
- Current: Display only in card

**Pertemuan Tab:**
- Future: Click to edit
- Current: Display only in card

**Intervensi Tab:**
- Future: Click to edit/update status
- Current: Display only in card

---

## 8. Tab State Management

### URL Query Params (Future)

```
/students/[id]?tab=profile      - Show profile tab
/students/[id]?tab=journals     - Show journals tab
/students/[id]?tab=meetings     - Show meetings tab
/students/[id]?tab=interventions - Show interventions tab
```

**Usage:**
```tsx
const searchParams = useSearchParams();
const defaultTab = searchParams.get('tab') || 'profile';

<Tabs defaultValue={defaultTab}>
```

**Navigation:**
```
From meetings list:
Click card → /students/[id]?tab=meetings
Opens student detail with meetings tab active
```

---

## 9. Loading States

### Initial Load

```
Show SkeletonCard components
- Header skeleton
- Tab skeleton
- Content skeleton

Wait for all API responses
→ Replace with actual data
```

### Error State

```
┌─────────────────────────────────┐
│  ❌ Student Not Found            │
│                                 │
│  Unable to load student data    │
│                                 │
│  [Kembali ke Daftar Siswa]      │
└─────────────────────────────────┘
```

---

## 10. Responsive Design

### Desktop (≥1024px)
- Full 4-column tab layout
- 2-column grid for profile info
- Cards full width

### Tablet (768-1023px)
- 4-column tab layout (scrollable if needed)
- 2-column grid for profile info
- Cards full width

### Mobile (<768px)
- Scrollable tab list
- Single column for profile info
- Cards full width
- Stacked layout

---

## 11. Key Files

### Main Component
- `app/(main)/students/[id]/page.tsx` - Student detail page

### UI Components
- `components/ui/tabs.tsx` - Tab navigation
- `components/ui/card.tsx` - Card layout
- `components/ui/badge.tsx` - Status badges
- `components/ui/empty-state.tsx` - Empty states

### API Routes
- `app/api/students/[id]/route.ts` - Student data
- `app/api/journals/route.ts` - Journal data
- `app/api/meetings/route.ts` - Meeting data
- `app/api/interventions/route.ts` - Intervention data

---

## 12. Performance Considerations

### Data Fetching
```tsx
// Parallel fetching for faster load
Promise.all([
  fetch('/api/students/[id]'),
  fetch('/api/journals?studentId=xxx'),
  fetch('/api/meetings?studentId=xxx'),
  fetch('/api/interventions?studentId=xxx'),
])
```

### Pagination (Future)
- Load first 10 items per tab
- "Load more" button at bottom
- Infinite scroll option

### Caching (Future)
- Cache student data (5 min)
- Invalidate on update
- SWR or React Query

---

## 13. Accessibility

### Keyboard Navigation
- Tab key to navigate between tabs
- Enter to switch tabs
- Arrow keys for tab navigation

### Screen Readers
- Proper ARIA labels
- Tab badge counts announced
- Empty state messages clear

### Focus Management
- Focus on active tab after navigation
- Focus trap in dialogs
- Visible focus indicators

---

## 14. Future Enhancements

- [ ] Edit student info inline
- [ ] Quick actions menu per tab
- [ ] Print student report (all tabs)
- [ ] Export tab data to PDF
- [ ] Timeline view (all activities)
- [ ] Attach files/photos
- [ ] Activity feed (recent changes)
- [ ] Share student report
- [ ] Compare with previous period
- [ ] Student progress charts
