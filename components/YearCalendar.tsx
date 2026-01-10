// components/YearCalendar.tsx
"use client";
import MonthGrid from "./MonthGrid";
import { useHolidays } from "@/hooks/useHolidays";
import HolidayManager from "@/components/HolidayManager";

export default function YearCalendar() {
  const year = 2026;
  const {
    hydrated,
    holidays,
    enabledHolidayMap,
    addHoliday,
    updateHoliday,
    toggleHoliday,
    deleteHoliday,
    resetDefaults
  } = useHolidays(year);

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
          {/* Holiday Manager (panel/modal) */}
          <HolidayManager
            year={year}
            hydrated={hydrated}
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
