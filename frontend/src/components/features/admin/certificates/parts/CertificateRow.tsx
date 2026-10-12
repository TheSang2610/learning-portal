import { Award, Ban, Check, Copy, FileText, ShieldCheck } from "lucide-react";

import { ADMIN_CERTIFICATES as C } from "@/src/constants/admin/certificates-page";
import { certificatePdfUrl } from "@/src/services/certificate";
import type { AdminCertificateRow } from "@/src/types/certificate";

import styles from "../AdminCertificates.module.scss";

interface CertificateRowProps {
  c: AdminCertificateRow;
  busy: boolean;
  copied: string | null;
  onCopy: (code: string) => void;
  onRevoke: (c: AdminCertificateRow) => void;
}

/** Mot chung chi: hoc vien, khoa, so hieu/ma, diem, ngay cap, PDF, trang thai. */
export default function CertificateRow({
  c,
  busy,
  copied,
  onCopy,
  onRevoke,
}: CertificateRowProps) {
  const valid = c.isValid !== false;
  const code = c.verificationCode;
  const issuedAt = c.issuedAt || c.completionDate;

  return (
    <tr className={styles.row2}>
      <td className={styles.headCell}>
        <div className={styles.row3}>
          <div className={styles.row4}>
            <Award size={16} />
          </div>
          <div className={styles.box}>
            <p className={styles.text2}>{c.student?.name || C.row.deleted}</p>
            <p className={styles.text3}>{c.student?.email || C.row.none}</p>
          </div>
        </div>
      </td>
      <td className={styles.headCell}>
        <p className={styles.text4}>{c.course?.title || c.courseName || C.row.deleted}</p>
        {c.instructorName && (
          <p className={styles.text3}>{C.row.instructor(c.instructorName)}</p>
        )}
      </td>
      <td className={styles.headCell}>
        <p className={styles.text5}>{c.certificateNumber || C.row.none}</p>
        {code && (
          <button
            onClick={() => onCopy(code)}
            title={C.row.copyTitle}
            className={styles.button}
          >
            {copied === code ? <Check size={11} /> : <Copy size={11} />}
            {code}
          </button>
        )}
      </td>
      <td className={styles.cell3}>
        {c.scorePercentage != null
          ? `${c.scorePercentage}%`
          : (c.finalScore ?? C.row.none)}
      </td>
      <td className={styles.cell4}>
        {issuedAt ? new Date(issuedAt).toLocaleDateString("vi-VN") : C.row.none}
      </td>
      {/* Ban PDF do may chu dung ra, mo thang trong the moi.
          Dung dung tep ma hoc vien tai ve - truoc day chung
          nhan chi ton tai duoi dang HTML in tu trinh duyet nen
          quan tri khong co gi de doi chieu khi co khieu nai. */}
      <td className={styles.headCell}>
        <a
          href={certificatePdfUrl(c._id)}
          target="_blank"
          rel="noopener noreferrer"
          title={C.row.pdfTitle}
          className={styles.link}
        >
          <FileText size={13} />
          {C.row.pdf}
        </a>
      </td>
      <td className={styles.headCell}>
        <div className={styles.row5}>
          <span className={`${styles.label3} ${valid ? styles.label : styles.label2}`}>
            {valid ? <ShieldCheck size={12} /> : <Ban size={12} />}
            {valid ? C.row.valid : C.row.revoked}
          </span>
          <button
            onClick={() => onRevoke(c)}
            disabled={!valid || busy}
            title={valid ? C.row.revokeTitle : C.row.alreadyRevoked}
            className={styles.button2}
          >
            <Ban size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}
