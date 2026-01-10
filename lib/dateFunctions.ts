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
