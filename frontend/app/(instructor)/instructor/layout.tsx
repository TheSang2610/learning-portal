// Sử dụng đường dẫn alias tuyệt đối để không bao giờ sợ lỗi Module not found khi di chuyển file
import "@/app/globals.css";
import InstructorPanelLayout from "@/app/(instructor)/instructor/page";
import NapNguoiDung from "@/src/components/common/UserBootstrap";

import styles from "./layout.module.scss";
export default function InstructorRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={styles.box}>
        <NapNguoiDung />
        {/* LỒNG SIDEBAR VÀO ĐÂY: Toàn bộ các trang con (bao gồm AllCoursesPage) sẽ được hiển thị tại vị trí {children} bên trong Panel */}
        <InstructorPanelLayout>{children}</InstructorPanelLayout>
      </body>
    </html>
  );
}
