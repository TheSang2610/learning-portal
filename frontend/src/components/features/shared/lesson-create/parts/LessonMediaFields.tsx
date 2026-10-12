import { Paperclip, Video } from "lucide-react";

import { LESSON_CREATE as C } from "@/src/constants/shared/lesson-create-page";

import styles from "../LessonCreate.module.scss";

type ChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;

interface LessonMediaFieldsProps {
  /** Cau noi sau ten tep video da chon (khac nhau admin / giang vien). */
  videoSelectedNote: string;
  videoUrl: string;
  documentUrl: string;
  videoFile: File | null;
  documentFile: File | null;
  onChange: (e: ChangeEvent) => void;
  onVideoFile: (file: File | null) => void;
  onDocumentFile: (file: File | null) => void;
}

/**
 * Video va tai lieu dinh kem: moi muc cho dan link HOAC chon tep; da chon tep
 * thi o link bi khoa va tep duoc uu tien.
 */
export default function LessonMediaFields({
  videoSelectedNote,
  videoUrl,
  documentUrl,
  videoFile,
  documentFile,
  onChange,
  onVideoFile,
  onDocumentFile,
}: LessonMediaFieldsProps) {
  return (
    <>
      <div className={styles.card3}>
        <label className={styles.row4}>
          <Video size={14} className={styles.box4} /> {C.video.label}
        </label>
        <input
          type="text"
          name="videoUrl"
          value={videoUrl}
          onChange={onChange}
          placeholder={C.video.placeholder}
          className={styles.input3}
          disabled={Boolean(videoFile)}
        />
        <div className={styles.row}>
          <span className={styles.label} /> {C.video.or}
          <span className={styles.label} />
        </div>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => onVideoFile(e.target.files?.[0] ?? null)}
          className={styles.input}
        />
        {videoFile && (
          <p className={styles.text4}>
            {C.video.selected} <b>{videoFile.name}</b>
            {videoSelectedNote}{" "}
            <button
              type="button"
              onClick={() => onVideoFile(null)}
              className={styles.button}
            >
              {C.clearFile}
            </button>
          </p>
        )}
      </div>

      <div className={styles.card3}>
        <label className={styles.row4}>
          <Paperclip size={14} className={styles.box4} /> {C.document.label}
          <span className={styles.label2}>{C.document.optional}</span>
        </label>
        <input
          type="text"
          name="documentUrl"
          value={documentUrl}
          onChange={onChange}
          placeholder={C.document.placeholder}
          className={styles.input3}
          disabled={Boolean(documentFile)}
        />
        <input
          type="file"
          onChange={(e) => onDocumentFile(e.target.files?.[0] ?? null)}
          className={styles.input2}
        />
        {documentFile && (
          <p className={styles.text4}>
            {C.document.selected} <b>{documentFile.name}</b>.{" "}
            <button
              type="button"
              onClick={() => onDocumentFile(null)}
              className={styles.button}
            >
              {C.clearFile}
            </button>
          </p>
        )}
      </div>
    </>
  );
}
