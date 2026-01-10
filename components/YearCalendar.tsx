// components/YearCalendar.tsx
import React from "react";
import MonthGrid from "./MonthGrid";

export default function YearCalendar() {
  const year = 2026;

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
        </header>

        {/* Responsive year grid: 1 col mobile, 2 cols tablet, 3/4 cols desktop */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }, (_, monthIndex) => (
            <MonthGrid key={monthIndex} year={year} monthIndex={monthIndex} />
          ))}
        </div>
      </div>
    </main>
  );
}
