import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  ExternalLink,
  Loader2,
  PenLine,
  Save,
} from "lucide-react";

import { ADMIN_POST_CREATE as C } from "@/src/constants/admin/post-create-page";

import type { PostEditorState } from "../hooks/usePostEditor";
import styles from "../AdminPostCreate.module.scss";

/** Tieu de trang, nut xem / luu va thong bao thanh cong / loi. */
export default function PostEditorHeader({ s }: { s: PostEditorState }) {
  const H = C.header;

  return (
    <>
      <div className={styles.row}>
        <div>
          <Link href={C.listHref} className={styles.box}>
            <ArrowLeft size={15} />
            {H.back}
          </Link>
          <h3 className={styles.subheading}>
            <PenLine className={styles.box2} size={26} />
            {s.isEdit ? H.editTitle : H.createTitle}
          </h3>
          <p className={styles.text2}>{H.intro}</p>
        </div>

        <div className={styles.row2}>
          {s.isEdit && s.published && s.slug && (
            <Link href={C.viewHref(s.slug)} target="_blank" className={styles.box3}>
              <ExternalLink size={16} />
              {H.view}
            </Link>
          )}
          <button type="submit" disabled={s.saving} className={styles.button}>
            {s.saving ? (
              <Loader2 className={styles.spinner2} size={16} />
            ) : (
              <Save size={16} />
            )}
            {s.isEdit ? H.save : s.published ? H.publish : H.saveDraft}
          </button>
        </div>
      </div>

      {s.success && (
        <div className={styles.card2}>
          <CheckCircle className={styles.box4} size={20} />
          <span className={styles.text}>{s.success}</span>
        </div>
      )}
      {s.loi && (
        <div className={styles.card3}>
          <AlertCircle className={styles.box5} size={20} />
          <span className={styles.text}>{s.loi}</span>
        </div>
      )}
    </>
  );
}
