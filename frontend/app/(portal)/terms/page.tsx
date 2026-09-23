"use client";

import { AlertTriangle } from "lucide-react";

import styles from "./page.module.scss";
export default function TermsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.box}>
          <div className={styles.row}>
            <span className={styles.label}>Pháp lý & Quy định</span>
          </div>
          <h1 className={styles.title}>Điều khoản dịch vụ</h1>
          <p className={styles.text}>Cập nhật lần cuối: Ngày 01 tháng 01 năm 2026</p>
        </div>

        {/* Content */}
        <div className={styles.stack}>
          <p>
            Chào mừng bạn đến với <strong>LearningPortal</strong>. Bằng cách đăng ký tài
            khoản và sử dụng dịch vụ của chúng tôi, bạn đã đồng ý tuân thủ và chịu sự ràng
            buộc bởi các điều khoản và điều kiện dưới đây. Vui lòng đọc kỹ trước khi bắt
            đầu.
          </p>

          <section className={styles.section}>
            <h2 className={styles.heading}>
              <span className={styles.row2}>1</span>
              Tài khoản người dùng
            </h2>
            <p>
              Khi tạo tài khoản, bạn phải cung cấp thông tin chính xác, đầy đủ và luôn cập
              nhật. Bạn chịu trách nhiệm hoàn toàn về việc bảo mật mật khẩu và mọi hoạt
              động diễn ra dưới tài khoản của mình. Nếu phát hiện bất kỳ dấu hiệu truy cập
              trái phép nào, vui lòng báo cáo ngay cho ban quản trị.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>
              <span className={styles.row2}>2</span>
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

          <section className={styles.section}>
            <h2 className={styles.heading}>
              <span className={styles.row2}>3</span>
              Chính sách hoàn tiền
            </h2>
            <p>
              Đối với các khóa học trả phí, chúng tôi hỗ trợ chính sách hoàn tiền trong
              vòng <strong>7 ngày</strong> kể từ ngày thanh toán với điều kiện tiến độ học
              tập của bạn chưa vượt quá 20% tổng thời lượng khóa học. Quyết định cuối cùng
              thuộc về ban quản lý LearningPortal.
            </p>
          </section>

          <section className={styles.section2}>
            <h2 className={styles.heading2}>
              <AlertTriangle size={18} />
              Trách nhiệm và Giới hạn
            </h2>
            <p className={styles.text2}>
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
