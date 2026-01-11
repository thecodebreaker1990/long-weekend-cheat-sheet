// components/PaidLeavesInput.tsx
"use client";

import React, { useEffect, useState } from "react";
import { validatePaidLeaves } from "@/lib/inputValidation";

type Props = {
  value: number;
  onChange: (value: number) => void;
  hydrated: boolean;
};

export default function PaidLeavesInput({ value, onChange, hydrated }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState<string>(
    hydrated ? String(value) : ""
  );

  // Sync input value when prop changes (e.g., on hydration)
  useEffect(() => {
    if (hydrated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInputValue(String(value));
    }
  }, [value, hydrated]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Validate the input on every change
    const result = validatePaidLeaves({ value: newValue });

    if (result.ok) {
      onChange(result.value);
      setError(null);
    } else {
      // Show error immediately for all validation failures
      setError(result.error);
    }
  };

  const handleBlur = () => {
    // Re-validate on blur to ensure final state is correct
    const result = validatePaidLeaves({ value: inputValue });
    if (result.ok) {
      onChange(result.value);
      setError(null);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <label
        htmlFor="paid-leaves-input"
        className="text-sm font-medium text-white/90"
      >
        Paid leaves available:
      </label>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <input
            id="paid-leaves-input"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={inputValue}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={!hydrated}
            placeholder="0"
            className="w-24 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/90 outline-none placeholder:text-white/40 focus:ring-2 focus:ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Paid leaves available"
            aria-invalid={error ? "true" : "false"}
          />
          <span className="text-xs text-white/60">days</span>
        </div>
        {error ? <div className="text-xs text-red-400">{error}</div> : null}
      </div>
    </div>
  );
}
