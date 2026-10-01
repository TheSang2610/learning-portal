import type { CauHoi } from "./practiceData";

// Thiet lap phong luyen tap - dung chung cho trang thiet lap va trang lam bai.
//
// Thiet lap la thoi quen cua tung nguoi (khong phai du lieu can dong bo) nen
// nho trong trinh duyet la du; hong hay bi chan thi dung mac dinh.

export interface ThietLap {
  soLuong: number;
  /** Xao ca thu tu cau lan thu tu dap an trong moi cau */
  xaoTron: boolean;
}

export const MAC_DINH: ThietLap = {
  soLuong: 50,
  xaoTron: false,
};

const KHOA_LUU = "practice-setup";

export function docThietLap(): ThietLap {
  try {
    const raw = localStorage.getItem(KHOA_LUU);
    return raw ? { ...MAC_DINH, ...JSON.parse(raw) } : MAC_DINH;
  } catch {
    return MAC_DINH;
  }
}

export function luuThietLap(tl: ThietLap) {
  try {
    localStorage.setItem(KHOA_LUU, JSON.stringify(tl));
  } catch {
    /* bi chan thi thoi, khong anh huong luyen tap */
  }
}

/** Chia de thanh cac bo lien tiep theo so cau moi luot: "Câu 1 - 50", "Câu 51 - 100"... */
export const chiaBo = (soCau: number, moiBo: number) =>
  Array.from({ length: Math.ceil(soCau / moiBo) }, (_, i) => ({
    tu: i * moiBo + 1,
    den: Math.min((i + 1) * moiBo, soCau),
  }));

/** Cau tra loi dung khi chon DUNG va DU cac dap an dung (cau nhieu dap an cung vay). */
export function traLoiDung(chon: number[] | undefined, dung: number[]) {
  if (!chon || chon.length !== dung.length) return false;
  return dung.every((d) => chon.includes(d));
}

/** Diem thang 10, lam tron 2 chu so va bo so 0 thua: 2/77 -> "0.26", 50/50 -> "10" */
export const diem10 = (dung: number, tong: number) =>
  tong ? String(Math.round((dung / tong) * 1000) / 100) : "0";

export function xaoTron<T>(ds: T[]): T[] {
  const a = [...ds];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Dap an nhac toi dap an khac ("Tat ca cac dap an tren", "Ca A va B"...) thi
// dao thu tu la sai nghia - cau nhu vay giu nguyen thu tu dap an.
const NHAC_DAP_AN_KHAC =
  /tất cả|cả hai|cả ba|cả [a-d]\b|đều đúng|đều sai|các (đáp án|phương án|câu) trên|ở trên|nêu trên|không có (đáp án|phương án|câu) nào|\b[A-D] (và|,) [A-D]\b/i;

/** Thu tu dap an de hien cho mot cau khi xao tron; [] = giu nguyen thu tu goc. */
export const thuTuDapAnNgauNhien = (c: CauHoi): number[] =>
  c.dapAn.some((a) => NHAC_DAP_AN_KHAC.test(a)) ? [] : xaoTron(c.dapAn.map((_, k) => k));

/**
 * Hien cau theo mot thu tu dap an, doi chi so dap an dung theo. Dung chung cho
 * phong lam bai (luc xao) va trang xem lai (dung lai tu ban da luu) - hai ben
 * phai dung lai GIONG HET nhau thi dap an moi khop voi lua chon da luu.
 */
export function apThuTu(c: CauHoi, thuTu: number[]): CauHoi {
  if (thuTu.length !== c.dapAn.length) return c;
  return {
    ...c,
    dapAn: thuTu.map((k) => c.dapAn[k]),
    dung: c.dung.map((d) => thuTu.indexOf(d)),
  };
}

const hai = (n: number) => String(n).padStart(2, "0");

/** 1866 -> "31 phút 6 giây" */
export function thoiLuong(giay: number) {
  const g = Math.max(0, giay);
  const gio = Math.floor(g / 3600);
  const phut = Math.floor((g % 3600) / 60);
  const s = g % 60;
  return [gio && `${gio} giờ`, (gio || phut) && `${phut} phút`, `${s} giây`]
    .filter(Boolean)
    .join(" ");
}

export const ngayGio = (t: number) => {
  const d = new Date(t);
  return `${hai(d.getDate())}/${hai(d.getMonth() + 1)}/${d.getFullYear()} ${hai(d.getHours())}:${hai(d.getMinutes())}`;
};
