// Assessment Chart - Simple CSS-based donut chart
// Shows students assessed vs not assessed
// Last updated: 2025-10-19 - Added accessible title for SVG

"use client";

interface AssessmentChartProps {
  assessed: number;
  notAssessed: number;
  percentage: number;
}

export function AssessmentChart({
  assessed,
  notAssessed,
  percentage,
}: AssessmentChartProps) {
  const total = assessed + notAssessed;

  if (total === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">Belum ada data siswa</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Donut Chart */}
      <div className="flex items-center justify-center">
        <div className="relative h-40 w-40">
          {/* Background circle */}
          <svg
            className="h-full w-full -rotate-90 transform"
            role="img"
            aria-labelledby="assessment-chart-title"
          >
            <title id="assessment-chart-title">
              {`Perbandingan penilaian siswa: ${assessed} sudah dinilai, ${notAssessed} belum dinilai`}
            </title>
            <circle
              cx="80"
              cy="80"
              r="60"
              fill="none"
              stroke="currentColor"
              strokeWidth="20"
              className="text-muted"
            />
            {/* Progress circle */}
            <circle
              cx="80"
              cy="80"
              r="60"
              fill="none"
              stroke="currentColor"
              strokeWidth="20"
              strokeDasharray={`${(percentage / 100) * 377} 377`}
              className="text-primary transition-all duration-500"
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold">{percentage}%</span>
            <span className="text-xs text-muted-foreground">Dinilai</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span className="text-sm">Sudah Dinilai</span>
          </div>
          <span className="text-sm font-medium">{assessed}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-muted" />
            <span className="text-sm">Belum Dinilai</span>
          </div>
          <span className="text-sm font-medium">{notAssessed}</span>
        </div>
      </div>
    </div>
  );
}
