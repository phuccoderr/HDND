import * as z from "zod";

export const employeeFormSchema = z.object({
  full_name: z.string().trim().min(1, "Vui lòng nhập họ và tên"),
  type: z.enum(["EMPLOYEE", "COMMAND", "DUTY"], {
    message: "Vui lòng chọn loại nhân viên",
  }),
});

export const employeeTypes = [
  { value: "EMPLOYEE", label: "Nhân viên" },
  { value: "COMMAND", label: "Chỉ huy" },
  { value: "DUTY", label: "Nhiệm vụ" },
];

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

export const defaultEmployeeFormValues: EmployeeFormValues = {
  full_name: "",
  type: "EMPLOYEE",
};
