"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ChevronDown, XCircle } from "lucide-react";

import { getErrorMessage } from "@/src/services/apiHelper";
import {
  getAttemptReview,
  getMyQuizAttempts,
  type AttemptReview,
  type AttemptSummary,
  type QuizAnswer,
} from "@/src/services/quizService";

import styles from "./QuizAttemptHistory.module.scss";

const questionIdOf = (id: QuizAnswer["questionId"]): string =>
  typeof id === "string" ? id : id._id;

const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/**
 * Lich su MOI luot lam bai kiem tra cua chinh hoc vien (10/10/2026).
 *
 * Truoc day chi xem lai duoc luot gan nhat, va luot bi giang vien "cho lam lai"
 * thi bi xoa han. Gio luot nao cung giu: bam vao mot luot de xem tung cau minh
 * chon gi, dung hay sai. Dap an dung chi hien khi may chu cho phep (da dat
 * hoac het luot) - xem getQuizAttemptResult.
 */
export default function QuizAttemptHistory({
  quizId,
  refreshKey,
}: {
  quizId: string;
  /** Doi gia tri (vd id luot vua nop) de tai lai danh sach. */
  refreshKey?: string;
}) {
  const [attempts, setAttempts] = useState<AttemptSummary[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [review, setReview] = useState<AttemptReview | null>(null);
  const [loadingReview, setLoadingReview] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    getMyQuizAttempts(quizId)
      .then((list) => alive && setAttempts(list))
      .catch(() => alive && setAttempts([]));
    return () => {
      alive = false;
    };
  }, [quizId, refreshKey]);

  const toggle = async (id: string) => {
    if (openId === id) {
      setOpenId(null);
      return;
    }
    setOpenId(id);
    setReview(null);
    setError("");
    setLoadingReview(true);
    try {
      setReview(await getAttemptReview(quizId, id));
    } catch (e) {
      setError(getErrorMessage(e, "Không tải được bài làm này"));
    } finally {
      setLoadingReview(false);
    }
  };

  if (attempts.length === 0) return null;

  return (
    <section className={styles.card} aria-labelledby="lich-su-lam-bai">
      <h2 id="lich-su-lam-bai" className={styles.heading}>
        Lịch sử làm bài
      </h2>
      <ul className={styles.list}>
        {attempts.map((a) => {
          const isOpen = openId === a._id;
          const voided = a.status === "reset";
          return (
            <li key={a._id} className={styles.item}>
              <button
                type="button"
                className={styles.row}
                aria-expanded={isOpen}
                onClick={() => toggle(a._id)}
              >
                <span className={styles.attemptNo}>Lượt {a.attemptNumber}</span>
                <span className={styles.when}>{formatWhen(a.submittedAt)}</span>
                <span className={styles.percent}>{a.percentage}%</span>
                {voided ? (
                  <span className={`${styles.badge} ${styles.badgeVoid}`}>
                    Không tính
                  </span>
                ) : a.passed ? (
                  <span className={`${styles.badge} ${styles.badgePass}`}>Đạt</span>
                ) : (
                  <span className={`${styles.badge} ${styles.badgeFail}`}>Chưa đạt</span>
                )}
                <ChevronDown
                  size={16}
                  className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
                  aria-hidden="true"
                />
              </button>

              {isOpen && (
                <div className={styles.review}>
                  {voided && a.retryReason && (
                    <p className={styles.note}>Giảng viên cho làm lại: {a.retryReason}</p>
                  )}
                  {loadingReview && <p className={styles.note}>Đang tải bài làm…</p>}
                  {error && <p className={styles.error}>{error}</p>}
                  {review && !review.canSeeAnswers && (
                    <p className={styles.note}>
                      Đáp án đúng sẽ hiện khi bạn đạt bài hoặc dùng hết lượt làm.
                    </p>
                  )}
                  {review && (
                    <ol className={styles.questions}>
                      {review.quiz.questions.map((q, i) => {
                        const ans = review.attempt.answers.find(
                          (x) => questionIdOf(x.questionId) === q._id,
                        );
                        const correct = ans?.isCorrect === true;
                        const chosen =
                          ans?.studentAnswer === undefined || ans?.studentAnswer === ""
                            ? "(bỏ trống)"
                            : String(ans.studentAnswer);
                        const rightText =
                          q.options?.find((o) => o.isCorrect)?.text ?? q.correctAnswer;
                        return (
                          <li
                            key={q._id}
                            className={`${styles.question} ${correct ? styles.qRight : styles.qWrong}`}
                          >
                            <p className={styles.qText}>
                              {correct ? (
                                <CheckCircle2 size={16} aria-label="Đúng" />
                              ) : (
                                <XCircle size={16} aria-label="Sai" />
                              )}
                              <span>
                                Câu {i + 1}: {q.text}
                              </span>
                            </p>
                            <p className={styles.answer}>
                              Bạn chọn: <b>{chosen}</b>
                            </p>
                            {!correct && review.canSeeAnswers && rightText && (
                              <p className={styles.answer}>
                                Đáp án đúng: <b>{rightText}</b>
                              </p>
                            )}
                            {review.canSeeAnswers && q.explanation && (
                              <p className={styles.explain}>{q.explanation}</p>
                            )}
                          </li>
                        );
                      })}
                    </ol>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
