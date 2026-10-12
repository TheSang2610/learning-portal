"use client";

import Link from "next/link";
import { Bookmark, CalendarDays, Download, Eye } from "lucide-react";

import { relativeTime } from "@/src/lib/post-time";
import { toggleSave, useSaved } from "@/src/hooks/savedStore";
import { useStoredUser } from "@/src/hooks/userStore";
import type { DocumentSummary, SharedDocument } from "@/src/services/document";
import { formatLabel } from "@/src/lib/document/file-info";

import styles from "./DocumentCard.module.scss";
import { documentPath } from "@/src/lib/document/paths";

const PAGE_SAMPLE_COUNT = 4;
const lechMau = (id: string) =>
  [...id].reduce((s, c) => s + c.charCodeAt(0), 0) % PAGE_SAMPLE_COUNT;

// Anh dau tien trong bai viet lam anh bia. May chu da loc chi con anh tren kho
// Cloudinary cua du an (xem filterExternalImages) - van kiem lai dung tien to cho chac.
const INLINE_IMAGE_PATTERN = /<img[^>]*\ssrc="(https:\/\/res\.cloudinary\.com\/[^"]+)"/i;

function coverImage(doc: DocumentSummary | SharedDocument): string {
  const description = "description" in doc ? doc.description : "";
  const m = description ? INLINE_IMAGE_PATTERN.exec(description) : null;
  return m ? m[1] : `/images/share-document/trang-${lechMau(doc._id) + 1}.svg`;
}

/**
 * The tai lieu dung - anh trang, so file, tieu de, loai + mon, va mot vien
 * thuoc tinh o chan (luot tai hoac thoi gian). Dung o cac hang cuon ngang va
 * luoi tai lieu o trang tat ca tai lieu.
 */
export default function DocumentCard({
  doc,
  chan: block = "luotTai",
}: {
  doc: DocumentSummary | SharedDocument;
  /** Vien chan the: luot tai (mac dinh), "x ngay truoc", hay luot xem + tai. */
  chan?: "luotTai" | "thoiGian" | "phoBien";
}) {
  const user = useStoredUser();
  const saved = useSaved("taiLieu", doc._id);
  const image = coverImage(doc);
  const isRealImage = !image.startsWith("/images/");

  const clickSave = () => {
    if (!user) {
      // Mo hop dang nhap ngay tren trang (AuthModalGate nghe ?auth).
      const u = new URL(window.location.href);
      u.searchParams.set("auth", "login");
      u.searchParams.set("vi", "luu");
      window.history.pushState(null, "", u.toString());
      return;
    }
    toggleSave("taiLieu", doc._id).catch(() => {});
  };

  return (
    <article className={styles.the}>
      <Link href={documentPath(doc._id)} className={styles.link}>
        <span className={styles.imageBackground}>
          <span
            className={`${styles.anh} ${isRealImage ? styles.realImage : ""}`}
            style={{ backgroundImage: `url("${image}")` }}
            aria-hidden
          />
          {doc.files.length > 0 && (
            <span className={styles.soFile} title={`${doc.files.length} file`}>
              {doc.files.length}
            </span>
          )}
        </span>
        <span className={styles.chi}>
          <span className={styles.tieuDe}>{doc.title}</span>
          <span className={styles.loai}>
            {formatLabel(doc.files)}
            {doc.monHoc?.[0] ? ` · ${doc.monHoc[0]}` : ""}
          </span>
          {/* "x phut truoc" tinh theo gio luc ve: server va trinh duyet co the
              lech nhau mot moc phut - khong phai loi. */}
          <span className={styles.vien} suppressHydrationWarning>
            {block === "phoBien" ? (
              <>
                <Eye size={13} aria-hidden />
                {doc.luotXem ?? 0}
                <Download size={13} aria-hidden className={styles.cach} />
                {doc.downloadCount}
                <span className={styles.hideText}> lượt xem, lượt tải</span>
              </>
            ) : block === "thoiGian" || doc.files.length === 0 ? (
              <>
                <CalendarDays size={13} aria-hidden />
                {relativeTime(doc.createdAt)}
              </>
            ) : (
              <>
                <Download size={13} aria-hidden />
                {doc.downloadCount} lượt tải
              </>
            )}
          </span>
        </span>
      </Link>

      {/* Nut dat NGOAI the <a>: nut long trong lien ket la HTML sai. */}
      <button
        type="button"
        onClick={clickSave}
        aria-pressed={saved}
        aria-label={saved ? `Bỏ lưu ${doc.title}` : `Lưu ${doc.title}`}
        title={saved ? "Bỏ lưu" : "Lưu"}
        className={`${styles.saveButton} ${saved ? styles.activeSaveButton : ""}`}
      >
        <Bookmark size={15} />
      </button>
    </article>
  );
}
