"use client";

import { ShieldCheck, EyeOff, Lock, Server } from "lucide-react";

import styles from "./page.module.scss";
export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.box}>
          <div className={styles.row}>
            <ShieldCheck size={28} />
            <span className={styles.label}>An toàn thông tin</span>
          </div>
          <h1 className={styles.title}>Chính sách bảo mật</h1>
          <p className={styles.text}>Cập nhật lần cuối: Ngày 01 tháng 01 năm 2026</p>
        </div>

        {/* Content */}
        <div className={styles.stack}>
          <p>
            Sự riêng tư của bạn là ưu tiên tuyệt đối tại <strong>LearningPortal</strong>.
            Tài liệu này mô tả cách thức chúng tôi thu thập, sử dụng và bảo vệ thông tin
            cá nhân của bạn khi tương tác với nền tảng.
          </p>

          <section className={styles.section}>
            <h2 className={styles.heading}>
              <Lock size={18} className={styles.box2} />
              Thông tin thu thập
            </h2>
            <p>
              Chúng tôi chỉ thu thập các thông tin cần thiết phục vụ cho việc vận hành tài
              khoản của bạn, bao gồm:
            </p>
            <ul className={styles.list}>
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

          <section className={styles.section}>
            <h2 className={styles.heading}>
              <Server size={18} className={styles.box2} />
              Cách thức sử dụng dữ liệu
            </h2>
            <p>Dữ liệu của bạn được dùng cho mục đích cụ thể:</p>
            <ul className={styles.list}>
              <li>
                Cá nhân hóa trải nghiệm lộ trình và hiển thị thông tin chính xác trên
                chứng nhận hoàn thành.
              </li>
              <li>Gửi thông báo cập nhật hệ thống, biên lai thanh toán khóa học.</li>
              <li>Cải thiện chất lượng dịch vụ và bảo mật chống gian lận.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>
              <EyeOff size={18} className={styles.box2} />
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
