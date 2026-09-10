"use client";

import { ShieldCheck, EyeOff, Lock, Server } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-100 bg-white p-8 shadow-sm md:p-12">
        {/* Header */}
        <div className="mb-8 border-b border-slate-100 pb-6 text-center md:text-left">
          <div className="mb-2 flex items-center justify-center gap-3 text-emerald-600 md:justify-start">
            <ShieldCheck size={28} />
            <span className="text-xs font-bold tracking-wider uppercase">
              An toàn thông tin
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Chính sách bảo mật</h1>
          <p className="mt-2 text-sm text-slate-500">
            Cập nhật lần cuối: Ngày 01 tháng 01 năm 2026
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-sm leading-relaxed text-slate-600 md:text-base">
          <p>
            Sự riêng tư của bạn là ưu tiên tuyệt đối tại <strong>LearningPortal</strong>.
            Tài liệu này mô tả cách thức chúng tôi thu thập, sử dụng và bảo vệ thông tin
            cá nhân của bạn khi tương tác với nền tảng.
          </p>

          <section className="space-y-3">
            <h2 className="flex items-center gap-2.5 text-xl font-bold text-slate-800">
              <Lock size={18} className="text-emerald-600" />
              Thông tin thu thập
            </h2>
            <p>
              Chúng tôi chỉ thu thập các thông tin cần thiết phục vụ cho việc vận hành tài
              khoản của bạn, bao gồm:
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              <li>
                Thông tin hồ sơ: Họ tên, email, ngày sinh, số điện thoại hoặc ảnh đại diện
                do bạn cung cấp.
              </li>
              <li>
                Thông tin liên kết bên thứ ba: Ảnh đại diện và email nếu đăng nhập qua
                Google Auth.
              </li>
              <li>
                Dữ liệu học tập: Tiến độ bài học, kết quả bài thi thử và lịch sử cấp chứng
                chỉ.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="flex items-center gap-2.5 text-xl font-bold text-slate-800">
              <Server size={18} className="text-emerald-600" />
              Cách thức sử dụng dữ liệu
            </h2>
            <p>Dữ liệu của bạn được dùng cho mục đích cụ thể:</p>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              <li>
                Cá nhân hóa trải nghiệm lộ trình và hiển thị thông tin chính xác trên
                chứng nhận hoàn thành.
              </li>
              <li>Gửi thông báo cập nhật hệ thống, biên lai thanh toán khóa học.</li>
              <li>Cải thiện chất lượng dịch vụ và bảo mật chống gian lận.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="flex items-center gap-2.5 text-xl font-bold text-slate-800">
              <EyeOff size={18} className="text-emerald-600" />
              Cam kết không chia sẻ dữ liệu
            </h2>
            <p>
              LearningPortal <strong>tuyệt đối không</strong> bán, trao đổi hoặc cho bên
              thứ ba thuê dữ liệu cá nhân của bạn vì mục đích quảng cáo thương mại mà
              không có sự đồng ý rõ ràng từ phía bạn.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
