// Setup Banner - Prompt user to complete setup
// Shows when user hasn't completed school profile setup
// Last updated: 2025-10-17

"use client";

import { AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SetupBanner() {
  return (
    <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-500" />
        <div className="flex-1">
          <h3 className="font-semibold text-amber-900 dark:text-amber-100">
            Lengkapi Profil Sekolah Anda
          </h3>
          <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
            Untuk mulai menggunakan semua fitur aplikasi, silakan lengkapi
            informasi sekolah dan data pribadi Anda terlebih dahulu.
          </p>
          <div className="mt-3">
            <Button asChild size="sm" className="gap-2">
              <Link href="/setup">
                Setup Sekarang
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
