import type {
  DocxPreviewBlock,
  DocumentDate,
} from "./docx.util";
import { getMonthDayCount } from "./docx.util";

export const KHTTS_HEADER_ROWS = [
  [" PHÒNG CẢNH SÁT CƠ ĐỘNG", "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM"],
  ["ĐỘI CSBV MỤC TIÊU", "Độc lập - Tự do - Hạnh phúc"],
  [
    "                                                                                                   DANH SÁCH QUÂN TƯ TRANG CSNV MỤC TIÊU HỘI ĐỒNG NHÂN DÂN",
    " Cần Thơ, ngày tháng 06 năm 2026    ",
  ],
];

export const KHTTS_BODY_TEXT = [
  "Căn cứ Kế hoạch số 07/KH-PK02-Đ5 ngày 01 tháng 07 năm 2026 của Đội Cảnh sát bảo vệ mục tiêu về tuần tra, vũ trang canh gác bảo vệ an toàn các mục tiêu trên địa bàn thành phố Cần Thơ tháng 07/2026.",
  "      Căn cứ chức năng nhiệm vụ được giao, mục tiêu Đoàn đại biểu Quốc hội và Hội đồng nhân dân thành phố (Đoàn ĐBQH và HĐND) xây dựng kế hoạch tuần tra, vũ trang canh gác bảo vệ an toàn mục tiêu tháng 07 năm 2026 cụ thể như sau:",
  "      I. Mục đích, yêu cầu",
  "      1. Chủ động nắm tình hình an ninh trật tự có liên quan đến mục tiêu bảo vệ, chủ động phòng ngừa, ngăn chặn, xử lý kịp thời các hành vi vi phạm an ninh trật tự xung quanh khu vực mục tiêu Đoàn ĐBQH và HĐND thành phố Cần Thơ đảm bảo tuyệt đối an toàn mục tiêu được bảo vệ.",
  "      2. Lực lượng tuần tra phải phối hợp chặt chẽ với lực lượng canh gác bảo vệ mục tiêu, đặc biệt chú trọng những điểm xung yếu, những vị trí khuất tầm quan sát của người gác tại vọng gác. Kịp thời phát hiện, ngăn chặn những hành vi đột nhập vào mục tiêu và các hành vi khác gây nguy hại cho mục tiêu cần bảo vệ, hỗ trợ đắc lực cho cán bộ, chiến sĩ làm nhiệm vụ vũ trang canh gác bảo vệ mục tiêu, đảm bảo chủ động, sẳn sàng giải quyết tốt các tình huống xảy ra tại mục tiêu bảo vệ.",
  "      3. Tuân thủ các quy định của pháp luật, quy trình, quy định của ngành, không tùy tiện thực hiện các biện pháp có thể gây thiệt hại về người, tài sản; nắm vững chức năng, nhiệm vụ, quyền hạn của Cảnh sát bảo vệ mục tiêu để xử lý các tình huống, các hành vi vi phạm pháp luật theo đúng quy định trong quá trình tuần tra.",
  "      4. Đảm bảo tuyệt đối an toàn về người, vũ khí, phương tiện trong quá trình tuần tra.",
  "II. Thời gian, phương tiện và lực lượng tham gia:",
  "1. Thời gian: Tổ chức tuần tra, vũ trang canh gác bảo vệ xung quanh bên trong và bên ngoài mục tiêu Đoàn ĐBQH và HĐND thành phố Cần Thơ (số 01 đường Quang Trung, KV6, phường Ninh Kiều, thành phố Cần Thơ) từ ngày 01/07/2026 đến ngày 31/07/2026 (có lịch trực kèm theo).",
  "2. Phạm vi tuần tra, vũ trang canh gác bảo vệ mục tiêu:",
  "- Tuần tra trên các tuyến đường nội bộ bên trong cơ quan; trên vĩa hè cơ quan theo tuyến đường Quang Trung; phía tiếp giáp hội trường 500 mục tiêu Thành ủy thành phố Cần Thơ.",
  "III. Nhiệm vụ, biện pháp, phương pháp thực hiện:",
  "      1. Nhiệm vụ",
  "- Chủ động nắm tình hình an ninh trật tự xung quanh mục tiêu Đoàn ĐBQH và HĐND, kịp thời phát hiện các hành vi vi phạm pháp luật để có biện pháp xử lý kịp thời.",
  "      - Tổ chức phát hiện, ngăn chặn kịp thời những người có hành vi phạm tội như: Phá hoại, trộm cắp tài sản, gây rối, tụ tập làm mất an ninh trật tự ở khu vực mục tiêu.",
  "      - Kiểm tra, đôn đốc, nhắc nhỡ CBCS gác nếu phát hiện thấy những thiếu sót, đồng thời hỗ trợ cho CBCS gác khi có tình huống đột xuất xảy ra.",
  "      - Tổ chức phục kích, bắt giữ đối tượng có hành vi pham tội, sẵn sàng chiến đấu chống các hoạt động vũ trang tập kích phá hoại mục tiêu.",
  "      - Tuần tra, vũ trang canh gác bảo vệ mục phải quán xuyến được mọi diễn biến trong khu vực phạm vi tuần tra. Tập trung quan sát nghe ngóng những nơi trọng điểm bảo vệ, những nơi kẻ gian có thể ẩn nấp, phát hiện những người, hiện tượng nghi vấn để tiếp tục theo dõi.",
  "      - Khi tuần tra ban đêm phải lợi dụng địa hình, địa vật, tùy theo thời tiết, ánh sáng để áp dụng tuần tra cho thích hợp, tránh tuần tra theo quy luật, đi thành hàng nối nhau quá gần hoặc cách quá xa nhau, quá phạm quy quan sát. Khi đi qua những nơi khúc khuỷu, góc khuất phải ở tư thế sắn sàng chiến đấu.",
  "      - Kết thúc tuần tra bảo vệ, tiến hành bàn giao, trao đổi mọi diễn biến tình hình trong ca tuần tra với CBCS đang vũ trang canh gác về tình hình ANTT và những vấn đề cần chú ý để tiếp tục quan sát bảo vệ an toàn mục tiêu.",
  "2. Biện pháp, phương pháp thực hiện",
  "      - Tuần tra, vũ trang canh gác bảo vệ mục tiêu, công khai; khi tuần tra cần chú ý đảm bảo cự ly, khoảng cách phù hợp với từng nhiệm vụ, địa bàn mục tiêu, khu vực tổ chức tuần tra nhằm phát huy hiệu quả cao nhất trong phòng ngừa, đấu tranh trấn áp các loại tội phạm.",
  "- Đội hình tuần tra: Đội hình tuần tra đi theo hàng dọc, hàng ngang, zích zắc, đội hình chữ A, chữ Z… tùy theo nhiệm vụ, vị trí, tuyến đường và địa bàn tuần tra đồng chí tổ trưởng có nhiệm vụ phân công nhiệm vụ cụ thể cho từng đồng chí và bố trí đội hình tuần tra sao cho phù hợp với yêu cầu nhiệm vụ và tình hình thực tế tại khu vực tuần tra.",
  "      - Trên đường tuần tra nếu phát hiện người, hiện tượng, sự việc phạm pháp hoặc nghi vấn thì tổ trưởng phân công CBCS cảnh giới, quan sát và xử lý; tùy theo tình hình diễn biến của vụ việc tổ trưởng tổ tuần tra đề ra biện pháp giải quyết phù hợp. Những trường hợp có tính chất mực độ nghiêm trọng phải báo cáo Ban Lãnh đạo phòng để có biện pháp xử lý.",
  "IV. Công tác chỉ đạo, phân công nhiệm vụ và phối hợp giữa các lực lượng.",
  "1.Công tác chỉ đạo",
  "- Cán bộ chiến sĩ thực hiện nhiệm vụ phải nêu cao tinh thần trách nhiệm, đề cao cảnh giác, không được chủ quan, lơ là trước mọi tình huống.",
  "- Trong quá trình tuần tra kiểm soát phải tuân thủ theo Thông tư 62/2025/TT-BCA ngày 11/07/2025 của Bộ Công an quy định về hoạt động vũ trang canh gác bảo vệ mục tiêu của Cảnh sát cơ động; các quy định khác của pháp luật có liên quan và Điều lệnh Công an nhân dân; thực hiện đúng kế hoạch, phương án, lịch tuần tra.",
  "2. Phân công nhiệm vụ",
  "- Cán bộ phụ trách mục tiêu Đoàn ĐBQH và HĐND thành phố xây dựng kế hoạch, lịch tuần tra, vũ trang canh gác bảo vệ an toàn mục tiêu.",
  "- Chủ động phối hợp với đơn vị chủ quản và Công an địa phương để kịp thời giải quyết các tình huống đột xuất.",
  "3. Công tác đảm bảo",
  "- Thông tin liên lạc: Sử dụng máy bộ đàm hoặc sử dụng điện thoại di động để kịp thời báo cáo các trường hợp đột xuất.",
  "- Vũ khí, CCHT, trang bị, phương tiện:",
  "+ Cán bộ phân công phụ trách mục tiêu trang bị đầy đủ CCHT để phục vụ công tác tuần tra như: dùi cui, khóa số 8, bộ đàm, đèn pin,…phục vụ công tác tuần tra.",
  "+ Phương tiện: Tuần tra đi bộ.",
  "V. Giả định và xử lý tình huống",
  "1. Tình huống: Khi tuần tra phát hiện cháy, nổ xảy ra tại mục tiêu (không loại trừ khả năng bị các đối tượng phá hoại).",
  "* Biện pháp giải quyết:",
  "- Báo cáo đốc gác, mục tiêu trưởng biết.",
  "- Trường hợp nhân viên cơ quan chủ quản thông báo mức độ vụ cháy, nổ là không nghiêm trọng, mục tiêu đảm bảo an toàn thì tổ tuần tra tăng cường quan sát xung quanh mục tiêu.",
  "- Trường hợp vụ cháy, nổ có mức độ nghiêm trọng.",
  "- Nhanh chóng hướng dẫn nhân viên Cơ quan chủ quản sơ tán tài liệu, tài sản đến vị trí an toàn.",
  "- Hướng dẫn xe cứu hỏa vào chữa cháy.",
  "- Tăng cường quan sát, kịp thời phát hiện, ngăn chặn các đối tượng lợi dụng tình hình mục tiêu trộm cắp, phá hoại.",
  "2. Tình huống: Phát hiện tờ rơi, truyền đơn, băng rôn có nội dung chống phá chính quyền, nói xấu cán bộ, lãnh đạo.",
  "* Biện pháp giải quyết:",
  "- Khi phát hiện có tờ rơi, truyền đơn, có nội dung phản động chống phá nhà nước, nói xấu cán bộ lãnh đạo, tổ tuần tra báo ngay cho chỉ huy mục tiêu, đồng thời thu gom không để tài liệu phát tán ra bên ngoài.",
  "- Kiên quyết ngăn không cho những người không có trách nhiệm đi vào khu vực có tờ rơi truyền đơn.",
  "3. Trường hợp đối tượng đột nhập mục tiêu trộm cắp, phá hoại",
  "* Biện pháp giải quyết:",
  "Trường hợp phát hiện đối tượng đang có hành vi đột nhập mục tiêu, tổ tuần tra phải nhanh chóng nhận diện đặc điểm của đối tượng, báo cáo chỉ huy mục tiêu, đồng thời sử dụng công cụ hỗ trợ, kỹ thuật chiến đấu không chế, bắt giữ đối tượng. Nếu không khống chế, bắt giữ được đối tượng thì phải nắm được hướng chạy thoát của đội tượng để phục vụ công tác truy xét và giải quyết của các lực lượng có liên quan.",
  "VI. Tổ chức thực hiện",
  "Căn cứ kế hoạch này giao các đồng chí cán bộ phụ trách mục tiêu Đoàn ĐBQH và HĐND thành phố Cần Thơ tổ chức triển khai cho cán bộ, chiến sĩ tham gia thực hiện một cách nghiêm túc hiệu quả. Trong quá trình thực hiện có khó khăn vướng mắc báo cáo Ban chỉ huy Đội Cảnh sát bảo vệ mục tiêu kịp thời giải quyết.",
  "Trên đây là kế hoạch tuần tra, vũ trang canh gác bảo vệ an toàn mục tiêu Đoàn ĐBQH và HĐND thành phố Cần Thơ tháng 07 năm 2026./.",
];

