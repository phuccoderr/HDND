import type { Schedule } from "@/apis/schedules.api";

export type EmployeeRole = "DUTY" | "EMPLOYEE";
export type RoomCode = "ROOM1" | "ROOM3" | (string & {});

/** One 2-hour cell inside the weekly grid. */
export interface ScheduleCell {
  dateKey: string; // yyyy-MM-dd
  slotStartHour: number;
  events: Schedule[];
}

/** A single roster row, e.g. "6h - 8h". */
export interface ScheduleRow {
  slotStartHour: number;
  label: string;
  cellsByDate: Record<string, Schedule[]>;
}

/** A Monday–Sunday week block, as printed in the source spreadsheet. */
export interface ScheduleWeek {
  weekIndex: number; // 1-based, "Tuần 1", "Tuần 2", ...
  dates: string[]; // 7 dateKeys, Mon -> Sun
  rows: ScheduleRow[];
  allDayNotices: Record<string, Schedule[]>; // dateKey -> all-day events (e.g. "Bảo vệ hội trường")
}
