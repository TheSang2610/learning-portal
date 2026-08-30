// Ba cau truc thang diem cho nguoi dung chon, dung thu tu nhu ban goc:
//   0 - A+  A  B+  B  C+  C  D+  D  F   (9 muc)
//   1 - A  B+  B  C+  C  D+  D  F       (8 muc)
//   2 - A  B  C  D  F                   (5 muc)
//
// Moc he 10 lay theo bang quy doi cua Grade PTIT. Cac moc le 0.05 (8.95, 8.45,
// 7.95...) la vi diem tong ket duoc LAM TRON den mot chu so thap phan truoc khi
// xet: 8.95 lam tron thanh 9.0 nen van la A+. So sanh thang voi moc nay cho ket
// qua giong het viec lam tron roi moi so sanh, ma khong phai lam tron hai lan.
//
// Thang 9 muc lay nguyen tu bang goc. Hai thang con lai ap dung cung quy uoc
// -0.05 do de ba thang nhat quan voi nhau.

export interface Grade {
  letter: string;
  /** Diem he 4 */
  gpa4: number;
  /** Diem he 10 toi thieu de dat muc nay */
  min10: number;
}

export interface Scale {
  id: string;
  label: string;
  grades: Grade[];
}

export const SCALES: Scale[] = [
  {
    id: "0",
    label: "A+ A B+ B C+ C D+ D F",
    grades: [
      { letter: "A+", gpa4: 4.0, min10: 8.95 },
      { letter: "A", gpa4: 3.7, min10: 8.45 },
      { letter: "B+", gpa4: 3.5, min10: 7.95 },
      { letter: "B", gpa4: 3.0, min10: 6.95 },
      { letter: "C+", gpa4: 2.5, min10: 6.45 },
      { letter: "C", gpa4: 2.0, min10: 5.45 },
      { letter: "D+", gpa4: 1.5, min10: 4.95 },
      { letter: "D", gpa4: 1.0, min10: 3.95 },
      { letter: "F", gpa4: 0, min10: 0 },
    ],
  },
  {
    id: "1",
    label: "A B+ B C+ C D+ D F",
    grades: [
      { letter: "A", gpa4: 4.0, min10: 8.45 },
      { letter: "B+", gpa4: 3.5, min10: 7.95 },
      { letter: "B", gpa4: 3.0, min10: 6.95 },
      { letter: "C+", gpa4: 2.5, min10: 6.45 },
      { letter: "C", gpa4: 2.0, min10: 5.45 },
      { letter: "D+", gpa4: 1.5, min10: 4.95 },
      { letter: "D", gpa4: 1.0, min10: 3.95 },
      { letter: "F", gpa4: 0, min10: 0 },
    ],
  },
  {
    id: "2",
    label: "A B C D F",
    grades: [
      { letter: "A", gpa4: 4.0, min10: 8.45 },
      { letter: "B", gpa4: 3.0, min10: 6.95 },
      { letter: "C", gpa4: 2.0, min10: 5.45 },
      { letter: "D", gpa4: 1.0, min10: 3.95 },
      { letter: "F", gpa4: 0, min10: 0 },
    ],
  },
];

export const scaleById = (id: string) => SCALES.find((s) => s.id === id) ?? SCALES[0];

/** Diem he 10 -> muc diem chu trong thang dang chon */
export const gradeOf = (scale: Scale, score10: number): Grade =>
  // Danh sach da sap xep giam dan nen muc dau tien khop chinh la muc dung
  scale.grades.find((g) => score10 >= g.min10) ?? scale.grades[scale.grades.length - 1];

/** Diem he 4 cua mot ky tu diem chu; NaN neu khong co trong thang */
export const gpa4Of = (scale: Scale, letter: string): number =>
  scale.grades.find((g) => g.letter === letter)?.gpa4 ?? NaN;

/** Khoang diem he 10 cua mot muc, dang "8.45 - 8.94" nhu bang goc */
export function rangeOf(scale: Scale, i: number): string {
  const g = scale.grades[i];
  const lo = g.min10 === 0 ? "0" : g.min10.toFixed(2);
  // Can tren la moc cua muc ngay tren tru 0.01
  const hi = i === 0 ? "10" : (scale.grades[i - 1].min10 - 0.01).toFixed(2);
  return `${lo} - ${hi}`;
}

// --- Cau truc diem thanh phan cua mot mon hoc ---
// He so tinh theo phan tram, tong moi cau truc luon bang 100.

export interface PointStructure {
  id: string;
  label: string;
  weights: number[];
}

