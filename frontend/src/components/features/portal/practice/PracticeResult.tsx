"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleX,
  Clock,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  User,
} from "lucide-react";

import type { Question } from "./practiceData";
import { diem10, dateTime, duration, correctAnswer } from "./practiceSettings";

import styles from "./PracticeResult.module.scss";

// Sau khi nop: man "Bai lam cua ban da duoc gui di" roi trang "Xem dap an",
// theo mau trang thi cua chu du an.

const LETTERS = "ABCDEFGH";
const gon = (s: string) => s.replace(/\s+/g, " ").trim();

/** Dap an ngan thi xep 4 cot, vua thi 2 cot, dai thi 1 cot - nhu ban goc */
function columnStyle(c: Question) {
  if (c.html) return styles.cot1;
  const length = Math.max(...c.dapAn.map((a) => gon(a).length));
  return length <= 22 ? styles.cot4 : length <= 70 ? styles.cot2 : styles.cot1;
}

// Bo loc tren trang xem dap an: 3 trang thai, bam nut de chuyen vong
type Loc = "tong" | "dung" | "sai";
const LOC: Record<Loc, { nhan: string; moTa: string; className: string; tiep: Loc }> = {
  tong: {
    nhan: "Đúng & sai",
    moTa: "tất cả câu",
    className: styles.filterTotal,
    tiep: "dung",
  },
  dung: { nhan: "Đúng", moTa: "câu đúng", className: styles.filterCorrect, tiep: "sai" },
  sai: {
    nhan: "Sai",
    moTa: "câu sai và chưa làm",
    className: styles.filterWrong,
    tiep: "tong",
  },
};

function Content({ html, s }: { html?: boolean; s: string }) {
  return html ? (
    <span className={styles.giau} dangerouslySetInnerHTML={{ __html: s }} />
  ) : (
    <span>{gon(s)}</span>
  );
}

interface Props {
  tieuDe: string;
  ten: string;
  ds: Question[];
  chon: (number[] | undefined)[];
  daQua: number;
  ketThuc: number;
  goBack: () => void;
  /** Khong truyen = dang xem lai bai cu tu lich su: an cac nut "Lam lai" */
  retry?: () => void;
  /** Trang thai luu vao lich su ngay sau khi nop; khong truyen = khong hien */
  luu?: "dang" | "xong" | "loi" | null;
  /** Mo thang trang xem dap an (xem lai tu lich su) */
  openAnswer?: boolean;
}

