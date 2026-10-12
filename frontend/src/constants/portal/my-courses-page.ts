/** Chu va cau hinh cua trang /user/my-courses. */
export const MY_COURSES = {
  coursesHref: "/courses",
  learnHref: (slug: string) => `/learn?slug=${slug}`,

  // Ba bo loc. Xep theo thu tu nguoi dung can toi:
  //   dangHoc  - thu ho mo trang nay de tim
  //   xong     - thu ho khoe / lay chung nhan
  //   tatCa    - duong lui khi hai cai tren khong co gi
  filters: [
    { ma: "dangHoc", chu: "Đang học" },
    { ma: "xong", chu: "Đã hoàn thành" },
    { ma: "tatCa", chu: "Tất cả" },
  ] as const,

  title: "Khóa học của tôi",
  loading: "Đang tải…",
  summary: (inProgress: number, done: number) =>
    `${inProgress} khóa đang học · ${done} khóa đã hoàn thành`,

  empty: {
    none: "Bạn chưa đăng ký khóa học nào.",
    noneDone: "Bạn chưa hoàn thành khóa nào.",
    allDone: "Bạn đã hoàn thành tất cả khóa đã đăng ký.",
    browse: "Tìm khóa học",
  },

  card: {
    done: "Hoàn thành",
    progress: "Tiến độ",
    lastAccess: "Học gần nhất",
    review: "Xem lại",
    resume: "Học tiếp",
    start: "Bắt đầu học",
  },

  loadFailed: "Không tải được danh sách khóa học.",
} as const;

export type MyCoursesFilter = (typeof MY_COURSES.filters)[number]["ma"];
