// lib/optimizer.ts
import { getStartDate, makeUTCDate, toISODateUTC } from "@/lib/dateFunctions";
import type { Holiday } from "@/lib/types";
import { detectLongWeekends } from "./longWeekendDetection";

export type CandidateBlock = {
  id: string; // unique identifier
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalDaysOff: number; // Total days in the block (including weekends/holidays)
  leavesRequired: number; // Paid leaves needed
  efficiency: number; // totalDaysOff / leavesRequired (or Infinity if 0 leaves)
  allDates: Set<string>; // All dates in the block
  paidLeaveDates: Set<string>; // Only the dates that require paid leaves
  naturalLongWeekendDates: Set<string>; // Dates that are part of natural long weekends
  description: string; // e.g., "4 days off (Fri–Mon) • 1 leave"
};

export type OptimizedPlan = {
  selectedBlocks: CandidateBlock[];
  totalDaysOff: number;
  totalLeavesUsed: number;
  remainingLeaves: number;
};

/**
 * Check if a date is a weekend
 */
function isWeekend(date: Date): boolean {
  const weekday = date.getUTCDay();
  return weekday === 0 || weekday === 6; // Sunday or Saturday
}

/**
 * Check if a date is a workday (not weekend)
 */
function isWorkday(date: Date): boolean {
  return !isWeekend(date);
}

/**
 * Generate candidate blocks by extending weekends with paid leaves
 */
export function generateCandidateBlocks(
  year: number,
  enabledHolidays: Holiday[],
  naturalLongWeekends: ReturnType<typeof detectLongWeekends>,
  maxBlockLength: number = 10
): CandidateBlock[] {
  const startDate = getStartDate(year);
  const yearEnd = makeUTCDate(year, 11, 31);
  const startDateISO = toISODateUTC(startDate);

  if (startDate > yearEnd) {
    return [];
  }

  // Create sets for efficient lookup
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

  const naturalLWMap = new Map<string, boolean>();
  for (const lw of naturalLongWeekends) {
    for (const date of lw.dates) {
      naturalLWMap.set(date, true);
    }
  }

  const candidates: CandidateBlock[] = [];
  let candidateId = 0;

  // Find all weekends in the year (from start date onwards)
  const processedWeekends = new Set<string>();

  // Iterate through all dates from start to end
  for (let month = startDate.getUTCMonth(); month < 12; month++) {
    const lastDay = makeUTCDate(year, month + 1, 0).getUTCDate();
    const firstDay =
      month === startDate.getUTCMonth() ? startDate.getUTCDate() : 1;

    for (let day = firstDay; day <= lastDay; day++) {
      const current = makeUTCDate(year, month, day);
      const currentISO = toISODateUTC(current);

      // Only process weekends (Saturday or Sunday)
      if (!isWeekend(current)) continue;

      // Skip if we've already processed this weekend
      if (processedWeekends.has(currentISO)) continue;

      // Find the weekend range (Sat-Sun)
      let weekendStart = current;
      let weekendEnd = current;

      if (current.getUTCDay() === 6) {
        // Saturday - weekend is Sat-Sun
        weekendEnd = makeUTCDate(
          current.getUTCFullYear(),
          current.getUTCMonth(),
          current.getUTCDate() + 1
        );
      } else {
        // Sunday - weekend is Sat-Sun (go back to Saturday)
        weekendStart = makeUTCDate(
          current.getUTCFullYear(),
          current.getUTCMonth(),
          current.getUTCDate() - 1
        );
        weekendEnd = current;
      }

      const weekendStartISO = toISODateUTC(weekendStart);
      const weekendEndISO = toISODateUTC(weekendEnd);

      // Mark this weekend as processed
      processedWeekends.add(weekendStartISO);
      processedWeekends.add(weekendEndISO);

      // Generate candidate blocks by extending this weekend
      // Strategy: Try adding leaves before (Thu, Fri) and after (Mon, Tue, Wed)

      // 1. No extension (just weekend) - skip, already covered by natural detection
      // 2. Add Friday before (1 leave) → Thu-Fri-Sat-Sun
      // 3. Add Monday after (1 leave) → Sat-Sun-Mon
      // 4. Add Friday + Monday (2 leaves) → Fri-Sat-Sun-Mon
      // 5. Add Thursday + Friday (2 leaves) → Thu-Fri-Sat-Sun
      // 6. Add Monday + Tuesday (2 leaves) → Sat-Sun-Mon-Tue
      // 7. Add Thursday + Friday + Monday (3 leaves) → Thu-Fri-Sat-Sun-Mon
      // 8. Add Friday + Monday + Tuesday (3 leaves) → Fri-Sat-Sun-Mon-Tue
      // ... and so on

      const extensions = [
        // 1 leave options
        { before: 1, after: 0 }, // Friday
        { before: 0, after: 1 }, // Monday
        // 2 leaves options
        { before: 1, after: 1 }, // Friday + Monday
        { before: 2, after: 0 }, // Thursday + Friday
        { before: 0, after: 2 }, // Monday + Tuesday
        // 3 leaves options
        { before: 2, after: 1 }, // Thu + Fri + Mon
        { before: 1, after: 2 }, // Fri + Mon + Tue
        // 4 leaves options
        { before: 2, after: 2 }, // Thu + Fri + Mon + Tue
        { before: 3, after: 1 }, // Wed + Thu + Fri + Mon
        { before: 1, after: 3 }, // Fri + Mon + Tue + Wed
        // 5 leaves options
        { before: 3, after: 2 }, // Wed + Thu + Fri + Mon + Tue
        { before: 2, after: 3 } // Thu + Fri + Mon + Tue + Wed
      ];

      for (const ext of extensions) {
        const blockStart = makeUTCDate(
          weekendStart.getUTCFullYear(),
          weekendStart.getUTCMonth(),
          weekendStart.getUTCDate() - ext.before
        );
        const blockEnd = makeUTCDate(
          weekendEnd.getUTCFullYear(),
          weekendEnd.getUTCMonth(),
          weekendEnd.getUTCDate() + ext.after
        );

        const blockStartISO = toISODateUTC(blockStart);
        const blockEndISO = toISODateUTC(blockEnd);

        // Skip if block starts before our calculation start date
        if (blockStartISO < startDateISO) continue;

        // Skip if block is too long
        const totalDays =
          Math.floor(
            (blockEnd.getTime() - blockStart.getTime()) / (1000 * 60 * 60 * 24)
          ) + 1;
        if (totalDays > maxBlockLength) continue;

        // Collect all dates in the block
        const allDates = new Set<string>();
        const paidLeaveDates = new Set<string>();
        let leavesRequired = 0;

        const tempDate = new Date(blockStart);
        while (tempDate <= blockEnd) {
          const dateISO = toISODateUTC(tempDate);
          allDates.add(dateISO);

          // Check if this date requires a paid leave
          // (it's a workday and not a holiday)
          if (isWorkday(tempDate) && !holidayDates.has(dateISO)) {
            paidLeaveDates.add(dateISO);
            leavesRequired++;
          }

          tempDate.setUTCDate(tempDate.getUTCDate() + 1);
        }

        // Skip if no leaves required (already a natural long weekend)
        if (leavesRequired === 0) continue;

        // Calculate efficiency
        const efficiency =
          leavesRequired > 0 ? totalDays / leavesRequired : Infinity;

        // Create description
        const startDayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
          blockStart.getUTCDay()
        ];
        const endDayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
          blockEnd.getUTCDay()
        ];
        const description = `${totalDays} days off (${startDayName}–${endDayName}) • ${leavesRequired} leave${
          leavesRequired > 1 ? "s" : ""
        }`;

        // Identify which dates are part of natural long weekends
        const naturalLWDates = new Set<string>();
        for (const date of allDates) {
          if (naturalLWMap.has(date)) {
            naturalLWDates.add(date);
          }
        }

        candidates.push({
          id: `candidate-${candidateId++}`,
          startDate: blockStartISO,
          endDate: blockEndISO,
          totalDaysOff: totalDays,
          leavesRequired,
          efficiency,
          allDates,
          paidLeaveDates, // Only the workdays that need paid leaves
          naturalLongWeekendDates: naturalLWDates,
          description
        });
      }
    }
  }

  return candidates;
}

