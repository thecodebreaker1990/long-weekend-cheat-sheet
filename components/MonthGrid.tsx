// components/MonthGrid.tsx
import React, { useMemo } from "react";
import { getMonthGrid, MONTH_NAMES, WEEKDAY_SHORT } from "@/lib/calendar";

type Props = {
  year: number;
  monthIndex: number;
};

export default function MonthGrid({ year, monthIndex }: Props) {
  const days = useMemo(
    () => getMonthGrid(year, monthIndex),
    [year, monthIndex]
  );

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 shadow-sm">
      <header className="mb-2 flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold tracking-wide">
          {MONTH_NAMES[monthIndex]}
        </h2>
        <span className="text-xs text-white/60">{year}</span>
      </header>

      <div className="grid grid-cols-7 gap-1 text-[11px] text-white/50">
        {WEEKDAY_SHORT.map((w) => (
          <div key={w} className="py-1 text-center">
            {w}
          </div>
        ))}
      </div>

      <div
        className="grid grid-cols-7 gap-1"
        role="grid"
        aria-label={`${MONTH_NAMES[monthIndex]} ${year}`}
      >
        {days.map((d) => {
          const base =
            "flex min-h-9 items-center justify-center rounded-lg border text-xs transition-colors";
          const muted = !d.isCurrentMonth ? "opacity-30" : "opacity-100";

          const weekend = d.isWeekend
            ? "bg-yellow-400/15 border-yellow-300/20 text-yellow-100"
            : "bg-white/[0.02] border-white/10 text-white/90 hover:bg-white/[0.05]";

          return (
            <div
              key={d.iso}
              aria-label={d.iso}
              className={`${base} ${weekend} ${muted}`}
            >
              {d.day}
            </div>
          );
        })}
      </div>
    </section>
  );
}
