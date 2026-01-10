"use client";

type Props = {
  isoDateKey: string; // YYYY-MM-DD
  dayNumber: number; // 1..31
  isCurrentMonth: boolean;
  isWeekend: boolean;
  holidayName?: string; // enabled holiday names for this date
};

export default function DayCell({
  isoDateKey,
  dayNumber,
  isCurrentMonth,
  isWeekend,
  holidayName = ""
}: Props) {
  const isHoliday = holidayName.length > 0;

  const base =
    "flex min-h-9 items-center justify-center rounded-lg border text-xs transition-colors";
  const muted = !isCurrentMonth ? "opacity-30" : "opacity-100";

  let custom =
    "bg-white/[0.02] border-white/10 text-white/90 hover:bg-white/[0.05]";
  if (isWeekend) {
    custom = "bg-yellow-400/15 border-yellow-300/20 text-yellow-100";
  } else if (!isWeekend && isHoliday) {
    custom = "bg-green-400/15 border-green-300/20 text-green-100";
  }

  // Replace these with your Tailwind classes
  const cls = [base, muted, custom].filter(Boolean).join(" ");

  const title = isHoliday ? `${isoDateKey} • ${holidayName}` : isoDateKey;

  return (
    <div className={cls} aria-label={isoDateKey} title={title}>
      {dayNumber}
    </div>
  );
}