/**
 * Greedy optimizer: Select best blocks under constraints
 */
export function optimizePlan(
  candidates: CandidateBlock[],
  paidLeavesBudget: number,
  minGapWeeks: number = 3
): OptimizedPlan {
  if (candidates.length === 0 || paidLeavesBudget <= 0) {
    return {
      selectedBlocks: [],
      totalDaysOff: 0,
      totalLeavesUsed: 0,
      remainingLeaves: paidLeavesBudget
    };
  }

  // Sort by efficiency (descending), then by total days off (descending)
  const sorted = [...candidates].sort((a, b) => {
    if (Math.abs(a.efficiency - b.efficiency) > 0.01) {
      return b.efficiency - a.efficiency;
    }
    return b.totalDaysOff - a.totalDaysOff;
  });

  const selected: CandidateBlock[] = [];
  let leavesUsed = 0;
  const minGapDays = minGapWeeks * 7;

  for (const candidate of sorted) {
    // Check budget constraint
    if (leavesUsed + candidate.leavesRequired > paidLeavesBudget) {
      continue;
    }

    // Check overlap and gap constraints
    let canAdd = true;
    for (const selectedBlock of selected) {
      // Check for overlap
      if (
        candidate.startDate <= selectedBlock.endDate &&
        candidate.endDate >= selectedBlock.startDate
      ) {
        canAdd = false;
        break;
      }

      // Check minimum gap
      const gapBefore =
        Math.floor(
          (new Date(selectedBlock.endDate + "T00:00:00Z").getTime() -
            new Date(candidate.startDate + "T00:00:00Z").getTime()) /
            (1000 * 60 * 60 * 24)
        ) + 1;
      const gapAfter =
        Math.floor(
          (new Date(candidate.endDate + "T00:00:00Z").getTime() -
            new Date(selectedBlock.startDate + "T00:00:00Z").getTime()) /
            (1000 * 60 * 60 * 24)
        ) + 1;

      if (gapBefore > 0 && gapBefore < minGapDays) {
        canAdd = false;
        break;
      }
      if (gapAfter > 0 && gapAfter < minGapDays) {
        canAdd = false;
        break;
      }
    }

    if (canAdd) {
      selected.push(candidate);
      leavesUsed += candidate.leavesRequired;
    }
  }

  // Sort selected blocks by start date
  selected.sort((a, b) => a.startDate.localeCompare(b.startDate));

  const totalDaysOff = selected.reduce(
    (sum, block) => sum + block.totalDaysOff,
    0
  );

  return {
    selectedBlocks: selected,
    totalDaysOff,
    totalLeavesUsed: leavesUsed,
    remainingLeaves: paidLeavesBudget - leavesUsed
  };
}

/**
 * Create a map of date -> paid leave info for efficient lookup
 */
export function createPaidLeaveMap(
  optimizedPlan: OptimizedPlan
): Map<string, { block: CandidateBlock; description: string }> {
  const map = new Map<string, { block: CandidateBlock; description: string }>();
  for (const block of optimizedPlan.selectedBlocks) {
    for (const date of block.paidLeaveDates) {
      map.set(date, { block, description: block.description });
    }
  }
  return map;
}
