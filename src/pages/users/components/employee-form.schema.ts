import * as z from "zod";

export const employeeFormSchema = z.object({
  full_name: z.string().trim().min(1, "Vui lòng nhập họ và tên"),
  type: z.enum(["EMPLOYEE", "COMMAND", "DUTY"], {
    message: "Vui lòng chọn loại nhân viên",
  }),
  room: z.enum(["ROOM1", "ROOM3"], {
    message: "Vui lòng chọn phòng nhân viên",
  }),
  order: z.number(),
  color: z.string(),
});

export const employeeTypes = [
  { value: "EMPLOYEE", label: "Nhân viên" },
  { value: "COMMAND", label: "Chỉ huy" },
  { value: "DUTY", label: "Nhiệm vụ" },
];

export const employeeRooms = [
  { value: "ROOM1", label: "Phòng 1" },
  { value: "ROOM3", label: "Phòng 3" },
];

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

export const defaultEmployeeFormValues: EmployeeFormValues = {
  full_name: "",
  type: "EMPLOYEE",
  room: "ROOM1",
  order: 1,
  color: "blue",
};
