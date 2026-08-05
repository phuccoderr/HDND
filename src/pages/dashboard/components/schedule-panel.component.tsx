import { useEmployeesQuery } from "@/apis/employee.api";
import { useInsertScheduleToEmployees } from "@/apis/employees_schedules.api";
import { schedulesQueryKey, useInsertSchedules } from "@/apis/schedules.api";
import { Button } from "@/components/ui/button";
import { AnimatedCalendar } from "@/components/ui/calender";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { queryClient } from "@/lib/query-client";
import {
  endMinutesAdjusted,
  isDayStart,
  nextId,
  nightSortKey,
  ShiftColumn,
  timeToMinutes,
  type Period,
  type Shift,
} from "@/pages/dashboard/components/shift-column.component";
import { DateHelper } from "@/utils/date.util";
import { addDays } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarPlus, Moon, Sun } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const INITIAL_DAY_SHIFTS: Shift[] = [
  { emps: [], start: "06:00", end: "08:00", id: "1" },
  { emps: [], start: "08:00", end: "10:00", id: "2" },
  { emps: [], start: "10:00", end: "12:00", id: "3" },
  { emps: [], start: "12:00", end: "14:00", id: "4" },
  { emps: [], start: "14:00", end: "16:00", id: "5" },
  { emps: [], start: "16:00", end: "18:00", id: "6" },
];

export const INITIAL_NIGHT_SHIFTS: Shift[] = [
  { emps: [], start: "18:00", end: "20:00", id: "1" },
  { emps: [], start: "20:00", end: "22:00", id: "2" },
  { emps: [], start: "22:00", end: "24:00", id: "3" },
  { emps: [], start: "24:00", end: "02:00", id: "4" },
  { emps: [], start: "02:00", end: "04:00", id: "5" },
  { emps: [], start: "04:00", end: "06:00", id: "6" },
];

