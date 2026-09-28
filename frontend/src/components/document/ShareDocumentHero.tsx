"use client";

import { useRef, useState } from "react";
import { ArrowRight, CloudUpload, Search } from "lucide-react";
import type { DocumentSubject } from "@/src/services/document";

import styles from "./ShareDocumentHero.module.scss";

interface Props {
  /** Chua dang nhap thi tha file / bam chon file se mo hop dang nhap. */
  daDangNhap: boolean;
  gioiHanMb: number;
  /** Nguoi dung vua tha hoac chon file (toi da 5) - form dang bai lo kiem tra va mo ra. */
  khiChonFile: (files: File[]) => void;
  /** Can dang nhap truoc khi dang - trang mo hop dang nhap ngay tai cho. */
  khiCanDangNhap: () => void;
  tuKhoa: string;
  doiTuKhoa: (v: string) => void;
  khiTim: () => void;
  /** Vai mon nhieu tai lieu nhat - loi tat loc nhanh ngay duoi o tim. */
  monNoiBat: DocumentSubject[];
  khiChonMon: (key: string) => void;
}

/**
 * Dai dau trang /share-document: tieu de + mot khung o giua vua la cho THA
 * FILE de dang tai lieu, vua la o tim kiem.
 *
 * Cac mang mau hai ben la anh SVG trong public/images/share-document/ - ve
 * rieng cho du an, KHONG lay tu trang tham chieu (hinh cua ho la tai san
 * thuong hieu co ban quyen). Dat bang background-image trong SCSS: chung chi
 * de trang tri, khong can alt, va khong di qua bo toi uu anh cua Next.
 */
export default function ShareDocumentHero({
  daDangNhap,
  gioiHanMb,
  khiChonFile,
  khiCanDangNhap,
  tuKhoa,
  doiTuKhoa,
  khiTim,
  monNoiBat,
  khiChonMon,
}: Props) {
  const oFile = useRef<HTMLInputElement>(null);
  const [dangKeo, setDangKeo] = useState(false);

  const moChonFile = () => {
    if (!daDangNhap) return khiCanDangNhap();
    oFile.current?.click();
  };

  const khiTha = (e: React.DragEvent) => {
    e.preventDefault();
    setDangKeo(false);
    if (!daDangNhap) return khiCanDangNhap();
    const ds = Array.from(e.dataTransfer.files ?? []);
    if (ds.length) khiChonFile(ds);
  };

  return (
    <section className={styles.hero}>
      <span aria-hidden className={`${styles.hinh} ${styles.giotTim}`} />
      <span aria-hidden className={`${styles.hinh} ${styles.trungCam}`} />
      <span aria-hidden className={`${styles.hinh} ${styles.sungHong}`} />
      <span aria-hidden className={`${styles.hinh} ${styles.chamChanh}`} />
      <span aria-hidden className={`${styles.hinh} ${styles.giotXanh}`} />
      <span aria-hidden className={`${styles.hinh} ${styles.laChanh}`} />
      <span aria-hidden className={`${styles.hinh} ${styles.chamHong}`} />

      <div className={styles.noiDung}>
        <h1 className={styles.tieuDe}>Tài liệu thật. Từ chính sinh viên.</h1>
        <p className={styles.moTa}>
          Đề cương, đề thi, bài giải và slide bài giảng do sinh viên chia sẻ — xem và tải
          về hoàn toàn miễn phí.
        </p>

        <div className={styles.khung}>
          {/* Ca vung la mot nut: ban phim Tab toi duoc, Enter/Space mo hop chon
              file. Keo tha chi la loi tat cho chuot. */}
          <div
            role="button"
            tabIndex={0}
            onClick={moChonFile}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                moChonFile();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDangKeo(true);
            }}
            onDragLeave={() => setDangKeo(false)}
            onDrop={khiTha}
            className={`${styles.vungTha} ${dangKeo ? styles.vungThaKeo : ""}`}
          >
            <CloudUpload size={34} className={styles.iconTai} />
            <p className={styles.thaTieuDe}>Kéo &amp; thả tài liệu vào đây</p>
            <p className={styles.thaPhu}>
              Hoặc <span className={styles.chonFile}>chọn file</span> từ máy của bạn.
            </p>
            <p className={styles.thaGhiChu}>
              {daDangNhap
                ? `PDF, DOC hoặc DOCX · tối đa 5 file, mỗi file ${gioiHanMb}MB`
                : "Cần đăng nhập để chia sẻ. Xem và tải về thì không cần tài khoản."}
            </p>
          </div>
          <input
            ref={oFile}
            type="file"
            accept=".pdf,.doc,.docx"
            multiple
            hidden
            onChange={(e) => {
              const ds = Array.from(e.target.files ?? []);
              if (ds.length) khiChonFile(ds);
              // Xoa gia tri de chon lai CUNG mot file van ban su kien change.
              e.target.value = "";
            }}
          />

          <form
            onSubmit={(e) => {
              e.preventDefault();
              khiTim();
            }}
            className={styles.oTim}
          >
            <div className={styles.dongTim}>
              <Search size={17} className={styles.iconTim} />
              <input
                value={tuKhoa}
                onChange={(e) => doiTuKhoa(e.target.value)}
                placeholder="Tìm đề cương, đề thi, slide bài giảng…"
                aria-label="Tìm tài liệu"
                className={styles.nhapTim}
              />
            </div>
            <div className={styles.dongDuoi}>
              <div className={styles.chips}>
                {monNoiBat.map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => khiChonMon(m.key)}
                    className={styles.chip}
                  >
                    {m.ten}
                  </button>
                ))}
              </div>
              <button type="submit" className={styles.nutTim} aria-label="Tìm">
                <ArrowRight size={17} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
