"use client";

import Link from "next/link";
import { xoaPhien } from "@/src/services/apiHelper";
import { useNguoiDungLuu, useDangTaiNguoiDung } from "@/src/hooks/userStore";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import styles from "./page.module.scss";
import {
  BookOpen,
  Video,
  ChevronDown,
  LogOut,
  GraduationCap,
  Menu,
  MessageCircleQuestion,
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
  // Hang doi cau hoi cua hoc vien.
  //
  // Phai co duong vao tu day, neu khong thi giang vien khong bao gio biet co
  // trang nay - va phan hoi dap trong bai hoc thanh noi hoc vien dat cau hoi
  // roi khong ai tra loi.
  {
    label: "Student Q&A",
    href: "/instructor/questions",
    icon: MessageCircleQuestion,
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
  // xem src/hooks/userStore.ts. Effect ben duoi chi con lo viec chuyen huong.
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
        <span key={href} className={styles.row}>
          <span className={styles.label}>/</span>
          {isLast ? (
            <span className={styles.label2}>{label}</span>
          ) : (
            <Link href={href} className={styles.box}>
              {label}
            </Link>
          )}
        </span>
      );
    });
  };

  if (loading) {
    return <div className={styles.row2}>Loading Instructor Panel...</div>;
  }

  return (
    <div className={styles.page}>
      {/* 1. SIDEBAR NAVIGATION (CoreUI Dark Theme) */}
      <aside className={styles.aside}>
        {/* LOGO AREA */}
        <div className={styles.row3}>
          <Link href="/instructor/courses" className={styles.row4}>
            <div className={styles.card}>
              <GraduationCap size={18} className={styles.box2} />
            </div>
            <div>
              <h1 className={styles.title}>INSTRUCTOR</h1>
            </div>
          </Link>
        </div>

        {/* LIST MENU ITEMS */}
        <nav className={`${styles.thanhCuonGon} ${styles.nav}`}>
          <div className={styles.box3}>Workspace</div>

          {instructorMenuItems.map((item, _index) => {
            const Icon = item.icon;

            return (
              <div key={item.label}>
                {item.submenu ? (
                  <div className={styles.stack}>
                    <button
                      onClick={() => setMenuKhoaTuBam(!isCourseMenuOpen)}
                      className={`group ${styles.button7} ${
                        COURSE_ROUTES.includes(pathname) ||
                        LESSON_ROUTES.includes(pathname)
                          ? styles.button
                          : styles.button2
                      }`}
                    >
                      <div className={styles.row5}>
                        <Icon
                          size={16}
                          className={`${styles.box14} ${COURSE_ROUTES.includes(pathname) || LESSON_ROUTES.includes(pathname) ? styles.box4 : styles.box5}`}
                        />
                        <span>{item.label}</span>
                      </div>
                      <ChevronDown
                        size={14}
                        className={`${styles.box15} ${isCourseMenuOpen ? styles.box6 : ""}`}
                      />
                    </button>

                    {/* SUBMENU DROP-DOWN */}
                    {isCourseMenuOpen && (
                      <div className={styles.box7}>
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
                              className={`${styles.row11} ${
                                isChildActive ? styles.box8 : styles.box9
                              }`}
                            >
                              <SubIcon
                                size={14}
                                className={isChildActive ? styles.box4 : styles.box10}
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
                    className={`group ${styles.row12} ${
                      pathname === item.href ? styles.box11 : styles.button2
                    }`}
                  >
                    <Icon
                      size={16}
                      className={`${styles.box14} ${pathname === item.href ? styles.box4 : styles.box5}`}
                    />
                    <span>{item.label}</span>
                  </Link>
                )}
              </div>
            );
          })}
        </nav>

        {/* SIDEBAR FOOTER (USER INFO) */}
        <div className={styles.row6}>
          <div className={styles.col}>
            <span className={styles.label3}>{instructorName || "Instructor"}</span>
            <span className={styles.label4}>Faculty Member</span>
          </div>
          <button onClick={logoutHandler} title="Đăng xuất" className={styles.button3}>
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* 2. MAIN VIEWPORT */}
      <div className={styles.col2}>
        {/* WHITE HEADER WITH BREADCRUMBS */}
        <header className={styles.header}>
          {/* BREADCRUMBS & HAMBURGER */}
          <div className={styles.row7}>
            <button className={styles.button4}>
              <Menu size={18} />
            </button>
            <div className={styles.row}>
              <Link href="/instructor" className={styles.box12}>
                Home
              </Link>
              {generateBreadcrumbs()}
            </div>
          </div>

          {/* ACTION UTILITIES */}
          <div className={styles.row8}>
            {/* <button className={styles.button5}>
              <Bell size={18} />
              <span className={styles.floating}></span>
            </button>
            <button className={styles.button6}>
              <Settings size={18} />
            </button>
            <button className={styles.button6}>
              <Sun size={18} />
            </button>
            
            <div className={styles.box13}></div> */}

            {/* <div className={`group ${styles.row9}`}>
              <div className={styles.row10}>
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80" 
                  alt="Instructor Portrait" 
                  className={styles.image}
                />
              </div>
            </div> */}
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className={styles.main}>{children}</main>
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
