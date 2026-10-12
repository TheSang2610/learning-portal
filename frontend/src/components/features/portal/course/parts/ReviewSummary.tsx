import { Star } from "lucide-react";

import { COURSE_PAGE as C } from "@/src/constants/portal/course-page";
import type { ReviewStats } from "@/src/services/review";

import styles from "../CourseDetail.module.scss";

/** Diem trung binh va phan bo so sao. */
export default function ReviewSummary({ stats }: { stats: ReviewStats }) {
  return (
    <div className={styles.card7}>
      <div className={styles.box39}>
        <p className={styles.text8}>{Number(stats.averageRating).toFixed(1)}</p>
        <div className={styles.row13}>
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={16}
              fill={i < Math.round(Number(stats.averageRating)) ? "currentColor" : "none"}
            />
          ))}
        </div>
        <p className={styles.text9}>{C.reviews.ratings(stats.totalReviews)}</p>
      </div>

      <div className={styles.stack9}>
        {Object.entries(stats.ratingDistribution)
          .reverse()
          .map(([star, count]) => (
            <div key={star} className={styles.row14}>
              <span className={styles.label8}>{star}</span>
              <Star size={12} fill="currentColor" className={styles.box40} />
              <div className={styles.box41}>
                <div
                  className={styles.box42}
                  style={{
                    width: `${stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0}%`,
                  }}
                ></div>
              </div>
              <span className={styles.label9}>{count}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
