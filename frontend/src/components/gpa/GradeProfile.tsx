"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Trash2, RotateCcw, Target as TargetIcon } from "lucide-react";
import GradeChart, { type ChartPoint } from "./GradeChart";

import styles from "./GradeProfile.module.scss";
import {
  SCALES,
  TARGETS,
  type Scale,
  scaleById,
  targetById,
  gpa4Of,
  gradeOf,
  suggestImprovements,
  classify,
} from "./gradeScales";

interface Subject {
  id: string;
  name: string;
  /** Giu dang chuoi de go dang do (vd "1.") khong bi nhay so */
  credits: string;
  /**
   * Diem he 10 go tay (vd "8,5"). Co diem hop le thi `letter` duoc suy ra tu no
   * theo thang dang chon. Tuy chon vi ho so luu truoc khi co o nay thi khong co.
   */
  score10?: string;
  letter: string;
  /** Diem hoc lai / hoc cai thien - neu co thi thay cho diem goc */
  improved: string;
}

interface Semester {
  id: string;
  name: string;
  subjects: Subject[];
}

const STORAGE_KEY = "grade-profile";
const uid = () => Math.random().toString(36).slice(2);

/** Hoc ky thu i -> "Học kì 1 năm 1", "Học kì 2 năm 1", "Học kì 1 năm 2"... */
const semesterName = (i: number) => `Học kì ${(i % 2) + 1} năm ${Math.floor(i / 2) + 1}`;

const newSubject = (n: number): Subject => ({
  id: uid(),
  name: `Môn học số ${n}`,
  credits: "",
  score10: "",
  letter: "",
  improved: "",
});

const newSemester = (i: number): Semester => ({
  id: uid(),
  name: semesterName(i),
  subjects: [newSubject(1)],
});

// Ho so mac dinh: mot hoc ky co san mot mon mau da dien du lieu, de nguoi vao
// lan dau thay ngay ket qua roi sua theo mon cua minh.
const initial = (): Semester[] => [
  {
    id: uid(),
    name: semesterName(0),
    subjects: [
      {
        id: uid(),
        name: "Môn học số 1 (môn học mẫu)",
        credits: "2",
        letter: "B",
        improved: "",
      },
    ],
  },
];

const num = (v: string) => {
  const n = Number(v.replace(",", ".").trim());
  return Number.isFinite(n) ? n : NaN;
};

/** Diem he 10 hop le (0 - 10, nhan ca dau phay) hoac NaN. O trong cung la NaN. */
const diem10 = (v: string | undefined) => {
  if (!v?.trim()) return NaN;
  const n = num(v);
  return n >= 0 && n <= 10 ? n : NaN;
};

/**
 * Diem chu dung de tinh cho mot mon: diem cai thien, nhung CHI khi no cao hon
 * diem hien tai. Diem cai thien bang hoac thap hon (vd sua diem hien tai len
 * sau khi da chon cai thien) thi bo qua, vi hoc cai thien khong the lam tut diem.
 */
const diemDung = (scale: Scale, sub: Subject) =>
  gpa4Of(scale, sub.improved) > gpa4Of(scale, sub.letter) ? sub.improved : sub.letter;

/** Diem cai thien chi con hop le khi cao hon diem hien tai moi. */
const giuCaiThien = (scale: Scale, improved: string, letter: string) =>
  gpa4Of(scale, improved) > gpa4Of(scale, letter) ? improved : "";

const fmt = (n: number, d = 3) => (Number.isFinite(n) ? n.toFixed(d) : "--");

