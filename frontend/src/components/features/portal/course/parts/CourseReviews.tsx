import { COURSE_PAGE as C } from "@/src/constants/portal/course-page";

import type { CourseReviewsState } from "../hooks/useCourseReviews";
import styles from "../CourseDetail.module.scss";
import ReviewForm from "./ReviewForm";
import ReviewList from "./ReviewList";
import ReviewSummary from "./ReviewSummary";

/* Tab 4: Reviews */
export default function CourseReviews({
  r,
  isEnrolled,
  userProgress,
}: {
  r: CourseReviewsState;
  isEnrolled: boolean;
  userProgress: number;
}) {
  const R = C.reviews;

  return (
    <section id="reviews" className={styles.section2}>
      <h2 className={styles.heading}>{R.heading}</h2>

      {r.stats && <ReviewSummary stats={r.stats} />}

      {isEnrolled && userProgress >= C.reviewMinProgress ? (
        <ReviewForm r={r} userProgress={userProgress} />
      ) : isEnrolled ? (
        <div className={styles.card9}>
          <p className={styles.text10}>
            {R.locked.a}
            <strong className={styles.strong2}>
              {R.locked.strong(C.reviewMinProgress)}
            </strong>
            {R.locked.b}
          </p>
          <p className={styles.text11}>{R.currentProgress(userProgress)}</p>
        </div>
      ) : null}

      <ReviewList
        reviews={r.reviews}
        loading={r.loadingReviews}
        onMarkHelpful={r.handleMarkHelpful}
      />
    </section>
  );
}
