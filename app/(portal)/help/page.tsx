"use client";

import { useState } from "react";
import { HelpCircle, Mail, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";

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
    <div className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Banner Tìm kiếm */}
        <div className="space-y-4 rounded-3xl bg-blue-600 p-8 text-center text-white shadow-md md:p-12">
          <div className="flex justify-center">
            <HelpCircle size={48} className="text-blue-200" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Trung tâm trợ giúp LearningPortal
          </h1>
          <p className="mx-auto max-w-xl text-sm text-blue-100 md:text-base">
            Tìm kiếm giải pháp nhanh cho các câu hỏi thường gặp hoặc kết nối trực tiếp với
            đội ngũ chăm sóc học viên.
          </p>
        </div>

        {/* Khối FAQs */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
          <h2 className="mb-6 text-xl font-bold text-slate-800">Câu hỏi thường gặp</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-100 bg-slate-50/50 transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex w-full items-center justify-between p-4 text-left font-semibold text-slate-700 transition hover:text-blue-600"
                >
                  <span className="text-sm md:text-base">{faq.q}</span>
                  {openFaq === index ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </button>
                {openFaq === index && (
                  <div className="border-t border-slate-100/60 px-4 pt-3 pb-4 text-sm leading-relaxed text-slate-500">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Khối Liên hệ Hỗ trợ */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <Mail size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Gửi Email hỗ trợ</h3>
              <p className="mt-1 text-xs text-slate-500">
                Phản hồi trong vòng 24 giờ làm việc.
              </p>
              <a
                href="mailto:support@learningportal.com"
                className="mt-2 block text-sm font-semibold text-blue-600 hover:underline"
              >
                support@learningportal.com
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="rounded-xl bg-purple-50 p-3 text-blue-600">
              <MessageSquare size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Hotline kỹ thuật</h3>
              <p className="mt-1 text-xs text-slate-500">
                Hỗ trợ khẩn cấp từ 8:00 đến 22:00 hằng ngày.
              </p>
              <span className="mt-2 block text-sm font-semibold text-blue-600">
                1900 xxxx (Miễn phí)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
