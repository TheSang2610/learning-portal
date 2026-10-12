/** Chu va cau hinh cua trang /instructor/questions (hoi dap cua hoc vien). */
export const INSTRUCTOR_QUESTIONS = {
  /** So ky tu toi da cua mot cau tra loi. */
  maxLength: 2000,
  courseHref: (slug: string) => `/course?slug=${slug}`,
  replyInputId: (questionId: string) => `gv-tra-loi-${questionId}`,

  title: "Câu hỏi của học viên",
  summary: {
    loading: "Đang tải…",
    all: (total: number) => `${total} câu hỏi trong các khóa bạn dạy.`,
    pending: (total: number) => `${total} câu đang chờ bạn trả lời.`,
  },
  tabs: { pending: "Chờ trả lời", all: "Tất cả" },
  empty: {
    all: "Chưa có câu hỏi nào trong các khóa bạn dạy.",
    pending: "Không còn câu hỏi nào đang chờ. Bạn đã trả lời hết.",
  },

  item: {
    deletedCourse: "Khóa đã xóa",
    answered: "Đã trả lời",
    studentFallback: "Học viên",
    reply: "Trả lời",
    openCourse: "Mở khóa học",
    replyPlaceholder: "Nhập câu trả lời…",
    cancel: "Hủy",
    send: "Gửi",
  },

  errors: {
    load: "Không tải được danh sách câu hỏi.",
    send: "Không gửi được câu trả lời.",
  },
} as const;
