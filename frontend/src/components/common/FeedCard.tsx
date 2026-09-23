import Link from "next/link";
import { CircleCheck } from "lucide-react";
import SafeImage from "@/src/components/ui/SafeImage";
import AnhDaiDien from "@/src/components/ui/Avatar";
import CardActions, { type MucMenu } from "@/src/components/common/CardActions";
import type { ReactNode } from "react";

import styles from "./FeedCard.module.scss";
// The dung chung cho danh sach bai viet (blog) va danh sach tai lieu chia se.
// Hai noi cung mot hinh dang: tac gia + nut luu / menu o hang tren, tieu de +
// mo ta + dong thong tin ben trai, anh xem truoc ben phai.
//
// Phan khac nhau (tag / dinh dang file / luot tai) truyen vao qua `meta`, nen
// khong phai nhoi them co dieu kien vao trong the.

interface Props {
  href: string;
  tacGia: string;
  anhTacGia?: string | null;
  /** Dau tich xanh canh ten - danh cho giang vien / quan tri */
  daXacThuc?: boolean;
  tieuDe: string;
  moTa: string;
  /** Dong duoi cung: tag, thoi gian, so luot... */
  meta: ReactNode;
  anh?: { src: string; alt: string } | null;
  /** Muc rieng cua tung trang trong menu ba cham, vi du "Xoa" */
  themMuc?: MucMenu[];
}

export default function FeedCard({
  href,
  tacGia,
  anhTacGia,
  daXacThuc = false,
  tieuDe,
  moTa,
  meta,
  anh,
  themMuc,
}: Props) {
  return (
    <article className={styles.article}>
      {/* Hang tac gia */}
      <div className={styles.row}>
        <div className={styles.row2}>
          <span
            aria-hidden
            className={`${styles.label3} ${daXacThuc ? styles.label : ""}`}
          >
            <AnhDaiDien src={anhTacGia} ten={tacGia} size={28} nenChuCai={styles.box7} />
          </span>

          <span className={styles.label2}>{tacGia}</span>

          {daXacThuc && (
            // fill + stroke trang: ra dung dau tich tron dac nhu ban mau,
            // thay vi vien rong mac dinh cua lucide.
            <CircleCheck
              size={15}
              className={styles.box}
              aria-label="Tài khoản đã xác thực"
            />
          )}
        </div>

        {/* Nam tren lop phu cua tieu de (z-10), neu khong thi bam nut lai
            dieu huong sang trang chi tiet. */}
        <div className={styles.box2}>
          <CardActions href={href} tieuDe={tieuDe} themMuc={themMuc} />
        </div>
      </div>

      {/* Than the */}
      <div className={styles.row3}>
        <div className={styles.box3}>
          {/* Neo that nam o tieu de - nguoi dung ban phim tab toi day, bo doc
              man hinh doc ra ten bai thay vi "lien ket". Lop phu tuyet doi cho
              phep bam vao cho trong cua the. */}
          <h2 className={styles.heading}>
            <Link href={href} className={styles.box4}>
              <span className={styles.floating} aria-hidden />
              {tieuDe}
            </Link>
          </h2>

          {moTa && <p className={styles.text}>{moTa}</p>}

          <div className={styles.row4}>{meta}</div>
        </div>

        {anh && (
          <Link href={href} tabIndex={-1} aria-hidden className={styles.box5}>
            <SafeImage
              src={anh.src}
              alt={anh.alt}
              fill
              sizes="196px"
              className={styles.box6}
            />
          </Link>
        )}
      </div>
    </article>
  );
}
