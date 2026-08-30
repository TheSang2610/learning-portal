// Sử dụng đường dẫn alias tuyệt đối để không bao giờ sợ lỗi Module not found khi di chuyển file
import "@/app/globals.css"; 
import InstructorPanelLayout from "@/app/(instructor)/instructor/page"; 


export default function InstructorRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="antialiased bg-slate-100 text-slate-900">
        {/* LỒNG SIDEBAR VÀO ĐÂY: Toàn bộ các trang con (bao gồm AllCoursesPage) sẽ được hiển thị tại vị trí {children} bên trong Panel */}
        <InstructorPanelLayout>
          {children}
        </InstructorPanelLayout>
      </body>
    </html>
  );
}