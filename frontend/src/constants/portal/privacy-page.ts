import { EyeOff, Lock, Server } from "lucide-react";

import type { LegalHeaderData, PrivacyContentData } from "@/src/types/legal";

/** Noi dung trang /privacy (Chinh sach bao mat). */
const header: LegalHeaderData = {
  badge: "An toàn thông tin",
  title: "Chính sách bảo mật",
  updated: "Cập nhật lần cuối: Ngày 01 tháng 01 năm 2026",
};

const content: PrivacyContentData = {
  intro: [
    "Sự riêng tư của bạn là ưu tiên tuyệt đối tại ",
    { strong: "LearningPortal" },
    ". Tài liệu này mô tả cách thức chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn khi tương tác với nền tảng.",
  ],
  sections: [
    {
      icon: Lock,
      title: "Thông tin thu thập",
      body: [
        "Chúng tôi chỉ thu thập các thông tin cần thiết phục vụ cho việc vận hành tài khoản của bạn, bao gồm:",
      ],
      list: [
        "Thông tin hồ sơ: Họ tên, email, ngày sinh, số điện thoại hoặc ảnh đại diện do bạn cung cấp.",
        "Thông tin liên kết bên thứ ba: Ảnh đại diện và email nếu đăng nhập qua Google Auth.",
        "Dữ liệu học tập: Tiến độ bài học, kết quả bài thi thử và lịch sử cấp chứng chỉ.",
      ],
    },
    {
      icon: Server,
      title: "Cách thức sử dụng dữ liệu",
      body: ["Dữ liệu của bạn được dùng cho mục đích cụ thể:"],
      list: [
        "Cá nhân hóa trải nghiệm lộ trình và hiển thị thông tin chính xác trên chứng nhận hoàn thành.",
        "Gửi thông báo cập nhật hệ thống, biên lai thanh toán khóa học.",
        "Cải thiện chất lượng dịch vụ và bảo mật chống gian lận.",
      ],
    },
    {
      icon: EyeOff,
      title: "Cam kết không chia sẻ dữ liệu",
      body: [
        "LearningPortal ",
        { strong: "tuyệt đối không" },
        " bán, trao đổi hoặc cho bên thứ ba thuê dữ liệu cá nhân của bạn vì mục đích quảng cáo thương mại mà không có sự đồng ý rõ ràng từ phía bạn.",
      ],
    },
  ],
};

export const PRIVACY_PAGE = { header, content };
