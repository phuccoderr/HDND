import {
  SelectFieldWork,
  type SelectFieldItem,
} from "./select-field-work.component";
import ComboboxFieldWork from "./combobox-field-work.component";
import type { Employee } from "@/apis/employee.api";

type Props = {
  empCommand: string;
  empDuty: string;
  empOnLeave: Employee[];
  employeeCommandItems: SelectFieldItem[];
  employeeDutyItems: SelectFieldItem[];
  onCommandChange: (value: string) => void;
  onDutyChange: (value: string) => void;
  onOnLeaveChange: (employees: Employee[]) => void;
  employees: Employee[] | undefined;
};

export default function WorkAssignments({
  empCommand,
  empDuty,
  empOnLeave,
  employeeCommandItems,
  employeeDutyItems,
  onCommandChange,
  onDutyChange,
  onOnLeaveChange,
  employees,
}: Props) {
  return (
    <section className="border rounded-sm bg-white p-3 text-[12px]">
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <span className="font-medium">Trực chỉ huy:</span>
          <SelectFieldWork
            onValueChange={onCommandChange}
            items={employeeCommandItems}
            value={empCommand}
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="font-medium">Trực ban:</span>
          <SelectFieldWork
            onValueChange={onDutyChange}
            items={employeeDutyItems}
            value={empDuty}
          />
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <span className="text-[12px]">
          <span className="font-medium">Trực bếp:</span> Bùi Quốc Dũng - Dương
          Nhật Huy
        </span>
        <span className="text-[12px]">
          <span className="font-medium">Trực ngày:</span> 21/7
        </span>
      </div>

      <div className="mt-3 space-y-2">
        <span className="font-medium">Nghỉ phép:</span>
        <ComboboxFieldWork
          options={employees ?? []}
          value={empOnLeave}
          onValueChange={onOnLeaveChange}
          optionLabel={(emp) => emp.full_name}
          placeholder="Chọn nhân viên nghỉ phép"
        />
      </div>
    </section>
  );
}
