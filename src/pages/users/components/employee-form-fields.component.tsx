import { FieldGroup } from "@/components/ui/field";
import {
  EMPLOYEE_RANK_LABELS,
  employeeRooms,
  employeeTypes,
  type EmployeeFormValues,
} from "./employee-form.schema";
import type { Control } from "react-hook-form";
import { InputField } from "@/components/input-field.component";
import { SelectField } from "@/components/select-field.component";
import { COLOR_SOFT } from "@/constants/colors-soft.const";
import { useMemo } from "react";

type Props = { control: Control<EmployeeFormValues> };

const EmployeeFormFields = ({ control }: Props) => {
  const colorOptions = useMemo(
    () =>
      COLOR_SOFT.map((color) => ({
        label: color.key,
        value: color.key,
        bgColor: color.bgColor,
        textColor: color.textColor,
      })),
    [],
  );

  const rankOptions = useMemo(
    () =>
      Object.entries(EMPLOYEE_RANK_LABELS).map(([value, label]) => ({
        label,
        value,
      })),
    [],
  );
  return (
    <FieldGroup>
      <InputField
        label="Họ và tên"
        name="full_name"
        htmlFor="event-full_name"
        control={control}
        placeholder="Nhập đầy đủ họ và tên"
      />
      <SelectField
        control={control}
        label="Thành viên"
        name="type"
        htmlFor="type"
        items={employeeTypes}
        placeholder="Chọn thành viên"
      />
      <SelectField
        control={control}
        label="Phòng"
        name="room"
        htmlFor="room"
        items={employeeRooms}
        placeholder="Chọn phòng"
      />
      <SelectField
        control={control}
        label="Màu sắc"
        name="color"
        htmlFor="color"
        items={colorOptions}
        renderItem={(item) => (
          <div className="flex items-center gap-2.5 w-full py-1">
            {/* Ô hiển thị màu */}
            <div
              style={{
                backgroundColor: item.bgColor,
                borderColor: item.textColor,
              }}
              className="h-5 w-5 rounded-md border shrink-0"
            />
            {/* Tên màu dạng viết hoa chữ đầu */}
            <span
              style={{ color: item.textColor }}
              className="font-medium text-sm capitalize"
            >
              {item.label}
            </span>
          </div>
        )}
        placeholder="Chọn màu đặc trưng"
      />
      <SelectField
        control={control}
        label="Cấp bậc"
        name="rank"
        htmlFor="rank"
        items={rankOptions}
        placeholder="Cấp bậc thành viên"
      />
      <InputField
        label="Chức vụ"
        name="position"
        htmlFor="position"
        control={control}
        placeholder="Nhập đầy đủ Chức vụ"
      />
    </FieldGroup>
  );
};

export default EmployeeFormFields;
