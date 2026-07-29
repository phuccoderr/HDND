import { FieldGroup } from "@/components/ui/field";
import {
  employeeRooms,
  employeeTypes,
  type EmployeeFormValues,
} from "./employee-form.schema";
import type { Control } from "react-hook-form";
import { InputField } from "@/components/input-field.component";
import { SelectField } from "@/components/select-field.component";

type Props = { control: Control<EmployeeFormValues> };

const EmployeeFormFields = ({ control }: Props) => {
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
        htmlFor="type"
        items={employeeRooms}
        placeholder="Chọn phòng"
      />
    </FieldGroup>
  );
};

export default EmployeeFormFields;
