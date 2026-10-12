"use client";

import { Suspense } from "react";
import Link from "next/link";
import { LayoutGrid, Video } from "lucide-react";

import { ADMIN_COURSE_DETAIL as C } from "@/src/constants/admin/course-detail-page";

import { useAdminCourseDetail } from "./hooks/useAdminCourseDetail";
import CourseEditFields from "./parts/CourseEditFields";
import InstructorCategoryFields from "./parts/InstructorCategoryFields";
import PublishPanel from "./parts/PublishPanel";
import styles from "./AdminCourseDetail.module.scss";

function AdminCourseDetailContent() {
  const f = useAdminCourseDetail();

  if (f.loading) return <div className={styles.box}>{C.loading}</div>;

  return (
    <div className={styles.container}>
      <PublishPanel
        isAdmin={f.isAdmin}
        isPublished={f.isPublished}
        busy={f.publishingLoading}
        onToggle={f.togglePublishStatus}
      />

      <div className={styles.card3}>
        <h2 className={styles.heading}>
          <LayoutGrid size={18} className={styles.box4} />
          {C.sectionTitle}
        </h2>

        <form onSubmit={f.updateCourseHandler} className={styles.form}>
          <CourseEditFields
            formData={f.formData}
            previewUrl={f.previewUrl}
            providers={f.providers}
            onFile={f.handleFileChange}
            onTitle={f.handleTitleChange}
            onSlug={f.handleSlugChange}
            onChange={f.changeHandler}
          />
          <InstructorCategoryFields
            formData={f.formData}
            isAdmin={f.isAdmin}
            instructors={f.instructors}
            categories={f.categories}
            onChange={f.changeHandler}
            onToggleCategory={f.handleCategoryToggle}
          />

          <div className={styles.col2}>
            <button type="submit" className={styles.button6}>
              {C.actions.save}
            </button>

            <Link href={C.lessonsHref(f.courseId)} className={styles.card6}>
              <Video size={14} /> {C.actions.lessons}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Trang /admin/course-detail?courseId=...
 *
 * useSearchParams() phai nam trong Suspense thi Next moi prerender tinh duoc.
 * Co boundary -> khung trang di tu CDN, khong ton mot lan chay serverless moi luot xem.
 */
export default function AdminCourseDetail() {
  return (
    <Suspense
      fallback={
        <div className={styles.row}>
          <div className={styles.spinner} />
        </div>
      }
    >
      <AdminCourseDetailContent />
    </Suspense>
  );
}
