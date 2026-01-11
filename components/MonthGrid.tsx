// components/MonthGrid.tsx
import React, { useMemo } from "react";
import { getMonthGrid, MONTH_NAMES, WEEKDAY_SHORT } from "@/lib/calendar";
import type { Holiday } from "@/lib/types";
import { toISODateKeyUTC } from "@/lib/dateFunctions";
import DayCell from "./DayCell";

type Props = {
  year: number;
  monthIndex: number;
  enabledHolidayMap: Map<string, Holiday>;
};

export default function MonthGrid({
  year,
  monthIndex,
  enabledHolidayMap
}: Props) {
  const days = useMemo(
    () => getMonthGrid(year, monthIndex),
    [year, monthIndex]
  );

  // Compute today's date key once (using UTC to match calendar logic)
  const todayKey = useMemo(() => toISODateKeyUTC(new Date()), []);

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
        {days.map((d) => (
          <DayCell
            key={d.iso}
            isoDateKey={d.iso}
            dayNumber={d.day}
            isCurrentMonth={d.isCurrentMonth}
            isWeekend={d.isWeekend}
            holidayName={enabledHolidayMap.get(d.iso)?.name ?? ""}
            isToday={d.iso === todayKey}
          />
        ))}
      </div>
    </section>
  );
}
