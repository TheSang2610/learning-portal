"use client";

import { Suspense } from "react";

import { INSTRUCTOR_COURSE_DETAIL as C } from "@/src/constants/instructor/course-detail-page";

import { useInstructorCourseDetail } from "./hooks/useInstructorCourseDetail";
import CategoryTags from "./parts/CategoryTags";
import CourseDetailActions from "./parts/CourseDetailActions";
import CourseDetailHeader from "./parts/CourseDetailHeader";
import CourseInfoFields from "./parts/CourseInfoFields";
import ThumbnailUpload from "./parts/ThumbnailUpload";
import styles from "./InstructorCourseDetail.module.scss";

function InstructorCourseDetailContent() {
  const f = useInstructorCourseDetail();

  if (f.loading) return <div className={styles.box}>{C.loading}</div>;

  return (
    <div className={styles.container}>
      <CourseDetailHeader isPublished={f.isPublished} />

      <div className={styles.card3}>
        <form onSubmit={f.updateCourseHandler} className={styles.form}>
          <ThumbnailUpload previewUrl={f.previewUrl} onChange={f.handleFileChange} />
          <CourseInfoFields
            formData={f.formData}
            providers={f.providers}
            onChange={f.changeHandler}
          />
          <CategoryTags
            categories={f.categories}
            selected={f.formData.category}
            onToggle={f.handleCategoryToggle}
          />
          <CourseDetailActions courseId={f.courseId} />
        </form>
      </div>
    </div>
  );
}

/**
 * Trang /instructor/course-detail?courseId=...
 *
 * useSearchParams() phai nam trong Suspense thi Next moi prerender tinh duoc.
 * Co boundary -> khung trang di tu CDN, khong ton mot lan chay serverless moi luot xem.
 */
export default function InstructorCourseDetail() {
  return (
    <Suspense
      fallback={
        <div className={styles.row}>
          <div className={styles.spinner} />
        </div>
      }
    >
      <InstructorCourseDetailContent />
    </Suspense>
  );
}
