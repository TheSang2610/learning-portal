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
} from "lucide-react";

const instructorMenuItems = [
  {
    label: "Dashboard",
    href: "/instructor",
    icon: LayoutDashboard,
  },
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
        href: "/instructor/courses/create",
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
    if (
      pathname.startsWith("/instructor/courses") || 
      pathname.startsWith("/instructor/lessons")
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

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-lg font-semibold text-slate-600 bg-slate-50">
        Loading Instructor Panel...
      </div>
    );
  }

  return (
    // ĐÃ SỬA: Xóa bỏ các class trùng lặp với body ở Root Layout để tránh ghi đè lỗi font
    <div className="flex min-h-screen">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen">

        {/* LOGO */}
        <div className="px-6 py-6 border-b border-slate-100">
          <Link href="/instructor" className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-md shadow-indigo-200">
              <GraduationCap size={22} />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-slate-800">LMS Teacher</h1>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Instructor Center</p>
            </div>
          </Link>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Workspace</p>
          
          {instructorMenuItems.map((item) => {
            const Icon = item.icon;
            
            if (item.submenu) {
              const isSubmenuActive = 
                pathname.startsWith("/instructor/courses") || 
                pathname.startsWith("/instructor/lessons");
              
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

                  {isCourseMenuOpen && (
                    <div className="pl-6 space-y-1">
                      {item.submenu.map((subItem) => {
                        const SubIcon = subItem.icon;
                        
                        let isChildActive = false;
                        if (subItem.href === "/instructor/courses/create") {
                          isChildActive = pathname === "/instructor/courses/create";
                        } else if (subItem.isIndicatorOnly) {
                          isChildActive = pathname.startsWith("/instructor/lessons");
                        } else {
                          isChildActive = pathname === "/instructor/courses";
                        }

                        if (subItem.isIndicatorOnly && !isChildActive) {
                          return null; 
                        }

                        if (subItem.isIndicatorOnly) {
                          return (
                            <div
                              key="lesson-indicator"
                              className="flex items-center gap-3 rounded-xl px-4 py-3 bg-indigo-50 text-indigo-600 font-semibold border border-indigo-100"
                            >
                              <SubIcon size={18} />
                              <span className="text-[14px]">Lesson Management</span>
                            </div>
                          );
                        }

                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                              isChildActive
                                ? "bg-indigo-600 text-white font-medium shadow-md shadow-indigo-600/10"
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
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10 font-semibold"
                    : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"
                }`}
              >
                <Icon size={20} className={isMainActive ? "text-white" : "text-slate-400"} />
                <span className="text-[15px]">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* INSTRUCTOR FOOTER */}
        <div className="border-t border-slate-100 p-4 bg-slate-50/50">
          <div className="mb-4 px-2">
            <p className="font-bold text-slate-800 truncate">{instructorName || "Instructor"}</p>
            <p className="text-xs font-medium text-slate-400">Professional Faculty</p>
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
            <h2 className="text-xl font-bold text-slate-800">Instructor Studio</h2>
            <p className="text-xs text-slate-400 mt-0.5">Design curriculum architectures and engage with student learning analytics.</p>
          </div>
        </header>

        <div className="p-8 flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}