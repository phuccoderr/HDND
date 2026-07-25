import React, { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Điều chỉnh đường dẫn import cho phù hợp dự án của bạn

export type SelectFieldItem = {
  value: string;
  label: string;
};

export type SelectFieldProps = {
  items?: SelectFieldItem[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

export const SelectFieldWork = ({
  items = [],
  value,
  onValueChange,
  placeholder = "Chọn lựa",
  disabled = false,
}: SelectFieldProps) => {
  const selectedItem = useMemo(
    () => items.find((item) => item.value === value),
    [items, value],
  );

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className="h-6! rounded text-blue-fg bg-blue-bg focus-visible:border-transparent focus-visible:ring-0 focus-visible:outline-none [&>svg]:hidden">
        <SelectValue placeholder={placeholder}>
          <span className="text-blue-fg">
            {selectedItem ? selectedItem.label : placeholder}
          </span>
        </SelectValue>
      </SelectTrigger>

      <SelectContent
        position="popper"
        align="start"
        className="data-[state=open]:slide-in-from-bottom-8 data-[state=open]:zoom-in-100 duration-400"
      >
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value} className="text-sm">
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
