import { useRef } from "react";
import {
  Check,
  GraduationCap,
  ImageUp,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import { ADMIN_DOCUMENT_SUBJECTS as C } from "@/src/constants/admin/document-subjects-page";
import type { DocumentUniversity } from "@/src/services/document";

import type { DocumentCatalogState } from "../hooks/useDocumentCatalog";
import styles from "../AdminDocumentSubjects.module.scss";

const U = C.universities;

/**
 * O logo: anh xem truoc + nut chon tu may + nut bo. Ve bang background-image
 * nhu trang Truong cong khai (InstitutionDirectory), vi logo co the la
 * /images/institution/... cu hoac link Cloudinary moi.
 *
 * Truoc day o nay la o go duong dan "/images/institution/ten-file.png" - muon
 * doi logo phai chep file vao thu muc public cua frontend roi deploy lai.
 */
function LogoPicker({
  logo,
  busy,
  onPick,
  onClear,
}: {
  logo: string;
  busy: boolean;
  onPick: (file: File | undefined) => void;
  onClear: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className={styles.logoPicker}>
      <span
        className={logo ? styles.logoBox : `${styles.logoBox} ${styles.logoEmpty}`}
        style={logo ? { backgroundImage: `url("${logo}")` } : undefined}
        aria-hidden
      >
        {!logo && <GraduationCap size={18} />}
      </span>
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={busy}
        className={styles.secondaryButton}
      >
        {busy ? <Loader2 size={15} className={styles.quay} /> : <ImageUp size={15} />}
        {busy ? U.uploadingLogo : logo ? U.changeLogo : U.pickLogo}
      </button>
      {logo && !busy && (
        <button type="button" onClick={onClear} className={styles.textButton}>
          {U.removeLogo}
        </button>
      )}
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          // Xoa de chon lai dung file do van bat duoc onChange.
          e.target.value = "";
          onPick(file);
        }}
      />
    </div>
  );
}

/** Truong dai hoc: them (ten + logo), doi ten / logo, xoa. */
export default function UniversitySection({
  s,
  hideHeading = false,
}: {
  s: DocumentCatalogState;
  /** Trang da co tieu de rieng (PageHeader) thi an tieu de muc. */
  hideHeading?: boolean;
}) {
  const phim = (t: DocumentUniversity) => (e: React.KeyboardEvent) => {
    if (e.key === "Enter") s.renameSchool(t);
    if (e.key === "Escape") s.setEditSchool(null);
  };

  return (
    <>
      {!hideHeading && (
        <h2 className={styles.muc}>
          <GraduationCap size={18} />
          {U.heading}
        </h2>
      )}
      <form onSubmit={s.themTruong} className={styles.addCard}>
        <div className={styles.addRow}>
          <input
            value={s.newSchoolName}
            onChange={(e) => s.setNewSchoolName(e.target.value)}
            maxLength={U.maxLength}
            placeholder={U.placeholder}
            aria-label={U.nameAria}
            className={styles.o}
          />
          <button
            type="submit"
            disabled={!s.newSchoolName.trim() || s.uploadingLogo === "new"}
            className={styles.primaryButton}
          >
            <Plus size={15} />
            {U.add}
          </button>
        </div>
        <LogoPicker
          logo={s.newSchoolLogo}
          busy={s.uploadingLogo === "new"}
          onPick={(f) => s.pickLogo(f, "new")}
          onClear={() => s.setNewSchoolLogo("")}
        />
        <p className={styles.hint}>{U.logoHint}</p>
      </form>

      {!s.loading && s.schoolList.length > 0 && (
        <ul className={styles.ds}>
          {s.schoolList.map((t) =>
            s.suaTruong === t._id ? (
              <li key={t._id} className={styles.groupRow}>
                <div className={styles.groupBody}>
                  <input
                    value={s.editSchoolName}
                    onChange={(e) => s.setEditSchoolName(e.target.value)}
                    onKeyDown={phim(t)}
                    maxLength={U.maxLength}
                    autoFocus
                    aria-label={C.newNameAria(t.ten)}
                    className={styles.o}
                  />
                  <LogoPicker
                    logo={s.editLogo}
                    busy={s.uploadingLogo === t._id}
                    onPick={(f) => s.pickLogo(f, t._id)}
                    onClear={() => s.setEditLogo("")}
                  />
                  <p className={styles.hint}>{U.logoHint}</p>
                  <div className={styles.editActions}>
                    <button
                      type="button"
                      onClick={() => s.setEditSchool(null)}
                      className={styles.secondaryButton}
                    >
                      <X size={15} />
                      {U.cancel}
                    </button>
                    <button
                      type="button"
                      onClick={() => s.renameSchool(t)}
                      disabled={s.uploadingLogo === t._id}
                      className={styles.primaryButton}
                    >
                      <Check size={15} />
                      {U.save}
                    </button>
                  </div>
                </div>
              </li>
            ) : (
              <li key={t._id} className={styles.dong1}>
                <span
                  className={
                    t.logo ? styles.logoBox : `${styles.logoBox} ${styles.logoEmpty}`
                  }
                  style={t.logo ? { backgroundImage: `url("${t.logo}")` } : undefined}
                  title={t.logo ? undefined : U.noLogo}
                  aria-hidden
                >
                  {!t.logo && <GraduationCap size={16} />}
                </span>
                <span className={styles.ten}>{t.ten}</span>
                <span className={styles.so}>{U.count(t.soTaiLieu)}</span>
                <div className={styles.actions}>
                  <button
                    type="button"
                    onClick={() => s.startEditSchool(t)}
                    className={styles.iconButton}
                    title={U.editTitle}
                    aria-label={C.renameAria(t.ten)}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => s.xoaTruong(t)}
                    className={styles.deleteButton}
                    title={U.deleteTitle}
                    aria-label={C.deleteAria(t.ten)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </li>
            ),
          )}
        </ul>
      )}
    </>
  );
}
