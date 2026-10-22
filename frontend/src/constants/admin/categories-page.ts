/** Chu cua trang /admin/categories. */
export const ADMIN_CATEGORIES = {
  title: "Danh mục",
  loading: "Đang tải...",
  count: (n: number) => `${n} danh mục`,
  add: "Thêm danh mục",

  columns: { name: "Tên", slug: "Slug (tự sinh)", icon: "Icon", actions: "Thao tác" },
  empty: "Chưa có danh mục nào.",
  /** Chua chon bieu tuong: trang chu tu doan theo ten. */
  autoIcon: "Tự đoán theo tên",
  /** Gia tri go tay tu truoc, khong co trong bang bieu tuong. */
  unknownIcon: (v: string) => `"${v}" (không hợp lệ, đang đoán theo tên)`,
  edit: "Sửa",
  delete: "Xóa",

  modal: {
    createTitle: "Thêm danh mục",
    editTitle: "Sửa danh mục",
    name: "Tên danh mục *",
    namePlaceholder: "Ví dụ: Trí tuệ nhân tạo",
    slugHint: "Slug được backend tự sinh từ tên, không cần nhập.",
    icon: "Biểu tượng",
    iconHint: "Hiện ở mục Danh mục trên trang chủ. Không chọn thì tự đoán theo tên.",
    iconAuto: "Tự động",
    cancel: "Hủy",
    save: "Lưu thay đổi",
    create: "Tạo danh mục",
  },

  messages: {
    loadFailed: "Không tải được danh mục",
    needName: "Tên danh mục là bắt buộc",
    saveFailed: "Lưu thất bại",
    confirmDelete: (name: string) => `Xóa danh mục "${name}"?`,
    deleteFailed: "Xóa thất bại",
  },
} as const;
