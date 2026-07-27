import { Moon, Sun } from "lucide-react";
import { ShiftColumn } from "./shift-column.component";
import type { Employee } from "@/apis/employee.api";
import type { Shift } from "./shift-column.component";

type Props = {
  employees: Employee[] | undefined;
  dayShifts: Shift[];
  nightShifts: Shift[];
  overlapIds: Set<string>;
  onUpdateDayShift: (shift: Shift) => void;
  onRemoveDayShift: (id: string) => void;
  onAddDayShift: () => void;
  onUpdateNightShift: (shift: Shift) => void;
  onRemoveNightShift: (id: string) => void;
  onAddNightShift: () => void;
};

export default function WorkSchedulePanel({
  employees,
  dayShifts,
  nightShifts,
  overlapIds,
  onUpdateDayShift,
  onRemoveDayShift,
  onAddDayShift,
  onUpdateNightShift,
  onRemoveNightShift,
  onAddNightShift,
}: Props) {
  return (
    <section className="grid gap-3 lg:grid-cols-2">
      <ShiftColumn
        title="Ca ngày"
        rangeLabel="06:00 – 18:00"
        icon={<Sun className="size-3.5 text-amber-600" />}
        accent={{ headerBg: "bg-amber-50", iconBg: "bg-amber-100" }}
        shifts={dayShifts}
        overlapIds={overlapIds}
        onChange={onUpdateDayShift}
        onRemove={onRemoveDayShift}
        onAdd={onAddDayShift}
        employees={employees}
      />
      <ShiftColumn
        title="Ca đêm"
        rangeLabel="18:00 – 06:00"
        icon={<Moon className="size-3.5 text-indigo-600" />}
        accent={{ headerBg: "bg-indigo-50", iconBg: "bg-indigo-100" }}
        shifts={nightShifts}
        overlapIds={overlapIds}
        onChange={onUpdateNightShift}
        onRemove={onRemoveNightShift}
        onAdd={onAddNightShift}
        employees={employees}
      />
    </section>
  );
}
