/**
 * Cach day bao lau, doc bang tieng Viet: "vừa xong", "3 giờ trước"...
 * Qua 7 ngay thi ghi ngay thang (vi-VN).
 *
 * Khong dung toLocaleString: mot cai nhan "14:32 12/09" bat nguoi doc phai tu
 * tinh xem no la lau chua. "3 giờ trước" tra loi thang cau ho dang hoi.
 *
 * Truoc day chuong thong bao, hoi dap bai hoc va trang hoi dap giang vien moi
 * noi chep mot ban. Ban 30 ngay cua blog nam o components/common/time.ts.
 */
export function gap(moc: string): string {
  const seconds = Math.floor((Date.now() - new Date(moc).getTime()) / 1000);

  if (seconds < 60) return "vừa xong";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} ngày trước`;

  return new Date(moc).toLocaleDateString("vi-VN");
}

/** Ten hien thi cua mot nguoi: ten, khong co thi phan truoc @ cua email. */
export function displayName(
  n: { name?: string; email?: string } | null | undefined,
  defaults: string,
): string {
  return n?.name?.trim() || n?.email?.split("@")[0] || defaults;
}

/** 754 -> "12:34". Luon hai chu so de con so khong nhay qua lai. So am tinh la 0. */
export function clockFormat(seconds: number): string {
  const hidden = Math.max(0, seconds);
  return `${String(Math.floor(hidden / 60)).padStart(2, "0")}:${String(hidden % 60).padStart(2, "0")}`;
}
