"use client";

import { useState } from "react";
import { HelpCircle, Search, Mail, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "Làm cách nào để tôi nhận được chứng chỉ sau khi hoàn thành khóa học?",
      a: "Sau khi bạn hoàn thành toàn bộ 100% các bài học video và đạt điểm tối thiểu ở bài thi cuối khóa (nếu có), hệ thống sẽ hiển thị một nút 'Nhận chứng chỉ' ở giao diện bài học. Bạn chỉ cần nhấn vào để mở modal chứng chỉ và tải file PDF về máy."
    },
    {
      q: "Tôi có thể đổi thông tin Họ và tên hiển thị trên chứng chỉ không?",
      a: "Có. Hệ thống hỗ trợ lấy tên thực từ trang cá nhân của bạn. Bạn hãy truy cập vào trang Profile cá nhân, chọn 'Chỉnh sửa hồ sơ' để cập nhật Họ và Tên chính xác, sau đó quay lại mở lại modal chứng chỉ để nhận tên mới."
    },
    {
      q: "Hệ thống hỗ trợ những phương thức thanh toán nào?",
      a: "Chúng tôi hỗ trợ đa dạng phương thức thanh toán bao gồm: Chuyển khoản ngân hàng qua mã QR (với nội dung tự động mã hóa), ví điện tử MoMo, hoặc thẻ tín dụng quốc tế thông qua cổng thanh toán bảo mật."
    },
    {
      q: "Tài khoản của tôi bị lỗi không xem được video bài học thì làm thế nào?",
      a: "Đầu tiên hãy kiểm tra lại kết nối mạng của bạn hoặc thử tải lại trang (F5). Nếu lỗi vẫn tiếp tục tiếp diễn, vui lòng xóa cache trình duyệt hoặc nhấn vào mục liên hệ hỗ trợ trực tiếp bên dưới để các kỹ thuật viên kiểm tra lỗi."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Banner Tìm kiếm */}
        <div className="bg-blue-600 rounded-3xl p-8 md:p-12 text-center text-white space-y-4 shadow-md">
          <div className="flex justify-center">
            <HelpCircle size={48} className="text-blue-200" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Trung tâm trợ giúp LearningPortal</h1>
          <p className="text-blue-100 max-w-xl mx-auto text-sm md:text-base">
            Tìm kiếm giải pháp nhanh cho các câu hỏi thường gặp hoặc kết nối trực tiếp với đội ngũ chăm sóc học viên.
          </p>
        </div>

        {/* Khối FAQs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Câu hỏi thường gặp</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="border border-slate-100 rounded-xl transition-all bg-slate-50/50"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left font-semibold text-slate-700 hover:text-blue-600 transition"
                >
                  <span className="text-sm md:text-base">{faq.q}</span>
                  {openFaq === index ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {openFaq === index && (
                  <div className="px-4 pb-4 text-slate-500 text-sm border-t border-slate-100/60 pt-3 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Khối Liên hệ Hỗ trợ */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Mail size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Gửi Email hỗ trợ</h3>
              <p className="text-slate-500 text-xs mt-1">Phản hồi trong vòng 24 giờ làm việc.</p>
              <a href="mailto:support@learningportal.com" className="text-sm font-semibold text-blue-600 mt-2 block hover:underline">
                support@learningportal.com
              </a>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
            <div className="p-3 bg-purple-50 text-blue-600 rounded-xl">
              <MessageSquare size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Hotline kỹ thuật</h3>
              <p className="text-slate-500 text-xs mt-1">Hỗ trợ khẩn cấp từ 8:00 đến 22:00 hằng ngày.</p>
              <span className="text-sm font-semibold text-blue-600 mt-2 block">
                1900 xxxx (Miễn phí)
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}