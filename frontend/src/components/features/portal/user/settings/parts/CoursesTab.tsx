"use client";

import Link from "next/link";
import { BookOpen, Loader2 } from "lucide-react";

import { SettingCard } from "@/src/components/features/portal/user/settings/parts/SettingRow";
import { USER_SETTINGS } from "@/src/constants/portal/user-settings-page";
import { fmtDate } from "@/src/lib/date";
import type { EnrollmentStatus } from "@/src/services/enrollment.api";

import { useMyEnrollments } from "../hooks/useMyEnrollments";
import styles from "../UserSettings.module.scss";

const K = USER_SETTINGS.courses;

// Kieu nay truoc day khai lai o day mot ban rieng. Nay dung chung voi tang
// service de khi backend doi hinh dang thi chi phai sua mot cho.
const STATUS_LABEL: Record<EnrollmentStatus, { text: string; cls: string }> = {
  active: { text: K.status.active, cls: styles.learningLabel },
  completed: { text: K.status.completed, cls: styles.completedLabel },
  dropped: { text: K.status.dropped, cls: styles.usedLabel },
};

/* ==========================================================================
   TAB: KHOA HOC CUA TOI
   ========================================================================== */
export default function CoursesTab() {
  const { rows, err } = useMyEnrollments();

  if (err) {
    return (
      <SettingCard title={K.title}>
        <p className={styles.text7}>{err}</p>
      </SettingCard>
    );
  }

  if (!rows) {
    return (
      <div className={styles.row5}>
        <Loader2 size={22} className={styles.spinner} />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <SettingCard title={K.title}>
        <div className={styles.box11}>
          <p className={styles.text8}>{K.emptyTitle}</p>
          <p className={styles.text2}>{K.emptyText}</p>
          <Link href={USER_SETTINGS.coursesHref} className={styles.box12}>
            {K.explore}
          </Link>
        </div>
      </SettingCard>
    );
  }

  return (
    <SettingCard title={K.title} desc={K.count(rows.length)}>
      {rows.map((r) => {
        const s = STATUS_LABEL[r.status] ?? STATUS_LABEL.active;
        const pct = Math.max(0, Math.min(100, Math.round(r.totalProgress || 0)));

        return (
          <div key={r._id} className={styles.row6}>
            {r.course?.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.course.thumbnail} alt="" className={styles.image3} />
            ) : (
              <div className={styles.row7}>
                <BookOpen size={18} className={styles.box10} />
              </div>
            )}

            <div className={styles.box9}>
              <div className={styles.row8}>
                <h4 className={styles.text3}>
                  {/* Khoa hoc co the da bi xoa nhung ban ghi dang ky van con */}
                  {r.course?.title ?? K.deleted}
                </h4>
                <span className={`${styles.label7} ${s.cls}`}>{s.text}</span>
              </div>

              <div className={styles.row9}>
                <div className={styles.box13}>
                  <div className={styles.box14} style={{ width: `${pct}%` }} />
                </div>
                <span className={styles.label6}>{pct}%</span>
              </div>

              <p className={styles.text9}>
                {K.enrolled(fmtDate(r.createdAt))}
                {r.lastAccessedAt && K.lastAccess(fmtDate(r.lastAccessedAt))}
              </p>
            </div>

            {r.course?.slug && (
              <Link
                href={USER_SETTINGS.learnHref(r.course.slug)}
                className={styles.box15}
              >
                {K.learn}
              </Link>
            )}
          </div>
        );
      })}
    </SettingCard>
  );
}
