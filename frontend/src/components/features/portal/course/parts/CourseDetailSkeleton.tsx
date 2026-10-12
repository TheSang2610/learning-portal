import styles from "../CourseDetail.module.scss";

/** Khung xam trong luc tai khoa hoc (hoac dang nhay sang /learn). */
export default function CourseDetailSkeleton() {
  return (
    <div className={styles.page}>
      {/* 1. Hero Banner Skeleton */}
      <div className={styles.box}>
        <div className={styles.container}>
          <div className={styles.stack}>
            <div className={styles.box2}></div>
            <div className={styles.stack2}>
              <div className={styles.box3}></div>
              <div className={styles.box4}></div>
              <div className={styles.box5}></div>
            </div>
            <div className={styles.row}>
              <div className={styles.box6}></div>
              <div className={styles.box6}></div>
            </div>
            <div className={styles.row2}>
              <div className={styles.box7}></div>
              <div className={styles.box8}></div>
            </div>
          </div>
          <div className={styles.box9}></div>
        </div>
      </div>

      {/* 2. Sticky Sub-Navbar Skeleton */}
      <div className={styles.box10}>
        <div className={styles.container2}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.box11}></div>
          ))}
        </div>
      </div>

      {/* 3. Main Content Skeleton */}
      <div className={styles.container3}>
        {/* Grid 4 thông số */}
        <div className={styles.card}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.stack3}>
              <div className={styles.box12}></div>
              <div className={styles.box2}></div>
            </div>
          ))}
        </div>

        {/* Cột trái & Cột phải */}
        <div className={styles.grid}>
          {/* Cột trái (70%) */}
          <div className={styles.stack4}>
            {/* Về khóa học */}
            <div className={styles.stack5}>
              <div className={styles.box13}></div>
              <div className={styles.stack3}>
                <div className={styles.box4}></div>
                <div className={styles.box4}></div>
                <div className={styles.box14}></div>
              </div>
            </div>

            {/* Chương trình học */}
            <div className={styles.stack5}>
              <div className={styles.box15}></div>
              <div className={styles.box16}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className={styles.row3}>
                    <div className={styles.row4}>
                      <div className={styles.box17}></div>
                      <div className={styles.box4}></div>
                    </div>
                    <div className={styles.box18}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cột phải (30%) */}
          <div className={styles.stack6}>
            <div className={styles.card2}>
              <div className={styles.stack3}>
                <div className={styles.box19}></div>
                <div className={styles.box20}></div>
              </div>
              <div className={styles.box21}></div>
              <div className={styles.stack7}>
                <div className={styles.box22}></div>
                <div className={styles.box5}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
