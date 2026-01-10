// lib/holidays/india-2026.ts
import type { Holiday } from "@/lib/types";

/**
 * Generic India holiday starter pack for 2026.
 * NOTE: India holidays vary by state and lunar calendars.
 * Treat this as an editable seed list.
 *
 * Dates are YYYY-MM-DD (UTC date keys).
 */
export const INDIA_GENERIC_HOLIDAYS_2026: Omit<Holiday, "id">[] = [
  { date: "2026-01-01", name: "New Year’s Day", enabled: true },
  {
    date: "2026-01-14",
    name: "Makar Sankranti / Pongal (observed)",
    enabled: true
  },
  { date: "2026-01-26", name: "Republic Day", enabled: true },

  { date: "2026-03-08", name: "Holi", enabled: true },

  { date: "2026-03-29", name: "Good Friday", enabled: true },

  { date: "2026-04-14", name: "Dr. B. R. Ambedkar Jayanti", enabled: true },

  { date: "2026-05-01", name: "Labour Day / May Day", enabled: true },

  { date: "2026-08-15", name: "Independence Day", enabled: true },

  { date: "2026-10-02", name: "Gandhi Jayanti", enabled: true },

  {
    date: "2026-10-20",
    name: "Dussehra / Vijayadashami",
    enabled: true
  },
  { date: "2026-11-08", name: "Diwali (Deepavali)", enabled: true },

  { date: "2026-12-25", name: "Christmas Day", enabled: true }
];
