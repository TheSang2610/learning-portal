import Link from "next/link";
import type { ReactNode } from "react";

import type { DocumentSummary } from "@/src/services/document";
import { nhanDinhDang } from "./fileInfo";

import styles from "./DocumentPanels.module.scss";
import { duongTaiLieu } from "./duongDan";

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
  benPhai,
}: {
  doc: DocumentSummary;
  /** Dong chu nho duoi ten: ly do goi y, hoac "Da tai · 2 gio truoc". */
  phu: ReactNode;
  /** Nhan nho ben phai, vi du "Da tai". */
  benPhai?: ReactNode;
}) {
  return (
    <li>
      <Link href={duongTaiLieu(doc._id)} className={styles.row}>
        <span className={styles.badge} aria-hidden="true">
          {nhanDinhDang(doc.files)}
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
        {benPhai ? <span className={styles.right}>{benPhai}</span> : null}
      </Link>
    </li>
  );
}
