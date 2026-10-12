/** Chu va cau hinh cua trang /payment (thanh toan don hang qua QR). */
export const PAYMENT = {
  // Bao lau hoi lai may chu mot lan xem don da duoc xac nhan chua.
  //
  // 10 giay: du nhanh de nguoi vua chuyen khoan thay khoa mo ra gan nhu ngay,
  // va du cham de mot nguoi ngoi cho 15 phut chi ton khoang 90 luot goi.
  pollMs: 10_000,

  coursesHref: "/courses",
  cartHref: "/cart",
  myCoursesHref: "/user/my-courses",
  paymentHref: (code: string) => `/payment?code=${code}`,
  learnHref: (slug: string) => `/learn?slug=${slug}`,
  courseHref: (slug: string) => `/course?slug=${slug}`,

  loadingFallback: "Đang tải…",
  loadingOrder: "Đang tải đơn hàng…",
  missingCode: "Thiếu mã đơn hàng.",
  backToCourses: "Về danh sách khóa học",

  paid: {
    check: "✓",
    title: "Thanh toán thành công",
    many: {
      strong: (n: number) => `${n} khóa học`,
      rest: " đã được mở cho tài khoản của bạn.",
    },
    one: { a: "Khóa học ", b: " đã được mở cho tài khoản của bạn." },
    toMyCourses: "Tới khóa học của tôi",
    learnNow: "Vào học ngay",
  },

  closed: {
    cancelledTitle: "Đơn hàng đã hủy",
    expiredTitle: "Đơn hàng đã hết hạn",
    cancelledText: "Đơn này đã được hủy. Bạn có thể đặt lại đơn mới bất cứ lúc nào.",
    expiredText:
      "Mã này đã quá hạn 15 phút nên không dùng để chuyển khoản được nữa — hãy lấy mã mới. Nếu bạn LỠ chuyển theo mã cũ rồi thì đừng chuyển lại: nhắn cho ban quản trị kèm mã đó, tiền vẫn đối chiếu và mở khoá được.",
    creating: "Đang tạo mã mới…",
    newCode: "Lấy mã chuyển khoản mới",
    backToCart: "Quay lại giỏ hàng",
    backToCourse: "Quay lại khóa học",
  },

  clock: {
    reportedExpired:
      "Bạn đã báo chuyển khoản. Mã quá hạn không sao — ban quản trị vẫn đối chiếu và mở khoá khi tiền về.",
    expiredStrong: "Mã này đã hết hạn — đừng chuyển khoản theo mã này nữa.",
    expiredRest: " Hãy lấy mã mới bên dưới.",
    holding: "Giữ đơn cho bạn trong ",
  },

  pending: {
    title: "Thanh toán đơn hàng",
    intro: {
      a: "Bạn cần chuyển ",
      b: ". Quét mã QR bên dưới thì mọi thông tin tự điền sẵn. Nếu tự gõ, nhớ ghi nội dung ",
      c: ".",
    },
    cancelling: "Đang hủy…",
    cancel: "Hủy đơn hàng",
  },

  items: {
    heading: "Các mục trong đơn hàng",
    badge: "KH",
    course: "Khóa học",
  },

  bank: {
    notConfigured: {
      a: "Máy chủ chưa được khai báo tài khoản nhận tiền, nên chưa sinh được mã QR. Đơn hàng và mã ",
      b: " vẫn hợp lệ — liên hệ ban quản trị để lấy thông tin chuyển khoản.",
    },
    aria: "Mã QR và thông tin chuyển khoản",
    qrAlt: (amount: string, code: string) =>
      `Mã QR chuyển khoản ${amount} nội dung ${code}`,
    qrFile: (code: string) => `QR-${code}.jpg`,
    download: "Tải mã QR",
    mobileHint: {
      a: "Đang xem trên điện thoại? Bấm ",
      download: "Tải mã QR",
      b: " rồi mở app ngân hàng, chọn quét mã từ ảnh trong thư viện. Hoặc dùng ",
      copy: "Sao chép thông tin",
      c: " rồi dán vào app — không cần quét.",
    },
    bankName: "Ngân hàng",
    accountNo: "Số tài khoản",
    accountName: "Tên tài khoản",
    amount: "Số tiền",
    content: "Nội dung",
    copyAccount: "số tài khoản",
    copyAmount: "số tiền",
    copyContent: "nội dung",
    copiedAll: "Đã sao chép",
    copyAll: "Sao chép thông tin",
    /** Chuoi dan vao app ngan hang khi bam "Sao chép thông tin". */
    clipboardLines: (ck: {
      nganHang: string;
      soTaiKhoan: string;
      tenTaiKhoan: string;
      soTien: number;
      noiDung: string;
    }) =>
      [
        `Ngân hàng: ${ck.nganHang}`,
        `Số tài khoản: ${ck.soTaiKhoan}`,
        `Tên tài khoản: ${ck.tenTaiKhoan}`,
        `Số tiền: ${ck.soTien}`,
        `Nội dung: ${ck.noiDung}`,
      ].join("\n"),
  },

  report: {
    reportedAt: "Đã báo ban quản trị lúc ",
    reportedText:
      "Bên mình đang đối chiếu sao kê ngân hàng. Trang này tự kiểm tra lại — khoá học mở ra là thấy ngay, không phải tải lại.",
    hint: "Chuyển khoản xong thì bấm nút này để báo cho ban quản trị đối chiếu. Đơn được xác nhận thủ công nên có thể mất vài phút.",
    sending: "Đang gửi…",
    iTransferred: "Tôi đã chuyển khoản",
    mailFailed: {
      a: "Tuy nhiên mail báo chưa gửi được, nên bạn nhắn thêm cho ban quản trị kèm mã ",
      b: " cho chắc.",
    },
  },

  messages: {
    loadFailed: "Không đọc được đơn hàng",
    reportFailed: "Không gửi được thông báo",
    newCodeFailed: "Không tạo được mã mới",
    cancelFailed: "Không hủy được đơn",
  },
} as const;
