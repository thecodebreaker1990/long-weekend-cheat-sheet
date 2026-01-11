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
 * Calculate statistics for a given year
 */
export function calculateYearStats(
  year: number,
  enabledHolidays: Holiday[],
  paidLeavesAvailable: number = 0
): YearStats {
  // Create Sets for efficient lookup
  const weekendDates = new Set<string>();
  const holidayDates = new Set<string>();

  // Iterate through all days in the year (365 or 366 days)
  // Start from January 1 and go through December 31
  for (let month = 0; month < 12; month++) {
    // Get the last day of the month
    const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

    for (let day = 1; day <= lastDay; day++) {
      const current = makeUTCDate(year, month, day);
      const isoDate = toISODateUTC(current);
      const weekday = current.getUTCDay();

      if (weekday === 0 || weekday === 6) {
        // Saturday (6) or Sunday (0)
        weekendDates.add(isoDate);
      }
    }
  }

  // Add enabled holidays
  for (const holiday of enabledHolidays) {
    if (holiday.enabled && holiday.date.startsWith(`${year}-`)) {
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
