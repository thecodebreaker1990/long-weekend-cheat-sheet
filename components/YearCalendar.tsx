// components/YearCalendar.tsx
"use client";
import { useMemo } from "react";
import MonthGrid from "./MonthGrid";
import { useHolidays } from "@/hooks/useHolidays";
import { usePaidLeaves } from "@/hooks/usePaidLeaves";
import { useOptimizer } from "@/hooks/useOptimizer";
import HolidayManager from "@/components/HolidayManager";
import PaidLeavesInput from "@/components/PaidLeavesInput";
import DistanceSlider from "@/components/DistanceSlider";
import StatsBar from "@/components/StatsBar";
import { calculateYearStats } from "@/lib/stats";
import {
  detectLongWeekends,
  createLongWeekendMap
} from "@/lib/longWeekendDetection";

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

  const hydrated = holidaysHydrated && paidLeavesHydrated;

  // Optimizer hook (handles candidate generation and optimization)
  const {
    distanceWeeks,
    hydratedDistance,
    updateDistance,
    optimizedPlan,
    paidLeaveMap
  } = useOptimizer(year, holidays, paidLeaves, hydrated);

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

  // Detect natural long weekends (for display)
  const longWeekendMap = useMemo(() => {
    if (!holidaysHydrated) {
      return new Map();
    }
    const longWeekends = detectLongWeekends(year, holidays);
    return createLongWeekendMap(longWeekends);
  }, [year, holidays, holidaysHydrated]);

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

          {/* Distance Slider */}
          {hydrated && hydratedDistance && (
            <div className="mb-4">
              <DistanceSlider value={distanceWeeks} onChange={updateDistance} />
            </div>
          )}

          {/* Stats Bar */}
          {hydrated && (
            <div className="mb-4">
              <StatsBar stats={stats} />
            </div>
          )}

          {/* Optimizer Summary */}
          {hydrated &&
            paidLeaves > 0 &&
            optimizedPlan.selectedBlocks.length > 0 && (
              <div className="mb-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                <div className="text-sm font-semibold text-cyan-100 mb-2">
                  Optimized Plan
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-xs">
                  <div>
                    <div className="text-white/60">Long Weekends</div>
                    <div className="text-lg font-semibold text-cyan-100">
                      {optimizedPlan.selectedBlocks.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-white/60">Total Days Off</div>
                    <div className="text-lg font-semibold text-white">
                      {optimizedPlan.totalDaysOff}
                    </div>
                  </div>
                  <div>
                    <div className="text-white/60">Leaves Used</div>
                    <div className="text-lg font-semibold text-purple-100">
                      {optimizedPlan.totalLeavesUsed}
                    </div>
                  </div>
                  <div>
                    <div className="text-white/60">Remaining</div>
                    <div className="text-lg font-semibold text-blue-100">
                      {optimizedPlan.remainingLeaves}
                    </div>
                  </div>
                </div>
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
              longWeekendMap={longWeekendMap}
              paidLeaveMap={paidLeaveMap}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
