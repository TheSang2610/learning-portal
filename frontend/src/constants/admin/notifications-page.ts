import type { RecipientRole } from "@/src/services/announcement";

/** Chu va cau hinh cua trang /admin/notifications (thong bao he thong). */
export const ADMIN_NOTIFICATIONS = {
  maxTitle: 200,
  maxBody: 1000,

  title: "Thông báo hệ thống",
  intro:
    "Thông báo hiện trong ô chuông. Gửi riêng cho học viên hoặc giảng viên, hoặc ghim một thông báo chung cho mọi người. Đã gửi rồi vẫn sửa hoặc thu hồi được ở danh sách bên dưới.",

  form: {
    editing: "Đang sửa: ",
    title: "Tiêu đề",
    titlePlaceholder: "Hệ thống bảo trì tối nay",
    body: "Nội dung",
    bodyPlaceholder: "Hệ thống sẽ bảo trì từ 23h đến 1h sáng mai.",
    counter: (n: number, max: number) => `${n}/${max}`,
    link: "Đường dẫn khi bấm vào (tùy chọn)",
    linkPlaceholder: "/courses",
    linkHint:
      "Chỉ nhận đường dẫn trong trang, bắt đầu bằng dấu gạch chéo. Địa chỉ bên ngoài sẽ bị bỏ.",
    where: "Hiện ở đâu",
    editBellSent: (n: number) =>
      `Đã gửi vào chuông của ${n} người — sửa ở đây sẽ cập nhật luôn trong chuông của họ.`,
    editNoBell: "Đợt này không gửi vào chuông.",
    bell: "Chuông thông báo",
    bellHint: "Chỉ người đã đăng nhập thấy. Sửa hoặc thu hồi được sau khi gửi.",
    sendTo: "Gửi cho",
    audiences: [
      { value: "", label: "Tất cả học viên và giảng viên" },
      { value: "student", label: "Chỉ học viên" },
      { value: "instructor", label: "Chỉ giảng viên" },
    ] satisfies { value: RecipientRole; label: string }[],
    public: "Thông báo chung cho mọi người",
    publicHint:
      "Ghim ở đầu ô chuông của mọi người đã đăng nhập, kể cả người mới đăng ký sau này. Bỏ ghim hoặc xóa được bất cứ lúc nào.",
    level: "Mức độ",
    levels: [
      { value: "thong_tin", label: "Thông tin (biểu tượng xanh)" },
      { value: "quan_trong", label: "Quan trọng (biểu tượng đỏ)" },
    ],
    expires: "Tự ẩn lúc (tùy chọn)",
  },

  confirm: {
    edit: "Thay đổi sẽ hiện ngay với mọi người đã nhận thông báo này.",
    send: "Thông báo sẽ hiện ngay với người nhận. Vẫn sửa hoặc thu hồi được sau.",
    check: "Kiểm lại nội dung trước khi gửi.",
    back: "Quay lại sửa",
    saving: "Đang lưu…",
    saveReal: "Lưu thật",
    sendReal: "Gửi thật",
  },
  actions: { save: "Lưu thay đổi", send: "Gửi thông báo", cancelEdit: "Hủy sửa" },

  list: {
    title: "Thông báo đã gửi",
    empty: "Chưa gửi thông báo nào từ trang này.",
    pinned: "Đang ghim cho mọi người",
    bell: (n: number, audience: string) => `Chuông · ${n} ${audience}`,
    hidden: "Đã ẩn",
    sentAt: (date: string) => `Gửi ${date}`,
    autoHide: (date: string) => ` · tự ẩn ${date}`,
    confirmRecall: (n: number) => `Thu hồi khỏi chuông của ${n} người?`,
    confirmDelete: "Xóa thông báo này?",
    no: "Không",
    deleting: "Đang xóa…",
    delete: "Xóa",
    edit: "Sửa",
    unpin: "Bỏ ghim",
    pin: "Ghim lại",
    recall: "Thu hồi",
  },

  audienceName: {
    "": "học viên và giảng viên",
    student: "học viên",
    instructor: "giảng viên",
  } satisfies Record<RecipientRole, string>,

  messages: {
    savedWithBell: (n: number) => `Đã lưu. Cập nhật luôn trong chuông của ${n} người.`,
    saved: "Đã lưu thay đổi.",
    pinnedAll: "đã ghim vào chuông của mọi người",
    sentTo: (n: number) => `đã gửi vào chuông của ${n} người`,
    done: (parts: string) => `Xong: ${parts}.`,
    sendFailed: "Không gửi được thông báo.",
    toggleFailed: "Không đổi được trạng thái.",
    recalled: (title: string, n: number) =>
      `Đã thu hồi "${title}" khỏi chuông của ${n} người.`,
    deleted: (title: string) => `Đã xóa "${title}".`,
    deleteFailed: "Không xóa được thông báo.",
  },
} as const;
