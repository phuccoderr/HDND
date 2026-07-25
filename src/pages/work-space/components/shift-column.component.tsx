import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import TimeInput, { type TimeValue } from "@/components/ui/time-input";
import { Plus, Trash2 } from "lucide-react";
import ComboboxFieldWork from "./combobox-field-work.component";
import { type Employee, useEmployeesQuery } from "@/apis/employee.api";

let idCounter = 0;
export const nextId = (): string => `shift-${Date.now()}-${idCounter++}`;

/** Mốc 06:00, tính bằng phút kể từ 00:00 (6 * 60 = 360). Ranh giới bắt đầu cột "Ca ngày". */
export const DAY_START = 6 * 60; // 360
/** Mốc 18:00, tính bằng phút kể từ 00:00 (18 * 60 = 1080). Ranh giới kết thúc cột "Ca ngày". */
export const DAY_END = 18 * 60; // 1080

/**
 * Tính giờ kết thúc của ca theo số phút, có "đẩy qua ngày hôm sau" (+1440 phút)
 * nếu ca đó qua đêm (giờ kết thúc <= giờ bắt đầu về mặt số học trong ngày).
 *
 * Nhờ hàm này mà mọi phép tính thời lượng/khoảng cách giữa các ca đều đúng
 * kể cả khi ca vắt qua nửa đêm, ví dụ ca 22:00 → 02:00.
 *
 * @param start giờ bắt đầu, "HH:MM".
 * @param end giờ kết thúc, "HH:MM".
 * @returns số phút kết thúc, có thể lớn hơn 1440 nếu ca qua đêm.
 *
 * @example
 * endMinutesAdjusted("06:00", "08:00"); // 480  (8h bình thường, không qua đêm)
 * endMinutesAdjusted("22:00", "02:00"); // 1560 (02:00 hôm sau = 120 + 1440)
 * endMinutesAdjusted("23:00", "23:30"); // 1410 (23:30 bình thường, end > start)
 */
export function endMinutesAdjusted(start: string, end: string): number {
  const s = timeToMinutes(start);
  let e = timeToMinutes(end);
  if (e <= s) e += 1440;
  return e;
}

/**
 * Đổi giờ dạng chuỗi "HH:MM" (24h) sang tổng số phút kể từ 00:00.
 * Đây là hàm nền cho hầu hết logic so sánh/tính toán thời gian trong file này.
 *
 * timeToMinutes("00:00"); // 0
 * timeToMinutes("06:00"); // 360
 * timeToMinutes("07:30"); // 450
 * timeToMinutes("23:59"); // 1439
 */
export function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Đổi ngược lại: từ số phút sang chuỗi giờ "HH:MM".
 * Tự động "cuộn vòng" nếu số phút âm hoặc vượt quá 1440 (24h),
 * nhờ vậy các phép cộng/trừ giờ qua nửa đêm luôn ra kết quả hợp lệ.
 *
 * minutesToTime(360);   // "06:00"
 * minutesToTime(450);   // "07:30"
 * minutesToTime(1440);  // "00:00" (24h quay vòng về 0h)
 * minutesToTime(1500);  // "01:00" (1440 + 60)
 * minutesToTime(-30);   // "23:30" (số âm cuộn về cuối ngày hôm trước)
 */
