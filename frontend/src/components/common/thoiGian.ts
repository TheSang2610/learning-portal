// "14 giờ trước", "2 ngày trước" - kieu hien thoi gian tuong doi.

const PHUT = 60_000;
const GIO = 60 * PHUT;
const NGAY = 24 * GIO;

/**
 * Doi moc thoi gian thanh chuoi tuong doi.
 *
 * Qua 30 ngay thi tra ve ngay thang cu the: "3 thang truoc" khong giup ich gi
 * ma con lam nguoi doc phai tu tinh nguoc lai.
 */
export function thoiGianTuongDoi(iso: string): string {
  const moc = new Date(iso).getTime();
  if (Number.isNaN(moc)) return "";

  const cach = Date.now() - moc;

  // Dong ho may nguoi dung co the chay cham hon may chu vai giay -> ra so am.
  if (cach < PHUT) return "vừa xong";

  if (cach < GIO) return `${Math.floor(cach / PHUT)} phút trước`;
  if (cach < NGAY) return `${Math.floor(cach / GIO)} giờ trước`;
  if (cach < 30 * NGAY) return `${Math.floor(cach / NGAY)} ngày trước`;

  return new Date(moc).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Uoc luong thoi gian doc. Nguoi Viet doc khoang 200 tu mot phut. */
export function phutDoc(text: string): number {
  const soTu = String(text || "")
    // Bai soan bang HTML thi ten the va dia chi anh cung bi dem la "tu": mot
    // bai ba doan co the ra "12 phut doc". Go the truoc khi dem.
    .replace(/<[^>]+>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(soTu / 200));
}
