import { BorderStyle, WidthType } from "docx";

export class DocxHelper {
  static NO_BORDER = { style: BorderStyle.NONE, size: 0, color: "auto" };
  static NO_BORDERS = {
    top: this.NO_BORDER,
    bottom: this.NO_BORDER,
    left: this.NO_BORDER,
    right: this.NO_BORDER,
    insideHorizontal: this.NO_BORDER,
    insideVertical: this.NO_BORDER,
  };

  static GRID_BORDER = { style: BorderStyle.SINGLE, size: 4, color: "auto" };
  static GRID_BORDERS = {
    top: this.GRID_BORDER,
    bottom: this.GRID_BORDER,
    left: this.GRID_BORDER,
    right: this.GRID_BORDER,
    insideHorizontal: this.GRID_BORDER,
    insideVertical: this.GRID_BORDER,
  };

  static CELL_BORDER = { style: BorderStyle.SINGLE, size: 4, color: "000000" };
  static CELL_BORDERS = {
    top: this.CELL_BORDER,
    bottom: this.CELL_BORDER,
    left: this.CELL_BORDER,
    right: this.CELL_BORDER,
  };

  static dxaToCmRaw(size: number) {
    return { size: size * (1440 / 2.54), type: WidthType.DXA };
  }

  static getSize(size: number) {
    return size * 2;
  }
}
