import Link from "next/link";
import {
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import { documentPath } from "@/src/lib/document/paths";
import { setPageSize, formatLabel, totalSize } from "@/src/lib/document/file-info";
import SubjectPicker from "@/src/components/features/portal/share-document/parts/SubjectPicker";
import { ADMIN_DOCUMENTS as C } from "@/src/constants/admin/documents-page";
import type { SharedDocument } from "@/src/services/document";

import type { AdminDocumentsState } from "../hooks/useAdminDocuments";
import styles from "../AdminDocuments.module.scss";

/** Mot tai lieu: ten + dinh dang, mon (sua tai cho), nguoi dang, ngay, thao tac. */
export default function DocumentRow({
  d,
  s,
}: {
  d: SharedDocument;
  s: AdminDocumentsState;
}) {
  const R = C.row;
  const editingSubject = s.editingSubject === d._id;
  const togglingHidden = s.togglingHidden === d._id;
  const deleting = s.deleting === d._id;

  return (
    <tr className={d.daAn ? styles.hiddenRow : undefined}>
      <td>
        {/* Tai lieu da an: trang chi tiet tra 404 voi moi nguoi, ke
            ca admin (trang do dung san o may chu, khong mang cookie
            admin) - nen khong de duong dan toi mot trang loi. Admin
            van mo duoc FILE bang nut ben phai. */}
        {d.daAn ? (
          <span className={styles.documentTitle}>{d.title}</span>
        ) : (
          <Link
            href={documentPath(d._id)}
            target="_blank"
            className={styles.documentTitle}
          >
            {d.title}
          </Link>
        )}
        <span className={styles.meta}>
          {d.daAn && <span className={styles.hiddenLabel}>{R.hidden}</span>}
          {formatLabel(d.files)} &middot; {setPageSize(totalSize(d.files))}
        </span>
      </td>
      <td>
        {editingSubject ? (
          <div className={styles.bulkEditSubject}>
            <SubjectPicker
              subjectList={s.subjectList}
              chon={s.subjectValue}
              toggleSelect={s.setSubjectValue}
            />
            <div className={styles.editSubject}>
              <button
                type="button"
                onClick={() => s.saveSubject(d)}
                disabled={s.savingSubject}
                className={styles.saveButton}
                aria-label={R.saveSubjectsAria}
              >
                {s.savingSubject ? (
                  <Loader2 size={14} className={styles.quay} />
                ) : (
                  <Check size={14} />
                )}
              </button>
              <button
                type="button"
                onClick={s.cancelEditSubject}
                className={styles.secondaryButton}
                aria-label={R.cancelSubjectsAria}
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => s.startEditSubject(d)}
            className={d.monHoc?.length ? styles.mon : styles.subjectInside}
            title={R.editSubjectsTitle}
          >
            {d.monHoc?.length ? d.monHoc.join(", ") : R.noSubject}
            <Pencil size={12} />
          </button>
        )}
      </td>
      <td>{d.uploader?.name || R.deletedUser}</td>
      <td>{new Date(d.createdAt).toLocaleDateString("vi-VN")}</td>
      <td className={styles.phai}>{d.downloadCount}</td>
      <td className={styles.phai}>
        <div className={styles.actions}>
          {/* Mo file that, khong phai trang chi tiet: admin can xem
              NOI DUNG de quyet dinh go hay giu. */}
          <a
            href={C.fileHref(d._id)}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.secondaryButton}
            title={R.openFileTitle}
            aria-label={R.openFileAria(d.title)}
          >
            <ExternalLink size={15} />
          </a>
          {/* An truoc, xoa sau: an la go khoi mat nguoi dung ma
              van lay lai duoc, xoa thi mat han ca file. */}
          <button
            type="button"
            onClick={() => s.toggleHidden(d)}
            disabled={togglingHidden}
            className={styles.secondaryButton}
            title={d.daAn ? R.showTitle : R.hideTitle}
            aria-label={R.toggleAria(Boolean(d.daAn), d.title)}
          >
            {togglingHidden ? (
              <Loader2 size={15} className={styles.quay} />
            ) : d.daAn ? (
              <Eye size={15} />
            ) : (
              <EyeOff size={15} />
            )}
          </button>
          <button
            type="button"
            onClick={() => s.setPendingDelete(d)}
            disabled={deleting}
            className={styles.deleteButton}
            title={R.deleteTitle}
            aria-label={R.deleteAria(d.title)}
          >
            {deleting ? (
              <Loader2 size={15} className={styles.quay} />
            ) : (
              <Trash2 size={15} />
            )}
          </button>
        </div>
      </td>
    </tr>
  );
}
