// hooks/useHolidays.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Holiday } from "@/lib/types";
import { safeParseJSON } from "@/lib/storage";
import { isValidISODateKey } from "@/lib/dateFunctions";
import { INDIA_GENERIC_HOLIDAYS_2026 } from "@/lib/holiday-2026";

function uuid(): string {
  // modern browsers: crypto.randomUUID exists
  if (typeof crypto !== "undefined" && "randomUUID" in crypto)
    return crypto.randomUUID();
  // fallback
  return `id_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function storageKey(year: number) {
  return `lwc.holidays.${year}`;
}

function seedDefaultsForYear(year: number): Holiday[] {
  // For now we only seed 2026. Later you can branch by year/country.
  if (year === 2026) {
    return INDIA_GENERIC_HOLIDAYS_2026.map((h) => ({ ...h, id: uuid() }));
  }
  return [];
}

function normalizeLoaded(input: unknown, year: number): Holiday[] {
  if (!Array.isArray(input)) return [];
  const yearPrefix = `${year}-`;

  const out: Holiday[] = [];
  for (const item of input) {
    if (!item || typeof item !== "object") continue;
    const obj = item as Partial<Holiday>;

    if (typeof obj.date !== "string" || !obj.date.startsWith(yearPrefix))
      continue;
    if (!isValidISODateKey(obj.date)) continue;

    const id =
      typeof obj.id === "string" && obj.id.length > 0 ? obj.id : uuid();
    const name =
      typeof obj.name === "string" && obj.name.trim().length > 0
        ? obj.name.trim()
        : "Holiday";
    const enabled = typeof obj.enabled === "boolean" ? obj.enabled : true;

    out.push({ id, date: obj.date, name, enabled });
  }

  // Sort by date
  out.sort((a, b) => a.date.localeCompare(b.date));
  return out;
}

export function useHolidays(year: number) {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load / seed once on mount (client)
  useEffect(() => {
    const key = storageKey(year);
    const parsed = safeParseJSON<unknown>(localStorage.getItem(key));

    const loaded = normalizeLoaded(parsed, year);
    if (loaded.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHolidays(loaded);
    } else {
      const seeded = seedDefaultsForYear(year);
      localStorage.setItem(key, JSON.stringify(seeded));
      setHolidays(seeded);
    }
    setHydrated(true);
  }, [year]);

  const persist = useCallback(
    (next: Holiday[]) => {
      const key = storageKey(year);
      localStorage.setItem(key, JSON.stringify(next));
    },
    [year]
  );

  const addHoliday = useCallback(
    (date: string, name: string, enabled = true) => {
      setHolidays((prev) => {
        const existing = prev.find((h) => h.date === date);

        let next: Holiday[];

        if (existing) {
          // UPDATE existing holiday for that date
          next = prev.map((h) =>
            h.date === date
              ? {
                  ...h,
                  name,
                  enabled // choose to override enabled
                }
              : h
          );
        } else {
          // ADD new holiday
          next = [
            ...prev,
            {
              id: uuid(),
              date,
              name,
              enabled
            }
          ];
        }

        next.sort((a, b) => a.date.localeCompare(b.date));
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const updateHoliday = useCallback(
    (
      id: string,
      patch: Partial<Pick<Holiday, "date" | "name" | "enabled">>
    ) => {
      setHolidays((prev) => {
        const next = prev
          .map((h) => {
            if (h.id !== id) return h;
            if (h.date === patch.date && h.id !== id) {
              // Prevent updating to a date that already exists
              return h;
            }

            const nextEnabled =
              typeof patch.enabled === "boolean" ? patch.enabled : h.enabled;

            return {
              ...h,
              date: patch.date ?? h.date,
              name: patch.name ?? h.name,
              enabled: nextEnabled
            };
          })
          .sort((a, b) => a.date.localeCompare(b.date));

        persist(next);
        return next;
      });
    },
    [persist]
  );

  const toggleHoliday = useCallback(
    (id: string) => {
      setHolidays((prev) => {
        const next = prev.map((h) =>
          h.id === id ? { ...h, enabled: !h.enabled } : h
        );
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const deleteHoliday = useCallback(
    (id: string) => {
      setHolidays((prev) => {
        const next = prev.filter((h) => h.id !== id);
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const resetDefaults = useCallback(() => {
    const seeded = seedDefaultsForYear(year);
    setHolidays(seeded);
    persist(seeded);
  }, [persist, year]);

  const enabledHolidayMap = useMemo(() => {
    // O(1) lookup for calendar cells
    const map = new Map<string, Holiday>();
    for (const h of holidays) {
      if (!h.enabled) continue;
      map.set(h.date, h);
    }
    return map;
  }, [holidays]);

  return {
    hydrated,
    holidays,
    enabledHolidayMap,
    addHoliday,
    updateHoliday,
    toggleHoliday,
    deleteHoliday,
    resetDefaults
  };
}
