// Meetings Chart - Simple CSS-based bar chart
// Shows meeting statistics
// Last updated: 2025-10-17

"use client";

interface MeetingsChartProps {
  totalMeetings: number;
  meetingsThisWeek: number;
  meetingsThisMonth: number;
}

export function MeetingsChart({
  totalMeetings,
  meetingsThisWeek,
  meetingsThisMonth,
}: MeetingsChartProps) {
  if (totalMeetings === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">
          Belum ada data pertemuan
        </p>
      </div>
    );
  }

  // Calculate max for scaling
  const maxValue = Math.max(totalMeetings, meetingsThisMonth, meetingsThisWeek);
  const getHeight = (value: number) => {
    return maxValue > 0 ? (value / maxValue) * 100 : 0;
  };

  return (
    <div className="space-y-4">
      {/* Bar Chart */}
      <div className="flex h-48 items-end justify-around gap-4 px-4">
        {/* This Week */}
        <div className="flex flex-1 flex-col items-center gap-2">
          <div className="flex w-full items-end justify-center">
            <div
              className="w-full rounded-t-md bg-primary transition-all duration-500"
              style={{ height: `${getHeight(meetingsThisWeek)}%` }}
            />
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{meetingsThisWeek}</div>
            <div className="text-xs text-muted-foreground">Minggu Ini</div>
          </div>
        </div>

        {/* This Month */}
        <div className="flex flex-1 flex-col items-center gap-2">
          <div className="flex w-full items-end justify-center">
            <div
              className="w-full rounded-t-md bg-blue-500 transition-all duration-500"
              style={{ height: `${getHeight(meetingsThisMonth)}%` }}
            />
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{meetingsThisMonth}</div>
            <div className="text-xs text-muted-foreground">Bulan Ini</div>
          </div>
        </div>

        {/* Total */}
        <div className="flex flex-1 flex-col items-center gap-2">
          <div className="flex w-full items-end justify-center">
            <div
              className="w-full rounded-t-md bg-green-500 transition-all duration-500"
              style={{ height: `${getHeight(totalMeetings)}%` }}
            />
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{totalMeetings}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        </div>
      </div>
    </div>
  );
}
