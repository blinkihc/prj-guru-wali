// Wizard Layout Component - Main wizard container with stepper
// Last updated: 2025-10-13

"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface WizardStep {
  title: string;
  description: string;
}

interface WizardLayoutProps {
  currentStep: number;
  steps: WizardStep[];
  children: React.ReactNode;
}

export function WizardLayout({
  currentStep,
  steps,
  children,
}: WizardLayoutProps) {
  return (
    <div className="min-h-screen bg-muted/30 flex items-start justify-center">
      <div className="w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-10 mx-auto">
        {/* Stepper */}
        <nav aria-label="Progress" className="mb-10">
          <ol className="flex items-center justify-between">
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const isComplete = stepNumber < currentStep;
              const isCurrent = stepNumber === currentStep;

              return (
                <li
                  key={step.title}
                  className={cn(
                    "relative flex items-center justify-center",
                    index !== steps.length - 1 && "flex-1",
                  )}
                >
                  {/* Step Circle */}
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                        isComplete &&
                          "border-primary bg-primary text-primary-foreground",
                        isCurrent &&
                          "border-primary bg-background text-primary",
                        !isComplete &&
                          !isCurrent &&
                          "border-muted-foreground/30 bg-background text-muted-foreground",
                      )}
                    >
                      {isComplete ? <Check className="h-5 w-5" /> : stepNumber}
                    </div>

                    {/* Step Label */}
                    <div className="mt-2 text-center">
                      <div
                        className={cn(
                          "text-sm font-medium",
                          isCurrent && "text-primary",
                          !isCurrent && "text-muted-foreground",
                        )}
                      >
                        {step.title}
                      </div>
                      <div className="text-xs text-muted-foreground max-w-[120px]">
                        {step.description}
                      </div>
                    </div>
                  </div>

                  {/* Connector Line */}
                  {index !== steps.length - 1 && (
                    <div
                      className={cn(
                        "h-0.5 w-full mx-4 transition-colors",
                        isComplete ? "bg-primary" : "bg-muted-foreground/30",
                      )}
                      style={{ marginTop: "-40px" }}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Content */}
        <div className="bg-card rounded-lg border shadow-sm p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
