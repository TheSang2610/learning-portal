import type { OrderStatus } from "@/src/services/order";

/** Chu va cau hinh cua trang /admin/orders. */
export const ADMIN_ORDERS = {
  limit: 50,

  title: "Đơn hàng",
  intro: "Đối chiếu sao kê ngân hàng rồi xác nhận để mở khóa học cho học viên.",
  pendingBadge: (n: number) => `${n} đơn đang chờ`,
  reportedBadge: (n: number) => `${n} đơn báo đã chuyển khoản`,

  filters: [
    { nhan: "Chờ thanh toán", giaTri: "pending" },
    { nhan: "Đã thanh toán", giaTri: "paid" },
    { nhan: "Đã hủy", giaTri: "cancelled" },
    { nhan: "Hết hạn", giaTri: "expired" },
    { nhan: "Tất cả", giaTri: "" },
  ] satisfies { nhan: string; giaTri: OrderStatus | "" }[],
  searchPlaceholder: "Tìm theo mã đơn…",

  statusLabel: {
    pending: "Chờ thanh toán",
    paid: "Đã thanh toán",
    cancelled: "Đã hủy",
    expired: "Hết hạn",
  } satisfies Record<OrderStatus, string>,

  columns: {
    code: "Mã đơn",
    student: "Học viên",
    course: "Khóa học",
    amount: "Số tiền",
    status: "Trạng thái",
    createdAt: "Tạo lúc",
    actions: "Thao tác",
  },
  loading: "Đang tải…",
  empty: "Không có đơn nào ở mục này.",

  row: {
    none: "—",
    cartCourses: (n: number, titles: string) => `${n} khóa: ${titles}`,
    confirmedBy: (name: string) => `bởi ${name}`,
    reportedAt: (time: string) => `Đã báo CK ${time}`,
    processed: "Đã xử lý",
    cancelled: "Đã hủy",
    busy: "…",
    confirm: "Xác nhận",
    cancel: "Hủy",
  },

  footnote: {
    before: "Đơn ",
    strong: "hết hạn",
    after:
      " vẫn xác nhận được: hạn 15 phút chỉ để đơn thôi treo trên màn hình học viên, không phải để từ chối tiền đã chuyển.",
  },

  messages: {
    loadFailed: "Không đọc được danh sách đơn",
    confirm: (amount: string, code: string, student: string) =>
      `Xác nhận đã nhận ${amount} cho đơn ${code}?\n\n` +
      `Học viên ${student} sẽ được mở khóa học ngay.\n` +
      `Hãy đối chiếu sao kê ngân hàng trước khi bấm.`,
    confirmFailed: "Không xác nhận được đơn",
    cancelReason: (code: string) => `Hủy đơn ${code}. Lý do (không bắt buộc):`,
    cancelFailed: "Không hủy được đơn",
  },
} as const;
