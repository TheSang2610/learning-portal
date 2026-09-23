"use client";

import { useState } from "react";
import { HelpCircle, Mail, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";

import styles from "./page.module.scss";
export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "Làm cách nào để tôi nhận được chứng chỉ sau khi hoàn thành khóa học?",
      a: "Sau khi bạn hoàn thành toàn bộ 100% các bài học video và đạt điểm tối thiểu ở bài thi cuối khóa (nếu có), hệ thống sẽ hiển thị một nút 'Nhận chứng chỉ' ở giao diện bài học. Bạn chỉ cần nhấn vào để mở modal chứng chỉ và tải file PDF về máy.",
    },
    {
      q: "Tôi có thể đổi thông tin Họ và tên hiển thị trên chứng chỉ không?",
      a: "Có. Hệ thống hỗ trợ lấy tên thực từ trang cá nhân của bạn. Bạn hãy truy cập vào trang Profile cá nhân, chọn 'Chỉnh sửa hồ sơ' để cập nhật Họ và Tên chính xác, sau đó quay lại mở lại modal chứng chỉ để nhận tên mới.",
    },
    {
      q: "Hệ thống hỗ trợ những phương thức thanh toán nào?",
      a: "Chúng tôi hỗ trợ đa dạng phương thức thanh toán bao gồm: Chuyển khoản ngân hàng qua mã QR (với nội dung tự động mã hóa), ví điện tử MoMo, hoặc thẻ tín dụng quốc tế thông qua cổng thanh toán bảo mật.",
    },
    {
      q: "Tài khoản của tôi bị lỗi không xem được video bài học thì làm thế nào?",
      a: "Đầu tiên hãy kiểm tra lại kết nối mạng của bạn hoặc thử tải lại trang (F5). Nếu lỗi vẫn tiếp tục tiếp diễn, vui lòng xóa cache trình duyệt hoặc nhấn vào mục liên hệ hỗ trợ trực tiếp bên dưới để các kỹ thuật viên kiểm tra lỗi.",
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Banner Tìm kiếm */}
        <div className={styles.card}>
          <div className={styles.row}>
            <HelpCircle size={48} className={styles.box} />
          </div>
          <h1 className={styles.title}>Trung tâm trợ giúp LearningPortal</h1>
          <p className={styles.text}>
            Tìm kiếm giải pháp nhanh cho các câu hỏi thường gặp hoặc kết nối trực tiếp với
            đội ngũ chăm sóc học viên.
          </p>
        </div>

        {/* Khối FAQs */}
        <div className={styles.card2}>
          <h2 className={styles.heading}>Câu hỏi thường gặp</h2>
          <div className={styles.stack}>
            {faqs.map((faq, index) => (
              <div key={index} className={styles.card3}>
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className={styles.button}
                >
                  <span className={styles.label}>{faq.q}</span>
                  {openFaq === index ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </button>
                {openFaq === index && <div className={styles.box2}>{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Khối Liên hệ Hỗ trợ */}
        <div className={styles.grid}>
          <div className={styles.card4}>
            <div className={styles.box3}>
              <Mail size={24} />
            </div>
            <div>
              <h3 className={styles.subheading}>Gửi Email hỗ trợ</h3>
              <p className={styles.text2}>Phản hồi trong vòng 24 giờ làm việc.</p>
              <a href="mailto:support@learningportal.com" className={styles.link}>
                support@learningportal.com
              </a>
            </div>
          </div>

          <div className={styles.card4}>
            <div className={styles.box4}>
              <MessageSquare size={24} />
            </div>
            <div>
              <h3 className={styles.subheading}>Hotline kỹ thuật</h3>
              <p className={styles.text2}>Hỗ trợ khẩn cấp từ 8:00 đến 22:00 hằng ngày.</p>
              <span className={styles.label2}>1900 xxxx (Miễn phí)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
