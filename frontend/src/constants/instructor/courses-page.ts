/** Chu va cau hinh tinh cua trang /instructor/courses. */
export const INSTRUCTOR_COURSES = {
  createHref: "/instructor/course-create",
  detailHref: (courseId: string) => `/instructor/course-detail?courseId=${courseId}`,
  fallbackThumbnail: "https://res.cloudinary.com/demo/image/upload/sample.jpg",

  loading: "Đang tải danh sách khóa học của bạn...",

  header: {
    title: "Khóa học của tôi",
    subtitle: "Quản lý và cập nhật nội dung các chương trình giảng dạy.",
    create: "Tạo khóa học mới",
  },

  empty: {
    title: "Chưa có khóa học nào",
    text: "Bạn chưa khởi tạo chương trình giảng dạy nào trên hệ thống LMS.",
    action: "Bắt đầu tạo khóa học đầu tiên",
  },

  card: {
    published: "Đang phát hành",
    draft: "Bản nháp",
    noCategory: "Chưa phân loại",
    noDescription: "Chưa có mô tả chi tiết cho khóa học này.",
    students: "học viên",
    free: "Miễn phí",
    edit: "Chỉnh sửa nội dung & Bài học",
  },
} as const;
