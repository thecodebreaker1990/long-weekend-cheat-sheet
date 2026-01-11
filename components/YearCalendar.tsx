// components/YearCalendar.tsx
"use client";
import { useMemo } from "react";
import MonthGrid from "./MonthGrid";
import { useHolidays } from "@/hooks/useHolidays";
import { usePaidLeaves } from "@/hooks/usePaidLeaves";
import HolidayManager from "@/components/HolidayManager";
import PaidLeavesInput from "@/components/PaidLeavesInput";
import StatsBar from "@/components/StatsBar";
import { calculateYearStats } from "@/lib/stats";

export default function YearCalendar() {
  const year = 2026;
  const {
    hydrated: holidaysHydrated,
    holidays,
    enabledHolidayMap,
    addHoliday,
    updateHoliday,
    toggleHoliday,
    deleteHoliday,
    resetDefaults
  } = useHolidays(year);

  const {
    paidLeaves,
    hydrated: paidLeavesHydrated,
    updatePaidLeaves
  } = usePaidLeaves(year);

  // Calculate stats
  const stats = useMemo(() => {
    if (!holidaysHydrated) {
      return {
        totalWeekends: 0,
        totalHolidays: 0,
        totalOffDays: 0,
        paidLeavesAvailable: 0
      };
    }
    return calculateYearStats(year, holidays, paidLeaves);
  }, [year, holidays, paidLeaves, holidaysHydrated]);

  const hydrated = holidaysHydrated && paidLeavesHydrated;

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <header className="mb-4">
          <h1 className="text-lg font-semibold tracking-tight">
            Long Weekend Cheat Sheet
          </h1>
          <p className="mt-1 text-sm text-white/60">
            {year} calendar • Weekends highlighted
          </p>

          {/* Paid Leaves Input */}
          <div className="mt-4 mb-4">
            <PaidLeavesInput
              value={paidLeaves}
              onChange={updatePaidLeaves}
              hydrated={paidLeavesHydrated}
            />
          </div>

          {/* Stats Bar */}
          {hydrated && (
            <div className="mb-4">
              <StatsBar stats={stats} />
            </div>
          )}

          {/* Holiday Manager (panel/modal) */}
          <HolidayManager
            year={year}
            hydrated={holidaysHydrated}
            holidays={holidays}
            addHoliday={addHoliday}
            updateHoliday={updateHoliday}
            toggleHoliday={toggleHoliday}
            deleteHoliday={deleteHoliday}
            resetDefaults={resetDefaults}
          />
        </header>

        {/* Responsive year grid: 1 col mobile, 2 cols tablet, 3/4 cols desktop */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }, (_, monthIndex) => (
            <MonthGrid
              key={monthIndex}
              year={year}
              monthIndex={monthIndex}
              enabledHolidayMap={enabledHolidayMap}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
