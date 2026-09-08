"use client";

import Link from "next/link";
import { xoaPhien } from "@/src/services/apiHelper";
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
  PlusCircle,
  Building2,
  LayoutGrid,
  Award,
  Flame,
  Sparkles,
  MessageSquare,
  HelpCircle,
  Menu,
  Image as ImageIcon,
  SlidersHorizontal,
  ClipboardList,
  Newspaper,
  Award as AwardIcon,
  Receipt,
  Coins,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useNguoiDungLuu, useDangTaiNguoiDung } from "@/src/hooks/nguoiDungLuu";

interface SubMenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
  isIndicatorOnly?: boolean;
}

interface MenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
  isHomeSectionGroup?: boolean;
  submenu?: SubMenuItem[];
  // Muc phang mac dinh sang khi pathname trung khop chinh xac href. Trang nao
  // co them man hinh soan thao rieng thi liet ke o day de van sang khi dang soan.
  matchRoutes?: string[];
}

// ===== NHOM ROUTE PHANG (URL khong con long nhau) =====
const COURSE_ROUTES = [
  "/admin/courses",
  "/admin/course-create",
  "/admin/course-detail",
  "/admin/course-faqs",
  "/admin/categories",
  "/admin/category-create",
  "/admin/providers",
];

const LESSON_ROUTES = [
  "/admin/lessons",
  "/admin/lesson-create",
  "/admin/lesson-detail",
  "/admin/quiz-create",
  "/admin/quiz-edit",
];

const POST_ROUTES = ["/admin/posts", "/admin/post-create"];

