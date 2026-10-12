/** Chu cua trang /cart (gio hang). */
export const CART = {
  coursesHref: "/courses",
  paymentHref: (code: string) => `/payment?code=${code}`,

  empty: {
    title: "Giỏ hàng trống",
    nothing: "Bạn chưa thêm khóa học nào vào giỏ.",
    findCourses: "Tìm khóa học",
  },

  title: (n: number) => `Giỏ hàng (${n})`,

  item: {
    removeAria: (title: string) => `Bỏ ${title} khỏi giỏ`,
  },
  clearAll: "Xóa hết giỏ hàng",

  summary: {
    heading: "Thanh toán",
    subtotal: "Tạm tính",
    total: "Tổng tiền",
    voucher: "Mã giảm giá",
    loginHint: "Đăng nhập để thanh toán. Giỏ hàng của bạn được giữ nguyên.",
    login: "Đăng nhập",
    creatingOrder: "Đang tạo đơn…",
    payQr: "Thanh toán qua mã QR ngân hàng",
    qrNote:
      "Cả giỏ hàng thanh toán bằng một lần chuyển khoản. Quét mã QR ở bước sau, khóa học tự mở khi tiền về tài khoản, thường chỉ sau vài phút.",
  },
} as const;
