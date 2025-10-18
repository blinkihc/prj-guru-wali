// Setup Wizard Page - First-time user onboarding
// Last updated: 2025-10-13

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  ReviewStep,
  SchoolDataStep,
  TeacherIdentityStep,
  WelcomeStep,
} from "@/components/wizard/steps";
import { WizardLayout } from "@/components/wizard/wizard-layout";

const WIZARD_STEPS = [
  {
    title: "Selamat Datang",
    description: "Pengenalan aplikasi",
  },
  {
    title: "Data Sekolah",
    description: "Informasi sekolah",
  },
  {
    title: "Identitas Guru",
    description: "Data diri Anda",
  },
  {
    title: "Konfirmasi",
    description: "Periksa & simpan",
  },
];

export interface WizardData {
  // School data
  schoolName: string;
  educationStage: string;
  cityDistrict: string;

  // Teacher data
  fullName: string;
  nipNuptk: string;
}

export default function SetupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [wizardData, setWizardData] = useState<WizardData>({
    schoolName: "",
    educationStage: "",
    cityDistrict: "",
    fullName: "",
    nipNuptk: "",
  });

  const updateData = (data: Partial<WizardData>) => {
    setWizardData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(wizardData),
      });

      const data = (await response.json()) as {
        error?: string;
        success?: boolean;
      };

      if (!response.ok) {
        toast.error(data.error || "Gagal menyimpan data");
        return;
      }

      toast.success("Setup berhasil! Selamat datang di Guru Wali");
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Setup error:", error);
      toast.error("Terjadi kesalahan saat setup");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeStep onNext={handleNext} />;
      case 2:
        return (
          <SchoolDataStep
            data={wizardData}
            onUpdate={updateData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 3:
        return (
          <TeacherIdentityStep
            data={wizardData}
            onUpdate={updateData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 4:
        return (
          <ReviewStep
            data={wizardData}
            onComplete={handleComplete}
            onPrevious={handlePrevious}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <WizardLayout currentStep={currentStep} steps={WIZARD_STEPS}>
      {renderStep()}
    </WizardLayout>
  );
}
