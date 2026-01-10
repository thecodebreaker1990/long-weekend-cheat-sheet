import type { CalendarDay } from "@/lib/types";
import { makeUTCDate, toISODateUTC } from "@/lib/dateFunctions";

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

export const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function getMonthGrid(year: number, monthIndex: number): CalendarDay[] {
  // 6-week grid => 42 cells for stable layout
  const first = makeUTCDate(year, monthIndex, 1);
  const firstWeekday = first.getUTCDay(); // 0..6 (Sun..Sat)

  // start on Sunday of the week containing the 1st
  const start = makeUTCDate(year, monthIndex, 1 - firstWeekday);

  const days: CalendarDay[] = [];
  for (let i = 0; i < 42; i++) {
    const d = makeUTCDate(
      start.getUTCFullYear(),
      start.getUTCMonth(),
      start.getUTCDate() + i
    );

    const weekday = d.getUTCDay();
    const isWeekend = weekday === 0 || weekday === 6;

    days.push({
      iso: toISODateUTC(d),
      day: d.getUTCDate(),
      isCurrentMonth: d.getUTCMonth() === monthIndex,
      isWeekend,
      weekday
    });
  }
  return days;
}
