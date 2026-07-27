import { Button } from "@/components/ui/button";
import type { WorkMode } from "./work-page.types";

type Props = {
  mode: WorkMode;
  onSave: () => void;
};

export default function WorkPageHeader({ mode, onSave }: Props) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div className="space-y-1">
        <h1 className="text-[12px] font-semibold">Quản lý ca</h1>
        <p className="text-[12px] text-muted-foreground">
          {mode === "edit"
            ? "Chỉnh sửa lịch trực dựa trên dữ liệu đã truy vấn."
            : "Tạo mới lịch trực cho ca và nhân sự chưa có."}
        </p>
      </div>
      <Button type="button" onClick={onSave} className="h-8 px-3 text-[12px]">
        Lưu
      </Button>
    </div>
  );
}
