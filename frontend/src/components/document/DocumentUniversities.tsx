"use client";

import { useState } from "react";
import Link from "next/link";
import { Folder } from "lucide-react";

import type { DocumentUniversity, SharedDocument } from "@/src/services/document";
import { DUONG_TRUONG, duongTruong, duongTaiLieu } from "./duongDan";

import styles from "./DocumentUniversities.module.scss";

// Hien 12 truong; "Xem tat ca" sang trang danh sach truong.
const SO_TRUONG_BAN_DAU = 12;
const SO_MAU_TRANG = 4;
const lechMau = (id: string) =>
  [...id].reduce((s, c) => s + c.charCodeAt(0), 0) % SO_MAU_TRANG;

/**
 * Khung hai tab o trang /share-document:
 *   - Truong dai hoc: danh sach truong, bam vao la tai lieu cua truong do.
 *   - Tai lieu: tai lieu moi chia se, dang luoi gon.
 */
export default function DocumentUniversities({
  dsTruong,
  dsTaiLieu,
}: {
  dsTruong: DocumentUniversity[];
  dsTaiLieu: SharedDocument[];
}) {
  const [tab, setTab] = useState<"truong" | "taiLieu">(
    dsTruong.length ? "truong" : "taiLieu",
  );
  if (!dsTruong.length && !dsTaiLieu.length) return null;

  // Nhieu tai lieu nhat truoc; bang nhau theo thu tu admin dat.
  const truongHien = [...dsTruong]
    .sort((a, b) => b.soTaiLieu - a.soTaiLieu || a.thuTu - b.thuTu)
    .slice(0, SO_TRUONG_BAN_DAU);

  return (
    <section className={styles.bang} aria-label="Trường đại học và tài liệu mới">
      <div className={styles.khung}>
        <div className={styles.tabs} role="tablist" aria-label="Chọn danh sách">
          {(
            [
              ["truong", "Trường đại học"],
              ["taiLieu", "Tài liệu"],
            ] as const
          ).map(([khoa, nhan]) => (
            <button
              key={khoa}
              type="button"
              role="tab"
              id={`tab-${khoa}`}
              aria-selected={tab === khoa}
              aria-controls={`bang-${khoa}`}
              onClick={() => setTab(khoa)}
              className={`${styles.tab} ${tab === khoa ? styles.tabOn : ""}`}
            >
              {nhan}
            </button>
          ))}
        </div>

        {tab === "truong" ? (
          <div id="bang-truong" role="tabpanel" aria-labelledby="tab-truong">
            <ul className={styles.dsTruong}>
              {truongHien.map((t) => (
                <li key={t._id}>
                  <Link
                    href={duongTruong(t.key)}
                    className={styles.truong}
                    title={t.soTaiLieu ? `${t.soTaiLieu} tài liệu` : "Chưa có tài liệu"}
                  >
                    {t.ten}
                  </Link>
                </li>
              ))}
            </ul>
            {/* "Xem tat ca" sang trang danh sach truong: tim truong, truong pho
                bien, tra theo chu cai dau. */}
            <Link href={DUONG_TRUONG} className={styles.xemTatCa}>
              Xem tất cả ({dsTruong.length} trường)
            </Link>
          </div>
        ) : (
          <ul
            id="bang-taiLieu"
            role="tabpanel"
            aria-labelledby="tab-taiLieu"
            className={styles.dsTaiLieu}
          >
            {dsTaiLieu.map((d) => (
              <li key={d._id}>
                <Link href={duongTaiLieu(d._id)} className={styles.taiLieu}>
                  <span
                    className={styles.anh}
                    aria-hidden
                    style={{
                      backgroundImage: `url(/images/share-document/trang-${lechMau(d._id) + 1}.svg)`,
                    }}
                  >
                    {d.files.length > 0 && (
                      <span className={styles.soFile}>{d.files.length}</span>
                    )}
                  </span>
                  <span className={styles.chu}>
                    <span className={styles.ten}>{d.title}</span>
                    <span className={styles.mon}>
                      <Folder size={13} aria-hidden />
                      {/* Span rieng: text-overflow khong ap duoc len chinh phan tu flex. */}
                      <span className={styles.monChu}>
                        {d.monHoc?.[0] || d.truong || "Tài liệu"}
                      </span>
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
