/** Chu cua trang /admin/course-faqs?courseId=... (FAQ rieng cua mot khoa). */
export const ADMIN_COURSE_FAQS = {
  backHref: "/admin/courses",
  back: "Back to Courses",

  title: "Course FAQs Management",
  intro: (courseId: string) =>
    `Thiết lập danh sách câu hỏi giải đáp thắc mắc hiển thị riêng cho khóa học này (ID: ${courseId}).`,
  add: "Add Course FAQ",

  loading: "Loading course questions...",
  errorTitle: "Lỗi tải dữ liệu",
  emptyTitle: "Khóa học này chưa có câu hỏi FAQ nào",
  emptyHint: 'Bấm nút "Add Course FAQ" ở trên để bổ trợ nội dung giải đáp cho học viên.',
  questionPrefix: (n: number) => `Q${n}`,

  modal: {
    createTitle: "Add New Course FAQ",
    editTitle: "Edit Course FAQ",
    question: "Question",
    questionPlaceholder: "Yêu cầu cấu hình tối thiểu để học mượt bài thực hành?",
    answer: "Answer",
    answerPlaceholder: "Bạn chỉ cần một chiếc máy tính RAM từ 4GB trở lên...",
    cancel: "Cancel",
    save: "Save Changes",
    create: "Add FAQ",
  },

  messages: {
    loadFailed: "Không thể tải danh sách câu hỏi của khóa học.",
    updated: "Cập nhật câu hỏi khóa học thành công!",
    created: "Thêm câu hỏi mới cho khóa học thành công!",
    saveFailed: "Không thể lưu dữ liệu.",
    confirmDelete: "Bạn có chắc chắn muốn xóa câu hỏi này khỏi khóa học?",
    deleted: "Xóa câu hỏi thành công!",
    deleteFailed: "Xóa thất bại.",
  },
} as const;
