/** Chu cua trang gioi thieu khoa hoc /course?slug=... (phia hoc vien). */
export const COURSE_PAGE = {
  homeHref: "/",
  cartHref: "/cart",
  learnHref: (slug: string) => `/learn?slug=${slug}`,
  paymentHref: (code: string) => `/payment?code=${code}`,
  /** id cua the mua ben phai - nut to tren banner cuon xuong day. */
  buyAnchorId: "mua-khoa-hoc",
  reviewsQuery: { limit: 10, sortBy: "newest" as const },
  /** Tien do toi thieu (%) moi duoc viet danh gia. */
  reviewMinProgress: 25,
  suggestionsCount: 4,

  notFound: {
    title: "Không tìm thấy dữ liệu",
    text: "Khóa học không tồn tại hoặc chưa được xuất bản.",
    home: "Quay về trang chủ",
  },

  instructorFallback: "Expert Instructor",

  hero: {
    back: "QUAY LẠI DANH MỤC",
    taglineSuffix: ". Học cách thiết kế hệ thống thực chiến, tăng tư duy logic cốt lõi.",
    reviewsCount: (n: number) => `(${n} đánh giá)`,
    instructor: "Giảng viên: ",
    enter: "Vào lớp học ngay",
    processing: "Đang xử lý...",
    buy: (price: string) => `Mua khóa học - ${price}`,
    freeEnroll: "Đăng ký học miễn phí",
    transferQr: "Chuyển khoản qua mã QR",
    startNow: "Bắt đầu ngay",
    joined: "học viên đã tham gia khóa học này.",
  },

  tabs: [
    { id: "about", label: "Tổng quan" },
    { id: "curriculum", label: "Chương trình học" },
    { id: "faqs", label: "Câu hỏi thường gặp" },
    { id: "reviews", label: "Đánh giá" },
  ],

  highlights: {
    progress: { label: "Tiến độ học", value: "Cấp chứng chỉ hoàn thành" },
    duration: { label: "Thời gian học", value: "Khoảng 4 tháng (Tự điều chỉnh)" },
    level: { label: "Cấp độ chuyên môn", fallback: "Beginner level" },
    schedule: { label: "Lịch trình học", value: "100% Linh hoạt theo ý bạn" },
  },

  about: {
    heading: "Giới thiệu về khóa học này",
    empty: "Chưa có bài viết mô tả chi tiết cho chương trình đào tạo này.",
  },

  curriculum: {
    heading: "Nội dung chương trình đào tạo",
    count: (n: number) => `${n} Học phần bài giảng`,
    video: "Bài học Video",
    empty: "Nội dung bài học hiện tại đang được xây dựng.",
  },

  faqs: {
    heading: "Các câu hỏi thường gặp hệ thống",
    loading: "Đang kết nối hệ thống giải đáp...",
  },

  reviews: {
    heading: "Ý kiến từ cộng đồng học viên",
    ratings: (n: number) => `${n} xếp hạng thực tế`,
    formTitle: (p: number) => `Chia sẻ trải nghiệm học của bạn (Tiến độ: ${p}%)`,
    placeholder:
      "Nội dung kiến thức có sát với thực chiến không? Hãy đánh giá trung thực để cải thiện hệ thống nhé...",
    sending: "Đang gửi đi...",
    submit: "Đăng tải phản hồi",
    locked: {
      a: "🔒 Bạn cần tích lũy học tập tối thiểu ",
      strong: (p: number) => `${p}%`,
      b: " tổng thời lượng khóa học để mở khóa tính năng viết bình luận.",
    },
    currentProgress: (p: number) => `Tiến trình lớp học hiện tại của bạn: ${p}%`,
    loading: "Đang đồng bộ bình luận...",
    helpful: (n: number) => `Bình luận hữu ích (${n})`,
    verified: "Tài khoản đã được xác thực",
    empty: "Khóa học này hiện chưa nhận được phản hồi.",
  },

  purchase: {
    priceLabel: "Mức giá chương trình",
    free: "Miễn phí",
    continue: "Tiếp tục học tập",
    inCart: "Đã có trong giỏ — Xem giỏ hàng",
    addToCart: "Thêm vào giỏ",
    linking: "Đang liên kết...",
    transfer: "Chuyển khoản ngân hàng",
    enroll: "Ghi danh học viên",
    // Thoi han hoc (10/10/2026): khoa mien phi hoc mai mai, khoa co phi hoc
    // trong accessDays ngay tinh tu luc thanh toan.
    sessions: (n: number) => `${n} buổi học`,
    accessPaid: (days: number) => `Học trong ${days} ngày kể từ khi thanh toán`,
    accessFree: "Học miễn phí, không giới hạn thời gian",
    renewNote: "Mua lại để gia hạn, ngày còn dư được cộng dồn",
    reviewKept: "Lịch sử bài làm và chứng nhận được giữ lại",
    expired: (date: string) => `Khóa học đã hết hạn ngày ${date}. Mua lại để học tiếp.`,
    renew: "Gia hạn khóa học",
    daysLeft: (n: number) => `Còn ${n} ngày học`,
  },

  messages: {
    loadFailed: "Không thể tải thông tin chi tiết khóa học",
    missingId: "Không tìm thấy thông tin định danh khóa học",
    loginToContinue: "Vui lòng đăng nhập để tiếp tục chương trình học",
    enrollFailed: "Không thể xử lý ghi danh. Vui lòng thử lại!",
    genericError: "Đã xảy ra lỗi",
    emptyReview: "Vui lòng nhập phản hồi!",
    reviewSent: "Gửi phản hồi thành công!",
    reviewFailed: "Gặp sự cố khi gửi",
  },
} as const;
