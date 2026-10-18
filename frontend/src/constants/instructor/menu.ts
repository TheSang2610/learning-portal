import { BookOpen, GraduationCap, MessageCircleQuestion, PlusCircle } from "lucide-react";

import type { ShellNavGroup } from "@/src/components/layout/dashboard-shell/nav";

// Trang soan bai hoc / bai kiem tra mo tu trang chi tiet khoa hoc - coi nhu
// thuoc "Khoa hoc cua toi" de menu van sang dung cho.
const COURSE_EDIT_ROUTES = [
  "/instructor/courses",
  "/instructor/course-detail",
  "/instructor/lessons",
  "/instructor/lesson-create",
  "/instructor/lesson-detail",
  "/instructor/quiz-create",
  "/instructor/quiz-edit",
  "/instructor/quiz-stats",
];

/** Menu khu giang vien (kieu sidebar cua shadcn) - phang, khong menu con. */
export const INSTRUCTOR_NAV: ShellNavGroup[] = [
  {
    label: "Giảng dạy",
    items: [
      {
        label: "Khóa học của tôi",
        href: "/instructor/courses",
        icon: BookOpen,
        activeRoutes: COURSE_EDIT_ROUTES,
      },
      { label: "Tạo khóa học mới", href: "/instructor/course-create", icon: PlusCircle },
    ],
  },
  {
    label: "Học viên",
    items: [
      // Hang doi cau hoi cua hoc vien. Phai co duong vao tu day, neu khong
      // giang vien khong bao gio biet co trang nay.
      {
        label: "Hỏi đáp học viên",
        href: "/instructor/questions",
        icon: MessageCircleQuestion,
      },
    ],
  },
];

export const INSTRUCTOR_SHELL = {
  homeHref: "/instructor",
  coursesHref: "/instructor/courses",
  /** Khong du quyen / dang xuat thi ve day. */
  outHref: "/",
  loading: "Đang tải khu giảng viên...",
  brand: "Learning Platform",
  brandSub: "Khu giảng viên",
  brandIcon: GraduationCap,
  root: "Giảng viên",
  editing: "(đang sửa)",
  nameFallback: "Giảng viên",
  roleLabel: "Giảng viên",
  logout: "Đăng xuất",
  toggle: "Ẩn/hiện thanh bên",
} as const;
