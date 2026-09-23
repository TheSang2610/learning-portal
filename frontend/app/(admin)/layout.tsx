import "../globals.css";
import NapNguoiDung from "@/src/components/common/UserBootstrap";

import styles from "./layout.module.scss";
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={styles.box}>
        <NapNguoiDung />
        {children}
      </body>
    </html>
  );
}
