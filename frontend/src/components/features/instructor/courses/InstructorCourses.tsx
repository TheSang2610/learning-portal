"use client";

import { INSTRUCTOR_COURSES as C } from "@/src/constants/instructor/courses-page";

import { useInstructorCourses } from "./hooks/useInstructorCourses";
import CoursesEmpty from "./parts/CoursesEmpty";
import CoursesHeader from "./parts/CoursesHeader";
import InstructorCourseCard from "./parts/InstructorCourseCard";
import styles from "./InstructorCourses.module.scss";

/** Trang /instructor/courses - luoi khoa hoc cua giang vien. */
export default function InstructorCourses() {
  const { courses, loading } = useInstructorCourses();

  if (loading) {
    return <div className={styles.row}>{C.loading}</div>;
  }

  return (
    <div className={styles.stack}>
      <CoursesHeader />

      {courses.length === 0 ? (
        <CoursesEmpty />
      ) : (
        <div className={styles.grid}>
          {courses.map((course) => (
            <InstructorCourseCard key={course._id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
