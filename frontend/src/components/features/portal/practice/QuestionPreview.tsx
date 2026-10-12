"use client";

import { useEffect, useRef, useState } from "react";
import { Circle, CircleCheck } from "lucide-react";

import type { Question } from "./practiceData";

import styles from "./QuestionPreview.module.scss";

interface Props {
  cauHoi: Question[];
  /** Vi tri cau dau tien cua bo dang chon, dem tu 1 (vd 51 cho "Câu 51 - 100") */
  tu: number;
  den: number;
  /** So cau cua ca de theo ban goc - de biet phan nao con chua bo sung */
  totalQuestions: number;
  rows: () => void;
}

// Ban goc co cho hai dau cach lien nhau ("ứng  dụng"); gom lai cho gon mat.
const gon = (s: string) => s.replace(/\s+/g, " ").trim();

/** Cau co anh/cong thuc duoc luu san duoi dang HTML da loc (chi con the dinh
 *  dang, anh https va MathML) ngay luc chuyen doi du lieu, nen gan thang vao. */
function Content({ html, s }: { html?: boolean; s: string }) {
  return html ? (
    <span className={styles.giau} dangerouslySetInnerHTML={{ __html: s }} />
  ) : (
    <span>{gon(s)}</span>
  );
}

export default function QuestionPreview({
  cauHoi: question,
  tu: word,
  den: to,
  totalQuestions,
  rows,
}: Props) {
  const [showAnswer, setShowAnswer] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);

  // Esc de dong, khoa cuon trang phia sau, dua tieu diem vao hop
  useEffect(() => {
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const phim = (e: KeyboardEvent) => e.key === "Escape" && rows();
    window.addEventListener("keydown", phim);
    return () => {
      document.body.style.overflow = before;
      window.removeEventListener("keydown", phim);
    };
  }, [rows]);

  const items = question.slice(word - 1, to);
  const alreadyReached = Math.min(to, question.length);

  return (
    <div className={styles.nen} onClick={rows}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="xem-truoc-tieu-de"
        className={styles.hop}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="xem-truoc-tieu-de" className={styles.tieuDe}>
          Xem trước câu hỏi
        </h2>

        <div className={styles.than}>
          <div className={styles.toggleRow}>
            <span className={styles.toggleLabel}>Hiển thị đáp án</span>
            <button
              type="button"
              role="switch"
              aria-checked={showAnswer}
              aria-label="Hiển thị đáp án"
              onClick={() => setShowAnswer((v) => !v)}
              className={
                showAnswer ? `${styles.toggle} ${styles.toggleOn}` : styles.toggle
              }
            >
              <span className={styles.roundButton}>{showAnswer ? "ON" : "OFF"}</span>
            </button>
          </div>

          {/* Moi bo danh so lai tu Cau 1 (chu du an yeu cau): chon "Câu 101 - 120"
              thi hien Cau 1 - 20, giong luc vao lam bai. */}
          <ol className={styles.ds}>
            {items.map((c, i) => (
              <li key={word + i} className={styles.cau}>
                <h3 className={styles.cauHoi}>
                  Câu {i + 1}. <Content html={c.html} s={c.cau} />
                </h3>
                <ul className={styles.dapAn}>
                  {c.dapAn.map((a, j) => {
                    const correct = showAnswer && c.dung.includes(j);
                    return (
                      <li
                        key={j}
                        className={
                          correct ? `${styles.moi} ${styles.newCorrect}` : styles.moi
                        }
                      >
                        {correct ? (
                          <CircleCheck
                            size={20}
                            className={styles.correctIcon}
                            aria-label="Đáp án đúng"
                          />
                        ) : (
                          <Circle size={20} className={styles.icon} aria-hidden="true" />
                        )}
                        <Content html={c.html} s={a} />
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ol>

          {alreadyReached < to && (
            <p className={styles.missing}>
              {items.length === 0
                ? `Câu ${word} - ${to}`
                : `Câu ${alreadyReached + 1} - ${to}`}{" "}
              chưa được bổ sung (đề đã có {question.length}/{totalQuestions} câu).
            </p>
          )}
        </div>

        <div className={styles.chan}>
          <button
            ref={closeButton}
            type="button"
            onClick={rows}
            className={styles.closeButton}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
