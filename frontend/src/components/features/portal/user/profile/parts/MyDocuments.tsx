"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  EyeOff,
  FileText,
  Loader2,
  Pencil,
  Trash2,
  Upload,
} from "lucide-react";

import DocumentEditForm from "@/src/components/features/portal/share-document/parts/DocumentEditForm";
import { formatLabel } from "@/src/lib/document/file-info";
import { getErrorMessage } from "@/src/services/apiHelper";
import { documentService, type SharedDocument } from "@/src/services/document";

import styles from "./MyDocuments.module.scss";
import { documentPath } from "@/src/lib/document/paths";

// Id cua muc - trang chi tiet tai lieu dan chu bai toi day bang
// /user/profile?sua=<id>#tai-lieu-cua-toi.
export const DOCUMENTS_SECTION_ID = "tai-lieu-cua-toi";

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

/**
 * "Tai lieu toi da chia se" o trang ca nhan - NOI DUY NHAT chu bai sua bai.
 *
 * Trang chi tiet (/share-document/:id) chi con dong dan toi day. Ly do theo chu
 * du an: trang chia se la de DOC, viec quan ly bai cua minh gom ve mot cho.
 *
 * Gom ca bai bi admin an, kem nhan noi ro - khong thi chu bai tuong bai bi mat.
 */
export default function MyDocuments() {
  const [items, setDs] = useState<SharedDocument[]>([]);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  // ?sua=<id> tu trang chi tiet chi mo form MOT lan, lan tai dau tien.
  const linkProcessed = useRef(false);

  const download = useCallback(async (p: number) => {
    try {
      setLoading(true);
      setErrorMessage("");
      const outcome = await documentService.getMyDocuments({ page: p, limit: 10 });
      setDs(outcome.documents);
      setTotal(outcome.total);
      setPageCount(outcome.totalPages);
      setPage(outcome.page);

      if (!linkProcessed.current) {
        linkProcessed.current = true;
        // Doc tu window chu khong dung useSearchParams: hook do bat trang phai
        // boc Suspense, ma trang ca nhan chi can gia tri nay dung mot lan.
        const url = new URL(window.location.href);
        const editId = url.searchParams.get("sua");
        if (editId && outcome.documents.some((d) => d._id === editId)) setEditing(editId);
        if (editId || url.hash === `#${DOCUMENTS_SECTION_ID}`) {
          // Muc nay hien SAU khi trang tai xong du lieu, nen trinh duyet khong tu
          // cuon toi #tai-lieu-cua-toi duoc - cuon tay.
          requestAnimationFrame(() =>
            sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
          );
        }
      }
    } catch (err) {
      setErrorMessage(getErrorMessage(err, "Không tải được tài liệu của bạn."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Hoan mot vong microtask - cung cach useFaqManager (src/hooks), tranh
    // setState dong bo trong than effect (react-hooks/set-state-in-effect).
    void Promise.resolve().then(() => download(1));
  }, [download]);

  const remove = async (doc: SharedDocument) => {
    if (!confirm(`Xóa tài liệu "${doc.title}"? Thao tác này không hoàn tác được.`))
      return;
    try {
      setDeleting(doc._id);
      setErrorMessage("");
      await documentService.deleteDocument(doc._id);
      // Tai lai trang hien tai thay vi chi loc khoi mang: con bai o trang sau
      // thi no phai don len, va xoa bai cuoi cua trang cuoi thi lui mot trang.
      const newPage = items.length === 1 && page > 1 ? page - 1 : page;
      await download(newPage);
    } catch (err) {
      setErrorMessage(getErrorMessage(err, "Không xóa được tài liệu."));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <section id={DOCUMENTS_SECTION_ID} ref={sectionRef} className={styles.card}>
      <div className={styles.dau}>
        <h2 className={styles.heading}>
          Tài liệu tôi đã chia sẻ
          {total > 0 && <span className={styles.dem}>{total}</span>}
        </h2>
        <Link href="/share-document" className={styles.uploadButton}>
          <Upload size={14} />
          Chia sẻ tài liệu
        </Link>
      </div>

      {errorMessage && (
        <p role="alert" className={styles.loi}>
          {errorMessage}
        </p>
      )}

      {loading && items.length === 0 ? (
        <div className={styles.trong}>
          <Loader2 size={20} className={styles.quay} />
        </div>
      ) : items.length === 0 ? (
        <div className={styles.trong}>
          <FileText size={22} />
          Bạn chưa chia sẻ tài liệu nào.
        </div>
      ) : (
        <ul className={`${styles.ds} ${loading ? styles.mo : ""}`}>
          {items.map((d) => (
            <li key={d._id} className={styles.muc}>
              <div className={styles.rows}>
                <span className={styles.extension}>{formatLabel(d.files)}</span>

                <div className={styles.info}>
                  {/* Bai bi an thi trang chi tiet tra 404 ca voi chu bai - khong
                      dat lien ket de chu bai khoi bam vao mot trang loi. */}
                  {d.daAn ? (
                    <span className={styles.ten}>{d.title}</span>
                  ) : (
                    <Link href={documentPath(d._id)} className={styles.ten}>
                      {d.title}
                    </Link>
                  )}
                  <div className={styles.meta}>
                    {d.daAn && (
                      <span className={styles.hiddenLabel}>
                        <EyeOff size={12} />
                        Quản trị viên đã ẩn
                      </span>
                    )}
                    <span className={d.monHoc?.length ? styles.mon : styles.noSubject}>
                      <BookOpen size={12} />
                      {d.monHoc?.length ? d.monHoc.join(", ") : "Chưa có môn"}
                    </span>
                    <span>
                      <CalendarDays size={12} />
                      {shortDate(d.createdAt)}
                    </span>
                    <span>
                      <Download size={12} />
                      {d.downloadCount} lượt tải
                    </span>
                  </div>
                </div>

                <div className={styles.actions}>
                  <button
                    type="button"
                    onClick={() => setEditing(editing === d._id ? null : d._id)}
                    className={styles.editButton}
                    aria-expanded={editing === d._id}
                  >
                    <Pencil size={14} />
                    Sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(d)}
                    disabled={deleting === d._id}
                    className={styles.deleteButton}
                    aria-label={`Xóa ${d.title}`}
                    title="Xóa tài liệu"
                  >
                    {deleting === d._id ? (
                      <Loader2 size={14} className={styles.quay} />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </div>
              </div>

              {editing === d._id && (
                <DocumentEditForm
                  // key theo id: mo bai khac thi form dung lai tu dau, khong
                  // mang tieu de/noi dung cua bai truoc sang.
                  key={d._id}
                  doc={d}
                  onSave={(recent) => {
                    // May chu tra ban moi nhat (kem daAn) - thay dung dong do.
                    setDs((old) => old.map((x) => (x._id === recent._id ? recent : x)));
                    setEditing(null);
                  }}
                  onCancel={() => setEditing(null)}
                />
              )}
            </li>
          ))}
        </ul>
      )}

      {pageCount > 1 && (
        <div className={styles.phanTrang}>
          <button
            type="button"
            onClick={() => download(page - 1)}
            disabled={page <= 1 || loading}
            className={styles.pageButton}
            aria-label="Trang trước"
          >
            <ChevronLeft size={16} />
          </button>
          <span>
            Trang {page} / {pageCount}
          </span>
          <button
            type="button"
            onClick={() => download(page + 1)}
            disabled={page >= pageCount || loading}
            className={styles.pageButton}
            aria-label="Trang sau"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </section>
  );
}
