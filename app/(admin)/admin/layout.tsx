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
  PlusCircle,
  Building2,
  LayoutGrid,
  Award,  
  Flame,  
  Sparkles, 
  MessageSquare,
  HelpCircle
} from "lucide-react";

interface SubMenuItem {
  label: string;
  href: string;
  icon: any;
  isIndicatorOnly?: boolean; 
}

interface MenuItem {
  label: string;
  href: string;
  icon: any;
  isHomeSectionGroup?: boolean;
  submenu?: SubMenuItem[]; 
}

// Cấu trúc dữ liệu Menu phân tầng hệ thống quản trị
const menuItems: MenuItem[] = [
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
        label: "Create Course",
        href: "/admin/courses/create",
        icon: PlusCircle,
      },
      {
        label: "Categories",
        href: "/admin/categories",
        icon: FolderOpen,
      },
      {
        label: "Providers",
        href: "/admin/providers",
        icon: Building2,
      },
      {
        label: "Lesson Content",
        href: "", 
        icon: Video,
        isIndicatorOnly: true, 
      },
    ],
  },
  /* ==========================================================================
     🎯 CẤU TRÚC MỚI: TÁCH BIỆT VÀ PHÂN TẦNG 3 MỤC QUẢN LÝ TRANG CHỦ
     ========================================================================== */
  {
    label: "Home Sections",
    href: "/admin/courses/home-sections",
    icon: LayoutGrid,
    isHomeSectionGroup: true, // Cờ hiệu phân biệt logic xử lý toggle đóng/mở
    submenu: [
      {
        label: "Most Popular",
        href: "/admin/courses/home-sections/most-popular",
        icon: Award,
      },
      {
        label: "Trending Now",
        href: "/admin/courses/home-sections/trending-now",
        icon: Flame,
      },
      {
        label: "New Releases",
        href: "/admin/courses/home-sections/new-releases",
        icon: Sparkles,
      },
    ],
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Reviews Management",
    href: "/admin/reviews",
    icon: MessageSquare, 
  },
  {
    label: "Homepage FAQs",
    href: "/admin/faqs",
    icon: HelpCircle,
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
  
  // Kiểm soát trạng thái Đóng/Mở riêng biệt cho 2 nhóm Dropdown khác nhau
  const [isCourseMenuOpen, setIsCourseMenuOpen] = useState(false);
  const [isHomeMenuOpen, setIsHomeMenuOpen] = useState(false);

  // Tự động kích hoạt trạng thái mở rộng dựa trên phân vùng URL đang chạy
  useEffect(() => {
    const isHomeSectionRoute = pathname.startsWith("/admin/courses/home-sections");
    
    if (
      (pathname.startsWith("/admin/courses") && !isHomeSectionRoute) || 
      pathname.startsWith("/admin/categories") || 
      pathname.startsWith("/admin/providers") || 
      pathname.startsWith("/admin/lessons")
    ) {
      setIsCourseMenuOpen(true);
    }

    if (isHomeSectionRoute) {
      setIsHomeMenuOpen(true);
    }
  }, [pathname]);

  // Xác minh phiên đăng nhập và phân quyền Quản trị viên
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
      
      {/* SIDEBAR NAVIGATION */}
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

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Core Features</p>
          
          {menuItems.map((item) => {
            const Icon = item.icon;
            
            if (item.submenu) {
              const isHomeSectionRoute = pathname.startsWith("/admin/courses/home-sections");
              
              // Xác định Menu Cha có đang trong trạng thái Active hay không
              const isGroupActive = item.isHomeSectionGroup 
                ? isHomeSectionRoute
                : (pathname.startsWith("/admin/courses") && !isHomeSectionRoute) || 
                  pathname.startsWith("/admin/categories") ||
                  pathname.startsWith("/admin/providers") || 
                  pathname.startsWith("/admin/lessons");
              
              const isOpen = item.isHomeSectionGroup ? isHomeMenuOpen : isCourseMenuOpen;
              const toggleMenu = item.isHomeSectionGroup 
                ? () => setIsHomeMenuOpen(!isHomeMenuOpen) 
                : () => setIsCourseMenuOpen(!isCourseMenuOpen);
              
              return (
                <div key={item.label} className="space-y-1">
                  <button
                    onClick={toggleMenu}
                    className={`w-full flex items-center justify-between rounded-2xl px-4 py-3.5 transition-all ${
                      isGroupActive 
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
                      className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} 
                    />
                  </button>

                  {/* VÙNG SUBMENU CON KHI ĐƯỢC THẢ XUỐNG */}
                  {isOpen && (
                    <div className="pl-6 space-y-1">
                      {item.submenu.map((subItem) => {
                        const SubIcon = subItem.icon;
                        
                        // Xử lý Active riêng biệt, chính xác cho từng Route con
                        let isChildActive = false;
                        if (subItem.href === "/admin/categories") {
                          isChildActive = pathname.startsWith("/admin/categories");
                        } else if (subItem.href === "/admin/providers") {
                          isChildActive = pathname.startsWith("/admin/providers");
                        } else if (subItem.href === "/admin/courses/create") {
                          isChildActive = pathname === "/admin/courses/create";
                        } else if (subItem.isIndicatorOnly) {
                          isChildActive = pathname.startsWith("/admin/lessons");
                        } else if (subItem.href === "/admin/courses") {
                          isChildActive = pathname === "/admin/courses" || 
                            (pathname.startsWith("/admin/courses/") && 
                             pathname !== "/admin/courses/create" && 
                             !pathname.startsWith("/admin/courses/home-sections"));
                        } else {
                          // So sánh chính xác hoàn toàn cho 3 mục của trang chủ (Most Popular, Trending Now, New Releases)
                          isChildActive = pathname === subItem.href;
                        }

                        if (subItem.isIndicatorOnly && !isChildActive) {
                          return null; 
                        }

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

        {/* ADMIN FOOTER CỦA SIDEBAR */}
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

      {/* VIEWPORT PHẢI CHỨA HIỂN THỊ NỘI DUNG */}
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