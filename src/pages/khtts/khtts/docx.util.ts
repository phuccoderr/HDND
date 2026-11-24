import {
  AlignmentType,
  Document,
  PageOrientation,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from "docx";
import { saveAs } from "file-saver";
import { DocxHelper } from "@/utils/docx.util";

export interface DocumentDate {
  day: number;
  month: number;
  year: number;
}

export type DocxPreviewBlock =
  | {
      type: "paragraph";
      text: string;
      alignment?: "left" | "center" | "right" | "justify";
      bold?: boolean;
      italic?: boolean;
    }
  | {
      type: "table";
      rows: string[][];
      bordered?: boolean;
      headerRow?: boolean;
    };

interface ParagraphStyle {
  alignment?: (typeof AlignmentType)[keyof typeof AlignmentType];
  bold?: boolean;
  italics?: boolean;
  fontSize?: number;
  before?: number;
  after?: number;
  leftIndent?: number;
  firstLineIndent?: number;
}

export function getMonthDayCount(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

export function createParagraph(
  text: string,
  style: ParagraphStyle = {},
): Paragraph {
  const indent =
    style.leftIndent !== undefined || style.firstLineIndent !== undefined
      ? {
          left: style.leftIndent,
          firstLine: style.firstLineIndent,
        }
      : undefined;

  return new Paragraph({
    alignment: style.alignment,
    spacing:
      style.before !== undefined || style.after !== undefined
        ? { before: style.before, after: style.after }
        : undefined,
    indent,
    children: text
      ? [
          new TextRun({
            text,
            font: "Times New Roman",
            size: DocxHelper.getSize(style.fontSize ?? 13),
            bold: style.bold,
            italics: style.italics,
          }),
        ]
      : [],
  });
}

export function createCell(
  children: Paragraph[],
  width: number,
  bordered = false,
): TableCell {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders: bordered ? DocxHelper.CELL_BORDERS : DocxHelper.NO_BORDERS,
    margins: { top: 45, right: 60, bottom: 45, left: 60 },
    verticalAlign: VerticalAlign.CENTER,
    children,
  });
}

export function createTextTable(
  rows: string[][],
  columnWidths: number[],
  options: {
    bordered?: boolean;
    headerRow?: boolean;
    fontSize?: number;
    align?: (typeof AlignmentType)[keyof typeof AlignmentType];
  } = {},
): Table {
  const tableRows = rows.map(
    (row, rowIndex) =>
      new TableRow({
        tableHeader: options.headerRow === true && rowIndex === 0,
        children: row.map(
          (text, columnIndex) =>
            new TableCell({
              width: {
                size: columnWidths[columnIndex] ?? columnWidths[0],
                type: WidthType.DXA,
              },
              borders: options.bordered
                ? DocxHelper.CELL_BORDERS
                : DocxHelper.NO_BORDERS,
              margins: { top: 45, right: 60, bottom: 45, left: 60 },
              verticalAlign: VerticalAlign.CENTER,
              children: [
                createParagraph(text, {
                  alignment: options.align,
                  bold: options.headerRow === true && rowIndex === 0,
                  fontSize: options.fontSize,
                }),
              ],
            }),
        ),
      }),
  );

  return new Table({
    width: {
      size: columnWidths.reduce((total, width) => total + width, 0),
      type: WidthType.DXA,
    },
    columnWidths,
    layout: TableLayoutType.FIXED,
    alignment: AlignmentType.CENTER,
    borders: options.bordered ? DocxHelper.GRID_BORDERS : DocxHelper.NO_BORDERS,
    rows: tableRows,
  });
}

export function createDocument(children: (Paragraph | Table)[]): Document {
  return new Document({
    styles: {
      default: {
        document: {
          run: { font: "Times New Roman", size: DocxHelper.getSize(13) },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 11907,
              height: 16840,
              orientation: PageOrientation.PORTRAIT,
            },
            margin: {
              top: 1701,
              right: 1134,
              bottom: 1134,
              left: 1134,
              header: 720,
              footer: 720,
              gutter: 0,
            },
          },
        },
        children,
      },
    ],
  });
}

export async function saveDocx(
  document: Document,
  fileName: string,
): Promise<void> {
  const blob = await Packer.toBlob(document);
  saveAs(blob, fileName);
}
