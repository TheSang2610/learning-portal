import { Star } from "lucide-react";

import { COURSE_PAGE as C } from "@/src/constants/portal/course-page";

import type { CourseReviewsState } from "../hooks/useCourseReviews";
import styles from "../CourseDetail.module.scss";

/* KHU VỰC THÊM ĐÁNH GIÁ CỦA BẢN THÂN */
export default function ReviewForm({
  r,
  userProgress,
}: {
  r: CourseReviewsState;
  userProgress: number;
}) {
  const R = C.reviews;

  return (
    <div className={styles.card8}>
      <h4 className={styles.minorHeading}>
        <Star size={16} className={styles.box24} />
        {R.formTitle(userProgress)}
      </h4>

      <div className={styles.row15}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => r.setNewRating(star)}
            className={styles.button7}
          >
            <Star size={20} fill={star <= r.newRating ? "currentColor" : "none"} />
          </button>
        ))}
      </div>

      <div className={styles.stack2}>
        <textarea
          value={r.newComment}
          onChange={(e) => r.setNewComment(e.target.value)}
          placeholder={R.placeholder}
          className={styles.textarea}
        />
        <div className={styles.row16}>
          <button
            onClick={r.submitReview}
            disabled={r.isSubmittingReview}
            className={styles.button8}
          >
            {r.isSubmittingReview ? R.sending : R.submit}
          </button>
        </div>
      </div>
    </div>
  );
}
