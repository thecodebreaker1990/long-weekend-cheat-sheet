import { isValidISODateKey } from "@/lib/dateFunctions";

type Ok<T> = { ok: true; value: T };
type Err = { ok: false; error: string };
type Result<T> = Ok<T> | Err;

export type HolidayInput = {
  date?: string;
  name?: string;
  enabled?: boolean;
};

export type NormalizedHoliday = {
  date: string;
  name: string;
  enabled: boolean;
};

export function validateAndNormalizeHoliday(
  year: number,
  input: HolidayInput,
  fallback?: Partial<NormalizedHoliday>
): Result<NormalizedHoliday> {
  // Resolve values (patch mode can fall back)
  const rawDate = input.date ?? fallback?.date;
  const rawName = input.name ?? fallback?.name;
  const enabled =
    typeof input.enabled === "boolean"
      ? input.enabled
      : fallback?.enabled ?? true;

  // Date validation
  if (!rawDate) return { ok: false, error: "Date is required." };
  if (!rawDate || typeof rawDate !== "string")
    return { ok: false, error: "Invalid date." };
  if (!isValidISODateKey(rawDate))
    return { ok: false, error: "Date must be YYYY-MM-DD." };
  if (!rawDate.startsWith(`${year}-`))
    return { ok: false, error: `Date must be within ${year}.` };

  // Name validation
  const name = (rawName ?? "").trim();
  if (!name) return { ok: false, error: "Holiday name cannot be empty." };

  // Cap length
  const finalName = name.length > 60 ? name.slice(0, 60) : name;

  return {
    ok: true,
    value: { date: rawDate, name: finalName, enabled }
  };
}
