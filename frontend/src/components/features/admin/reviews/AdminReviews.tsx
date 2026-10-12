"use client";

import { MessageSquare, Plus, RefreshCw } from "lucide-react";

import { ADMIN_REVIEWS as C } from "@/src/constants/admin/reviews-page";

import { useAdminReviews } from "./hooks/useAdminReviews";
import ReviewModal from "./parts/ReviewModal";
import ReviewRow from "./parts/ReviewRow";
import styles from "./AdminReviews.module.scss";

/** Trang /admin/reviews - quan ly danh gia khoa hoc. */
export default function AdminReviews() {
  const s = useAdminReviews();

  return (
    <div className={styles.stack}>
      <div className={styles.col}>
        <div>
          <h1 className={styles.title}>
            <MessageSquare className={styles.box} size={24} />
            {C.title}
          </h1>
          <p className={styles.text}>{C.intro}</p>
        </div>

        <div className={styles.row}>
          <button onClick={s.fetchAllReviews} className={styles.button}>
            <RefreshCw size={14} className={s.loading ? styles.spinner : ""} />
            {C.refresh}
          </button>

          <button onClick={s.openCreateModal} className={styles.button2}>
            <Plus size={14} />
            {C.create}
          </button>
        </div>
      </div>

      <div className={styles.card}>
        {s.loading ? (
          <div className={styles.stack2}>
            <div className={styles.spinner2}></div>
            <p className={styles.text2}>{C.loading}</p>
          </div>
        ) : s.reviews.length > 0 ? (
          <div className={styles.scroller}>
            <table className={styles.table}>
              <thead>
                <tr className={styles.row2}>
                  <th className={styles.headCell}>{C.columns.student}</th>
                  <th className={styles.headCell2}>{C.columns.course}</th>
                  <th className={styles.headCell3}>{C.columns.rating}</th>
                  <th className={styles.headCell4}>{C.columns.comment}</th>
                  <th className={styles.headCell5}>{C.columns.helpful}</th>
                  <th className={styles.headCell6}>{C.columns.actions}</th>
                </tr>
              </thead>
              <tbody className={styles.tbody}>
                {s.reviews.map((review) => (
                  <ReviewRow
                    key={review._id}
                    review={review}
                    deleting={s.isDeleting === review._id}
                    onEdit={s.openUpdateModal}
                    onDelete={s.handleDeleteReview}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.stack4}>
            <MessageSquare size={36} className={styles.box4} />
            <p className={styles.text5}>{C.empty}</p>
          </div>
        )}
      </div>

      {s.isModalOpen && <ReviewModal s={s} />}
    </div>
  );
}
