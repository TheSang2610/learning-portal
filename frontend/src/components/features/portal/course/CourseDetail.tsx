"use client";

import { Suspense } from "react";

import CourseSuggestions from "@/src/components/common/CourseSuggestions";
import { COURSE_PAGE as C } from "@/src/constants/portal/course-page";

import { useCourseDetail } from "./hooks/useCourseDetail";
import { useCourseFaqs } from "./hooks/useCourseFaqs";
import { useCourseReviews } from "./hooks/useCourseReviews";
import CourseAbout from "./parts/CourseAbout";
import CourseCurriculum from "./parts/CourseCurriculum";
import CourseDetailSkeleton from "./parts/CourseDetailSkeleton";
import CourseFaqs from "./parts/CourseFaqs";
import CourseHero from "./parts/CourseHero";
import CourseHighlights from "./parts/CourseHighlights";
import CourseNotFound from "./parts/CourseNotFound";
import CoursePurchaseCard from "./parts/CoursePurchaseCard";
import CourseReviews from "./parts/CourseReviews";
import CourseSubNav from "./parts/CourseSubNav";
import styles from "./CourseDetail.module.scss";

function CourseDetailContent() {
  const s = useCourseDetail();
  const { course, router } = s;
  const r = useCourseReviews(course?._id);
  const f = useCourseFaqs(course?._id);

  if (s.loading || s.jumpingToLearn) {
    return <CourseDetailSkeleton />;
  }

  if (!course) {
    return <CourseNotFound error={s.error} onHome={() => router.push(C.homeHref)} />;
  }

  return (
    <div className={styles.page3}>
      <CourseHero
        course={course}
        courseSlug={s.courseSlug}
        stats={r.stats}
        isEnrolled={s.isEnrolled}
        submitting={s.submitting}
        onBack={() => router.back()}
        onMainAction={s.handleHeroClick}
      />

      <CourseSubNav />

      {/* 3. NỘI DUNG CHÍNH - 3 THÔNG SỐ SƠ LƯỢC KẾ HOẠCH */}
      <div className={styles.container3}>
        <CourseHighlights level={course.level} />

        {/* Bố cục Grid chính: Cột trái (70%) - Cột phải (30%) */}
        <div className={styles.grid}>
          {/* CỘT TRÁI CHỨA NỘI DUNG CHI TIẾT */}
          <div className={styles.stack4}>
            <CourseAbout description={course.description} />
            <CourseCurriculum lessons={course.lessons} />
            <CourseFaqs faqs={f.faqs} loadingFaqs={f.loadingFaqs} />
            <CourseReviews
              r={r}
              isEnrolled={s.isEnrolled}
              userProgress={s.userProgress}
            />
          </div>

          <CoursePurchaseCard s={s} course={course} />
        </div>
      </div>

      {/* Khoa lien quan, dat SAU phan danh gia - tuc la sau khi nguoi doc da
          xem het thong tin ve khoa nay. Dat truoc do la moi ho di cho khac
          trong khi chua quyet dinh gi ve khoa dang xem.

          Component tu an di khi khong co goi y nao. */}
      {course?._id && (
        <CourseSuggestions soLuong={C.suggestionsCount} courseId={course._id} />
      )}
    </div>
  );
}

// Suspense la bat buoc: useSearchParams() khong the prerender tinh neu thieu boundary.
// Co boundary thi Next dung san khung HTML, Vercel phuc vu tu CDN, khong ton serverless.
export default function CourseDetail() {
  return (
    <Suspense
      fallback={
        <div className={styles.page4}>
          <div className={styles.spinner2} />
        </div>
      }
    >
      <CourseDetailContent />
    </Suspense>
  );
}
