"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  GraduationCap,
  Play,
  Star,
  Zap,
} from "lucide-react";

import SafeImage from "@/src/components/ui/SafeImage";
import { MY_COURSES } from "@/src/constants/portal/my-courses-page";
import { fillTemplate } from "@/src/lib/format";
import type { HomeDashboardData } from "@/src/types/home";

import {
  isDone,
  percentOf,
  useLearnerDashboard,
  type DashboardItem,
} from "./hooks/useLearnerDashboard";
import styles from "./HomeDashboard.module.scss";

const learnHref = (g: DashboardItem) =>
  g.course.slug ? MY_COURSES.learnHref(g.course.slug) : MY_COURSES.coursesHref;
const courseHref = (g: DashboardItem) =>
  g.course.slug ? `/course?slug=${g.course.slug}` : MY_COURSES.coursesHref;
const formatDate = (iso: string) => new Date(iso).toLocaleDateString("vi-VN");

// Muc tieu so bai moi ngay: chi la thoi quen cua RIENG may nay, khong phai du
// lieu can giu - de o localStorage. Bi chan thi dung mac dinh.
const GOAL_KEY = "muc-tieu-moi-ngay";

function useDailyGoal(options: number[]) {
  // Doc ngay luc khoi tao (khong qua useEffect): may chu chi ve khung cho -
  // phan dung muc tieu chi hien sau khi biet nguoi dung - nen khong lech HTML.
  const [goal, setGoal] = useState(() => {
    const fallback = options.includes(3) ? 3 : options[0];
    if (typeof window === "undefined") return fallback;
    try {
      const saved = Number(localStorage.getItem(GOAL_KEY));
      return options.includes(saved) ? saved : fallback;
    } catch {
      return fallback;
    }
  });

  const cycle = () => {
    const next = options[(options.indexOf(goal) + 1) % options.length];
    setGoal(next);
    try {
      localStorage.setItem(GOAL_KEY, String(next));
    } catch {}
  };

  return { goal, cycle };
}

/**
 * Phan dau dashboard (trang chu cua nguoi DA dang nhap), bo cuc theo kieu
 * Coursera: dong chao + ten khoa dang hoc + tien do; the "Bai tiep theo" kem
 * khung xem tiep; cot phai "Muc tieu hom nay" va "Chuoi tuan".
 *
 * Moi con so deu tu du lieu that - xem hooks/useLearnerDashboard.ts. Chu co
 * dinh nam o HOME_PAGE.dashboard.
 */
