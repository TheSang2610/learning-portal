import type { Question } from "./practiceData";

// Thiet lap phong luyen tap - dung chung cho trang thiet lap va trang lam bai.
//
// Thiet lap la thoi quen cua tung nguoi (khong phai du lieu can dong bo) nen
// nho trong trinh duyet la du; hong hay bi chan thi dung mac dinh.

export interface Settings {
  soLuong: number;
  /** Xao ca thu tu cau lan thu tu dap an trong moi cau */
  shuffle: boolean;
}

export const DEFAULTS: Settings = {
  soLuong: 50,
  shuffle: false,
};

const STORAGE_KEY = "practice-setup";

export function readSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export function saveSettings(tl: Settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tl));
  } catch {
    /* bi chan thi thoi, khong anh huong luyen tap */
  }
}

/** Chia de thanh cac bo lien tiep theo so cau moi luot: "Câu 1 - 50", "Câu 51 - 100"... */
export const splitBuckets = (questionCount: number, perBucket: number) =>
  Array.from({ length: Math.ceil(questionCount / perBucket) }, (_, i) => ({
    tu: i * perBucket + 1,
    den: Math.min((i + 1) * perBucket, questionCount),
  }));

/** Cau tra loi dung khi chon DUNG va DU cac dap an dung (cau nhieu dap an cung vay). */
export function correctAnswer(choice: number[] | undefined, correct: number[]) {
  if (!choice || choice.length !== correct.length) return false;
  return correct.every((d) => choice.includes(d));
}

/** Diem thang 10, lam tron 2 chu so va bo so 0 thua: 2/77 -> "0.26", 50/50 -> "10" */
export const diem10 = (correct: number, total: number) =>
  total ? String(Math.round((correct / total) * 1000) / 100) : "0";

export function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Dap an nhac toi dap an khac ("Tat ca cac dap an tren", "Ca A va B"...) thi
// dao thu tu la sai nghia - cau nhu vay giu nguyen thu tu dap an.
const OTHER_ANSWER_HINT =
  /tất cả|cả hai|cả ba|cả [a-d]\b|đều đúng|đều sai|các (đáp án|phương án|câu) trên|ở trên|nêu trên|không có (đáp án|phương án|câu) nào|\b[A-D] (và|,) [A-D]\b/i;

/** Thu tu dap an de hien cho mot cau khi xao tron; [] = giu nguyen thu tu goc. */
export const shuffleAnswers = (c: Question): number[] =>
  c.dapAn.some((a) => OTHER_ANSWER_HINT.test(a)) ? [] : shuffle(c.dapAn.map((_, k) => k));

/**
 * Hien cau theo mot thu tu dap an, doi chi so dap an dung theo. Dung chung cho
 * phong lam bai (luc xao) va trang xem lai (dung lai tu ban da luu) - hai ben
 * phai dung lai GIONG HET nhau thi dap an moi khop voi lua chon da luu.
 */
export function applyOrder(c: Question, order: number[]): Question {
  if (order.length !== c.dapAn.length) return c;
  return {
    ...c,
    dapAn: order.map((k) => c.dapAn[k]),
    dung: c.dung.map((d) => order.indexOf(d)),
  };
}

const pad2 = (n: number) => String(n).padStart(2, "0");

/** 1866 -> "31 phút 6 giây" */
export function duration(seconds: number) {
  const g = Math.max(0, seconds);
  const hour = Math.floor(g / 3600);
  const minutes = Math.floor((g % 3600) / 60);
  const s = g % 60;
  return [hour && `${hour} giờ`, (hour || minutes) && `${minutes} phút`, `${s} giây`]
    .filter(Boolean)
    .join(" ");
}

export const dateTime = (t: number) => {
  const d = new Date(t);
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};
