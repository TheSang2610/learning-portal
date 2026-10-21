import { COURSE_LEVEL_OPTIONS } from "@/src/constants/course";

/** Chu va duong dan cua trang /admin/course-create. */
export const ADMIN_COURSE_CREATE = {
  listHref: "/admin/courses",

  loading: "Đang tải biểu mẫu...",
  back: "Quay lại danh sách",
  title: "Thêm Khóa Học Mới",
  subtitle: "Cấu hình thông tin cơ bản, chọn nhiều danh mục tags và phân bổ giảng viên.",

  thumbnail: {
    inputId: "thumbnail-upload",
    label: "Ảnh bìa khóa học (Thumbnail)",
    previewAlt: "Preview",
    empty: "Chưa có ảnh",
    pick: "Chọn tệp ảnh từ máy tính",
    hint: "Chấp nhận định dạng định dạng JPG, PNG, WEBP. Tối đa 5MB.",
  },
  courseTitle: {
    label: "Tiêu đề khóa học",
    placeholder: "Ví dụ: Lập trình Fullstack Next.js Masterclass",
  },
  slug: { label: "Đường dẫn SEO (Slug)" },
  description: {
    label: "Mô tả tóm tắt",
    placeholder: "Mô tả nội dung cốt lõi của khóa học...",
  },
  price: { label: "Giá bán (VND)" },
  level: { label: "Trình độ học viên", options: COURSE_LEVEL_OPTIONS },
  provider: {
    label: "Đơn vị đối tác / Trường học liên kết",
    none: "-- Hệ thống LMS cấp chứng chỉ độc lập --",
    universityPrefix: "[Trường học] ",
    companyPrefix: "[Doanh nghiệp] ",
    add: "Thêm đối tác mới",
    namePlaceholder: "Tên trường / doanh nghiệp",
    typeUniversity: "Trường học",
    typeCompany: "Doanh nghiệp",
    logo: "Logo (không bắt buộc)",
    created: (name: string) => `Đã thêm đối tác "${name}" và chọn cho khóa học.`,
  },
  instructor: {
    label: "Giảng viên phụ trách khóa học",
    none: "-- Chọn Giảng viên phụ trách --",
    option: (name: string, email: string) => `${name} (${email})`,
    noneFound: "Lưu ý: Không tìm thấy tài khoản nào có vai trò Giảng viên (Instructor).",
  },
  categories: {
    label: "Danh mục liên kết (Có thể chọn nhiều)",
    add: "Thêm danh mục mới",
    namePlaceholder: "Tên danh mục mới, vd: Thiết kế UI/UX",
    selected: (n: number) => `Đã chọn ${n}`,
  },
  quickAdd: {
    open: "Thêm mới",
    save: "Thêm",
    saving: "Đang thêm...",
    cancel: "Hủy",
    needName: "Vui lòng nhập tên.",
    failed: "Không thêm được",
  },

  submit: { idle: "Tạo & Lưu Khóa Học", busy: "Đang xử lý..." },

  messages: {
    needCategory: "Vui lòng chọn ít nhất một danh mục!",
    needInstructor: "Vui lòng gán giảng viên đảm nhiệm!",
    needThumbnail: "Vui lòng tải lên ảnh bìa (Thumbnail) cho khóa học!",
    success: "Tạo khóa học thành công!",
    failure: "Tạo khóa học thất bại",
  },
} as const;
