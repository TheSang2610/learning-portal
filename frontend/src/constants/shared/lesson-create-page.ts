/**
 * Chu cua trang them bai hoc - dung chung /admin/lesson-create va
 * /instructor/lesson-create. Phan khac nhau theo vai tro nam o LESSON_CREATE_ROLE.
 */
export const LESSON_CREATE = {
  header: {
    back: "Quay lại giáo trình",
    title: "Thêm Bài Học Mới",
    subtitle: "Thiết kế cấu trúc video bài giảng và nội dung đính kèm.",
  },

  title: {
    label: "Tên bài học / Tiêu đề",
    placeholder: "Ví dụ: Bài 1: Tổng quan cấu trúc và cài đặt môi trường",
  },
  video: {
    label: "Video bài học",
    placeholder: "Dán link: YouTube, Vimeo, Cloudinary...",
    or: "hoặc tải tệp lên",
    selected: "Đã chọn",
  },
  document: {
    label: "Tài liệu đính kèm",
    optional: "(không bắt buộc)",
    placeholder: "Dán link tài liệu (PDF, slide, Google Drive...)",
    selected: "Đã chọn",
  },
  clearFile: "Bỏ chọn",
  duration: { label: "Thời lượng (phút)", placeholder: "Ví dụ: 15" },
  order: { label: "Thứ tự trong khóa" },
  description: {
    label: "Tóm tắt nội dung bài học",
    placeholder:
      "Ghi chú những phần kiến thức cốt lõi học viên sẽ nhận được sau bài học này...",
  },

  actions: {
    cancel: "Hủy bỏ",
    uploading: (percent: number) => `Đang tải video lên... ${percent}%`,
    submitting: "Đang tạo...",
    submit: "Xác nhận thêm bài học",
  },

  messages: {
    needTitle: "Vui lòng nhập tiêu đề bài học!",
    needCourse: "Thiếu mã khóa học, hãy mở lại từ trang giáo trình.",
    success: "Thêm bài học mới thành công!",
    failure: "Đã xảy ra lỗi khi tạo bài học mới.",
  },
} as const;

export type LessonCreateRole = "admin" | "instructor";

export const LESSON_CREATE_ROLE: Record<
  LessonCreateRole,
  {
    lessonsHref: (courseId: string) => string;
    /** Banner che do giang vien; null = khong hien. */
    notice: { title: string; text: string } | null;
    /** Cau noi tiep sau ten tep video da chon. */
    videoSelectedNote: string;
    /** Tieu de lon (text-3xl) nhu trang admin cu. */
    largeTitle: boolean;
  }
> = {
  instructor: {
    lessonsHref: (courseId) => `/instructor/lessons?courseId=${courseId}`,
    notice: {
      title: "Chế độ Giảng viên (Instructor Mode)",
      text: "Bài học mới tạo sẽ nằm trong giáo trình bản nháp của bạn. Học viên chỉ có thể học khi khóa học tổng thể được Admin phê duyệt.",
    },
    videoSelectedNote:
      " — tệp này sẽ được dùng thay cho ô link ở trên. Video được lưu kín: chỉ học viên đã mua khóa mới xem được.",
    largeTitle: false,
  },
  admin: {
    lessonsHref: (courseId) => `/admin/lessons?courseId=${courseId}`,
    notice: null,
    videoSelectedNote: " — tệp này sẽ được dùng thay cho ô link ở trên.",
    largeTitle: true,
  },
};
