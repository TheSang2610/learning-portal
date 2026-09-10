"use client";

import Link from "next/link";
import { xoaPhien } from "@/src/services/apiHelper";
import { useNguoiDungLuu, useDangTaiNguoiDung } from "@/src/hooks/nguoiDungLuu";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { BookOpen, Video, ChevronDown, LogOut, GraduationCap, Menu } from "lucide-react";

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

  // Doc localStorage bang useSyncExternalStore thay vi useEffect + setState,
  // xem src/hooks/nguoiDungLuu.ts. Effect ben duoi chi con lo viec chuyen huong.
  const nguoiDung = useNguoiDungLuu();
  const dangTaiNguoiDung = useDangTaiNguoiDung();
  const instructorName = nguoiDung?.name ?? "";

  // `loading` SUY RA duoc, khong can state rieng: con dang hoi may chu, hoac
  // sai vai tro va dang bi day ra. Giu state rieng thi phai setLoading() ngay
  // trong effect - React canh bao vi no de sinh vong ve lai day chuyen, va
  // eslint o day chay voi --max-warnings 0.
  const loading =
    dangTaiNguoiDung || (nguoiDung?.role !== "instructor" && nguoiDung?.role !== "admin");

  // null = "chua bam gi, cu theo duong dan"; true/false = nguoi dung da tu bam.
  const [menuKhoaTuBam, setMenuKhoaTuBam] = useState<boolean | null>(null);

  const oKhuKhoaHoc =
    COURSE_ROUTES.includes(pathname) || LESSON_ROUTES.includes(pathname);

  // Chuyen SANG mot trang thuoc khu khoa hoc thi bo lua chon tu bam, cho menu
  // mo lai. Chuyen sang trang khac thi giu nguyen y nguoi dung - dung y het
  // hanh vi cua useEffect cu, chi khac la khong ton mot vong ve lai.
  const [duongDanCu, setDuongDanCu] = useState(pathname);
  if (duongDanCu !== pathname) {
    setDuongDanCu(pathname);
    if (oKhuKhoaHoc) setMenuKhoaTuBam(null);
  }

  // Chua bam thi mo san, giu nguyen useState(true) cu.
  const isCourseMenuOpen = menuKhoaTuBam ?? true;

  // Gac cong khu giang vien bang cau tra loi cua MAY CHU.
  //
  // Ban cu doc localStorage.userInfo roi so user.role. Bat ky ai mo DevTools
  // cung sua duoc dong do thanh "instructor": khong lay them duoc du lieu nao - moi
  // API van di qua middleware ben backend va van tra 403 - nhung TOAN BO khung
  // giang vien hien ra: menu, ten tung trang, breadcrumb. Do la ro ri be mat he
  // thong, va man hinh thi day loi 403 lon xon.
  //
  // Cung khong the sua bang cach doi sang luu token trong localStorage: trinh
  // duyet khong co JWT_SECRET nen KHONG kiem duoc chu ky, van phai tin phan
  // payload nguoi dung tu go ra - y het van de cu, lai them nguy co XSS doc
  // trom token (xem ghi chu dau utils/cookieToken.js ben backend).
  //
  // Duong dung la HOI MAY CHU. <NapNguoiDung /> o root layout da goi
  // GET /users/profile mot lan va cat ket qua vao kho trong RAM; vai tro trong
  // do lay thang tu CSDL nen khong sua duoc tu trinh duyet.
  //
  // Doc lai tu kho chu khong tu goi getMyProfile() o day: goi rieng la them
  // mot luot mang trung lap, va apiHelper gap 401 se tu day ve trang chu -
  // hai duong chuyen huong chay dua nhau thi rat kho lan ra khi co su co.
  useEffect(() => {
    if (dangTaiNguoiDung) return;

    if (nguoiDung?.role !== "instructor" && nguoiDung?.role !== "admin") router.push("/");
  }, [dangTaiNguoiDung, nguoiDung, router]);

  const logoutHandler = async () => {
    // Truoc day cho nay chi xoa userInfo, KHONG xoa authToken - da "dang xuat"
    // ma getHeaders van gan token cu vao moi request, nguoi ke tiep dung may
    // van con la giang vien voi backend. xoaPhien() lam du bon viec, xem apiHelper.
    // PHAI await, neu khong dieu huong se huy request dang xuat giua chung va
    // cookie con nguyen - xem ghi chu o apiHelper.
    await xoaPhien();
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
            <span className="font-normal text-slate-500">{label}</span>
          ) : (
            <Link
              href={href}
              className="capitalize transition-colors hover:text-indigo-400"
            >
              {label}
            </Link>
          )}
        </span>
      );
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#1e293b] text-sm font-medium text-slate-500">
        Loading Instructor Panel...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900 antialiased">
      {/* 1. SIDEBAR NAVIGATION (CoreUI Dark Theme) */}
      <aside className="sticky top-0 z-20 flex h-screen w-64 flex-col bg-[#1e2530] text-[#b1b7c1] select-none">
        {/* LOGO AREA */}
        <div className="flex h-14 items-center border-b border-[#2a323d] bg-[#181d26] px-4">
          <Link href="/instructor/courses" className="flex items-center gap-2.5">
            <div className="rounded-lg bg-indigo-600 p-1.5 text-white shadow-sm">
              <GraduationCap size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wide text-white uppercase">
                INSTRUCTOR
              </h1>
            </div>
          </Link>
        </div>

        {/* LIST MENU ITEMS */}
        <nav className="custom-scrollbar flex-1 space-y-0.5 overflow-y-auto py-3 text-[13.5px]">
          <div className="px-4 py-2 text-[11px] font-bold tracking-wider text-[#6a7686] uppercase">
            Workspace
          </div>

          {instructorMenuItems.map((item, _index) => {
            const Icon = item.icon;

            return (
              <div key={item.label}>
                {item.submenu ? (
                  <div className="space-y-px">
                    <button
                      onClick={() => setMenuKhoaTuBam(!isCourseMenuOpen)}
                      className={`group flex w-full items-center justify-between px-4 py-2.5 transition-colors duration-150 ${
                        COURSE_ROUTES.includes(pathname) ||
                        LESSON_ROUTES.includes(pathname)
                          ? "bg-transparent text-white"
                          : "hover:bg-[#252d3a] hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          size={16}
                          className={`transition-colors ${COURSE_ROUTES.includes(pathname) || LESSON_ROUTES.includes(pathname) ? "text-indigo-400" : "text-[#7c8796] group-hover:text-white"}`}
                        />
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
                            isChildActive =
                              pathname === "/instructor/courses" ||
                              pathname === "/instructor/course-detail";
                          }

                          if (subItem.isIndicatorOnly && !isChildActive) return null;

                          return (
                            <Link
                              key={subItem.href || "lesson-indicator"}
                              href={subItem.href || "#"}
                              className={`flex items-center gap-3 py-2 pr-4 pl-8 transition-colors ${
                                isChildActive
                                  ? "bg-[#2a323d] font-medium text-white"
                                  : "text-[#b1b7c1] hover:bg-[#252d3a]/50 hover:text-white"
                              }`}
                            >
                              <SubIcon
                                size={14}
                                className={
                                  isChildActive ? "text-indigo-400" : "text-[#7c8796]"
                                }
                              />
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
                    className={`group flex items-center gap-3 px-4 py-2.5 transition-colors ${
                      pathname === item.href
                        ? "bg-[#252d3a] font-medium text-white"
                        : "hover:bg-[#252d3a] hover:text-white"
                    }`}
                  >
                    <Icon
                      size={16}
                      className={`transition-colors ${pathname === item.href ? "text-indigo-400" : "text-[#7c8796] group-hover:text-white"}`}
                    />
                    <span>{item.label}</span>
                  </Link>
                )}
              </div>
            );
          })}
        </nav>

        {/* SIDEBAR FOOTER (USER INFO) */}
        <div className="flex items-center justify-between border-t border-[#2a323d] bg-[#181d26] p-3">
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-xs font-medium text-white">
              {instructorName || "Instructor"}
            </span>
            <span className="mt-0.5 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
              Faculty Member
            </span>
          </div>
          <button
            onClick={logoutHandler}
            title="Đăng xuất"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* 2. MAIN VIEWPORT */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* WHITE HEADER WITH BREADCRUMBS */}
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm shadow-slate-100/50">
          {/* BREADCRUMBS & HAMBURGER */}
          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <button className="text-slate-500 transition-colors hover:text-slate-800">
              <Menu size={18} />
            </button>
            <div className="flex items-center">
              <Link
                href="/instructor"
                className="transition-colors hover:text-indigo-600"
              >
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
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
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
