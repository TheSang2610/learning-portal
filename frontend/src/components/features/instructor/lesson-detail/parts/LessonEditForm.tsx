import { Save, X } from "lucide-react";

import { INSTRUCTOR_LESSON_DETAIL as C } from "@/src/constants/instructor/lesson-detail-page";

import styles from "../InstructorLessonDetail.module.scss";

interface LessonEditFormProps {
  title: string;
  content: string;
  videoUrl: string;
  /** Bai dang dung video kho kin: hien loi nhac giu nguyen. */
  privateVideo?: boolean;
  order: number;
  submitting: boolean;
  busy: boolean;
  onTitle: (v: string) => void;
  onContent: (v: string) => void;
  onVideoUrl: (v: string) => void;
  onOrder: (v: number) => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

/** Bieu mau sua tieu de, thu tu, video va tom tat bai hoc. */
export default function LessonEditForm({
  title,
  content,
  videoUrl,
  privateVideo,
  order,
  submitting,
  busy,
  onTitle,
  onContent,
  onVideoUrl,
  onOrder,
  onCancel,
  onSubmit,
}: LessonEditFormProps) {
  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <div className={styles.grid}>
        <div className={styles.box4}>
          <label className={styles.fieldLabel}>{C.fields.title}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitle(e.target.value)}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.box5}>
          <label className={styles.fieldLabel}>{C.fields.order}</label>
          <input
            type="number"
            value={order}
            onChange={(e) => onOrder(Number(e.target.value))}
            className={styles.input}
            min={1}
            required
          />
        </div>
      </div>

      <div>
        <label className={styles.fieldLabel}>{C.fields.videoUrl}</label>
        <input
          type="text"
          value={videoUrl}
          onChange={(e) => onVideoUrl(e.target.value)}
          placeholder={C.fields.videoUrlPlaceholder}
          className={styles.input2}
        />
        {privateVideo && <p className={styles.fieldLabel}>{C.fields.privateVideoNote}</p>}
      </div>

      <div>
        <label className={styles.fieldLabel}>{C.fields.content}</label>
        <textarea
          value={content}
          onChange={(e) => onContent(e.target.value)}
          rows={6}
          placeholder={C.fields.contentPlaceholder}
          className={styles.textarea}
        />
      </div>

      <div className={styles.row}>
        <button
          type="button"
          disabled={busy}
          onClick={onCancel}
          className={styles.button3}
        >
          <X size={14} /> {C.actions.cancel}
        </button>

        <button type="submit" disabled={busy} className={styles.button4}>
          <Save size={14} />
          {submitting ? C.actions.saving : C.actions.save}
        </button>
      </div>
    </form>
  );
}
