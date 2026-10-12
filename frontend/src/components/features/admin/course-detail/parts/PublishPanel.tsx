import Link from "next/link";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

import { ADMIN_COURSE_DETAIL as C } from "@/src/constants/admin/course-detail-page";

import styles from "../AdminCourseDetail.module.scss";

interface PublishPanelProps {
  isAdmin: boolean;
  isPublished: boolean;
  busy: boolean;
  onToggle: () => void;
}

/** Tieu de trang + o trang thai cong khai va nut phat hanh / go bai. */
export default function PublishPanel({
  isAdmin,
  isPublished,
  busy,
  onToggle,
}: PublishPanelProps) {
  return (
    <>
      <div className={styles.col}>
        <div>
          <Link href={C.listHref} className={styles.box2}>
            <ArrowLeft size={16} /> {C.back}
          </Link>
          <h1 className={styles.title}>{C.title}</h1>
        </div>

        <div className={styles.card}>
          <div className={styles.box3}>
            <p className={styles.text}>{C.publish.label}</p>
            <p className={`${styles.text4} ${isPublished ? styles.text2 : styles.text3}`}>
              {isPublished ? C.publish.published : C.publish.draft}
            </p>
          </div>

          <button
            type="button"
            onClick={onToggle}
            disabled={busy || !isAdmin}
            className={`${styles.button7} ${
              !isAdmin ? styles.button : isPublished ? styles.button2 : styles.button3
            }`}
          >
            {isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
            {busy
              ? C.publish.busy
              : isPublished
                ? C.publish.unpublish
                : C.publish.publishColor}
          </button>
        </div>
      </div>

      {!isAdmin && <div className={styles.card2}>{C.instructorNotice}</div>}
    </>
  );
}
