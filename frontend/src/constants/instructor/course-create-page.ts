import { COURSE_LEVEL_OPTIONS, PROVIDER_NONE_LABEL } from "@/src/constants/course";

/** Toan bo chu va cau hinh tinh cua trang /instructor/course-create. */
export const INSTRUCTOR_COURSE_CREATE = {
  backHref: "/instructor/courses",
  detailHref: (courseId: string) => `/instructor/course-detail?courseId=${courseId}`,

  loading: "Đang đồng bộ biểu mẫu hệ thống...",

  header: {
    title: "Tạo khóa học mới",
    subtitle: "Bước 1: Thiết lập các thông tin hiển thị cơ bản bên ngoài.",
  },

  thumbnail: {
    inputId: "instructor-thumb-upload",
    label: "Ảnh bìa khóa học (Thumbnail) *",
    previewAlt: "Preview",
    emptyPreview: "Khung xem trước",
    pick: "Chọn tệp ảnh từ máy tính",
    hint: "Hỗ trợ định dạng JPG, PNG, WEBP. Tỉ lệ khuyên dùng 16:9.",
  },

  title: {
    label: "Tiêu đề khóa học *",
    placeholder: "Ví dụ: Lập trình Fullstack Next.js Masterclass",
  },
  slug: { label: "Đường dẫn SEO (Slug)" },
  price: { label: "Giá bán (VND) *" },
  level: {
    label: "Trình độ học viên hướng tới",
    options: COURSE_LEVEL_OPTIONS,
  },
  provider: {
    label: "Đơn vị đối tác / Trường học liên kết công tác",
    none: PROVIDER_NONE_LABEL,
    universityPrefix: "[Trường học] ",
    companyPrefix: "[Doanh nghiệp] ",
  },
  description: {
    label: "Mô tả tóm tắt",
    placeholder: "Mô tả nội dung cốt lõi của khóa học...",
  },
  categories: { label: "Danh mục liên kết học thuật (Có thể chọn nhiều) *" },

  submit: {
    idle: "Khởi tạo & Tiếp tục xây dựng giáo trình",
    busy: "Đang xử lý...",
  },

  messages: {
    needCategory: "Vui lòng chọn ít nhất một danh mục phân loại!",
    needThumbnail: "Vui lòng đính kèm ảnh bìa khóa học!",
    success: "Khởi tạo cấu trúc khóa học thành công! (Trạng thái: Bản nháp chờ duyệt)",
    failure: "Xử lý biểu mẫu thất bại. Vui lòng kiểm tra lại kết nối hoặc dữ liệu.",
  },
} as const;
