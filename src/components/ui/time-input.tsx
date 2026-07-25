"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export interface TimeValue {
  hour: number;
  minute: number;
}

export interface TimeInputProps {
  value?: TimeValue;
  defaultValue?: TimeValue;
  onChange?: (value: TimeValue) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

const normalizeTime = (value: TimeValue): TimeValue => ({
  hour: Math.min(23, Math.max(0, value.hour)),
  minute: Math.min(59, Math.max(0, value.minute)),
});

const formatTime = (value: TimeValue) =>
  `${value.hour.toString().padStart(2, "0")}:${value.minute.toString().padStart(2, "0")}`;

export function TimeInput({
  value,
  defaultValue,
  onChange,
  disabled = false,
  placeholder = "00:00",
}: TimeInputProps) {
  const [internalValue, setInternalValue] = React.useState<TimeValue>(() =>
    normalizeTime(defaultValue ?? { hour: 6, minute: 0 }),
  );
  const [open, setOpen] = React.useState(false);

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const emitChange = React.useCallback(
    (nextValue: TimeValue) => {
      const normalizedValue = normalizeTime(nextValue);

      if (!isControlled) {
        setInternalValue(normalizedValue);
      }

      onChange?.(normalizedValue);
    },
    [isControlled, onChange],
  );

  const updateHour = (hour: number) => emitChange({ ...currentValue, hour });
  const updateMinute = (minute: number) =>
    emitChange({ ...currentValue, minute });

  const incrementHour = () => updateHour(currentValue.hour + 1);
  const decrementHour = () => updateHour(currentValue.hour - 1);
  const incrementMinute = () => updateMinute(currentValue.minute + 1);
  const decrementMinute = () => updateMinute(currentValue.minute - 1);

  const handleHourInput = (rawValue: string) => {
    const parsed = Number.parseInt(rawValue, 10);
    if (Number.isNaN(parsed)) {
      return;
    }

    updateHour(parsed);
  };

  const handleMinuteInput = (rawValue: string) => {
    const parsed = Number.parseInt(rawValue, 10);
    if (Number.isNaN(parsed)) {
      return;
    }

    updateMinute(parsed);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="flex items-center gap-1 rounded-xl border px-2 py-1 text-xs"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>{currentValue ? formatTime(currentValue) : placeholder}</span>
        <Clock size={12} />
      </PopoverTrigger>
      <PopoverContent
        className="flex w-32 flex-row items-center justify-center"
        align="start"
        onPointerDownOutside={() => setOpen(false)}
      >
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              incrementHour();
            }}
            disabled={disabled}
            className="rounded-lg p-1.5 transition-colors hover:bg-accent disabled:opacity-50"
            aria-label="Increase hours"
          >
            <ChevronLeft className="h-4 w-4 rotate-90" />
          </button>
          <input
            type="text"
            inputMode="numeric"
            value={currentValue.hour.toString().padStart(2, "0")}
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => handleHourInput(event.target.value)}
            disabled={disabled}
            className="w-12 text-xs rounded border-none bg-transparent text-center focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Hours"
            maxLength={2}
          />
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              decrementHour();
            }}
            disabled={disabled}
            className="rounded-lg p-1.5 transition-colors hover:bg-accent disabled:opacity-50"
            aria-label="Decrease hours"
          >
            <ChevronRight className="h-4 w-4 rotate-90" />
          </button>
        </div>

        <span className="text-lg font-semibold text-muted-foreground">:</span>

        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              incrementMinute();
            }}
            disabled={disabled}
            className="rounded-lg p-1.5 transition-colors hover:bg-accent disabled:opacity-50"
            aria-label="Increase minutes"
          >
            <ChevronLeft className="h-4 w-4 rotate-90" />
          </button>
          <input
            type="text"
            inputMode="numeric"
            value={currentValue.minute.toString().padStart(2, "0")}
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => handleMinuteInput(event.target.value)}
            disabled={disabled}
            className="w-12 text-xs rounded border-none bg-transparent text-center focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Minutes"
            maxLength={2}
          />
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              decrementMinute();
            }}
            disabled={disabled}
            className="rounded-lg p-1.5 transition-colors hover:bg-accent disabled:opacity-50"
            aria-label="Decrease minutes"
          >
            <ChevronRight className="h-4 w-4 rotate-90" />
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default TimeInput;
