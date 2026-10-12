/** Chu va duong dan cua trang /admin/lessons. */
export const ADMIN_LESSONS = {
  courseDetailHref: (courseId: string) => `/admin/course-detail?courseId=${courseId}`,
  lessonCreateHref: (courseId: string) => `/admin/lesson-create?courseId=${courseId}`,
  lessonDetailHref: (courseId: string, lessonId: string) =>
    `/admin/lesson-detail?courseId=${courseId}&lessonId=${lessonId}`,
  quizCreateHref: (courseId: string, lessonId: string) =>
    `/admin/quiz-create?courseId=${courseId}&lessonId=${lessonId}`,
  quizEditHref: (courseId: string, lessonId: string) =>
    `/admin/quiz-edit?courseId=${courseId}&lessonId=${lessonId}`,

  loading: "Đang tải giáo trình bài học...",

  header: {
    back: "Quay lại chi tiết khóa học",
    title: "Quản Lý Bài Học",
    courseLabel: "Khóa học:",
    addLesson: "Thêm bài học mới",
  },

  columns: ["Tên bài học", "Thời lượng", "Trạng thái bài tập (Quiz)", "Hành động"],

  row: {
    minutes: "phút",
    noDuration: "--:--",
    quizPublished: "Đang Công Bố",
    quizDraft: "Bản Nháp (Ẩn)",
    questions: (n: number) => `(${n} câu hỏi)`,
    noQuiz: "Chưa có bài tập",
    addQuiz: "Thêm Quiz",
    editQuiz: "Sửa Quiz",
    hideQuiz: "Ẩn Quiz",
    showQuiz: "Hiện Quiz",
    deleteQuiz: "Xóa Quiz",
    separator: "|",
    editLesson: "Sửa Bài",
    deleteLesson: "Xóa Bài",
  },

  empty: "📭 Giáo trình trống. Vui lòng bấm nút phía trên để thêm bài giảng đầu tiên!",

  messages: {
    courseFallback: "Khóa học",
    loadErrorLog: "Lỗi lấy dữ liệu quản trị:",
    confirmDeleteLesson: "Bạn có chắc chắn muốn xóa bài học này khỏi giáo trình?",
    lessonDeleted: "Xóa bài học thành công!",
    lessonDeleteFailed: "Xóa bài học thất bại.",
    confirmDeleteQuiz: "Bạn có chắc chắn muốn xóa HOÀN TOÀN bài trắc nghiệm này không?",
    quizDeleted: "Xóa bài tập trắc nghiệm thành công!",
    quizDeleteFailed: "Không thể xóa bài tập này.",
    quizToggled: "Cập nhật trạng thái hiển thị thành công!",
    quizToggleFailed: "Lỗi thao tác trạng thái công bố.",
  },
} as const;
