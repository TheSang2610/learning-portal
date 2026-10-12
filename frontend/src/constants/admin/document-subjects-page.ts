/** Chu va gioi han cua trang /admin/document-subjects (linh vuc, truong, mon). */
export const ADMIN_DOCUMENT_SUBJECTS = {
  title: "Lĩnh vực, trường và môn học của tài liệu",
  intro:
    "Lĩnh vực là nhóm lớn hiện ở trang Chia sẻ tài liệu (Luật, Kinh doanh…). Người đăng tài liệu chọn môn; môn thuộc lĩnh vực nào thì tài liệu hiện dưới lĩnh vực đó. Riêng cho kho tài liệu, không liên quan tới danh mục khóa học.",
  closeAria: "Đóng",
  saveNameAria: "Lưu tên",
  cancelAria: "Hủy",
  renameAria: (name: string) => `Đổi tên ${name}`,
  newNameAria: (name: string) => `Tên mới cho ${name}`,
  deleteAria: (name: string) => `Xóa ${name}`,
  renameTitle: "Đổi tên",

  categories: {
    heading: "Lĩnh vực",
    maxLength: 60,
    placeholder: "Tên lĩnh vực mới, VD: Luật",
    nameAria: "Tên lĩnh vực mới",
    iconAria: "Biểu tượng",
    iconOfAria: (name: string) => `Biểu tượng của ${name}`,
    add: "Thêm lĩnh vực",
    count: (subjects: number, docs: number) => `${subjects} môn · ${docs} tài liệu`,
    deleteTitle: "Xóa lĩnh vực (môn trong đó giữ nguyên)",
  },

  universities: {
    heading: "Trường đại học",
    maxLength: 120,
    logoMaxLength: 300,
    placeholder: "Tên trường mới, VD: Trường Đại học Cần Thơ",
    nameAria: "Tên trường mới",
    logoPlaceholder: "Logo: /images/institution/ten-file.png",
    logoAria: (name: string) => `Logo của ${name}`,
    add: "Thêm trường",
    hasLogo: "có logo",
    count: (docs: number) => `${docs} tài liệu`,
    editTitle: "Đổi tên / logo",
    deleteTitle: "Xóa trường (tài liệu giữ nguyên)",
  },

  subjects: {
    heading: "Môn học",
    maxLength: 80,
    placeholder: "Tên môn mới, VD: Cấu trúc dữ liệu và giải thuật",
    nameAria: "Tên môn học mới",
    add: "Thêm môn",
    loading: "Đang tải…",
    empty:
      "Chưa có môn nào. Thêm môn đầu tiên ở ô phía trên — khi chưa có môn nào, người dùng không đăng được tài liệu.",
    count: (docs: number) => `${docs} tài liệu`,
    categoryAria: (name: string) => `Lĩnh vực của ${name}`,
    noCategory: "— Chưa có lĩnh vực —",
    inUseTitle: "Còn tài liệu dùng môn này — chuyển chúng sang môn khác trước",
    deleteTitle: "Xóa môn",
  },

  messages: {
    loadFailed: "Không tải được danh sách môn học.",
    categoryAdded: (name: string) => `Đã thêm lĩnh vực "${name}".`,
    categoryAddFailed: "Không thêm được lĩnh vực.",
    categoryUpdated: (name: string) => `Đã cập nhật lĩnh vực "${name}".`,
    categoryUpdateFailed: "Không cập nhật được lĩnh vực.",
    confirmDeleteCategory: (name: string, n: number) =>
      `Xóa lĩnh vực "${name}"? ${n} môn trong đó sẽ thành "chưa có lĩnh vực" (môn và tài liệu không bị xóa).`,
    categoryDeleted: (name: string) => `Đã xóa lĩnh vực "${name}".`,
    categoryDeleteFailed: "Không xóa được lĩnh vực.",
    subjectPlaced: (subject: string, category: string) =>
      `Đã xếp "${subject}" vào "${category}".`,
    subjectUnplaced: (subject: string) => `Đã bỏ "${subject}" khỏi lĩnh vực.`,
    subjectPlaceFailed: "Không xếp được môn vào lĩnh vực.",
    universityAdded: (name: string) => `Đã thêm trường "${name}".`,
    universityAddFailed: "Không thêm được trường.",
    universityUpdated: (name: string) => `Đã cập nhật "${name}".`,
    renamedWithDocs: (name: string, n: number) =>
      `Đã đổi tên thành "${name}" và cập nhật ${n} tài liệu.`,
    renamed: (name: string) => `Đã đổi tên thành "${name}".`,
    universityRenameFailed: "Không đổi được tên trường.",
    confirmDeleteUniversity: (name: string, n: number) =>
      `Xóa trường "${name}"? ${n} tài liệu đang gắn trường này sẽ thành "không có trường" (tài liệu không bị xóa).`,
    universityDeleted: (name: string) => `Đã xóa trường "${name}".`,
    universityDeleteFailed: "Không xóa được trường.",
    subjectAdded: (name: string) => `Đã thêm môn "${name}".`,
    subjectAddFailed: "Không thêm được môn học.",
    subjectRenamedWithDocs: (name: string, n: number) =>
      `Đã đổi tên thành "${name}" và cập nhật ${n} tài liệu đang dùng môn này.`,
    subjectRenameFailed: "Không đổi được tên môn.",
    confirmDeleteSubject: (name: string) => `Xóa môn "${name}" khỏi danh sách?`,
    subjectDeleted: (name: string) => `Đã xóa môn "${name}".`,
    subjectDeleteFailed: "Không xóa được môn học.",
  },
} as const;
