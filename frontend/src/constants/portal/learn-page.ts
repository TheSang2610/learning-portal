/** Chu va cau hinh cua phong hoc /learn?slug=... */
export const LEARN = {
  homeHref: "/",
  courseHref: (slug: string) => `/course?slug=${slug}`,
  /** xem=1: trang gioi thieu dung tu nhay nguoc lai vao /learn. */
  courseIntroHref: (slug: string) => `/course?slug=${slug}&xem=1`,
  /** Bao lau ghi lai vi tri dang xem mot lan. */
  watchTimeMs: 10000,

  notFound: {
    title: "Không vào được phòng học",
    text: "Khóa học không tồn tại hoặc bạn chưa đăng ký thành viên.",
    home: "Quay về trang chủ",
  },

  header: {
    instructor: "Giảng viên: ",
    instructorFallback: "Chuyên gia",
    progress: (p: number) => ` Tiến độ: ${p}%`,
    done: (n: number, total: number) => `Bài đã xong: ${n}/${total}`,
  },

  player: {
    iframeAllow:
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
    playError: "Không thể phát video. Kiểm tra kết nối mạng hoặc định dạng file.",
    errorPrefix: "❌ ",
    lockedTitle: "Bài học chưa được mở",
    lockedText:
      "Khóa học này có phí. Sau khi bạn chuyển khoản, ban quản trị đối chiếu rồi xác nhận đơn — toàn bộ bài giảng sẽ mở ra ngay tại đây.",
    lockedCta: "Xem cách đăng ký khóa học",
    expiredTitle: "Khóa học đã hết thời hạn học",
    expiredText:
      "Tiến độ và lịch sử bài làm của bạn vẫn được giữ. Mua lại để học tiếp, ngày còn dư được cộng dồn.",
    expiredCta: "Gia hạn khóa học",
    noVideo: "Bài học này chưa được cấu hình liên kết Video bài giảng",
  },

  video: {
    httpError: (code: number | string) => `Lỗi tải video: ${code}`,
    hlsError: (msg: string) => `Lỗi tải video: ${msg}`,
    setupError: (msg: string) => `Có lỗi khi tải video: ${msg}`,
    unknown: "Không xác định",
  },

  info: {
    ongoing: "Đang diễn ra",
    completed: "Đã hoàn thành",
    // Truoc day doc activeLesson.description, ma model Lesson khong co truong
    // do - luon rong nen cau du phong nay moi la thu thuc su hien ra.
    description: "Bài học này nằm trong khung năng lực đào tạo chuẩn hệ thống.",
    markDone: "Đánh dấu đã học xong",
    takeQuiz: (pass: number) => `Làm bài kiểm tra (${pass}% để đạt)`,
  },

  noLesson: "Vui lòng chọn một bài giảng ở menu bên cạnh để bắt đầu học tập.",

  sidebar: {
    title: "Nội dung bài học",
    count: (n: number) => `${n} mục`,
    minutes: (n: number | string) => `${n} phút`,
    video: "Bài học Video",
    empty: "Đang cập nhật bài giảng.",
  },

  messages: {
    lessonDone: (title: string) =>
      `Chúc mừng bạn đã hoàn thành phần video bài học: ${title}`,
  },
} as const;
