import { useMemo, useState } from "react";

import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { Employee } from "@/apis/employee.api";
import type { Schedule } from "@/apis/schedules.api";
import {
  formatHourRangeVn,
  formatVnDate,
  getEmployeeMonthlyBreakdown,
  weekdayLabel,
} from "../scheduleUtils";
import { ScrollArea } from "@/components/ui/scroll-area";
import SearchableSelect from "@/components/searchable-select.component";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function EmployeeShiftView({
  schedules,
  employees,
  month,
  year,
}: {
  schedules: Schedule[];
  employees: Employee[];
  month: number;
  year: number;
}) {
  const [selected, setSelected] = useState<Employee | null>(
    employees[0] ?? null,
  );

  const breakdown = useMemo(() => {
    if (!selected) return [];
    return getEmployeeMonthlyBreakdown(schedules, selected.id, year, month);
  }, [schedules, selected, year, month]);

  const totalShifts = breakdown.reduce((sum, d) => sum + d.events.length, 0);
  const daysOnDuty = breakdown.filter((d) => d.events.length > 0).length;
  return (
    <Card className="border-none rounded-none">
      <CardHeader>
        <CardTitle>Kiểm tra theo đồng chí</CardTitle>
        <CardDescription>
          Số ca trực và khung giờ trực của từng đồng chí theo ngày trong tháng.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <SearchableSelect
          options={employees}
          value={selected}
          onChange={setSelected}
          getOptionLabel={(emp) => emp.full_name}
          placeholder="Chọn đồng chí..."
          searchPlaceholder="Tìm đồng chí..."
        />

        {selected && (
          <>
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge variant="secondary">
                Tổng số ca trực: <strong className="ml-1">{totalShifts}</strong>
              </Badge>
              <Badge variant="secondary">
                Số ngày có trực: <strong className="ml-1">{daysOnDuty}</strong>
              </Badge>
            </div>

            <ScrollArea className="h-105 rounded">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="border border-border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide">
                      Ngày
                    </th>
                    <th className="w-24 border border-border px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide">
                      Số ca
                    </th>
                    <th className="border border-border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide">
                      Chi tiết khung giờ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {breakdown.map(({ dateKey, events }) => {
                    const hasShift = events.length > 0;
                    return (
                      <tr key={dateKey} className={hasShift ? "" : "bg-accent"}>
                        <td className="border border-border p-2 ">
                          <Label className="lg:text-xs font-medium">
                            {weekdayLabel(dateKey)}
                          </Label>{" "}
                          <Label className="lg:text-xs text-muted-foreground">
                            {formatVnDate(dateKey)}
                          </Label>
                        </td>
                        <td className="border border-border px-3 py-2 text-center">
                          {hasShift ? (
                            <Badge className="bg-green-bg text-green-fg">
                              {events.length}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              0
                            </span>
                          )}
                        </td>
                        <td className="border border-border px-3 py-2">
                          {hasShift ? (
                            <div className="flex flex-wrap gap-1.5">
                              {events.map((e) => (
                                <span
                                  key={e.id}
                                  className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                                >
                                  {formatHourRangeVn(
                                    e.start_datetime,
                                    e.end_datetime,
                                  )}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-300">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </ScrollArea>
          </>
        )}
      </CardContent>
    </Card>
  );
}
