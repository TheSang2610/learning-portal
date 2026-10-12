import type { LegalHeaderData, TermsContentData } from "@/src/types/legal";

/** Noi dung trang /terms (Dieu khoan dich vu). */
const header: LegalHeaderData = {
  badge: "Pháp lý & Quy định",
  title: "Điều khoản dịch vụ",
  updated: "Cập nhật lần cuối: Ngày 01 tháng 01 năm 2026",
};

const content: TermsContentData = {
  intro: [
    "Chào mừng bạn đến với ",
    { strong: "LearningPortal" },
    ". Bằng cách đăng ký tài khoản và sử dụng dịch vụ của chúng tôi, bạn đã đồng ý tuân thủ và chịu sự ràng buộc bởi các điều khoản và điều kiện dưới đây. Vui lòng đọc kỹ trước khi bắt đầu.",
  ],
  sections: [
    {
      title: "Tài khoản người dùng",
      body: [
        "Khi tạo tài khoản, bạn phải cung cấp thông tin chính xác, đầy đủ và luôn cập nhật. Bạn chịu trách nhiệm hoàn toàn về việc bảo mật mật khẩu và mọi hoạt động diễn ra dưới tài khoản của mình. Nếu phát hiện bất kỳ dấu hiệu truy cập trái phép nào, vui lòng báo cáo ngay cho ban quản trị.",
      ],
    },
    {
      title: "Quyền sở hữu trí tuệ",
      body: [
        "Toàn bộ nội dung khóa học, video, tài liệu giảng dạy, mã nguồn, logo và giao diện trên hệ thống thuộc sở hữu độc quyền của LearningPortal hoặc các bên đối tác liên kết. Bạn ",
        { strong: "không được phép" },
        " sao chép, phân phối, thương mại hóa hoặc chia sẻ tài khoản cho người khác sử dụng chung dưới mọi hình thức.",
      ],
    },
    {
      title: "Chính sách hoàn tiền",
      body: [
        "Đối với các khóa học trả phí, chúng tôi hỗ trợ chính sách hoàn tiền trong vòng ",
        { strong: "7 ngày" },
        " kể từ ngày thanh toán với điều kiện tiến độ học tập của bạn chưa vượt quá 20% tổng thời lượng khóa học. Quyết định cuối cùng thuộc về ban quản lý LearningPortal.",
      ],
    },
  ],
  warning: {
    title: "Trách nhiệm và Giới hạn",
    body: "LearningPortal liên tục nỗ lực cung cấp dịch vụ tốt nhất nhưng không đảm bảo rằng hệ thống sẽ hoàn toàn không có lỗi kỹ thuật gián đoạn. Chúng tôi có quyền tạm ngừng dịch vụ để bảo trì hoặc cập nhật hệ thống định kỳ.",
  },
};

export const TERMS_PAGE = { header, content };
