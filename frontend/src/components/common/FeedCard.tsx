import Link from "next/link";
import { CircleCheck } from "lucide-react";
import SafeImage from "@/src/components/ui/SafeImage";
import Avatar from "@/src/components/ui/Avatar";
import CardActions, { type MenuItem } from "@/src/components/common/CardActions";
import type { SaveType } from "@/src/services/saved";
import { summaryHtml } from "@/src/lib/post-html";
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
  authorAvatar?: string | null;
  /** Dau tich xanh canh ten - danh cho giang vien / quan tri */
  verified?: boolean;
  tieuDe: string;
  /** Mo ta chu thuong (vd. excerpt cua blog). */
  moTa?: string;
  /**
   * Mo ta la HTML (vd. noi dung TipTap cua tai lieu). The hien doan tom tat
   * GIU in dam/nghieng - xem summaryHtml. Truyen cai nay thi bo qua `moTa`.
   */
  descriptionHtml?: string;
  /** Dong duoi cung: tag, thoi gian, so luot... */
  meta: ReactNode;
  anh?: { src: string; alt: string } | null;
  /** Muc rieng cua tung trang trong menu ba cham, vi du "Xoa" */
  addItem?: MenuItem[];
  /** Thu nut luu se luu vao trang ca nhan. Khong truyen thi an nut luu. */
  luu?: { loai: SaveType; id: string };
}

export default function FeedCard({
  href,
  tacGia: author,
  authorAvatar,
  verified = false,
  tieuDe: title,
  moTa: description,
  descriptionHtml,
  meta,
  anh: image,
  addItem,
  luu: save,
}: Props) {
  return (
    <article className={styles.article}>
      {/* Hang tac gia */}
      <div className={styles.row}>
        <div className={styles.row2}>
          <span
            aria-hidden
            className={`${styles.label3} ${verified ? styles.label : ""}`}
          >
            <Avatar
              src={authorAvatar}
              ten={author}
              size={28}
              letterBackground={styles.box7}
            />
          </span>

          <span className={styles.label2}>{author}</span>

          {verified && (
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
          <CardActions href={href} tieuDe={title} addItem={addItem} luu={save} />
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
              {title}
            </Link>
          </h2>

          {descriptionHtml ? (
            <p
              className={styles.text}
              // summaryHtml chi de lai 6 the dinh dang tran va doi moi "<" con
              // lai thanh &lt; - khong chen duoc the nao khac. Xem ham do.
              dangerouslySetInnerHTML={{ __html: summaryHtml(descriptionHtml) }}
            />
          ) : (
            description && <p className={styles.text}>{description}</p>
          )}

          <div className={styles.row4}>{meta}</div>
        </div>

        {image && (
          <Link href={href} tabIndex={-1} aria-hidden className={styles.box5}>
            <SafeImage
              src={image.src}
              alt={image.alt}
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
