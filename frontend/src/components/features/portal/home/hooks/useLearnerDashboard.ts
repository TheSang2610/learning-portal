"use client";

import { useEffect, useState } from "react";

import { useStoredUser, useUserLoading } from "@/src/hooks/userStore";
import { getCourseBySlug } from "@/src/services/course";
import {
  getEnrollmentByCourse,
  getMyEnrolledCourses,
  type EnrolledCourseItem,
  type LessonProgress,
} from "@/src/services/enrollment.api";
import type { Lesson } from "@/src/services/lesson.api";

export type DashboardItem = EnrolledCourseItem & {
  course: NonNullable<EnrolledCourseItem["course"]>;
};

export interface CurrentDetail {
  lessons: Lesson[];
  /** Bai trang hoc se mo: bai dang do dau tien, khong co thi bai chua hoc dau tien. */
  nextLesson: Lesson | null;
  nextIndex: number;
  expiresAt: string | null;
  daysLeft: number | null;
  expired: boolean;
}

export interface Activity {
  /** So bai xong HOM NAY trong khoa dang hoc - cho muc tieu hom nay. */
  todayInCurrent: number;
  /** 7 o T2..CN cua tuan nay: ngay do co xong bai nao khong. */
  weekDays: boolean[];
  weekCount: number;
  weekMinutes: number;
  streakWeeks: number;
}

/** So khoa (ngoai khoa dang hoc) duoc doc tien do de dem chuoi tuan. */
const OTHER_COURSES_FOR_ACTIVITY = 4;
const DAY = 86_400_000;

export const percentOf = (g: EnrolledCourseItem) =>
  Math.min(100, Math.max(0, Math.round(g.totalProgress)));
export const isDone = (g: EnrolledCourseItem) =>
  g.status === "completed" || g.totalProgress >= 100;
const lastTouch = (g: EnrolledCourseItem) =>
  new Date(g.lastAccessedAt ?? g.createdAt).getTime() || 0;

const lessonIdOf = (p: LessonProgress) =>
  typeof p.lesson === "string" ? p.lesson : (p.lesson?._id ?? "");

// Tuan bat dau tu thu Hai, tinh theo gio may nguoi xem.
const startOfWeek = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
};
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** Chon bai tiep theo theo DUNG cach trang /learn chon bai mo mac dinh. */
function pickNext(lessons: Lesson[], progress: LessonProgress[]) {
  const doing = progress.find((p) => p.status !== "completed");
  if (doing) {
    const i = lessons.findIndex((l) => l._id === lessonIdOf(doing));
    if (i >= 0) return i;
  }
  const done = new Set(
    progress.filter((p) => p.status === "completed").map((p) => lessonIdOf(p)),
  );
  return lessons.findIndex((l) => !done.has(l._id));
}

function buildActivity(
  progressByCourse: LessonProgress[][],
  currentProgress: LessonProgress[],
): Activity {
  const now = new Date();
  const thisWeek = startOfWeek(now).getTime();
  const weekDays = Array<boolean>(7).fill(false);
  const weeksWithActivity = new Set<number>();
  let weekCount = 0;
  let weekSeconds = 0;

  for (const p of progressByCourse.flat()) {
    if (p.status !== "completed" || !p.completedAt) continue;
    const at = new Date(p.completedAt);
    if (Number.isNaN(at.getTime())) continue;
    const offset = Math.round((startOfWeek(at).getTime() - thisWeek) / (7 * DAY));
    weeksWithActivity.add(offset);
    if (offset === 0) {
      weekDays[(at.getDay() + 6) % 7] = true;
      weekCount++;
      weekSeconds += p.watchedDuration || 0;
    }
  }

  // Chuoi tinh tu tuan nay; tuan nay chua hoc thi tinh tu tuan truoc (chua het
  // tuan thi chua coi la dut chuoi).
  let streakWeeks = 0;
  let k = weeksWithActivity.has(0) ? 0 : -1;
  while (weeksWithActivity.has(k)) {
    streakWeeks++;
    k--;
  }

  const todayInCurrent = currentProgress.filter(
    (p) =>
      p.status === "completed" && p.completedAt && sameDay(new Date(p.completedAt), now),
  ).length;

  return {
    todayInCurrent,
    weekDays,
    weekCount,
    weekMinutes: Math.round(weekSeconds / 60),
    streakWeeks,
  };
}