export default function PracticeResult({
  tieuDe: title,
  ten: name,
  ds: items,
  chon: choice,
  daQua: passed,
  ketThuc: endsAt,
  goBack,
  retry,
  luu: save,
  openAnswer = false,
}: Props) {
  const [showAnswers, setShowAnswers] = useState(openAnswer);
  const [hideSide, setHideSide] = useState(false);
  const [query, setFilter] = useState<Loc>("tong");

  const correctCount = items.filter((c, i) => correctAnswer(choice[i], c.dung)).length;
  // Giu so thu tu goc cua cau khi loc (Cau 12, Cau 13...)
  const reveal = items
    .map((c, i) => ({ i, dung: correctAnswer(choice[i], c.dung) }))
    .filter((x) => query === "tong" || (query === "dung") === x.dung)
    .map((x) => x.i);
  const score = diem10(correctCount, items.length);

  /* ---------- Man tom tat ---------- */
  if (!showAnswers) {
    return (
      <>
        <header className={styles.thanh}>
          <button type="button" className={styles.ghostButton} onClick={goBack}>
            <ChevronLeft size={18} aria-hidden="true" /> Quay lại
          </button>
        </header>
        <div className={styles.scroll}>
          <section className={styles.summary} aria-live="polite">
            <h1 className={styles.daGui}>Bài làm của bạn đã được gửi đi</h1>
            <p className={styles.closeScore}>
              <span>Điểm của bạn:</span>
              <strong>{score}/10</strong>
            </p>
            <h2 className={styles.quizName}>{title}</h2>
            {save && (
              <p
                className={
                  save === "loi" ? `${styles.luu} ${styles.saveMistakes}` : styles.luu
                }
              >
                {save === "dang"
                  ? "Đang lưu vào lịch sử làm bài…"
                  : save === "xong"
                    ? "Đã lưu vào lịch sử làm bài"
                    : "Chưa lưu được vào lịch sử làm bài (lỗi mạng)."}
              </p>
            )}
            <dl className={styles.info}>
              <div>
                <dt>
                  <User size={16} aria-hidden="true" /> Thí sinh
                </dt>
                <dd>{name}</dd>
              </div>
              <div>
                <dt>
                  <Clock size={16} aria-hidden="true" /> Thời gian làm bài
                </dt>
                <dd>{duration(passed)}</dd>
              </div>
              <div>
                <dt>
                  <CircleCheck size={16} aria-hidden="true" /> Số câu trắc nghiệm đúng
                </dt>
                <dd>
                  {correctCount}/{items.length}
                </dd>
              </div>
            </dl>
            <div className={styles.bottomButton}>
              <button
                type="button"
                className={styles.viewButton}
                onClick={() => setShowAnswers(true)}
              >
                Xem đáp án <ChevronRight size={16} aria-hidden="true" />
              </button>
              {retry && (
                <button type="button" className={styles.retryButton} onClick={retry}>
                  <RotateCcw size={16} aria-hidden="true" /> Làm lại
                </button>
              )}
            </div>
          </section>
        </div>
      </>
    );
  }

  /* ---------- Trang xem dap an ---------- */
  return (
    <>
      <header className={styles.thanh}>
        <button
          type="button"
          className={styles.ghostButton}
          onClick={() => (openAnswer ? goBack() : setShowAnswers(false))}
        >
          <ChevronLeft size={18} aria-hidden="true" /> Quay lại
        </button>
      </header>
      <div className={styles.scroll}>
        <div
          className={hideSide ? `${styles.khung} ${styles.hiddenFrame}` : styles.khung}
        >
          {!hideSide && (
            <aside className={styles.ben}>
              <p className={styles.scorePanel}>
                Điểm: <strong>{score}/10</strong>
              </p>
              <div className={styles.detail}>
                <h2 className={styles.detailHead}>Thông tin chi tiết</h2>
                <dl className={styles.detailBody}>
                  <div>
                    <dt>Thời gian làm bài:</dt>
                    <dd>{duration(passed)}</dd>
                  </div>
                  <div>
                    <dt>Thời gian nộp bài:</dt>
                    <dd>{dateTime(endsAt)}</dd>
                  </div>
                  <div>
                    <dt>
                      Trắc nghiệm: {score} ({correctCount}/{items.length}&nbsp;câu)
                    </dt>
                  </div>
                </dl>
                {retry && (
                  <button type="button" className={styles.textButton} onClick={retry}>
                    Làm lại bài này
                  </button>
                )}
              </div>
            </aside>
          )}

          <div className={styles.chinh}>
            <div className={styles.quizBar}>
              <button
                type="button"
                className={styles.hideButton}
                onClick={() => setHideSide((v) => !v)}
                aria-label={hideSide ? "Hiện thông tin" : "Ẩn thông tin"}
                title={hideSide ? "Hiện thông tin" : "Ẩn thông tin"}
              >
                {hideSide ? (
                  <PanelLeftOpen size={16} aria-hidden="true" />
                ) : (
                  <PanelLeftClose size={16} aria-hidden="true" />
                )}
              </button>
              <h1 className={styles.quizBarName}>{title}</h1>
              {/* Bam de chuyen vong: tat ca -> chi cau dung -> chi cau sai.
                  Dau x tren nut dang loc de quay ve tat ca. */}
              <span className={`${styles.query} ${LOC[query].className}`}>
                <button
                  type="button"
                  className={styles.filterButton}
                  onClick={() => setFilter(LOC[query].tiep)}
                  title={`Đang xem: ${LOC[query].moTa}. Bấm để đổi.`}
                >
                  {LOC[query].nhan}
                </button>
                {query !== "tong" && (
                  <button
                    type="button"
                    className={styles.filterReset}
                    onClick={() => setFilter("tong")}
                    aria-label="Bỏ lọc, xem tất cả câu"
                  >
                    x
                  </button>
                )}
              </span>
            </div>

            <div className={styles.attempt}>
              <div className={styles.tab} role="tablist">
                <span role="tab" aria-selected="true" className={styles.activeTab}>
                  Trắc nghiệm
                </span>
              </div>

              {reveal.length === 0 && (
                <p className={styles.trong}>
                  {query === "dung" ? "Chưa có câu nào đúng." : "Không có câu nào sai."}
                </p>
              )}
              <ol className={styles.questionList}>
                {reveal.map((i) => {
                  const c = items[i];
                  const chosen = choice[i] ?? [];
                  const correct = correctAnswer(chosen, c.dung);
                  const mau = correct ? styles.correctBox : styles.wrongBox;
                  return (
                    <li key={i} className={styles.cau}>
                      <div className={styles.questionNumber}>
                        Câu&nbsp; {i + 1}
                        {chosen.length === 0 && (
                          <span className={styles.skippedLabel}>Chưa làm</span>
                        )}
                      </div>
                      <div className={styles.questionText}>
                        <Content html={c.html} s={c.cau} />
                      </div>
                      <div className={`${styles.dapAn} ${columnStyle(c)}`}>
                        {c.dapAn.map((a, j) => (
                          <div key={j} className={styles.moi}>
                            <b>{LETTERS[j]}.</b> <Content html={c.html} s={a} />
                          </div>
                        ))}
                      </div>
                      <div className={`${styles.answerBox} ${mau}`}>
                        <span className={styles.correctAnswer}>
                          Đáp án đúng: {c.dung.map((d) => LETTERS[d]).join(", ")}
                        </span>
                        <div
                          className={styles.textRow}
                          aria-label={
                            chosen.length
                              ? `Bạn chọn ${chosen.map((d) => LETTERS[d]).join(", ")}`
                              : "Bạn chưa chọn"
                          }
                        >
                          {/* Chu ban chon co dau tick dung (xanh) / sai (do) dung
                              truoc, nhu ban goc */}
                          {c.dapAn.map((_, j) => (
                            <span key={j} className={styles.chu} aria-hidden="true">
                              {chosen.includes(j) &&
                                (c.dung.includes(j) ? (
                                  <CircleCheck size={20} className={styles.correctTick} />
                                ) : (
                                  <CircleX size={20} className={styles.wrongTick} />
                                ))}
                              {LETTERS[j]}
                            </span>
                          ))}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
