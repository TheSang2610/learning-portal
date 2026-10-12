import { ADMIN_LESSON_DETAIL as C } from "@/src/constants/admin/lesson-detail-page";

import type { AdminLessonDetailState } from "../hooks/useAdminLessonDetail";
import styles from "../AdminLessonDetail.module.scss";

/** Video bai hoc: tai tep (uu tien) hoac dan link, co xem truoc tep da chon. */
export default function VideoSourceField({ s }: { s: AdminLessonDetailState }) {
  const busy = s.submitting || s.deleting;

  return (
    <div className={styles.box4}>
      <div className={styles.box5}>
        <label className={styles.fieldLabel}>{C.video.label}</label>
        <p className={styles.text2}>{C.video.hint}</p>

        <div className={styles.card2}>
          <label className={styles.fieldLabel2}>{C.video.upload}</label>
          <input
            type="file"
            accept={C.videoAccept}
            onChange={s.handleVideoFileChange}
            disabled={busy}
            className={styles.input2}
          />
          <p className={styles.text3}>{C.video.supported}</p>
        </div>

        {s.videoPreview && (
          <div className={styles.card3}>
            <p className={styles.text4}>{C.video.selected}</p>
            <video src={s.videoPreview} controls className={styles.video} />
            <button type="button" onClick={s.clearVideoFile} className={styles.button3}>
              {C.video.remove}
            </button>
          </div>
        )}

        <div className={styles.card4}>
          <label className={styles.fieldLabel}>{C.video.paste}</label>
          <input
            type="text"
            value={s.videoUrl}
            onChange={(e) => s.setVideoUrl(e.target.value)}
            disabled={s.videoFile ? true : false}
            placeholder={C.video.placeholder}
            className={`${styles.input5} ${s.videoFile ? styles.input3 : styles.input4}`}
          />
          {s.videoFile && <p className={styles.text5}>{C.video.urlDisabled}</p>}
          {!s.videoFile && s.videoUrl && (
            <p className={styles.text6}>{C.video.urlWillSave}</p>
          )}
        </div>
      </div>
    </div>
  );
}
