import type { Alignment, Borders, Font } from "exceljs";

export class ExcelHelper {
  public static createFont({
    name = "Times New Roman",
    size = 10,
    bold = false,
    ...props
  }: Partial<Font> = {}): Partial<Font> {
    return {
      name,
      size,
      bold,
      ...props,
    };
  }

  public static createAlignment({
    vertical = "middle",
    horizontal = "center",
    wrapText = true,
    ...props
  }: Partial<Alignment> = {}): Partial<Alignment> {
    return {
      vertical,
      horizontal,
      wrapText,
      ...props,
    };
  }

  public static createBorder({
    top = { style: "thin" },
    bottom = { style: "thin" },
    left = { style: "thin" },
    right = { style: "thin" },
    ...props
  }: Partial<Borders> = {}): Partial<Borders> {
    return {
      top,
      bottom,
      left,
      right,
      ...props,
    };
  }

  public static toExcelWidth(targetWidth: number): number {
    if (targetWidth <= 0) return 0;
    return Number((targetWidth + 0.81).toFixed(2));
  }

  public static getColLetter(colIndex: number): string {
    let temp: number;
    let letter = "";

    while (colIndex > 0) {
      temp = (colIndex - 1) % 26;
      letter = String.fromCharCode(65 + temp) + letter;
      colIndex = Math.floor((colIndex - temp - 1) / 26);
    }

    return letter;
  }
}
