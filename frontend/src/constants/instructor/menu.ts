import {
  BookOpen,
  GraduationCap,
  MessageCircleQuestion,
  Video,
  type LucideIcon,
} from "lucide-react";

export interface InstructorSubMenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Muc chi hien khi dang o trang con (dang soan bai hoc). */
  isIndicatorOnly?: boolean;
  /** Cac duong dan lam muc nay sang. */
  activeRoutes: string[];
}

export interface InstructorMenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
  submenu?: InstructorSubMenuItem[];
}

// ===== NHOM ROUTE PHANG (URL khong con long nhau) =====
export const INSTRUCTOR_COURSE_ROUTES = [
  "/instructor/courses",
  "/instructor/course-create",
  "/instructor/course-detail",
];

export const INSTRUCTOR_LESSON_ROUTES = [
  "/instructor/lessons",
  "/instructor/lesson-create",
  "/instructor/lesson-detail",
  "/instructor/quiz-create",
  "/instructor/quiz-edit",
  "/instructor/quiz-stats",
];

export const INSTRUCTOR_MENU: InstructorMenuItem[] = [
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
        activeRoutes: ["/instructor/courses", "/instructor/course-detail"],
      },
      {
        label: "Create Course",
        href: "/instructor/course-create",
        icon: GraduationCap,
        activeRoutes: ["/instructor/course-create"],
      },
      {
        label: "Lesson Content",
        href: "",
        icon: Video,
        isIndicatorOnly: true,
        activeRoutes: INSTRUCTOR_LESSON_ROUTES,
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

export const INSTRUCTOR_SHELL = {
  homeHref: "/instructor",
  coursesHref: "/instructor/courses",
  /** Khong du quyen / dang xuat thi ve day. */
  outHref: "/",
  loading: "Loading Instructor Panel...",
  brand: "INSTRUCTOR",
  workspace: "Workspace",
  editing: "(Editing)",
  nameFallback: "Instructor",
  roleLabel: "Faculty Member",
  logout: "Đăng xuất",
  home: "Home",
} as const;
