import * as React from "react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
  type DropdownProps,
} from "react-day-picker";
import { Button, buttonVariants } from "./button";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { vi } from "date-fns/locale/vi";

import { ScrollArea } from "./scroll-area";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={vi}
      className={cn(
        "group/calendar [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className,
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("vi", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "flex gap-4 py-2 px-4 bg-background border rounded-md flex-col md:flex-row relative",
          defaultClassNames.months,
        ),
        month: cn("flex flex-col w-full gap-4", defaultClassNames.month),
        nav: cn(
          "flex items-center gap-1 w-full absolute top-2 inset-x-0 justify-between",
          defaultClassNames.nav,
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "ml-1 hover:bg-muted aria-disabled:opacity-50 p-0 select-none",
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "mr-1 hover:bg-muted aria-disabled:opacity-50 p-0 select-none",
          defaultClassNames.button_next,
        ),
        month_caption: cn(
          "flex items-center justify-center h-(--cell-size) w-full px-(--cell-size)",
          defaultClassNames.month_caption,
        ),
        dropdowns: cn(
          "w-full flex items-center text-xs font-medium justify-center h-(--cell-size) gap-1.5",
          defaultClassNames.dropdowns,
        ),
        dropdown_root: cn(
          "relative has-focus:border-ring border border-input has-focus:ring-ring/50 has-focus:ring-[3px] rounded-md",
          defaultClassNames.dropdown_root,
        ),
        dropdown: cn(
          "absolute bg-popover inset-0 opacity-0",
          defaultClassNames.dropdown,
        ),
        caption_label: cn(
          "select-none font-medium",
          captionLayout === "label"
            ? "text-xs"
            : "rounded-md pl-2 pr-1 flex items-center gap-1 text-xs h-8 [&>svg]:text-muted-foreground [&>svg]:size-3.5",
          defaultClassNames.caption_label,
        ),

        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-muted-foreground rounded-md flex-1 font-normal text-xs select-none",
          defaultClassNames.weekday,
        ),
        week: cn("flex w-full mt-2", defaultClassNames.week),
        week_number_header: cn(
          "select-none w-(--cell-size)",
          defaultClassNames.week_number_header,
        ),
        week_number: cn(
          "text-[0.8rem] select-none text-muted-foreground",
          defaultClassNames.week_number,
        ),
        day: cn(
          "relative w-full h-full p-0 text-center [&:last-child[data-selected=true]_button]:rounded-r-md group/day aspect-square select-none ",
          props.showWeekNumber
            ? "[&:nth-child(2)[data-selected=true]_button]:rounded-l-md"
            : "[&:first-child[data-selected=true]_button]:rounded-l-md",
          defaultClassNames.day,
        ),
        range_start: cn(
          "rounded-l-md bg-accent",
          defaultClassNames.range_start,
        ),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn("rounded-r-md bg-accent", defaultClassNames.range_end),
        today: cn(
          "bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none",
          defaultClassNames.today,
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground",
          defaultClassNames.outside,
        ),
        disabled: cn(
          "text-muted-foreground opacity-50",
          defaultClassNames.disabled,
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Dropdown: CustomDropdown,
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          );
        },
        Chevron: ({ className, orientation, ...props }) => {
          const basedClassName = "size-4";
          if (orientation === "left") {
            return (
              <ChevronLeftIcon
                className={cn(basedClassName, className)}
                {...props}
              />
            );
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn(basedClassName, className)}
                {...props}
              />
            );
          }

          return (
            <ChevronDownIcon
              className={cn(basedClassName, className)}
              {...props}
            />
          );
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          );
        },
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames();

  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        /*
         * Các style dựa trên trạng thái chọn (selected) và range của ngày
         */
        // Ngày được chọn đơn lẻ (không phải range): nền primary, chữ màu primary-foreground
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground",

        // Ngày nằm giữa khoảng chọn (range middle): nền accent, chữ accent-foreground
        "data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground",

        // Ngày là điểm bắt đầu của range: nền primary, chữ primary-foreground
        "data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground",

        // Ngày là điểm kết thúc của range: nền primary, chữ primary-foreground
        "data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground",

        // Viền và ring khi ngày đang được focus (group vì focus áp dụng trên wrapper day)
        "group-data-[focused=true]/day:border-ring", // Viền màu ring
        "group-data-[focused=true]/day:ring-ring/50", // Ring mờ 50% màu ring
        "group-data-[focused=true]/day:relative", // Đưa lên trên để ring hiển thị rõ
        "group-data-[focused=true]/day:z-10", // Z-index cao hơn các ngày khác
        "group-data-[focused=true]/day:ring-[3px]", // Độ dày ring 3px

        "dark:hover:text-accent-foreground", // Khi hover ở dark mode: chữ màu accent-foreground
        "flex aspect-square size-auto w-full", // Flex, tỷ lệ vuông (aspect-square), width full
        "min-w-(--cell-size)", // Chiều rộng tối thiểu theo biến CSS --cell-size
        "flex-col gap-1 leading-none font-normal", // Layout cột, gap 1, không line-height, font bình thường

        /* Bo góc cho các ngày trong range để tạo hiệu ứng range liên tục */
        "data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md", // Ngày cuối: bo góc phải đầy đủ
        "data-[range-middle=true]:rounded-none", // Ngày giữa: không bo góc
        "data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md", // Ngày đầu: bo góc trái đầy đủ

        /* Style cho phần text phụ (thường là lunar date hoặc note nhỏ bên dưới ngày) */
        "text-xs",
        "[&>span]:text-xs [&>span]:opacity-70", // Các <span> con: chữ size xs, opacity 70%
        "hover:bg-muted",

        defaultClassNames.day,
        className,
      )}
      {...props}
    />
  );
}

function CustomDropdown({
  value,
  onChange,
  options,
  "aria-label": ariaLabel,
}: DropdownProps) {
  const selected = options?.find((child) => child.value === value);
  const handleChange = (value: string) => {
    const changeEvent = {
      target: { value },
    } as React.ChangeEvent<HTMLSelectElement>;
    onChange?.(changeEvent);
  };

  return (
    <Select value={value?.toString()} onValueChange={handleChange}>
      <SelectTrigger className="pr-1.5 w-24 z-50 hover:bg-muted">
        <SelectValue>{selected?.label}</SelectValue>
      </SelectTrigger>
      <SelectContent aria-label={ariaLabel} position="popper">
        <ScrollArea className="h-60">
          {options?.map((option, id: number) => (
            <SelectItem
              key={`${option.value}-${id}`}
              value={option.value?.toString()}
            >
              {option.label}
            </SelectItem>
          ))}
        </ScrollArea>
      </SelectContent>
    </Select>
  );
}

export { Calendar, CalendarDayButton };
