# PhoneInput Component

Komponen input nomor telepon Indonesia berbasis Shadcn UI dengan validasi otomatis dan format +62.

## Features

✅ **Auto Prefix +62** - Prefix tidak bisa dihapus/diganti oleh user  
✅ **Validasi Indonesia** - Nomor harus dimulai dengan angka 8 (628xxx)  
✅ **Auto Convert** - Otomatis convert 0xxx → 62xxx  
✅ **Real-time Validation** - Error message langsung muncul  
✅ **Numbers Only** - Hanya menerima input angka  
✅ **Format Display** - Menampilkan format +628xxxxxxxxx  

---

## Installation

Komponen sudah tersedia di:
```
components/ui/phone-input.tsx
lib/validators/phone.ts
```

---

## Basic Usage

### 1. Simple Form

```tsx
import { useState } from "react";
import { PhoneInput } from "@/components/ui/phone-input";
import { RippleButton } from "@/components/ui/ripple-button";

export function MyForm() {
  const [phone, setPhone] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Phone:", phone); // Output: 628123456789
  };

  return (
    <form onSubmit={handleSubmit}>
      <PhoneInput 
        value={phone} 
        onChange={setPhone} 
      />
      <RippleButton type="submit">Submit</RippleButton>
    </form>
  );
}
```

### 2. With Label

```tsx
<div className="space-y-2">
  <Label htmlFor="phone">Kontak Orang Tua</Label>
  <PhoneInput
    id="phone"
    value={formData.parentContact}
    onChange={(value) => setFormData({ ...formData, parentContact: value })}
  />
</div>
```

### 3. With Error Message

```tsx
<PhoneInput
  value={phone}
  onChange={setPhone}
  error="Nomor HP tidak valid"
/>
```

### 4. Disable Validation Display

```tsx
<PhoneInput
  value={phone}
  onChange={setPhone}
  showValidation={false}  // Hide validation messages
/>
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `""` | Nomor telepon dalam format 62xxx |
| `onChange` | `(value: string) => void` | - | Callback saat nilai berubah |
| `error` | `string` | `undefined` | Pesan error custom |
| `showValidation` | `boolean` | `true` | Tampilkan pesan validasi |
| `disabled` | `boolean` | `false` | Disable input |
| `className` | `string` | - | Custom className |
| `...props` | `InputHTMLAttributes` | - | Props HTML input lainnya |

---

## Validation

### Aturan Validasi

1. **Prefix 62** - Wajib dimulai dengan 62
2. **First Digit 8** - Angka pertama setelah 62 harus 8
3. **Length** - 8-13 digit setelah prefix 62
4. **Numbers Only** - Hanya boleh angka

### Contoh Valid

```
✅ 628123456789
✅ 6281234567890
✅ 628987654321
```

### Contoh Invalid

```
❌ 621234567890  (tidak dimulai dengan 8)
❌ 629123456789  (tidak dimulai dengan 8)
❌ 6281234       (terlalu pendek)
❌ 62812345678901234 (terlalu panjang)
```

---

## Utility Functions

### 1. Validate Phone Number

```tsx
import { validatePhoneNumber } from "@/lib/validators/phone";

const result = validatePhoneNumber("628123456789");
if (result.valid) {
  console.log("Valid!");
} else {
  console.error(result.error);
}
```

### 2. Format Phone Number

```tsx
import { formatPhoneNumber } from "@/lib/validators/phone";

formatPhoneNumber("628123456789");  // +628123456789
formatPhoneNumber("8123456789");    // +628123456789
formatPhoneNumber("08123456789");   // +628123456789
```

### 3. Normalize Phone Number

```tsx
import { normalizePhoneNumber } from "@/lib/validators/phone";

normalizePhoneNumber("08123456789");  // 628123456789
normalizePhoneNumber("8123456789");   // 628123456789
normalizePhoneNumber("+628123456789"); // 628123456789
```

---

## Zod Validation

### Optional Phone Field

```tsx
import { z } from "zod";
import { phoneSchema } from "@/lib/validators/phone";

const formSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  parentContact: phoneSchema,  // Optional, validates if filled
});
```

### Required Phone Field

```tsx
import { phoneRequiredSchema } from "@/lib/validators/phone";

const formSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  phone: phoneRequiredSchema,  // Required & validated
});
```

---

## User Behavior

### Input 0xxx (Local Format)

**User mengetik:** `0821...`  
**Auto convert:** `62821...`  
**Display:** `+62821...`  
**Alert:** "Awalan 0 diganti otomatis menjadi +62" (3 detik)

### Input Non-8 First Digit

**User mengetik:** `9123...`  
**Rejected:** Input tidak diterima  
**Error:** "Nomor HP Indonesia harus diawali angka 8"

### Paste Number

**User paste:** `+62 812 3456 7890`  
**Auto clean:** `628123456789`  
**Display:** `+628123456789`

---

## Webhook Integration

### Send to API

```tsx
const handleSubmit = async () => {
  // Validate
  const validation = validatePhoneNumber(phone);
  if (!validation.valid) {
    toast.error(validation.error);
    return;
  }

  // Send to webhook
  const response = await fetch("/api/webhook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone: phone,  // 628xxxxxxxxx
      formatted: formatPhoneNumber(phone),  // +628xxxxxxxxx
    }),
  });

  if (response.ok) {
    toast.success("Data terkirim!");
  }
};
```

### Console Log Demo

```tsx
const handleSubmit = () => {
  console.log("📤 Webhook payload:", {
    phone: phone,  // Raw: 628123456789
    display: formatPhoneNumber(phone),  // Display: +628123456789
    timestamp: new Date().toISOString(),
  });
};
```

---

## Examples

Lihat file contoh lengkap:
```
components/ui/phone-input.example.tsx
```

### Example 1: Basic Usage
Simple form dengan PhoneInput

### Example 2: Form Integration
Form lengkap dengan multiple fields

### Example 3: Handle Zero Prefix
Demo auto-convert 0xxx → 62xxx

### Example 4: Zod Validation
Integration dengan Zod schema

---

## Integration in Student Module

### StudentDialog (Add/Edit Form)

```tsx
{/* Parent Contact */}
<div className="space-y-2">
  <Label htmlFor="parentContact">Kontak Orang Tua</Label>
  <PhoneInput
    id="parentContact"
    value={formData.parentContact}
    onChange={(value) =>
      setFormData({ ...formData, parentContact: value })
    }
    disabled={isSubmitting}
  />
</div>
```

### ImportPreviewTable (CSV Import)

```tsx
<PhoneInput
  value={row.parentContact || ""}
  onChange={(value) =>
    onUpdateRow(index, "parentContact", value || null)
  }
  showValidation={false}
/>
```

---

## Styling

Komponen menggunakan Tailwind CSS dan shadcn/ui design system:

- **Prefix Display:** `text-muted-foreground`
- **Icon:** Lucide React `Phone` icon
- **Input:** Shadcn Input component
- **Error:** `text-destructive`
- **Helper Text:** `text-muted-foreground`

### Custom Styling

```tsx
<PhoneInput
  value={phone}
  onChange={setPhone}
  className="border-blue-500"  // Custom border
/>
```

---

## Testing

### Test Cases

1. ✅ Input normal: `8123456789` → `628123456789`
2. ✅ Input dengan 0: `08123456789` → `628123456789`
3. ✅ Input invalid (9xxx): Rejected with error
4. ✅ Paste formatted: `+62 812 3456 7890` → `628123456789`
5. ✅ Empty value: No error (optional field)
6. ✅ Too short: Error message shown
7. ✅ Too long: Auto truncate to 13 digits

---

## Notes

- Field ini **OPTIONAL** - boleh kosong
- Hasil output selalu format: `628xxxxxxxxx` (tanpa +)
- Display format: `+628xxxxxxxxx` (dengan +)
- Auto-convert 0xxx ke 62xxx
- Validasi real-time saat user mengetik
- Error message otomatis hilang setelah 3 detik

---

## License

Part of PRJ Guru Wali - Student Management System
