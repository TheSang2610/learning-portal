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

import { doiLuu } from "@/src/hooks/savedStore";
import { getErrorMessage } from "@/src/services/apiHelper";
import { savedService, type LoaiLuu, type MucDaLuu } from "@/src/services/saved";

import styles from "./SavedItems.module.scss";

export const ID_MUC_DA_LUU = "da-luu";

const ngayGon = (iso: string) =>
  new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const LOC: { khoa: "tatCa" | LoaiLuu; nhan: string }[] = [
  { khoa: "tatCa", nhan: "Tất cả" },
  { khoa: "baiViet", nhan: "Bài viết" },
  { khoa: "taiLieu", nhan: "Tài liệu" },
];

/**
 * Bai viet va tai lieu da bam nut luu - lay tu tai khoan (GET /api/da-luu).
 * Bai / tai lieu da bi go xuong sau khi luu thi may chu tu bo ra.
 */
export default function SavedItems() {
  const [ds, setDs] = useState<MucDaLuu[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState("");
  const [loc, setLoc] = useState<"tatCa" | LoaiLuu>("tatCa");
  const [dangBo, setDangBo] = useState<string | null>(null);

  const tai = useCallback(async () => {
    try {
      setDangTai(true);
      setLoi("");
      setDs((await savedService.layDaLuu()).items);
    } catch (err) {
      setLoi(getErrorMessage(err, "Không tải được danh sách đã lưu."));
    } finally {
      setDangTai(false);
    }
  }, []);

  useEffect(() => {
    // Hoan mot vong microtask - tranh setState dong bo trong than effect
    // (react-hooks/set-state-in-effect), cung cach cac trang quan tri.
    void Promise.resolve().then(tai);
  }, [tai]);

  const boLuu = async (m: MucDaLuu) => {
    const k = `${m.loai}:${m.id}`;
    try {
      setDangBo(k);
      setLoi("");
      // Qua kho chung chu khong goi thang API: nut luu tren cac trang khac
      // dang mo cung phai tat theo.
      await doiLuu(m.loai, m.id);
      setDs((cu) => cu.filter((x) => !(x.loai === m.loai && x.id === m.id)));
    } catch (err) {
      setLoi(getErrorMessage(err, "Không bỏ lưu được."));
    } finally {
      setDangBo(null);
    }
  };

  const hien = loc === "tatCa" ? ds : ds.filter((m) => m.loai === loc);
  const dem = (k: "tatCa" | LoaiLuu) =>
    k === "tatCa" ? ds.length : ds.filter((m) => m.loai === k).length;

  return (
    <section id={ID_MUC_DA_LUU} className={styles.card}>
      <div className={styles.dau}>
        <h2 className={styles.heading}>
          <Bookmark size={17} />
          Đã lưu
        </h2>
        {ds.length > 0 && (
          <div className={styles.loc} role="group" aria-label="Lọc mục đã lưu">
            {LOC.map((l) => (
              <button
                key={l.khoa}
                type="button"
                onClick={() => setLoc(l.khoa)}
                aria-pressed={loc === l.khoa}
                className={`${styles.nutLoc} ${loc === l.khoa ? styles.nutLocOn : ""}`}
              >
                {l.nhan}
                <span className={styles.so}>{dem(l.khoa)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {loi && (
        <p role="alert" className={styles.loi}>
          {loi}
        </p>
      )}

      {dangTai ? (
        <div className={styles.trong}>
          <Loader2 size={20} className={styles.quay} />
        </div>
      ) : hien.length === 0 ? (
        <div className={styles.trong}>
          <Bookmark size={22} />
          {ds.length === 0 ? (
            <>
              Chưa lưu gì. Bấm biểu tượng dấu trang ở{" "}
              <Link href="/blog" className={styles.lienKet}>
                bài viết
              </Link>{" "}
              hoặc{" "}
              <Link href="/share-document" className={styles.lienKet}>
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
          {hien.map((m) => {
            const k = `${m.loai}:${m.id}`;
            return (
              <li key={k} className={styles.muc}>
                <span
                  className={`${styles.bieuTuong} ${m.loai === "taiLieu" ? styles.btTaiLieu : styles.btBaiViet}`}
                >
                  {m.loai === "taiLieu" ? (
                    <FileText size={18} />
                  ) : (
                    <Newspaper size={18} />
                  )}
                </span>
                <div className={styles.thongTin}>
                  <Link href={m.duongDan} className={styles.ten}>
                    {m.tieuDe}
                  </Link>
                  <div className={styles.meta}>
                    <span className={styles.nhanLoai}>
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
                    <span>Lưu {ngayGon(m.luuLuc)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => boLuu(m)}
                  disabled={dangBo === k}
                  className={styles.nutBo}
                  title="Bỏ lưu"
                  aria-label={`Bỏ lưu ${m.tieuDe}`}
                >
                  {dangBo === k ? (
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
