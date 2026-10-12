import { Eye, ImageOff, ListTree } from "lucide-react";

import SafeImage from "@/src/components/ui/SafeImage";
import { ADMIN_POST_CREATE as C } from "@/src/constants/admin/post-create-page";

import type { PostEditorState } from "../hooks/usePostEditor";
import styles from "../AdminPostCreate.module.scss";

/** The Xuat ban: trang thai + duong dan. */
function PublishCard({ s }: { s: PostEditorState }) {
  const P = C.publish;
  return (
    <div className={styles.card5}>
      <h4 className={styles.minorHeading}>{P.heading}</h4>

      <label htmlFor="trang-thai" className={styles.fieldLabel2}>
        {P.status}
      </label>
      <select
        id="trang-thai"
        value={s.published ? "published" : "draft"}
        onChange={(e) => s.setPublished(e.target.value === "published")}
        className={styles.input2}
      >
        <option value="published">{P.published}</option>
        <option value="draft">{P.draft}</option>
      </select>

      {s.isEdit && s.slug && (
        <p className={styles.text5}>
          {P.pathLabel}
          <code className={styles.code}>{P.path(s.slug)}</code>
          {s.published && (
            <>
              <br />
              {P.stableNote}
            </>
          )}
        </p>
      )}
    </div>
  );
}

/** The Phan loai: chu de + tags. */
function ClassifyCard({ s }: { s: PostEditorState }) {
  const K = C.classify;
  return (
    <div className={styles.card5}>
      <h4 className={styles.minorHeading}>{K.heading}</h4>

      <label htmlFor="chu-de" className={styles.fieldLabel2}>
        {K.topic}
      </label>
      <select
        id="chu-de"
        value={s.topic}
        onChange={(e) => s.setTopic(e.target.value)}
        className={styles.input2}
      >
        {s.topics.length === 0 && <option value={C.defaultTopic}>{K.othersLabel}</option>}
        {s.topics.map((t) => (
          <option key={t.slug} value={t.slug}>
            {t.name}
          </option>
        ))}
      </select>

      <label htmlFor="tags" className={styles.fieldLabel3}>
        {K.tags} <span className={styles.label3}>{K.tagsHint}</span>
      </label>
      <input
        id="tags"
        value={s.tags}
        onChange={(e) => s.setTags(e.target.value)}
        placeholder={K.tagsPlaceholder}
        className={styles.input2}
      />
      <p className={styles.text6}>{K.tagsNote}</p>
    </div>
  );
}

/** The Anh dai dien: duong dan + xem truoc. */
function ThumbnailCard({ s }: { s: PostEditorState }) {
  const T = C.thumbnail;
  return (
    <div className={styles.card5}>
      <h4 className={styles.minorHeading}>{T.heading}</h4>
      <input
        value={s.anh}
        onChange={(e) => s.setImage(e.target.value)}
        placeholder={T.placeholder}
        aria-label={T.aria}
        className={styles.input2}
      />
      <div className={styles.box6}>
        {s.anh.trim() ? (
          <SafeImage
            src={s.anh.trim()}
            alt={T.alt}
            fill
            sizes="320px"
            className={styles.box7}
          />
        ) : (
          <div className={styles.col}>
            <ImageOff size={24} />
            <span className={styles.label4}>{T.empty}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/** Kiem tra muc luc: dung dung menu ben trai ma nguoi doc se thay. */
function OutlineCard({ s }: { s: PostEditorState }) {
  const O = C.outline;
  const E = O.empty;
  return (
    <div className={styles.card5}>
      <h4 className={styles.minorHeading2}>
        <ListTree size={16} className={styles.box2} />
        {O.heading}
        <span className={styles.label5}>{s.outline.length}</span>
      </h4>
      <p className={styles.text7}>{O.note}</p>

      {s.outline.length === 0 ? (
        <div className={styles.card6}>
          {E.a}
          <b>{E.bold}</b>
          {E.b}
          <code className={styles.code2}>{E.tag}</code>
          {E.c}
          <code className={styles.code2}>{E.ex1}</code>
          {E.d}
          <code className={styles.code2}>{E.ex2}</code>
          {E.e}
          <code className={styles.code2}>{E.ex3}</code>
          {E.f}
        </div>
      ) : (
        <ul className={styles.list}>
          {s.outline.map((m, i) => (
            <li
              key={`${m.id}-${i}`}
              className={styles.item}
              style={{ paddingLeft: (m.level - 1) * 12 }}
              title={m.text}
            >
              <span className={styles.label6}>{O.bullets[m.level] ?? O.bulletDeep}</span>
              {m.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Cot phai: xuat ban, phan loai, anh, muc luc, nhac bo loc noi dung. */
export default function PostSidebar({ s }: { s: PostEditorState }) {
  return (
    <div className={styles.stack}>
      <PublishCard s={s} />
      <ClassifyCard s={s} />
      <ThumbnailCard s={s} />
      <OutlineCard s={s} />

      <div className={styles.card7}>
        <p className={styles.text8}>
          <Eye size={16} className={styles.box8} />
          {C.filterNotice.title}
        </p>
        <p className={styles.text9}>{C.filterNotice.text}</p>
      </div>
    </div>
  );
}
