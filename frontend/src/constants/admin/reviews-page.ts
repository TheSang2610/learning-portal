/** Chu va cau hinh cua trang /admin/reviews. */
export const ADMIN_REVIEWS = {
  limit: 100,
  minCommentLength: 10,
  stars: [1, 2, 3, 4, 5],

  title: "Reviews Management",
  intro: "Xem, tạo mới, chỉnh sửa hoặc loại bỏ các nội dung đánh giá trên hệ thống.",
  refresh: "Làm mới",
  create: "Tạo Review mới",

  loading: "Đang tải dữ liệu đánh giá toàn hệ thống...",
  empty: "Chưa có đánh giá nào được ghi nhận trên hệ thống.",

  columns: {
    student: "Học viên / Ngày đăng",
    course: "Khóa học",
    rating: "Đánh giá",
    comment: "Nội dung bình luận",
    helpful: "Tương tác",
    actions: "Hành động",
  },

  row: {
    anonymous: "Ẩn danh",
    courseFallback: "Khóa học học viên đăng ký",
    at: "lúc",
    verified: "Đã mua",
    helpful: (n: number) => `👍 ${n}`,
    editTitle: "Sửa đánh giá",
    edit: "Sửa",
    deleteTitle: "Xóa đánh giá",
    delete: "Xoá",
  },

  modal: {
    createTitle: "Tạo Đánh Giá Trực Tiếp",
    editTitle: "Chỉnh Sửa Đánh Giá Học Viên",
    courseId: "Course ID (Mã khóa học)",
    courseIdPlaceholder: "Nhập chuỗi ID khóa học (e.g. 6a149071d...)",
    rating: "Xếp hạng (Số sao)",
    ratingValue: (n: number) => `${n}/5 Sao`,
    comment: "Nội dung bình luận",
    commentPlaceholder: "Nhập nhận xét tối thiểu 10 ký tự về khóa học...",
    cancel: "Hủy bỏ",
    saving: "Đang lưu...",
    save: "Lưu thay đổi",
  },

  messages: {
    confirmDelete:
      "Bạn có chắc chắn muốn xóa vĩnh viễn đánh giá này không? Hành động này không thể hoàn tác.",
    deleteFailed: "Không thể xóa đánh giá này.",
    commentTooShort: "Nội dung bình luận phải có ít nhất 10 ký tự.",
    needCourseId: "Vui lòng nhập Course ID hợp lệ.",
    created: "Đã thêm đánh giá thành công!",
    updated: "Cập nhật đánh giá thành công!",
    saveFailed: "Đã xảy ra lỗi khi xử lý thao tác.",
  },
} as const;
