/** Chu va duong dan cua trang /admin/courses. */
export const ADMIN_COURSES = {
  createHref: "/admin/course-create",
  lessonsHref: (id: string) => `/admin/lessons?courseId=${id}`,
  faqsHref: (id: string) => `/admin/course-faqs?courseId=${id}`,
  detailHref: (id: string) => `/admin/course-detail?courseId=${id}`,

  loading: "Đang tải khóa học…",
  title: "Danh sách khóa học",
  /** {n} = tong so khoa, {p} = so khoa da xuat ban. */
  subtitle: "{n} khóa học · {p} đã xuất bản",
  create: "Tạo khóa học mới",

  searchPlaceholder: "Tìm theo tên khóa học…",
  statusFilter: [
    { value: "", label: "Mọi trạng thái" },
    { value: "published", label: "Đã xuất bản" },
    { value: "draft", label: "Bản nháp" },
  ],

  columns: ["Khóa học", "Cấp độ", "Học phí", "Trạng thái", ""],
  free: "Miễn phí",
  published: "Đã xuất bản",
  draft: "Bản nháp",
  actions: {
    lessons: "Bài học",
    faqs: "Hỏi đáp",
    edit: "Sửa",
    delete: "Xóa",
    deleting: "Đang xóa…",
  },
  empty: "Chưa có khóa học nào.",
  noMatch: "Không có khóa học nào khớp bộ lọc.",

  messages: {
    confirmDelete: (title: string) =>
      `Xóa khóa học "${title}"?\n\nToàn bộ bài học và bài kiểm tra bên trong cũng bị xóa. Không thể hoàn tác.`,
    deleted: "Đã xóa khóa học.",
    deleteFailed: "Không xóa được khóa học. Kiểm tra lại quyền quản trị.",
  },
} as const;