export function minutesToTime(min: number): string {
  const normalized = ((min % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60)
    .toString()
    .padStart(2, "0");
  const m = (normalized % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * Kiểm tra một ca có thuộc cột "Ca ngày" hay không, dựa trên **giờ bắt đầu**.
 * Quy ước: ca thuộc "Ca ngày" nếu 06:00 <= start < 18:00; mọi trường hợp khác
 * (18:00–23:59 hoặc 00:00–05:59) đều rơi vào "Ca đêm".

 * isDayStart("06:00"); // true  (đúng mốc bắt đầu ngày)
 * isDayStart("18:00"); // false (đây là mốc bắt đầu của đêm)
 * isDayStart("02:00"); // false (ca sau nửa đêm → vẫn tính là đêm)
 */
export function isDayStart(start: string): boolean {
  const m = timeToMinutes(start);
  return m >= DAY_START && m < DAY_END;
}

/**
 * Tính "khoá sắp xếp" (sort key) riêng cho cột "Ca đêm", để các ca sau nửa đêm
 * (00:00–05:59) được xếp **sau** các ca buổi tối (18:00–23:59) thay vì bị xếp lên đầu
 * do 00:xx nhỏ hơn 18:xx về mặt số học thông thường.
 *
 * Cách làm: nếu giờ bắt đầu đã >= 18:00 thì giữ nguyên; nếu nhỏ hơn 18:00
 * (tức là rơi vào khung 00:00–05:59, thuộc "đêm hôm trước kéo dài") thì cộng thêm
 * 1440 phút (1 ngày) để nó luôn lớn hơn mọi mốc trong khung 18:00–23:59.
 *
 * nightSortKey("18:00"); // 1080        (giữ nguyên, vì đã >= 18:00)
 * nightSortKey("23:30"); // 1410
 * nightSortKey("00:30"); // 1470  (= 30 + 1440)  → lớn hơn 1410 nên xếp SAU 23:30
 * nightSortKey("05:00"); // 1740  (= 300 + 1440) → xếp cuối cùng trong cột đêm
 *
 * // Kết quả sort đúng theo trình tự thời gian thực tế:
 * // 18:00 → 23:30 → 00:30 → 05:00
 */
export function nightSortKey(start: string): number {
  const m = timeToMinutes(start);
  return m >= DAY_END ? m : m + 1440;
}

export type Period = "day" | "night";

export type Shift = {
  id: string;
  emps: Employee[];
  start: string; // "HH:MM", 24h
  end: string; // "HH:MM", 24h
};

const parseTimeValue = (value: string): TimeValue => {
  const [hourText = "0", minuteText = "0"] = value.split(":");
  const hour = Number.parseInt(hourText, 10);
  const minute = Number.parseInt(minuteText, 10);

  return {
    hour: Number.isNaN(hour) ? 0 : hour,
    minute: Number.isNaN(minute) ? 0 : minute,
  };
};

const formatTimeValue = (value: TimeValue): string =>
  `${value.hour.toString().padStart(2, "0")}:${value.minute.toString().padStart(2, "0")}`;

type ColumnAccent = {
  headerBg: string;
  iconBg: string;
};

type ShiftColumnProps = {
  title: string;
  rangeLabel: string;
  icon: React.ReactNode;
  accent: ColumnAccent;
  shifts: Shift[];
  overlapIds: Set<string>;
  onChange: (shift: Shift) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
};

export function ShiftColumn({
  title,
  rangeLabel,
  icon,
  accent,
  shifts,
  overlapIds,
  onChange,
  onRemove,
  onAdd,
}: ShiftColumnProps) {
  const { data: employees } = useEmployeesQuery();
  return (
    <Card className="flex flex-col overflow-hidden py-0 gap-0 flex-1">
      <CardHeader className={`gap-0.5 border-b py-3 ${accent.headerBg}`}>
        <CardTitle className="flex items-center gap-2 text-xs">
          <span
            className={`flex size-6 items-center justify-center rounded-md ${accent.iconBg}`}
          >
            {icon}
          </span>
          {title}
        </CardTitle>
        <CardDescription className="font-mono text-xs">
          {rangeLabel}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-1.5 p-3">
        {shifts.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Chưa có ca trực nào
          </p>
        )}
        {shifts.map((shift) => {
          const startValue = parseTimeValue(shift.start);
          const endValue = parseTimeValue(shift.end);

          return (
            <div
              key={shift.id}
              className={`group flex items-center gap-2 rounded-lg border bg-white px-2 py-1.5 transition-colors ${
                overlapIds.has(shift.id)
                  ? "border-destructive/60 bg-destructive/5"
                  : "border-border hover:border-foreground/20"
              }`}
            >
              <div className="flex items-center gap-1">
                <TimeInput
                  value={startValue}
                  onChange={(value) =>
                    onChange({ ...shift, start: formatTimeValue(value) })
                  }
                />
                <span className="text-muted-foreground">–</span>
                <TimeInput
                  value={endValue}
                  onChange={(value) =>
                    onChange({ ...shift, end: formatTimeValue(value) })
                  }
                />
              </div>

              <ComboboxFieldWork
                options={employees ?? []}
                value={shift.emps}
                onValueChange={(value) => {
                  onChange({ ...shift, emps: value });
                }}
                optionLabel={(value) => value.full_name}
              />

              <div className="flex items-center opacity-60 transition-opacity group-hover:opacity-100">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  title="Xoá ca"
                  onClick={() => onRemove(shift.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-1 border-dashed text-muted-foreground"
          onClick={onAdd}
        >
          <Plus className="size-3.5" />
          Thêm ca
        </Button>
      </CardContent>
    </Card>
  );
}
