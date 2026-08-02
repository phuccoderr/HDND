import React, { useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";

type SearchableSelectProps<T> = {
  /** Danh sách dữ liệu đầu vào */
  options: T[];
  /** Giá trị đang được chọn */
  value?: T | null;
  /** Hàm callback khi chọn item */
  onChange: (value: T) => void;
  /** Hàm lấy nhãn hiển thị cho item (mặc định lấy thuộc tính `label` hoặc `name` nếu có) */
  getOptionLabel?: (option: T) => string;
  /** Hàm lấy giá trị duy nhất cho key của React (mặc định lấy `id`) */
  getOptionValue?: (option: T) => string | number;
  /** Danh sách các key trong đối tượng T dùng để lọc khi tìm kiếm (ví dụ: ['full_name', 'email']) */
  searchKeys?: (keyof T)[];
  /** Văn bản hiển thị khi chưa chọn */
  placeholder?: string;
  /** Văn bản ô nhập tìm kiếm */
  searchPlaceholder?: string;
  /** Custom giao diện cho từng item trong danh sách (nếu muốn) */
  renderOption?: (option: T) => React.ReactNode;
  /**
   * Tùy biến Trigger Button theo ý thích.
   * Truyền vào hàm nhận 2 tham số: (selectedItem, isOpen)
   */
  renderTrigger?: (
    selected: T | null | undefined,
    isOpen: boolean,
  ) => React.ReactNode;
  /** Custom class cho nút trigger */
  triggerClassName?: string;
};

const SearchableSelect = <T,>({
  options = [],
  value,
  onChange,
  getOptionLabel = (opt: any) => opt?.label ?? opt?.name ?? String(opt),
  getOptionValue = (opt: any) => opt?.id ?? getOptionLabel(opt),
  searchKeys,
  placeholder = "Chọn...",
  searchPlaceholder = "Tìm kiếm...",
  renderTrigger,
  renderOption,
  triggerClassName = "",
}: SearchableSelectProps<T>) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const query = search.toLowerCase().trim();

    return options.filter((item) => {
      // 1. Nếu chỉ định rõ searchKeys, lọc theo các field đó
      if (searchKeys && searchKeys.length > 0) {
        return searchKeys.some((key) => {
          const val = item[key];
          return val != null && String(val).toLowerCase().includes(query);
        });
      }
      // 2. Mặc định: Lọc theo label hiển thị
      return getOptionLabel(item).toLowerCase().includes(query);
    });
  }, [options, search, searchKeys, getOptionLabel]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {renderTrigger ? (
          renderTrigger(value, open)
        ) : (
          <Button
            type="button"
            variant="outline"
            className={`flex h-6 w-full items-center justify-between rounded-md border border-border px-3 text-sm ${triggerClassName}`}
          >
            <Label className={value ? "" : "text-muted-foreground"}>
              {value ? getOptionLabel(value) : placeholder}
            </Label>
          </Button>
        )}
      </PopoverTrigger>

      <PopoverContent className="w-64 p-2 gap-2" align="start">
        <Input
          autoFocus
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-6! text-xs "
        />

        <ScrollArea className="h-56">
          {filteredOptions.length === 0 ? (
            <div className="px-2 py-1.5 text-xs text-slate-400 text-center">
              Không có kết quả
            </div>
          ) : (
            filteredOptions.map((option) => {
              const optionKey = getOptionValue(option);
              return (
                <Button
                  key={optionKey}
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    onChange(option);
                    setSearch("");
                    setOpen(false);
                  }}
                  className="block w-full rounded p-2 text-left font-normal"
                >
                  {renderOption ? renderOption(option) : getOptionLabel(option)}
                </Button>
              );
            })
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default SearchableSelect;
