import { Gift, Search } from "lucide-react";

import { ADMIN_ENROLLMENTS as C } from "@/src/constants/admin/enrollments-page";
import type { Course } from "@/src/services/course";

import { useGiftCourse } from "../hooks/useGiftCourse";
import styles from "../AdminEnrollments.module.scss";

interface GiftCourseCardProps {
  courses: Course[];
  onGifted: () => void;
}

/** The tang khoa hoc: tim hoc vien, chon khoa, bam tang. */
export default function GiftCourseCard({ courses, onGifted }: GiftCourseCardProps) {
  const g = useGiftCourse(onGifted);

  return (
    <section className={styles.giftCard}>
      <div className={styles.giftHead}>
        <Gift size={18} className={styles.giftIcon} />
        <h2 className={styles.giftTitle}>{C.gift.heading}</h2>
      </div>
      <p className={styles.giftHint}>{C.gift.hint}</p>

      <div className={styles.giftRow}>
        <div className={styles.giftPicker}>
          {g.student ? (
            <div className={styles.giftChip}>
              <span className={styles.giftChipText}>
                <b>{g.student.name}</b> · {g.student.email}
              </span>
              <button type="button" onClick={g.clearStudent} className={styles.giftLink}>
                {C.gift.change}
              </button>
            </div>
          ) : (
            <>
              <div className={styles.giftSearch}>
                <Search size={16} className={styles.giftSearchIcon} />
                <input
                  value={g.search}
                  onChange={(e) => g.setSearch(e.target.value)}
                  placeholder={C.gift.searchPlaceholder}
                  className={`${styles.box5} ${styles.giftInput}`}
                />
              </div>
              {g.search.trim() && (
                <div className={styles.giftList}>
                  {g.searching && g.results.length === 0 ? (
                    <p className={styles.giftEmpty}>{C.gift.searching}</p>
                  ) : g.results.length === 0 ? (
                    <p className={styles.giftEmpty}>{C.gift.noMatch}</p>
                  ) : (
                    g.results.map((u) => (
                      <button
                        key={u._id}
                        type="button"
                        onClick={() => g.pick(u)}
                        className={styles.giftItem}
                      >
                        <b>{u.name}</b>
                        <span>{u.email}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <select
          value={g.courseId}
          onChange={(e) => g.setCourseId(e.target.value)}
          className={`${styles.box5} ${styles.select}`}
        >
          <option value="">{C.gift.chooseCourse}</option>
          {courses.map((c) => (
            <option key={c._id} value={c._id}>
              {c.title}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={g.send}
          disabled={!g.student || !g.courseId || g.sending}
          className={styles.giftButton}
        >
          {g.sending ? C.gift.busy : C.gift.submit}
        </button>
      </div>

      {g.message && (
        <p className={g.message.ok ? styles.giftOk : styles.giftError}>
          {g.message.text}
        </p>
      )}
    </section>
  );
}
