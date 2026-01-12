// hooks/useOptimizer.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { safeParseJSON } from "@/lib/storage";
import type { Holiday } from "@/lib/types";
import { detectLongWeekends } from "@/lib/longWeekendDetection";
import {
  generateCandidateBlocks,
  optimizePlan,
  createPaidLeaveMap,
  type OptimizedPlan
} from "@/lib/optimizer";

function storageKey(year: number) {
  return `lwc.distance.${year}`;
}

export function useOptimizer(
  year: number,
  holidays: Holiday[],
  paidLeaves: number,
  hydrated: boolean
) {
  const [distanceWeeks, setDistanceWeeks] = useState<number>(3);
  const [hydratedDistance, setHydratedDistance] = useState(false);

  // Load distance preference from localStorage
  useEffect(() => {
    const key = storageKey(year);
    const stored = safeParseJSON<number>(localStorage.getItem(key));
    if (typeof stored === "number" && stored >= 1 && stored <= 8) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDistanceWeeks(stored);
    }
    setHydratedDistance(true);
  }, [year]);

  const updateDistance = useCallback(
    (weeks: number) => {
      const clamped = Math.max(1, Math.min(8, Math.floor(weeks)));
      setDistanceWeeks(clamped);
      const key = storageKey(year);
      localStorage.setItem(key, JSON.stringify(clamped));
    },
    [year]
  );

  // Detect natural long weekends
  const naturalLongWeekends = useMemo(() => {
    if (!hydrated) return [];
    return detectLongWeekends(year, holidays);
  }, [year, holidays, hydrated]);

  // Generate candidate blocks
  const candidateBlocks = useMemo(() => {
    if (!hydrated) return [];
    return generateCandidateBlocks(year, holidays, naturalLongWeekends);
  }, [year, holidays, naturalLongWeekends, hydrated]);

  // Optimize plan
  const optimizedPlan = useMemo(() => {
    if (!hydrated || paidLeaves <= 0 || candidateBlocks.length === 0) {
      return {
        selectedBlocks: [],
        totalDaysOff: 0,
        totalLeavesUsed: 0,
        remainingLeaves: paidLeaves
      } as OptimizedPlan;
    }
    return optimizePlan(candidateBlocks, paidLeaves, distanceWeeks);
  }, [candidateBlocks, paidLeaves, distanceWeeks, hydrated]);

  // Create paid leave map for efficient lookup
  const paidLeaveMap = useMemo(() => {
    return createPaidLeaveMap(optimizedPlan);
  }, [optimizedPlan]);

  return {
    distanceWeeks,
    hydratedDistance,
    updateDistance,
    naturalLongWeekends,
    candidateBlocks,
    optimizedPlan,
    paidLeaveMap
  };
}
