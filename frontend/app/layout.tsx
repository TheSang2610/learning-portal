import "./globals.css";

import styles from "./layout.module.scss";

// Root layout DUY NHAT cua ca app: chi dung <html>/<body> va nap CSS chung.
//
// Truoc day moi khu (admin, instructor, portal) tu dung <html> rieng trong
// mot nhom route (admin)/(instructor)/(portal), nen cay thu muc thanh
// app/(admin)/admin/... Gio admin va instructor nam thang o app/admin,
// app/instructor; chi portal con nhom (portal) vi no can header/footer rieng
// ma khong them doan nao vao URL.
//
// Phan rieng tung khu (khung, font, hoi "toi la ai") nam trong layout.tsx cua
// khu do.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={styles.box}>{children}</body>
    </html>
  );
}
