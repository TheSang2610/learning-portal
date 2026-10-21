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

  /** Cua so xem truoc bai hoc - hien dung nhu hoc vien thay, kem dap an cho quan tri. */
  preview: {
    openHint: "Bấm để xem trước bài học",
    title: "Xem trước bài học",
    subtitle: "Hiển thị giống trang học của học viên, kèm đáp án để kiểm tra.",
    close: "Đóng",
    prev: "Bài trước",
    next: "Bài sau",
    position: (i: number, n: number) => `Bài ${i} / ${n}`,
    loading: "Đang tải bài học...",
    loadFailed: "Không tải được bài học.",
    lessonLabel: (i: number) => `Bài ${i}`,
    duration: "Thời lượng",
    content: "Nội dung bài học",
    noContent: "Bài này chưa có phần mô tả.",
    document: "Tài liệu đính kèm",
    openDocument: "Mở tài liệu",
    quizHeading: "Bài tập",
    quizPublished: "Đang công bố — học viên thấy",
    quizDraft: "Bản nháp — học viên chưa thấy",
    passingScore: (n: number) => `Điểm đạt ${n}%`,
    timeLimit: (n: number | null) => (n ? `${n} phút` : "Không giới hạn thời gian"),
    attempts: (n: number) => `${n} lượt làm`,
    totalPoints: (n: number) => `${n} điểm`,
    shuffledQuestions: "Đảo câu hỏi",
    shuffledOptions: "Đảo đáp án",
    showAnswers: "Hiện đáp án sau khi nộp",
    question: (i: number) => `Câu ${i}`,
    points: (n: number) => `${n} điểm`,
    types: {
      multiple_choice: "Trắc nghiệm",
      true_false: "Đúng / Sai",
      short_answer: "Trả lời ngắn",
      essay: "Tự luận",
    } as Record<string, string>,
    correct: "Đáp án đúng",
    answerLabel: "Đáp án:",
    essayNote: "Câu tự luận — giảng viên chấm tay.",
    explanation: "Giải thích:",
    noQuestions: "Bài tập chưa có câu hỏi nào.",
  },

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
