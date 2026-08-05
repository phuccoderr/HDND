import type { Employee } from "@/apis/employee.api";
import { EMPLOYEE_RANK_LABELS } from "@/pages/users/components/employee-form.schema";
import ExcelJS, { type Alignment, type Borders, type Font } from "exceljs";
import { saveAs } from "file-saver";

const createFont = ({
  name = "Times New Roman",
  size = 10,
  bold = false,
  ...props
}: Partial<Font> = {}) => {
  return {
    name,
    size,
    bold,
    ...props,
  };
};

const createAligntment = ({
  vertical = "middle",
  horizontal = "center",
  ...props
}: Partial<Alignment> = {}) => {
  return {
    vertical,
    horizontal,
    ...props,
  };
};

const createBorder = ({
  top = { style: "thin" },
  bottom = { style: "thin" },
  left = { style: "thin" },
  right = { style: "thin" },
  ...props
}: Partial<Borders> = {}) => {
  return {
    top,
    bottom,
    left,
    right,
    ...props,
  };
};

export const toExcelWidth = (targetWidth: number): number => {
  if (targetWidth <= 0) return 0;
  return Number((targetWidth + 0.81).toFixed(2));
};

export const getColLetter = (colIndex: number): string => {
  let temp: number;
  let letter = "";

  while (colIndex > 0) {
    temp = (colIndex - 1) % 26;
    letter = String.fromCharCode(65 + temp) + letter;
    colIndex = Math.floor((colIndex - temp - 1) / 26);
  }

  return letter;
};

