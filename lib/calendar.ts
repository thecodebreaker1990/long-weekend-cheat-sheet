import type { CalendarDay } from "./types";

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

function makeUTCDate(y: number, m: number, d: number): Date {
  return new Date(Date.UTC(y, m, d));
}

function toISODateUTC(d: Date): string {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

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
