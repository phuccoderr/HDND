import { type Employee, useEmployeesQuery } from "@/apis/employee.api";
import { SelectFieldWork } from "./components/select-field-work.component";
import { useEffect, useMemo, useState } from "react";
import ComboboxFieldWork from "./components/combobox-field-work.component";
import { Moon, Sun } from "lucide-react";
import {
  endMinutesAdjusted,
  isDayStart,
  nextId,
  nightSortKey,
  ShiftColumn,
  timeToMinutes,
  type Period,
  type Shift,
} from "./components/shift-column.component";
import DndItems from "./components/dnd-items.component";
import {
  getStoredRoom1,
  getStoredRoom3,
  getStoredRooms,
  getStoredToilet,
  setStoredRoom1,
  setStoredRoom3,
  setStoredToilet,
} from "@/stores/phong.store";
import { Button } from "@/components/ui/button";

const WorkPage = () => {
  const { data: employees } = useEmployeesQuery();
  const [empCommand, setEmpCommand] = useState("");
  const [empDuty, setEmpDuy] = useState("");
  const [empOnLeave, setEmpOnLeave] = useState<Employee[] | []>([]);

  const [empRoom1, setEmpRoom1] = useState(() => getStoredRoom1());
  const [empRoom3, setEmpRoom3] = useState(() => getStoredRoom3());
  const [empToilet, setEmpToilet] = useState(() => getStoredToilet());

  const handleSetRoom1 = (roomId: string) => {
    const member = getStoredRooms().phong1.find(
      (emp) => emp.id === Number(roomId),
    );
    if (member) {
      setEmpRoom1(member);
      setStoredRoom1(member);
    }
  };

  const handleSetRoom3 = (roomId: string) => {
    const member = getStoredRooms().phong3.find(
      (emp) => emp.id === Number(roomId),
    );
    if (member) {
      setEmpRoom3(member);
      setStoredRoom3(member);
    }
  };

  const handleSetToilet = (roomId: string) => {
    const member = getStoredRooms().phong3.find(
      (emp) => emp.id === Number(roomId),
    );
    if (member) {
      setEmpToilet(member);
      setStoredToilet(member);
    }
  };

  const empsRoom3Options = getStoredRooms().phong3.map((emp) => ({
    label: emp.full_name,
    value: String(emp.id),
  }));

  const empsRoom1Options = getStoredRooms().phong1.map((emp) => ({
    label: emp.full_name,
    value: String(emp.id),
  }));

  const employeeCommandItems = useMemo(() => {
    if (!employees) return [];

    return employees
      .filter((emp) => emp.type === "COMMAND")
      .map((emp) => ({
        label: emp.full_name,
        value: String(emp.id),
      }));
  }, [employees]);

  const employeeDutyItems = useMemo(() => {
    if (!employees) return [];

    return employees
      .filter((emp) => emp.type === "DUTY")
      .map((emp) => ({
        label: emp.full_name,
        value: String(emp.id),
      }));
  }, [employees]);

  useEffect(() => {
    if (employees && employees.length > 0) {
      setEmpCommand(String(employees[0].id));
    }
  }, [employees]);

  const [dayShifts, setDayShifts] = useState<Shift[]>([]);
  const [nightShifts, setNightShifts] = useState<Shift[]>([]);

  const updateDayShift = (updated: Shift) =>
    setDayShifts((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s)),
    );

  const removeDayShift = (id: string) =>
    setDayShifts((prev) => prev.filter((s) => s.id !== id));

  const updateNightShift = (updated: Shift) =>
    setNightShifts((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s)),
    );

  const removeNightShift = (id: string) =>
    setNightShifts((prev) => prev.filter((s) => s.id !== id));

  const addShift = (column: Period) => {
    if (column === "day") {
      setDayShifts((prev) => [
        ...prev,
        { id: nextId(), emps: [], start: "06:00", end: "08:00" },
      ]);
    }

    if (column === "night") {
      setNightShifts((prev) => [
        ...prev,
        { id: nextId(), emps: [], start: "18:00", end: "20:00" },
      ]);
    }
  };

  const sortDayShifts = useMemo(() => {
    return dayShifts
      .filter((s) => isDayStart(s.start))
      .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
  }, [dayShifts]);

  const sortNightShifts = useMemo(() => {
    return nightShifts
      .filter((s) => !isDayStart(s.start))
      .sort((a, b) => nightSortKey(a.start) - nightSortKey(b.start));
  }, [nightShifts]);

  const { overlapIds } = useMemo(() => {
    const overlaps = new Set<string>();
    const checkOverlap = (list: Shift[], keyFn: (start: string) => number) => {
      for (let i = 1; i < list.length; i++) {
        const prev = list[i - 1];
        const duration =
          endMinutesAdjusted(prev.start, prev.end) - timeToMinutes(prev.start);
        const prevEndKey = keyFn(prev.start) + duration;
        const curStartKey = keyFn(list[i].start);
        if (curStartKey < prevEndKey) {
          overlaps.add(prev.id);
          overlaps.add(list[i].id);
        }
      }
    };
    checkOverlap(sortDayShifts, timeToMinutes);
    checkOverlap(sortNightShifts, nightSortKey);

    return { overlapIds: overlaps };
  }, [dayShifts, nightShifts]);

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Quản lý ca</h1>
          <p className="text-sm text-muted-foreground">
            Thêm, sửa và xóa ca thông tin nhân viên trong hệ thống.
          </p>
        </div>
        <Button>Save</Button>
      </div>
      <div className="border rounded-sm flex flex-wrap gap-2">
        <div className="flex flex-col flex-1 gap-1 text-sm p-2">
          <div className="flex gap-1 items-center">
            <span>Trực chỉ huy:</span>
            <SelectFieldWork
              onValueChange={(value) => {
                setEmpCommand(value);
              }}
              items={employeeCommandItems ?? []}
              value={empCommand}
            />
          </div>
          <div className="flex gap-1 items-center">
            <span>Trực ban:</span>
            <SelectFieldWork
              onValueChange={(value) => {
                setEmpDuy(value);
              }}
              items={employeeDutyItems ?? []}
              value={empDuty}
            />
          </div>
          <span>Trực bếp: Bùi Quốc Dũng - Dương Nhật Huy</span>
          <span>Trực ngày: 21/7</span>
          <ShiftColumn
            title="Ca ngày"
            rangeLabel="06:00 – 18:00"
            icon={<Sun className="size-3.5 text-amber-600" />}
            accent={{ headerBg: "bg-amber-50", iconBg: "bg-amber-100" }}
            shifts={sortDayShifts}
            overlapIds={overlapIds}
            onChange={updateDayShift}
            onRemove={removeDayShift}
            onAdd={() => addShift("day")}
          />
        </div>
        <div className="flex flex-col gap-1 flex-1 text-sm p-2">
          <div className="flex gap-2 items-center">
            <span>Nghỉ phép:</span>
            <ComboboxFieldWork
              options={employees ?? []}
              value={empOnLeave}
              onValueChange={(emps) => setEmpOnLeave(emps)}
              optionLabel={(emp) => emp.full_name}
            />
          </div>
          <span>Trực chiến: 2/3</span>
          <span>Công tác:</span>
          <span>Trực đêm: 21/7</span>
          <ShiftColumn
            title="Ca đêm"
            rangeLabel="18:00 – 06:00"
            icon={<Moon className="size-3.5 text-indigo-600" />}
            accent={{ headerBg: "bg-indigo-50", iconBg: "bg-indigo-100" }}
            shifts={sortNightShifts}
            overlapIds={overlapIds}
            onChange={updateNightShift}
            onRemove={removeNightShift}
            onAdd={() => addShift("night")}
          />
        </div>

        <div className="flex flex-col gap-2 text-sm p-2">
          <div className="flex flex-col gap-2">
            <span>Vệ sinh:</span>
            <div className="flex items-center">
              <div className="flex flex-1 gap-1 items-center">
                <span>Phòng 1:</span>
                <SelectFieldWork
                  onValueChange={handleSetRoom1}
                  items={empsRoom1Options ?? []}
                  value={String(empRoom1?.id)}
                />
              </div>
              <div className="flex flex-1 gap-1 items-center">
                <span>Nhà vệ sinh:</span>
                <SelectFieldWork
                  onValueChange={handleSetToilet}
                  items={empsRoom3Options ?? []}
                  value={String(empToilet?.id)}
                />
              </div>
            </div>
            <div className="flex gap-1 items-center">
              <span>Phòng 3:</span>
              <SelectFieldWork
                onValueChange={handleSetRoom3}
                items={empsRoom3Options ?? []}
                value={String(empRoom3?.id)}
              />
            </div>
          </div>
          <DndItems />
        </div>
      </div>
    </div>
  );
};

export default WorkPage;
