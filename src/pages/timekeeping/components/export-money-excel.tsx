import type { Employee } from "@/apis/employee.api";
import type { Schedule } from "@/apis/schedules.api";
import { EMPLOYEE_RANK_LABELS } from "@/pages/users/components/employee-form.schema";
import { ExcelHelper } from "@/utils/excel.util";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { dateKeyOf } from "../scheduleUtils";

export const exportMoneyExcel = async (
  employees: Employee[],
  schedules: Schedule[],
  month: number,
  year: number,
) => {
  const workbook = new ExcelJS.Workbook();
  const toDay = new Date();
  workbook.creator = "Timekeeping";
  workbook.created = toDay;

  const formattedMonth = String(month).padStart(2, "0");

  const sheet = workbook.addWorksheet(`Thang ${month}-${year}`, {
    views: [{ state: "frozen", ySplit: 0, xSplit: 1 }],
  });

  const scheduleCountByEmployeeAndDay = new Map<string, number>();

  for (const schedule of schedules) {
    if (schedule.is_all_day) continue;

    const dateKey = dateKeyOf(schedule.start_datetime);
    for (const emp of schedule.employees) {
      const key = `${emp.id}|${dateKey}`;
      scheduleCountByEmployeeAndDay.set(
        key,
        (scheduleCountByEmployeeAndDay.get(key) ?? 0) + 1,
      );
    }
  }

  const eligibleDaysByEmployee = new Map<number, Set<string>>();

  for (const [key, count] of scheduleCountByEmployeeAndDay) {
    if (count >= 2) {
      const [employeeIdStr, dateKey] = key.split("|");
      const employeeId = Number(employeeIdStr);

      const set = eligibleDaysByEmployee.get(employeeId) ?? new Set<string>();
      set.add(dateKey);
      eligibleDaysByEmployee.set(employeeId, set);
    }
  }

  sheet.mergeCells("A1:D1");
  sheet.getCell("A1").value = "PHÒNG CẢNH SÁT CƠ ĐỘNG";
  sheet.getCell("A1").font = ExcelHelper.createFont();
  sheet.getCell("A1").alignment = ExcelHelper.createAlignment();

  sheet.mergeCells("A2:D2");
  sheet.getCell("A2").value = "ĐỘI CSBV MỤC TIÊU";
  sheet.getCell("A2").font = ExcelHelper.createFont({ bold: true });
  sheet.getCell("A2").alignment = ExcelHelper.createAlignment();

  const fixedHeaders = [
    { cell: "A9", text: "TT" },
    { cell: "B9", text: "HỌ VÀ TÊN" },
    { cell: "C9", text: "Cấp bậc" },
    { cell: "D9", text: "Chức vụ" },
    { cell: "E9", text: "Chức danh" },
    { cell: "F9", text: "Đơn vị" },
    { cell: "G9", text: "Công việc trực tiếp đảm nhiệm" },
    { cell: "H9", text: "Mức lương" },
    { cell: "I9", text: "Số tiền (đóng)" },
    { cell: "J9", text: "Số ngày hưởng" },
    { cell: "K9", text: "Thành tiền" },
    { cell: "L9", text: "Ký nhận" },
  ];
  fixedHeaders.forEach(({ cell, text }) => {
    const colLetter = cell.charAt(0);
    sheet.mergeCells(`${colLetter}9:${colLetter}10`);
    const c = sheet.getCell(cell);
    c.value = text;
    c.font = ExcelHelper.createFont({ size: 8, bold: true });
    c.alignment = ExcelHelper.createAlignment();
    c.border = ExcelHelper.createBorder();
  });

  const totalCol = fixedHeaders.length;
  const totalColLetter = ExcelHelper.getColLetter(totalCol);

  sheet.mergeCells(`G1:${totalColLetter}1`);
  sheet.getCell("G1").value = "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM";
  sheet.getCell("G1").font = ExcelHelper.createFont({ bold: true });
  sheet.getCell("G1").alignment = ExcelHelper.createAlignment();

  sheet.mergeCells(`G2:${totalColLetter}2`);
  sheet.getCell("G2").value = "Độc lập - Tự do - Hạnh phúc";
  sheet.getCell("G2").font = ExcelHelper.createFont({ bold: true });
  sheet.getCell("G2").alignment = ExcelHelper.createAlignment();

  sheet.mergeCells(`G4:${totalColLetter}4`);
  sheet.getCell("G4").value =
    `Cần Thơ, ngày……tháng ${formattedMonth} năm ${year}`;
  sheet.getCell("G4").font = ExcelHelper.createFont({ italic: true });
  sheet.getCell("G4").alignment = ExcelHelper.createAlignment();

  sheet.mergeCells(`A6:${totalColLetter}6`);
  sheet.getCell("A6").value = "DANH SÁCH";
  sheet.getCell("A6").font = ExcelHelper.createFont({ bold: true });
  sheet.getCell("A6").alignment = ExcelHelper.createAlignment();

  sheet.mergeCells(`A7:${totalColLetter}7`);
  sheet.getCell("A7").value =
    `Cán bộ, chiến sĩ hưởng tiêu chuẩn, định lượng ăn tháng ${formattedMonth} năm ${year}`;
  sheet.getCell("A7").font = ExcelHelper.createFont({ bold: true });
  sheet.getCell("A7").alignment = ExcelHelper.createAlignment();

  sheet.mergeCells(`A11:${totalColLetter}11`);
  const subTitleCell = sheet.getCell("A11");
  subTitleCell.value = "MỤC TIÊU HĐND: Hưởng mức IV";
  subTitleCell.font = ExcelHelper.createFont({ size: 8, bold: true });
  subTitleCell.alignment = ExcelHelper.createAlignment();
  subTitleCell.border = ExcelHelper.createBorder();

  let currentRow = 12;
  let startRow = currentRow;
  employees.forEach((emp, index) => {
    const row = sheet.getRow(currentRow);
    row.height = 30;
    row.getCell(1).value = index + 1;
    row.getCell(1).font = ExcelHelper.createFont({ size: 8 });
    row.getCell(1).alignment = ExcelHelper.createAlignment();
    row.getCell(1).border = ExcelHelper.createBorder();

    row.getCell(2).value = emp.full_name;
    row.getCell(2).font = ExcelHelper.createFont({ size: 8 });
    row.getCell(2).alignment = ExcelHelper.createAlignment({
      horizontal: "left",
      wrapText: true,
    });
    row.getCell(2).border = ExcelHelper.createBorder();

    row.getCell(3).value = EMPLOYEE_RANK_LABELS[emp.rank];
    row.getCell(3).font = ExcelHelper.createFont({ size: 8 });
    row.getCell(3).alignment = ExcelHelper.createAlignment();
    row.getCell(3).border = ExcelHelper.createBorder();

    row.getCell(4).value = emp.position;
    row.getCell(4).font = ExcelHelper.createFont({ size: 8 });
    row.getCell(4).alignment = ExcelHelper.createAlignment();
    row.getCell(4).border = ExcelHelper.createBorder();

    row.getCell(5).value = index === 0 ? "Cảnh sát viên trung cấp" : "";
    row.getCell(5).font = ExcelHelper.createFont({ size: 8 });
    row.getCell(5).alignment = ExcelHelper.createAlignment();
    row.getCell(5).border = ExcelHelper.createBorder();

    row.getCell(6).value = "Đội CSBV mục tiêu";
    row.getCell(6).font = ExcelHelper.createFont({ size: 8 });
    row.getCell(6).alignment = ExcelHelper.createAlignment();
    row.getCell(6).border = ExcelHelper.createBorder();

    row.getCell(7).value = "Vũ trang tuần tra canh gác bảo vệ mục tiêu";
    row.getCell(7).font = ExcelHelper.createFont({ size: 8 });
    row.getCell(7).alignment = ExcelHelper.createAlignment();
    row.getCell(7).border = ExcelHelper.createBorder();

    row.getCell(8).value = "IV";
    row.getCell(8).font = ExcelHelper.createFont({ size: 8 });
    row.getCell(8).alignment = ExcelHelper.createAlignment();
    row.getCell(8).border = ExcelHelper.createBorder();

    row.getCell(9).value = 63000;
    row.getCell(9).font = ExcelHelper.createFont({ size: 8 });
    row.getCell(9).alignment = ExcelHelper.createAlignment();
    row.getCell(9).border = ExcelHelper.createBorder();

    const daysCount = eligibleDaysByEmployee.get(emp.id)?.size ?? 0;
    row.getCell(10).value = daysCount;
    row.getCell(10).font = ExcelHelper.createFont({ size: 8 });
    row.getCell(10).alignment = ExcelHelper.createAlignment();
    row.getCell(10).border = ExcelHelper.createBorder();

    row.getCell(11).value = {
      formula: `I${currentRow}*J${currentRow}`,
    };
    row.getCell(11).font = ExcelHelper.createFont({ size: 8 });
    row.getCell(11).alignment = ExcelHelper.createAlignment();
    row.getCell(11).border = ExcelHelper.createBorder();

    row.getCell(12).value = "";
    row.getCell(12).font = ExcelHelper.createFont({ size: 8 });
    row.getCell(12).alignment = ExcelHelper.createAlignment();
    row.getCell(12).border = ExcelHelper.createBorder();

    currentRow++;
  });

  sheet.mergeCells(`A${currentRow}:J${currentRow}`);
  sheet.getCell(`A${currentRow}`).value = "Cộng";
  sheet.getCell(`A${currentRow}`).font = ExcelHelper.createFont({
    size: 8,
    bold: true,
  });
  sheet.getCell(`A${currentRow}`).alignment = ExcelHelper.createAlignment();
  sheet.getCell(`A${currentRow}`).border = ExcelHelper.createBorder();

  const endRow = currentRow - 1;
  const sumCell = sheet.getCell(`K${currentRow}`);
  sumCell.value = { formula: `SUM(K${startRow}:K${endRow})` };
  sumCell.font = ExcelHelper.createFont({ size: 8 });
  sumCell.alignment = ExcelHelper.createAlignment();
  sumCell.border = ExcelHelper.createBorder();

  const emptyLastCell = sheet.getCell(`L${currentRow}`);
  emptyLastCell.font = ExcelHelper.createFont({ size: 8 });
  emptyLastCell.alignment = ExcelHelper.createAlignment();
  emptyLastCell.border = ExcelHelper.createBorder();

  const signatureRow = currentRow + 2;
  sheet.mergeCells(`A${signatureRow}:D${signatureRow}`);
  sheet.getCell(`A${signatureRow}`).value = "CÁN BỘ LẬP DANH SÁCH";
  sheet.getCell(`A${signatureRow}`).font = ExcelHelper.createFont({
    bold: true,
  });
  sheet.getCell(`A${signatureRow}`).alignment = ExcelHelper.createAlignment();

  sheet.mergeCells(`A${signatureRow + 4}:D${signatureRow + 4}`);
  sheet.getCell(`A${signatureRow + 4}`).value = "Thiếu tá Vũ Quốc Ca";
  sheet.getCell(`A${signatureRow + 4}`).font = ExcelHelper.createFont({
    italic: true,
    bold: true,
  });
  sheet.getCell(`A${signatureRow + 4}`).alignment =
    ExcelHelper.createAlignment();

  //Format Print
  sheet.getColumn("A").width = ExcelHelper.toExcelWidth(3.67);
  sheet.getColumn("B").width = ExcelHelper.toExcelWidth(13.33);
  sheet.getColumn("C").width = ExcelHelper.toExcelWidth(9.11);
  sheet.getColumn("D").width = ExcelHelper.toExcelWidth(8.11);
  sheet.getColumn("E").width = ExcelHelper.toExcelWidth(9.44);
  sheet.getColumn("F").width = ExcelHelper.toExcelWidth(11.78);
  sheet.getColumn("G").width = ExcelHelper.toExcelWidth(13.11);
  sheet.getColumn("H").width = ExcelHelper.toExcelWidth(6.78);
  sheet.getColumn("I").width = ExcelHelper.toExcelWidth(9.11);
  sheet.getColumn("J").width = ExcelHelper.toExcelWidth(7);
  sheet.getColumn("K").width = ExcelHelper.toExcelWidth(10.33);
  sheet.getColumn("L").width = ExcelHelper.toExcelWidth(8.33);

  sheet.getRow(6).height = 20;
  sheet.getRow(7).height = 20;
  sheet.getRow(9).height = 27.8;
  sheet.getRow(10).height = 17.4;

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `cham-cong-thang-${month}-${year}.xlsx`);
};