export default function GradeProfile() {
  const [scaleId, setScaleId] = useState("0");
  const [targetId, setTargetId] = useState("gioi");
  const [semesters, setSemesters] = useState<Semester[]>(initial);
  // Moi lan bam "tinh lai" doi sang phuong an goi y khac
  const [variant, setVariant] = useState(0);

  const scale = scaleById(scaleId);
  const target = targetById(targetId);

  // Doc ho so da luu SAU khi React gan ket xong. Doc ngay luc render se lam
  // HTML dung san khac HTML tren trinh duyet.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const saved = JSON.parse(raw);
        if (Array.isArray(saved?.semesters) && saved.semesters.length) {
          setSemesters(saved.semesters);
          if (typeof saved.scaleId === "string") setScaleId(saved.scaleId);
          if (typeof saved.targetId === "string") setTargetId(saved.targetId);
        }
      } catch {
        /* du lieu hong hoac localStorage bi chan - dung ho so mac dinh */
      }
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ scaleId, targetId, semesters }));
    } catch {
      /* localStorage day hoac bi chan - khong anh huong viec tinh toan */
    }
  }, [scaleId, targetId, semesters]);

  // Doi thang diem: chuyen moi diem chu sang muc co he 4 gan nhat cua thang
  // moi, thay vi xoa trang. Vd A+ (4.0) o thang 9 muc -> A (4.0) o thang 8 muc.
  const changeScale = useCallback(
    (nextId: string) => {
      const from = scaleById(scaleId);
      const to = scaleById(nextId);

      const remap = (letter: string) => {
        if (!letter) return "";
        if (to.grades.some((g) => g.letter === letter)) return letter;
        const old = from.grades.find((g) => g.letter === letter);
        if (!old) return "";
        return to.grades.reduce((best, g) =>
          Math.abs(g.gpa4 - old.gpa4) < Math.abs(best.gpa4 - old.gpa4) ? g : best,
        ).letter;
      };

      setSemesters((sems) =>
        sems.map((s) => ({
          ...s,
          subjects: s.subjects.map((sub) => {
            // Mon co diem he 10 thi xep lai tu chinh diem do: chinh xac hon
            // quy doi diem chu cu sang muc gan nhat cua thang moi.
            const n = diem10(sub.score10);
            return {
              ...sub,
              letter: Number.isFinite(n) ? gradeOf(to, n).letter : remap(sub.letter),
              improved: remap(sub.improved),
            };
          }),
        })),
      );
      setScaleId(nextId);
    },
    [scaleId],
  );

  const resetProfile = useCallback(() => {
    if (!confirm("Xóa toàn bộ hồ sơ điểm và quay về mẫu ban đầu?")) return;
    setSemesters(initial());
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* bo qua */
    }
  }, []);

  const patchSubject = useCallback(
    (semId: string, subId: string, patch: Partial<Subject>) => {
      setSemesters((sems) =>
        sems.map((s) =>
          s.id !== semId
            ? s
            : {
                ...s,
                subjects: s.subjects.map((x) =>
                  x.id === subId ? { ...x, ...patch } : x,
                ),
              },
        ),
      );
    },
    [],
  );

  // ---- Tinh toan ----
  const stats = useMemo(() => {
    const perSemester: {
      id: string;
      credits: number;
      passed: number;
      cumCredits: number;
      cumPassed: number;
      gpa: number;
      cpa: number;
      /** Diem khi CHUA tinh cai thien - hien gach ngang canh diem moi */
      gpaGoc: number;
      cpaGoc: number;
    }[] = [];

    let runCredits = 0;
    let runPoints = 0;
    let runPointsGoc = 0;
    let runPassed = 0;

    // Duyet tuan tu bang vong for: CPA cua moi hoc ky luy ke tu dau den ky do
    for (const s of semesters) {
      let credits = 0;
      let points = 0;
      let pointsGoc = 0;
      let passed = 0;

      for (const sub of s.subjects) {
        const c = num(sub.credits);
        const g = gpa4Of(scale, diemDung(scale, sub));
        if (!Number.isFinite(c) || c <= 0 || !Number.isFinite(g)) continue;

        credits += c;
        points += g * c;
        pointsGoc += gpa4Of(scale, sub.letter) * c;
        if (g > 0) passed += c; // truot (F) khong duoc tinh tin chi
      }

      runCredits += credits;
      runPoints += points;
      runPointsGoc += pointsGoc;
      runPassed += passed;

      perSemester.push({
        id: s.id,
        credits,
        passed,
        cumCredits: runCredits,
        cumPassed: runPassed,
        gpa: credits > 0 ? points / credits : NaN,
        cpa: runCredits > 0 ? runPoints / runCredits : NaN,
        gpaGoc: credits > 0 ? pointsGoc / credits : NaN,
        cpaGoc: runCredits > 0 ? runPointsGoc / runCredits : NaN,
      });
    }

    return {
      perSemester,
      totalCredits: runCredits,
      totalPoints: runPoints,
      totalPassed: runPassed,
      cpa: runCredits > 0 ? runPoints / runCredits : NaN,
      cpaGoc: runCredits > 0 ? runPointsGoc / runCredits : NaN,
    };
  }, [semesters, scale]);

  // Goi y nen hoc cai thien nhung mon nao de cham muc tieu.
  // Tinh mot lan cho ca ho so chu khong hoi rieng tung mon: muc tieu dat duoc
  // bang cach nang nhieu mon cung luc, khong phai nang moi mot mon.
  const suggestion = useMemo(() => {
    if (!target) return null;

    const flat = semesters.flatMap((s) =>
      s.subjects.map((sub) => ({
        id: sub.id,
        credits: num(sub.credits),
        gpa4: gpa4Of(scale, diemDung(scale, sub)),
      })),
    );

    return suggestImprovements(scale, target.min, flat, variant);
  }, [target, semesters, scale, variant]);

  const chartData: ChartPoint[] = semesters.map((s, i) => ({
    name: s.name,
    gpa: Number.isFinite(stats.perSemester[i].gpa)
      ? Number(stats.perSemester[i].gpa.toFixed(2))
      : null,
    cpa: Number.isFinite(stats.perSemester[i].cpa)
      ? Number(stats.perSemester[i].cpa.toFixed(2))
      : null,
  }));

  const rank = Number.isFinite(stats.cpa) ? classify(stats.cpa) : null;
  const reached = target && Number.isFinite(stats.cpa) && stats.cpa >= target.min;

  return (
    <div className={styles.container}>
      {/* ============ THANG DIEM + RESET ============ */}
      <div className={styles.row}>
        <select
          value={scaleId}
          onChange={(e) => changeScale(e.target.value)}
          aria-label="Chọn cấu trúc thang điểm"
          className={selectCls}
        >
          {SCALES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>

        <button type="button" onClick={resetProfile} className={solidBtn}>
          Reset hồ sơ
        </button>
      </div>

      {/* ============ BIEU DO ============ */}
      <div className={styles.box}>
        <GradeChart data={chartData} />
      </div>

      {/* ============ MUC TIEU ============ */}
      <div className={styles.row2}>
        <div className={styles.box2}>
          <TargetIcon size={15} className={styles.floating} />
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            aria-label="Mục tiêu xếp loại bằng"
            className={`${selectCls} ${styles.select}`}
          >
            <option value="">Không đặt mục tiêu</option>
            {TARGETS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => setVariant((v) => v + 1)}
          disabled={!target}
          aria-label="Tính lại gợi ý"
          title="Chưa hài lòng với gợi ý? Bấm để hệ thống tính phương án khác"
          className={styles.button}
        >
          <RotateCcw size={16} />
        </button>

        {target && (
          <span className={styles.label}>
            Cần CPA ≥ <strong className={styles.strong}>{target.min.toFixed(2)}</strong>
            {reached ? (
              <span className={styles.label2}>Đã đạt</span>
            ) : (
              suggestion &&
              !suggestion.enough && (
                <span className={styles.label3}>Cải thiện hết mức vẫn chưa đủ</span>
              )
            )}
          </span>
        )}
      </div>

      {/* ============ CAC HOC KY ============ */}
      <div className={styles.stack}>
        {semesters.map((sem, si) => {
          const st = stats.perSemester[si];

          return (
            <section key={sem.id} className={styles.section}>
              <input
                value={sem.name}
                onChange={(e) =>
                  setSemesters((s) =>
                    s.map((x) => (x.id === sem.id ? { ...x, name: e.target.value } : x)),
                  )
                }
                aria-label={`Tên học kỳ ${si + 1}`}
                className={styles.input}
              />

              {/* --- Danh sach mon --- */}
              <div className={styles.stack2}>
                {sem.subjects.map((sub, i) => {
                  const hint = suggestion?.bySubject[sub.id];
                  // Chi cac muc CAO HON diem hien tai moi la diem cai thien.
                  // Ban cu liet ke ca 9 muc, ke ca muc thap hon, nen dang C ma
                  // mo ra phai do tim B+, A giua mot danh sach dai lan lon.
                  // Chua co diem hien tai, hoac da la muc cao nhat, thi an o nay.
                  const mucCaoHon = sub.letter
                    ? scale.grades.filter((g) => g.gpa4 > gpa4Of(scale, sub.letter))
                    : [];
                  // Go chu dang do hoac so ngoai 0-10 thi to do, khong doi diem chu
                  const diemSai =
                    Boolean(sub.score10?.trim()) && !Number.isFinite(diem10(sub.score10));

                  return (
                    <div key={sub.id} className={styles.box3}>
                      <div className={styles.row3}>
                        <input
                          value={sub.name}
                          placeholder={`Môn học số ${i + 1}`}
                          maxLength={80}
                          onChange={(e) =>
                            patchSubject(sem.id, sub.id, { name: e.target.value })
                          }
                          className={styles.input2}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setSemesters((s) =>
                              s.map((x) =>
                                x.id !== sem.id
                                  ? x
                                  : {
                                      ...x,
                                      subjects:
                                        x.subjects.length > 1
                                          ? x.subjects.filter((y) => y.id !== sub.id)
                                          : [newSubject(1)],
                                    },
                              ),
                            )
                          }
                          aria-label={`Xóa ${sub.name || `môn học số ${i + 1}`}`}
                          className={styles.button2}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <div className={styles.row4}>
                        <span className={styles.label4}>
                          <input
                            value={sub.credits}
                            placeholder="0"
                            inputMode="decimal"
                            aria-label={`Số tín chỉ ${sub.name || `môn ${i + 1}`}`}
                            onChange={(e) =>
                              patchSubject(sem.id, sub.id, { credits: e.target.value })
                            }
                            className={styles.input3}
                          />
                          tín chỉ
                        </span>

                        <span
                          className={`${styles.label4} ${diemSai ? styles.label4Sai : ""}`}
                          title={
                            diemSai
                              ? "Điểm hệ 10 phải là số từ 0 đến 10"
                              : "Gõ điểm hệ 10, điểm chữ tự đổi theo thang đang chọn"
                          }
                        >
                          <input
                            value={sub.score10 ?? ""}
                            placeholder="--"
                            inputMode="decimal"
                            maxLength={5}
                            aria-label={`Điểm hệ 10 ${sub.name || `môn ${i + 1}`}`}
                            aria-invalid={diemSai || undefined}
                            onChange={(e) => {
                              const v = e.target.value;
                              const n = diem10(v);
                              patchSubject(
                                sem.id,
                                sub.id,
                                Number.isFinite(n)
                                  ? {
                                      score10: v,
                                      letter: gradeOf(scale, n).letter,
                                      improved: giuCaiThien(
                                        scale,
                                        sub.improved,
                                        gradeOf(scale, n).letter,
                                      ),
                                    }
                                  : { score10: v },
                              );
                            }}
                            className={styles.input4}
                          />
                          điểm
                        </span>

                        <select
                          value={sub.letter}
                          aria-label={`Điểm chữ ${sub.name || `môn ${i + 1}`}`}
                          // Chon tay diem chu thi bo diem he 10 da go: hai o
                          // khong con khop nhau, giu lai chi gay hieu nham.
                          onChange={(e) =>
                            patchSubject(sem.id, sub.id, {
                              letter: e.target.value,
                              score10: "",
                              improved: giuCaiThien(scale, sub.improved, e.target.value),
                            })
                          }
                          className={smallSelect}
                        >
                          <option value="">--</option>
                          {scale.grades.map((g) => (
                            <option key={g.letter} value={g.letter}>
                              {g.letter}
                            </option>
                          ))}
                        </select>

                        {mucCaoHon.length > 0 && (
                          <select
                            value={sub.improved}
                            aria-label={`Điểm cải thiện ${sub.name || `môn ${i + 1}`}`}
                            onChange={(e) =>
                              patchSubject(sem.id, sub.id, { improved: e.target.value })
                            }
                            className={smallSelect}
                          >
                            <option value="">Điểm cải thiện</option>
                            {mucCaoHon.map((g) => (
                              <option key={g.letter} value={g.letter}>
                                {g.letter}
                              </option>
                            ))}
                          </select>
                        )}

                        {hint && (
                          <button
                            type="button"
                            onClick={() =>
                              patchSubject(sem.id, sub.id, { improved: hint })
                            }
                            title={`Gợi ý: học cải thiện môn này lên ${hint} để đạt mục tiêu. Bấm để áp dụng.`}
                            className={styles.label5}
                          >
                            <TargetIcon size={13} />
                            {hint}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* --- Thong ke hoc ky --- */}
              <dl className={styles.stack3}>
                <StatLine
                  label="Điểm trung bình học kì"
                  value={fmt(st.gpa)}
                  goc={fmt(st.gpaGoc)}
                />
                <StatLine
                  label="Điểm trung bình tích luỹ"
                  value={fmt(st.cpa)}
                  goc={fmt(st.cpaGoc)}
                />
                <StatLine label="Số tín chỉ đạt" value={String(st.passed)} />
                <StatLine label="Số tín chỉ tích luỹ" value={String(st.cumPassed)} />
              </dl>

              {/* --- Nut --- */}
              <div className={styles.row5}>
                <button
                  type="button"
                  onClick={() =>
                    setSemesters((s) =>
                      s.map((x) =>
                        x.id === sem.id
                          ? {
                              ...x,
                              subjects: [
                                ...x.subjects,
                                newSubject(x.subjects.length + 1),
                              ],
                            }
                          : x,
                      ),
                    )
                  }
                  className={outlineBtn}
                >
                  <Plus size={15} /> Thêm môn học
                </button>

                {semesters.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setSemesters((s) => s.filter((x) => x.id !== sem.id))}
                    className={outlineBtn}
                  >
                    <Trash2 size={15} /> Xóa học kì
                  </button>
                )}
              </div>
            </section>
          );
        })}

        <button
          type="button"
          onClick={() => setSemesters((s) => [...s, newSemester(s.length)])}
          className={styles.button3}
        >
          <Plus size={16} /> Thêm học kì
        </button>
      </div>

      {/* ============ TONG KET ============ */}
      <div className={styles.grid}>
        <Stat label="CPA tích luỹ" value={fmt(stats.cpa)} goc={fmt(stats.cpaGoc)} big />
        <Stat label="Tổng tín chỉ tích luỹ" value={String(stats.totalPassed)} />
        <div className={styles.card}>
          <p className={styles.text}>Xếp loại</p>
          {rank ? (
            <span className={`${styles.label6} ${styles[rank.muc]}`}>{rank.label}</span>
          ) : (
            <p className={styles.text2}>--</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- dung chung ---------- */

const selectCls = styles.box6;

const smallSelect = styles.box7;

const solidBtn = styles.button4;

const outlineBtn = styles.button5;

/**
 * `goc` la diem khi chua tinh cai thien. Khac `value` nghia la co mon dang chon
 * diem cai thien: hien diem cu gach ngang, diem moi mau do ngay canh.
 */
function StatLine({ label, value, goc }: { label: string; value: string; goc?: string }) {
  const doi = goc !== undefined && goc !== value;
  return (
    <div className={styles.row6}>
      <dt className={styles.box4}>{label}:</dt>
      {doi ? (
        <dd className={styles.doiDiem}>
          <s className={styles.soCu} aria-label={`trước khi cải thiện ${goc}`}>
            {goc}
          </s>
          <span className={styles.soMoi} aria-label={`sau khi cải thiện ${value}`}>
            {value}
          </span>
        </dd>
      ) : (
        <dd className={styles.box5}>{value}</dd>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  goc,
  big,
}: {
  label: string;
  value: string;
  goc?: string;
  big?: boolean;
}) {
  const doi = goc !== undefined && goc !== value;
  return (
    <div className={styles.card}>
      <p className={styles.text}>{label}</p>
      <p className={`${styles.text5} ${big ? styles.text3 : styles.text4}`}>
        {doi && <s className={styles.soCuLon}>{goc}</s>}
        <span className={doi ? styles.soMoiLon : undefined}>{value}</span>
      </p>
    </div>
  );
}
