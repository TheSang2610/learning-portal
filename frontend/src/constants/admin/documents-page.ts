/** Chu va cau hinh cua trang /admin/documents (tai lieu chia se). */
export const ADMIN_DOCUMENTS = {
  pageSize: 20,
  fileHref: (id: string) => `/api/documents/${id}/file`,

  title: "Tài liệu chia sẻ",
  subtitle: "Toàn bộ tài liệu do người dùng đăng lên kho chia sẻ.",
  stats: {
    total: (n: number) => `${n} tài liệu`,
    downloads: (n: number) => `${n} lượt tải (trang này)`,
    noSubject: (n: number) => `${n} chưa có môn (trang này)`,
  },

  search: {
    placeholder: "Tìm theo tiêu đề hoặc nội dung…",
    clearAria: "Xóa tìm kiếm",
    submit: "Tìm",
  },
  closeAria: "Đóng",

  loading: "Đang tải…",
  emptyFiltered: (q: string) => `Không có tài liệu nào khớp "${q}".`,
  empty: "Chưa có tài liệu nào.",

  columns: {
    doc: "Tài liệu",
    subjects: "Môn học",
    uploader: "Người đăng",
    date: "Ngày đăng",
    downloads: "Lượt tải",
    actions: "Thao tác",
  },

  row: {
    hidden: "Đã ẩn",
    saveSubjectsAria: "Lưu môn học",
    cancelSubjectsAria: "Hủy sửa môn học",
    editSubjectsTitle: "Bấm để sửa môn học",
    noSubject: "Chưa có môn",
    deletedUser: "Người dùng đã xóa",
    openFileTitle: "Mở file",
    openFileAria: (title: string) => `Mở file ${title}`,
    showTitle: "Hiện lại tài liệu",
    hideTitle: "Ẩn tài liệu",
    toggleAria: (hidden: boolean, title: string) =>
      `${hidden ? "Hiện lại" : "Ẩn"} ${title}`,
    deleteTitle: "Xóa tài liệu",
    deleteAria: (title: string) => `Xóa ${title}`,
  },

  pager: {
    prev: "Trước",
    next: "Sau",
    info: (page: number, pages: number) => `Trang ${page}/${pages}`,
  },

  deleteDialog: {
    title: "Xóa tài liệu này?",
    body: " sẽ bị xóa khỏi kho, kèm cả file trên máy chủ lưu trữ. Không khôi phục lại được.",
    cancel: "Hủy",
    deleting: "Đang xóa…",
    confirm: "Xóa",
  },

  messages: {
    needSubject: "Chọn ít nhất một môn trong danh sách.",
    subjectsSaved: (subjects: string, title: string) =>
      `Đã gán môn "${subjects}" cho "${title}".`,
    subjectsFailed: "Không lưu được môn học.",
    hidden: (title: string) =>
      `Đã ẩn "${title}". Người dùng không còn thấy tài liệu này.`,
    shown: (title: string) => `Đã hiện lại "${title}".`,
    toggleFailed: "Không đổi được trạng thái tài liệu.",
    loadFailed: "Không tải được danh sách tài liệu.",
    deleted: (title: string) => `Đã xóa "${title}".`,
    deleteFailed: "Không xóa được tài liệu.",
  },
} as const;
