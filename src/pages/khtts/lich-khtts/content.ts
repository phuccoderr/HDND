import type { DocxPreviewBlock, DocumentDate } from "./docx.util";
import { getMonthDayCount } from "./docx.util";

export const LICH_HEADER_ROWS = [
  [
    " PHÒNG CẢNH SÁT CƠ ĐỘNG",
    "                 CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM",
  ],
  ["ĐỘI CSBV MỤC TIÊU", "             Độc lập – Tự do – Hạnh phúc"],
  ["", "                    Cần Thơ, ngày 01 tháng 11 năm 2026"],
  ["", ""],
];

export const LICH_BODY_TEXT = [
  "LỊCH TUẦN TRA",
  " Kiểm soát đảm bảo ANTT bảo vệ các mục tiêu",
  "Kèm theo kế hoạch số 11/KH-PK04-Đ5",
  "",
  "",
  "Căn cứ luật Cảnh sát cơ động ngày 14 tháng 6 năm 2022;",
  "Căn cứ Thông tư số 62/2025/TT-BCA ngày 11/7/2025 của Bộ trưởng Bộ Công an quy định về hoạt động vũ trang canh gác bảo vệ mục tiêu của Cảnh sát cơ động;",
  "Thực hiện Thông tư số 54/2022/TT-BCA ngày 14/11/2022 của Bộ Công an quy định quy trình hoạt động tuần tra, kiểm soát của Cảnh sát cơ động;",
  "Căn cứ Kế hoạch số: 11/KH-PK02-Đ5, ngày 01 tháng 11 năm 2026 của Đội CSBV mục tiêu Kế hoạch Tuần tra, vũ trang canh gác bảo vệ mục tiêu trên địa bàn TP.Cần Thơ tháng 11/2026",
  "Mục tiêu Văn phòng Đoàn ĐBQH và HĐND TP. Cần Thơ xây dựng Lịch tổ chức Tuần tra, vũ trang canh gác bảo vệ mục tiêu Văn phòng Đoàn ĐBQH và HĐND  TP.Cần Thơ tháng 11/2026 cụ thể như sau:",
  "I. Xác định địa bàn tuần tra",
  "- Mục tiêu Văn phòng Đoàn ĐBQH và HĐND TP. Cần Thơ: Tuần tra trên các tuyến đường nội bộ trong cơ quan; trên vỉa hè cơ quan theo tuyến đường Quang Trung và một phần đoạn đường hẻm 50, đường Quang Trung.",
  "II. Thời gian, phương tiện và lực lượng tham gia:",
  "- Thời gian: 30 đêm. Từ 01/11/2026 đến 30/11/2026",
  "- Tổng số ca tuần tra: 120 ca.",
  "- Thời gian tổ chức tuần tra từ 6h ngày hôm trước đến 6h ngày hôm sau",
  "- Phương tiện: Tuần tra đi bộ và xe mô tô.",
  "- Lực lượng tham gia: CBCS CSBV mục tiêu Văn phòng Đoàn ĐBQH và HĐND TP. Cần Thơ : 12 đồng chí.",
  "- Lịch Tuần tra cụ thể: ",
  "+ Mục tiêu Văn phòng Đoàn ĐBQH và HĐND TP. Cần Thơ:",
];

export const LICH_SCHEDULE_HEADERS = [
  "TT",
  "Ngày tháng",
  "Thời gian",
  "Tổ trưởng",
  "Tổ viên",
  "Trang bị",
  "Ghi chú",
];

const TEAM_LEADER = "Vũ Quốc Ca";
const EQUIPMENT = "Dùi cui, khóa số 8";
const SHIFTS_PER_DAY = 4;

const TIME_PATTERNS = [
  ["06h – 08h", "08h – 10h", "12h – 15h", "0h – 02h"],
  ["6h20 - 8h20", "8h20 - 10h20", "12h20 – 15h20", "15h20 - 17h20"],
  ["8h – 10h", "12h – 15h", "15h - 17h", "0h20 - 04h20"],
  ["06h – 08h", "08h – 10h", "12h – 15h", "2h20 – 04h20"],
  ["6h20 - 8h20", "8h20 - 10h20", "14h – 16h", "04h - 06h"],
  ["8h – 10h", "12h – 15h", "15h - 17h", "0h20 - 2h20"],
];

