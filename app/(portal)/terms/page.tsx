"use client";

import { AlertTriangle } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-100 bg-white p-8 shadow-sm md:p-12">
        {/* Header */}
        <div className="mb-8 border-b border-slate-100 pb-6 text-center md:text-left">
          <div className="mb-2 flex items-center justify-center gap-3 text-blue-600 md:justify-start">
            <span className="text-xs font-bold tracking-wider uppercase">
              Pháp lý & Quy định
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Điều khoản dịch vụ</h1>
          <p className="mt-2 text-sm text-slate-500">
            Cập nhật lần cuối: Ngày 01 tháng 01 năm 2026
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-sm leading-relaxed text-slate-600 md:text-base">
          <p>
            Chào mừng bạn đến với <strong>LearningPortal</strong>. Bằng cách đăng ký tài
            khoản và sử dụng dịch vụ của chúng tôi, bạn đã đồng ý tuân thủ và chịu sự ràng
            buộc bởi các điều khoản và điều kiện dưới đây. Vui lòng đọc kỹ trước khi bắt
            đầu.
          </p>

          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-800">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-xs font-bold text-blue-600">
                1
              </span>
              Tài khoản người dùng
            </h2>
            <p>
              Khi tạo tài khoản, bạn phải cung cấp thông tin chính xác, đầy đủ và luôn cập
              nhật. Bạn chịu trách nhiệm hoàn toàn về việc bảo mật mật khẩu và mọi hoạt
              động diễn ra dưới tài khoản của mình. Nếu phát hiện bất kỳ dấu hiệu truy cập
              trái phép nào, vui lòng báo cáo ngay cho ban quản trị.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-800">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-xs font-bold text-blue-600">
                2
              </span>
              Quyền sở hữu trí tuệ
            </h2>
            <p>
              Toàn bộ nội dung khóa học, video, tài liệu giảng dạy, mã nguồn, logo và giao
              diện trên hệ thống thuộc sở hữu độc quyền của LearningPortal hoặc các bên
              đối tác liên kết. Bạn <strong>không được phép</strong> sao chép, phân phối,
              thương mại hóa hoặc chia sẻ tài khoản cho người khác sử dụng chung dưới mọi
              hình thức.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-800">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-xs font-bold text-blue-600">
                3
              </span>
              Chính sách hoàn tiền
            </h2>
            <p>
              Đối với các khóa học trả phí, chúng tôi hỗ trợ chính sách hoàn tiền trong
              vòng <strong>7 ngày</strong> kể từ ngày thanh toán với điều kiện tiến độ học
              tập của bạn chưa vượt quá 20% tổng thời lượng khóa học. Quyết định cuối cùng
              thuộc về ban quản lý LearningPortal.
            </p>
          </section>

          <section className="space-y-3 rounded-xl border border-amber-100 bg-amber-50/50 p-4">
            <h2 className="flex items-center gap-2 text-base font-bold text-amber-800">
              <AlertTriangle size={18} />
              Trách nhiệm và Giới hạn
            </h2>
            <p className="mt-1 text-xs text-amber-900/80 md:text-sm">
              LearningPortal liên tục nỗ lực cung cấp dịch vụ tốt nhất nhưng không đảm bảo
              rằng hệ thống sẽ hoàn toàn không có lỗi kỹ thuật gián đoạn. Chúng tôi có
              quyền tạm ngừng dịch vụ để bảo trì hoặc cập nhật hệ thống định kỳ.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
