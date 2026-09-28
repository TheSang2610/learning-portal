"use client";

import Link from "next/link";
import { Bookmark, CalendarDays, Download, Eye, Trash2 } from "lucide-react";

import { thoiGianTuongDoi } from "@/src/components/common/time";
import { doiLuu, useDaLuu } from "@/src/hooks/savedStore";
import { useNguoiDungLuu } from "@/src/hooks/userStore";
import type { DocumentSummary, SharedDocument } from "@/src/services/document";
import { nhanDinhDang } from "./fileInfo";

import styles from "./TheTaiLieuDoc.module.scss";
import { duongTaiLieu } from "./duongDan";

const SO_MAU_TRANG = 4;
const lechMau = (id: string) =>
  [...id].reduce((s, c) => s + c.charCodeAt(0), 0) % SO_MAU_TRANG;

// Anh dau tien trong bai viet lam anh bia. May chu da loc chi con anh tren kho
// Cloudinary cua du an (xem locAnhNgoai) - van kiem lai dung tien to cho chac.
const ANH_TRONG_BAI = /<img[^>]*\ssrc="(https:\/\/res\.cloudinary\.com\/[^"]+)"/i;

function anhBia(doc: DocumentSummary | SharedDocument): string {
  const moTa = "description" in doc ? doc.description : "";
  const m = moTa ? ANH_TRONG_BAI.exec(moTa) : null;
  return m ? m[1] : `/images/share-document/trang-${lechMau(doc._id) + 1}.svg`;
}

/**
 * The tai lieu dung - anh trang, so file, tieu de, loai + mon, va mot vien
 * thuoc tinh o chan (luot tai hoac thoi gian). Dung o cac hang cuon ngang va
 * luoi tai lieu o trang tat ca tai lieu.
 */
export default function TheTaiLieuDoc({
  doc,
  chan = "luotTai",
  khiXoa,
}: {
  doc: DocumentSummary | SharedDocument;
  /** Vien chan the: luot tai (mac dinh), "x ngay truoc", hay luot xem + tai. */
  chan?: "luotTai" | "thoiGian" | "phoBien";
  /** Co thi hien nut xoa (chu bai / admin). */
  khiXoa?: () => void;
}) {
  const user = useNguoiDungLuu();
  const daLuu = useDaLuu("taiLieu", doc._id);
  const anh = anhBia(doc);
  const laAnhThat = !anh.startsWith("/images/");

  const bamLuu = () => {
    if (!user) {
      // Mo hop dang nhap ngay tren trang (AuthModalGate nghe ?auth).
      const u = new URL(window.location.href);
      u.searchParams.set("auth", "login");
      u.searchParams.set("vi", "luu");
      window.history.pushState(null, "", u.toString());
      return;
    }
    doiLuu("taiLieu", doc._id).catch(() => {});
  };

  return (
    <article className={styles.the}>
      <Link href={duongTaiLieu(doc._id)} className={styles.lienKet}>
        <span className={styles.nenAnh}>
          <span
            className={`${styles.anh} ${laAnhThat ? styles.anhThat : ""}`}
            style={{ backgroundImage: `url("${anh}")` }}
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
            {nhanDinhDang(doc.files)}
            {doc.monHoc?.[0] ? ` · ${doc.monHoc[0]}` : ""}
          </span>
          {/* "x phut truoc" tinh theo gio luc ve: server va trinh duyet co the
              lech nhau mot moc phut - khong phai loi. */}
          <span className={styles.vien} suppressHydrationWarning>
            {chan === "phoBien" ? (
              <>
                <Eye size={13} aria-hidden />
                {doc.luotXem ?? 0}
                <Download size={13} aria-hidden className={styles.cach} />
                {doc.downloadCount}
                <span className={styles.anChu}> lượt xem, lượt tải</span>
              </>
            ) : chan === "thoiGian" || doc.files.length === 0 ? (
              <>
                <CalendarDays size={13} aria-hidden />
                {thoiGianTuongDoi(doc.createdAt)}
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
        onClick={bamLuu}
        aria-pressed={daLuu}
        aria-label={daLuu ? `Bỏ lưu ${doc.title}` : `Lưu ${doc.title}`}
        title={daLuu ? "Bỏ lưu" : "Lưu"}
        className={`${styles.nutLuu} ${daLuu ? styles.nutLuuOn : ""}`}
      >
        <Bookmark size={15} />
      </button>
      {khiXoa && (
        <button
          type="button"
          onClick={khiXoa}
          aria-label={`Xóa ${doc.title}`}
          title="Xóa tài liệu"
          className={styles.nutXoa}
        >
          <Trash2 size={15} />
        </button>
      )}
    </article>
  );
}
