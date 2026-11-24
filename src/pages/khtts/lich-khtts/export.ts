// import {
//   AlignmentType,
//   // Paragraph,
//   // Table,
//   // TableCell,
//   // TableLayoutType,
//   // TableRow,
//   // TextRun,
//   // VerticalAlign,
//   // WidthType,
// } from "docx";
// // import { DocxHelper } from "@/utils/docx.util";
// import {
//   // createParagraph,
//   createTextTable,
//   // type DocumentDate,
// } from "./docx.util";
// import { getScheduleRows, LICH_HEADER_ROWS } from "./content";
import type { Employee } from "@/apis/employee.api";

// function createHeaderTable(date: DocumentDate): Table {
//   const rows = LICH_HEADER_ROWS.map((row) =>
//     row.map((cell) =>
//       cell.includes("Cần Thơ, ngày 01 tháng 11 năm 2026")
//         ? cell.replace(
//             "Cần Thơ, ngày 01 tháng 11 năm 2026",
//             `Cần Thơ, ngày ${date.day} tháng ${date.month} năm ${date.year}`,
//           )
//         : cell,
//     ),
//   );

//   return createTextTable(rows, [3814, 6251], {
//     align: AlignmentType.CENTER,
//     fontSize: 12,
//   });
// }

// function createScheduleTable(date: DocumentDate): Table {
//   const rows = getScheduleRows(date);
//   const columnWidths = [621, 1418, 1701, 2364, 2383, 1980, 921];

//   return new Table({
//     width: { size: 11388, type: WidthType.DXA },
//     alignment: AlignmentType.CENTER,
//     layout: TableLayoutType.FIXED,
//     columnWidths,
//     borders: DocxHelper.GRID_BORDERS,
//     margins: { left: 30, right: 30, top: 20, bottom: 20 },
//     rows: rows.map(
//       (row, rowIndex) =>
//         new TableRow({
//           tableHeader: rowIndex === 0,
//           children: row.map(
//             (text, columnIndex) =>
//               new TableCell({
//                 width: { size: columnWidths[columnIndex], type: WidthType.DXA },
//                 borders: DocxHelper.CELL_BORDERS,
//                 margins: { top: 30, right: 35, bottom: 30, left: 35 },
//                 children: [
//                   createParagraph(text, {
//                     alignment:
//                       rowIndex === 0 || columnIndex < 3
//                         ? AlignmentType.CENTER
//                         : AlignmentType.LEFT,
//                     bold: rowIndex === 0,
//                     fontSize: rowIndex === 0 ? 10 : 9,
//                   }),
//                 ],
//               }),
//           ),
//         }),
//     ),
//   });
// }

export interface IExportLichKhtts {
  employees: Employee[];
  month: number;
  year: number;
}

