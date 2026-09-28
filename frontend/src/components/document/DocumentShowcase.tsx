"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUp, Download, Plus } from "lucide-react";

import { tomTatHtml } from "@/src/components/common/postHtml";
import type { DocumentCategory, SharedDocument } from "@/src/services/document";
import { duongTatCa, duongTaiLieu } from "./duongDan";
import { nhanDinhDang } from "./fileInfo";

import styles from "./DocumentShowcase.module.scss";

/** Mot tab: linh vuc + mot tai lieu tieu bieu cua no (lay san o may chu). */
export interface MucTrinhBay {
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
export default function DocumentShowcase({ dsMuc }: { dsMuc: MucTrinhBay[] }) {
  const [dangChon, setDangChon] = useState(0);
  if (!dsMuc.length) return null;

  const { nhom, taiLieu } = dsMuc[Math.min(dangChon, dsMuc.length - 1)];
  const mon = nhom.monTieuBieu[0]?.ten ?? nhom.ten;
  const cacMon = taiLieu.monHoc?.length ? taiLieu.monHoc.join(", ") : nhom.ten;

  return (
    <section className={styles.bang} aria-labelledby="tieu-de-trinh-bay">
      <div className={styles.khung}>
        <h2 id="tieu-de-trinh-bay" className={styles.tieuDe}>
          Dành riêng cho môn học của bạn
        </h2>

        <div className={styles.tabs} role="tablist" aria-label="Chọn lĩnh vực">
          {dsMuc.map((m, i) => (
            <button
              key={m.nhom._id}
              type="button"
              role="tab"
              aria-selected={i === dangChon}
              aria-controls="bang-trinh-bay"
              onClick={() => setDangChon(i)}
              className={`${styles.tab} ${i === dangChon ? styles.tabOn : ""}`}
            >
              {m.nhom.ten}
            </button>
          ))}
        </div>

        {/* key theo linh vuc: doi tab thi khoi nay dung lai -> chay lai hieu
            ung hien ra, nguoi xem thay ro noi dung vua doi. */}
        <div
          key={nhom._id}
          id="bang-trinh-bay"
          role="tabpanel"
          aria-label={nhom.ten}
          className={styles.noiDung}
        >
          {/* The trai: o "tim kiem" mo phong - chi de minh hoa. */}
          <Link href={duongTatCa({ nhom: nhom.key })} className={styles.theTrai}>
            <span className={styles.chuTim}>
              Tìm tài liệu {mon}
              <span className={styles.conTro} aria-hidden />
            </span>
            <span className={styles.hangNut} aria-hidden>
              <span className={styles.nutTron}>
                <Plus size={16} />
              </span>
              <span className={`${styles.nutTron} ${styles.nutDen}`}>
                <ArrowUp size={16} />
              </span>
            </span>
          </Link>

          <span className={styles.song} aria-hidden />

          {/* The phai: tai lieu THAT cua linh vuc. */}
          <Link href={duongTaiLieu(taiLieu._id)} className={styles.thePhai}>
            <span className={styles.nhan}>Tài liệu</span>
            <span className={styles.tenTaiLieu}>{taiLieu.title}</span>
            <span className={styles.mon}>{cacMon}</span>
            <span
              className={styles.trich}
              // tomTatHtml chi giu 6 the dinh dang tran, moi "<" con lai thanh
              // &lt; - xem ham do.
              dangerouslySetInnerHTML={{ __html: tomTatHtml(taiLieu.description) }}
            />
            <span className={styles.meta}>
              <span className={styles.duoi}>{nhanDinhDang(taiLieu.files)}</span>
              <span>
                <Download size={14} />
                {taiLieu.downloadCount} lượt tải
              </span>
              {taiLieu.uploader?.name && <span>bởi {taiLieu.uploader.name}</span>}
            </span>
          </Link>
        </div>

        <Link href={duongTatCa({ nhom: nhom.key })} className={styles.nutXem}>
          Xem tài liệu {nhom.ten}
        </Link>
      </div>
    </section>
  );
}
