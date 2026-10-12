"use client";

import { INSTRUCTOR_COURSE_CREATE as C } from "@/src/constants/instructor/course-create-page";

import { useInstructorCourseCreate } from "./hooks/useInstructorCourseCreate";
import CategoryPicker from "./parts/CategoryPicker";
import CourseCreateHeader from "./parts/CourseCreateHeader";
import DescriptionField from "./parts/DescriptionField";
import PriceLevelFields from "./parts/PriceLevelFields";
import ProviderSelect from "./parts/ProviderSelect";
import SubmitBar from "./parts/SubmitBar";
import ThumbnailField from "./parts/ThumbnailField";
import TitleSlugFields from "./parts/TitleSlugFields";
import styles from "./InstructorCourseCreate.module.scss";

/**
 * Trang /instructor/course-create - buoc 1 tao khoa hoc cua giang vien.
 * Logic nam o hook, chu nam o constants, moi khoi giao dien la mot part.
 */
export default function InstructorCourseCreate() {
  const f = useInstructorCourseCreate();

  if (f.loadingMetadata) {
    return <div className={styles.box}>{C.loading}</div>;
  }

  return (
    <div className={styles.container}>
      <CourseCreateHeader />

      <form onSubmit={f.handleSubmit} className={styles.form}>
        <ThumbnailField previewUrl={f.previewUrl} onChange={f.handleFileChange} />
        <TitleSlugFields
          title={f.formData.title}
          slug={f.formData.slug}
          onTitleChange={f.handleTitleChange}
          onSlugChange={f.handleSlugChange}
        />
        <PriceLevelFields
          price={f.formData.price}
          level={f.formData.level}
          onChange={f.handleInputChange}
        />
        <ProviderSelect
          providers={f.providers}
          value={f.formData.providerId}
          onChange={f.handleInputChange}
        />
        <DescriptionField value={f.formData.description} onChange={f.handleInputChange} />
        <CategoryPicker
          categories={f.categories}
          selected={f.formData.category}
          onToggle={f.handleCategoryToggle}
        />
        <SubmitBar loading={f.loading} />
      </form>
    </div>
  );
}
