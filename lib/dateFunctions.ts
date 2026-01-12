// lib/date-functions.ts
/**
 * Convert a Date to a stable YYYY-MM-DD key in UTC (prevents timezone day shift).
 */
export function toISODateKeyUTC(d: Date): string {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function isValidISODateKey(dateKey: string): boolean {
  // Basic validation for YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return false;
  const [y, m, d] = dateKey.split("-").map((x) => Number(x));
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d))
    return false;
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;
  // Further validation via Date round-trip
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

export function makeUTCDate(y: number, m: number, d: number): Date {
  return new Date(Date.UTC(y, m, d));
}

export function toISODateUTC(d: Date): string {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Get the start date for calculations (today if within year, otherwise Jan 1 of the year)
 */
export function getStartDate(year: number): Date {
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
