/** Chu cua trang /admin/categories. */
export const ADMIN_CATEGORIES = {
  title: "Danh mục",
  loading: "Đang tải...",
  count: (n: number) => `${n} danh mục`,
  add: "Thêm danh mục",

  columns: { name: "Tên", slug: "Slug (tự sinh)", icon: "Icon", actions: "Thao tác" },
  empty: "Chưa có danh mục nào.",
  noIcon: "--",
  edit: "Sửa",
  delete: "Xóa",

  modal: {
    createTitle: "Thêm danh mục",
    editTitle: "Sửa danh mục",
    name: "Tên danh mục *",
    namePlaceholder: "Ví dụ: Trí tuệ nhân tạo",
    slugHint: "Slug được backend tự sinh từ tên, không cần nhập.",
    icon: "Icon",
    iconPlaceholder: "code, cloud, megaphone...",
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
