import * as z from "zod";

export const EMPLOYEE_RANK_LABELS: Record<string, string> = {
  DAI_TUONG: "Đại tướng",
  THUONG_TUONG: "Thượng tướng",
  TRUNG_TUONG: "Trung tướng",
  THIEU_TUONG: "Thiếu tướng",
  DAI_TA: "Đại tá",
  THUONG_TA: "Thượng tá",
  TRUNG_TA: "Trung tá",
  THIEU_TA: "Thiếu tá",
  DAI_UY: "Đại úy",
  THUONG_UY: "Thượng úy",
  TRUNG_UY: "Trung úy",
  THIEU_UY: "Thiếu úy",
  THUONG_SI: "Thượng sĩ",
  TRUNG_SI: "Trung sĩ",
  HA_SI: "Hạ sĩ",
  BINH_NHAT: "Binh nhất",
  BINH_NHI: "Binh nhì",
};

export const employeeFormSchema = z.object({
  full_name: z.string().trim().min(1, "Vui lòng nhập họ và tên"),
  type: z.enum(["EMPLOYEE", "COMMAND", "DUTY"], {
    message: "Vui lòng chọn loại nhân viên",
  }),
  room: z
    .enum(["ROOM1", "ROOM3"], {
      message: "Vui lòng chọn phòng nhân viên",
    })
    .nullable(),
  order: z.number(),
  color: z.string(),
  rank: z.enum([
    "BINH_NHI",
    "BINH_NHAT",
    "HA_SI",
    "TRUNG_SI",
    "THUONG_SI",
    "THIEU_UY",
    "TRUNG_UY",
    "THUONG_UY",
    "DAI_UY",
    "THIEU_TA",
    "TRUNG_TA",
    "THUONG_TA",
    "DAI_TA",
  ]),
  position: z.string(),
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
  rank: "BINH_NHI",
  position: "CSNV",
};
