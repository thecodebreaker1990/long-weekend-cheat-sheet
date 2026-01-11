"use client";

type Props = {
  isoDateKey: string; // YYYY-MM-DD
  dayNumber: number; // 1..31
  isCurrentMonth: boolean;
  isWeekend: boolean;
  holidayName?: string; // enabled holiday names for this date
  isToday?: boolean; // whether this is the current date
};

const getCustomStyle = (isHoliday: boolean, isWeekend: boolean): string => {
  if (isWeekend && isHoliday)
    return "bg-orange-400/20 border-orange-300/30 text-orange-100";
  if (isWeekend) return "bg-yellow-400/15 border-yellow-300/20 text-yellow-100";
  if (isHoliday) return "bg-green-400/15 border-green-300/20 text-green-100";
  return "bg-white/[0.02] border-white/10 text-white/90 hover:bg-white/[0.05]";
};

export default function DayCell({
  isoDateKey,
  dayNumber,
  isCurrentMonth,
  isWeekend,
  holidayName = "",
  isToday = false
}: Props) {
  const isHoliday = holidayName.length > 0;

  const base =
    "flex min-h-9 items-center justify-center rounded-lg border text-xs transition-colors relative";
  const muted = !isCurrentMonth ? "opacity-30" : "opacity-100";

  const custom = getCustomStyle(isHoliday, isWeekend);

  // Today indicator: prominent blue ring that works with all states
  const todayRing = isToday ? "ring-2 ring-blue-500" : "";

  // Replace these with your Tailwind classes
  const cls = [base, muted, custom, todayRing].filter(Boolean).join(" ");

  const title = isHoliday ? `${isoDateKey} • ${holidayName}` : isoDateKey;

  return (
    <div className={cls} aria-label={isoDateKey} title={title}>
      {dayNumber}
    </div>
  );
}
