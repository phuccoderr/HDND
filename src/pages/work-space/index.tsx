import { useEmployeesQuery } from "@/apis/employee.api";
import { useEffect, useMemo, useState } from "react";
import {
  getStoredRoom1,
  getStoredRoom3,
  getStoredRooms,
  getStoredToilet,
  setStoredRoom1,
  setStoredRoom3,
  setStoredToilet,
} from "@/stores/phong.store";
import {
  type Period,
  type Shift,
  endMinutesAdjusted,
  isDayStart,
  nextId,
  nightSortKey,
  timeToMinutes,
} from "./components/shift-column.component";
import WorkPageHeader from "./components/work-page-header.component";
import WorkAssignments from "./components/work-page-assignments.component";
import WorkSchedulePanel from "./components/work-page-schedule-panel.component";
import WorkCleaningPanel from "./components/work-page-cleaning.component";
import { type WorkFormData, type WorkMode } from "./components/work-page.types";
import { useStoreButtonHeader } from "@/stores/work-space.store";

const WorkPage = () => {
  const { data: employees } = useEmployeesQuery();
  const { setOpen, registerSaveAction, unregisterSaveAction } =
    useStoreButtonHeader();
  const workMode: WorkMode = employees !== undefined ? "edit" : "create";

  const [formState, setFormState] = useState<WorkFormData>(() => ({
    empCommand: "",
    empDuty: "",
    empOnLeave: [],
    empRoom1: getStoredRoom1(),
    empRoom3: getStoredRoom3(),
    empToilet: getStoredToilet(),
    dayShifts: [
      {
        emps: [],
        start: "06:00",
        end: "08:00",
        id: "1",
      },
      {
        emps: [],
        start: "08:00",
        end: "10:00",
        id: "2",
      },
      {
        emps: [],
        start: "10:00",
        end: "12:00",
        id: "3",
      },
      {
        emps: [],
        start: "12:00",
        end: "14:00",
        id: "4",
      },
      {
        emps: [],
        start: "14:00",
        end: "16:00",
        id: "5",
      },
      {
        emps: [],
        start: "16:00",
        end: "18:00",
        id: "6",
      },
    ],
    nightShifts: [
      {
        emps: [],
        start: "18:00",
        end: "20:00",
        id: "1",
      },
      {
        emps: [],
        start: "20:00",
        end: "22:00",
        id: "2",
      },
      {
        emps: [],
        start: "22:00",
        end: "24:00",
        id: "3",
      },
      {
        emps: [],
        start: "24:00",
        end: "02:00",
        id: "4",
      },
      {
        emps: [],
        start: "02:00",
        end: "04:00",
        id: "5",
      },
      {
        emps: [],
        start: "04:00",
        end: "06:00",
        id: "6",
      },
    ],
  }));

  const updateField = <K extends keyof WorkFormData>(
    key: K,
    value: WorkFormData[K],
  ) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSetRoom1 = (roomId: string) => {
    const member = getStoredRooms().phong1.find(
      (emp) => emp.id === Number(roomId),
    );
    if (member) {
      updateField("empRoom1", member);
      setStoredRoom1(member);
    }
  };

  const handleSetRoom3 = (roomId: string) => {
    const member = getStoredRooms().phong3.find(
      (emp) => emp.id === Number(roomId),
    );
    if (member) {
      updateField("empRoom3", member);
      setStoredRoom3(member);
    }
  };

  const handleSetToilet = (roomId: string) => {
    const member = getStoredRooms().phong3.find(
      (emp) => emp.id === Number(roomId),
    );
    if (member) {
      updateField("empToilet", member);
      setStoredToilet(member);
    }
  };

  const storedRooms = useMemo(() => getStoredRooms(), []);

  const empsRoom3Options = storedRooms.phong3.map((emp) => ({
    label: emp.full_name,
    value: String(emp.id),
  }));

  const empsRoom1Options = storedRooms.phong1.map((emp) => ({
    label: emp.full_name,
    value: String(emp.id),
  }));

  const employeeCommandItems = useMemo(() => {
    if (!employees) return [];
    return employees
      .filter((emp) => emp.type === "COMMAND")
      .map((emp) => ({ label: emp.full_name, value: String(emp.id) }));
  }, [employees]);

  const employeeDutyItems = useMemo(() => {
    if (!employees) return [];
    return employees
      .filter((emp) => emp.type === "DUTY")
      .map((emp) => ({ label: emp.full_name, value: String(emp.id) }));
  }, [employees]);

  useEffect(() => {
    if (!employees) return;

    setFormState((prev) => {
      const command = prev.empCommand || employeeCommandItems[0]?.value || "";
      const duty = prev.empDuty || employeeDutyItems[0]?.value || "";
      if (command === prev.empCommand && duty === prev.empDuty) {
        return prev;
      }
      return { ...prev, empCommand: command, empDuty: duty };
    });
  }, [employees, employeeCommandItems, employeeDutyItems]);

  const updateDayShift = (updated: Shift) =>
    setFormState((prev) => ({
      ...prev,
      dayShifts: prev.dayShifts.map((shift) =>
        shift.id === updated.id ? updated : shift,
      ),
    }));

  const removeDayShift = (id: string) =>
    setFormState((prev) => ({
      ...prev,
      dayShifts: prev.dayShifts.filter((shift) => shift.id !== id),
    }));

  const updateNightShift = (updated: Shift) =>
    setFormState((prev) => ({
      ...prev,
      nightShifts: prev.nightShifts.map((shift) =>
        shift.id === updated.id ? updated : shift,
      ),
    }));

  const removeNightShift = (id: string) =>
    setFormState((prev) => ({
      ...prev,
      nightShifts: prev.nightShifts.filter((shift) => shift.id !== id),
    }));

  const addShift = (column: Period) => {
    setFormState((prev) => ({
      ...prev,
      dayShifts:
        column === "day"
          ? [
              ...prev.dayShifts,
              { id: nextId(), emps: [], start: "06:00", end: "08:00" },
            ]
          : prev.dayShifts,
      nightShifts:
        column === "night"
          ? [
              ...prev.nightShifts,
              { id: nextId(), emps: [], start: "18:00", end: "20:00" },
            ]
          : prev.nightShifts,
    }));
  };

  const sortDayShifts = useMemo(() => {
    return [...formState.dayShifts]
      .filter((s) => isDayStart(s.start))
      .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
  }, [formState.dayShifts]);

  const sortNightShifts = useMemo(() => {
    return [...formState.nightShifts]
      .filter((s) => !isDayStart(s.start))
      .sort((a, b) => nightSortKey(a.start) - nightSortKey(b.start));
  }, [formState.nightShifts]);

  const overlapIds = useMemo(() => {
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
    return overlaps;
  }, [sortDayShifts, sortNightShifts]);

  const handleSave = () => {
    console.log({
      mode: workMode,
      data: formState,
    });
  };

  useEffect(() => {
    registerSaveAction(handleSave);

    return () => {
      unregisterSaveAction();
    };
  }, []);

  return (
    <div className="space-y-4 p-4 text-[12px]">
      <WorkPageHeader mode={workMode} onSave={handleSave} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <WorkAssignments
            empCommand={formState.empCommand}
            empDuty={formState.empDuty}
            empOnLeave={formState.empOnLeave}
            employeeCommandItems={employeeCommandItems}
            employeeDutyItems={employeeDutyItems}
            onCommandChange={(value) => updateField("empCommand", value)}
            onDutyChange={(value) => updateField("empDuty", value)}
            onOnLeaveChange={(value) => updateField("empOnLeave", value)}
            employees={employees}
          />

          <WorkSchedulePanel
            employees={employees}
            dayShifts={sortDayShifts}
            nightShifts={sortNightShifts}
            overlapIds={overlapIds}
            onUpdateDayShift={updateDayShift}
            onRemoveDayShift={removeDayShift}
            onAddDayShift={() => addShift("day")}
            onUpdateNightShift={updateNightShift}
            onRemoveNightShift={removeNightShift}
            onAddNightShift={() => addShift("night")}
          />
        </div>

        <WorkCleaningPanel
          empRoom1={formState.empRoom1}
          empRoom3={formState.empRoom3}
          empToilet={formState.empToilet}
          empsRoom1Options={empsRoom1Options}
          empsRoom3Options={empsRoom3Options}
          onSetRoom1={handleSetRoom1}
          onSetRoom3={handleSetRoom3}
          onSetToilet={handleSetToilet}
        />
      </div>
    </div>
  );
};

export default WorkPage;
