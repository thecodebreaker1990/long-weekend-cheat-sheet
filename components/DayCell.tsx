"use client";

type Props = {
  isoDateKey: string; // YYYY-MM-DD
  dayNumber: number; // 1..31
  isCurrentMonth: boolean;
  isWeekend: boolean;
  holidayName?: string; // enabled holiday names for this date
  isToday?: boolean; // whether this is the current date
  longWeekendDescription?: string; // e.g., "3 days off (Sat–Mon)" - natural long weekend
  paidLeaveDescription?: string; // e.g., "4 days off (Fri–Mon) • 1 leave" - paid leave extended
};

const getCustomStyle = (
  isHoliday: boolean,
  isWeekend: boolean,
  isPaidLeaveExtended: boolean
): string => {
  // Paid leave extended days take highest priority (cyan/blue color)
  // These are the workdays that user needs to take as paid leaves
  if (isPaidLeaveExtended) {
    return "bg-cyan-500/25 border-cyan-400/40 text-cyan-100 ring-1 ring-cyan-400/30";
  }
  // Holiday takes priority over weekend
  if (isHoliday && !isWeekend)
    return "bg-green-400/15 border-green-300/20 text-green-100";
  if (isWeekend) return "bg-yellow-400/15 border-yellow-300/20 text-yellow-100";
  return "bg-white/[0.02] border-white/10 text-white/90 hover:bg-white/[0.05]";
};

export default function DayCell({
  isoDateKey,
  dayNumber,
  isCurrentMonth,
  isWeekend,
  holidayName = "",
  isToday = false,
  paidLeaveDescription = ""
}: Props) {
  const isHoliday = holidayName.length > 0;
  const isPaidLeaveExtended = paidLeaveDescription.length > 0;

  const base =
    "flex min-h-9 items-center justify-center rounded-lg border text-xs transition-colors relative";
  const muted = !isCurrentMonth ? "opacity-30" : "opacity-100";

  const custom = getCustomStyle(isHoliday, isWeekend, isPaidLeaveExtended);

  // Today indicator: prominent blue ring that works with all states
  const todayRing = isToday ? "ring-2 ring-blue-500" : "";

  // Replace these with your Tailwind classes
  const cls = [base, muted, custom, todayRing].filter(Boolean).join(" ");

  // Build title/tooltip - paid leave takes priority
  let title = isoDateKey;
  if (isPaidLeaveExtended) {
    title = `${isoDateKey} • ${paidLeaveDescription}`;
  } else if (isHoliday) {
    title = `${isoDateKey} • ${holidayName}`;
  }

  return (
    <div className={cls} aria-label={isoDateKey} title={title}>
      {dayNumber}
    </div>
  );
}
