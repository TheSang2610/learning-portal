import PostEditor from "@/src/components/features/admin/post-create/parts/PostEditor";
import { ADMIN_POST_CREATE as C } from "@/src/constants/admin/post-create-page";

import type { PostEditorState } from "../hooks/usePostEditor";
import styles from "../AdminPostCreate.module.scss";

/** Cot trai: tieu de, mo ta ngan, noi dung bai (trinh soan thao). */
export default function PostMainFields({ s }: { s: PostEditorState }) {
  const F = C.fields;

  return (
    <div className={styles.card4}>
      <div>
        <label htmlFor="tieu-de" className={styles.fieldLabel}>
          {F.title} <span className={styles.label}>{F.required}</span>
        </label>
        <input
          id="tieu-de"
          value={s.tieuDe}
          onChange={(e) => s.setTitle(e.target.value)}
          maxLength={C.maxTitle}
          placeholder={F.titlePlaceholder}
          className={`${styles.input2} ${styles.input}`}
        />
        <p className={styles.text3}>{F.counter(s.tieuDe.length, C.maxTitle)}</p>
      </div>

      <div>
        <label htmlFor="mo-ta" className={styles.fieldLabel}>
          {F.excerpt} <span className={styles.label}>{F.required}</span>
        </label>
        <textarea
          id="mo-ta"
          value={s.moTa}
          onChange={(e) => s.setDescription(e.target.value)}
          maxLength={C.maxExcerpt}
          rows={3}
          placeholder={F.excerptPlaceholder}
          className={`${styles.input2} ${styles.textarea}`}
        />
        <p className={styles.text3}>{F.counter(s.moTa.length, C.maxExcerpt)}</p>
      </div>

      <div>
        <label htmlFor="noi-dung" className={styles.fieldLabel}>
          {F.content} <span className={styles.label}>{F.required}</span>
        </label>
        <PostEditor
          id="noi-dung"
          giaTri={s.noiDung}
          setValue={s.setContent}
          toiDa={C.maxContent}
        />
        <p className={styles.text4}>
          <span>{F.contentHint}</span>
          <span className={styles.label2}>
            {F.chars(s.noiDung.length.toLocaleString("vi-VN"))}
          </span>
        </p>
      </div>
    </div>
  );
}
