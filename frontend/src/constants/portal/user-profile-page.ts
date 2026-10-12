/** Chu cua trang /user/profile. */
export const USER_PROFILE = {
  needLogin: "Vui lòng đăng nhập để xem trang cá nhân.",
  loadFailed: "Không tải được thông tin tài khoản",

  streak: {
    days: "ngày học liên tiếp",
    longest: "Dài nhất:",
    unit: "ngày",
  },
  active: {
    days: "ngày có hoạt động",
    events: " hoạt động",
  },
  dot: "·",
  joined: (ago: string) => `Tham gia ${ago}`,
  joinedAgo: {
    recent: "gần đây",
    months: (n: number) => `${n} tháng trước`,
    oneYear: "một năm trước",
    years: (n: number) => `${n} năm trước`,
  },

  noActivity: "Chưa tải được dữ liệu hoạt động.",

  info: {
    heading: "Thông tin tài khoản",
    name: "Tên hiển thị",
    fullname: "Họ và tên đầy đủ",
    birthday: "Ngày sinh",
    email: "Email",
    phone: "Số điện thoại",
    provider: "Đơn vị công tác",
    bio: "Giới thiệu",
    notSet: "Chưa cập nhật",
  },
} as const;
