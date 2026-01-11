// components/StatsBar.tsx
"use client";

import type { YearStats } from "@/lib/stats";

type Props = {
  stats: YearStats;
};

export default function StatsBar({ stats }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-sm">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {/* Weekends */}
        <div className="flex flex-col">
          <div className="text-xs font-medium text-white/60">
            Available Weekends
          </div>
          <div className="mt-1 text-2xl font-semibold text-yellow-100">
            {stats.totalWeekends}
          </div>
          <div className="text-[11px] text-white/50">days remaining</div>
        </div>

        {/* Holidays */}
        <div className="flex flex-col">
          <div className="text-xs font-medium text-white/60">
            Available Holidays
          </div>
          <div className="mt-1 text-2xl font-semibold text-green-100">
            {stats.totalHolidays}
          </div>
          <div className="text-[11px] text-white/50">days remaining</div>
        </div>

        {/* Total Off-Days */}
        <div className="flex flex-col">
          <div className="text-xs font-medium text-white/60">
            Total Off-Days
          </div>
          <div className="mt-1 text-2xl font-semibold text-white">
            {stats.totalOffDays}
          </div>
          <div className="text-[11px] text-white/50">without planning</div>
        </div>

        {/* Paid Leaves */}
        <div className="flex flex-col">
          <div className="text-xs font-medium text-white/60">Paid Leaves</div>
          <div className="mt-1 text-2xl font-semibold text-blue-100">
            {stats.paidLeavesAvailable}
          </div>
          <div className="text-[11px] text-white/50">available</div>
        </div>
      </div>
    </div>
  );
}
