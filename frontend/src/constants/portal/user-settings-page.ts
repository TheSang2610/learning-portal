import { BookOpen, Shield, User as UserIcon, type LucideIcon } from "lucide-react";

import type { SettingsTabKey } from "@/src/types/settings";

// Giu dung mot bo luat voi may chu (backend/src/routes/userRoutes.js). Lech
// nhau la nguoi dung chon duoc anh ma tai len lai bi tu choi.
export const MAX_IMAGE_MB = 5;
export const IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export const SETTINGS_NAV: {
  group: string;
  items: { key: SettingsTabKey; label: string; icon: LucideIcon }[];
}[] = [
  {
    group: "Tài khoản",
    items: [
      { key: "personal", label: "Thông tin cá nhân", icon: UserIcon },
      { key: "security", label: "Mật khẩu và bảo mật", icon: Shield },
    ],
  },
  {
    group: "Học tập",
    items: [{ key: "courses", label: "Khóa học của tôi", icon: BookOpen }],
  },
];

export const SETTINGS_TAB_META: Record<SettingsTabKey, { title: string; desc: string }> =
  {
    personal: {
      title: "Thông tin cá nhân",
      desc: "Quản lý tên hiển thị, ảnh đại diện và thông tin liên hệ của bạn.",
    },
    security: {
      title: "Mật khẩu và bảo mật",
      desc: "Quản lý mật khẩu, tài khoản liên kết và trạng thái tài khoản.",
    },
    courses: {
      title: "Khóa học của tôi",
      desc: "Các khóa học bạn đã đăng ký và tiến độ học tập.",
    },
  };

export const ROLE_LABEL: Record<string, string> = {
  admin: "Quản trị viên",
  instructor: "Giảng viên",
};
export const ROLE_LABEL_DEFAULT = "Học viên";

