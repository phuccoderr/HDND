import * as z from "zod";
import { format } from "date-fns";

export const scheduleColors = [
  {
    key: "blue",
    bgColor: "oklch(95% 0.03 243.15)",
    textColor: "oklch(45% 0.14 243.15)",
  },
  {
    key: "green",
    bgColor: "oklch(96% 0.04 142.00)",
    textColor: "oklch(43% 0.12 142.00)",
  },
  {
    key: "amber",
    bgColor: "oklch(96% 0.04 70.00)",
    textColor: "oklch(47% 0.13 70.00)",
  },
  {
    key: "rose",
    bgColor: "oklch(95% 0.04 15.00)",
    textColor: "oklch(45% 0.14 15.00)",
  },
  {
    key: "purple",
    bgColor: "oklch(95% 0.04 295.00)",
    textColor: "oklch(45% 0.14 295.00)",
  },
] as const;

// tra nhanh key -> style, dùng để tô màu event trên calendar
export const scheduleColorMap = Object.fromEntries(
  scheduleColors.map((c) => [c.key, c]),
);

export const scheduleFormSchema = z.object({
  title: z.string().min(1, "Vui lòng nhập tiêu đề"),
  note: z.string(),
  color: z.string(),
  is_all_day: z.boolean(),
  start_datetime: z.string(),
  end_datetime: z.string(),
  employee_ids: z.array(z.string()),
});

export type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

export const buildDateTimeValue = (date: Date | undefined, time: string) => {
  if (!date) return "";
  const [hours, minutes] = time.split(":").map(Number);
  const selectedDate = new Date(date);
  selectedDate.setHours(hours, minutes, 0, 0);
  return format(selectedDate, "yyyy-MM-dd'T'HH:mm:ss");
};

export const defaultScheduleFormValues: ScheduleFormValues = {
  title: "",
  note: "",
  color: scheduleColors[0].key, // fix: trước để bgColor, không khớp value của RadioGroupItem
  is_all_day: false,
  start_datetime: buildDateTimeValue(new Date(), "00:00"),
  end_datetime: buildDateTimeValue(new Date(), "00:00"),
  employee_ids: [],
};
