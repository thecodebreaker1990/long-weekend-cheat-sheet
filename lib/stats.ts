// lib/stats.ts
import { makeUTCDate, toISODateUTC } from "@/lib/dateFunctions";
import type { Holiday } from "@/lib/types";

export type YearStats = {
  totalWeekends: number;
  totalHolidays: number;
  totalOffDays: number; // weekends + holidays (excluding overlaps)
  paidLeavesAvailable: number;
};

/**
 * Get the start date for calculations (today if within year, otherwise Jan 1 of the year)
 */
function getStartDate(year: number): Date {
  const today = new Date();
  const todayUTC = makeUTCDate(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate()
  );
  const yearStart = makeUTCDate(year, 0, 1);
  const yearEnd = makeUTCDate(year, 11, 31);

  // If today is before the year, start from Jan 1
  if (todayUTC < yearStart) {
    return yearStart;
  }

  // If today is within the year, start from today
  if (todayUTC >= yearStart && todayUTC <= yearEnd) {
    return todayUTC;
  }

  // If today is after the year, return year end (will result in 0 counts)
  return yearEnd;
}

/**
 * Calculate statistics for a given year from today onwards (or from Jan 1 if year hasn't started)
 */
export function calculateYearStats(
  year: number,
  enabledHolidays: Holiday[],
  paidLeavesAvailable: number = 0
): YearStats {
  // Create Sets for efficient lookup
  const weekendDates = new Set<string>();
  const holidayDates = new Set<string>();

  // Get the start date (today if within year, otherwise Jan 1)
  const startDate = getStartDate(year);
  const yearEnd = makeUTCDate(year, 11, 31);

  // If start date is after year end, return zeros
  if (startDate > yearEnd) {
    return {
      totalWeekends: 0,
      totalHolidays: 0,
      totalOffDays: 0,
      paidLeavesAvailable
    };
  }

  const startMonth = startDate.getUTCMonth();
  const startDay = startDate.getUTCDate();

  // Iterate from start date through December 31
  for (let month = startMonth; month < 12; month++) {
    // Get the last day of the month
    const lastDay = makeUTCDate(year, month + 1, 0).getUTCDate();
    const firstDay = month === startMonth ? startDay : 1;

    for (let day = firstDay; day <= lastDay; day++) {
      const current = makeUTCDate(year, month, day);
      const isoDate = toISODateUTC(current);
      const weekday = current.getUTCDay();

      if (weekday === 0 || weekday === 6) {
        // Saturday (6) or Sunday (0)
        weekendDates.add(isoDate);
      }
    }
  }

  // Add enabled holidays that are on or after the start date
  const startDateISO = toISODateUTC(startDate);
  for (const holiday of enabledHolidays) {
    if (
      holiday.enabled &&
      holiday.date.startsWith(`${year}-`) &&
      holiday.date >= startDateISO
    ) {
      holidayDates.add(holiday.date);
    }
  }

  // Calculate total off-days (weekends + holidays, excluding overlaps)
  // A holiday on a weekend should only count once
  const offDaysSet = new Set([...weekendDates, ...holidayDates]);

  return {
    totalWeekends: weekendDates.size,
    totalHolidays: holidayDates.size,
    totalOffDays: offDaysSet.size,
    paidLeavesAvailable
  };
}
