import "../globals.css";
import NapNguoiDung from "@/src/components/common/NapNguoiDung";
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="antialiased">
        <NapNguoiDung />
        {children}
      </body>
    </html>
  );
}
