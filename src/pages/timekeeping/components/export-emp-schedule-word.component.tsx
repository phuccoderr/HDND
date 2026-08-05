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
} from "docx";
import { saveAs } from "file-saver";
import type { Employee } from "@/apis/employee.api";

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

function getWidthDXA(size: number) {
  return { size: size * 1440, type: WidthType.DXA };
}

function getSize(size: number) {
  return size * 2;
}

export async function exportEmployeeScheduleToWord(
  schedules: Schedule[],
  employee: Employee,
  month: number,
  year: number,
) {
  const grouped = getEmployeeMonthlyEvents(schedules, employee.id, year, month);

  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      new TableCell({
        width: getWidthDXA(3.01),
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "PHÒNG CẢNH SÁT CƠ ĐỘNG",
                bold: true,
                size: getSize(11),
              }),
              new TextRun({
                text: "ĐỘI CSBV MỤC TIÊU",
                bold: true,
                size: getSize(12),
                break: 1,
              }),
            ],
          }),
        ],
      }),
      new TableCell({
        width: getWidthDXA(4.66),
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM",
                bold: true,
                font: "Times New Roman",
                size: getSize(12),
              }),
              new TextRun({
                text: "Độc lập – Tự do – Hạnh phúc",
                bold: true,
                underline: {},
                font: "Times New Roman",
                size: getSize(13),
                break: 1,
              }),
            ],
          }),
        ],
      }),
    ],
  });
  const subHeaderRow = new TableRow({
    children: [
      // Ô trái để trống
      new TableCell({
        children: [new Paragraph("")],
      }),
      // Ô phải chứa ngày tháng căn phải
      new TableCell({
        children: [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: `Cần Thơ, ngày 30 tháng ${month} năm ${year}`,
                italics: true,
                font: "Times New Roman",
                size: getSize(12),
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const tableHeader = new Table({
    alignment: AlignmentType.CENTER,
    layout: "fixed",
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [headerRow, subHeaderRow],
  });

  const titleParagraph = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 300, after: 300 }, // Tạo khoảng cách trên dưới
    children: [
      new TextRun({
        text: "BÁO CÁO",
        bold: true,
        font: "Times New Roman",
        size: getSize(13),
      }),
      new TextRun({
        text: `TỔNG HỢP KẾT QUẢ THỰC HIỆN NHIỆM VỤ TRONG THÁNG ${month}/${year}`,
        bold: true,
        font: "Times New Roman",
        size: getSize(13),
        break: 1,
      }),
    ],
  });

  const contentRows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      height: { rule: "atLeast", value: getWidthDXA(0.5).size },
      children: [
        new TableCell({
          width: getWidthDXA(1.49),
          verticalAlign: VerticalAlign.CENTER,
          borders: ALL_BORDERS,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "Ngày thực hiện nhiệm vụ",
                  bold: true,
                  font: "Times New Roman",
                  size: getSize(13),
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: getWidthDXA(2.48),
          verticalAlign: VerticalAlign.CENTER,
          borders: ALL_BORDERS,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "Thời gian thực hiện\nnhiệm vụ",
                  bold: true,
                  font: "Times New Roman",
                  size: getSize(13),
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: getWidthDXA(4.77),
          verticalAlign: VerticalAlign.CENTER,
          borders: ALL_BORDERS,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "Kết quả thực hiện nhiệm vụ",
                  bold: true,
                  font: "Times New Roman",
                  size: getSize(13),
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: getWidthDXA(0.64),
          verticalAlign: VerticalAlign.CENTER,
          borders: ALL_BORDERS,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "Ghi chú",
                  bold: true,
                  font: "Times New Roman",
                  size: getSize(13),
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  ];

  for (const { dateKey, events } of grouped) {
    events.forEach((event, idx) => {
      const dateCell =
        idx === 0
          ? new TableCell({
              width: getWidthDXA(1.49),
              verticalAlign: VerticalAlign.CENTER,
              borders: ALL_BORDERS,
              verticalMerge: VerticalMergeType.RESTART,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: formatVnDate(dateKey),
                      bold: true,
                      font: "Times New Roman",
                    }),
                  ],
                }),
              ],
            })
          : new TableCell({
              width: getWidthDXA(1.49),
              verticalAlign: VerticalAlign.CENTER,
              borders: ALL_BORDERS,
              verticalMerge: VerticalMergeType.CONTINUE,
              children: [new Paragraph("")],
            });

      const timeCell = new TableCell({
        width: getWidthDXA(2.48),
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
                size: getSize(13),
              }),
            ],
          }),
        ],
      });

      const resultCell = new TableCell({
        width: getWidthDXA(4.77),
        borders: ALL_BORDERS,
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            alignment: AlignmentType.LEFT,

            children: [
              new TextRun({
                text: buildResultText(event),
                font: "Times New Roman",
                size: getSize(13),
              }),
            ],
          }),
        ],
      });

      const noteCell = new TableCell({
        width: getWidthDXA(0.64),
        borders: ALL_BORDERS,
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({})],
      });

      contentRows.push(
        new TableRow({ children: [dateCell, timeCell, resultCell, noteCell] }),
      );
    });
  }
  const tableContent = new Table({
    width: getWidthDXA(9.39),
    indent: {
      size: 547, // ~0.38 inch
      type: WidthType.DXA,
    },
    rows: contentRows,
  });

  const signatureTable = new Table({
    layout: "fixed",
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          // Bên trái: Xác nhận Chỉ huy & Lãnh đạo
          new TableCell({
            width: getWidthDXA(4.73),
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "XÁC NHẬN CỦA CHỈ HUY ĐỘI",
                    bold: true,
                    font: "Times New Roman",
                    size: getSize(14),
                  }),
                ],
              }),
              new Paragraph({ spacing: { after: 1200 } }), // Khoảng trống để ký tên
            ],
          }),
          // Bên phải: Người báo cáo
          new TableCell({
            width: getWidthDXA(4.96),
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `Cần Thơ, ngày 30 tháng ${month} năm ${year}`,
                    italics: true,
                    font: "Times New Roman",
                    size: getSize(14),
                  }),
                  new TextRun({
                    text: "NGƯỜI BÁO CÁO",
                    bold: true,
                    font: "Times New Roman",
                    size: getSize(14),
                    break: 1,
                  }),
                ],
              }),
              new Paragraph({ spacing: { after: 1200 } }), // Khoảng trống để ký tên
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: employee.full_name,
                    bold: true,
                    font: "Times New Roman",
                    size: getSize(14),
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const signatureParagraph = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 300, after: 300 }, // Tạo khoảng cách trên dưới
    children: [
      new TextRun({
        text: "XÁC NHẬN CỦA LÃNH ĐẠO PHÒNG",
        bold: true,
        font: "Times New Roman",
        size: getSize(14),
      }),
    ],
  });

  const spacerParagraph = new Paragraph({
    spacing: {
      before: 240, // Khoảng trống phía trên (360 dxa = ~18pt / 1.5 dòng)
    },
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          tableHeader, // 1. Header (Quốc hiệu / Đơn vị)
          titleParagraph, // 2. Tiêu đề BÁO CÁO
          tableContent, // 3. Bảng dữ liệu chính
          spacerParagraph,
          signatureTable,
          signatureParagraph,
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