export default function HomeDashboard(t: HomeDashboardData) {
  const s = useLearnerDashboard();
  const { goal, cycle } = useDailyGoal(t.goalOptions);
  const current = s.current;

  if (s.error) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <p className={styles.error}>{t.error}</p>
        </div>
      </section>
    );
  }

  if (s.loading) {
    return (
      <section className={styles.section} aria-busy="true">
        <div className={styles.container}>
          <div className={`${styles.skeleton} ${styles.skeletonLine}`} />
          <div className={`${styles.skeleton} ${styles.skeletonTitle}`} />
          <div className={styles.grid}>
            <div className={`${styles.skeleton} ${styles.skeletonCard}`} />
            <div className={`${styles.skeleton} ${styles.skeletonCard}`} />
          </div>
        </div>
      </section>
    );
  }

  const name = s.user?.fullname || s.user?.name;

  if (!current) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <p className={styles.welcome}>
            {name ? fillTemplate(t.welcome, { name }) : t.welcomeFallback}
          </p>
          <div className={styles.empty}>
            <GraduationCap size={34} aria-hidden className={styles.emptyIcon} />
            <div>
              <p className={styles.emptyTitle}>{t.emptyTitle}</p>
              <p className={styles.emptyText}>{t.emptyText}</p>
            </div>
            <Link href={t.emptyCta.href} className={`group ${styles.button}`}>
              {t.emptyCta.label}
              <ArrowRight size={17} className={styles.arrow} />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const d = s.detail;
  const a = s.activity;
  const percent = percentOf(current);
  const done = isDone(current);

  // Nhan han hoc - lay tu enrollment cua khoa dang hoc.
  const pace = !d
    ? null
    : d.expired
      ? { text: t.pace.expired, tone: styles.paceExpired }
      : d.expiresAt
        ? {
            text:
              d.daysLeft !== null
                ? fillTemplate(t.pace.daysLeft, {
                    n: d.daysLeft,
                    date: formatDate(d.expiresAt),
                  })
                : fillTemplate(t.pace.until, { date: formatDate(d.expiresAt) }),
            tone: styles.paceLimited,
          }
        : { text: t.pace.unlimited, tone: styles.paceOk };

  const next = d?.nextLesson ?? null;
  const nextMeta = next
    ? [
        // Bai bi khoa thi may chu cat videoUrl - khi do khong doan loai bai.
        next.biKhoa ? null : next.videoUrl || next.videoKin ? t.video : t.reading,
        next.duration,
        d && d.lessons.length
          ? fillTemplate(t.lessonPosition, {
              i: d.nextIndex + 1,
              total: d.lessons.length,
            })
          : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : "";
  // "Da hoc het" CHI khi co muc luc ma khong con bai nao chua xong. Muc luc
  // rong (khoa chua co bai, hoac luot tai loi) thi noi trung tinh - bao nham
  // "da hoc het" la sai su that.
  const allDone = Boolean(d && d.lessons.length > 0 && !next);
  const actionLabel = done || allDone ? t.review : percent > 0 ? t.resume : t.start;

  return (
    <section className={styles.section}>
      <span aria-hidden className={styles.arcs} />
      <div className={styles.container}>
        <div className={styles.topRow}>
          <p className={styles.welcome}>
            {name ? fillTemplate(t.welcome, { name }) : t.welcomeFallback}
          </p>
          {pace && (
            <span className={`${styles.pace} ${pace.tone}`}>
              <CalendarClock size={14} aria-hidden />
              {pace.text}
            </span>
          )}
          <Link href={t.myCoursesHref} className={`group ${styles.allLink}`}>
            {t.myCoursesLabel}
            <ArrowRight size={16} className={styles.arrow} />
          </Link>
        </div>

        <h1 className={styles.courseTitle}>
          <Link href={courseHref(current)}>{current.course.title}</Link>
        </h1>

        <div className={styles.progressRow}>
          <div
            className={styles.bar}
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <i style={{ width: `${percent}%` }} />
          </div>
          <span>{fillTemplate(t.complete, { n: percent })}</span>
        </div>

        <div className={styles.grid}>
          {/* ---- Bai tiep theo + khung xem tiep ---- */}
          <article className={styles.next}>
            <div className={styles.nextBody}>
              <h2 className={styles.nextTitle}>
                {next
                  ? fillTemplate(t.upNext, { title: next.title })
                  : allDone
                    ? t.allDone
                    : t.upNextUnknown}
              </h2>
              {nextMeta && <p className={styles.nextMeta}>{nextMeta}</p>}

              <Link href={learnHref(current)} className={`group ${styles.button}`}>
                <Play size={16} aria-hidden />
                {actionLabel}
              </Link>
            </div>

            <Link
              href={learnHref(current)}
              className={`group ${styles.media}`}
              aria-label={`${t.continueWatching}: ${next?.title ?? current.course.title}`}
            >
              {current.course.thumbnail ? (
                <SafeImage
                  src={current.course.thumbnail}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 480px"
                  className={styles.mediaImage}
                  hideOnError
                />
              ) : (
                <BookOpen size={40} aria-hidden className={styles.mediaIcon} />
              )}
              <span className={styles.mediaShade} aria-hidden />
              <span className={styles.mediaLabel}>
                {t.continueWatching}
                <ArrowRight size={17} className={styles.arrow} />
              </span>
            </Link>
          </article>

          {/* ---- Cot phai ---- */}
          <div className={styles.side}>
            <div className={styles.panel}>
              <h3 className={styles.panelTitle}>{t.goalsTitle}</h3>
              <div className={styles.goalRow}>
                <span
                  className={`${styles.goalStar} ${
                    a && a.todayInCurrent >= goal ? styles.goalStarDone : ""
                  }`}
                  aria-hidden
                >
                  <Star size={15} />
                </span>
                <Link href={learnHref(current)} className={styles.goalText}>
                  {fillTemplate(t.goal, {
                    n: goal,
                    course: current.course.title,
                    done: Math.min(a?.todayInCurrent ?? 0, goal),
                  })}
                </Link>
              </div>
            </div>

            <div className={styles.panel}>
              <h3 className={styles.streakTitle}>
                <Zap size={16} aria-hidden />
                {fillTemplate(t.streak, { n: a?.streakWeeks ?? 0 })}
              </h3>
              <p className={styles.streakTip}>{t.streakTip}</p>

              <ul className={styles.days}>
                {t.weekDays.map((label, i) => {
                  const today = (new Date().getDay() + 6) % 7 === i;
                  const active = Boolean(a?.weekDays[i]);
                  return (
                    <li
                      key={label}
                      className={`${styles.day} ${today ? styles.dayToday : ""} ${
                        active ? styles.dayActive : ""
                      }`}
                    >
                      {label}
                    </li>
                  );
                })}
              </ul>

              <p className={styles.weekSummary}>
                {fillTemplate(t.weekSummary, {
                  n: a?.weekCount ?? 0,
                  m: a?.weekMinutes ?? 0,
                })}
              </p>
              <button type="button" onClick={cycle} className={styles.goalButton}>
                {fillTemplate(t.setGoal, { n: goal })}
              </button>
            </div>
          </div>
        </div>

        {s.others.length > 0 && (
          <div className={styles.othersBlock}>
            <h3 className={styles.panelTitle}>{t.otherTitle}</h3>
            <ul className={styles.others}>
              {s.others.map((g) => (
                <li key={g._id}>
                  <Link href={learnHref(g)} className={styles.other}>
                    <span className={styles.otherName}>{g.course.title}</span>
                    <span className={styles.miniBar} aria-hidden>
                      <i style={{ width: `${percentOf(g)}%` }} />
                    </span>
                    <span className={styles.otherPercent}>
                      {fillTemplate(t.complete, { n: percentOf(g) })}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
