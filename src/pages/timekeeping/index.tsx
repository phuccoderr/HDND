import { type Schedule, useSchedulesQuery } from "@/apis/schedules.api";
import { useEffect, useMemo, useState } from "react";
import {
  buildMonthWeeks,
  formatVnDate,
  weekdayLabel,
  addEmployeeToCell,
  removeEmployeeFromCell,
  isSameMonth,
} from "./scheduleUtils";
import { Label } from "@/components/ui/label";
import { getColorMap } from "@/constants/colors-soft.const";
import { useEmployeesQuery, type Employee } from "@/apis/employee.api";
import {
  AddEmployeeButton,
  ExportWordButton,
} from "./components/add-employee-button.component";
import { Button } from "@/components/ui/button";
import { exportScheduleToExcel } from "./components/schedule-export.component";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { exportEmployeeScheduleToWord } from "./components/schedule-emp-export.component";

const TimekeepingPage = () => {
  const { data } = useSchedulesQuery({});
  const { data: employeesData } = useEmployeesQuery();

  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(7);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const weeks = useMemo(
    () => buildMonthWeeks(schedules, currentYear, currentMonth),
    [schedules, currentYear, currentMonth],
  );

  useEffect(() => {
    if (data) {
      setSchedules(data);
    }
  }, [data]);

  const allEmployees: Employee[] = employeesData ?? [];

  const handleAddEmployee = (
    dateKey: string,
    startHour: number,
    employee: Employee,
  ) => {
    setSchedules((prev) =>
      addEmployeeToCell(prev, dateKey, startHour, employee),
    );
  };

  const handleRemoveEmployee = (
    dateKey: string,
    startHour: number,
    employeeId: number,
  ) => {
    setSchedules((prev) =>
      removeEmployeeFromCell(prev, dateKey, startHour, employeeId),
    );
  };

  const handleExportExcel = async () => {
    await exportScheduleToExcel(weeks, currentMonth, currentYear);
  };

  const handleExportEmployeeWord = async (employee: Employee) => {
    await exportEmployeeScheduleToWord(
      schedules,
      employee,
      currentMonth,
      currentYear,
    );
  };

  const goToPrevMonth = () => {
    setCurrentMonth((m) => {
      if (m === 1) {
        setCurrentYear((y) => y - 1);
        return 12;
      }
      return m - 1;
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth((m) => {
      if (m === 12) {
        setCurrentYear((y) => y + 1);
        return 1;
      }
      return m + 1;
    });
  };

  return (
    <div className="m-4">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <Label className="text-sm lg:text-xl font-bold">
            "Chấm công định lượng" — Tháng {7}/{2026}
          </Label>
          <Label className="mt-1 text-xs lg:text-sm text-muted-foreground">
            Bảng phân ca theo tuần, mỗi ô hiển thị nhân sự trực trong khung giờ
            2 tiếng.
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={goToPrevMonth}
            aria-label="Tháng trước"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-20 text-center text-sm font-semibold tabular-nums">
            Tháng {currentMonth}/{currentYear}
          </span>
          <Button
            size="icon"
            variant="outline"
            onClick={goToNextMonth}
            aria-label="Tháng sau"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={handleExportExcel} className="ml-2">
            Xuất Excel
          </Button>
          <ExportWordButton
            employees={allEmployees}
            onSelect={handleExportEmployeeWord}
          />
        </div>
      </header>

      {weeks.map((week) => {
        const hasAnyNotice = week.dates.some(
          (d) => week.allDayNotices[d]?.length,
        );
        return (
          <section key={week.weekIndex} className="mb-10">
            {hasAnyNotice && (
              <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-700 ring-1 ring-inset ring-rose-200">
                {week.dates.map((dateKey) =>
                  (week.allDayNotices[dateKey] ?? []).map((notice) => (
                    <span key={notice.id}>
                      <strong className="font-semibold">
                        {formatVnDate(dateKey)}:
                      </strong>{" "}
                      {notice.title} —{" "}
                      {notice.employees.map((e) => e.full_name).join(", ")}
                    </span>
                  )),
                )}
              </div>
            )}
            <div className="mb-2 flex items-baseline justify-between">
              <Label className="text-sm font-bold uppercase tracking-wide text-teal-700">
                Tuần {week.weekIndex}
              </Label>
              <span className="text-xs text-slate-400">
                {formatVnDate(week.dates[0])} — {formatVnDate(week.dates[6])}
              </span>
            </div>

            <div className="overflow-x-auto rounded border border-border">
              <table className="w-full min-w-220 border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 w-28 border border-border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide">
                      Ca trực
                    </th>{" "}
                    {week.dates.map((dateKey) => {
                      const inMonth = isSameMonth(
                        dateKey,
                        currentYear,
                        currentMonth,
                      );
                      return (
                        <th
                          key={dateKey}
                          className={[
                            "border border-border px-3 py-2 text-center text-xs font-semibold",
                            inMonth ? "" : "bg-accent",
                          ].join(" ")}
                        >
                          <div className="uppercase tracking-wide">
                            {weekdayLabel(dateKey)}
                          </div>
                          <div className="mt-0.5 font-normal">
                            Ngày {formatVnDate(dateKey)}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {week.rows.map((row) => (
                    <tr key={row.slotStartHour}>
                      <td className="sticky left-0 z-10 border border-border px-3 py-2 text-xs font-semibold text-slate-600 tabular-nums">
                        {row.label}
                      </td>
                      {week.dates.map((dateKey) => {
                        const inMonth = isSameMonth(
                          dateKey,
                          currentYear,
                          currentMonth,
                        );

                        if (!inMonth) {
                          return (
                            <td
                              key={dateKey}
                              className="min-w-30 border border-border bg-accent px-2 py-1.5 align-top"
                            />
                          );
                        }

                        const events = row.cellsByDate[dateKey] ?? [];
                        const employees = events.flatMap((e) => e.employees);
                        const employeeIdsInCell = new Set(
                          employees.map((emp) => emp.id),
                        );
                        const candidates = allEmployees.filter(
                          (emp) => !employeeIdsInCell.has(emp.id),
                        );

                        return (
                          <td
                            key={dateKey}
                            className="min-w-30 border border-border px-2 py-1.5 align-top"
                          >
                            {employees.length === 0 ? (
                              <Label className="block px-2 py-1 text-center lg:text-xs">
                                —
                              </Label>
                            ) : (
                              <div className="flex flex-col gap-1">
                                {employees.map((emp) => {
                                  const style =
                                    getColorMap[emp.color] ?? getColorMap.blue;
                                  return (
                                    <div
                                      key={`${emp.id}-${dateKey}-${row.slotStartHour}`}
                                      className="group flex items-center justify-between gap-1.5 rounded-md px-2 py-1 ring-1 ring-inset text-[13px] leading-tight"
                                      title={`${emp.room} · ${emp.type === "DUTY" ? "Trực chốt" : "Nhân viên"}`}
                                      style={{
                                        backgroundColor: style.bgColor,
                                        color: style.textColor,
                                      }}
                                    >
                                      <span className="truncate">
                                        {emp.full_name}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleRemoveEmployee(
                                            dateKey,
                                            row.slotStartHour,
                                            emp.id,
                                          )
                                        }
                                        className="ml-1 shrink-0 rounded-full px-1 text-xs opacity-0 hover:bg-black/10 group-hover:opacity-100"
                                        aria-label={`Xoá ${emp.full_name}`}
                                      >
                                        ×
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            <AddEmployeeButton
                              candidates={candidates}
                              onSelect={(emp) =>
                                handleAddEmployee(
                                  dateKey,
                                  row.slotStartHour,
                                  emp,
                                )
                              }
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default TimekeepingPage;
