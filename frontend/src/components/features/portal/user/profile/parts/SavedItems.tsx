"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  BookmarkX,
  BookOpen,
  FileText,
  Loader2,
  Newspaper,
} from "lucide-react";

import { toggleSave } from "@/src/hooks/savedStore";
import { getErrorMessage } from "@/src/services/apiHelper";
import { savedService, type SaveType, type SavedItem } from "@/src/services/saved";

import styles from "./SavedItems.module.scss";

export const SAVED_SECTION_ID = "da-luu";

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const LOC: { khoa: "tatCa" | SaveType; nhan: string }[] = [
  { khoa: "tatCa", nhan: "Tất cả" },
  { khoa: "baiViet", nhan: "Bài viết" },
  { khoa: "taiLieu", nhan: "Tài liệu" },
];

/**
 * Bai viet va tai lieu da bam nut luu - lay tu tai khoan (GET /api/da-luu).
 * Bai / tai lieu da bi go xuong sau khi luu thi may chu tu bo ra.
 */
export default function SavedItems() {
  const [items, setDs] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [query, setFilter] = useState<"tatCa" | SaveType>("tatCa");
  const [removing, setRemoving] = useState<string | null>(null);

  const download = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      setDs((await savedService.layDaLuu()).items);
    } catch (err) {
      setErrorMessage(getErrorMessage(err, "Không tải được danh sách đã lưu."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Hoan mot vong microtask - tranh setState dong bo trong than effect
    // (react-hooks/set-state-in-effect), cung cach cac trang quan tri.
    void Promise.resolve().then(download);
  }, [download]);

  const unsave = async (m: SavedItem) => {
    const k = `${m.loai}:${m.id}`;
    try {
      setRemoving(k);
      setErrorMessage("");
      // Qua kho chung chu khong goi thang API: nut luu tren cac trang khac
      // dang mo cung phai tat theo.
      await toggleSave(m.loai, m.id);
      setDs((old) => old.filter((x) => !(x.loai === m.loai && x.id === m.id)));
    } catch (err) {
      setErrorMessage(getErrorMessage(err, "Không bỏ lưu được."));
    } finally {
      setRemoving(null);
    }
  };

  const visible = query === "tatCa" ? items : items.filter((m) => m.loai === query);
  const tally = (k: "tatCa" | SaveType) =>
    k === "tatCa" ? items.length : items.filter((m) => m.loai === k).length;

  return (
    <section id={SAVED_SECTION_ID} className={styles.card}>
      <div className={styles.dau}>
        <h2 className={styles.heading}>
          <Bookmark size={17} />
          Đã lưu
        </h2>
        {items.length > 0 && (
          <div className={styles.query} role="group" aria-label="Lọc mục đã lưu">
            {LOC.map((l) => (
              <button
                key={l.khoa}
                type="button"
                onClick={() => setFilter(l.khoa)}
                aria-pressed={query === l.khoa}
                className={`${styles.filterButton} ${query === l.khoa ? styles.activeFilterButton : ""}`}
              >
                {l.nhan}
                <span className={styles.so}>{tally(l.khoa)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {errorMessage && (
        <p role="alert" className={styles.loi}>
          {errorMessage}
        </p>
      )}

      {loading ? (
        <div className={styles.trong}>
          <Loader2 size={20} className={styles.quay} />
        </div>
      ) : visible.length === 0 ? (
        <div className={styles.trong}>
          <Bookmark size={22} />
          {items.length === 0 ? (
            <>
              Chưa lưu gì. Bấm biểu tượng dấu trang ở{" "}
              <Link href="/blog" className={styles.link}>
                bài viết
              </Link>{" "}
              hoặc{" "}
              <Link href="/share-document" className={styles.link}>
                tài liệu
              </Link>{" "}
              để lưu vào đây.
            </>
          ) : (
            "Không có mục nào thuộc loại này."
          )}
        </div>
      ) : (
        <ul className={styles.ds}>
          {visible.map((m) => {
            const k = `${m.loai}:${m.id}`;
            return (
              <li key={k} className={styles.muc}>
                <span
                  className={`${styles.bieuTuong} ${m.loai === "taiLieu" ? styles.savedDocuments : styles.savedPosts}`}
                >
                  {m.loai === "taiLieu" ? (
                    <FileText size={18} />
                  ) : (
                    <Newspaper size={18} />
                  )}
                </span>
                <div className={styles.info}>
                  <Link href={m.duongDan} className={styles.ten}>
                    {m.tieuDe}
                  </Link>
                  <div className={styles.meta}>
                    <span className={styles.typeLabel}>
                      {m.loai === "taiLieu"
                        ? m.soFile === 0
                          ? "Bài viết"
                          : `Tài liệu${m.duoiFile ? ` · ${m.duoiFile.toUpperCase()}` : ""}${(m.soFile ?? 1) > 1 ? ` · ${m.soFile} file` : ""}`
                        : "Bài viết"}
                    </span>
                    {m.monHoc?.length ? (
                      <span>
                        <BookOpen size={12} />
                        {m.monHoc.join(", ")}
                      </span>
                    ) : null}
                    {m.tacGia && <span>{m.tacGia}</span>}
                    <span>Lưu {shortDate(m.luuLuc)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => unsave(m)}
                  disabled={removing === k}
                  className={styles.removeButton}
                  title="Bỏ lưu"
                  aria-label={`Bỏ lưu ${m.tieuDe}`}
                >
                  {removing === k ? (
                    <Loader2 size={15} className={styles.quay} />
                  ) : (
                    <BookmarkX size={15} />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