export const USER_SETTINGS = {
  title: "Cài đặt tài khoản",
  subtitle: "Quản lý hồ sơ, bảo mật và khóa học của bạn.",
  navAria: "Cài đặt tài khoản",
  needLogin: "Vui lòng đăng nhập để vào phần cài đặt.",
  homeHref: "/",
  coursesHref: "/courses",
  learnHref: (slug: string) => `/learn?slug=${encodeURIComponent(slug)}`,

  form: {
    save: "Lưu",
    saving: "Đang lưu...",
    cancel: "Hủy",
  },

  messages: {
    loadFailed: "Không tải được thông tin tài khoản",
    saved: "Đã lưu thay đổi.",
    saveFailed: "Lưu thất bại.",
    avatarSaved: "Đã cập nhật ảnh đại diện.",
    avatarFailed: "Tải ảnh thất bại.",
  },

  personal: {
    basic: {
      title: "Thông tin cơ bản",
      desc: "Quản lý tên hiển thị, họ tên, ngày sinh, giới thiệu và ảnh đại diện.",
    },
    name: {
      label: "Tên hiển thị",
      hint: "Từ 2 đến 50 ký tự. Đây là tên hiện trên thanh điều hướng và trang cá nhân.",
    },
    fullname: {
      label: "Họ và tên",
      hint: "Để trống nếu bạn không muốn hiển thị họ tên thật.",
      placeholder: "Nguyễn Văn A",
    },
    birthday: { label: "Ngày sinh" },
    bio: {
      label: "Giới thiệu",
      hint: (n: number) => `${n}/500 ký tự`,
      placeholder: "Vài dòng về bản thân bạn...",
    },
    avatar: {
      label: "Ảnh đại diện",
      upload: "Tải ảnh lên",
      hint: (mb: number) =>
        `Ảnh JPG, PNG, WEBP hoặc GIF, tối đa ${mb}MB. Ảnh được cắt vuông về 400×400 khi tải lên.`,
      previewChosen: "Xem trước ảnh vừa chọn",
      removeChosen: "Bỏ ảnh đã chọn",
      pick: "Bấm để chọn ảnh từ máy",
      pickHint: (mb: number) => `JPG, PNG, WEBP hoặc GIF · tối đa ${mb}MB`,
      orPaste: "hoặc dán đường dẫn",
      urlPlaceholder: "https://...",
      previewUrl: "Xem trước ảnh đại diện",
      badType: "Chỉ nhận ảnh JPG, PNG, WEBP hoặc GIF.",
      tooBig: (mb: number, size: string) =>
        `Ảnh tối đa ${mb}MB. Ảnh bạn chọn nặng ${size}.`,
    },
    contact: {
      title: "Liên hệ",
      desc: "Thông tin dùng để liên lạc và định danh tài khoản.",
    },
    phone: {
      label: "Số điện thoại",
      hint: "Số di động 10 chữ số, ví dụ 0901234567. Mỗi số chỉ dùng cho một tài khoản, và đây là cách đăng nhập của bạn nên không xóa trắng được.",
      placeholder: "0901234567",
    },
    email: {
      label: "Email",
      lockedHint:
        "Email đã đặt thì không tự đổi được, vì đây là nơi nhận mã đặt lại mật khẩu.",
      addHint:
        "Thêm email để tự lấy lại mật khẩu khi quên. Thêm xong thì không tự đổi được nữa, nên hãy nhập đúng địa chỉ bạn đang dùng.",
      placeholder: "ban@gmail.com",
    },
    provider: {
      label: "Đơn vị công tác",
      hint: "Khóa học bạn tạo sẽ được gán về đơn vị này.",
      none: "-- Không thuộc đơn vị nào --",
      university: "[Trường ĐH] ",
      company: "[Doanh nghiệp] ",
    },
    system: {
      title: "Thông tin hệ thống",
      userId: "Mã người dùng",
      role: "Vai trò",
      joined: "Ngày tham gia",
    },
  },

  security: {
    login: {
      title: "Đăng nhập",
      desc: "Quản lý mật khẩu dùng để đăng nhập vào tài khoản.",
    },
    password: {
      label: "Mật khẩu",
      masked: "••••••••",
      notSet: "Chưa đặt mật khẩu",
      hintHas: "Đổi mật khẩu định kỳ để giữ an toàn cho tài khoản.",
      hintNone: "Đặt mật khẩu để có thể đăng nhập bằng email, không chỉ qua Google.",
      change: "Đổi mật khẩu",
      set: "Đặt mật khẩu",
      current: "Mật khẩu hiện tại",
      googleOnly:
        "Tài khoản của bạn đăng nhập bằng Google và chưa có mật khẩu. Đặt mật khẩu để đăng nhập được bằng email.",
      next: "Mật khẩu mới",
      confirm: "Nhập lại mật khẩu mới",
    },
    linked: {
      title: "Tài khoản liên kết",
      desc: "Các tài khoản mạng xã hội dùng để đăng nhập nhanh.",
      google: "Google",
      notLinked: "Chưa liên kết",
      linked: "Đã liên kết",
    },
    deactivate: {
      title: "Vô hiệu hóa tài khoản",
      desc: "Tài khoản sẽ bị khóa và bạn sẽ bị đăng xuất ngay lập tức.",
      value: "Chỉ quản trị viên mới có thể mở khóa lại",
      warning:
        "Dữ liệu học tập của bạn được giữ nguyên, nhưng bạn sẽ không đăng nhập lại được cho tới khi quản trị viên mở khóa.",
      confirmLabel: "Nhập mật khẩu để xác nhận",
      processing: "Đang xử lý...",
      submit: "Vô hiệu hóa tài khoản",
    },
    messages: {
      needCurrent: "Vui lòng nhập mật khẩu hiện tại.",
      mismatch: "Xác nhận mật khẩu không khớp.",
      deactivateFailed: "Không thể vô hiệu hóa.",
      /** Loi chung "Mật khẩu ..." doi thanh "Mật khẩu mới ..." cho dung o dang sua. */
      fromRule: (err: string) => err.replace("Mật khẩu", "Mật khẩu mới") + ".",
    },
  },

  courses: {
    title: "Khóa học đã đăng ký",
    count: (n: number) => `${n} khóa học`,
    loadFailed: "Không tải được danh sách",
    emptyTitle: "Chưa đăng ký khóa học nào",
    emptyText: "Các khóa học bạn đăng ký sẽ xuất hiện tại đây.",
    explore: "Khám phá khóa học",
    deleted: "Khóa học không còn tồn tại",
    enrolled: (d: string) => `Đăng ký ${d}`,
    lastAccess: (d: string) => ` · Học gần nhất ${d}`,
    learn: "Vào học",
    status: {
      active: "Đang học",
      completed: "Hoàn thành",
      dropped: "Đã dừng",
    },
  },
} as const;
