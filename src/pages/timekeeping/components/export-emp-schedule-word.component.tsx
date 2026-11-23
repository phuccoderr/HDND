import type { Schedule } from "@/apis/schedules.api";
import {
  formatHourRangeVn,
  formatVnDate,
  getEmployeeMonthlyEvents,
  hourOf,
} from "../scheduleUtils";
import {
  Document,
  Packer,
  Table,
  TableRow,
  TableCell,
  Paragraph,
  TextRun,
  WidthType,
  VerticalAlign,
  VerticalMergeType,
  AlignmentType,
  BorderStyle,
  PageOrientation,
  TableLayoutType,
  HeightRule,
  TabStopType,
} from "docx";
import { saveAs } from "file-saver";
import type { Employee } from "@/apis/employee.api";
import { DocxHelper } from "@/utils/docx.util";

const CELL_BORDER = { style: BorderStyle.SINGLE, size: 4, color: "000000" };
const ALL_BORDERS = {
  top: CELL_BORDER,
  bottom: CELL_BORDER,
  left: CELL_BORDER,
  right: CELL_BORDER,
};

/** Sinh nội dung cột "Kết quả thực hiện nhiệm vụ" dựa theo loại nhân sự. */
function buildResultText(event: Schedule): string {
  const startHour = hourOf(event.start_datetime);
  const isDayShift = startHour >= 6 && startHour < 18;

  if (isDayShift) {
    const turns = Math.floor(Math.random() * (24 - 12 + 1)) + 12;
    return `Canh gác bảo vệ mục tiêu, kiểm soát người và phương tiện ra vào trụ sở mục tiêu ${turns} lượt, trong ca trực tình hình ổn định`;
  }
  return `Canh gác bảo vệ mục tiêu, trong ca trực tình hình ổn định`;
}

