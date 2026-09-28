// Ten truong dai hoc - khop utils/universityName.js ben backend.

const TIEN_TO = ["trường cao đẳng", "trường đại học", "đại học", "học viện", "trường"];

/** "Trường Đại học Tôn Đức Thắng" -> "Tôn Đức Thắng". Xem ban backend. */
export function tenChinhTruong(ten: string): string {
  let s = ten.replace(/\s+/g, " ").trim();
  const thuong = s.toLowerCase();
  for (const t of TIEN_TO) {
    if (thuong.startsWith(`${t} `)) {
      s = s.slice(t.length).trim();
      break;
    }
  }
  return s;
}

/**
 * Chu cai dau de xep theo bang chu cai. "Đ" rieng mot chu (nhu tieng Viet);
 * cac chu co dau khac quy ve chu goc ("Ư" -> "U", "Ô" -> "O").
 */
export function chuCaiDau(ten: string): string {
  const c = tenChinhTruong(ten).charAt(0).toUpperCase();
  if (c === "Đ") return "Đ";
  return c.normalize("NFD").replace(/[̀-ͯ]/g, "") || "#";
}

/** Bo dau + chu thuong - de tim khong phan biet dau. */
export const boDau = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
