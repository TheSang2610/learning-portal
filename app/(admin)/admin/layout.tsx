"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  LayoutDashboard,
  Users,
  BookOpen,
  FolderOpen,
  Video,
  ChevronDown,
  LogOut,
  Shield,
} from "lucide-react";

// Thêm Lessons vào cấu trúc dữ liệu Menu dưới dạng mục con của Courses Management
const menuItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Courses Management",
    href: "/admin/courses",
    icon: BookOpen,
    submenu: [
      {
        label: "All Courses",
        href: "/admin/courses",
        icon: BookOpen,
      },
      {
        label: "Categories",
        href: "/admin/categories",
        icon: FolderOpen,
      },
      {
        label: "Lesson Content",
        href: "", // Để trống hoặc không bấm được trực tiếp vì bài học phải chọn từ khóa học
        icon: Video,
        isIndicatorOnly: true, // Đánh dấu đây là mục dùng để hiển thị trạng thái active
      },
    ],
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState("");
  const [isCourseMenuOpen, setIsCourseMenuOpen] = useState(true);

  // Tự động mở rộng và giữ menu Courses luôn mở nếu đang truy cập vào courses, categories, hoặc lessons
  useEffect(() => {
    if (
      pathname.startsWith("/admin/courses") || 
      pathname.startsWith("/admin/categories") || 
      pathname.startsWith("/admin/lessons")
    ) {
      setIsCourseMenuOpen(true);
    }
  }, [pathname]);

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");

    if (!userInfo) {
      router.push("/");
      return;
    }

    try {
      const user = JSON.parse(userInfo);
      if (user.role !== "admin") {
        router.push("/");
        return;
      }
      setAdminName(user.name);
    } catch (e) {
      console.error(e);
      router.push("/");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-lg font-semibold text-slate-600 bg-slate-50">
        Loading Admin Panel...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900 antialiased">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen">

        {/* LOGO */}
        <div className="px-6 py-6 border-b border-slate-100">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2.5 rounded-xl shadow-md shadow-blue-200">
              <Shield size={22} />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-slate-800">LMS Admin</h1>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Management</p>
            </div>
          </Link>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Core Features</p>
          
          {menuItems.map((item) => {
            const Icon = item.icon;
            
            // Xử lý cụm Menu lồng nhau (Courses Management)
            if (item.submenu) {
              const isSubmenuActive = 
                pathname.startsWith("/admin/courses") || 
                pathname.startsWith("/admin/categories") ||
                pathname.startsWith("/admin/lessons");
              
              return (
                <div key={item.label} className="space-y-1">
                  <button
                    onClick={() => setIsCourseMenuOpen(!isCourseMenuOpen)}
                    className={`w-full flex items-center justify-between rounded-2xl px-4 py-3.5 transition-all ${
                      isSubmenuActive 
                        ? "bg-slate-100 text-slate-900 font-semibold" 
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={20} className="text-slate-500" />
                      <span className="text-[15px]">{item.label}</span>
                    </div>
                    <ChevronDown 
                      size={18} 
                      className={`text-slate-400 transition-transform duration-200 ${isCourseMenuOpen ? "rotate-180" : ""}`} 
                    />
                  </button>

                  {/* Danh sách các mục con thả xuống */}
                  {isCourseMenuOpen && (
                    <div className="pl-6 space-y-1">
                      {item.submenu.map((subItem) => {
                        const SubIcon = subItem.icon;
                        
                        // Định nghĩa logic Active riêng biệt cho từng mục con
                        let isChildActive = false;
                        if (subItem.href === "/admin/categories") {
                          isChildActive = pathname.startsWith("/admin/categories");
                        } else if (subItem.isIndicatorOnly) {
                          isChildActive = pathname.startsWith("/admin/lessons");
                        } else {
                          // Mục All Courses
                          isChildActive = pathname.startsWith("/admin/courses");
                        }

                        // Nếu là mục Lesson Content, chỉ hiển thị khi Admin thực sự đang xem/sửa 1 bài học nào đó
                        if (subItem.isIndicatorOnly && !isChildActive) {
                          return null; 
                        }

                        // Nếu là mục hiển thị trạng thái (Lessons), render thẻ div thay vì thẻ Link để tránh bấm nhầm
                        if (subItem.isIndicatorOnly) {
                          return (
                            <div
                              key="lesson-indicator"
                              className="flex items-center gap-3 rounded-xl px-4 py-3 bg-blue-50 text-blue-600 font-semibold border border-blue-100"
                            >
                              <SubIcon size={18} />
                              <span className="text-[14px]">{subItem.label} (Editing)</span>
                            </div>
                          );
                        }

                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                              isChildActive
                                ? "bg-blue-600 text-white font-medium shadow-md shadow-blue-600/10"
                                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                            }`}
                          >
                            <SubIcon size={18} />
                            <span className="text-[14px]">{subItem.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Mục đơn lẻ (Dashboard, Users)
            const isMainActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all ${
                  isMainActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/10 font-semibold"
                    : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"
                }`}
              >
                <Icon size={20} className={isMainActive ? "text-white" : "text-slate-400"} />
                <span className="text-[15px]">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* ADMIN FOOTER */}
        <div className="border-t border-slate-100 p-4 bg-slate-50/50">
          <div className="mb-4 px-2">
            <p className="font-bold text-slate-800 truncate">{adminName || "Administrator"}</p>
            <p className="text-xs font-medium text-slate-400">Super Admin Role</p>
          </div>
          <button
            onClick={logoutHandler}
            className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-red-500 hover:bg-red-50 font-medium transition-all"
          >
            <LogOut size={20} />
            Logout Account
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800">System Console</h2>
            <p className="text-xs text-slate-400 mt-0.5">Overviewing platform behaviors and curriculum architectures.</p>
          </div>
        </header>

        <div className="p-8 flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}