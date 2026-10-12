/** Chu va duong dan cua trang /instructor/lessons. */
export const INSTRUCTOR_LESSONS = {
  courseDetailHref: (courseId: string) =>
    `/instructor/course-detail?courseId=${courseId}`,
  lessonCreateHref: (courseId: string) =>
    `/instructor/lesson-create?courseId=${courseId}`,
  lessonDetailHref: (courseId: string, lessonId: string) =>
    `/instructor/lesson-detail?courseId=${courseId}&lessonId=${lessonId}`,
  quizCreateHref: (courseId: string, lessonId: string) =>
    `/instructor/quiz-create?courseId=${courseId}&lessonId=${lessonId}`,
  quizEditHref: (courseId: string, lessonId: string) =>
    `/instructor/quiz-edit?courseId=${courseId}&lessonId=${lessonId}`,
  quizStatsHref: (courseId: string, lessonId: string, quizId: string) =>
    `/instructor/quiz-stats?courseId=${courseId}&lessonId=${lessonId}&quizId=${quizId}`,

  loading: "Đang tải giáo trình bài học...",
  courseFallback: "Khóa học",

  header: {
    back: "Quay lại thông tin chung",
    title: "Quản Lý Giáo Trình Bài Học",
    courseLabel: "Khóa học:",
    addLesson: "Thêm bài học mới",
  },

  columns: ["Tên bài giảng", "Thời lượng", "Bài tập (Quiz)", "Hành động"],

  row: {
    minutes: "phút",
    noDuration: "--:--",
    quizOpen: "Đang mở",
    quizHidden: "Ẩn",
    questions: "câu",
    noQuiz: "Chưa có",
    addQuiz: "+ Quiz",
    viewScores: "Xem điểm",
    editQuiz: "Sửa Quiz",
    hide: "Ẩn",
    show: "Hiện",
    separator: "|",
    editLesson: "Sửa Bài",
    deleteLesson: "Xóa",
  },

  empty: "📭 Chưa có bài giảng nào trong hệ thống cấu trúc nháp này.",

  messages: {
    confirmDelete: "Bạn có chắc muốn xóa bài học này khỏi giáo trình?",
    deleted: "Xóa bài học thành công!",
    deleteFailed: "Xóa bài học thất bại.",
    quizToggled: "Cập nhật trạng thái thành công!",
    quizToggleFailed: "Lỗi cập nhật trạng thái hiển thị Quiz.",
  },
} as const;
