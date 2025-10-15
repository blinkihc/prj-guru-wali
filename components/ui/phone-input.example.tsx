// PhoneInput Usage Examples
// Created: 2025-01-14
// Contoh implementasi komponen PhoneInput

"use client";

import { useState } from "react";
import { toast } from "@/lib/toast";
import {
  formatPhoneNumber,
  normalizePhoneNumber,
  validatePhoneNumber,
} from "@/lib/validators/phone";
import { PhoneInput } from "./phone-input";
import { RippleButton } from "./ripple-button";

/**
 * EXAMPLE 1: Basic Usage
 */
export function BasicPhoneInputExample() {
  const [phone, setPhone] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi
    const validation = validatePhoneNumber(phone);
    if (!validation.valid) {
      toast.error(validation.error || "Nomor tidak valid");
      return;
    }

    // Kirim data (simulasi webhook)
    console.log("📞 Sending to webhook:", {
      phone: phone, // Format: 628xxxxxxxxx
      formatted: formatPhoneNumber(phone), // Format: +628xxxxxxxxx
    });

    toast.success(`Data terkirim: ${formatPhoneNumber(phone)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        {/* biome-ignore lint/a11y/noLabelWithoutControl: Example code */}
        <label className="text-sm font-medium">Nomor HP Orang Tua</label>
        <PhoneInput value={phone} onChange={setPhone} />
      </div>

      <RippleButton type="submit">Submit</RippleButton>
    </form>
  );
}

/**
 * EXAMPLE 2: With Form (Controlled Component)
 */
export function FormPhoneInputExample() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi phone
    const validation = validatePhoneNumber(formData.phone);
    if (formData.phone && !validation.valid) {
      toast.error(validation.error || "Nomor HP tidak valid");
      return;
    }

    // Simulasi API call / webhook
    const payload = {
      name: formData.name,
      phone: formData.phone, // Already in 62xxx format
      email: formData.email,
    };

    console.log("📤 Webhook payload:", payload);

    // Simulasi POST request
    try {
      // await fetch('/api/webhook', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload),
      // });

      toast.success("Data berhasil dikirim!");
    } catch (_error) {
      toast.error("Gagal mengirim data");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div className="space-y-2">
        {/* biome-ignore lint/a11y/noLabelWithoutControl: Example code */}
        <label className="text-sm font-medium">Nama Lengkap</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
      </div>

      <div className="space-y-2">
        {/* biome-ignore lint/a11y/noLabelWithoutControl: Example code */}
        <label className="text-sm font-medium">
          Nomor HP <span className="text-destructive">*</span>
        </label>
        <PhoneInput
          value={formData.phone}
          onChange={(value) => setFormData({ ...formData, phone: value })}
        />
        <p className="text-xs text-muted-foreground">
          Format otomatis: +62 8xxxxxxxxx
        </p>
      </div>

      <div className="space-y-2">
        {/* biome-ignore lint/a11y/noLabelWithoutControl: Example code */}
        <label className="text-sm font-medium">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <RippleButton type="submit">Kirim Data</RippleButton>
    </form>
  );
}

/**
 * EXAMPLE 3: Handle User Input Starting with 0
 */
export function HandleZeroPrefixExample() {
  const [phone, setPhone] = useState("");

  const handleChange = (value: string) => {
    setPhone(value);

    // Log untuk debugging
    console.log("Raw value:", value);
    console.log("Formatted:", formatPhoneNumber(value));
    console.log("Normalized:", normalizePhoneNumber(value));
  };

  const handleSubmit = () => {
    // Webhook payload
    const webhookData = {
      phone: phone, // 628xxxxxxxxx
      display: formatPhoneNumber(phone), // +628xxxxxxxxx
      timestamp: new Date().toISOString(),
    };

    console.log("📡 Webhook:", webhookData);
    toast.success(`Terkirim: ${formatPhoneNumber(phone)}`);
  };

  return (
    <div className="space-y-4 max-w-md">
      <div>
        {/* biome-ignore lint/a11y/noLabelWithoutControl: Example code */}
        <label className="text-sm font-medium">Test Input</label>
        <PhoneInput value={phone} onChange={handleChange} />
      </div>

      <div className="p-4 bg-muted rounded-md text-sm font-mono">
        <div>Raw: {phone || "(empty)"}</div>
        <div>Formatted: {formatPhoneNumber(phone) || "(empty)"}</div>
        <div>Valid: {validatePhoneNumber(phone).valid ? "✅" : "❌"}</div>
      </div>

      <RippleButton onClick={handleSubmit} disabled={!phone}>
        Test Webhook
      </RippleButton>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>🧪 Test cases:</p>
        <ul className="list-disc list-inside ml-2">
          <li>Ketik: 0821... → Auto jadi 62821...</li>
          <li>Ketik: 821... → Jadi 62821...</li>
          <li>Ketik: 9xxx → Error (harus dimulai 8)</li>
        </ul>
      </div>
    </div>
  );
}

/**
 * EXAMPLE 4: Integration dengan Zod Schema
 */
import { z } from "zod";
import { phoneSchema } from "@/lib/validators/phone";

const studentSchema = z.object({
  fullName: z.string().min(1, "Nama wajib diisi"),
  parentContact: phoneSchema, // Optional Indonesian phone validation
});

type StudentForm = z.infer<typeof studentSchema>;

export function ZodValidationExample() {
  const [formData, setFormData] = useState<StudentForm>({
    fullName: "",
    parentContact: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate with Zod
    const result = studentSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      // biome-ignore lint/suspicious/noExplicitAny: Zod error type
      result.error.issues.forEach((err: any) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast.error("Validasi gagal");
      return;
    }

    // Success - send to webhook
    console.log("✅ Valid data:", result.data);
    console.log("📤 Webhook payload:", {
      ...result.data,
      parentContact: result.data.parentContact || null,
    });

    toast.success("Data valid & terkirim!");
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div className="space-y-2">
        {/* biome-ignore lint/a11y/noLabelWithoutControl: Example code */}
        <label className="text-sm font-medium">Nama Siswa *</label>
        <input
          type="text"
          value={formData.fullName}
          onChange={(e) =>
            setFormData({ ...formData, fullName: e.target.value })
          }
          className="w-full px-3 py-2 border rounded-md"
        />
        {errors.fullName && (
          <p className="text-xs text-destructive">{errors.fullName}</p>
        )}
      </div>

      <div className="space-y-2">
        {/* biome-ignore lint/a11y/noLabelWithoutControl: Example code */}
        <label className="text-sm font-medium">Kontak Orang Tua</label>
        <PhoneInput
          value={formData.parentContact || ""}
          onChange={(value) =>
            setFormData({ ...formData, parentContact: value })
          }
          error={errors.parentContact}
        />
      </div>

      <RippleButton type="submit">Submit dengan Zod</RippleButton>
    </form>
  );
}
