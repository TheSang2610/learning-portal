import { Suspense } from "react";

import { ListingExtras } from "@/src/components/features/portal/course-listing";
import CourseSearchClient from "@/src/components/features/portal/courses/parts/CourseSearchClient";
import { getHomeData } from "@/src/components/features/portal/home";

import styles from "./CourseSearchPage.module.scss";

/**
 * Trang /courses: dai dau (tim kiem, so lieu, chip danh muc) + luoi khoa hoc,
 * roi cac muc kham pha them: moi va pho bien, don vi dao tao, cam nang / tai
 * lieu, FAQ.
 *
 * Du lieu dung chung getHomeData (fetch dem 60 giay) - cung danh sach khoa
 * hoc, danh muc va so dem ma trang chu dung, khong goi rieng lan nua.
 */
export default async function CourseSearchPage() {
  const d = await getHomeData();
  const courses = d.publishedCourses ?? [];

  return (
    <>
      {/* useSearchParams() ben trong bat buoc phai co Suspense, neu khong ca
          trang mat kha nang prerender tinh. */}
      <Suspense
        fallback={
          <div className={styles.page}>
            <div className={styles.spinner} />
          </div>
        }
      >
        <CourseSearchClient
          // Rong -> null de trinh duyet tu goi lai, xem ghi chu trong component.
          initialCourses={courses.length ? courses : null}
          initialCategories={d.categories}
          countByCategory={d.courseCountByCategory}
          stats={
            courses.length
              ? {
                  courses: d.courseCount,
                  free: d.freeCourseCount,
                  providers: d.unit.length,
                }
              : null
          }
        />
      </Suspense>

      <ListingExtras d={d} />
    </>
  );
}
