"use client";

import { useState } from "react";
import Link from "next/link";
import { Folder } from "lucide-react";

import type { DocumentUniversity, SharedDocument } from "@/src/services/document";
import { SCHOOLS_PATH, schoolPath, documentPath } from "@/src/lib/document/paths";

import styles from "./DocumentUniversities.module.scss";

// Hien 12 truong; "Xem tat ca" sang trang danh sach truong.
const INITIAL_SCHOOLS = 12;
const PAGE_SAMPLE_COUNT = 4;
const lechMau = (id: string) =>
  [...id].reduce((s, c) => s + c.charCodeAt(0), 0) % PAGE_SAMPLE_COUNT;

/**
 * Khung hai tab o trang /share-document:
 *   - Truong dai hoc: danh sach truong, bam vao la tai lieu cua truong do.
 *   - Tai lieu: tai lieu moi chia se, dang luoi gon.
 */
export default function DocumentUniversities({
  schoolList,
  documentList,
}: {
  schoolList: DocumentUniversity[];
  documentList: SharedDocument[];
}) {
  const [tab, setTab] = useState<"truong" | "taiLieu">(
    schoolList.length ? "truong" : "taiLieu",
  );
  if (!schoolList.length && !documentList.length) return null;

  // Nhieu tai lieu nhat truoc; bang nhau theo thu tu admin dat.
  const visibleSchools = [...schoolList]
    .sort((a, b) => b.soTaiLieu - a.soTaiLieu || a.thuTu - b.thuTu)
    .slice(0, INITIAL_SCHOOLS);

  return (
    <section className={styles.bang} aria-label="Trường đại học và tài liệu mới">
      <div className={styles.khung}>
        <div className={styles.tabs} role="tablist" aria-label="Chọn danh sách">
          {(
            [
              ["truong", "Trường đại học"],
              ["taiLieu", "Tài liệu"],
            ] as const
          ).map(([course, label]) => (
            <button
              key={course}
              type="button"
              role="tab"
              id={`tab-${course}`}
              aria-selected={tab === course}
              aria-controls={`bang-${course}`}
              onClick={() => setTab(course)}
              className={`${styles.tab} ${tab === course ? styles.tabOn : ""}`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "truong" ? (
          <div id="bang-truong" role="tabpanel" aria-labelledby="tab-truong">
            <ul className={styles.schoolList}>
              {visibleSchools.map((t) => (
                <li key={t._id}>
                  <Link
                    href={schoolPath(t.key)}
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
            <Link href={SCHOOLS_PATH} className={styles.viewAll}>
              Xem tất cả ({schoolList.length} trường)
            </Link>
          </div>
        ) : (
          <ul
            id="bang-taiLieu"
            role="tabpanel"
            aria-labelledby="tab-taiLieu"
            className={styles.documentList}
          >
            {documentList.map((d) => (
              <li key={d._id}>
                <Link href={documentPath(d._id)} className={styles.taiLieu}>
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
                      <span className={styles.subjectText}>
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
