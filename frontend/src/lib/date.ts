// Dinh dang ngay cho <input type="date"> theo gio dia phuong.
// Dung toISOString() se lech mot ngay o cac mui gio am.
export const toDateInput = (v?: string) => {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};

/** Ngay kieu vi-VN ("12/9/2026"); khong co gia tri thi chuoi rong. */
export const fmtDate = (v?: string) => (v ? new Date(v).toLocaleDateString("vi-VN") : "");
