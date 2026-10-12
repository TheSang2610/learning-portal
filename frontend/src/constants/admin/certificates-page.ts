import type { SelectOption } from "@/src/types/course-form";

/** Chu va cau hinh cua trang /admin/certificates. */
export const ADMIN_CERTIFICATES = {
  pageSize: 10,

  title: "Chứng chỉ",
  loading: "Đang tải...",
  count: (n: number) => `${n} chứng chỉ đã cấp`,

  filters: [
    { value: "", label: "Mọi trạng thái" },
    { value: "valid", label: "Còn hiệu lực" },
    { value: "revoked", label: "Đã thu hồi" },
  ] satisfies SelectOption[],

  columns: [
    "Học viên",
    "Khóa học",
    "Số hiệu / Mã xác thực",
    "Điểm",
    "Ngày cấp",
    "Bản PDF",
    "Trạng thái",
  ],
  empty: "Chưa có chứng chỉ nào được cấp.",

  row: {
    deleted: "(đã xóa)",
    none: "--",
    instructor: (name: string) => `GV: ${name}`,
    copyTitle: "Sao chép mã xác thực",
    pdfTitle: "Mở bản PDF của chứng nhận này",
    pdf: "Xem PDF",
    valid: "Hợp lệ",
    revoked: "Đã thu hồi",
    revokeTitle: "Thu hồi chứng chỉ",
    alreadyRevoked: "Đã thu hồi rồi",
  },

  messages: {
    loadFailed: "Không tải được danh sách chứng chỉ",
    studentFallback: "học viên",
    confirmRevoke: (student: string, number: string) =>
      `Thu hồi chứng chỉ của "${student}"?\n\n` +
      `Số hiệu: ${number}\n` +
      `Chứng chỉ sẽ bị đánh dấu không hợp lệ và không xác thực được nữa.`,
    revokeFailed: "Thu hồi thất bại",
  },
} as const;
