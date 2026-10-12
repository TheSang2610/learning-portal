import type { HelpContactData, HelpFaqData, HelpHeroData } from "@/src/types/help";

const hero: HelpHeroData = {
  title: "Trung tâm trợ giúp LearningPortal",
  intro:
    "Tìm kiếm giải pháp nhanh cho các câu hỏi thường gặp hoặc kết nối trực tiếp với đội ngũ chăm sóc học viên.",
};

const faq: HelpFaqData = {
  heading: "Câu hỏi thường gặp",
  items: [
    {
      question: "Làm cách nào để tôi nhận được chứng chỉ sau khi hoàn thành khóa học?",
      answer:
        "Sau khi bạn hoàn thành toàn bộ 100% các bài học video và đạt điểm tối thiểu ở bài thi cuối khóa (nếu có), hệ thống sẽ hiển thị một nút 'Nhận chứng chỉ' ở giao diện bài học. Bạn chỉ cần nhấn vào để mở modal chứng chỉ và tải file PDF về máy.",
    },
    {
      question: "Tôi có thể đổi thông tin Họ và tên hiển thị trên chứng chỉ không?",
      answer:
        "Có. Hệ thống hỗ trợ lấy tên thực từ trang cá nhân của bạn. Bạn hãy truy cập vào trang Profile cá nhân, chọn 'Chỉnh sửa hồ sơ' để cập nhật Họ và Tên chính xác, sau đó quay lại mở lại modal chứng chỉ để nhận tên mới.",
    },
    {
      question: "Hệ thống hỗ trợ những phương thức thanh toán nào?",
      answer:
        "Chúng tôi hỗ trợ đa dạng phương thức thanh toán bao gồm: Chuyển khoản ngân hàng qua mã QR (với nội dung tự động mã hóa), ví điện tử MoMo, hoặc thẻ tín dụng quốc tế thông qua cổng thanh toán bảo mật.",
    },
    {
      question: "Tài khoản của tôi bị lỗi không xem được video bài học thì làm thế nào?",
      answer:
        "Đầu tiên hãy kiểm tra lại kết nối mạng của bạn hoặc thử tải lại trang (F5). Nếu lỗi vẫn tiếp tục tiếp diễn, vui lòng xóa cache trình duyệt hoặc nhấn vào mục liên hệ hỗ trợ trực tiếp bên dưới để các kỹ thuật viên kiểm tra lỗi.",
    },
  ],
};

const contact: HelpContactData = {
  email: {
    title: "Gửi Email hỗ trợ",
    text: "Phản hồi trong vòng 24 giờ làm việc.",
    address: "support@learningportal.com",
  },
  hotline: {
    title: "Hotline kỹ thuật",
    text: "Hỗ trợ khẩn cấp từ 8:00 đến 22:00 hằng ngày.",
    number: "1900 xxxx (Miễn phí)",
  },
};

/** Noi dung trang /help (Trung tam tro giup). */
export const HELP_PAGE = { hero, faq, contact };
