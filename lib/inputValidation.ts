import { isValidISODateKey } from "@/lib/dateFunctions";
import {
  HolidayInput,
  NormalizedHoliday,
  PaidLeavesInput,
  Result
} from "@/lib/types";

export function validateHoliday(
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

const MAX_PAID_LEAVES = 200;

export function validatePaidLeaves(input: PaidLeavesInput): Result<number> {
  const rawValue = String(input.value).trim();

  // Check if input is empty
  if (!rawValue) {
    return { ok: false, error: "Paid leaves cannot be empty." };
  }

  // Check if input has non-numeric characters
  if (!/^\d+$/.test(rawValue)) {
    return { ok: false, error: "Paid leaves must be a number." };
  }

  // Parse to number
  const numValue = parseInt(rawValue, 10);

  // Check if negative
  if (numValue < 0) {
    return { ok: false, error: "Paid leaves cannot be negative." };
  }

  // Check if too large
  if (numValue > MAX_PAID_LEAVES) {
    return {
      ok: false,
      error: `Paid leaves cannot exceed ${MAX_PAID_LEAVES} days.`
    };
  }

  return {
    ok: true,
    value: numValue
  };
}
