/**
 * Ba trang xem thu hang khoa hoc tren trang chu cua admin:
 * /admin/home-most-popular, /admin/home-trending-now, /admin/home-new-releases.
 * Cung mot bo cuc, chi khac nguon du lieu, cot so lieu va chu.
 *
 * Ba muc nay TU XEP theo luot xem va ngay tao (backend/src/utils/viewCount.js),
 * admin khong ghim tay nua - trang nay chi de xem khoa nao dang len trang chu.
 */
export const ADMIN_HOME_SECTION_COMMON = {
  searchPlaceholder: "Tìm kiếm khóa học...",
  empty: "Không tìm thấy khóa học nào.",
  noImage: "https://placehold.co/150x100?text=No+Image",
  columns: {
    course: "Khóa học",
    instructor: "Giảng viên / Cấp độ",
    showOnHome: "Trang chủ",
  },
  instructorFallback: (id: string) => `ID: ${id}`,
  views: "lượt xem",
  noDate: "N/A",
  onHome: (rank: number) => `Đang hiện #${rank}`,
  offHome: "—",
} as const;

/** So khoa moi muc hien ngoai trang chu - khop COURSE_COUNT trong getHomeSections. */
export const HOME_COURSE_COUNT = 5;

export const ADMIN_HOME_SECTIONS = {
  popular: {
    loading: "Đang tải danh sách phổ biến...",
    title: "Most Popular Section",
    description:
      "Tự xếp theo tổng lượt xem từ trước tới nay, không bao giờ reset. Mỗi lần học viên mở trang khóa học hoặc trang học (kể cả F5) là một lượt.",
    metricColumn: "Tổng lượt xem",
    loadError: "Lỗi lấy danh sách khóa học phổ biến:",
  },
  trending: {
    loading: "Đang tải danh sách xu hướng...",
    title: "Trending Now Section",
    description:
      "Tự xếp theo lượt xem trong tháng này, sang tháng mới tự về 0. Khi chưa đủ 5 khóa có lượt xem trong tháng, trang chủ bù bằng khóa phổ biến nhất.",
    metricColumn: "Lượt xem tháng này",
    loadError: "Lỗi lấy danh sách khóa học xu hướng:",
  },
  newReleases: {
    loading: "Đang tải danh sách mới phát hành...",
    title: "New Releases Section",
    description: "Tự xếp theo ngày tạo, khóa mới nhất đứng đầu.",
    metricColumn: "Ngày Tạo",
    loadError: "Lỗi lấy danh sách khóa học mới phát hành:",
  },
} as const;

export type AdminHomeSectionKind = keyof typeof ADMIN_HOME_SECTIONS;
