"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  LayoutDashboard,
  BookOpen,
  Video,
  ChevronDown,
  LogOut,
  GraduationCap,
  Bell,
  Settings,
  Menu,
  Sun
} from "lucide-react";

// ===== NHOM ROUTE PHANG (URL khong con long nhau) =====
const COURSE_ROUTES = [
  "/instructor/courses",
  "/instructor/course-create",
  "/instructor/course-detail",
];

const LESSON_ROUTES = [
  "/instructor/lessons",
  "/instructor/lesson-create",
  "/instructor/lesson-detail",
  "/instructor/quiz-create",
  "/instructor/quiz-edit",
  "/instructor/quiz-stats",
];

const instructorMenuItems = [
  // {
  //   label: "Dashboard",
  //   href: "/instructor/dashboard",
  //   icon: LayoutDashboard,
  // },
  {
    label: "My Courses",
    href: "/instructor/courses",
    icon: BookOpen,
    submenu: [
      {
        label: "All Courses",
        href: "/instructor/courses",
        icon: BookOpen,
      },
      {
        label: "Create Course",
        href: "/instructor/course-create",
        icon: GraduationCap,
      },
      {
        label: "Lesson Content",
        href: "",
        icon: Video,
        isIndicatorOnly: true,
      },
    ],
  },
];

