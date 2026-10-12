"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";

import { MY_COURSES as C } from "@/src/constants/portal/my-courses-page";

import { useMyCourses } from "./hooks/useMyCourses";
import EnrolledCourseCard from "./parts/EnrolledCourseCard";
import styles from "./MyCourses.module.scss";

/** Trang /user/my-courses - khoa hoc cua toi. */
export default function MyCourses() {
  const s = useMyCourses();

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.row}>
          <BookOpen size={22} className={styles.box} />
          <h1 className={styles.title}>{C.title}</h1>
        </div>

        <p className={styles.text}>
          {s.loading ? C.loading : C.summary(s.inProgressCount, s.completedCount)}
        </p>

        {/* overflow-x-auto: ba nut nay vua man hinh 390px, nhung day la luoi an
            toan neu sau nay them bo loc. */}
        <div className={styles.scroller}>
          {C.filters.map((b) => (
            <button
              key={b.ma}
              type="button"
              onClick={() => s.setFilter(b.ma)}
              className={`${styles.button3} ${
                s.filter === b.ma ? styles.button : styles.button2
              }`}
            >
              {b.chu}
            </button>
          ))}
        </div>

        {s.loi && <p className={styles.text2}>{s.loi}</p>}

        {s.loading && (
          <div className={styles.row2}>
            <div className={styles.spinner} />
          </div>
        )}

        {!s.loading && !s.loi && s.query.length === 0 && (
          <div className={styles.card}>
            <BookOpen size={32} className={styles.box2} />
            <p className={styles.text3}>
              {s.hasCourses.length === 0
                ? C.empty.none
                : s.filter === "xong"
                  ? C.empty.noneDone
                  : C.empty.allDone}
            </p>
            <Link href={C.coursesHref} className={styles.box3}>
              {C.empty.browse}
            </Link>
          </div>
        )}

        <div className={styles.grid}>
          {!s.loading && s.query.map((g) => <EnrolledCourseCard key={g._id} g={g} />)}
        </div>
      </div>
    </div>
  );
}
