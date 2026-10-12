import type { FaqArea } from "@/src/services/faq";

/** Chu va cau hinh cua trang /admin/faqs (FAQ khong gan khoa hoc). */
export const ADMIN_FAQS = {
  // Hai khu vuc FAQ khong gan khoa hoc. FAQ khoa hoc quan ly o trang khoa hoc.
  areas: [
    { khoa: "trangChu", nhan: "Trang chủ", moTa: "Hiển thị ở cuối Trang chủ hệ thống." },
    {
      khoa: "taiLieu",
      nhan: "Chia sẻ tài liệu",
      moTa: "Hiển thị ở cuối trang Chia sẻ tài liệu (/share-document).",
    },
  ] satisfies { khoa: FaqArea; nhan: string; moTa: string }[],
  areasAria: "Khu vực hiển thị FAQ",

  title: "FAQs Management",
  intro:
    "Quản lý các câu hỏi thường gặp hiển thị công khai ở Trang chủ và trang Chia sẻ tài liệu.",
  add: "Add New FAQ",

  loading: "Fetching FAQ collections...",
  errorTitle: "Đã xảy ra lỗi dữ liệu",
  emptyTitle: "Chưa có câu hỏi nào được tạo",
  emptyHint: 'Bấm nút "Add New FAQ" ở góc trên để bắt đầu thêm câu hỏi đầu tiên.',
  questionPrefix: (n: number) => `Q${n}`,
  editTitle: "Sửa câu hỏi",
  deleteTitle: "Xóa câu hỏi",

  modal: {
    createTitle: "Thêm câu hỏi",
    editTitle: "Sửa câu hỏi",
    question: "Question (Câu hỏi)",
    questionPlaceholder: "Ví dụ: Chính sách hoàn trả học phí như thế nào?",
    answer: "Answer (Câu trả lời ngắn gọn)",
    answerPlaceholder: "Nhập nội dung câu trả lời hiển thị chi tiết tại đây...",
    required: "*",
    cancel: "Cancel",
    save: "Save Changes",
    create: "Create Now",
  },

  messages: {
    loadFailed: "Không thể tải danh sách câu hỏi.",
    updated: "Cập nhật câu hỏi thành công!",
    created: (area: string | undefined) => `Thêm câu hỏi cho ${area} thành công!`,
    saveFailed: "Đã xảy ra lỗi khi lưu dữ liệu.",
    confirmDelete: "Bạn có chắc chắn muốn xóa câu hỏi này không?",
    deleted: "Xóa câu hỏi thành công!",
    deleteFailed: "Xóa thất bại.",
  },
} as const;
