"use client";

import Link from "next/link";

import { ADMIN_COURSES as C } from "@/src/constants/admin/courses-page";

import { useAdminCourses } from "./hooks/useAdminCourses";
import AdminCourseRow from "./parts/AdminCourseRow";
import styles from "./AdminCourses.module.scss";

/** Trang /admin/courses - bang khoa hoc. */
export default function AdminCourses() {
  const { courses, loading, deletingId, handleDeleteCourse } = useAdminCourses();

  if (loading) {
    return <div className={styles.box}>{C.loading}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <div>
          <h1 className={styles.title}>{C.title}</h1>
          <p className={styles.text}>{C.subtitle}</p>
        </div>

        <Link href={C.createHref} className={styles.box2}>
          {C.create}
        </Link>
      </div>

      <div className={styles.box3}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              {C.columns.map((col) => (
                <th key={col} className={styles.headCell}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className={styles.tbody}>
            {courses.map((course) => (
              <AdminCourseRow
                key={course._id}
                course={course}
                deleting={deletingId === course._id}
                onDelete={handleDeleteCourse}
              />
            ))}

            {courses.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.cell6}>
                  {C.empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
