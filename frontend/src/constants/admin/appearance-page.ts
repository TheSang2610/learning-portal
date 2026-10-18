/** Chu cua trang /admin/appearance (cai dat giao dien trang hoc vien). */
export const ADMIN_APPEARANCE = {
  loading: "Đang tải cài đặt…",
  title: "Cài đặt giao diện",
  description:
    "Bật/tắt các mục khóa học nổi bật và đổi màu banner quảng cáo trên trang học viên. Lưu xong, trang chủ cập nhật trong khoảng 30 giây.",
  save: "Lưu thay đổi",
  saving: "Đang lưu…",
  undo: "Hoàn tác",
  savedNotice: "Đã lưu. Trang chủ sẽ hiển thị thay đổi trong khoảng 30 giây.",
  saveError: "Không lưu được. Kiểm tra kết nối rồi thử lại.",
  resetColors: "Màu mặc định",
  showBanner: "Hiển thị banner",
  preview: "Xem trước",
  sections: {
    title: "Mục “Khóa học mới và phổ biến”",
    description:
      "Ba cột hiện ở trang chủ (khách và học viên) và trang Khóa học. Tắt hết thì ẩn cả mục.",
    items: [
      {
        key: "mostPopular",
        label: "Phổ biến nhất",
        description: "Khóa có nhiều lượt xem và học viên nhất.",
      },
      {
        key: "newReleases",
        label: "Mới phát hành",
        description: "Khóa mới được xuất bản gần đây.",
      },
      {
        key: "trendingNow",
        label: "Đang thịnh hành",
        description: "Khóa được xem nhiều trong tháng này.",
      },
    ],
  },
  banners: [
    {
      key: "guestPromo",
      title: "Banner mời đăng ký (khách)",
      description: "Dải lớn dưới phần mở đầu trang chủ, chỉ khách chưa đăng nhập thấy.",
      where: "Trang chủ khi chưa đăng nhập.",
    },
    {
      key: "memberPromo",
      title: "Banner giới thiệu (học viên)",
      description: "Dải gọn trên trang chủ của học viên đã đăng nhập.",
      where: "Trang chủ khi đã đăng nhập.",
    },
  ],
  colorGroups: [
    { title: "Nền và chữ", keys: ["bgFrom", "bgTo", "text"] },
    { title: "Nút chính", keys: ["buttonBg", "buttonText"] },
    { title: "Nút khi rê chuột", keys: ["buttonHoverBg", "buttonHoverText"] },
  ],
  colorLabels: {
    bgFrom: "Nền (màu đầu)",
    bgTo: "Nền (màu cuối)",
    text: "Chữ",
    buttonBg: "Nền nút",
    buttonText: "Chữ nút",
    buttonHoverBg: "Nền nút khi rê chuột",
    buttonHoverText: "Chữ nút khi rê chuột",
  },
} as const;
