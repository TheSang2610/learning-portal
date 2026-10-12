"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ListChecks } from "lucide-react";

import { updateUrl, loginUrl } from "@/src/components/features/portal/auth/loginUrl";
import { useUserLoading, useStoredUser } from "@/src/hooks/userStore";

import { QUESTION_LOADERS, type Question, type PracticeQuiz } from "./practiceData";
import {
  DEFAULTS,
  splitBuckets,
  readSettings,
  saveSettings,
  type Settings,
} from "./practiceSettings";
import PracticeHistory from "./PracticeHistory";
import QuestionPreview from "./QuestionPreview";

import styles from "./PracticeSetup.module.scss";

interface Props {
  de: PracticeQuiz;
}

export default function PracticeSetup({ de: quiz }: Props) {
  const path = usePathname();
  const user = useStoredUser();
  const loading = useUserLoading();

  const [tl, setTl] = useState<Settings>(DEFAULTS);
  const [deselect, setDeselect] = useState(0);
  const [question, setQuestion] = useState<Question[] | null>(null);
  const [preview, setPreview] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);
  const loadQuestions = QUESTION_LOADERS[quiz.id];

  const openPreview = async () => {
    if (!loadQuestions) return;
    if (!question) {
      setLoadingPost(true);
      try {
        setQuestion(await loadQuestions());
      } finally {
        setLoadingPost(false);
      }
    }
    setPreview(true);
  };
  // Giu cung mot ham qua cac lan ve: hop xem truoc dang ky phim Esc theo no
  const closePreview = useCallback(() => setPreview(false), []);

  // Doc thiet lap da luu SAU khi gan vao trinh duyet, de HTML may chu va trinh
  // duyet khop nhau (doc ngay luc render se lech).
  useEffect(() => {
    const id = requestAnimationFrame(() => setTl(readSettings()));
    return () => cancelAnimationFrame(id);
  }, []);

  const copy = (recent: Partial<Settings>) =>
    setTl((old) => {
      const next = { ...old, ...recent };
      saveSettings(next);
      return next;
    });

  const allBuckets = splitBuckets(quiz.soCau, tl.soLuong);

  const openLogin = () =>
    updateUrl(loginUrl(path, new URLSearchParams(window.location.search)));

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* ============ DAU DE ============ */}
        <section className={styles.hero}>
          <span className={styles.heroBong} aria-hidden="true" />
          <h1 className={styles.heroTitle}>{quiz.title}</h1>
          {quiz.description && (
            <p className={styles.heroDescription}>{quiz.description}</p>
          )}
          <div className={styles.heroNumber}>
            <span className={styles.heroBadge}>
              <ListChecks size={13} aria-hidden="true" />
              {quiz.soCau} câu hỏi
            </span>
          </div>
        </section>

        {/* ============ THIET LAP ============ */}
        <section className={styles.card}>
          <h2 className={styles.tieuDe}>Thiết lập phòng luyện tập</h2>

          <div className={styles.rows}>
            <label htmlFor="so-luong" className={styles.nhan}>
              Chọn số lượng câu hỏi
            </label>
            <select
              id="so-luong"
              value={tl.soLuong}
              onChange={(e) => {
                copy({ soLuong: Number(e.target.value) });
                setDeselect(0);
              }}
              className={styles.chon}
            >
              {[20, 50, 75, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.syncUp}>
            <h3 className={styles.tieuDe}>Chọn bộ câu hỏi</h3>
            <div className={styles.allBuckets} role="group" aria-label="Chọn bộ câu hỏi">
              {allBuckets.map((b, i) => (
                <button
                  key={b.tu}
                  type="button"
                  aria-pressed={i === deselect}
                  onClick={() => setDeselect(i)}
                  className={
                    i === deselect ? `${styles.bo} ${styles.deselect}` : styles.bo
                  }
                >
                  Câu {b.tu} - {b.den}
                </button>
              ))}
            </div>
          </div>

          <Toggle
            nhan="Xáo trộn câu hỏi và đáp án"
            bat={tl.shuffle}
            resetDefaults={() => copy({ shuffle: !tl.shuffle })}
          />
        </section>

        {/* Lich su lam bai la du lieu rieng: chi hien khi da dang nhap */}
        {user && <PracticeHistory deId={quiz.id} />}
      </div>

      {/* ============ NUT HANH DONG ============ */}
      <div className={styles.buttonBar}>
        <button
          type="button"
          disabled={!loadQuestions || loadingPost}
          onClick={openPreview}
          title={loadQuestions ? undefined : "Câu hỏi của đề đang được bổ sung"}
          className={`${styles.button} ${styles.viewButton}`}
        >
          {loadingPost ? "Đang tải…" : "Xem trước câu hỏi"}
        </button>
        {loading ? (
          <span className={`${styles.button} ${styles.waitButton}`} aria-hidden="true" />
        ) : user && loadQuestions ? (
          // Bo cau dang chon di qua dia chi; con lai (so cau moi bo,
          // xao tron) trang lam bai tu doc lai tu thiet lap da luu.
          <Link
            href={`/practice/${quiz.id}/take?bo=${deselect}`}
            className={`${styles.button} ${styles.startButton}`}
          >
            Bắt đầu luyện tập
          </Link>
        ) : user ? (
          <button
            type="button"
            disabled
            className={`${styles.button} ${styles.startButton}`}
          >
            Bắt đầu luyện tập
          </button>
        ) : (
          <button
            type="button"
            onClick={openLogin}
            className={`${styles.button} ${styles.startButton}`}
          >
            Đăng nhập để bắt đầu
          </button>
        )}
      </div>

      {preview && question && (
        <QuestionPreview
          cauHoi={question}
          tu={allBuckets[deselect]?.tu ?? 1}
          den={allBuckets[deselect]?.den ?? quiz.soCau}
          totalQuestions={quiz.soCau}
          rows={closePreview}
        />
      )}
    </div>
  );
}

/** Cong tac BAT/TAT giong ban goc: nut tron chay qua lai, ghi ON / OFF. */
function Toggle({
  nhan: labelText,
  bat,
  resetDefaults,
}: {
  nhan: string;
  bat: boolean;
  resetDefaults: () => void;
}) {
  return (
    <div className={styles.rows}>
      <span className={styles.nhan}>{labelText}</span>
      <button
        type="button"
        role="switch"
        aria-checked={bat}
        aria-label={labelText}
        onClick={resetDefaults}
        className={bat ? `${styles.toggle} ${styles.toggleOn}` : styles.toggle}
      >
        <span className={styles.roundButton}>{bat ? "ON" : "OFF"}</span>
      </button>
    </div>
  );
}
