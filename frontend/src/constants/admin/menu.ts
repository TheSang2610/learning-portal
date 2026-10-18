import {
  Award as AwardIcon,
  Award,
  BadgePercent,
  Bell,
  BookOpen,
  Building2,
  ClipboardList,
  FileText,
  Flame,
  FolderOpen,
  HelpCircle,
  LayoutDashboard,
  LayoutGrid,
  Layers,
  Library,
  MessageSquare,
  Newspaper,
  Palette,
  PenLine,
  PlusCircle,
  Receipt,
  School,
  Sparkles,
  Users,
} from "lucide-react";

import type { ShellNavGroup } from "@/src/components/layout/dashboard-shell/nav";

// Cac trang soan bai hoc / bai kiem tra mo tu trang chi tiet khoa hoc - coi
// nhu thuoc "Danh sach khoa hoc" de menu van sang dung cho.
const COURSE_EDIT_ROUTES = [
  "/admin/courses",
  "/admin/course-detail",
  "/admin/course-faqs",
  "/admin/lessons",
  "/admin/lesson-create",
  "/admin/lesson-detail",
  "/admin/quiz-create",
  "/admin/quiz-edit",
];

/**
 * Menu khu quan tri, chia theo MANG VIEC cua admin (moi nhom tra loi "toi dang
 * lo viec gi"), ten muc noi ro trang lam gi. Chi mot muc co menu con.
 */
export const ADMIN_NAV: ShellNavGroup[] = [
  {
    label: "Tổng quan",
    items: [
      { label: "Bảng điều khiển", href: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  // ---- Ba mang noi dung chinh: Khoa hoc / Cam nang / Tai lieu
  {
    label: "Khóa học",
    items: [
      {
        label: "Danh sách khóa học",
        href: "/admin/courses",
        icon: BookOpen,
        activeRoutes: COURSE_EDIT_ROUTES,
      },
      { label: "Tạo khóa học mới", href: "/admin/course-create", icon: PlusCircle },
      {
        label: "Danh mục khóa học",
        href: "/admin/categories",
        icon: FolderOpen,
        activeRoutes: ["/admin/categories", "/admin/category-create"],
      },
      { label: "Đối tác & trường học", href: "/admin/providers", icon: Building2 },
      {
        label: "Thêm đối tác / trường học",
        href: "/admin/provider-create",
        icon: PlusCircle,
      },
    ],
  },
  {
    label: "Cẩm nang",
    items: [
      { label: "Bài viết cẩm nang", href: "/admin/posts", icon: Newspaper },
      { label: "Viết bài mới", href: "/admin/post-create", icon: PenLine },
    ],
  },
  {
    label: "Tài liệu",
    items: [
      { label: "Tài liệu chia sẻ", href: "/admin/documents", icon: FileText },
      { label: "Lĩnh vực", href: "/admin/document-categories", icon: Layers },
      { label: "Trường đại học", href: "/admin/document-universities", icon: School },
      // Mon hoc cua kho tai lieu - khong phai danh muc khoa hoc.
      { label: "Môn học", href: "/admin/document-subjects", icon: Library },
    ],
  },
  // ---- Van hanh
  {
    label: "Học viên",
    items: [
      { label: "Người dùng", href: "/admin/users", icon: Users },
      { label: "Ghi danh khóa học", href: "/admin/enrollments", icon: ClipboardList },
      { label: "Chứng nhận", href: "/admin/certificates", icon: AwardIcon },
      { label: "Đánh giá khóa học", href: "/admin/reviews", icon: MessageSquare },
    ],
  },
  {
    label: "Bán hàng",
    items: [
      { label: "Đơn hàng", href: "/admin/orders", icon: Receipt },
      { label: "Mã giảm giá", href: "/admin/vouchers", icon: BadgePercent },
    ],
  },
  {
    label: "Trang chủ & hiển thị",
    items: [
      {
        label: "Khóa học nổi bật",
        href: "/admin/home-most-popular",
        icon: LayoutGrid,
        children: [
          { label: "Phổ biến nhất", href: "/admin/home-most-popular", icon: Award },
          { label: "Đang thịnh hành", href: "/admin/home-trending-now", icon: Flame },
          { label: "Mới phát hành", href: "/admin/home-new-releases", icon: Sparkles },
        ],
      },
      { label: "Cài đặt giao diện", href: "/admin/appearance", icon: Palette },
      { label: "Câu hỏi thường gặp", href: "/admin/faqs", icon: HelpCircle },
      { label: "Thông báo hệ thống", href: "/admin/notifications", icon: Bell },
    ],
  },
];

/** Chu tren khung quan tri. */
export const ADMIN_SHELL = {
  dashboardHref: "/admin/dashboard",
  loading: "Đang tải trang quản trị...",
  brand: "Learning Platform",
  brandSub: "Trang quản trị",
  root: "Quản trị",
  editing: "(đang sửa)",
  adminFallback: "Quản trị viên",
  adminRole: "Quản trị viên",
  logout: "Đăng xuất",
  toggle: "Ẩn/hiện thanh bên",
} as const;
