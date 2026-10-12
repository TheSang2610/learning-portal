/** Chu va cau hinh cua trang /admin/vouchers (ma giam gia). */
export const ADMIN_VOUCHERS = {
  codeMaxLength: 32,
  /** So ngay hieu luc mac dinh cua ma moi. */
  defaultDays: 30,

  title: "Mã giảm giá",
  create: "Tạo mã mới",

  form: {
    createTitle: "Tạo mã giảm giá",
    editTitle: "Sửa mã giảm giá",
    code: "Mã",
    codePlaceholder: "GIAM10",
    description: "Mô tả",
    descriptionPlaceholder: "Khuyến mãi khai giảng",
    kind: "Loại",
    kinds: [
      { value: "phanTram", label: "Phần trăm (%)" },
      { value: "soTien", label: "Số tiền (đ)" },
    ],
    value: (percent: boolean) => `Giá trị ${percent ? "(%)" : "(đ)"}`,
    cap: "Giảm tối đa (đ) — để trống là không chặn",
    minOrder: "Đơn tối thiểu (đ)",
    start: "Bắt đầu",
    end: "Kết thúc",
    totalUses: "Tổng số lượt — để trống là không giới hạn",
    oncePerUser: "Mỗi người chỉ dùng một lần",
    oncePerUserHint: "(bỏ chọn là một người dùng mã này bao nhiêu lần cũng được)",
    cancel: "Hủy",
    saving: "Đang lưu…",
    save: "Lưu",
  },

  loading: "Đang tải…",
  empty: "Chưa có mã giảm giá nào.",

  columns: ["Mã", "Giảm", "Điều kiện", "Hiệu lực", "Đã dùng", "Trạng thái", ""],

  row: {
    clipNote: (amount: string) => `tối đa ${amount}đ`,
    minOrder: (amount: string) => `Đơn từ ${amount}đ`,
    noMinOrder: "Không",
    oncePerUser: "1 lần/người",
    unlimitedPerUser: "Không giới hạn/người",
    range: (from: string, to: string) => `${from} → ${to}`,
    disabled: "Đã tắt",
    expired: "Hết hạn",
    running: "Đang chạy",
    viewUsesAria: "Xem lượt dùng",
    turnOffAria: "Tắt mã",
    turnOnAria: "Bật mã",
  },

  usage: {
    title: "Lượt dùng mã",
    close: "✕",
    loading: "Đang tải…",
    empty: "Chưa có ai dùng mã này.",
    totalLabel: "Tổng đã giảm:",
    deletedUser: "Người dùng đã xóa",
    none: "—",
    discount: (amount: string) => `−${amount}đ`,
  },

  messages: {
    loadFailed: "Không tải được danh sách mã.",
    saveFailed: "Không lưu được mã giảm giá.",
    toggleFailed: "Không đổi được trạng thái.",
  },
} as const;
