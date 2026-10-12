import styles from "../CourseLearn.module.scss";

/** Khung xam trong luc tai phong hoc. */
export default function CourseLearnSkeleton() {
  return (
    <div className={styles.col}>
      {/* SKELETON HEADER */}
      <header className={styles.header}>
        <div className={styles.row}>
          <div className={styles.box}></div>
          <div className={styles.stack}>
            <div className={styles.box2}></div>
            <div className={styles.box3}></div>
          </div>
        </div>
        <div className={styles.box4}></div>
      </header>

      {/* SKELETON CONTENT */}
      <div className={styles.grid}>
        {/* VIEW TRÁI: VIDEO SKELETON */}
        <div className={styles.col2}>
          <div className={styles.card}></div>
          <div className={styles.card2}>
            <div className={styles.stack2}>
              <div className={styles.box5}></div>
              <div className={styles.box6}></div>
              <div className={styles.box3}></div>
            </div>
            <div className={styles.box7}></div>
          </div>
        </div>

        {/* VIEW PHẢI: MENU LESSONS SKELETON */}
        <div className={styles.col3}>
          <div className={styles.row2}>
            <div className={styles.box8}></div>
            <div className={styles.box9}></div>
          </div>
          <div className={styles.stack3}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={styles.row3}>
                <div className={styles.box10}></div>
                <div className={styles.stack}>
                  <div className={styles.box11}></div>
                  <div className={styles.box12}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
