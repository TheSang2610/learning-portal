import Image from "next/image";
import Link from "next/link";
import { BookOpen, CircleCheck, Clock, Play } from "lucide-react";

import { MY_COURSES as C } from "@/src/constants/portal/my-courses-page";
import type { EnrolledCourseItem } from "@/src/services/enrollment.api";

import styles from "../MyCourses.module.scss";

/** The mot khoa da ghi danh: anh, tieu de, thanh tien do, nut hoc tiep. */
export default function EnrolledCourseCard({ g }: { g: EnrolledCourseItem }) {
  const k = g.course!;
  const done = g.status === "completed" || g.totalProgress >= 100;
  const percent = Math.min(100, Math.max(0, Math.round(g.totalProgress)));

  return (
    <article className={styles.article}>
      <div className={styles.box4}>
        {k.thumbnail ? (
          <Image
            src={k.thumbnail}
            alt={k.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={styles.box5}
          />
        ) : (
          <div className={styles.row3}>
            <BookOpen size={28} className={styles.box6} />
          </div>
        )}

        {done && (
          <span className={styles.floating}>
            <CircleCheck size={12} /> {C.card.done}
          </span>
        )}
      </div>

      <div className={styles.col}>
        <h2 className={styles.heading}>{k.title}</h2>

        <div className={styles.box7}>
          <div className={styles.row4}>
            <span className={styles.label}>{C.card.progress}</span>
            <span className={styles.label2}>{percent}%</span>
          </div>
          {/* Thanh tien do la thong tin, khong phai trang tri: no la
              ly do chinh nguoi ta mo trang nay. */}
          <div className={styles.box8}>
            <div
              className={`${styles.box11} ${done ? styles.box9 : styles.box10}`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {g.lastAccessedAt && (
          <p className={styles.text4}>
            <Clock size={12} />
            {C.card.lastAccess} {new Date(g.lastAccessedAt).toLocaleDateString("vi-VN")}
          </p>
        )}

        {/* mt-auto: day nut xuong day the de moi the trong hang co
            nut nam cung mot duong, du tieu de dai ngan khac nhau. */}
        <Link href={k.slug ? C.learnHref(k.slug) : C.coursesHref} className={styles.row5}>
          <Play size={15} />
          {done ? C.card.review : percent > 0 ? C.card.resume : C.card.start}
        </Link>
      </div>
    </article>
  );
}
