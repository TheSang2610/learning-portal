/** Chu va duong dan cua trang /instructor/quiz-stats. */
export const INSTRUCTOR_QUIZ_STATS = {
  lessonsHref: (courseId: string) => `/instructor/lessons?courseId=${courseId}`,
  remindMailto: (email: string, name: string) =>
    `mailto:${email}?subject=Nhắc nhở làm bài tập&body=Chào ${name}, bạn chưa hoàn thành bài tập trắc nghiệm.`,

  missingQuiz: "Không tìm thấy ID bài tập Quiz hợp lệ. Vui lòng quay lại giáo trình!",
  loading: "Đang tải báo cáo lớp học...",

  header: {
    back: "Quay lại quản lý giáo trình",
    eyebrow: "Báo cáo tổng quan điểm số",
    title: (name: string) => `Bài tập: ${name}`,
    titleFallback: "Đang cập nhật...",
  },

  summary: {
    submitted: "Đã nộp bài",
    average: "Điểm trung bình",
    passRate: "Tỷ lệ Đạt (Pass)",
    unsubmitted: "Chưa hoàn thành",
  },

  tabs: {
    submitted: (n: number) => `Đã làm bài (${n})`,
    unsubmitted: (n: number) => `Chưa nộp bài (${n})`,
  },

  submitted: {
    columns: [
      "Học viên",
      "Kết quả đạt được",
      "Trạng thái",
      "Thời gian nộp bài",
      "Hệ thống quản trị",
    ],
    points: "điểm",
    accuracy: (p: number) => `Tỷ lệ chính xác: ${p}%`,
    passed: "Đạt yêu cầu",
    failed: "Điểm thấp",
    attempt: (n: number) => `Lượt làm: Thứ #${n}`,
    retry: "Cho làm lại",
    empty: "Chưa có học sinh nào nộp bài tập này.",
  },

  unsubmitted: {
    columns: ["Họ và tên", "Email", "Thao tác nhanh"],
    remind: "Hối thúc lẹ",
    empty: "🎉 Đơn lớp hoàn hảo! Không có ai nợ bài tập này.",
  },

  retryModal: {
    title: "Xác nhận cấp quyền làm lại",
    student: "Học sinh được chọn:",
    reason: "Lý do mở khóa lại (Bắt buộc)",
    reasonPlaceholder:
      "Ví dụ: Điểm thấp dưới trung bình, lỗi đường truyền mạng tại lớp, xin làm lại để cải thiện điểm số...",
    cancel: "Hủy bỏ",
    confirm: "Xác nhận & Khởi tạo lại",
  },

  messages: {
    needReason: "Vui lòng nhập lý do cho phép học sinh làm lại bài!",
    retryOk: (name: string) => `Đã cấp quyền làm lại bài cho [${name}] thành công!`,
    retryFailed: "Có lỗi xảy ra khi thực hiện mở lại bài.",
  },
} as const;