/**
 * Du lieu cho phan dau dashboard. Tat ca la cua rieng nguoi dang xem nen lay o
 * trinh duyet (cookie), sau khi biet ho la ai.
 *
 * Ba buoc: danh sach khoa da ghi danh -> chon khoa dang do -> song song lay
 * muc luc khoa do (getCourseBySlug) va tien do tung bai cua no + vai khoa khac
 * (getEnrollmentByCourse) de dem chuoi tuan. Buoc 3 hong thi van hien phan
 * buoc 1 - khong de mot luot goi phu lam trong ca khung.
 */
export function useLearnerDashboard() {
  const user = useStoredUser();
  const userLoading = useUserLoading();
  const [items, setItems] = useState<DashboardItem[] | null>(null);
  const [detail, setDetail] = useState<CurrentDetail | null>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!user) return;
    let alive = true;

    (async () => {
      let sorted: DashboardItem[];
      try {
        const list = await getMyEnrolledCourses();
        // Khoa da bi xoa thi course = null - bo.
        sorted = (list ?? [])
          .filter((g): g is DashboardItem => Boolean(g.course))
          .sort((a, b) => lastTouch(b) - lastTouch(a));
      } catch {
        if (alive) setError(true);
        return;
      }
      if (!alive) return;
      setItems(sorted);

      const current = sorted.find((g) => !isDone(g)) ?? sorted[0];
      if (!current) return;

      const others = sorted
        .filter((g) => g !== current)
        .slice(0, OTHER_COURSES_FOR_ACTIVITY);

      const [courseRes, enrollRes, otherRes] = await Promise.all([
        current.course.slug
          ? getCourseBySlug(current.course.slug).catch(() => null)
          : Promise.resolve(null),
        getEnrollmentByCourse(current.course._id).catch(() => null),
        Promise.all(
          others.map((g) => getEnrollmentByCourse(g.course._id).catch(() => null)),
        ),
      ]);
      if (!alive) return;

      const currentProgress = enrollRes?.isEnrolled ? enrollRes.lessonProgress : [];
      const lessons =
        courseRes && !("error" in courseRes) && Array.isArray(courseRes.lessons)
          ? (courseRes.lessons as Lesson[])
              .filter((l): l is Lesson => typeof l === "object" && Boolean(l?._id))
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          : [];
      const nextIndex = pickNext(lessons, currentProgress);

      setDetail({
        lessons,
        nextLesson: nextIndex >= 0 ? lessons[nextIndex] : null,
        nextIndex,
        expiresAt: enrollRes?.isEnrolled ? (enrollRes.expiresAt ?? null) : null,
        daysLeft: enrollRes?.isEnrolled ? (enrollRes.daysLeft ?? null) : null,
        expired: Boolean(enrollRes?.isEnrolled && enrollRes.expired),
      });

      setActivity(
        buildActivity(
          [
            currentProgress,
            ...otherRes.map((r) => (r?.isEnrolled ? r.lessonProgress : [])),
          ],
          currentProgress,
        ),
      );
    })();

    return () => {
      alive = false;
    };
  }, [user]);

  const current = items ? (items.find((g) => !isDone(g)) ?? items[0]) : undefined;

  return {
    user,
    loading: userLoading || (user !== null && items === null && !error),
    error,
    items: items ?? [],
    current,
    others: (items ?? []).filter((g) => g !== current).slice(0, 4),
    detail,
    activity,
  };
}