export async function exportEmployeeScheduleToWord(
  schedules: Schedule[],
  employee: Employee,
  month: number,
  year: number,
) {
  const grouped = getEmployeeMonthlyEvents(schedules, employee.id, year, month);

  // ======================= BẢNG 1: QUỐC HIỆU / TIÊU NGỮ =======================
  const headerTable = new Table({
    width: { size: 0, type: WidthType.DXA },
    alignment: AlignmentType.CENTER,
    layout: TableLayoutType.FIXED,
    columnWidths: [5651, 8749],
    borders: DocxHelper.NO_BORDERS,
    margins: { left: 10, right: 10 },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          new TableCell({
            width: DocxHelper.dxaToCmRaw(9.97),
            verticalAlign: VerticalAlign.TOP,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "PHÒNG CẢNH SÁT CƠ ĐỘNG",
                    size: DocxHelper.getSize(14),
                  }),
                  new TextRun({
                    text: "ĐỘI ",
                    break: 1,
                    bold: true,
                    size: DocxHelper.getSize(14),
                  }),
                  new TextRun({
                    text: "CSBV MỤC",
                    bold: true,
                    size: DocxHelper.getSize(14),
                    underline: {},
                  }),
                  new TextRun({
                    text: " TIÊU",
                    bold: true,
                    size: DocxHelper.getSize(14),
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: DocxHelper.dxaToCmRaw(15.43),
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                run: {
                  bold: true,
                  size: DocxHelper.getSize(14),
                  underline: {},
                },
                children: [
                  new TextRun({
                    text: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM",
                    size: DocxHelper.getSize(14),
                    bold: true,
                  }),
                  new TextRun({
                    text: "Độc lập – Tự do – Hạnh phúc",
                    bold: true,
                    size: DocxHelper.getSize(14),
                    break: 1,
                  }),
                ],
              }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [] }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          // Ô trái để trống
          new TableCell({
            width: DocxHelper.dxaToCmRaw(9.97),
            children: [new Paragraph({ children: [] })],
          }),
          // Ô phải chứa ngày tháng căn phải
          new TableCell({
            width: DocxHelper.dxaToCmRaw(15.43),
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text:
                      " ".repeat(61) +
                      `Cần Thơ, ngày 30 tháng ${month} năm ${year}`,
                    italics: true,
                    size: DocxHelper.getSize(14),
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // ======================= TIÊU ĐỀ BÁO CÁO =======================
  const title = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 300, after: 300 }, // Tạo khoảng cách trên dưới
    run: { bold: true, size: DocxHelper.getSize(14) },
    children: [
      new TextRun({
        size: DocxHelper.getSize(14),
        text: "BÁO CÁO",
        bold: true,
      }),
      new TextRun({
        text: `TỔNG HỢP KẾT QUẢ THỰC HIỆN NHIỆM VỤ TRONG THÁNG ${month}/${year}`,
        size: DocxHelper.getSize(14),
        break: 1,
        bold: true,
      }),
    ],
  });

  const sttLine = new Paragraph({
    alignment: AlignmentType.BOTH,
    spacing: { before: 300, after: 300 },
    run: { bold: true, size: DocxHelper.getSize(14) },
    children: [
      new TextRun({
        text: " ".repeat(7) + "STT 1: ",
        size: DocxHelper.getSize(14),
      }),
      new TextRun({
        text: "Hạ sĩ Đào Quốc Trung",
        size: DocxHelper.getSize(14),
      }),
    ],
  });

  const COL = { date: 2148, time: 3575, result: 6876, note: 922 };
  const cell = (
    width: number,
    text: string,
    opts: { center?: boolean; bold?: boolean; rowSpan?: number } = {},
  ) =>
    new TableCell({
      width: { size: width, type: WidthType.DXA },
      borders: DocxHelper.CELL_BORDERS,
      verticalAlign: VerticalAlign.CENTER,
      rowSpan: opts.rowSpan,
      children: [
        new Paragraph({
          alignment: opts.center ? AlignmentType.CENTER : undefined,
          run: { size: DocxHelper.getSize(13) },
          children: text
            ? [
                new TextRun({
                  text,
                  bold: opts.bold,
                  size: DocxHelper.getSize(13),
                }),
              ]
            : [],
        }),
      ],
    });
  const ROW_HEIGHT = { value: 749, rule: HeightRule.ATLEAST };
  const headRow = new TableRow({
    height: ROW_HEIGHT,
    children: [
      cell(COL.date, "Ngày thực hiện nhiệm vụ", { center: true, bold: true }),
      cell(COL.time, "Thời gian thực hiện nhiệm vụ", {
        center: true,
        bold: true,
      }),
      cell(COL.result, "Kết quả thực hiện nhiệm vụ", {
        center: true,
        bold: true,
      }),
      cell(COL.note, "Ghi chú", { center: true, bold: true }),
    ],
  });

  const dataRows: TableRow[] = [];
  for (const { dateKey, events } of grouped) {
    events.forEach((event, idx) => {
      const dateCell =
        idx === 0
          ? new TableCell({
              width: DocxHelper.dxaToCmRaw(3.79),
              verticalAlign: VerticalAlign.CENTER,
              borders: ALL_BORDERS,
              verticalMerge: VerticalMergeType.RESTART,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: formatVnDate(dateKey),
                      size: DocxHelper.getSize(14),
                      font: "Times New Roman",
                    }),
                  ],
                }),
              ],
            })
          : new TableCell({
              width: DocxHelper.dxaToCmRaw(3.79),
              verticalAlign: VerticalAlign.CENTER,
              borders: ALL_BORDERS,
              verticalMerge: VerticalMergeType.CONTINUE,
              children: [new Paragraph("")],
            });

      const timeCell = new TableCell({
        width: DocxHelper.dxaToCmRaw(6.31),
        borders: ALL_BORDERS,
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: formatHourRangeVn(
                  event.start_datetime,
                  event.end_datetime,
                ),
                font: "Times New Roman",
                size: DocxHelper.getSize(14),
              }),
            ],
          }),
        ],
      });

      const resultCell = new TableCell({
        width: DocxHelper.dxaToCmRaw(12.13),
        borders: ALL_BORDERS,
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            alignment: AlignmentType.LEFT,

            children: [
              new TextRun({
                text: buildResultText(event),
                font: "Times New Roman",
                size: DocxHelper.getSize(14),
              }),
            ],
          }),
        ],
      });

      const noteCell = new TableCell({
        width: DocxHelper.dxaToCmRaw(1.63),
        borders: ALL_BORDERS,
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({})],
      });

      dataRows.push(
        new TableRow({ children: [dateCell, timeCell, resultCell, noteCell] }),
      );
    });
  }

  const dutyTable = new Table({
    width: DocxHelper.dxaToCmRaw(23.85),
    indent: DocxHelper.dxaToCmRaw(0.96),
    columnWidths: [COL.date, COL.time, COL.result, COL.note],
    borders: DocxHelper.GRID_BORDERS,
    margins: { left: 144, right: 14 },
    rows: [headRow, ...dataRows],
  });

  // ======================= BẢNG 3: CHỮ KÝ =======================
  const signTable = new Table({
    width: { size: 0, type: WidthType.AUTO },
    layout: TableLayoutType.FIXED,
    columnWidths: [6811, 7142],
    borders: DocxHelper.NO_BORDERS,
    margins: { left: 10, right: 10 },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: DocxHelper.dxaToCmRaw(12),
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                run: { bold: true, size: DocxHelper.getSize(14) },
                children: [
                  new TextRun({
                    text: "XÁC NHẬN CỦA CHỈ HUY ĐỘI",
                    bold: true,
                    size: DocxHelper.getSize(14),
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                run: { size: DocxHelper.getSize(14) },
                children: [
                  new TextRun({
                    text: "P.ĐỘI TRƯỞNG",
                    bold: true,
                    size: DocxHelper.getSize(14),
                  }),
                ],
              }),
              new Paragraph({
                spacing: { after: 1200 },
                run: { size: DocxHelper.getSize(14) },
                children: [],
              }),
              new Paragraph({
                tabStops: [{ type: TabStopType.LEFT, position: 2430 }],
                run: { bold: true, size: DocxHelper.getSize(14) },
                children: [
                  new TextRun({
                    text: " ".repeat(24),
                    size: DocxHelper.getSize(14),
                  }),
                  new TextRun({
                    text: "Trung tá: Nguyễn Quốc Nam",
                    bold: true,
                    size: DocxHelper.getSize(14),
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: DocxHelper.dxaToCmRaw(12.6),
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                run: { size: DocxHelper.getSize(14) },
                children: [
                  new TextRun({
                    text: `Cần Thơ, ngày 30 tháng ${month} năm ${year}`,
                    italics: true,
                    size: DocxHelper.getSize(14),
                  }),
                  new TextRun({
                    text: "NGƯỜI BÁO CÁO",
                    break: 1,
                    bold: true,
                    size: DocxHelper.getSize(14),
                  }),
                ],
              }),
              new Paragraph({
                spacing: { after: 1200 },
                run: { size: DocxHelper.getSize(14) },
                children: [],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                run: { size: DocxHelper.getSize(14) },
                children: [
                  new TextRun({
                    text: employee.full_name,
                    bold: true,
                    size: DocxHelper.getSize(14),
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const centerBold = (text: string) =>
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 300, after: 300 },
      run: { bold: true, size: DocxHelper.getSize(14) },
      children: [
        new TextRun({ text, bold: true, size: DocxHelper.getSize(14) }),
      ],
    });

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Times New Roman",
            language: {
              value: "en-US",
              eastAsia: "en-US",
              bidirectional: "ar-SA",
            },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            // A4 ngang: truyền kích thước dọc + orientation LANDSCAPE (docx tự hoán đổi)
            size: {
              width: 11906,
              height: 16838,
              orientation: PageOrientation.LANDSCAPE,
            },
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
              header: 708,
              footer: 708,
              gutter: 0,
            },
          },
        },
        children: [
          headerTable, // 1. Header (Quốc hiệu / Đơn vị)
          title, // 2. Tiêu đề BÁO CÁO
          sttLine, // 3. Bảng dữ liệu chính
          dutyTable,
          new Paragraph({ spacing: { before: 240 }, children: [] }),
          signTable,
          centerBold("XÁC NHẬN CỦA LÃNH ĐẠO PHÒNG"),
          centerBold("PHÓ TRƯỞNG PHÒNG"),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(
    blob,
    `lich-truc-${employee.full_name.replace(/\s+/g, "-")}-thang-${month}-${year}.docx`,
  );
}
