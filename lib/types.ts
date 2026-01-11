// lib/types.ts
export type CalendarDay = {
  iso: string; // YYYY-MM-DD
  day: number; // 1..31
  isCurrentMonth: boolean;
  isWeekend: boolean;
  weekday: number; // 0=Sun..6=Sat
};

export type Holiday = {
  id: string; // uuid
  date: string; // "YYYY-MM-DD" (UTC date key)
  name: string;
  enabled: boolean;
};

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

export type PaidLeavesInput = {
  value?: string | number;
};

export type Ok<T> = { ok: true; value: T };
export type Err = { ok: false; error: string };
export type Result<T> = Ok<T> | Err;
