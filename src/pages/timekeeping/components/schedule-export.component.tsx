import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  formatVnDate,
  isSameMonth,
  pad2,
  weekdayLabel,
} from "../scheduleUtils";
import type { ScheduleWeek } from "../schedule";

const BORDER = { style: "thin" as const, color: { argb: "FF000000" } };

const THIN_BORDER = {
  top: BORDER,
  left: BORDER,
  bottom: BORDER,
  right: BORDER,
};

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
  sheet.getCell("A1").font = {
    name: "Times New Roman",
    size: 12,
  };
  sheet.getCell("A1").alignment = {
    vertical: "middle",
    horizontal: "center",
  };

  sheet.mergeCells("A2:C2");
  sheet.getCell("A2").value = "ĐỘI CSBV MỤC TIÊU";
  sheet.getCell("A2").font = {
    name: "Times New Roman",
    size: 12,
    bold: true,
  };
  sheet.getCell("A2").alignment = {
    vertical: "middle",
    horizontal: "center",
  };

  sheet.mergeCells("E1:H1");
  sheet.getCell("E1").value = "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM";
  sheet.getCell("E1").font = {
    name: "Times New Roman",
    size: 12,
    bold: true,
  };
  sheet.getCell("E1").alignment = {
    vertical: "middle",
    horizontal: "center",
  };

  sheet.mergeCells("E2:H2");
  sheet.getCell("E2").value = "Độc lập - Tự do - Hạnh phúc";
  sheet.getCell("E2").font = {
    name: "Times New Roman",
    size: 12,
    bold: true,
  };
  sheet.getCell("E2").alignment = {
    vertical: "middle",
    horizontal: "center",
  };

  sheet.mergeCells("E4:H4");
  sheet.getCell("E4").value = `Cần Thơ, ngày….tháng ${monthStr} năm ${year}`;
  sheet.getCell("E4").font = {
    name: "Times New Roman",
    size: 12,
  };
  sheet.getCell("E4").alignment = {
    vertical: "middle",
    horizontal: "center",
  };
  sheet.getRow(4).height = 18;

  sheet.mergeCells("A6:H6");
  sheet.getCell("A6").value =
    `LỊCH TRỰC CÁN BỘ CHIẾN SĨ MỤC TIÊU ĐOÀN ĐBQH VÀ HĐND
Từ ngày ${fromDateStr} đến ngày ${toDateStr}`;
  sheet.getCell("A6").font = {
    name: "Times New Roman",
    size: 10,
    bold: true,
  };
  sheet.getCell("A6").alignment = {
    vertical: "middle",
    horizontal: "center",
  };
  sheet.getRow(6).height = 40;

  // Cột: "Ca trực" + 7 ngày trong tuần
  sheet.columns = [
    { width: 12 },
    ...Array.from({ length: 7 }, () => ({ width: 14.5 })),
  ];
  for (const week of weeks) {
    // ----- Tiêu đề tuần -----
    const weekTitleRow = sheet.addRow([`TUẦN ${week.weekIndex}`]);
    sheet.mergeCells(weekTitleRow.number, 1, weekTitleRow.number, 8);
    weekTitleRow.getCell(1).font = {
      name: "Times New Roman",
      size: 10,
      bold: true,
    };
    weekTitleRow.getCell(1).alignment = {
      vertical: "middle",
      horizontal: "center",
    };

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
      cell.font = { bold: true, name: "Times New Roman", size: 10 };
      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };
      cell.border = THIN_BORDER;
    });
    headerRow.height = 30;

    // ----- Các dòng khung giờ -----
    for (const row of week.rows) {
      const dataRow = sheet.addRow([row.label]);
      dataRow.getCell(1).font = {
        bold: true,
        name: "Times New Roman",
        size: 10,
      };
      dataRow.getCell(1).alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };
      dataRow.getCell(1).border = THIN_BORDER;

      week.dates.forEach((dateKey, colIdx) => {
        const events = row.cellsByDate[dateKey] ?? [];
        const employees = events.flatMap((e) => e.employees);
        const cell = dataRow.getCell(colIdx + 2);

        if (employees.length === 0) {
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.border = THIN_BORDER;
        } else {
          cell.value = employees.map((e) => e.full_name).join("\n");
          cell.alignment = {
            horizontal: "center",
            vertical: "middle",
            wrapText: true,
          };
          cell.font = { name: "Times New Roman", size: 8 };
          cell.border = THIN_BORDER;
        }
      });

      dataRow.height = week.weekIndex === 1 ? 27 : 37;
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `cham-cong-thang-${month}-${year}.xlsx`);
}
