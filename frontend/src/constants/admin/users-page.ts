/** Chu va cau hinh cua trang /admin/users. */
export const ADMIN_USERS = {
  pageSize: 10,
  searchDelay: 400,
  roles: ["student", "instructor", "admin"] as const,

  title: "Người dùng",
  loading: "Đang tải...",
  count: (n: number) => `${n} tài khoản`,
  add: "Thêm người dùng",

  filters: {
    searchPlaceholder: "Tìm theo tên, email hoặc mã user...",
    allRoles: "Mọi quyền",
    allStatuses: "Mọi trạng thái",
    statuses: [
      { value: "active", label: "Đang hoạt động" },
      { value: "banned", label: "Đã khóa" },
    ],
  },

  columns: ["Người dùng", "Quyền", "Trạng thái", "Ngày tạo", "Thao tác"],
  empty: "Không tìm thấy người dùng nào.",

  row: {
    viewAvatar: "Xem ảnh đại diện",
    you: "BẠN",
    active: "Hoạt động",
    banned: "Đã khóa",
    none: "--",
    edit: "Sửa",
    cannotLockSelf: "Không thể tự khóa chính mình",
    lock: "Khóa",
    unlock: "Mở khóa",
    cannotDeleteSelf: "Không thể tự xóa chính mình",
    delete: "Xóa",
  },

  avatar: {
    loadFailed: "Không tải được ảnh",
    alt: (name?: string) => (name ? `Ảnh đại diện của ${name}` : "Ảnh đại diện"),
    uploaded: "Người dùng tự tải ảnh này lên",
    external: "Ảnh dẫn từ liên kết ngoài, không phải người dùng tải lên",
  },

  modal: {
    createTitle: "Thêm người dùng",
    editTitle: "Sửa người dùng",
    avatarUploaded: "Ảnh do người dùng tự tải lên",
    avatarExternal: "Ảnh dẫn từ liên kết ngoài",
    noAvatar: "Chưa có ảnh đại diện",
    name: "Tên *",
    namePlaceholder: "Nguyễn Văn A",
    email: "Email *",
    emailPlaceholder: "user@example.com",
    password: (editing: boolean) =>
      `Mật khẩu ${editing ? "(để trống nếu không đổi)" : "*"}`,
    passwordKeep: "Không đổi",
    passwordMin: (n: number) => `Tối thiểu ${n} ký tự`,
    phone: "Số điện thoại",
    phonePlaceholder: "Không bắt buộc",
    role: "Quyền",
    status: "Trạng thái",
    statuses: [
      { value: "active", label: "Hoạt động" },
      { value: "banned", label: "Khóa" },
    ],
    selfNote: "Không thể tự đổi quyền hoặc tự khóa tài khoản của chính bạn.",
    cancel: "Hủy",
    save: "Lưu thay đổi",
    create: "Tạo người dùng",
  },

  messages: {
    loadFailed: "Không tải được danh sách người dùng",
    required: "Tên và email là bắt buộc",
    saveFailed: "Lưu thất bại",
    statusFailed: "Không đổi được trạng thái",
    confirmDelete: (name: string, email: string) =>
      `Xóa "${name}" (${email})?\n\n` +
      `Thao tác này xóa luôn các khóa học user tạo và toàn bộ lượt ghi danh. Không hoàn tác được.`,
    deleteFailed: "Xóa thất bại",
  },
} as const;
