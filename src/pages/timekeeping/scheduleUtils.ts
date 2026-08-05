import type { Schedule } from "@/apis/schedules.api";
import type { ScheduleRow, ScheduleWeek } from "./schedule";
import type { Employee } from "@/apis/employee.api";

/**
 * Roster row order, top to bottom, exactly as printed in the source sheet:
 * the "day" cycle starts at 6h and wraps back around to 4h-6h of the
 * following calendar date.
 */
export const SLOT_ORDER: number[] = [6, 8, 10, 12, 14, 16, 18, 20, 22, 0, 2, 4];

const VN_WEEKDAY_LABELS = [
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
  "Chủ Nhật",
];

/** Formats a slot start hour (0/2/4/6/.../22) into a "6h-8h" style label. */
export function slotLabel(startHour: number): string {
  const endHour = startHour === 16 ? 18 : (startHour + 2) % 24;
  const endLabel =
    startHour === 22 ? "0h" : startHour === 4 ? "6h" : `${endHour}h`;
  // 16h-18h is deliberately printed as "18h" even though the underlying
  // event ends at 17:59, matching the source spreadsheet's labels.
  return `${startHour}h-${endLabel}`;
}

/**
 * The feed stores timestamps with a "+00:00" suffix but the hour value is
 * already the roster's wall-clock hour (e.g. "06:00:00+00:00" means 6
 * o'clock on the roster, not 6am UTC). We therefore read the date/hour
 * directly off the ISO string instead of converting time zones.
 */
export function dateKeyOf(isoString: string): string {
  return isoString.slice(0, 10); // yyyy-MM-dd
}

export function hourOf(isoString: string): number {
  return Number(isoString.slice(11, 13));
}

/** Monday=0 ... Sunday=6, independent of locale. */
export function isoWeekdayIndex(dateKey: string): number {
  const d = new Date(`${dateKey}T00:00:00Z`);
  const jsDay = d.getUTCDay(); // Sun=0 ... Sat=6
  return (jsDay + 6) % 7;
}

