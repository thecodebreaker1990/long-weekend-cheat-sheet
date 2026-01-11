// hooks/usePaidLeaves.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { safeParseJSON } from "@/lib/storage";

function storageKey(year: number) {
  return `lwc.paidLeaves.${year}`;
}

export function usePaidLeaves(year: number) {
  const [paidLeaves, setPaidLeaves] = useState<number>(0);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const key = storageKey(year);
    const stored = safeParseJSON<number>(localStorage.getItem(key));

    if (typeof stored === "number" && stored >= 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPaidLeaves(stored);
    }
    setHydrated(true);
  }, [year]);

  const updatePaidLeaves = useCallback(
    (value: number) => {
      const clamped = Math.max(0, Math.floor(value)); // Ensure non-negative integer
      setPaidLeaves(clamped);
      const key = storageKey(year);
      localStorage.setItem(key, JSON.stringify(clamped));
    },
    [year]
  );

  return {
    paidLeaves,
    hydrated,
    updatePaidLeaves
  };
}