export async function exportLichKhtts(
  {
    // employees,
    // month,
    // year,
  }: IExportLichKhtts,
): Promise<void> {
  // ======================= BẢNG 1: QUỐC HIỆU / TIÊU NGỮ =======================
  // const headerTable = new Table({
  //   width: { size: 0, type: WidthType.DXA },
  //   alignment: AlignmentType.CENTER,
  //   layout: TableLayoutType.FIXED,
  //   columnWidths: [DocxHelper.cmToDxa(6.73), 8749],
  //   borders: DocxHelper.NO_BORDERS,
  //   margins: { left: 10, right: 10 },
  //   rows: [
  //     new TableRow({
  //       tableHeader: true,
  //       children: [
  //         new TableCell({
  //           width: DocxHelper.dxaToCmRaw(6.73),
  //           verticalAlign: VerticalAlign.TOP,
  //           children: [
  //             new Paragraph({
  //               alignment: AlignmentType.CENTER,
  //               children: [
  //                 new TextRun({
  //                   text: "PHÒNG CẢNH SÁT CƠ ĐỘNG",
  //                   size: DocxHelper.getSize(14),
  //                 }),
  //                 new TextRun({
  //                   text: "ĐỘI ",
  //                   break: 1,
  //                   bold: true,
  //                   size: DocxHelper.getSize(14),
  //                 }),
  //                 new TextRun({
  //                   text: "CSBV MỤC",
  //                   bold: true,
  //                   size: DocxHelper.getSize(14),
  //                   underline: {},
  //                 }),
  //                 new TextRun({
  //                   text: " TIÊU",
  //                   bold: true,
  //                   size: DocxHelper.getSize(14),
  //                 }),
  //               ],
  //             }),
  //           ],
  //         }),
  //         new TableCell({
  //           width: DocxHelper.dxaToCmRaw(15.43),
  //           verticalAlign: VerticalAlign.CENTER,
  //           children: [
  //             new Paragraph({
  //               alignment: AlignmentType.CENTER,
  //               run: {
  //                 bold: true,
  //                 size: DocxHelper.getSize(14),
  //                 underline: {},
  //               },
  //               children: [
  //                 new TextRun({
  //                   text: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM",
  //                   size: DocxHelper.getSize(14),
  //                   bold: true,
  //                 }),
  //                 new TextRun({
  //                   text: "Độc lập – Tự do – Hạnh phúc",
  //                   bold: true,
  //                   size: DocxHelper.getSize(14),
  //                   break: 1,
  //                 }),
  //               ],
  //             }),
  //             new Paragraph({ alignment: AlignmentType.CENTER, children: [] }),
  //           ],
  //         }),
  //       ],
  //     }),
  //     new TableRow({
  //       children: [
  //         // Ô trái để trống
  //         new TableCell({
  //           width: DocxHelper.dxaToCmRaw(9.97),
  //           children: [new Paragraph({ children: [] })],
  //         }),
  //         // Ô phải chứa ngày tháng căn phải
  //         new TableCell({
  //           width: DocxHelper.dxaToCmRaw(15.43),
  //           children: [
  //             new Paragraph({
  //               alignment: AlignmentType.CENTER,
  //               children: [
  //                 new TextRun({
  //                   text:
  //                     " ".repeat(61) +
  //                     `Cần Thơ, ngày 30 tháng ${month} năm ${year}`,
  //                   italics: true,
  //                   size: DocxHelper.getSize(14),
  //                 }),
  //               ],
  //             }),
  //           ],
  //         }),
  //       ],
  //     }),
  //   ],
  // });
  // const children: (Paragraph | Table)[] = [
  //   createParagraph(" "),
  //   createHeaderTable(date),
  // ];
  // LICH_BODY_TEXT.forEach((sourceText, index) => {
  //   const text = updatePeriodText(sourceText, date);
  //   const isTitle = index < 3;
  //   const isSection = /^[IVX]+\./.test(text.trim());
  //   children.push(
  //     createParagraph(text, {
  //       alignment: isTitle ? AlignmentType.CENTER : AlignmentType.BOTH,
  //       bold: isTitle || isSection,
  //       fontSize: isTitle ? 14 : 12,
  //       before: index === 3 || isSection ? 120 : 0,
  //       after: isTitle ? 30 : 60,
  //     }),
  //   );
  // });
  // children.push(createScheduleTable(date));
  // children.push(new Paragraph({ spacing: { before: 600 }, children: [] }));
  // children.push(
  //   createTextTable([["ĐỘI TRƯỞNG", "CÁN BỘ LẬP"]], [5650, 5650], {
  //     align: AlignmentType.CENTER,
  //     fontSize: 13,
  //   }),
  // );
  // children.push(
  //   new Paragraph({ children: [] }),
  //   new Paragraph({ children: [] }),
  //   new Paragraph({ children: [] }),
  // );
  // await saveDocx(
  //   createDocument(children),
  //   `lich-tuan-tra-${date.month}-${date.year}.docx`,
  // );
}
