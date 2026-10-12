import Link from "next/link";
import { Eye, ImageOff, PenLine, Trash2 } from "lucide-react";

import SafeImage from "@/src/components/ui/SafeImage";
import { ADMIN_POSTS as C } from "@/src/constants/admin/posts-page";
import type { BlogPost } from "@/src/services/post";

import styles from "../AdminPosts.module.scss";

interface PostCardProps {
  p: BlogPost;
  topicName: string;
  onDelete: (p: BlogPost) => void;
}

/** Mot bai viet: anh, trang thai, chu de, tom tat, tac gia, ngay, luot xem, thao tac. */
export default function PostCard({ p, topicName, onDelete }: PostCardProps) {
  const draft = p.isPublished === false;

  return (
    <div className={styles.card6}>
      <div className={styles.box4}>
        {p.thumbnail ? (
          <SafeImage
            src={p.thumbnail}
            alt=""
            fill
            sizes="120px"
            className={styles.box5}
          />
        ) : (
          <div className={styles.row2}>
            <ImageOff size={20} />
          </div>
        )}
      </div>

      <div className={styles.box6}>
        <div className={styles.row3}>
          <span className={`${styles.label7} ${draft ? styles.label2 : styles.label3}`}>
            {draft ? C.card.draft : C.card.published}
          </span>
          <span className={styles.label4}>{topicName}</span>
        </div>

        <h4 className={styles.minorHeading}>{p.title}</h4>
        <p className={styles.text7}>{p.excerpt}</p>

        <div className={styles.row4}>
          <span>{p.author?.name || C.card.anonymous}</span>
          <span>
            {new Date(p.createdAt).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </span>
          <span className={styles.label5}>
            <Eye size={13} />
            {C.card.views(p.views)}
          </span>
        </div>
      </div>

      <div className={styles.row5}>
        {!draft && (
          <Link
            href={C.viewHref(p.slug)}
            target="_blank"
            title={C.card.viewTitle}
            className={styles.box7}
          >
            <Eye size={18} />
          </Link>
        )}
        <Link href={C.editHref(p._id)} title={C.card.editTitle} className={styles.box8}>
          <PenLine size={18} />
        </Link>
        <button
          type="button"
          onClick={() => onDelete(p)}
          title={C.card.deleteTitle}
          className={styles.button2}
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
