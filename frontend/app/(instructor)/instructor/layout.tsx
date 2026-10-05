// Sử dụng đường dẫn alias tuyệt đối để không bao giờ sợ lỗi Module not found khi di chuyển file
import "@/app/globals.css";
// Khung (sidebar + breadcrumb) nam o component rieng. Truoc day no CHINH LA
// file page.tsx cua /instructor, nen mo /instructor thi layout boc khung quanh
// chinh no lan nua: hai sidebar long nhau va phan noi dung trong tron.
import InstructorPanelLayout from "@/src/components/instructor/InstructorPanel";
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
