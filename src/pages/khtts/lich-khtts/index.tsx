import { LichKhttsPreview } from "./preview.component";
import { exportLichKhtts } from "./export";
import { getLichPreviewBlocks } from "./content";

export default function LichKhttsPage() {
  return (
    <LichKhttsPreview
      title="Lịch tuần tra, kiểm soát"
      description="Xem mẫu lịch tuần tra, chọn ngày áp dụng và xuất DOCX."
      initialDate="2026-11-01"
      getPreviewBlocks={getLichPreviewBlocks}
      onExport={exportLichKhtts}
    />
  );
}
