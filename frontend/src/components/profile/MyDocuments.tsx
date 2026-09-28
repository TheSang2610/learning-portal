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

import DocumentEditForm from "@/src/components/document/DocumentEditForm";
import { nhanDinhDang } from "@/src/components/document/fileInfo";
import { getErrorMessage } from "@/src/services/apiHelper";
import { documentService, type SharedDocument } from "@/src/services/document";

import styles from "./MyDocuments.module.scss";
import { duongTaiLieu } from "@/src/components/document/duongDan";

// Id cua muc - trang chi tiet tai lieu dan chu bai toi day bang
// /user/profile?sua=<id>#tai-lieu-cua-toi.
export const ID_MUC_TAI_LIEU = "tai-lieu-cua-toi";

const ngayGon = (iso: string) =>
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
  const [ds, setDs] = useState<SharedDocument[]>([]);
  const [trang, setTrang] = useState(1);
  const [soTrang, setSoTrang] = useState(1);
  const [tong, setTong] = useState(0);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState("");
  const [dangSua, setDangSua] = useState<string | null>(null);
  const [dangXoa, setDangXoa] = useState<string | null>(null);
  const mucRef = useRef<HTMLElement>(null);
  // ?sua=<id> tu trang chi tiet chi mo form MOT lan, lan tai dau tien.
  const daXuLyLienKet = useRef(false);

  const tai = useCallback(async (p: number) => {
    try {
      setDangTai(true);
      setLoi("");
      const kq = await documentService.getMyDocuments({ page: p, limit: 10 });
      setDs(kq.documents);
      setTong(kq.total);
      setSoTrang(kq.totalPages);
      setTrang(kq.page);

      if (!daXuLyLienKet.current) {
        daXuLyLienKet.current = true;
        // Doc tu window chu khong dung useSearchParams: hook do bat trang phai
        // boc Suspense, ma trang ca nhan chi can gia tri nay dung mot lan.
        const url = new URL(window.location.href);
        const idSua = url.searchParams.get("sua");
        if (idSua && kq.documents.some((d) => d._id === idSua)) setDangSua(idSua);
        if (idSua || url.hash === `#${ID_MUC_TAI_LIEU}`) {
          // Muc nay hien SAU khi trang tai xong du lieu, nen trinh duyet khong tu
          // cuon toi #tai-lieu-cua-toi duoc - cuon tay.
          requestAnimationFrame(() =>
            mucRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
          );
        }
      }
    } catch (err) {
      setLoi(getErrorMessage(err, "Không tải được tài liệu của bạn."));
    } finally {
      setDangTai(false);
    }
  }, []);

  useEffect(() => {
    // Hoan mot vong microtask - cung cach app/(admin)/admin/faqs/page.tsx, tranh
    // setState dong bo trong than effect (react-hooks/set-state-in-effect).
    void Promise.resolve().then(() => tai(1));
  }, [tai]);

  const xoa = async (doc: SharedDocument) => {
    if (!confirm(`Xóa tài liệu "${doc.title}"? Thao tác này không hoàn tác được.`))
      return;
    try {
      setDangXoa(doc._id);
      setLoi("");
      await documentService.deleteDocument(doc._id);
      // Tai lai trang hien tai thay vi chi loc khoi mang: con bai o trang sau
      // thi no phai don len, va xoa bai cuoi cua trang cuoi thi lui mot trang.
      const trangMoi = ds.length === 1 && trang > 1 ? trang - 1 : trang;
      await tai(trangMoi);
    } catch (err) {
      setLoi(getErrorMessage(err, "Không xóa được tài liệu."));
    } finally {
      setDangXoa(null);
    }
  };

  return (
    <section id={ID_MUC_TAI_LIEU} ref={mucRef} className={styles.card}>
      <div className={styles.dau}>
        <h2 className={styles.heading}>
          Tài liệu tôi đã chia sẻ
          {tong > 0 && <span className={styles.dem}>{tong}</span>}
        </h2>
        <Link href="/share-document" className={styles.nutDang}>
          <Upload size={14} />
          Chia sẻ tài liệu
        </Link>
      </div>

      {loi && (
        <p role="alert" className={styles.loi}>
          {loi}
        </p>
      )}

      {dangTai && ds.length === 0 ? (
        <div className={styles.trong}>
          <Loader2 size={20} className={styles.quay} />
        </div>
      ) : ds.length === 0 ? (
        <div className={styles.trong}>
          <FileText size={22} />
          Bạn chưa chia sẻ tài liệu nào.
        </div>
      ) : (
        <ul className={`${styles.ds} ${dangTai ? styles.mo : ""}`}>
          {ds.map((d) => (
            <li key={d._id} className={styles.muc}>
              <div className={styles.dong}>
                <span className={styles.duoi}>{nhanDinhDang(d.files)}</span>

                <div className={styles.thongTin}>
                  {/* Bai bi an thi trang chi tiet tra 404 ca voi chu bai - khong
                      dat lien ket de chu bai khoi bam vao mot trang loi. */}
                  {d.daAn ? (
                    <span className={styles.ten}>{d.title}</span>
                  ) : (
                    <Link href={duongTaiLieu(d._id)} className={styles.ten}>
                      {d.title}
                    </Link>
                  )}
                  <div className={styles.meta}>
                    {d.daAn && (
                      <span className={styles.nhanAn}>
                        <EyeOff size={12} />
                        Quản trị viên đã ẩn
                      </span>
                    )}
                    <span className={d.monHoc?.length ? styles.mon : styles.chuaMon}>
                      <BookOpen size={12} />
                      {d.monHoc?.length ? d.monHoc.join(", ") : "Chưa có môn"}
                    </span>
                    <span>
                      <CalendarDays size={12} />
                      {ngayGon(d.createdAt)}
                    </span>
                    <span>
                      <Download size={12} />
                      {d.downloadCount} lượt tải
                    </span>
                  </div>
                </div>

                <div className={styles.thaoTac}>
                  <button
                    type="button"
                    onClick={() => setDangSua(dangSua === d._id ? null : d._id)}
                    className={styles.nutSua}
                    aria-expanded={dangSua === d._id}
                  >
                    <Pencil size={14} />
                    Sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => xoa(d)}
                    disabled={dangXoa === d._id}
                    className={styles.nutXoa}
                    aria-label={`Xóa ${d.title}`}
                    title="Xóa tài liệu"
                  >
                    {dangXoa === d._id ? (
                      <Loader2 size={14} className={styles.quay} />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </div>
              </div>

              {dangSua === d._id && (
                <DocumentEditForm
                  // key theo id: mo bai khac thi form dung lai tu dau, khong
                  // mang tieu de/noi dung cua bai truoc sang.
                  key={d._id}
                  doc={d}
                  khiLuu={(moi) => {
                    // May chu tra ban moi nhat (kem daAn) - thay dung dong do.
                    setDs((cu) => cu.map((x) => (x._id === moi._id ? moi : x)));
                    setDangSua(null);
                  }}
                  khiHuy={() => setDangSua(null)}
                />
              )}
            </li>
          ))}
        </ul>
      )}

      {soTrang > 1 && (
        <div className={styles.phanTrang}>
          <button
            type="button"
            onClick={() => tai(trang - 1)}
            disabled={trang <= 1 || dangTai}
            className={styles.nutTrang}
            aria-label="Trang trước"
          >
            <ChevronLeft size={16} />
          </button>
          <span>
            Trang {trang} / {soTrang}
          </span>
          <button
            type="button"
            onClick={() => tai(trang + 1)}
            disabled={trang >= soTrang || dangTai}
            className={styles.nutTrang}
            aria-label="Trang sau"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </section>
  );
}
