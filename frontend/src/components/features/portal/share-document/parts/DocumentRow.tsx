import Link from "next/link";
import type { ReactNode } from "react";

import type { DocumentSummary } from "@/src/services/document";
import { formatLabel } from "@/src/lib/document/file-info";

import styles from "./DocumentPanels.module.scss";
import { documentPath } from "@/src/lib/document/paths";

/**
 * Mot dong tai lieu gon: o duoi file, ten, mon hoc, va mot dong phu.
 *
 * Dung cho hai tab "Goi y cho ban" va "Lich su". KHONG dung FeedCard o do:
 * FeedCard la the bai dang, co hang tac gia va doan mo ta - ma goi y va lich su
 * thi may chu khong tra mo ta (cho nhe), va nguoi xem can luot nhanh qua danh
 * sach chu khong doc tung bai.
 */
export default function DocumentRow({
  doc,
  phu,
  rightSide,
}: {
  doc: DocumentSummary;
  /** Dong chu nho duoi ten: ly do goi y, hoac "Da tai · 2 gio truoc". */
  phu: ReactNode;
  /** Nhan nho ben phai, vi du "Da tai". */
  rightSide?: ReactNode;
}) {
  return (
    <li>
      <Link href={documentPath(doc._id)} className={styles.row}>
        <span className={styles.badge} aria-hidden="true">
          {formatLabel(doc.files)}
        </span>
        <span className={styles.text}>
          <span className={styles.name}>{doc.title}</span>
          <span className={styles.sub}>
            {doc.monHoc?.length ? (
              <span className={styles.mon}>{doc.monHoc.join(", ")}</span>
            ) : null}
            {phu}
          </span>
        </span>
        {rightSide ? <span className={styles.right}>{rightSide}</span> : null}
      </Link>
    </li>
  );
}
