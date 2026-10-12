import { COURSE_LEVEL_OPTIONS } from "@/src/constants/course";
import type { User } from "@/src/services/userApi";

/** Chu va cau hinh cua trang /admin/course-detail. */
export const ADMIN_COURSE_DETAIL = {
  listHref: "/admin/courses",
  lessonsHref: (courseId: string) => `/admin/lessons?courseId=${courseId}`,

  /**
   * Nguoi dang thao tac. Trang nay CHUA doc danh tinh that ma gan cung mot
   * quan tri vien - giu nguyen hanh vi cu (luon coi la admin).
   */
  assumedUser: {
    _id: "current_user_id",
    name: "Quản trị viên",
    email: "admin@gmail.com",
    role: "admin",
  } satisfies User,

  loading: "Đang tải cấu trúc dữ liệu khóa học...",
  back: "Quay lại danh sách",
  title: "Studio Quản Lý Khóa Học",

  publish: {
    label: "Trạng thái hiển thị",
    published: "Đang Công Khai",
    draft: "Bản Nháp (Ẩn)",
    busy: "Đang xử lý...",
    unpublish: "Gỡ bài xuống (Draft)",
    publishColor: "Phát hành (Publish)",
  },
  instructorNotice:
    "⚠️ Bạn đang đăng nhập dưới quyền **Giảng viên (Instructor)**. Bạn có toàn quyền sửa đổi nội dung bài giảng, ảnh bìa và giá bán, nhưng quyền **Xét duyệt công khai** khóa học lên trang chủ thuộc về Admin.",

  sectionTitle: "Thông tin chi tiết cấu hình khóa học",
  thumbnail: {
    label: "Ảnh đại diện khóa học (Thumbnail)",
    alt: "Course thumbnail",
    empty: "Chưa có ảnh đại diện",
  },
  courseTitle: "Tiêu đề khóa học",
  price: "Giá bán (VND)",
  accessDays: "Thời hạn học (ngày)",
  accessDaysHint:
    "Áp dụng cho khóa có phí, tính từ lúc thanh toán. Khóa miễn phí luôn học không giới hạn.",
  slug: "Đường dẫn SEO (Slug)",
  description: "Mô tả chi tiết khóa học",
  level: { label: "Trình độ học viên hướng tới", options: COURSE_LEVEL_OPTIONS },
  provider: {
    label: "Đơn vị đối tác / Trường học liên kết",
    none: "-- Hệ thống LMS cấp chứng chỉ độc lập --",
    universityPrefix: "[Trường học] ",
    companyPrefix: "[Doanh nghiệp] ",
  },
  instructor: {
    label: "Giảng viên phụ trách khóa học",
    none: "-- Chọn giảng viên --",
    option: (name: string, email: string) => `${name} (${email})`,
  },
  categories: "Danh mục liên kết phân loại (Chọn nhiều)",

  actions: {
    save: "Lưu thay đổi khóa học",
    lessons: "Quản lý giáo trình bài học (Nội dung)",
  },

  messages: {
    loadFailed: "Lỗi đồng bộ dữ liệu hệ thống.",
    needCategory: "Vui lòng chọn ít nhất một danh mục!",
    saved: "Cập nhật thông tin khóa học thành công!",
    saveFailed: "Cập nhật thông tin thất bại.",
    notAdmin:
      "Hành động bị từ chối: Chỉ quản trị viên tối cao (Admin) mới có quyền thay đổi trạng thái hiển thị khóa học!",
    publishChanged: (published: boolean) =>
      `Đã chuyển khóa học sang trạng thái: ${published ? "CÔNG KHAI" : "BẢN NHÁP"}`,
    publishFailed:
      "Lỗi phân quyền hoặc đường truyền không thể cập nhật trạng thái xuất bản.",
  },
} as const;
