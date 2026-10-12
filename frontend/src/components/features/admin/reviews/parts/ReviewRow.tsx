import { BookOpen, CheckCircle, Edit3, Star, Trash2, User } from "lucide-react";

import { ADMIN_REVIEWS as C } from "@/src/constants/admin/reviews-page";
import type { Review } from "@/src/services/review";

import styles from "../AdminReviews.module.scss";

interface ReviewRowProps {
  review: Review;
  deleting: boolean;
  onEdit: (review: Review) => void;
  onDelete: (reviewId: string) => void;
}

/** Mot danh gia: hoc vien + ngay, khoa, so sao, binh luan, luot huu ich, thao tac. */
export default function ReviewRow({
  review,
  deleting,
  onEdit,
  onDelete,
}: ReviewRowProps) {
  const studentName = review.student?.name || C.row.anonymous;
  // review.course la ObjectId dang chuoi khi khong duoc populate.
  const courseTitle =
    (typeof review.course === "object" ? review.course?.title : "") ||
    C.row.courseFallback;
  const day = new Date(review.createdAt);

  return (
    <tr className={styles.row3}>
      <td className={styles.headCell4}>
        <div className={styles.stack3}>
          <div className={styles.row4}>
            <User size={14} className={styles.box2} />
            <span className={styles.label}>{studentName}</span>
          </div>
          <p className={styles.text3}>
            {day.toLocaleDateString("vi-VN")} {C.row.at}{" "}
            {day.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </td>

      <td className={styles.headCell4}>
        <div className={styles.row5}>
          <BookOpen size={14} className={styles.box3} />
          <span className={styles.label2}>{courseTitle}</span>
        </div>
      </td>

      <td className={styles.headCell4}>
        <div className={styles.stack3}>
          <div className={styles.row6}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                fill={i < review.rating ? "currentColor" : "none"}
              />
            ))}
          </div>
          {review.isVerifiedPurchase && (
            <span className={styles.card2}>
              <CheckCircle size={9} /> {C.row.verified}
            </span>
          )}
        </div>
      </td>

      <td className={styles.headCell4}>
        <p className={styles.text4}>&quot;{review.comment}&quot;</p>
      </td>

      <td className={styles.cell}>
        <span className={styles.label3}>{C.row.helpful(review.helpful || 0)}</span>
      </td>

      <td className={styles.cell}>
        <div className={styles.row7}>
          <button
            onClick={() => onEdit(review)}
            className={styles.button3}
            title={C.row.editTitle}
          >
            <Edit3 size={15} /> {C.row.edit}
          </button>
          <button
            disabled={deleting}
            onClick={() => onDelete(review._id)}
            className={styles.button4}
            title={C.row.deleteTitle}
          >
            <Trash2 size={15} /> {C.row.delete}
          </button>
        </div>
      </td>
    </tr>
  );
}
