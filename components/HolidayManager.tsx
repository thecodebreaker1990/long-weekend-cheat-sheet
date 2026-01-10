// components/Holidays/HolidayManager.tsx
"use client";

import React, { useMemo, useState } from "react";
import type { Holiday } from "@/lib/types";
import { validateAndNormalizeHoliday } from "@/lib/holidayValidation";

type Props = {
  year: number;
  hydrated: boolean;
  holidays: Holiday[];
  addHoliday: (date: string, name: string, enabled?: boolean) => void;
  updateHoliday: (
    id: string,
    patch: Partial<Pick<Holiday, "date" | "name" | "enabled">>
  ) => void;
  toggleHoliday: (id: string) => void;
  deleteHoliday: (id: string) => void;
  resetDefaults: () => void;
};

export default function HolidayManager({
  year,
  hydrated,
  holidays,
  addHoliday,
  updateHoliday,
  toggleHoliday,
  deleteHoliday,
  resetDefaults
}: Props) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(`${year}-01-01`);
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [holidayID, setHolidayID] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return holidays;
    return holidays.filter(
      (h) => h.name.toLowerCase().includes(q) || h.date.includes(q)
    );
  }, [holidays, search]);

  const enabledCount = useMemo(
    () => holidays.filter((h) => h.enabled).length,
    [holidays]
  );

  const onAdd = () => {
    const result = validateAndNormalizeHoliday(year, { date, name });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    addHoliday(date, name.trim(), true);
    onClear();
  };

  const onEdit = () => {
    if (!holidayID) return;

    const result = validateAndNormalizeHoliday(year, { date, name });
    if (!result.ok) {
      setError(result.error);
      return;
    }

    updateHoliday(holidayID, { date, name });
    setHolidayID(null);
    onClear();
  };

  const onClear = () => {
    setDate(`${year}-01-01`);
    setName("");
    setError(null);
  };

  const onInitEditOperation = (h: Holiday) => {
    setHolidayID(h.id);
    setDate(h.date);
    setName(h.name);
    setError(null);
  };

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/90 shadow-sm transition-colors hover:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-white/20"
      >
        Manage Holidays
        <span className="rounded-lg border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[11px] text-white/70">
          {enabledCount}/{holidays.length}
        </span>
      </button>

      {/* Modal */}
      {open ? (
        <div
          className="fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          aria-label="Manage Holidays"
        >
          {/* Backdrop */}
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Close"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-2xl rounded-t-3xl border border-white/10 bg-[#0b0c10]/95 p-4 shadow-2xl backdrop-blur md:inset-y-10 md:bottom-auto md:rounded-3xl">
            {/* Header */}
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold tracking-wide text-white">
                  Holidays ({year})
                </div>
                <div className="mt-0.5 text-xs text-white/60">
                  Generic list (editable). Toggle ON/OFF to include/exclude.
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/90 transition-colors hover:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-white/20"
              >
                Close
              </button>
            </div>

            {!hydrated ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/70">
                Loading…
              </div>
            ) : (
              <>
                {/* Controls */}
                <div className="mb-3 grid gap-2 md:grid-cols-3">
                  <div className="md:col-span-2">
                    <label className="sr-only">Search holidays</label>
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by name or date (e.g. 2026-10)"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/90 placeholder:text-white/40 outline-none focus:ring-2 focus:ring-white/20"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={resetDefaults}
                    className="rounded-xl border border-red-300/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-100 transition-colors hover:bg-red-500/15 focus:outline-none focus:ring-2 focus:ring-red-300/20"
                  >
                    Reset defaults
                  </button>
                </div>

                {/* Add row */}
                <div className="mb-3 grid gap-2 md:grid-cols-3">
                  <div>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/90 outline-none focus:ring-2 focus:ring-white/20"
                      aria-label="Holiday date"
                    />
                    <div className="mt-1 text-[11px] text-white/50">
                      Year must be {year}
                    </div>
                  </div>

                  <div className="md:col-span-1">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Holiday name"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/90 placeholder:text-white/40 outline-none focus:ring-2 focus:ring-white/20"
                      aria-label="Holiday name"
                    />
                  </div>

                  {error ? (
                    <div className="mt-1 text-xs text-red-400">{error}</div>
                  ) : null}

                  <button
                    type="button"
                    onClick={holidayID ? onEdit : onAdd}
                    className="rounded-xl border border-emerald-300/20 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-100 transition-colors hover:bg-emerald-500/15 focus:outline-none focus:ring-2 focus:ring-emerald-300/20"
                  >
                    {holidayID ? "Update" : "Add"}
                  </button>
                  <button
                    type="button"
                    onClick={onClear}
                    className="rounded-xl border border-emerald-300/20 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-100 transition-colors hover:bg-emerald-500/15 focus:outline-none focus:ring-2 focus:ring-emerald-300/20"
                  >
                    Clear
                  </button>
                </div>

                {/* List */}
                <div className="max-h-[52vh] overflow-auto rounded-2xl border border-white/10 bg-white/[0.02] p-2 md:max-h-[58vh]">
                  {filtered.length === 0 ? (
                    <div className="p-4 text-sm text-white/60">
                      No holidays found.
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      {filtered.map((h) => (
                        <div
                          key={h.id}
                          className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3"
                        >
                          {/* Toggle */}
                          <button
                            type="button"
                            onClick={() => toggleHoliday(h.id)}
                            className={[
                              "shrink-0 rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors focus:outline-none focus:ring-2",
                              h.enabled
                                ? "border-emerald-300/20 bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/20 focus:ring-emerald-300/20"
                                : "border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.06] focus:ring-white/20"
                            ].join(" ")}
                            aria-label={`Toggle ${h.name}`}
                          >
                            {h.enabled ? "ON" : "OFF"}
                          </button>

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold text-white/90">
                              {h.name}
                            </div>
                            <div className="mt-0.5 text-xs text-white/60">
                              {h.date}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onInitEditOperation(h)}
                              className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-white/85 transition-colors hover:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-white/20"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => deleteHoliday(h.id)}
                              className="rounded-xl border border-red-300/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-100 transition-colors hover:bg-red-500/15 focus:outline-none focus:ring-2 focus:ring-red-300/20"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
