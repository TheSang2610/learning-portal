/** Chu cua trang /admin/dashboard (bo cuc shadcn/ui Dashboard). */
export const ADMIN_DASHBOARD = {
  loading: "Đang tải số liệu…",
  error: "Không tải được số liệu. Thử tải lại trang.",
  title: "Bảng điều khiển",
  subtitle: "Số liệu toàn hệ thống, cập nhật theo thời gian thực.",
  vs30: "so với 30 ngày trước",
  newBadge: "Mới",
  cards: {
    users: {
      label: "Người dùng",
      /** {n} = so nguoi dang ky trong 30 ngay. */
      footer: "{n} người đăng ký trong 30 ngày",
      detail: "{s} học viên · {i} giảng viên",
    },
    courses: {
      label: "Khóa học",
      badge: "{n} đã xuất bản",
      footer: "{n} bản nháp chưa xuất bản",
      detail: "{q} bài kiểm tra trên hệ thống",
    },
    enrollments: {
      label: "Lượt ghi danh",
      footer: "{n} lượt ghi danh trong 30 ngày",
      detail: "{a} đang học · {c} đã hoàn thành",
    },
    certificates: {
      label: "Chứng nhận đã cấp",
      footer: "{n} chứng nhận trong 30 ngày",
      detail: "{v} còn hiệu lực · ★ {r} điểm đánh giá TB",
    },
  },
  chart: {
    title: "Hoạt động",
    description: "Người dùng mới và lượt ghi danh theo ngày",
    ranges: [
      { days: 90, label: "3 tháng" },
      { days: 30, label: "30 ngày" },
      { days: 7, label: "7 ngày" },
    ],
    series: {
      enrollments: "Ghi danh",
      users: "Người dùng mới",
    },
  },
  table: {
    title: "Ghi danh gần đây",
    description: "8 lượt ghi danh mới nhất",
    viewAll: "Xem tất cả",
    viewAllHref: "/admin/enrollments",
    columns: ["Học viên", "Khóa học", "Tiến độ", "Trạng thái", "Ngày"],
    status: { active: "Đang học", completed: "Hoàn thành", dropped: "Đã hủy" },
    empty: "Chưa có lượt ghi danh nào.",
    deleted: "(đã xóa)",
  },
} as const;