const SchedulePanel = () => {
  // Query
  const { data: employees } = useEmployeesQuery();
  const { mutateAsync: mutateInsertSchedules } = useInsertSchedules();
  const { mutateAsync: mutateInsertScheduleToEmployees } =
    useInsertScheduleToEmployees();
  const [loading, setLoading] = useState(false);

  // State
  const [open, setOpen] = useState(false);
  const [dayShifts, setDayShifts] = useState<Shift[]>(INITIAL_DAY_SHIFTS);
  const [nightShifts, setNightShifts] = useState<Shift[]>(INITIAL_NIGHT_SHIFTS);
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Re State
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

  // Action
  const updateDayShift = (updated: Shift) => {
    setDayShifts((prev) =>
      prev.map((shift) => (shift.id === updated.id ? updated : shift)),
    );
  };

  const removeDayShift = (id: string) => {
    setDayShifts((prev) => prev.filter((shift) => shift.id !== id));
  };

  const updateNightShift = (updated: Shift) => {
    setNightShifts((prev) =>
      prev.map((shift) => (shift.id === updated.id ? updated : shift)),
    );
  };

  const removeNightShift = (id: string) => {
    setNightShifts((prev) => prev.filter((shift) => shift.id !== id));
  };

  const addShift = (column: Period) => {
    if (column === "day") {
      setDayShifts((prev) => [
        ...prev,
        { id: nextId(), emps: [], start: "06:00", end: "08:00" },
      ]);
      return;
    }

    if (column === "night") {
      setNightShifts((prev) => [
        ...prev,
        { id: nextId(), emps: [], start: "18:00", end: "20:00" },
      ]);
      return;
    }
  };

  const combineShiftDateTime = (
    date: Date | undefined,
    time: string,
    period: "day" | "night",
  ) => {
    const targetDate = date ? date : new Date();
    const cleanTimeStr = time === "24:00" ? "00:00" : time;
    const [hours, minutes] = cleanTimeStr.split(":").map(Number);

    const isNextDay = period === "day" ? true : hours < 18;

    const baseDate = isNextDay ? addDays(targetDate, 1) : new Date(targetDate);

    baseDate.setHours(hours, minutes, 0, 0);

    return DateHelper.formatDateTime(baseDate);
  };

  const reset = () => {
    setDayShifts(INITIAL_DAY_SHIFTS);
    setNightShifts(INITIAL_NIGHT_SHIFTS);
  };

  const hanldeSave = async () => {
    setLoading(true);
    const schedulesDay = dayShifts.map((day) => {
      return {
        title: `Ca trực: ${day.start} - ${day.end}`,
        color: "blue",
        start_datetime: combineShiftDateTime(date, day.start, "day"),
        end_datetime: combineShiftDateTime(date, day.end, "day"),
        note: `ca trực chốt`,
        is_all_day: false,
        is_updated: true,
        employee_ids: day.emps?.map((emp) => emp.id),
      };
    });

    const schedulesNight = nightShifts.map((day) => {
      return {
        title: `Ca trực: ${day.start} - ${day.end}`,
        color: "blue",
        start_datetime: combineShiftDateTime(date, day.start, "night"),
        end_datetime: combineShiftDateTime(date, day.end, "night"),
        note: `ca trực chốt`,
        is_all_day: false,
        is_updated: true,
        employee_ids: day.emps?.map((emp) => emp.id),
      };
    });

    const allSchedules = [...schedulesDay, ...schedulesNight];

    const schedulesPayload = allSchedules.map(
      ({ employee_ids, ...scheduleData }) => scheduleData,
    );

    const insertedSchedules = await mutateInsertSchedules(schedulesPayload);

    const scheduleEmpRelations = insertedSchedules.flatMap(
      (schedule, index) => {
        const originalEmployeeIds = allSchedules[index].employee_ids || [];

        return originalEmployeeIds.map((emp_id) => ({
          schedule_id: schedule.id,
          employee_id: Number(emp_id),
        }));
      },
    );

    if (scheduleEmpRelations.length > 0) {
      await mutateInsertScheduleToEmployees(scheduleEmpRelations);
    }

    queryClient.refetchQueries({
      queryKey: [schedulesQueryKey],
    });

    reset();
    setOpen(false);
    setLoading(false);
    toast.success("Tạo lịch trực ngày và đêm thành công");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon-sm" onClick={() => setOpen(true)}>
          <CalendarPlus />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tạo ca trực</DialogTitle>
          <DialogDescription>
            Sắp xếp nhanh ca trực của ngày hôm nay
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          <Label>Thời gian:</Label>
          <AnimatedCalendar
            mode="single"
            locale={vi}
            value={date}
            onChange={setDate}
            defaultValue={date}
          />
        </div>
        <ScrollArea className="max-h-100">
          <div className="grid gap-2 lg:grid-cols-2">
            <ShiftColumn
              title="Ca ngày"
              rangeLabel="06:00 – 18:00"
              icon={<Sun className="size-3.5 text-amber-600" />}
              accent={{
                headerBg: "bg-amber-50 dark:bg-amber-950/40",

                iconBg:
                  "bg-amber-100 dark:bg-amber-900/50 border border-transparent dark:border-amber-800/50",

                text: "text-amber-900 dark:text-amber-300",
              }}
              shifts={dayShifts}
              overlapIds={overlapIds}
              onChange={updateDayShift}
              onRemove={removeDayShift}
              onAdd={() => addShift("day")}
              employees={employees}
            />
            <ShiftColumn
              title="Ca đêm"
              rangeLabel="18:00 – 06:00"
              icon={<Moon className="size-3.5 text-indigo-600" />}
              accent={{
                headerBg: "bg-indigo-50 dark:bg-indigo-950/40",

                iconBg:
                  "bg-indigo-100 dark:bg-indigo-900/50 border border-transparent dark:border-indigo-800/50",

                text: "text-indigo-900 dark:text-indigo-200",
              }}
              shifts={nightShifts}
              overlapIds={overlapIds}
              onChange={updateNightShift}
              onRemove={removeNightShift}
              onAdd={() => addShift("night")}
              employees={employees}
            />
          </div>
        </ScrollArea>
        <DialogFooter className="flex-row justify-end">
          <Button
            variant="outline"
            onClick={() => {
              reset();
              setOpen(false);
            }}
          >
            Hủy
          </Button>
          <Button onClick={hanldeSave} disabled={loading}>
            Lưu
            {loading && <Spinner aria-hidden="true" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SchedulePanel;
