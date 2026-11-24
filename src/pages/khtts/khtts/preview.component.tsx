import { useMemo, useState } from "react";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DocxPreviewBlock, DocumentDate } from "./docx.util";

interface PreviewProps {
  title: string;
  description: string;
  initialDate: string;
  getPreviewBlocks: (date: DocumentDate) => DocxPreviewBlock[];
  onExport: (date: DocumentDate) => Promise<void>;
}

function getDocumentDate(value: string): DocumentDate | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const [, yearText, monthText, dayText] = match;
  const date = new Date(Number(yearText), Number(monthText) - 1, Number(dayText));
  if (
    date.getFullYear() !== Number(yearText) ||
    date.getMonth() + 1 !== Number(monthText) ||
    date.getDate() !== Number(dayText)
  ) {
    return null;
  }

  return {
    day: Number(dayText),
    month: Number(monthText),
    year: Number(yearText),
  };
}

function ParagraphPreview({
  block,
}: {
  block: Extract<DocxPreviewBlock, { type: "paragraph" }>;
}) {
  if (!block.text.trim()) return <div className="h-3" />;

  return (
    <p
      className={[
        "whitespace-pre-wrap leading-relaxed",
        block.alignment === "center" && "text-center",
        block.alignment === "right" && "text-right",
        block.alignment === "justify" && "text-justify",
        block.bold && "font-bold",
        block.italic && "italic",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {block.text}
    </p>
  );
}

function TablePreview({
  block,
}: {
  block: Extract<DocxPreviewBlock, { type: "table" }>;
}) {
  return (
    <div className="my-3 overflow-x-auto">
      <table
        className={[
          "w-full border-collapse text-left text-xs",
          block.bordered &&
            "[&_td]:border [&_td]:border-slate-500 [&_th]:border [&_th]:border-slate-500",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <tbody>
          {block.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => {
                const isHeader = block.headerRow && rowIndex === 0;
                const Cell = isHeader ? "th" : "td";

                return (
                  <Cell
                    key={cellIndex}
                    className={[
                      "px-1.5 py-1 align-top",
                      isHeader && "bg-slate-100 text-center font-bold",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {cell}
                  </Cell>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function KhttsPreview({
  title,
  description,
  initialDate,
  getPreviewBlocks,
  onExport,
}: PreviewProps) {
  const [dateValue, setDateValue] = useState(initialDate);
  const [isExporting, setIsExporting] = useState(false);
  const date = getDocumentDate(dateValue);
  const blocks = useMemo(
    () => (date ? getPreviewBlocks(date) : []),
    [date, getPreviewBlocks],
  );

  const handleExport = async () => {
    if (!date) {
      toast.error("Vui lòng chọn ngày hợp lệ.");
      return;
    }

    setIsExporting(true);
    try {
      await onExport(date);
      toast.success("Đã xuất tệp DOCX.");
    } catch (error) {
      toast.error("Không thể xuất tệp DOCX.", {
        description:
          error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="m-4 space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label htmlFor="khtts-document-date">Ngày áp dụng</Label>
            <Input
              id="khtts-document-date"
              type="date"
              value={dateValue}
              onChange={(event) => setDateValue(event.target.value)}
              className="w-44"
            />
          </div>
          <Button onClick={handleExport} disabled={isExporting || !date}>
            <Download />
            {isExporting ? "Đang xuất..." : "Tải DOCX"}
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-4" />
            Xem trước nội dung kế hoạch
          </CardTitle>
          <CardDescription>
            Nội dung được khai báo độc lập trong module kế hoạch tuần tra.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-[calc(100vh-15rem)] overflow-auto rounded-lg bg-muted p-4">
            {date ? (
              <article className="mx-auto min-h-[29.7cm] w-full max-w-[21cm] bg-white px-8 py-10 font-serif text-[11px] leading-relaxed text-black shadow-sm sm:px-14">
                {blocks.map((block, index) =>
                  block.type === "paragraph" ? (
                    <ParagraphPreview key={index} block={block} />
                  ) : (
                    <TablePreview key={index} block={block} />
                  ),
                )}
              </article>
            ) : (
              <p role="alert" className="text-sm text-destructive">
                Ngày đã chọn không hợp lệ.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
