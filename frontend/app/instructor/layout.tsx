// Khung (sidebar + breadcrumb) nam o component rieng. Truoc day no CHINH LA
// file page.tsx cua /instructor, nen mo /instructor thi layout boc khung quanh
// chinh no lan nua: hai sidebar long nhau va phan noi dung trong tron.
import UserBootstrap from "@/src/components/common/UserBootstrap";
import { InstructorShell } from "@/src/components/features/instructor/layout";

import styles from "./layout.module.scss";

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  return (
    // Nen + mau chu cua khu giang vien, truoc day dat tren <body>.
    <div className={styles.box}>
      <UserBootstrap />
      {/* LỒNG SIDEBAR VÀO ĐÂY: Toàn bộ các trang con (bao gồm AllCoursesPage) sẽ được hiển thị tại vị trí {children} bên trong Panel */}
      <InstructorShell>{children}</InstructorShell>
    </div>
  );
}
