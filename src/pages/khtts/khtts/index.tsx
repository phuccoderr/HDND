import { KhttsPreview } from "./preview.component";
import { exportKhtts } from "./export";
import { getKhttsPreviewBlocks } from "./content";

export default function KhttsPage() {
  return (
    <KhttsPreview
      title="Kế hoạch tuần tra, kiểm soát"
      description="Xem mẫu kế hoạch, chọn ngày áp dụng và xuất DOCX."
      initialDate="2026-07-01"
      getPreviewBlocks={getKhttsPreviewBlocks}
      onExport={exportKhtts}
    />
  );
}
