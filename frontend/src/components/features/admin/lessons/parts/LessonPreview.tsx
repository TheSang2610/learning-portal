"use client";

import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  FileText,
  Shuffle,
  X,
} from "lucide-react";

import LessonPlayer from "@/src/components/features/portal/learn/parts/LessonPlayer";
import { useLessonVideo } from "@/src/components/features/portal/learn/hooks/useLessonVideo";
import { ADMIN_LESSONS } from "@/src/constants/admin/lessons-page";
import { getLessonById, type Lesson } from "@/src/services/lesson.api";
import type { Quiz, QuizQuestion } from "@/src/services/quizService";
import { getEmbedUrl } from "@/src/services/videoEmbed";
import type { LessonRow } from "@/src/types/lesson";

import styles from "./LessonPreview.module.scss";

const P = ADMIN_LESSONS.preview;

interface LessonPreviewProps {
  lessons: LessonRow[];
  index: number;
  quizOfLesson: (lessonId: string) => Quiz | undefined;
  onNavigate: (index: number) => void;
  onClose: () => void;
}

/** Thoi luong luu dang chuoi "12:30" (model Lesson) hoac so giay (du lieu cu). */
export function formatDuration(value?: number | string) {
  if (value === undefined || value === null || value === "") return "";
  if (typeof value === "string" && value.includes(":")) return value;
  const seconds = Math.round(Number(value));
  if (!Number.isFinite(seconds) || seconds <= 0) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Xem truoc mot bai hoc ngay trong trang quan tri: video (tua duoc), ten bai,
 * noi dung, tai lieu, roi bai tap neu co - cung khung phat voi trang hoc vien
 * (LessonPlayer + useLessonVideo) de quan tri thay dung cai hoc vien se thay.
 * Khac trang hoc vien o mot cho: bai tap hien KEM dap an va giai thich.
 */
export default function LessonPreview({
  lessons,
  index,
  quizOfLesson,
  onNavigate,
  onClose,
}: LessonPreviewProps) {
  const row = lessons[index];
  // Nap theo dung bai dang mo: luu kem id de doi bai la tu bo ket qua cu, khong
  // can dat lai state trong effect.
  const [loaded, setLoaded] = useState<{ id: string; lesson?: Lesson; error?: string }>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLength, setVideoLength] = useState<{ id: string; seconds: number }>();

  // Danh sach bai trong khoa chi co ten + thoi luong; link phat video (kho kin
  // ky han) chi co khi lay chi tiet bai - giong trang hoc vien.
  useEffect(() => {
    if (!row?._id) return;
    let alive = true;
    getLessonById(row._id)
      .then((lesson) => alive && setLoaded({ id: row._id, lesson }))
      .catch(() => alive && setLoaded({ id: row._id, error: P.loadFailed }));
    return () => {
      alive = false;
    };
  }, [row?._id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    // Khoa cuon trang nen khi cua so dang mo.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const current = loaded?.id === row?._id ? loaded : undefined;
  const lesson = current?.lesson;
  const embedVideo = lesson?.videoUrl ? getEmbedUrl(lesson.videoUrl) : null;
  const { videoError, setVideoError } = useLessonVideo(lesson?.videoUrl, videoRef);
  const quiz = row ? quizOfLesson(row._id) : undefined;

  if (!row) return null;

  const duration =
    formatDuration(lesson?.duration ?? row.duration) ||
    (videoLength?.id === row._id ? formatDuration(videoLength.seconds) : "");

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={P.title}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>{P.title}</p>
            <p className={styles.sub}>{P.subtitle}</p>
          </div>
          <div className={styles.nav}>
            <button
              type="button"
              className={styles.navButton}
              disabled={index === 0}
              onClick={() => onNavigate(index - 1)}
            >
              <ChevronLeft size={16} /> {P.prev}
            </button>
            <span className={styles.position}>
              {P.position(index + 1, lessons.length)}
            </span>
            <button
              type="button"
              className={styles.navButton}
              disabled={index >= lessons.length - 1}
              onClick={() => onNavigate(index + 1)}
            >
              {P.next} <ChevronRight size={16} />
            </button>
            <button
              type="button"
              className={styles.close}
              onClick={onClose}
              aria-label={P.close}
            >
              <X size={18} />
            </button>
          </div>
        </header>

        <div className={styles.body}>
          {!current ? (
            <div className={styles.placeholder}>{P.loading}</div>
          ) : current.error || !lesson ? (
            <div className={styles.placeholder}>{current.error ?? P.loadFailed}</div>
          ) : (
            <LessonPlayer
              lesson={lesson}
              videoRef={videoRef}
              embedVideo={embedVideo}
              videoError={videoError}
              onLoadedMetadata={() => {
                const seconds = videoRef.current?.duration;
                if (seconds && Number.isFinite(seconds)) {
                  setVideoLength({ id: row._id, seconds });
                }
              }}
              onEnded={() => {}}
              onVideoError={setVideoError}
              onOpenCourse={onClose}
            />
          )}

          <section className={styles.info}>
            <span className={styles.badge}>{P.lessonLabel(index + 1)}</span>
            <h2 className={styles.lessonTitle}>{lesson?.title ?? row.title}</h2>
            {duration && (
              <p className={styles.meta}>
                {P.duration}: <strong>{duration}</strong>
              </p>
            )}

            <h3 className={styles.sectionTitle}>{P.content}</h3>
            <p className={lesson?.content ? styles.content : styles.muted}>
              {lesson?.content || P.noContent}
            </p>

            {lesson?.documentUrl && (
              <a
                href={lesson.documentUrl}
                target="_blank"
                rel="noreferrer"
                className={styles.document}
              >
                <FileText size={16} /> {P.document} · {P.openDocument}
              </a>
            )}
          </section>

          {/* Khong co bai tap thi khong ve muc nay - dung y "co thi ghi, khong thi thoi". */}
          {quiz && <QuizPreview quiz={quiz} />}
        </div>
      </div>
    </div>
  );
}

function QuizPreview({ quiz }: { quiz: Quiz }) {
  const questions = quiz.questions ?? [];
  const total =
    quiz.totalPoints || questions.reduce((sum, q) => sum + (q.points || 1), 0);

  return (
    <section className={styles.quiz}>
      <div className={styles.quizHead}>
        <h3 className={styles.quizTitle}>
          {P.quizHeading}: {quiz.title}
        </h3>
        <span className={quiz.isPublished ? styles.published : styles.draft}>
          {quiz.isPublished ? P.quizPublished : P.quizDraft}
        </span>
      </div>
      {quiz.description && <p className={styles.content}>{quiz.description}</p>}

      <ul className={styles.chips}>
        <li>{P.passingScore(quiz.passingScore)}</li>
        <li>{P.timeLimit(quiz.timeLimit)}</li>
        <li>{P.attempts(quiz.attempts)}</li>
        <li>{P.totalPoints(total)}</li>
        {quiz.randomizeQuestions && (
          <li>
            <Shuffle size={12} /> {P.shuffledQuestions}
          </li>
        )}
        {quiz.randomizeOptions && (
          <li>
            <Shuffle size={12} /> {P.shuffledOptions}
          </li>
        )}
        {quiz.showAnswers && <li>{P.showAnswers}</li>}
      </ul>

      {questions.length === 0 ? (
        <p className={styles.muted}>{P.noQuestions}</p>
      ) : (
        <ol className={styles.questions}>
          {questions.map((q, i) => (
            <QuestionPreview key={q._id ?? i} question={q} index={i} />
          ))}
        </ol>
      )}
    </section>
  );
}

function QuestionPreview({
  question: q,
  index,
}: {
  question: QuizQuestion;
  index: number;
}) {
  const choice = q.type === "multiple_choice" || q.type === "true_false";

  return (
    <li className={styles.question}>
      <div className={styles.questionHead}>
        <span className={styles.questionNo}>{P.question(index + 1)}</span>
        <span className={styles.questionType}>{P.types[q.type] ?? q.type}</span>
        <span className={styles.questionPoints}>{P.points(q.points || 1)}</span>
      </div>
      <p className={styles.questionText}>{q.text}</p>

      {choice && (
        <ul className={styles.options}>
          {(q.options ?? []).map((opt, i) => (
            <li
              key={opt._id ?? i}
              className={opt.isCorrect ? styles.optionCorrect : styles.option}
            >
              {opt.isCorrect ? <CheckCircle2 size={16} /> : <Circle size={16} />}
              <span className={styles.optionLetter}>{String.fromCharCode(65 + i)}.</span>
              <span>{opt.text}</span>
              {opt.isCorrect && <span className={styles.correctTag}>{P.correct}</span>}
            </li>
          ))}
        </ul>
      )}

      {q.type === "short_answer" && (
        <p className={styles.answer}>
          {P.answerLabel} <strong>{q.correctAnswer || "—"}</strong>
        </p>
      )}
      {q.type === "essay" && <p className={styles.muted}>{P.essayNote}</p>}

      {q.explanation && (
        <p className={styles.explanation}>
          <strong>{P.explanation}</strong> {q.explanation}
        </p>
      )}
    </li>
  );
}