export const KHTTS_SIGNATURE_ROWS = [
  ["   CHỈ HUY ĐỘI", "  CÁN BỘ LẬP KẾ HOẠCH"],
];

export function updateKhttsText(
  text: string,
  date: DocumentDate,
): string {
  const month = String(date.month).padStart(2, "0");
  const lastDay = getMonthDayCount(date.month, date.year);

  return text
    .replace(
      "Cần Thơ, ngày tháng 06 năm 2026",
      `Cần Thơ, ngày ${date.day} tháng ${date.month} năm ${date.year}`,
    )
    .replaceAll(
      "ngày 01 tháng 07 năm 2026",
      `ngày 01 tháng ${date.month} năm ${date.year}`,
    )
    .replaceAll("tháng 07/2026", `tháng ${month}/${date.year}`)
    .replaceAll(
      "tháng 07 năm 2026",
      `tháng ${date.month} năm ${date.year}`,
    )
    .replaceAll("01/07/2026", `01/${month}/${date.year}`)
    .replaceAll("31/07/2026", `${lastDay}/${month}/${date.year}`);
}

export function getKhttsPreviewBlocks(
  date: DocumentDate,
): DocxPreviewBlock[] {
  const headerRows = KHTTS_HEADER_ROWS.map((row) =>
    row.map((cell) => updateKhttsText(cell, date)),
  );

  return [
    { type: "table", rows: headerRows, bordered: false },
    ...KHTTS_BODY_TEXT.map((text) => {
      const updatedText = updateKhttsText(text, date);
      const isHeading =
        /^[IVX]+\./.test(updatedText.trim()) ||
        /^\* Biện pháp/.test(updatedText.trim());

      return {
        type: "paragraph" as const,
        text: updatedText,
        alignment: "justify" as const,
        bold: isHeading,
      };
    }),
    {
      type: "table",
      rows: KHTTS_SIGNATURE_ROWS,
      bordered: false,
    },
  ];
}