export const exportTimeKeepingExcel = async (
  employees: Employee[],
  month: number,
  year: number,
) => {
  const workbook = new ExcelJS.Workbook();
  const toDay = new Date();
  workbook.creator = "Timekeeping";
  workbook.created = toDay;

  const dayNamesShort = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const daysInMonth = new Date(year, month, 0).getDate();
  const formattedMonth = String(month).padStart(2, "0");
  const formattedMaxDay = String(daysInMonth).padStart(2, "0");

  const sheet = workbook.addWorksheet(`Thang ${month}-${year}`, {
    views: [{ state: "frozen", ySplit: 0, xSplit: 1 }],
  });

  sheet.mergeCells("A1:D1");
  sheet.getCell("A1").value = "PHÒNG CẢNH SÁT CƠ ĐỘNG";
  sheet.getCell("A1").font = createFont();
  sheet.getCell("A1").alignment = createAligntment();

  sheet.mergeCells("A2:D2");
  sheet.getCell("A2").value = "ĐỘI CSBV MỤC TIÊU";
  sheet.getCell("A2").font = createFont({ bold: true });
  sheet.getCell("A2").alignment = createAligntment();

  const startCol = 5; // Cột E (Ngày 1)
  const endCol = startCol + daysInMonth - 1; // Cột cuối cùng của số ngày trong tháng
  const totalCols = endCol + 3; // + 3 cột tổng hợp
  const endColLetter = getColLetter(totalCols);

  sheet.mergeCells(`Z1:${endColLetter}1`);
  sheet.getCell("Z1").value = "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM";
  sheet.getCell("Z1").font = createFont({ bold: true });
  sheet.getCell("Z1").alignment = createAligntment();

  sheet.mergeCells(`Z2:${endColLetter}2`);
  sheet.getCell("Z2").value = "Độc lập - Tự do - Hạnh phúc";
  sheet.getCell("Z2").font = createFont({ bold: true });
  sheet.getCell("Z2").alignment = createAligntment();

  sheet.mergeCells("A5:AK5");
  sheet.getCell("A5").value = "DANH SÁCH";
  sheet.getCell("A5").font = createFont({ bold: true });
  sheet.getCell("A5").alignment = createAligntment();

  sheet.mergeCells(`A6:${endColLetter}6`);
  sheet.getCell("A6").value =
    `BẢNG CHẤM CÔNG TIÊU CHUẨN ĐỊNH LƯỢNG ĂN THÁNG ${formattedMonth}/${year} (TỪ NGÀY 01/${formattedMonth}/${year} - ${formattedMaxDay}/${formattedMonth}/${year})`;
  sheet.getCell("A6").font = createFont({ bold: true });
  sheet.getCell("A6").alignment = createAligntment();

  const fixedHeaders = [
    { cell: "A9", text: "TT" },
    { cell: "B9", text: "HỌ VÀ TÊN" },
    { cell: "C9", text: "Cấp bậc" },
    { cell: "D9", text: "Chức vụ" },
  ];
  fixedHeaders.forEach(({ cell, text }) => {
    const colLetter = cell.charAt(0);
    sheet.mergeCells(`${colLetter}9:${colLetter}11`);
    const c = sheet.getCell(cell);
    c.value = text;
    c.font = createFont({ size: 8, bold: true });
    c.alignment = createAligntment();
    c.border = createBorder();
  });

  sheet.mergeCells(9, startCol, 9, endCol);
  const titleCell = sheet.getCell(9, startCol);
  titleCell.value = "NGÀY CÔNG";
  titleCell.font = createFont({ size: 8, bold: true });
  titleCell.alignment = createAligntment();
  titleCell.border = createBorder();

  sheet.mergeCells(12, 1, 12, totalCols);
  const subTitleCell = sheet.getCell(12, 1);
  subTitleCell.value = "MỤC TIÊU HĐND: Hưởng mức IV";
  subTitleCell.font = createFont({ size: 8, bold: true });
  subTitleCell.alignment = createAligntment();
  subTitleCell.border = createBorder();

  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month - 1, day);

    const dayOfWeekIndex = currentDate.getDay();
    const dayOfWeekName = dayNamesShort[dayOfWeekIndex];
    const isWeekend = dayOfWeekIndex === 0 || dayOfWeekIndex === 6;

    const colIndex = startCol + day - 1;

    const cellDayOfWeek = sheet.getCell(10, colIndex);
    cellDayOfWeek.value = dayOfWeekName;
    cellDayOfWeek.font = {
      name: "Times New Roman",
      size: 8,
      bold: true,
      color: { argb: isWeekend ? "FFFF0000" : "FF000000" },
    };
    cellDayOfWeek.alignment = createAligntment();
    cellDayOfWeek.border = createBorder();

    const cellDayNum = sheet.getCell(11, colIndex);
    cellDayNum.value = day;
    cellDayNum.font = { name: "Times New Roman", size: 8, bold: true };
    cellDayNum.alignment = createAligntment();
    cellDayNum.border = createBorder();
  }

  const summaryStartColIndex = endCol + 1;
  sheet.mergeCells(9, summaryStartColIndex, 9, summaryStartColIndex + 2);
  const totalTitle = sheet.getCell(9, summaryStartColIndex);
  totalTitle.value = "Số ngày hưởng trong tháng";
  totalTitle.font = createFont({ size: 8 });
  totalTitle.alignment = createAligntment();
  totalTitle.border = createBorder();

  const summarySubHeaders = [
    { text: "Từ 04 giờ làm việc/ngày trở lên\n(tính 01 ngày)" },
    { text: "Dưới 04 giờ làm việc/ngày\n(tính 1/2 ngày)" },
    { text: "Cộng" },
  ];

  summarySubHeaders.forEach((sub, idx) => {
    const colIdx = summaryStartColIndex + idx;
    sheet.mergeCells(10, colIdx, 11, colIdx);
    const c = sheet.getCell(10, colIdx);
    c.value = sub.text;
    c.font = createFont({ size: 8, bold: true });
    c.alignment = createAligntment({
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    });
    c.border = createBorder();
  });

  let currentRow = 13;
  const startDayLetter = getColLetter(startCol);
  const endDayLetter = getColLetter(endCol);

  employees.forEach((emp, index) => {
    const row = sheet.getRow(currentRow);

    row.getCell(1).value = index + 1;
    row.getCell(1).font = createFont({ size: 8 });
    row.getCell(1).alignment = createAligntment();
    row.getCell(1).border = createBorder();

    row.getCell(2).value = emp.full_name;
    row.getCell(2).font = createFont({ size: 8 });
    row.getCell(2).alignment = createAligntment({
      horizontal: "left",
      wrapText: true,
    });
    row.getCell(2).border = createBorder();

    row.getCell(3).value = EMPLOYEE_RANK_LABELS[emp.rank];
    row.getCell(3).font = createFont({ size: 8 });
    row.getCell(3).alignment = createAligntment();
    row.getCell(3).border = createBorder();

    row.getCell(4).value = emp.position;
    row.getCell(4).font = createFont({ size: 8 });
    row.getCell(4).alignment = createAligntment();
    row.getCell(4).border = createBorder();

    for (let day = 1; day <= daysInMonth; day++) {
      const colIdx = startCol + day - 1;
      const cell = row.getCell(colIdx);
      cell.value = "X";
      cell.font = createFont({ size: 8 });
      cell.alignment = createAligntment();
      cell.border = createBorder();
    }

    const colOver4h = row.getCell(summaryStartColIndex);
    colOver4h.value = {
      formula: `COUNTIF(${startDayLetter}${currentRow}:${endDayLetter}${currentRow}, "X")`,
    };
    colOver4h.font = createFont({ size: 8 });
    colOver4h.alignment = createAligntment();
    colOver4h.border = createBorder();

    const colUnder4h = row.getCell(summaryStartColIndex + 1);
    colUnder4h.value = {
      formula: `COUNTIF(${startDayLetter}${currentRow}:${endDayLetter}${currentRow}, "X/2")`,
    };
    colUnder4h.font = createFont({ size: 8 });
    colUnder4h.alignment = createAligntment();
    colUnder4h.border = createBorder();

    const colOverLetter = getColLetter(summaryStartColIndex);
    const colUnderLetter = getColLetter(summaryStartColIndex + 1);
    const colTotal = row.getCell(summaryStartColIndex + 2);
    colTotal.value = {
      formula: `SUM(${colOverLetter}${currentRow}, ${colUnderLetter}${currentRow}*0.5)`,
    };
    colTotal.font = createFont({ size: 8, bold: true });
    colTotal.alignment = createAligntment();
    colTotal.border = createBorder();

    currentRow++;
  });

  const signatureRow = currentRow + 2;
  sheet.mergeCells(`A${signatureRow}:D${signatureRow}`);
  sheet.getCell(`A${signatureRow}`).value =
    'Ghi chú: Từ 04 giờ/ngày trở lên đánh dấu "X"';
  sheet.getCell(`A${signatureRow}`).font = createFont({ size: 8 });
  sheet.getCell(`A${signatureRow}`).alignment = createAligntment({
    horizontal: "left",
  });

  sheet.mergeCells(`A${signatureRow + 1}:D${signatureRow + 1}`);
  sheet.getCell(`A${signatureRow + 1}`).value =
    'Dưới 04 giờ/ngày đánh dấu "X/2"';
  sheet.getCell(`A${signatureRow + 1}`).font = createFont({ size: 8 });
  sheet.getCell(`A${signatureRow + 1}`).alignment = createAligntment({
    horizontal: "left",
  });

  sheet.mergeCells(`A${signatureRow + 2}:D${signatureRow + 2}`);
  sheet.getCell(`A${signatureRow + 2}`).value = "CÁN BỘ CHẤM CÔNG";
  sheet.getCell(`A${signatureRow + 2}`).font = createFont({
    size: 8,
    bold: true,
  });
  sheet.getCell(`A${signatureRow + 2}`).alignment = createAligntment();

  const captainStartCol = summaryStartColIndex - 1;
  sheet.mergeCells(
    signatureRow + 2,
    captainStartCol,
    signatureRow + 2,
    totalCols,
  );
  const captainTitleCell = sheet.getCell(signatureRow + 2, captainStartCol);
  captainTitleCell.value = "ĐỘI TRƯỞNG";
  captainTitleCell.font = createFont({ bold: true, size: 8 });
  captainTitleCell.alignment = createAligntment();

  // Format Print
  sheet.getColumn("A").width = toExcelWidth(3.67);
  sheet.getColumn("B").width = toExcelWidth(11.56);
  sheet.getColumn("C").width = toExcelWidth(5.56);
  sheet.getColumn("D").width = toExcelWidth(5.22);

  for (let col = startCol; col <= endCol; col++) {
    sheet.getColumn(col).width = toExcelWidth(1.56);
  }

  const colOver4hIdx = endCol + 1;
  const colUnder4hIdx = endCol + 2;
  const colTotalIdx = endCol + 3;

  sheet.getColumn(colOver4hIdx).width = toExcelWidth(5.89);
  sheet.getColumn(colUnder4hIdx).width = toExcelWidth(6.11);
  sheet.getColumn(colTotalIdx).width = toExcelWidth(5.89);

  sheet.getRow(10).height = 26.4;
  sheet.getRow(11).height = 56.3;

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `cham-cong-thang-${month}-${year}.xlsx`);
};
