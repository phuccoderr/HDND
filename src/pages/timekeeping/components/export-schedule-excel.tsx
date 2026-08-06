import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  formatVnDate,
  isSameMonth,
  pad2,
  weekdayLabel,
} from "../scheduleUtils";
import type { ScheduleWeek } from "../schedule";
import { ExcelHelper } from "@/utils/excel.util";

export async function exportScheduleToExcel(
  weeks: ScheduleWeek[],
  month: number,
  year: number,
) {
  const workbook = new ExcelJS.Workbook();
  const toDay = new Date();
  workbook.creator = "Timekeeping";
  workbook.created = toDay;

  const sheet = workbook.addWorksheet(`Thang ${month}-${year}`, {
    views: [{ state: "frozen", ySplit: 0, xSplit: 1 }],
  });

  const lastDayOfMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const monthStr = pad2(month);
  const fromDateStr = `01/${monthStr}/${year}`;
  const toDateStr = `${pad2(lastDayOfMonth)}/${monthStr}/${year}`;

  sheet.mergeCells("A1:C1");
  sheet.getCell("A1").value = "PHÒNG CẢNH SÁT CƠ ĐỘNG";
  sheet.getCell("A1").font = ExcelHelper.createFont({});
  sheet.getCell("A1").alignment = ExcelHelper.createAlignment();

  sheet.mergeCells("A2:C2");
  sheet.getCell("A2").value = "ĐỘI CSBV MỤC TIÊU";
  sheet.getCell("A2").font = ExcelHelper.createFont({
    bold: true,
  });
  sheet.getCell("A2").alignment = ExcelHelper.createAlignment();

  sheet.mergeCells("E1:H1");
  sheet.getCell("E1").value = "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM";
  sheet.getCell("E1").font = ExcelHelper.createFont({
    bold: true,
  });
  sheet.getCell("E1").alignment = ExcelHelper.createAlignment();

  sheet.mergeCells("E2:H2");
  sheet.getCell("E2").value = "Độc lập - Tự do - Hạnh phúc";
  sheet.getCell("E2").font = ExcelHelper.createFont({
    bold: true,
  });
  sheet.getCell("E2").alignment = ExcelHelper.createAlignment();

  sheet.mergeCells("E4:H4");
  sheet.getCell("E4").value = `Cần Thơ, ngày….tháng ${monthStr} năm ${year}`;
  sheet.getCell("E4").font = ExcelHelper.createFont({});
  sheet.getCell("E4").alignment = ExcelHelper.createAlignment();
  sheet.getRow(4).height = 18;

  sheet.mergeCells("A6:H6");
  sheet.getCell("A6").value =
    `LỊCH TRỰC CÁN BỘ CHIẾN SĨ MỤC TIÊU ĐOÀN ĐBQH VÀ HĐND
Từ ngày ${fromDateStr} đến ngày ${toDateStr}`;
  sheet.getCell("A6").font = ExcelHelper.createFont({ bold: true });
  sheet.getCell("A6").alignment = ExcelHelper.createAlignment();
  sheet.getRow(6).height = 40;

  // Cột: "Ca trực" + 7 ngày trong tuần
  sheet.columns = [
    { width: ExcelHelper.toExcelWidth(12) },
    ...Array.from({ length: 7 }, () => ({
      width: ExcelHelper.toExcelWidth(14.5),
    })),
  ];

  const totalWeeks = weeks.length;
  for (const week of weeks) {
    const isLastWeek = week.weekIndex === totalWeeks;
    // ----- Tiêu đề tuần -----
    const weekTitleRow = sheet.addRow([`TUẦN ${week.weekIndex}`]);
    sheet.mergeCells(weekTitleRow.number, 1, weekTitleRow.number, 8);
    weekTitleRow.getCell(1).font = ExcelHelper.createFont({
      size: 8,
      bold: true,
    });
    weekTitleRow.getCell(1).alignment = ExcelHelper.createAlignment();

    // ----- Header ngày -----
    const headerRow = sheet.addRow([
      "Ca trực",
      ...week.dates.map((dateKey) =>
        isSameMonth(dateKey, year, month)
          ? `${weekdayLabel(dateKey)}\n${formatVnDate(dateKey)}`
          : "",
      ),
    ]);
    headerRow.eachCell((cell) => {
      cell.font = ExcelHelper.createFont({ size: 8, bold: true });
      cell.alignment = ExcelHelper.createAlignment();
      cell.border = ExcelHelper.createBorder();
    });
    headerRow.height = 30;

    // ----- Các dòng khung giờ -----
    for (const row of week.rows) {
      const dataRow = sheet.addRow([row.label]);
      dataRow.getCell(1).font = ExcelHelper.createFont({ bold: true, size: 8 });
      dataRow.getCell(1).alignment = ExcelHelper.createAlignment();
      dataRow.getCell(1).border = ExcelHelper.createBorder();

      week.dates.forEach((dateKey, colIdx) => {
        const events = row.cellsByDate[dateKey] ?? [];
        const employees = events.flatMap((e) => e.employees);
        const cell = dataRow.getCell(colIdx + 2);

        if (employees.length === 0) {
          cell.alignment = ExcelHelper.createAlignment();
          cell.border = ExcelHelper.createBorder();
        } else {
          cell.value = employees.map((e) => e.full_name).join("\n");
          cell.alignment = ExcelHelper.createAlignment();
          cell.font = ExcelHelper.createFont({ size: 8 });
          cell.border = ExcelHelper.createBorder();
        }
      });

      if (isLastWeek) {
        dataRow.height = 27;
      } else {
        dataRow.height = week.weekIndex === 1 ? 28 : 37;
      }
    }
  }

  const lastRowNumber = sheet.lastRow ? sheet.lastRow.number : 0;
  const signatureTitleRow = lastRowNumber + 3; // Cách dữ liệu bảng 3 dòng cho đẹp

  const titleRange = `F${signatureTitleRow}:G${signatureTitleRow + 1}`;
  sheet.mergeCells(titleRange);

  const titleCell = sheet.getCell(`F${signatureTitleRow}`);
  titleCell.value = "Cán bộ lập danh sách";
  titleCell.font = ExcelHelper.createFont({ bold: true });
  titleCell.alignment = ExcelHelper.createAlignment();

  // 3. Tên "Thiếu tá Vũ Quốc Ca" (Để trống khoảng 3-4 dòng làm khoảng ký tên)
  const nameStartRow = signatureTitleRow + 5;
  const nameRange = `F${nameStartRow}:G${nameStartRow + 2}`;
  sheet.mergeCells(nameRange);

  const nameCell = sheet.getCell(`F${nameStartRow}`);
  nameCell.value = "Thiếu tá Vũ Quốc Ca";
  nameCell.font = ExcelHelper.createFont();
  nameCell.alignment = ExcelHelper.createAlignment();

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `dinh-luong-thang-${month}-${year}.xlsx`);
}
