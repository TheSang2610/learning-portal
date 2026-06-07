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
  HelpCircle,
  Bell,
  Settings,
  Menu,
  Sun,
  Image as ImageIcon, 
  SlidersHorizontal   
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
  // ==================== 1. THÊM MỤC QUẢN LÝ BANNER TỔNG TẠI ĐÂY ====================
  {
    label: "Banners Management",
    href: "/admin/banners",
    icon: ImageIcon,
  },
  {
    label: "Home Sections",
    href: "/admin/courses/home-sections",
    icon: LayoutGrid,
    isHomeSectionGroup: true,
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
      // ==================== 2. THÊM BIẾN TẮT MỞ BANNER TRANG CHỦ TẠI ĐÂY ====================
      {
        label: "Homepage Banners",
        href: "/admin/courses/home-sections/banners-toggle",
        icon: SlidersHorizontal,
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
  
  const [isCourseMenuOpen, setIsCourseMenuOpen] = useState(false);
  const [isHomeMenuOpen, setIsHomeMenuOpen] = useState(false);

  // Cập nhật Logic tự động mở Accordion Menu theo đường dẫn URL thanh địa chỉ
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

  const generateBreadcrumbs = () => {
    const paths = pathname.split("/").filter((path) => path);
    return paths.map((path, index) => {
      const href = "/" + paths.slice(0, index + 1).join("/");
      const label = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");
      const isLast = index === paths.length - 1;

      return (
        <span key={href} className="flex items-center">
          <span className="mx-2 text-slate-300">/</span>
          {isLast ? (
            <span className="text-slate-500 font-normal">{label}</span>
          ) : (
            <Link href={href} className="hover:text-indigo-600 transition-colors capitalize">
              {label}
            </Link>
          )}
        </span>
      );
    });
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-sm font-medium text-slate-400 bg-[#1e293b]">
        Loading Admin Panel...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900 antialiased">
      
      {/* 1. SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-[#1e2530] text-[#b1b7c1] flex flex-col sticky top-0 h-screen z-20 select-none">

        {/* BRANDING LOGO ZONE */}
        <div className="h-14 flex items-center px-4 bg-[#181d26] border-b border-[#2a323d]">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <h1 className="font-bold text-sm tracking-wide text-white uppercase">ADMIN PAGE</h1>
          </Link>
        </div>

        {/* RENDER LIST MENU ITEMS */}
        <nav className="flex-1 py-3 text-[13.5px] overflow-y-auto space-y-0.5 custom-scrollbar">
          
          <div className="px-4 py-2 text-[11px] font-bold text-[#6a7686] uppercase tracking-wider">
            Theme Features
          </div>
          
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const renderGroupHeader = index === 1;

            return (
              <div key={item.label}>
                {renderGroupHeader && (
                  <div className="px-4 pt-4 pb-2 text-[11px] font-bold text-[#6a7686] uppercase tracking-wider">
                    Components List
                  </div>
                )}

                {item.submenu ? (
                  (() => {
                    const isHomeSectionRoute = pathname.startsWith("/admin/courses/home-sections");
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
                      <div className="space-y-px">
                        <button
                          onClick={toggleMenu}
                          className={`w-full flex items-center justify-between px-4 py-2.5 transition-colors duration-150 group ${
                            isGroupActive ? "text-white bg-transparent" : "hover:text-white hover:bg-[#252d3a]"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon size={16} className={`transition-colors ${isGroupActive ? "text-indigo-400" : "text-[#7c8796] group-hover:text-white"}`} />
                            <span>{item.label}</span>
                          </div>
                          <ChevronDown 
                            size={14} 
                            className={`text-[#7c8796] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} 
                          />
                        </button>

                        {/* SUBMENU DROP-DOWN ACCORDION */}
                        {isOpen && (
                          <div className="bg-[#181d26] py-1 transition-all">
                            {item.submenu.map((subItem) => {
                              const SubIcon = subItem.icon;
                              
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
                                isChildActive = pathname === subItem.href;
                              }

                              if (subItem.isIndicatorOnly && !isChildActive) return null;

                              return (
                                <Link
                                  key={subItem.href || "indicator"}
                                  href={subItem.href || "#"}
                                  className={`flex items-center gap-3 pl-8 pr-4 py-2 transition-colors ${
                                    isChildActive
                                      ? "text-white font-medium bg-[#2a323d]"
                                      : "text-[#b1b7c1] hover:text-white hover:bg-[#252d3a]/50"
                                  }`}
                                >
                                  <SubIcon size={14} className={isChildActive ? "text-indigo-400" : "text-[#7c8796]"} />
                                  <span>{subItem.label} {subItem.isIndicatorOnly && "(Editing)"}</span>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 transition-colors group ${
                      pathname.startsWith(item.href) // Tối ưu active cho các route con của /admin/banners
                        ? "bg-[#252d3a] text-white font-medium"
                        : "hover:text-white hover:bg-[#252d3a]"
                    }`}
                  >
                    <Icon size={16} className={`transition-colors ${pathname.startsWith(item.href) ? "text-indigo-400" : "text-[#7c8796] group-hover:text-white"}`} />
                    <span>{item.label}</span>
                  </Link>
                )}
              </div>
            );
          })}
        </nav>

        {/* SIDEBAR FOOTER & USER PROFILE */}
        <div className="bg-[#181d26] border-t border-[#2a323d] p-3 flex items-center justify-between">
          <div className="min-w-0 flex flex-col">
            <span className="text-xs text-white font-medium truncate">{adminName || "Administrator"}</span>
            <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mt-0.5">Super Admin</span>
          </div>
          <button
            onClick={logoutHandler}
            title="Sign out of system"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* 2. MAIN VIEWPORT SYSTEM PANEL */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm shadow-slate-100/50">
          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <button className="text-slate-500 hover:text-slate-800 transition-colors">
              <Menu size={18} />
            </button>
            <div className="flex items-center">
              <Link href="/admin/dashboard" className="hover:text-indigo-600 transition-colors">
                Home
              </Link>
              {generateBreadcrumbs()}
            </div>
          </div>
          <div className="flex items-center gap-4 text-slate-500"></div>
        </header>

        <main className="p-6 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Styles Custom Scrollbar */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1e2530;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2a323d;
          border-radius: 99px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3e4958;
        }
      `}</style>
    </div>
  );
}