export default function InstructorPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [instructorName, setInstructorName] = useState("");
  const [isCourseMenuOpen, setIsCourseMenuOpen] = useState(true);

  useEffect(() => {
    if (COURSE_ROUTES.includes(pathname) || LESSON_ROUTES.includes(pathname)) {
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
      if (user.role !== "instructor" && user.role !== "admin") {
        router.push("/");
        return;
      }
      setInstructorName(user.name);
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

  // Tự động phân tách URL để render sơ đồ Breadcrumbs (Home / Instructor / Courses...)
  const generateBreadcrumbs = () => {
    const paths = pathname.split("/").filter((path) => path);
    return paths.map((path, index) => {
      const rawHref = "/" + paths.slice(0, index + 1).join("/");
      // /instructor chi la panel -> tro ve danh sach khoa hoc
      const href = rawHref === "/instructor" ? "/instructor/courses" : rawHref;
      const label = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");
      const isLast = index === paths.length - 1;

      return (
        <span key={href} className="flex items-center">
          <span className="mx-2 text-slate-400">/</span>
          {isLast ? (
            <span className="text-slate-500 font-normal">{label}</span>
          ) : (
            <Link href={href} className="hover:text-indigo-400 transition-colors capitalize">
              {label}
            </Link>
          )}
        </span>
      );
    });
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-sm font-medium text-slate-500 bg-[#1e293b]">
        Loading Instructor Panel...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900 antialiased">
      
      {/* 1. SIDEBAR NAVIGATION (CoreUI Dark Theme) */}
      <aside className="w-64 bg-[#1e2530] text-[#b1b7c1] flex flex-col sticky top-0 h-screen z-20 select-none">

        {/* LOGO AREA */}
        <div className="h-14 flex items-center px-4 bg-[#181d26] border-b border-[#2a323d]">
          <Link href="/instructor/courses" className="flex items-center gap-2.5">
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg shadow-sm">
              <GraduationCap size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-wide text-white uppercase">INSTRUCTOR</h1>
            </div>
          </Link>
        </div>

        {/* LIST MENU ITEMS */}
        <nav className="flex-1 py-3 text-[13.5px] overflow-y-auto space-y-0.5 custom-scrollbar">
          
          <div className="px-4 py-2 text-[11px] font-bold text-[#6a7686] uppercase tracking-wider">
            Workspace
          </div>
          
          {instructorMenuItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <div key={item.label}>
                {item.submenu ? (
                  <div className="space-y-px">
                    <button
                      onClick={() => setIsCourseMenuOpen(!isCourseMenuOpen)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 transition-colors duration-150 group ${
                        COURSE_ROUTES.includes(pathname) || LESSON_ROUTES.includes(pathname)
                          ? "text-white bg-transparent"
                          : "hover:text-white hover:bg-[#252d3a]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={16} className={`transition-colors ${(COURSE_ROUTES.includes(pathname) || LESSON_ROUTES.includes(pathname)) ? "text-indigo-400" : "text-[#7c8796] group-hover:text-white"}`} />
                        <span>{item.label}</span>
                      </div>
                      <ChevronDown 
                        size={14} 
                        className={`text-[#7c8796] transition-transform duration-200 ${isCourseMenuOpen ? "rotate-180" : ""}`} 
                      />
                    </button>

                    {/* SUBMENU DROP-DOWN */}
                    {isCourseMenuOpen && (
                      <div className="bg-[#181d26] py-1 transition-all">
                        {item.submenu.map((subItem) => {
                          const SubIcon = subItem.icon;
                          
                          let isChildActive = false;
                          if (subItem.href === "/instructor/course-create") {
                            isChildActive = pathname === "/instructor/course-create";
                          } else if (subItem.isIndicatorOnly) {
                            isChildActive = LESSON_ROUTES.includes(pathname);
                          } else {
                            isChildActive = pathname === "/instructor/courses" ||
                              pathname === "/instructor/course-detail";
                          }

                          if (subItem.isIndicatorOnly && !isChildActive) return null;

                          return (
                            <Link
                              key={subItem.href || "lesson-indicator"}
                              href={subItem.href || "#"}
                              className={`flex items-center gap-3 pl-8 pr-4 py-2 transition-colors ${
                                isChildActive
                                  ? "text-white font-medium bg-[#2a323d]"
                                  : "text-[#b1b7c1] hover:text-white hover:bg-[#252d3a]/50"
                              }`}
                            >
                              <SubIcon size={14} className={isChildActive ? "text-indigo-400" : "text-[#7c8796]"} />
                              <span>
                                {subItem.label} {subItem.isIndicatorOnly && "(Editing)"}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 transition-colors group ${
                      pathname === item.href
                        ? "bg-[#252d3a] text-white font-medium"
                        : "hover:text-white hover:bg-[#252d3a]"
                    }`}
                  >
                    <Icon size={16} className={`transition-colors ${pathname === item.href ? "text-indigo-400" : "text-[#7c8796] group-hover:text-white"}`} />
                    <span>{item.label}</span>
                  </Link>
                )}
              </div>
            );
          })}
        </nav>

        {/* SIDEBAR FOOTER (USER INFO) */}
        <div className="bg-[#181d26] border-t border-[#2a323d] p-3 flex items-center justify-between">
          <div className="min-w-0 flex flex-col">
            <span className="text-xs text-white font-medium truncate">{instructorName || "Instructor"}</span>
            <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mt-0.5">Faculty Member</span>
          </div>
          <button
            onClick={logoutHandler}
            title="Đăng xuất"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* 2. MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* WHITE HEADER WITH BREADCRUMBS */}
        <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm shadow-slate-100/50">
          
          {/* BREADCRUMBS & HAMBURGER */}
          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <button className="text-slate-500 hover:text-slate-800 transition-colors">
              <Menu size={18} />
            </button>
            <div className="flex items-center">
              <Link href="/instructor" className="hover:text-indigo-600 transition-colors">
                Home
              </Link>
              {generateBreadcrumbs()}
            </div>
          </div>

          {/* ACTION UTILITIES */}
          <div className="flex items-center gap-4 text-slate-500">
            {/* <button className="p-1 hover:text-indigo-600 transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-1 hover:text-indigo-600 transition-colors">
              <Settings size={18} />
            </button>
            <button className="p-1 hover:text-indigo-600 transition-colors">
              <Sun size={18} />
            </button>
            
            <div className="h-4 w-px bg-slate-200 my-auto mx-1"></div> */}
    
            {/* <div className="flex items-center gap-2 group cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs ring-2 ring-slate-100 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80" 
                  alt="Instructor Portrait" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div> */}
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="p-6 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* CUSTOM INTERNAL SCROLLBAR FOR SIDEBAR */}
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