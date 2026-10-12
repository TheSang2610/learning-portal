/**
 * Chu cua trang soan quiz moi - dung chung /admin/quiz-create va
 * /instructor/quiz-create. Phan khac theo vai tro nam o QUIZ_CREATE_ROLE.
 */
export const QUIZ_CREATE = {
  header: { back: "Quay lại giáo trình", title: "Soạn Thảo Bài Tập Quiz" },

  config: {
    heading: "1. Cấu hình bài kiểm tra",
    title: "Tiêu đề Quiz",
    titlePlaceholder: "Ví dụ: Quiz ôn tập Kiến thức bài 1",
    lesson: "Gắn vào Bài học (Lesson)",
    noLesson: "-- Bài tập tổng hợp (Không chọn bài học) --",
    timeLimit: "Thời gian (Phút)",
    passingScore: "Điểm Đạt (%)",
    attempts: "Số lượt làm",
    description: "Mô tả / Hướng dẫn làm bài",
    descriptionPlaceholder: "Đọc kỹ câu hỏi trước khi chọn đáp án...",
  },

  questions: {
    heading: (count: number) => `2. Danh sách câu hỏi (${count})`,
    add: "Thêm câu hỏi",
    text: (no: number) => `Nội dung câu hỏi #${no}`,
    textPlaceholder: "Nhập câu hỏi...",
    points: "Điểm câu này",
    options: "Các phương án lựa chọn:",
    addOption: "+ Thêm phương án",
    optionPlaceholder: (no: number) => `Nhập phương án lựa chọn thứ ${no}`,
    radioName: (qIndex: number) => `correct-ans-${qIndex}`,
  },

  submit: { idle: "Hoàn tất lưu Quiz", busy: "Đang lưu hệ thống..." },

  messages: {
    atLeastOne: "Bài trắc nghiệm phải có ít nhất 1 câu hỏi!",
    needTitle: "Vui lòng nhập tiêu đề Quiz",
    success: "Tạo bài tập trắc nghiệm (Quiz) thành công!",
    unknownError: "Lỗi không xác định từ hệ thống",
    failure: (detail: string) => `Không thể tạo Quiz: ${detail}`,
  },
} as const;

export type QuizCreateRole = "admin" | "instructor";

export const QUIZ_CREATE_ROLE: Record<
  QuizCreateRole,
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
      text: "Quiz mới tạo sẽ được lưu dưới dạng bản nháp đính kèm khóa học của bạn.",
    },
    roomy: false,
  },
  admin: {
    lessonsHref: (courseId) => `/admin/lessons?courseId=${courseId}`,
    notice: null,
    roomy: true,
  },
};
