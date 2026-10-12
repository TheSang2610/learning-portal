import SafeImage from "@/src/components/ui/SafeImage";
import {
  ADMIN_HOME_SECTION_COMMON as COMMON,
  HOME_COURSE_COUNT,
  type AdminHomeSectionKind,
} from "@/src/constants/admin/home-sections-page";
import { getInstructorName, type Course } from "@/src/services/course";

import { SECTION_CONFIG, viewsThisMonth } from "../config";
import styles from "../AdminHomeSection.module.scss";

interface HomeSectionRowProps {
  kind: AdminHomeSectionKind;
  course: Course;
  /** Vi tri trong bang xep hang, bat dau tu 1. */
  rank: number;
}

/** Mot khoa hoc: anh, ten, giang vien/cap do, cot so lieu, co dang len trang chu khong. */
export default function HomeSectionRow({ kind, course, rank }: HomeSectionRowProps) {
  const cfg = SECTION_CONFIG[kind];
  const instructorName =
    getInstructorName(course.instructor) ||
    COMMON.instructorFallback(String(course.instructor));

  const metric =
    cfg.metric === "createdAt"
      ? course.createdAt
        ? new Date(course.createdAt).toLocaleDateString("vi-VN")
        : COMMON.noDate
      : `${(cfg.metric === "luotXemThang"
          ? viewsThisMonth(course)
          : course.luotXem || 0
        ).toLocaleString("vi-VN")} ${COMMON.views}`;

  const onHome = rank <= HOME_COURSE_COUNT;

  return (
    <tr className={styles.row4}>
      <td className={styles.headCell}>
        <div className={styles.row2}>
          <SafeImage
            src={course.thumbnail || COMMON.noImage}
            alt={course.title}
            width={56}
            height={36}
            className={styles.box4}
          />
          <span className={styles.label}>{course.title}</span>
        </div>
      </td>
      <td className={styles.headCell}>
        <p className={styles.text2}>{instructorName}</p>
        <p className={styles.text3}>{course.level}</p>
      </td>
      <td className={`${styles.cell} ${cfg.cellClass}`}>{metric}</td>
      <td className={styles.headCell2}>
        <span className={onHome ? styles.badgeOn : styles.badgeOff}>
          {onHome ? COMMON.onHome(rank) : COMMON.offHome}
        </span>
      </td>
    </tr>
  );
}
