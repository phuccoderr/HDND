import type { Control } from "react-hook-form";
import { FieldGroup } from "@/components/ui/field";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { InputField } from "@/components/input-field.component";
import { TextareaField } from "@/components/textarea-field.component";
import { CalenderField } from "@/components/calender-field.component";
import { RadioField } from "@/components/radio-field.component";
import { CheckboxField } from "@/components/checkbox-field.component";
import { type ScheduleFormValues } from "./schedule-form.schema";
import { ComboboxField } from "@/components/combobox-field.component";
import { useEmployeesQuery } from "@/apis/employee.api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { COLOR_SOFT } from "@/constants/colors-soft.const";

type Props = { control: Control<ScheduleFormValues> };

// Field dùng chung cho cả dialog Tạo mới và Cập nhật
export const ScheduleFormFields = ({ control }: Props) => {
  const { data: employees } = useEmployeesQuery();

  return (
    <ScrollArea className="h-75 lg:h-auto [&>[data-radix-scroll-area-viewport]]:lg:overflow-visible">
      <FieldGroup>
        <InputField
          label="Tiêu đề"
          name="title"
          htmlFor="event-title"
          control={control}
          placeholder="Nhập tiêu đề sự kiện"
        />
        <TextareaField
          label="Ghi chú"
          name="note"
          htmlFor="event-note"
          control={control}
          placeholder="Nhập ghi chú"
        />
        <ComboboxField
          control={control}
          label="Thành viên"
          htmlFor="employee"
          name="employee_ids"
          options={employees ?? []}
        />
        <CalenderField
          label="Bắt đầu ngày"
          name="start_datetime"
          control={control}
        />
        <CalenderField
          label="Kết thúc ngày"
          name="end_datetime"
          control={control}
        />
        <CheckboxField
          label="Cả ngày"
          control={control}
          name="is_all_day"
          htmlFor="is_all_day"
        />
        <RadioField
          label="Màu sắc"
          name="color"
          control={control}
          items={COLOR_SOFT.map((color) => color.key)}
          className="flex gap-3"
        >
          {COLOR_SOFT.map((item) => (
            <RadioGroupItem
              value={item.key}
              key={item.key}
              className="w-6 h-6 rounded-full hover:opacity-75"
              style={{ backgroundColor: item.bgColor }}
            />
          ))}
        </RadioField>
      </FieldGroup>
    </ScrollArea>
  );
};
