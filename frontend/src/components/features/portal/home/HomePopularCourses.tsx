"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { fillTemplate } from "@/src/lib/format";
import { getHomeSections, Course } from "@/src/services/course";
import type { HomePopularCoursesData } from "@/src/types/home";

import CourseListCard from "./parts/CourseListCard";
import styles from "./HomePopularCourses.module.scss";
export interface HomeSectionsState {
  mostPopular: Course[];
  trendingNow: Course[];
  newReleases: Course[];
}

// ==========================================
// SKELETON LOADING COMPONENT (LIGHT MODE)
// ==========================================
function PopularCoursesSkeleton() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* Tiêu đề & mô tả giả lập */}
        <div className={styles.stack}>
          <div className={styles.box}></div>
          <div className={styles.box2}></div>
        </div>

        {/* Khung lưới Grid 3 cột tương thích layout thực tế */}
        <div className={styles.grid}>
          {[1, 2, 3].map((colIndex) => (
            <div key={colIndex} className={styles.card}>
              {/* Header cột giả lập */}
              <div className={styles.box3}></div>

              {/* Danh sách các thẻ bài học dọc bên trong */}
              <div className={styles.col}>
                {[1, 2, 3].map((cardIndex) => (
                  <div key={cardIndex} className={styles.card2}>
                    {/* Trái: Ảnh Thumbnail giả lập */}
                    <div className={styles.box4}></div>

                    {/* Phải: Thông tin chi tiết */}
                    <div className={styles.col2}>
                      <div className={styles.stack}>
                        {/* Hàng logo đối tác / Tổ chức cấp phát */}
                        <div className={styles.row}>
                          <div className={styles.box5}></div>
                          <div className={styles.box6}></div>
                        </div>
                        {/* Tiêu đề khóa học (2 dòng giả lập lệch chiều dài) */}
                        <div className={styles.box7}></div>
                        <div className={styles.box8}></div>
                      </div>

                      {/* Hàng Badge cấp độ, số bài học và giá tiền */}
                      <div className={styles.row2}>
                        <div className={styles.box9}></div>
                        <div className={styles.box10}></div>
                        <div className={styles.box11}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==========================================
// MAIN COMPONENT: POPULAR COURSES SECTION
// ==========================================
interface Props extends HomePopularCoursesData {
  /**
   * Du lieu lay san tu may chu (xem app/(portal)/page.tsx).
   *
   * Co san thi KHONG goi API luc mount nua: noi dung nam thang trong HTML,
   * nguoi dung khong phai nhin khung xam, va may tim kiem doc duoc.
   * Bo trong thi component tu goi nhu cu - de con dung lai duoc o cho khac.
   */
  initialData?: HomeSectionsState | null;
  /** Cot nao dang bat (admin chinh o /admin/appearance). Bo trong = bat het. */
  visible?: Partial<Record<keyof HomeSectionsState, boolean>>;
}

export default function HomePopularCourses({
  initialData,
  visible,
  heading,
  description,
  empty,
  columns,
  collectionHref,
  courseHref,
  lessons,
  free,
}: Props) {
  const [sections, setSections] = useState<HomeSectionsState>(
    initialData ?? { mostPopular: [], trendingNow: [], newReleases: [] },
  );

  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    if (initialData) return;

    getHomeSections()
      .then((response) => {
        if (response?.success && response.data) {
          setSections({
            mostPopular: response.data.mostPopular || [],
            trendingNow: response.data.trendingNow || [],
            newReleases: response.data.newReleases || [],
          });
        }
      })
      .catch((error) =>
        console.error("Lỗi khi load danh sách cấu trúc trang chủ:", error),
      )
      .finally(() => setLoading(false));
  }, [initialData]);

  // Thay thế vòng xoay Loading bằng Component Skeleton thông minh
  if (loading) {
    return <PopularCoursesSkeleton />;
  }

  // Cot admin tat thi bo han; tat ca deu tat thi an ca muc.
  const categoriesColumns = columns
    .filter((c) => visible?.[c.key] !== false)
    .map((c) => ({ ...c, data: sections[c.key] }));
  if (categoriesColumns.length === 0) return null;

  const hasData = categoriesColumns.some((col) => col.data.length > 0);

  return (
    <section className={styles.section2}>
      <div className={styles.container}>
        {/* TITLE */}
        <div>
          <h2 className={styles.heading}>{heading}</h2>
          <p className={styles.text}>{description}</p>
        </div>

        {!hasData ? (
          <div className={styles.card3}>{empty}</div>
        ) : (
          /* 3 COLUMNS GRID CONTAINER */
          <div
            className={styles.grid}
            style={{ "--cols": categoriesColumns.length } as React.CSSProperties}
          >
            {categoriesColumns.map((column) => {
              if (column.data.length === 0) return null;

              return (
                <div key={column.id} className={styles.col3}>
                  {/* CATEGORY HEADER */}
                  <Link
                    href={fillTemplate(collectionHref, { id: column.id })}
                    className={`group/title ${styles.box12}`}
                  >
                    {column.title}
                    <ArrowRight size={16} className={styles.box13} />
                  </Link>

                  {/* COURSE LIST (VERTICAL) - cung kieu the voi "Tiep tuc kham pha". */}
                  <ul className={styles.list}>
                    {column.data.map((course, i) => (
                      <CourseListCard
                        key={course._id}
                        course={course}
                        href={fillTemplate(courseHref, { slug: course.slug })}
                        index={i}
                        labels={{ free, lessons }}
                      />
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
