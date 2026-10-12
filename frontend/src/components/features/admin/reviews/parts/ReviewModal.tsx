import { Star, X } from "lucide-react";

import { ADMIN_REVIEWS as C } from "@/src/constants/admin/reviews-page";

import type { AdminReviewsState } from "../hooks/useAdminReviews";
import styles from "../AdminReviews.module.scss";

/** Hop tao (co o Course ID) / sua danh gia. */
export default function ReviewModal({ s }: { s: AdminReviewsState }) {
  const isCreate = s.modalMode === "create";

  return (
    <div className={styles.overlay}>
      <div className={styles.card3}>
        <div className={styles.row8}>
          <h3 className={styles.subheading}>
            {isCreate ? C.modal.createTitle : C.modal.editTitle}
          </h3>
          <button onClick={s.closeModal} className={styles.button5}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={s.handleFormSubmit} className={styles.form}>
          {isCreate && (
            <div className={styles.stack5}>
              <label className={styles.fieldLabel}>{C.modal.courseId}</label>
              <input
                type="text"
                required
                value={s.courseId}
                onChange={(e) => s.setCourseId(e.target.value)}
                placeholder={C.modal.courseIdPlaceholder}
                className={styles.input}
              />
            </div>
          )}

          <div className={styles.stack5}>
            <label className={styles.fieldLabel2}>{C.modal.rating}</label>
            <div className={styles.card4}>
              {C.stars.map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => s.setRating(star)}
                  className={styles.button6}
                >
                  <Star size={22} fill={star <= s.rating ? "currentColor" : "none"} />
                </button>
              ))}
              <span className={styles.label4}>{C.modal.ratingValue(s.rating)}</span>
            </div>
          </div>

          <div className={styles.stack5}>
            <label className={styles.fieldLabel}>{C.modal.comment}</label>
            <textarea
              required
              rows={4}
              value={s.comment}
              onChange={(e) => s.setComment(e.target.value)}
              placeholder={C.modal.commentPlaceholder}
              className={styles.textarea}
            />
          </div>

          <div className={styles.row9}>
            <button type="button" onClick={s.closeModal} className={styles.button7}>
              {C.modal.cancel}
            </button>
            <button type="submit" disabled={s.submitting} className={styles.button8}>
              {s.submitting ? C.modal.saving : C.modal.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
