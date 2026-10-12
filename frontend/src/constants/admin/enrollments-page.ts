/** Chu va cau hinh cua trang /admin/enrollments. */
export const ADMIN_ENROLLMENTS = {
  pageSize: 10,
  statuses: ["active", "completed", "dropped"] as const,
  statusLabel: {
    active: "Đang học",
    completed: "Hoàn thành",
    dropped: "Đã bỏ",
  } as Record<string, string>,

  title: "Ghi danh",
  loading: "Đang tải...",
  count: (n: number) => `${n} lượt ghi danh`,
  allCourses: "Mọi khóa học",
  allStatuses: "Mọi trạng thái",

  columns: {
    student: "Học viên",
    course: "Khóa học",
    progress: "Tiến độ",
    score: "Điểm",
    enrolledAt: "Ghi danh",
    status: "Trạng thái",
  },
  empty: "Không có lượt ghi danh nào.",
  deleted: "(đã xóa)",
  none: "--",
  changeStatusTitle: "Đổi trạng thái",

  messages: {
    loadFailed: "Không tải được danh sách ghi danh",
    changeFailed: "Không đổi được trạng thái",
  },

  gift: {
    heading: "Tặng khóa học",
    hint: "Mở khóa miễn phí cho một học viên, không cần đơn hàng. Học viên nhận thông báo ngay.",
    searchPlaceholder: "Tìm học viên theo tên hoặc email",
    searching: "Đang tìm…",
    noMatch: "Không có ai khớp.",
    change: "Đổi",
    chooseCourse: "— Chọn khóa học —",
    submit: "Tặng khóa",
    busy: "Đang tặng…",
    failed: "Không tặng được khóa học",
    /** Cho bao lau sau lan go cuoi moi tim nguoi (ms). */
    searchDelay: 350,
    searchLimit: 6,
  },
} as const;