const HOME_SECTION_ROUTES = [
  "/admin/home-most-popular",
  "/admin/home-trending-now",
  "/admin/home-new-releases",
  "/admin/home-banners",
];

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
        href: "/admin/course-create",
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
    label: "Orders",
    href: "/admin/orders",
    icon: Receipt,
  },
  {
    label: "Home Sections",
    href: "/admin/home-most-popular",
    icon: LayoutGrid,
    isHomeSectionGroup: true,
    submenu: [
      {
        label: "Most Popular",
        href: "/admin/home-most-popular",
        icon: Award,
      },
      {
        label: "Trending Now",
        href: "/admin/home-trending-now",
        icon: Flame,
      },
      {
        label: "New Releases",
        href: "/admin/home-new-releases",
        icon: Sparkles,
      },
      // ==================== 2. THÊM BIẾN TẮT MỞ BANNER TRANG CHỦ TẠI ĐÂY ====================
      {
        label: "Homepage Banners",
        href: "/admin/home-banners",
        icon: SlidersHorizontal,
      },
    ],
  },
  {
    label: "Coin & Quà tặng",
    href: "/admin/coin",
    icon: Coins,
  },
  {
    label: "Enrollments",
    href: "/admin/enrollments",
    icon: ClipboardList,
  },
  {
    label: "Certificates",
    href: "/admin/certificates",
    icon: AwardIcon,
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
    label: "Blog Posts",
    href: "/admin/posts",
    icon: Newspaper,
    matchRoutes: POST_ROUTES,
  },
  {
    label: "Homepage FAQs",
    href: "/admin/faqs",
    icon: HelpCircle,
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // Doc localStorage bang useSyncExternalStore thay vi useEffect + setState,
  // xem src/hooks/nguoiDungLuu.ts. Effect ben duoi chi con lo viec chuyen huong.
  const nguoiDung = useNguoiDungLuu();
  const dangTaiNguoiDung = useDangTaiNguoiDung();
  const adminName = nguoiDung?.name ?? "";

  // `loading` SUY RA duoc, khong can state rieng: con dang hoi may chu, hoac
  // sai vai tro va dang bi day ra. Giu state rieng thi phai setLoading() ngay
  // trong effect - React canh bao vi no de sinh vong ve lai day chuyen, va
  // eslint o day chay voi --max-warnings 0.
  const loading = dangTaiNguoiDung || nguoiDung?.role !== "admin";

  // null = "chua bam gi, cu theo duong dan"; true/false = nguoi dung da tu bam.
  //
  // Truoc day hai o nay la boolean thuong, mo ra bang mot useEffect chay theo
  // pathname - tuc la React ve mot lan voi menu dong roi ve lai voi menu mo.
  // Suy ra ngay luc ve thi khong con vong thua nao.
  const [menuKhoaTuBam, setMenuKhoaTuBam] = useState<boolean | null>(null);
  const [menuTrangChuTuBam, setMenuTrangChuTuBam] = useState<boolean | null>(null);

  // Cập nhật Logic tự động mở Accordion Menu theo đường dẫn URL thanh địa chỉ
  const oKhuTrangChu = pathname.startsWith("/admin/home-most-popular");
  const oKhuKhoaHoc =
    (pathname.startsWith("/admin/courses") && !oKhuTrangChu) ||
    pathname.startsWith("/admin/categories") ||
    pathname.startsWith("/admin/providers") ||
    pathname.startsWith("/admin/lessons");

  // Chuyen SANG mot trang thuoc khu do thi bo lua chon tu bam, cho menu mo lai.
  // Chuyen sang trang khac thi giu nguyen y nguoi dung - dung y het hanh vi cua
  // useEffect cu, chi khac la khong ton mot vong ve lai.
  const [duongDanCu, setDuongDanCu] = useState(pathname);
  if (duongDanCu !== pathname) {
    setDuongDanCu(pathname);
    if (oKhuKhoaHoc) setMenuKhoaTuBam(null);
    if (oKhuTrangChu) setMenuTrangChuTuBam(null);
  }

  const isCourseMenuOpen = menuKhoaTuBam ?? oKhuKhoaHoc;
  const isHomeMenuOpen = menuTrangChuTuBam ?? oKhuTrangChu;

  // Gac cong khu quan tri bang cau tra loi cua MAY CHU.
  //
  // Ban cu doc localStorage.userInfo roi so user.role. Bat ky ai mo DevTools
  // cung sua duoc dong do thanh "admin": khong lay them duoc du lieu nao - moi
  // API van di qua middleware ben backend va van tra 403 - nhung TOAN BO khung
  // quan tri hien ra: menu, ten tung trang, breadcrumb. Do la ro ri be mat he
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

    if (nguoiDung?.role !== "admin") router.push("/");
  }, [dangTaiNguoiDung, nguoiDung, router]);

  const logoutHandler = async () => {
    // Truoc day cho nay chi xoa userInfo, KHONG xoa authToken - da "dang xuat"
    // ma getHeaders van gan token cu vao moi request, nguoi ke tiep dung may
    // van con la admin voi backend. xoaPhien() lam du bon viec, xem apiHelper.
    // PHAI await, neu khong dieu huong se huy request dang xuat giua chung va
    // cookie con nguyen - xem ghi chu o apiHelper.
    await xoaPhien();
    router.push("/");
  };

  const generateBreadcrumbs = () => {
    const paths = pathname.split("/").filter((path) => path);
    return paths.map((path, index) => {
      const rawHref = "/" + paths.slice(0, index + 1).join("/");
      // /admin khong phai la mot trang -> tro ve dashboard
      const href = rawHref === "/admin" ? "/admin/dashboard" : rawHref;
      const label = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");
      const isLast = index === paths.length - 1;

      // Khoa theo rawHref chu KHONG theo href.
      //
      // Dang o /admin/dashboard thi hai chang deu quy ve cung mot href:
      //   chang 0: "/admin"           -> doi thanh "/admin/dashboard"
      //   chang 1: "/admin/dashboard" -> giu nguyen
      // React nhan hai con cung khoa, canh bao "two children with the same
      // key" va co the ve thieu hoac ve trung mot chang. rawHref thi moi chang
      // moi khac vi no dai dan theo tung doan duong dan.
      return (
        <span key={rawHref} className="flex items-center">
          <span className="mx-2 text-slate-400">/</span>
          {isLast ? (
            <span className="font-normal text-slate-500">{label}</span>
          ) : (
            <Link
              href={href}
              className="capitalize transition-colors hover:text-indigo-600"
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
        Loading Admin Panel...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900 antialiased">
      {/* 1. SIDEBAR NAVIGATION */}
      <aside className="sticky top-0 z-20 flex h-screen w-64 flex-col bg-[#1e2530] text-[#b1b7c1] select-none">
        {/* BRANDING LOGO ZONE */}
        <div className="flex h-14 items-center border-b border-[#2a323d] bg-[#181d26] px-4">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <h1 className="text-sm font-bold tracking-wide text-white uppercase">
              ADMIN PAGE
            </h1>
          </Link>
        </div>

        {/* RENDER LIST MENU ITEMS */}
        <nav className="custom-scrollbar flex-1 space-y-0.5 overflow-y-auto py-3 text-[13.5px]">
          <div className="px-4 py-2 text-[11px] font-bold tracking-wider text-[#6a7686] uppercase">
            Theme Features
          </div>

          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const renderGroupHeader = index === 1;

            return (
              <div key={item.label}>
                {renderGroupHeader && (
                  <div className="px-4 pt-4 pb-2 text-[11px] font-bold tracking-wider text-[#6a7686] uppercase">
                    Components List
                  </div>
                )}

                {item.submenu
                  ? (() => {
                      const isHomeSectionRoute = HOME_SECTION_ROUTES.includes(pathname);
                      const isGroupActive = item.isHomeSectionGroup
                        ? isHomeSectionRoute
                        : COURSE_ROUTES.includes(pathname) ||
                          LESSON_ROUTES.includes(pathname);

                      const isOpen = item.isHomeSectionGroup
                        ? isHomeMenuOpen
                        : isCourseMenuOpen;
                      const toggleMenu = item.isHomeSectionGroup
                        ? () => setMenuTrangChuTuBam(!isHomeMenuOpen)
                        : () => setMenuKhoaTuBam(!isCourseMenuOpen);

                      return (
                        <div className="space-y-px">
                          <button
                            onClick={toggleMenu}
                            className={`group flex w-full items-center justify-between px-4 py-2.5 transition-colors duration-150 ${
                              isGroupActive
                                ? "bg-transparent text-white"
                                : "hover:bg-[#252d3a] hover:text-white"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon
                                size={16}
                                className={`transition-colors ${isGroupActive ? "text-indigo-400" : "text-[#7c8796] group-hover:text-white"}`}
                              />
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
                                  isChildActive =
                                    pathname === "/admin/categories" ||
                                    pathname === "/admin/category-create";
                                } else if (subItem.href === "/admin/providers") {
                                  isChildActive = pathname === "/admin/providers";
                                } else if (subItem.href === "/admin/course-create") {
                                  isChildActive = pathname === "/admin/course-create";
                                } else if (subItem.isIndicatorOnly) {
                                  isChildActive = LESSON_ROUTES.includes(pathname);
                                } else if (subItem.href === "/admin/courses") {
                                  isChildActive =
                                    pathname === "/admin/courses" ||
                                    pathname === "/admin/course-detail" ||
                                    pathname === "/admin/course-faqs";
                                } else {
                                  isChildActive = pathname === subItem.href;
                                }

                                if (subItem.isIndicatorOnly && !isChildActive)
                                  return null;

                                return (
                                  <Link
                                    key={subItem.href || "indicator"}
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
                                        isChildActive
                                          ? "text-indigo-400"
                                          : "text-[#7c8796]"
                                      }
                                    />
                                    <span>
                                      {subItem.label}{" "}
                                      {subItem.isIndicatorOnly && "(Editing)"}
                                    </span>
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })()
                  : (() => {
                      // URL da phang: so khop chinh xac, tru khi muc khai bao them
                      // man hinh con qua matchRoutes.
                      const isFlatActive = item.matchRoutes
                        ? item.matchRoutes.includes(pathname)
                        : pathname === item.href;

                      return (
                        <Link
                          href={item.href}
                          className={`group flex items-center gap-3 px-4 py-2.5 transition-colors ${
                            isFlatActive
                              ? "bg-[#252d3a] font-medium text-white"
                              : "hover:bg-[#252d3a] hover:text-white"
                          }`}
                        >
                          <Icon
                            size={16}
                            className={`transition-colors ${isFlatActive ? "text-indigo-400" : "text-[#7c8796] group-hover:text-white"}`}
                          />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })()}
              </div>
            );
          })}
        </nav>

        {/* SIDEBAR FOOTER & USER PROFILE */}
        <div className="flex items-center justify-between border-t border-[#2a323d] bg-[#181d26] p-3">
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-xs font-medium text-white">
              {adminName || "Administrator"}
            </span>
            <span className="mt-0.5 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
              Super Admin
            </span>
          </div>
          <button
            onClick={logoutHandler}
            title="Sign out of system"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* 2. MAIN VIEWPORT SYSTEM PANEL */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm shadow-slate-100/50">
          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <button className="text-slate-500 transition-colors hover:text-slate-800">
              <Menu size={18} />
            </button>
            <div className="flex items-center">
              <Link
                href="/admin/dashboard"
                className="transition-colors hover:text-indigo-600"
              >
                Home
              </Link>
              {generateBreadcrumbs()}
            </div>
          </div>
          <div className="flex items-center gap-4 text-slate-500"></div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
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