export function addDays(dateKey: string, days: number): string {
  const d = new Date(`${dateKey}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function formatVnDate(dateKey: string): string {
  const [y, m, d] = dateKey.split("-");
  return `${d}/${m}/${y}`;
}

export function weekdayLabel(dateKey: string): string {
  return VN_WEEKDAY_LABELS[isoWeekdayIndex(dateKey)];
}

/** The Monday that starts the calendar week containing `dateKey`. */
function mondayOf(dateKey: string): string {
  return addDays(dateKey, -isoWeekdayIndex(dateKey));
}

/**
 * Builds every Monday-Sunday week that overlaps the given month, numbered
 * sequentially as "Tuần 1", "Tuần 2", ... the same way the source
 * spreadsheet does.
 */
export function buildMonthWeeks(
  schedules: Schedule[],
  year: number,
  month1to12: number,
): ScheduleWeek[] {
  const firstOfMonth = `${year}-${pad2(month1to12)}-01`;
  const daysInMonth = new Date(Date.UTC(year, month1to12, 0)).getUTCDate();
  const lastOfMonth = `${year}-${pad2(month1to12)}-${pad2(daysInMonth)}`;

  const timedEvents = schedules.filter((e) => !e.is_all_day);
  const allDayEvents = schedules.filter((e) => e.is_all_day);

  const weeks: ScheduleWeek[] = [];
  let cursor = mondayOf(firstOfMonth);
  let weekIndex = 1;

  while (cursor <= lastOfMonth) {
    const dates = Array.from({ length: 7 }, (_, i) => addDays(cursor, i));

    const rows: ScheduleRow[] = SLOT_ORDER.map((startHour) => {
      const cellsByDate: Record<string, Schedule[]> = {};
      for (const dateKey of dates) {
        cellsByDate[dateKey] = timedEvents.filter((e) => {
          return (
            dateKeyOf(e.start_datetime) === dateKey &&
            hourOf(e.start_datetime) === startHour
          );
        });
      }
      return {
        slotStartHour: startHour,
        label: slotLabel(startHour),
        cellsByDate,
      };
    });

    const allDayNotices: Record<string, Schedule[]> = {};
    for (const dateKey of dates) {
      allDayNotices[dateKey] = allDayEvents.filter(
        (e) => dateKeyOf(e.start_datetime) === dateKey,
      );
    }

    weeks.push({ weekIndex, dates, rows, allDayNotices });

    cursor = addDays(cursor, 7);
    weekIndex += 1;
  }

  return weeks;
}

// export pad2 (trước đây chỉ dùng nội bộ)
export function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/** Tính start/end ISO cho 1 slot 2 tiếng, tự cộng ngày khi slot wrap qua nửa đêm. */
export function buildSlotRange(
  dateKey: string,
  startHour: number,
): { start: string; end: string } {
  const endHour = (startHour + 2) % 24;
  const endDateKey = endHour === 0 ? addDays(dateKey, 1) : dateKey;
  return {
    start: `${dateKey}T${pad2(startHour)}:00:00+00:00`,
    end: `${endDateKey}T${pad2(endHour)}:00:00+00:00`,
  };
}

export function isSameMonth(
  dateKey: string,
  year: number,
  month1to12: number,
): boolean {
  const [y, m] = dateKey.split("-").map(Number);
  return y === year && m === month1to12;
}

function isSameSlot(e: Schedule, dateKey: string, startHour: number): boolean {
  return (
    !e.is_all_day &&
    dateKeyOf(e.start_datetime) === dateKey &&
    hourOf(e.start_datetime) === startHour
  );
}

/**
 * Thêm 1 nhân sự vào ô (dateKey, startHour).
 * - Nếu ô đã có event ở slot đó -> gộp employee vào event đầu tiên tìm thấy.
 * - Nếu ô chưa có event nào -> tạo event mới (id tạm, cần đồng bộ lại khi lưu server).
 */
export function addEmployeeToCell(
  schedules: Schedule[],
  dateKey: string,
  startHour: number,
  employee: Employee,
): Schedule[] {
  const idx = schedules.findIndex((e) => isSameSlot(e, dateKey, startHour));

  if (idx === -1) {
    const { start, end } = buildSlotRange(dateKey, startHour);
    const newEvent: Schedule = {
      id: -Date.now(), // id tạm cho record chưa lưu server
      title: "",
      color: employee.color ?? "blue",
      start_datetime: start,
      end_datetime: end,
      note: "",
      is_all_day: false,
      employees: [employee],
      is_updated: true,
      employee_ids: [employee.id],
    };
    return [...schedules, newEvent];
  }

  return schedules.map((e, i) => {
    if (i !== idx) return e;
    if (e.employees.some((emp) => emp.id === employee.id)) return e; // đã có, bỏ qua
    return {
      ...e,
      employees: [...e.employees, employee],
      employee_ids: [
        ...(e.employee_ids ?? e.employees.map((x) => x.id)),
        employee.id,
      ],
      is_updated: true,
    };
  });
}

/** Xoá 1 nhân sự khỏi ô (dateKey, startHour). Event rỗng sau khi xoá sẽ bị loại khỏi mảng. */
export function removeEmployeeFromCell(
  schedules: Schedule[],
  dateKey: string,
  startHour: number,
  employeeId: number,
): Schedule[] {
  return schedules
    .map((e) => {
      if (!isSameSlot(e, dateKey, startHour)) return e;
      if (!e.employees.some((emp) => emp.id === employeeId)) return e;
      return {
        ...e,
        employees: e.employees.filter((emp) => emp.id !== employeeId),
        employee_ids: (e.employee_ids ?? e.employees.map((x) => x.id)).filter(
          (id) => id !== employeeId,
        ),
        is_updated: true,
      };
    })
    .filter((e) => e.is_all_day || e.employees.length > 0);
}

const HOUR_ORDER = [6, 8, 10, 12, 14, 16, 18, 20, 22, 0, 2, 4];

function hourRank(isoString: string): number {
  const h = hourOf(isoString);
  const idx = HOUR_ORDER.indexOf(h);
  // phòng trường hợp giờ lẻ không nằm trong slot chuẩn -> đẩy xuống cuối theo giá trị giờ
  return idx === -1 ? HOUR_ORDER.length + h : idx;
}

export function getEmployeeMonthlyEvents(
  schedules: Schedule[],
  employeeId: number,
  year: number,
  month1to12: number,
): { dateKey: string; events: Schedule[] }[] {
  const filtered = schedules.filter(
    (e) =>
      !e.is_all_day &&
      e.employees.some((emp) => emp.id === employeeId) &&
      isSameMonth(dateKeyOf(e.start_datetime), year, month1to12),
  );

  const grouped = new Map<string, Schedule[]>();
  for (const e of filtered) {
    const key = dateKeyOf(e.start_datetime);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(e);
  }

  return Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateKey, events]) => ({
      dateKey,
      events: [...events].sort(
        (a, b) => hourRank(a.start_datetime) - hourRank(b.start_datetime),
      ),
    }));
}

export function getEmployeeMonthlyBreakdown(
  schedules: Schedule[],
  employeeId: number,
  year: number,
  month1to12: number,
): { dateKey: string; events: Schedule[] }[] {
  const grouped = getEmployeeMonthlyEvents(
    schedules,
    employeeId,
    year,
    month1to12,
  );
  const byDate = new Map(grouped.map((g) => [g.dateKey, g.events]));

  const daysInMonth = new Date(Date.UTC(year, month1to12, 0)).getUTCDate();
  return Array.from({ length: daysInMonth }, (_, i) => {
    const dateKey = `${year}-${pad2(month1to12)}-${pad2(i + 1)}`;
    return { dateKey, events: byDate.get(dateKey) ?? [] };
  });
}

export function formatHourRangeVn(startIso: string, endIso: string): string {
  const startHour = hourOf(startIso);
  const endHour = hourOf(endIso);
  return `Từ ${pad2(startHour)} giờ đến ${pad2(endHour)} giờ`;
}
