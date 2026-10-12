import { Suspense } from "react";

import CourseSearchClient from "@/src/components/features/portal/courses/parts/CourseSearchClient";
import { filterPublished } from "@/src/lib/filter-courses";
import { COURSES_PAGE as C } from "@/src/constants/portal/courses-page";
import type { Category } from "@/src/services/categoryService";
import { fetchFromServer } from "@/src/services/serverFetch";

import styles from "./CourseSearchPage.module.scss";

/** Trang /courses: server lay san du lieu, trinh duyet loc theo ?search= / ?category=. */
export default async function CourseSearchPage() {
  // Lay ca danh sach mot lan o may chu. Phep loc theo ?search= va ?category=
  // lam o phia trinh duyet tren chinh danh sach nay, nen doi tu khoa khong
  // sinh them luot mang nao.
  const [coursesRes, categories] = await Promise.all([
    fetchFromServer<unknown>(C.coursesApi, []),
    fetchFromServer<Category[]>(C.categoriesApi, []),
  ]);

  const course = filterPublished(coursesRes);

  return (
    // useSearchParams() ben trong bat buoc phai co Suspense, neu khong ca
    // trang mat kha nang prerender tinh.
    <Suspense
      fallback={
        <div className={styles.page}>
          <div className={styles.spinner} />
        </div>
      }
    >
      <CourseSearchClient
        // Rong -> null de trinh duyet tu goi lai, xem ghi chu trong component.
        initialCourses={course.length ? course : null}
        initialCategories={categories.length ? categories : null}
      />
    </Suspense>
  );
}
