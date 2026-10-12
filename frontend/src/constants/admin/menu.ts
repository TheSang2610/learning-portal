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
  Library,
  MessageSquare,
  Newspaper,
  PlusCircle,
  Receipt,
  Sparkles,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";

export interface AdminSubMenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Muc chi hien khi dang o trang con (vd. dang soan bai hoc). */
  isIndicatorOnly?: boolean;
  /** Cac duong dan lam muc nay sang. Mac dinh: chi dung href. */
  activeRoutes?: string[];
}

export interface AdminMenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
  isHomeSectionGroup?: boolean;
  submenu?: AdminSubMenuItem[];
  // Muc phang mac dinh sang khi pathname trung khop chinh xac href. Trang nao
  // co them man hinh soan thao rieng thi liet ke o day de van sang khi dang soan.
  matchRoutes?: string[];
}

// ===== NHOM ROUTE PHANG (URL khong con long nhau) =====
export const COURSE_ROUTES = [
  "/admin/courses",
  "/admin/course-create",
  "/admin/course-detail",
  "/admin/course-faqs",
  "/admin/categories",
  "/admin/category-create",
  "/admin/providers",
];

export const LESSON_ROUTES = [
  "/admin/lessons",
  "/admin/lesson-create",
  "/admin/lesson-detail",
  "/admin/quiz-create",
  "/admin/quiz-edit",
];

export const POST_ROUTES = ["/admin/posts", "/admin/post-create"];

export const HOME_SECTION_ROUTES = [
  "/admin/home-most-popular",
  "/admin/home-trending-now",
  "/admin/home-new-releases",
];

export const ADMIN_MENU: AdminMenuItem[] = [
  {
    label: "Tổng quan",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Quản lý khóa học",
    href: "/admin/courses",
    icon: BookOpen,
    submenu: [
      {
        label: "Tất cả khóa học",
        href: "/admin/courses",
        icon: BookOpen,
        activeRoutes: ["/admin/courses", "/admin/course-detail", "/admin/course-faqs"],
      },
      { label: "Tạo khóa học", href: "/admin/course-create", icon: PlusCircle },
      {
        label: "Danh mục",
        href: "/admin/categories",
        icon: FolderOpen,
        activeRoutes: ["/admin/categories", "/admin/category-create"],
      },
      { label: "Đơn vị đào tạo", href: "/admin/providers", icon: Building2 },
      {
        label: "Nội dung bài học",
        href: "",
        icon: Video,
        isIndicatorOnly: true,
        activeRoutes: LESSON_ROUTES,
      },
    ],
  },
  { label: "Đơn hàng", href: "/admin/orders", icon: Receipt },
  {
    label: "Mục trang chủ",
    href: "/admin/home-most-popular",
    icon: LayoutGrid,
    isHomeSectionGroup: true,
    submenu: [
      { label: "Phổ biến nhất", href: "/admin/home-most-popular", icon: Award },
      { label: "Đang thịnh hành", href: "/admin/home-trending-now", icon: Flame },
      { label: "Mới phát hành", href: "/admin/home-new-releases", icon: Sparkles },
    ],
  },
  // Dat canh Orders vi cung mot mach viec: tien vao he thong va duoc giam bao
  // nhieu.
  { label: "Mã giảm giá", href: "/admin/vouchers", icon: BadgePercent },
  { label: "Thông báo hệ thống", href: "/admin/notifications", icon: Bell },
  { label: "Ghi danh", href: "/admin/enrollments", icon: ClipboardList },
  { label: "Chứng nhận", href: "/admin/certificates", icon: AwardIcon },
  { label: "Người dùng", href: "/admin/users", icon: Users },
  { label: "Đánh giá", href: "/admin/reviews", icon: MessageSquare },
  {
    label: "Bài viết",
    href: "/admin/posts",
    icon: Newspaper,
    matchRoutes: POST_ROUTES,
  },
  { label: "Tài liệu chia sẻ", href: "/admin/documents", icon: FileText },
  // Rieng cho kho tai lieu - khong phai "Categories" cua khoa hoc o tren.
  { label: "Môn học tài liệu", href: "/admin/document-subjects", icon: Library },
  { label: "Câu hỏi thường gặp", href: "/admin/faqs", icon: HelpCircle },
];

/** Chu tren khung quan tri. */
export const ADMIN_SHELL = {
  dashboardHref: "/admin/dashboard",
  loading: "Đang tải trang quản trị...",
  brand: "TRANG QUẢN TRỊ",
  groupFeatures: "Tổng quan",
  groupComponents: "Chức năng",
  editingSuffix: "(Đang sửa)",
  adminFallback: "Quản trị viên",
  adminRole: "Quản trị cấp cao",
  logoutTitle: "Đăng xuất",
  home: "Trang chủ",
} as const;
