import type { ReactNode } from "react";

import CourseCard from "@/src/components/common/CourseCard";
import type { Course } from "@/src/services/course";

import styles from "./CourseGrid.module.scss";

const CARD_SIZES =
  "(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw";

/**
 * Luoi khoa hoc DUNG CHUNG cho moi trang danh sach (/courses, /collection...):
 * dong "N khoa hoc", luoi the CourseCard, khung cho luc tai, o trong, nut xem
 * them. Sua o day la moi trang doi theo.
 */
export default function CourseGrid({
  courses,
  loading = false,
  countText,
  empty,
  ranked = false,
  loadMore,
}: {
  courses: Course[];
  loading?: boolean;
  /** Dong tren luoi, vd. "12 khoa hoc". */
  countText?: string;
  /** Noi dung khi khong co khoa nao. */
  empty: ReactNode;
  /** Danh so 1, 2, 3... - CHI dung cho bang xep hang that su. */
  ranked?: boolean;
  loadMore?: { label: string; busy: boolean; onClick: () => void } | null;
}) {
  return (
    <div className={styles.container}>
      {loading ? (
        <div className={styles.grid} aria-busy="true">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className={styles.empty}>{empty}</div>
      ) : (
        <>
          {countText && <p className={styles.count}>{countText}</p>}

          <div className={styles.grid}>
            {courses.map((course, i) => (
              <CourseCard
                key={course._id}
                khoa={course}
                rankBadge={ranked ? i + 1 : undefined}
                sizes={CARD_SIZES}
              />
            ))}
          </div>

          {loadMore && (
            <div className={styles.more}>
              <button
                type="button"
                onClick={loadMore.onClick}
                disabled={loadMore.busy}
                className={styles.moreButton}
              >
                {loadMore.label}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
