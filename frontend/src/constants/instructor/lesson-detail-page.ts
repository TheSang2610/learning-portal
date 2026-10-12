/** Chu va duong dan cua trang /instructor/lesson-detail. */
export const INSTRUCTOR_LESSON_DETAIL = {
  lessonsHref: (courseId: string) => `/instructor/lessons?courseId=${courseId}`,

  loading: "Đang tải thông tin bài học...",

  notice: {
    title: "Chế độ Giảng viên (Instructor Mode)",
    text: "Mọi chỉnh sửa hoặc xóa bài học tại đây sẽ trực tiếp thay đổi nội dung học liệu bản nháp của bạn.",
  },

  header: {
    back: "Quay lại giáo trình",
    title: "Chỉnh Sửa Bài Học",
    subtitle: "Cập nhật chi tiết nội dung, thứ tự xuất hiện và luồng video.",
  },

  info: {
    title: "Thông tin bài học",
    idLabel: "ID bài học hiện tại:",
    delete: "Xóa bài học",
    deleting: "Đang xóa...",
  },

  fields: {
    title: "Tên bài học / Tiêu đề",
    order: "Thứ tự hiển thị",
    videoUrl: "Đường dẫn Video bài học (URL)",
    videoUrlPlaceholder: "Ví dụ: https://www.youtube.com/watch?v=...",
    privateVideoNote:
      "Bài này đang dùng video ở kho kín. Để trống ô trên để giữ nguyên; dán link mới nếu muốn thay.",
    content: "Tóm tắt nội dung bài học",
    contentPlaceholder:
      "Ghi chú nội dung cốt lõi, tài liệu đính kèm hoặc văn bản hướng dẫn bài học...",
  },

  actions: {
    cancel: "Hủy bỏ",
    save: "Lưu thay đổi",
    saving: "Đang lưu...",
  },

  messages: {
    loadFailed: "Không thể tải thông tin bài học",
    needTitle: "Vui lòng nhập tiêu đề bài học!",
    saved: "Cập nhật bài học thành công!",
    saveFailed: "Gặp lỗi khi cập nhật bài học",
    confirmDelete:
      "⚠️ Bạn có chắc chắn muốn xóa bài học này?\nHành động này sẽ gỡ bài học khỏi giáo trình của bạn và không thể hoàn tác!",
    deleted: "Xóa bài học thành công!",
    deleteFailed: "Gặp lỗi khi xóa bài học",
  },
} as const;
