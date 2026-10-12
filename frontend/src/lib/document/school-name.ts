// Ten truong dai hoc - khop utils/universityName.js ben backend.

const PREFIX = ["trường cao đẳng", "trường đại học", "đại học", "học viện", "trường"];

/** "Trường Đại học Tôn Đức Thắng" -> "Tôn Đức Thắng". Xem ban backend. */
export function mainSchoolName(name: string): string {
  let s = name.replace(/\s+/g, " ").trim();
  const thuong = s.toLowerCase();
  for (const t of PREFIX) {
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
export function initialLetter(name: string): string {
  const c = mainSchoolName(name).charAt(0).toUpperCase();
  if (c === "Đ") return "Đ";
  return c.normalize("NFD").replace(/[̀-ͯ]/g, "") || "#";
}

/** Bo dau + chu thuong - de tim khong phan biet dau. */
export const stripAccents = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
