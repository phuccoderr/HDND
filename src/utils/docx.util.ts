import {
  BorderStyle,
  Document,
  Packer,
  PageOrientation,
  Paragraph,
  Table,
  WidthType,
} from "docx";
import { saveAs } from "file-saver";

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
  static DXA_PER_INCH = 1440;
  static CM_PER_INCH = 2.54;

  static cmToDxa(cm: number) {
    return (cm * this.DXA_PER_INCH) / this.CM_PER_INCH;
  }

  static dxaToCmRaw(size: number) {
    return {
      size: size * (this.DXA_PER_INCH / this.CM_PER_INCH),
      type: WidthType.DXA,
    };
  }

  static getSize(size: number) {
    return size * 2;
  }

  static create(
    children: (Paragraph | Table)[],
    orientation: "portrait" | "landscape" = "portrait",
  ) {
    const isLandscape = orientation === "landscape";
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
                width: isLandscape ? 11906 : 16838,
                height: isLandscape ? 16838 : 11906,
                orientation: isLandscape
                  ? PageOrientation.LANDSCAPE
                  : PageOrientation.PORTRAIT,
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
          children,
        },
      ],
    });
  }

  static async save(doc: Document, fileName: string) {
    const blob = await Packer.toBlob(doc);
    saveAs(blob, fileName);
  }
}
