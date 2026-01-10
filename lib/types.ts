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
