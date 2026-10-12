import { Star, ThumbsUp } from "lucide-react";

import Avatar from "@/src/components/ui/Avatar";
import { COURSE_PAGE as C } from "@/src/constants/portal/course-page";
import type { Review } from "@/src/services/review";

import styles from "../CourseDetail.module.scss";

interface ReviewListProps {
  reviews: Review[];
  loading: boolean;
  onMarkHelpful: (reviewId: string) => void;
}

/* LIST HIỂN THỊ ĐÁNH GIÁ */
export default function ReviewList({ reviews, loading, onMarkHelpful }: ReviewListProps) {
  const R = C.reviews;

  return (
    <div className={styles.stack5}>
      {loading ? (
        <p className={styles.text12}>{R.loading}</p>
      ) : reviews.length > 0 ? (
        reviews.map((review) => (
          <div key={review._id} className={styles.card10}>
            <div className={styles.row17}>
              <div className={styles.row18}>
                <Avatar
                  src={review.student?.avatar}
                  ten={review.student?.name}
                  size={36}
                  letterBackground={styles.box46}
                />
                <div>
                  <p className={styles.text4}>{review.student?.name}</p>
                  <div className={styles.row19}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        fill={i < review.rating ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <span className={styles.label10}>
                {new Date(review.createdAt).toLocaleDateString("vi-VN")}
              </span>
            </div>

            <p className={styles.text13}>{review.comment}</p>

            <div className={styles.row20}>
              <button
                onClick={() => onMarkHelpful(review._id)}
                className={styles.button9}
              >
                <ThumbsUp size={13} />
                <span>{R.helpful(review.helpful)}</span>
              </button>
              {review.isVerifiedPurchase && (
                <span className={styles.card11}>{R.verified}</span>
              )}
            </div>
          </div>
        ))
      ) : (
        <p className={styles.text14}>{R.empty}</p>
      )}
    </div>
  );
}
