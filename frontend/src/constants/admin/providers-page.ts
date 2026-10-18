/**
 * Chu cua hai trang doi tac & truong hoc:
 *   /admin/providers        - danh sach
 *   /admin/provider-create  - them moi (kem ?id= la sua)
 */
export const ADMIN_PROVIDERS = {
  listHref: "/admin/providers",
  createHref: "/admin/provider-create",
  editHref: (id: string) => `/admin/provider-create?id=${id}`,

  list: {
    title: "Đối tác & trường học",
    /** {n} = tong, {c} = doanh nghiep, {u} = truong hoc. */
    subtitle: "{n} đơn vị · {c} doanh nghiệp · {u} trường học",
    loading: "Đang tải danh sách…",
    add: "Thêm đối tác / trường học",
    refresh: "Làm mới",
    searchPlaceholder: "Tìm theo tên hoặc đường dẫn…",
    tabs: [
      { value: "", label: "Tất cả" },
      { value: "company", label: "Doanh nghiệp" },
      { value: "university", label: "Trường học" },
    ],
    columns: ["Đơn vị", "Đường dẫn (slug)", "Phân loại", ""],
    empty: "Chưa có đơn vị nào. Bấm “Thêm đối tác / trường học” để tạo.",
    noMatch: "Không có đơn vị nào khớp bộ lọc.",
    edit: "Sửa",
    delete: "Xóa",
  },

  form: {
    createTitle: "Thêm đối tác / trường học",
    editTitle: "Sửa đơn vị",
    createDesc:
      "Đơn vị hiện trên thẻ khóa học, trang khóa học và dải logo đối tác ở trang chủ.",
    editDesc: "Đổi tên, phân loại hoặc logo. Khóa học đang gắn đơn vị này cập nhật theo.",
    back: "Quay lại danh sách",
    infoTitle: "Thông tin đơn vị",
    name: "Tên đơn vị",
    namePlaceholder: "Ví dụ: Google, Học viện Công nghệ Bưu chính Viễn thông…",
    kind: "Phân loại",
    kinds: [
      { value: "company", label: "Doanh nghiệp", hint: "Công ty, tổ chức đào tạo" },
      { value: "university", label: "Trường học", hint: "Đại học, cao đẳng, học viện" },
    ],
    logoTitle: "Logo",
    logoDesc: "Ảnh vuông, nền trong suốt hoặc trắng. PNG, JPG hoặc SVG.",
    pickLogo: "Chọn ảnh logo",
    changeLogo: "Đổi ảnh khác",
    noLogo: "Chưa có logo",
    cancel: "Hủy",
    create: "Thêm đơn vị",
    update: "Lưu thay đổi",
    busy: "Đang lưu…",
    loading: "Đang tải đơn vị…",
    notFound: "Không tìm thấy đơn vị cần sửa.",
  },

  messages: {
    loadFailed: "Không tải được danh sách đơn vị.",
    needName: "Nhập tên đơn vị.",
    needLogo: "Chọn ảnh logo cho đơn vị mới.",
    saveFailed: "Không lưu được đơn vị.",
    confirmDelete: (name: string) =>
      `Xóa đơn vị "${name}"?\n\nKhóa học đang gắn đơn vị này sẽ mất thông tin đơn vị.`,
    deleteFailed: "Không xóa được đơn vị.",
  },
} as const;
