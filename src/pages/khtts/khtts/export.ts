import {
  AlignmentType,
  Paragraph,
  Table,
  TableLayoutType,
  TableRow,
  WidthType,
} from "docx";
import { DocxHelper } from "@/utils/docx.util";
import {
  createCell,
  createDocument,
  createParagraph,
  createTextTable,
  saveDocx,
  type DocumentDate,
} from "./docx.util";
import {
  KHTTS_BODY_TEXT,
  KHTTS_HEADER_ROWS,
  KHTTS_SIGNATURE_ROWS,
  updateKhttsText,
} from "./content";

function createHeaderTable(date: DocumentDate): Table {
  const rows = KHTTS_HEADER_ROWS.map((row) =>
    row.map((cell) => updateKhttsText(cell, date)),
  );
  const columnWidths = [6819, 2819];

  return new Table({
    width: { size: 9638, type: WidthType.DXA },
    alignment: AlignmentType.CENTER,
    layout: TableLayoutType.FIXED,
    columnWidths,
    borders: DocxHelper.NO_BORDERS,
    rows: [
      new TableRow({
        children: [
          createCell(
            [
              createParagraph(rows[0][0], {
                alignment: AlignmentType.CENTER,
                fontSize: 12,
              }),
            ],
            columnWidths[0],
          ),
          createCell(
            [
              createParagraph(rows[0][1], {
                alignment: AlignmentType.CENTER,
                bold: true,
                fontSize: 12,
              }),
            ],
            columnWidths[1],
          ),
        ],
      }),
      new TableRow({
        children: [
          createCell(
            [
              createParagraph(rows[1][0], {
                alignment: AlignmentType.CENTER,
                bold: true,
                fontSize: 12,
              }),
            ],
            columnWidths[0],
          ),
          createCell(
            [
              createParagraph(rows[1][1], {
                alignment: AlignmentType.CENTER,
                bold: true,
                fontSize: 12,
              }),
            ],
            columnWidths[1],
          ),
        ],
      }),
      new TableRow({
        children: [
          createCell(
            [
              createParagraph(rows[2][0], {
                alignment: AlignmentType.CENTER,
                bold: true,
                fontSize: 11,
              }),
            ],
            columnWidths[0],
          ),
          createCell(
            [
              createParagraph(rows[2][1], {
                alignment: AlignmentType.CENTER,
                italics: true,
                fontSize: 12,
              }),
            ],
            columnWidths[1],
          ),
        ],
      }),
    ],
  });
}

function createSignatureTable(): Table {
  return createTextTable(KHTTS_SIGNATURE_ROWS, [4905, 3945], {
    align: AlignmentType.CENTER,
    fontSize: 13,
  });
}

export async function exportKhtts(date: DocumentDate): Promise<void> {
  const children: (Paragraph | Table)[] = [createHeaderTable(date)];

  KHTTS_BODY_TEXT.forEach((sourceText) => {
    const text = updateKhttsText(sourceText, date);
    const trimmed = text.trim();
    const isSection = /^[IVX]+\./.test(trimmed);
    const isSubheading = /^\d+\.\s/.test(trimmed) || /^\* Biện pháp/.test(trimmed);

    children.push(
      createParagraph(text, {
        alignment: AlignmentType.BOTH,
        bold: isSection || isSubheading,
        fontSize: 13,
        before: isSection ? 120 : 0,
        after: 40,
      }),
    );
  });

  children.push(new Paragraph({ spacing: { before: 500 }, children: [] }));
  children.push(createSignatureTable());

  await saveDocx(
    createDocument(children),
    `ke-hoach-tuan-tra-${date.month}-${date.year}.docx`,
  );
}
