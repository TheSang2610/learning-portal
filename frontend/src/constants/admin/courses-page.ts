/** Chu va duong dan cua trang /admin/courses. */
export const ADMIN_COURSES = {
  createHref: "/admin/course-create",
  lessonsHref: (id: string) => `/admin/lessons?courseId=${id}`,
  faqsHref: (id: string) => `/admin/course-faqs?courseId=${id}`,
  detailHref: (id: string) => `/admin/course-detail?courseId=${id}`,

  loading: "Loading courses...",
  title: "Courses",
  subtitle: "Manage your LMS courses",
  create: "Create Course",

  columns: ["Title", "Level", "Price", "Status", "Actions"],
  free: "Miễn phí",
  published: "Published",
  draft: "Draft",
  actions: {
    lessons: "Bài học",
    faqs: "Hỏi đáp",
    edit: "Sửa",
    delete: "Xóa",
    deleting: "Đang xóa...",
  },
  empty: "📭 Không tìm thấy khóa học nào trong hệ thống quản trị.",

  messages: {
    confirmDelete: (title: string) =>
      `⚠️ CẢNH BÁO NGUY HIỂM!\n\nBạn có chắc chắn muốn xóa khóa học: "${title}"?\nHành động này sẽ xóa toàn bộ bài học, bài tập trắc nghiệm (quiz) bên trong và KHÔNG THỂ HOÀN TÁC!`,
    deleted: "Xóa khóa học và toàn bộ dữ liệu liên quan thành công!",
    deleteFailed: "Không thể xóa khóa học. Vui lòng kiểm tra lại phân quyền Admin.",
  },
} as const;
