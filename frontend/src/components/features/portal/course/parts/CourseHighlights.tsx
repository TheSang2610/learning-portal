import type { ReactNode } from "react";
import { Award, Calendar, Clock, Sliders } from "lucide-react";

import { COURSE_PAGE as C } from "@/src/constants/portal/course-page";

import styles from "../CourseDetail.module.scss";

function Highlight({
  icon,
  label,
  value,
  valueClass,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  valueClass: string;
}) {
  return (
    <div className={styles.stack8}>
      <div className={styles.row8}>
        {icon} {label}
      </div>
      <p className={valueClass}>{value}</p>
    </div>
  );
}

/* Khối Grid 4 cột tổng quan thông số kĩ thuật */
export default function CourseHighlights({ level }: { level?: string }) {
  const H = C.highlights;

  return (
    <div className={styles.card}>
      <Highlight
        icon={<Award size={14} className={styles.box30} />}
        label={H.progress.label}
        value={H.progress.value}
        valueClass={styles.text4}
      />
      <Highlight
        icon={<Clock size={14} className={styles.box30} />}
        label={H.duration.label}
        value={H.duration.value}
        valueClass={styles.text4}
      />
      <Highlight
        icon={<Sliders size={14} className={styles.box30} />}
        label={H.level.label}
        value={level || H.level.fallback}
        valueClass={styles.text5}
      />
      <Highlight
        icon={<Calendar size={14} className={styles.box30} />}
        label={H.schedule.label}
        value={H.schedule.value}
        valueClass={styles.text4}
      />
    </div>
  );
}
