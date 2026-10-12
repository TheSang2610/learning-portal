import { COURSE_LEVEL_OPTIONS, PROVIDER_NONE_LABEL } from "@/src/constants/course";

/** Chu va cau hinh tinh cua trang /instructor/course-detail. */
export const INSTRUCTOR_COURSE_DETAIL = {
  backHref: "/instructor/courses",
  lessonsHref: (courseId: string) => `/instructor/lessons?courseId=${courseId}`,

  loading: "Đang tải cấu trúc dữ liệu khóa học...",

  header: {
    back: "Quay lại danh sách",
    title: "Thiết Kế Khóa Học",
    statusLabel: "Trạng thái:",
    published: "Đang Công Khai",
    draft: "Bản Nháp (Chờ duyệt)",
  },

  notice: {
    before:
      "Bạn có quyền chỉnh sửa toàn bộ nội dung khóa học và bài giảng. Trạng thái hiển thị chính thức trên website sẽ do ",
    strong: "Admin kiểm duyệt",
    after: ".",
  },

  thumbnail: {
    label: "Ảnh đại diện (Thumbnail)",
    alt: "Thumbnail",
    empty: "Chưa có ảnh đại diện",
  },
  title: { label: "Tiêu đề khóa học" },
  price: { label: "Giá bán (VND)" },
  description: { label: "Mô tả khóa học" },
  level: { label: "Trình độ", options: COURSE_LEVEL_OPTIONS },
  provider: {
    label: "Đơn vị cấp chứng chỉ liên kết",
    none: PROVIDER_NONE_LABEL,
    universityPrefix: "[Trường] ",
    companyPrefix: "[DN] ",
  },
  categories: { label: "Danh mục phân loại" },

  actions: {
    save: "Lưu thay đổi khóa học",
    lessons: "Quản lý giáo trình bài học & Quiz",
  },

  messages: {
    loadFailed: "Lỗi đồng bộ dữ liệu hệ thống.",
    needCategory: "Vui lòng chọn ít nhất một danh mục!",
    success: "Cập nhật thông tin khóa học thành công! Chờ Admin phê duyệt.",
    failure: "Cập nhật thông tin thất bại.",
  },
} as const;
