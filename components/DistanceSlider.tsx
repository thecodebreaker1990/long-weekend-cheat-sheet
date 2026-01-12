// components/DistanceSlider.tsx
"use client";

import React from "react";

type Props = {
  value: number; // weeks (e.g., 3)
  onChange: (value: number) => void;
  min?: number;
  max?: number;
};

export default function DistanceSlider({
  value,
  onChange,
  min = 1,
  max = 8
}: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = parseInt(e.target.value, 10);
    if (!isNaN(numValue)) {
      onChange(numValue);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <label
        htmlFor="distance-slider"
        className="text-sm font-medium text-white/90 whitespace-nowrap"
      >
        Minimum gap between long weekends:
      </label>
      <div className="flex items-center gap-3 flex-1">
        <input
          id="distance-slider"
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={handleChange}
          className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
          aria-label="Minimum gap between long weekends in weeks"
        />
        <span className="text-sm font-semibold text-purple-100 min-w-[4rem] text-right">
          {value} {value === 1 ? "week" : "weeks"}
        </span>
      </div>
    </div>
  );
}