export const STRUCTURES: PointStructure[] = [
  { id: "0", label: "10-20-20-50", weights: [10, 20, 20, 50] },
  { id: "1", label: "10-10-30-50", weights: [10, 10, 30, 50] },
  { id: "2", label: "10-10-20-60", weights: [10, 10, 20, 60] },
  { id: "3", label: "10-10-10-70", weights: [10, 10, 10, 70] },
  { id: "4", label: "10-30-60", weights: [10, 30, 60] },
  { id: "5", label: "10-20-70", weights: [10, 20, 70] },
  { id: "6", label: "10-10-80", weights: [10, 10, 80] },
];

export const structureById = (id: string) =>
  STRUCTURES.find((s) => s.id === id) ?? STRUCTURES[0];

// --- Muc tieu xep loai bang tot nghiep ---
// Nguong CPA he 4 theo quy che tin chi pho bien.

export interface Target {
  id: string;
  label: string;
  min: number;
}

export const TARGETS: Target[] = [
  { id: "xuatsac", label: "Bằng xuất sắc", min: 3.6 },
  { id: "gioi", label: "Bằng giỏi", min: 3.2 },
  { id: "kha", label: "Bằng khá", min: 2.5 },
  { id: "trungbinh", label: "Bằng trung bình", min: 2.0 },
];

export const targetById = (id: string) => TARGETS.find((t) => t.id === id) ?? null;

export interface SuggestInput {
  id: string;
  credits: number;
  gpa4: number;
}

export interface SuggestResult {
  /** id mon -> diem chu nen hoc cai thien len */
  bySubject: Record<string, string>;
  /** false = cai thien het muc cung khong du de cham muc tieu */
  enough: boolean;
}

/**
 * Chon MOT NHOM mon nen hoc cai thien de keo CPA len muc tieu.
 *
 * Goi C la tong tin chi, P tong diem hien tai, T muc tieu. Con thieu:
 *   deficit = T*C - P
 * Duyet lan luot cac mon con du dia cai thien, moi mon chon muc THAP NHAT du
 * bu phan con thieu, tru dan cho den khi het.
 *
 * "variant" doi thu tu duyet nen moi lan bam "tinh lai" cho mot phuong an khac:
 * nang manh vai mon, hay nang nhe nhieu mon, hay uu tien mon nhieu tin chi.
 */
export function suggestImprovements(
  scale: Scale,
  targetMin: number,
  subjects: SuggestInput[],
  variant = 0
): SuggestResult {
  const bySubject: Record<string, string> = {};

  const valid = subjects.filter((s) => s.credits > 0 && Number.isFinite(s.gpa4));
  const C = valid.reduce((a, s) => a + s.credits, 0);
  if (C <= 0) return { bySubject, enough: true };

  const P = valid.reduce((a, s) => a + s.gpa4 * s.credits, 0);
  let deficit = targetMin * C - P;
  if (deficit <= 1e-9) return { bySubject, enough: true };

  const top = scale.grades[0];
  const room = (s: SuggestInput) => (top.gpa4 - s.gpa4) * s.credits;

  const orders: ((a: SuggestInput, b: SuggestInput) => number)[] = [
    (a, b) => room(b) - room(a),      // it mon, moi mon nang nhieu
    (a, b) => room(a) - room(b),      // nhieu mon, moi mon nang it
    (a, b) => b.credits - a.credits,  // uu tien mon nhieu tin chi
  ];

  const sorted = valid
    .filter((s) => room(s) > 1e-9)
    .sort(orders[((variant % orders.length) + orders.length) % orders.length]);

  for (const s of sorted) {
    if (deficit <= 1e-9) break;

    const want = s.gpa4 + deficit / s.credits;
    const ok = scale.grades.filter((g) => g.gpa4 >= want - 1e-9);
    const pick = ok.length > 0 ? ok[ok.length - 1] : top;

    if (pick.gpa4 <= s.gpa4 + 1e-9) continue;

    bySubject[s.id] = pick.letter;
    deficit -= (pick.gpa4 - s.gpa4) * s.credits;
  }

  return { bySubject, enough: deficit <= 1e-9 };
}

/** Xep loai hoc luc theo diem he 4 */
export function classify(gpa4: number): { label: string; cls: string } {
  if (gpa4 >= 3.6) return { label: "Xuất sắc", cls: "bg-emerald-50 text-emerald-800" };
  if (gpa4 >= 3.2) return { label: "Giỏi", cls: "bg-red-50 text-red-800" };
  if (gpa4 >= 2.5) return { label: "Khá", cls: "bg-amber-50 text-amber-900" };
  if (gpa4 >= 2.0) return { label: "Trung bình", cls: "bg-orange-50 text-orange-900" };
  if (gpa4 >= 1.0) return { label: "Yếu", cls: "bg-rose-50 text-rose-900" };
  return { label: "Kém", cls: "bg-red-100 text-red-900" };
}
