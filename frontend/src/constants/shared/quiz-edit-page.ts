/**
 * Chu cua trang sua quiz - dung chung /admin/quiz-edit va /instructor/quiz-edit.
 * Phan khac theo vai tro nam o QUIZ_EDIT_ROLE.
 */
export const QUIZ_EDIT = {
  loading: "Đang tải cấu trúc đề thi...",

  header: { back: "Quay lại giáo trình", title: "Cập Nhật Bài Tập Trắc Nghiệm" },

  config: {
    title: "Tiêu đề Quiz",
    timeLimit: "Thời gian (Phút)",
    passingScore: "Điểm Đạt (%)",
    attempts: "Số lượt làm",
  },

  questions: {
    heading: (count: number) => `Danh sách câu hỏi (${count})`,
    add: "+ Thêm câu hỏi",
    textPlaceholder: "Nội dung câu hỏi...",
    options: "Các phương án:",
    addOption: "+ Thêm phương án",
    radioName: (qIndex: number) => `correct-ans-edit-${qIndex}`,
  },

  submit: { idle: "Lưu thay đổi", busy: "Đang cập nhật..." },

  messages: {
    notFound: "Không tìm thấy dữ liệu bài tập cho bài học này!",
    loadFailed: "Lỗi kết nối máy chủ khi tải bài tập.",
    atLeastOne: "Bài tập trắc nghiệm phải có ít nhất 1 câu hỏi!",
    needTitle: "Vui lòng nhập tiêu đề Quiz",
    noQuizId: "Lỗi định danh bài tập, không thể cập nhật.",
    success: "Cập nhật bài tập trắc nghiệm thành công!",
    fallbackError: "Hệ thống gặp trục trặc.",
    failure: (detail: string) => `Lỗi cập nhật: ${detail}`,
  },
} as const;

export type QuizEditRole = "admin" | "instructor";

export const QUIZ_EDIT_ROLE: Record<
  QuizEditRole,
  {
    lessonsHref: (courseId: string) => string;
    /** Banner che do giang vien; null = khong hien. */
    notice: { title: string; text: string } | null;
    /** Le tren/duoi rong hon nhu trang admin cu. */
    roomy: boolean;
  }
> = {
  instructor: {
    lessonsHref: (courseId) => `/instructor/lessons?courseId=${courseId}`,
    notice: {
      title: "Chế độ Giảng viên (Instructor Mode)",
      text: "Mọi thay đổi tại đây sẽ cập nhật trực tiếp vào kho lưu trữ học liệu của bạn.",
    },
    roomy: false,
  },
  admin: {
    lessonsHref: (courseId) => `/admin/lessons?courseId=${courseId}`,
    notice: null,
    roomy: true,
  },
};
