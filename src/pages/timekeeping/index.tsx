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

import { Button } from "@/components/ui/button";
import { exportScheduleToExcel } from "./components/export-schedule-excel";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { exportEmployeeScheduleToWord } from "./components/export-emp-schedule-word.component";
import { EmployeeShiftView } from "./components/employee-shift-view.component";
import SearchableSelect from "@/components/searchable-select.component";
import { FaRegFileWord, FaRegFileExcel } from "react-icons/fa";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { exportTimeKeepingExcel } from "./components/export-timekeeping-excel.component";
import { exportMoneyExcel } from "./components/export-money-excel";
import { DateHelper } from "@/utils/date.util";

const TimekeepingPage = () => {
  const { data: employeesData } = useEmployeesQuery();
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const { data } = useSchedulesQuery({
    start_time: DateHelper.getDateWithString({
      date: new Date(Date.UTC(currentYear, currentMonth - 1, 1)),
    }).dateTimeUTC,
    end_time: DateHelper.getDateWithString({
      date: new Date(currentYear, currentMonth),
      hours: 24,
    }).dateTimeUTC,
  });
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const weeks = useMemo(
    () => buildMonthWeeks(schedules, currentYear, currentMonth),
    [schedules, currentYear, currentMonth],
  );

  useEffect(() => {
    if (data) {
      console.log({
        data,
      });
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

  const handleExportTimekeepingExcel = async () => {
    await exportTimeKeepingExcel(
      employeesData ?? [],
      schedules,
      currentMonth,
      currentYear,
    );
  };

  const handleExportMoneyExcel = async () => {
    await exportMoneyExcel(
      employeesData ?? [],
      schedules,
      currentMonth,
      currentYear,
    );
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
          <Label className="text-sm lg:text-xl font-bold uppercase">
            Chấm công định lượng — Tháng {7}/{2026}
          </Label>
          <Label className="mt-1 text-xs lg:text-sm text-muted-foreground">
            Tổng hợp chấm công định lượng, bao gồm xuất file báo cáo, danh sách
            ca trực, danh sách chấm công...
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="icon-sm"
            variant="outline"
            onClick={goToPrevMonth}
            aria-label="Tháng trước"
          >
            <ChevronLeft />
          </Button>
          <span className="min-w-20 text-center text-sm font-semibold tabular-nums">
            Tháng {currentMonth}/{currentYear}
          </span>

          <Button
            size="icon-sm"
            variant="outline"
            onClick={goToNextMonth}
            aria-label="Tháng sau"
          >
            <ChevronRight />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex gap-2 items-center"
            onClick={handleExportMoneyExcel}
          >
            <FaRegFileExcel />
            <Label>Tiền ĐL</Label>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex gap-2 items-center"
            onClick={handleExportTimekeepingExcel}
          >
            <FaRegFileExcel />
            <Label>Chấm công</Label>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex gap-2 items-center"
            onClick={handleExportExcel}
          >
            <FaRegFileExcel />
            <Label>Định lượng</Label>
          </Button>
          <SearchableSelect
            options={allEmployees}
            onChange={handleExportEmployeeWord}
            getOptionLabel={(emp) => emp.full_name}
            renderTrigger={(_selected, _isOpen) => (
              <Button
                size="sm"
                variant="outline"
                className="flex gap-2 items-center"
              >
                <FaRegFileWord />
                <Label>Báo cáo</Label>
              </Button>
            )}
          />
        </div>
      </header>
      <ResizablePanelGroup
        orientation="horizontal"
        className="border border-border rounded-lg gap-2"
      >
        <ResizablePanel defaultSize="70%">
          <Card className="border-none rounded-none">
            <CardHeader>
              <CardTitle>Danh sách ca trực</CardTitle>
              <CardDescription>
                Bảng phân ca theo tuần, mỗi ô hiển thị nhân sự trực trong khung
                giờ 2 tiếng.
              </CardDescription>
              <ScrollArea className="h-screen whitespace-nowrap">
                <CardContent className="p-0">
                  {weeks.map((week) => {
                    // const hasAnyNotice = week.dates.some(
                    //   (d) => week.allDayNotices[d]?.length,
                    // );
                    return (
                      <div key={week.weekIndex}>
                        {/* {hasAnyNotice && (
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
            )} */}
                        <div className="mb-2 flex items-baseline justify-between">
                          <Label className="text-sm font-bold uppercase tracking-wide text-teal-700">
                            Tuần {week.weekIndex}
                          </Label>
                          <span className="text-xs text-slate-400">
                            {formatVnDate(week.dates[0])} —{" "}
                            {formatVnDate(week.dates[6])}
                          </span>
                        </div>

                        <div className="overflow-x-auto rounded border border-border">
                          <table className="w-full min-w-220 border-collapse text-sm">
                            <thead>
                              <tr>
                                <th className="sticky left-0 z-10 w-16 border border-border p-1 text-left text-xs font-semibold uppercase tracking-wide">
                                  Ca trực
                                </th>
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
                                        "border border-border p-1 text-center text-xs font-semibold",
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
                                  <td className="sticky left-0 z-10 border border-border p-1 text-xs font-semibold tabular-nums">
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
                                          className="border border-border bg-accent p-1 align-top"
                                        />
                                      );
                                    }

                                    const events =
                                      row.cellsByDate[dateKey] ?? [];
                                    const employees = events.flatMap(
                                      (e) => e.employees,
                                    );
                                    const employeeIdsInCell = new Set(
                                      employees.map((emp) => emp.id),
                                    );
                                    const candidates = allEmployees.filter(
                                      (emp) => !employeeIdsInCell.has(emp.id),
                                    );

                                    return (
                                      <td
                                        key={dateKey}
                                        className="border border-border p-1 align-top"
                                      >
                                        {employees.length === 0 ? (
                                          <Label className="block p-1 text-center lg:text-xs">
                                            —
                                          </Label>
                                        ) : (
                                          <div className="flex flex-col gap-1">
                                            {employees.map((emp) => {
                                              const style =
                                                getColorMap[emp.color] ??
                                                getColorMap.blue;
                                              return (
                                                <div
                                                  key={`${emp.id}-${dateKey}-${row.slotStartHour}`}
                                                  className="group flex items-center justify-between gap-1.5 rounded-md px-2 py-1 ring-1 ring-inset text-[13px] leading-tight"
                                                  title={`${emp.room} · ${emp.type === "DUTY" ? "Trực chốt" : "Nhân viên"}`}
                                                  style={{
                                                    backgroundColor:
                                                      style.bgColor,
                                                    color: style.textColor,
                                                  }}
                                                >
                                                  <span className="truncate">
                                                    {emp.full_name
                                                      .split(" ")
                                                      .findLast((emp) => emp)}
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
                                        <SearchableSelect
                                          options={candidates}
                                          onChange={(emp) =>
                                            handleAddEmployee(
                                              dateKey,
                                              row.slotStartHour,
                                              emp,
                                            )
                                          }
                                          getOptionLabel={(emp) =>
                                            emp.full_name
                                          }
                                          searchKeys={["full_name"]}
                                          placeholder="+ Thêm"
                                          searchPlaceholder="Tìm đồng chí..."
                                          triggerClassName="mt-1 border border-border border-dashed"
                                        />
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </ScrollArea>
            </CardHeader>
          </Card>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel>
          <EmployeeShiftView
            schedules={schedules}
            employees={allEmployees}
            month={currentMonth}
            year={currentYear}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default TimekeepingPage;
