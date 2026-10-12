"use client";

import { useRef, useState } from "react";
import { ArrowRight, CloudUpload, Search } from "lucide-react";
import type { DocumentSubject } from "@/src/services/document";

import styles from "./ShareDocumentHero.module.scss";

interface Props {
  /** Chua dang nhap thi tha file / bam chon file se mo hop dang nhap. */
  loggedIn: boolean;
  limitMb: number;
  /** Nguoi dung vua tha hoac chon file (toi da 5) - form dang bai lo kiem tra va mo ra. */
  onPickFile: (files: File[]) => void;
  /** Can dang nhap truoc khi dang - trang mo hop dang nhap ngay tai cho. */
  onNeedLogin: () => void;
  tuKhoa: string;
  changeKeyword: (v: string) => void;
  onSearch: () => void;
  /** Vai mon nhieu tai lieu nhat - loi tat loc nhanh ngay duoi o tim. */
  featuredSubject: DocumentSubject[];
  onPickSubject: (key: string) => void;
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
  loggedIn,
  limitMb,
  onPickFile,
  onNeedLogin,
  tuKhoa: keyword,
  changeKeyword,
  onSearch,
  featuredSubject,
  onPickSubject,
}: Props) {
  const oFile = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const openFilePicker = () => {
    if (!loggedIn) return onNeedLogin();
    oFile.current?.click();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (!loggedIn) return onNeedLogin();
    const items = Array.from(e.dataTransfer.files ?? []);
    if (items.length) onPickFile(items);
  };

  return (
    <section className={styles.hero}>
      <span aria-hidden className={`${styles.icon} ${styles.searchDrop}`} />
      <span aria-hidden className={`${styles.icon} ${styles.orangeAccent}`} />
      <span aria-hidden className={`${styles.icon} ${styles.pinkGlow}`} />
      <span aria-hidden className={`${styles.icon} ${styles.dotTeal}`} />
      <span aria-hidden className={`${styles.icon} ${styles.dropGreen}`} />
      <span aria-hidden className={`${styles.icon} ${styles.leafTeal}`} />
      <span aria-hidden className={`${styles.icon} ${styles.dotPink}`} />

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
            onClick={openFilePicker}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openFilePicker();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`${styles.dropZone} ${dragging ? styles.dragDropZone : ""}`}
          >
            <CloudUpload size={34} className={styles.uploadIcon} />
            <p className={styles.dropTitle}>Kéo &amp; thả tài liệu vào đây</p>
            <p className={styles.dropHint}>
              Hoặc <span className={styles.pickFile}>chọn file</span> từ máy của bạn.
            </p>
            <p className={styles.dropNote}>
              {loggedIn
                ? `PDF, DOC hoặc DOCX · tối đa 5 file, mỗi file ${limitMb}MB`
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
              const items = Array.from(e.target.files ?? []);
              if (items.length) onPickFile(items);
              // Xoa gia tri de chon lai CUNG mot file van ban su kien change.
              e.target.value = "";
            }}
          />

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSearch();
            }}
            className={styles.searchInput}
          >
            <div className={styles.searchRow}>
              <Search size={17} className={styles.searchIcon} />
              <input
                value={keyword}
                onChange={(e) => changeKeyword(e.target.value)}
                placeholder="Tìm đề cương, đề thi, slide bài giảng…"
                aria-label="Tìm tài liệu"
                className={styles.searchInput}
              />
            </div>
            <div className={styles.bottomRow}>
              <div className={styles.chips}>
                {featuredSubject.map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => onPickSubject(m.key)}
                    className={styles.chip}
                  >
                    {m.ten}
                  </button>
                ))}
              </div>
              <button type="submit" className={styles.searchButton} aria-label="Tìm">
                <ArrowRight size={17} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
