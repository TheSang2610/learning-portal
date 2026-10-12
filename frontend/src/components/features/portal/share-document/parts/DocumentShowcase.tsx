"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUp, Download, Plus } from "lucide-react";

import { summaryHtml } from "@/src/lib/post-html";
import type { DocumentCategory, SharedDocument } from "@/src/services/document";
import { allPath, documentPath } from "@/src/lib/document/paths";
import { formatLabel } from "@/src/lib/document/file-info";

import styles from "./DocumentShowcase.module.scss";

/** Mot tab: linh vuc + mot tai lieu tieu bieu cua no (lay san o may chu). */
export interface DisplayItem {
  nhom: DocumentCategory;
  taiLieu: SharedDocument;
}

/**
 * "Danh rieng cho mon hoc cua ban" o trang /share-document.
 *
 * Moi tab la mot linh vuc. Ben trai la o "tim kiem" mo phong nguoi hoc go ten
 * mon; dai song noi sang ben phai la MOT tai lieu that cua linh vuc do - de
 * nguoi moi vao thay ngay kho co gi, thay vi mot minh hoa bia.
 *
 * Chi nhan linh vuc CO tai lieu (page.tsx loc san) - tab trong khong co gi de
 * trinh bay.
 */
export default function DocumentShowcase({ itemList }: { itemList: DisplayItem[] }) {
  const [selected, setSelected] = useState(0);
  if (!itemList.length) return null;

  const { nhom: group, taiLieu: document } =
    itemList[Math.min(selected, itemList.length - 1)];
  const subjectItem = group.monTieuBieu[0]?.ten ?? group.ten;
  const subjects = document.monHoc?.length ? document.monHoc.join(", ") : group.ten;

  return (
    <section className={styles.bang} aria-labelledby="tieu-de-trinh-bay">
      <div className={styles.khung}>
        <h2 id="tieu-de-trinh-bay" className={styles.tieuDe}>
          Dành riêng cho môn học của bạn
        </h2>

        <div className={styles.tabs} role="tablist" aria-label="Chọn lĩnh vực">
          {itemList.map((m, i) => (
            <button
              key={m.nhom._id}
              type="button"
              role="tab"
              aria-selected={i === selected}
              aria-controls="bang-trinh-bay"
              onClick={() => setSelected(i)}
              className={`${styles.tab} ${i === selected ? styles.tabOn : ""}`}
            >
              {m.nhom.ten}
            </button>
          ))}
        </div>

        {/* key theo linh vuc: doi tab thi khoi nay dung lai -> chay lai hieu
            ung hien ra, nguoi xem thay ro noi dung vua doi. */}
        <div
          key={group._id}
          id="bang-trinh-bay"
          role="tabpanel"
          aria-label={group.ten}
          className={styles.noiDung}
        >
          {/* The trai: o "tim kiem" mo phong - chi de minh hoa. */}
          <Link href={allPath({ nhom: group.key })} className={styles.leftCard}>
            <span className={styles.searchText}>
              Tìm tài liệu {subjectItem}
              <span className={styles.cursor} aria-hidden />
            </span>
            <span className={styles.buttonRow} aria-hidden>
              <span className={styles.roundButton}>
                <Plus size={16} />
              </span>
              <span className={`${styles.roundButton} ${styles.darkButton}`}>
                <ArrowUp size={16} />
              </span>
            </span>
          </Link>

          <span className={styles.song} aria-hidden />

          {/* The phai: tai lieu THAT cua linh vuc. */}
          <Link href={documentPath(document._id)} className={styles.rightCard}>
            <span className={styles.nhan}>Tài liệu</span>
            <span className={styles.documentTitle}>{document.title}</span>
            <span className={styles.mon}>{subjects}</span>
            <span
              className={styles.trich}
              // summaryHtml chi giu 6 the dinh dang tran, moi "<" con lai thanh
              // &lt; - xem ham do.
              dangerouslySetInnerHTML={{ __html: summaryHtml(document.description) }}
            />
            <span className={styles.meta}>
              <span className={styles.extension}>{formatLabel(document.files)}</span>
              <span>
                <Download size={14} />
                {document.downloadCount} lượt tải
              </span>
              {document.uploader?.name && <span>bởi {document.uploader.name}</span>}
            </span>
          </Link>
        </div>

        <Link href={allPath({ nhom: group.key })} className={styles.viewButton}>
          Xem tài liệu {group.ten}
        </Link>
      </div>
    </section>
  );
}
