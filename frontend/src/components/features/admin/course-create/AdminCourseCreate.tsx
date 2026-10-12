"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

import { ADMIN_COURSE_CREATE as C } from "@/src/constants/admin/course-create-page";

import { useAdminCourseCreate } from "./hooks/useAdminCourseCreate";
import AssignmentFields from "./parts/AssignmentFields";
import BasicInfoFields from "./parts/BasicInfoFields";
import ThumbnailPicker from "./parts/ThumbnailPicker";
import styles from "./AdminCourseCreate.module.scss";

/** Trang /admin/course-create. */
export default function AdminCourseCreate() {
  const f = useAdminCourseCreate();

  if (f.loadingData) {
    return <div className={styles.box}>{C.loading}</div>;
  }

  return (
    <div className={styles.container}>
      <Link href={C.listHref} className={styles.box2}>
        <ArrowLeft size={16} /> {C.back}
      </Link>

      <div>
        <h1 className={styles.title}>{C.title}</h1>
        <p className={styles.text}>{C.subtitle}</p>
      </div>

      <form onSubmit={f.submitHandler} className={styles.form}>
        <ThumbnailPicker preview={f.imagePreview} onChange={f.handleFileChange} />
        <BasicInfoFields
          formData={f.formData}
          onTitle={f.handleTitleChange}
          onSlug={f.handleSlugChange}
          onChange={f.changeHandler}
        />
        <AssignmentFields
          formData={f.formData}
          providers={f.providers}
          instructors={f.instructors}
          categories={f.categories}
          onChange={f.changeHandler}
          onToggleCategory={f.handleCategoryToggle}
        />

        <button
          disabled={f.loading}
          className={`${styles.button6} ${f.loading ? styles.button3 : styles.button4}`}
        >
          <Sparkles size={16} />
          {f.loading ? C.submit.busy : C.submit.idle}
        </button>
      </form>
    </div>
  );
}