const STAFF_LIST = [
  "Võ Quý Minh Quang",
  "Quang Tuấn Duy",
  "Nguyễn Tuấn Vũ",
  "Đào Quốc Trung",
  "Bùi Quốc Dũng",
  "Nguyễn Hoàng Phúc",
  "Dương Huỳnh Tấn",
  "Tô Văn Hưởng",
  "Cù Minh Nhựt",
  "Phan Văn Khải",
  "Dương Nhật Huy",
  "Đồng chí thứ 12", // TODO: thay bằng tên người thứ 12
];

/**
 * Sinh lịch tuần tra cho cả tháng.
 * Mỗi phần tử của mảng là 1 ngày, gồm 4 ca dạng "khung giờ|tên nhân viên",
 * các ca ngăn cách bằng dấu ";".
 */
export function generateMonthlySchedule(month: number, year: number): string[] {
  const daysInMonth = getMonthDayCount(month, year);
  const result: string[] = [];

  for (let day = 0; day < daysInMonth; day += 1) {
    // Khung giờ lặp lại theo chu kỳ 6 ngày
    const times = TIME_PATTERNS[day % TIME_PATTERNS.length];

    // Nhân viên tịnh tiến dần qua danh sách
    const dayShifts = times.map((time, shiftIndex) => {
      const staffIndex =
        (day * SHIFTS_PER_DAY + shiftIndex) % STAFF_LIST.length;
      return `${time}|${STAFF_LIST[staffIndex]}`;
    });

    result.push(dayShifts.join(";"));
  }

  return result;
}

function getScheduleRows(date: DocumentDate): string[][] {
  const rows: string[][] = [LICH_SCHEDULE_HEADERS];
  const monthlySchedule = generateMonthlySchedule(date.month, date.year);
  let rowNumber = 1;

  monthlySchedule.forEach((dayText, dayIndex) => {
    const day = dayIndex + 1;

    dayText.split(";").forEach((shift) => {
      const [time, teamMember] = shift.split("|");

      rows.push([
        String(rowNumber),
        `${day}/${date.month}/${date.year}`,
        time,
        TEAM_LEADER,
        teamMember,
        EQUIPMENT,
        "",
      ]);

      rowNumber += 1;
    });
  });

  return rows;
}

function updatePeriodText(text: string, date: DocumentDate): string {
  const daysInMonth = getMonthDayCount(date.month, date.year);

  return text
    .replaceAll("tháng 11/2026", `tháng ${date.month}/${date.year}`)
    .replaceAll("tháng 11 năm 2026", `tháng ${date.month} năm ${date.year}`)
    .replace("30 đêm", `${daysInMonth} đêm`)
    .replace(
      "Từ 01/11/2026 đến 30/11/2026",
      `Từ 01/${date.month}/${date.year} đến ${daysInMonth}/${date.month}/${date.year}`,
    )
    .replace("120 ca.", `${daysInMonth * SHIFTS_PER_DAY} ca.`);
}

export function getLichPreviewBlocks(date: DocumentDate): DocxPreviewBlock[] {
  const headerRows = LICH_HEADER_ROWS.map((row) =>
    row.map((cell) =>
      cell.includes("Cần Thơ, ngày 01 tháng 11 năm 2026")
        ? cell.replace(
            "Cần Thơ, ngày 01 tháng 11 năm 2026",
            `Cần Thơ, ngày ${date.day} tháng ${date.month} năm ${date.year}`,
          )
        : cell,
    ),
  );
  const paragraphs = LICH_BODY_TEXT.map((text) => updatePeriodText(text, date));

  return [
    { type: "paragraph", text: " " },
    { type: "table", rows: headerRows, bordered: false },
    ...paragraphs.map((text, index) => ({
      type: "paragraph" as const,
      text,
      alignment: index < 3 ? ("center" as const) : ("justify" as const),
      bold: index < 3 || /^[IVX]+\./.test(text.trim()),
    })),
    {
      type: "table",
      rows: getScheduleRows(date),
      bordered: true,
      headerRow: true,
    },
    {
      type: "table",
      rows: [["ĐỘI TRƯỞNG", "CÁN BỘ LẬP"]],
      bordered: false,
    },
    { type: "paragraph", text: " " },
    { type: "paragraph", text: " " },
    { type: "paragraph", text: " " },
  ];
}

export { getScheduleRows, updatePeriodText };
