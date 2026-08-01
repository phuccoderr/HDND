import * as z from "zod";
import { format } from "date-fns";
import { COLOR_SOFT } from "@/constants/colors-soft.const";

export const scheduleFormSchema = z.object({
  title: z.string().min(1, "Vui lòng nhập tiêu đề"),
  note: z.string(),
  color: z.string(),
  is_all_day: z.boolean(),
  start_datetime: z.string(),
  end_datetime: z.string(),
  is_updated: z.boolean(),
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
  color: COLOR_SOFT[0].key, // fix: trước để bgColor, không khớp value của RadioGroupItem
  is_all_day: false,
  start_datetime: buildDateTimeValue(new Date(), "00:00"),
  end_datetime: buildDateTimeValue(new Date(), "00:00"),
  is_updated: true,
  employee_ids: [],
};
