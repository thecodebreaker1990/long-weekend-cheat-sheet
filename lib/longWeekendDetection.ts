// lib/longWeekendDetection.ts
import { getStartDate, makeUTCDate, toISODateUTC } from "@/lib/dateFunctions";
import type { Holiday } from "@/lib/types";

export type LongWeekend = {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  daysOff: number; // Total days off (including weekends and holidays)
  description: string; // e.g., "3 days off (Sat–Mon)"
  dates: Set<string>; // All dates in this long weekend
};

/**
 * Format a date to a short day name (e.g., "Sat", "Mon")
 */
function formatDayName(date: Date): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[date.getUTCDay()];
}

/**
 * Detect natural long weekends (no paid leaves needed)
 * A long weekend occurs when a holiday is adjacent to a weekend
 */
export function detectLongWeekends(
  year: number,
  enabledHolidays: Holiday[]
): LongWeekend[] {
  const startDate = getStartDate(year);
  const yearEnd = makeUTCDate(year, 11, 31);
  const startDateISO = toISODateUTC(startDate);

  // If start date is after year end, return empty
  if (startDate > yearEnd) {
    return [];
  }

  // Create a set of enabled holiday dates (only from start date onwards)
  const holidayDates = new Set<string>();
  for (const holiday of enabledHolidays) {
    if (
      holiday.enabled &&
      holiday.date.startsWith(`${year}-`) &&
      holiday.date >= startDateISO
    ) {
      holidayDates.add(holiday.date);
    }
  }

  // Track which dates are part of a long weekend (to avoid duplicates)
  const processedDates = new Set<string>();
  const longWeekends: LongWeekend[] = [];

  // Check each holiday to see if it creates a long weekend
  for (const holidayDateStr of holidayDates) {
    if (processedDates.has(holidayDateStr)) continue;

    const holidayDate = new Date(holidayDateStr + "T00:00:00Z");
    const weekday = holidayDate.getUTCDay();

    let startDate: Date;
    let endDate: Date;
    let dates: string[] = [];

    // Holiday on Friday -> creates Sat-Sun long weekend (3 days: Fri, Sat, Sun)
    if (weekday === 5) {
      // Friday
      startDate = holidayDate;
      endDate = makeUTCDate(
        holidayDate.getUTCFullYear(),
        holidayDate.getUTCMonth(),
        holidayDate.getUTCDate() + 2
      ); // Sunday
      dates = [
        toISODateUTC(holidayDate),
        toISODateUTC(
          makeUTCDate(
            holidayDate.getUTCFullYear(),
            holidayDate.getUTCMonth(),
            holidayDate.getUTCDate() + 1
          )
        ), // Saturday
        toISODateUTC(endDate) // Sunday
      ];
    }
    // Holiday on Monday -> creates Sat-Mon long weekend (3 days: Sat, Sun, Mon)
    else if (weekday === 1) {
      // Monday
      startDate = makeUTCDate(
        holidayDate.getUTCFullYear(),
        holidayDate.getUTCMonth(),
        holidayDate.getUTCDate() - 2
      ); // Saturday
      endDate = holidayDate;
      dates = [
        toISODateUTC(startDate), // Saturday
        toISODateUTC(
          makeUTCDate(
            holidayDate.getUTCFullYear(),
            holidayDate.getUTCMonth(),
            holidayDate.getUTCDate() - 1
          )
        ), // Sunday
        toISODateUTC(holidayDate) // Monday
      ];
    }
    // Holiday on Thursday -> creates Thu-Sun long weekend (4 days: Thu, Fri, Sat, Sun)
    else if (weekday === 4) {
      // Thursday
      startDate = holidayDate;
      endDate = makeUTCDate(
        holidayDate.getUTCFullYear(),
        holidayDate.getUTCMonth(),
        holidayDate.getUTCDate() + 3
      ); // Sunday
      dates = [
        toISODateUTC(holidayDate), // Thursday
        toISODateUTC(
          makeUTCDate(
            holidayDate.getUTCFullYear(),
            holidayDate.getUTCMonth(),
            holidayDate.getUTCDate() + 1
          )
        ), // Friday
        toISODateUTC(
          makeUTCDate(
            holidayDate.getUTCFullYear(),
            holidayDate.getUTCMonth(),
            holidayDate.getUTCDate() + 2
          )
        ), // Saturday
        toISODateUTC(endDate) // Sunday
      ];
    }
    // Holiday on Tuesday -> creates Sat-Tue long weekend (4 days: Sat, Sun, Mon, Tue)
    else if (weekday === 2) {
      // Tuesday
      startDate = makeUTCDate(
        holidayDate.getUTCFullYear(),
        holidayDate.getUTCMonth(),
        holidayDate.getUTCDate() - 3
      ); // Saturday
      endDate = holidayDate;
      dates = [
        toISODateUTC(startDate), // Saturday
        toISODateUTC(
          makeUTCDate(
            holidayDate.getUTCFullYear(),
            holidayDate.getUTCMonth(),
            holidayDate.getUTCDate() - 2
          )
        ), // Sunday
        toISODateUTC(
          makeUTCDate(
            holidayDate.getUTCFullYear(),
            holidayDate.getUTCMonth(),
            holidayDate.getUTCDate() - 1
          )
        ), // Monday
        toISODateUTC(holidayDate) // Tuesday
      ];
    }
    // Holiday on Wednesday -> creates Sat-Wed long weekend (5 days: Sat, Sun, Mon, Tue, Wed)
    else if (weekday === 3) {
      // Wednesday
      startDate = makeUTCDate(
        holidayDate.getUTCFullYear(),
        holidayDate.getUTCMonth(),
        holidayDate.getUTCDate() - 4
      ); // Saturday
      endDate = holidayDate;
      dates = [
        toISODateUTC(startDate), // Saturday
        toISODateUTC(
          makeUTCDate(
            holidayDate.getUTCFullYear(),
            holidayDate.getUTCMonth(),
            holidayDate.getUTCDate() - 3
          )
        ), // Sunday
        toISODateUTC(
          makeUTCDate(
            holidayDate.getUTCFullYear(),
            holidayDate.getUTCMonth(),
            holidayDate.getUTCDate() - 2
          )
        ), // Monday
        toISODateUTC(
          makeUTCDate(
            holidayDate.getUTCFullYear(),
            holidayDate.getUTCMonth(),
            holidayDate.getUTCDate() - 1
          )
        ), // Tuesday
        toISODateUTC(holidayDate) // Wednesday
      ];
    }
    // Holiday on Saturday or Sunday -> already a weekend, check for extended weekends
    else if (weekday === 0 || weekday === 6) {
      // Sunday (0) or Saturday (6) - holiday is on weekend
      // Check if there's a holiday on Friday before Saturday, or Monday after Sunday
      if (weekday === 6) {
        // Saturday - check if Friday is also a holiday
        const friday = makeUTCDate(
          holidayDate.getUTCFullYear(),
          holidayDate.getUTCMonth(),
          holidayDate.getUTCDate() - 1
        );
        const fridayISO = toISODateUTC(friday);
        if (holidayDates.has(fridayISO)) {
          // Fri-Sat-Sun (3 days)
          startDate = friday;
          endDate = makeUTCDate(
            holidayDate.getUTCFullYear(),
            holidayDate.getUTCMonth(),
            holidayDate.getUTCDate() + 1
          ); // Sunday
          dates = [
            toISODateUTC(friday),
            toISODateUTC(holidayDate),
            toISODateUTC(endDate)
          ];
        } else {
          // Just Saturday holiday, no long weekend
          continue;
        }
      } else {
        // Sunday - check if Monday is also a holiday
        const monday = makeUTCDate(
          holidayDate.getUTCFullYear(),
          holidayDate.getUTCMonth(),
          holidayDate.getUTCDate() + 1
        );
        const mondayISO = toISODateUTC(monday);
        if (holidayDates.has(mondayISO)) {
          // Sat-Sun-Mon (3 days)
          startDate = makeUTCDate(
            holidayDate.getUTCFullYear(),
            holidayDate.getUTCMonth(),
            holidayDate.getUTCDate() - 1
          ); // Saturday
          endDate = monday;
          dates = [
            toISODateUTC(startDate),
            toISODateUTC(holidayDate),
            toISODateUTC(endDate)
          ];
        } else {
          // Just Sunday holiday, no long weekend
          continue;
        }
      }
    } else {
      // Holiday on other days doesn't create a natural long weekend
      continue;
    }

    // Only include if start date is on or after our calculation start date
    const longWeekendStartISO = toISODateUTC(startDate);
    if (longWeekendStartISO < startDateISO) {
      continue;
    }

    // Check for consecutive holidays that might extend the long weekend
    // This is a simplified version - we can enhance this later
    const datesSet = new Set(dates);
    const daysOff = datesSet.size;

    // Create description
    const startDayName = formatDayName(startDate);
    const endDayName = formatDayName(endDate);
    const description = `${daysOff} days off (${startDayName}–${endDayName})`;

    // Mark all dates as processed
    dates.forEach((d) => processedDates.add(d));

    longWeekends.push({
      startDate: longWeekendStartISO,
      endDate: toISODateUTC(endDate),
      daysOff,
      description,
      dates: datesSet
    });
  }

  // Sort by start date
  longWeekends.sort((a, b) => a.startDate.localeCompare(b.startDate));

  return longWeekends;
}

/**
 * Create a map of date -> long weekend for efficient lookup
 */
export function createLongWeekendMap(
  longWeekends: LongWeekend[]
): Map<string, LongWeekend> {
  const map = new Map<string, LongWeekend>();
  for (const lw of longWeekends) {
    for (const date of lw.dates) {
      map.set(date, lw);
    }
  }
  return map;
}
