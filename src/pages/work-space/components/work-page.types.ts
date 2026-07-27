import type { Employee } from "@/apis/employee.api";
import type { Shift } from "./shift-column.component";

export type RoomMember = { id: number; full_name: string };

export type WorkMode = "create" | "edit";

export type WorkFormData = {
  empCommand: string;
  empDuty: string;
  empOnLeave: Employee[];
  empRoom1: RoomMember | null;
  empRoom3: RoomMember | null;
  empToilet: RoomMember | null;
  dayShifts: Shift[];
  nightShifts: Shift[];
};
