"use client";
import { useState, useEffect } from "react";
import { getErrorMessage } from "@/src/services/apiHelper";
import Link from "next/link";
import { Video, Trash2, Edit, HelpCircle } from "lucide-react"; // 🎯 Thêm HelpCircle
import { deleteCourseAdmin } from "@/src/services/adminService";
import { Course, getInstructorCourses } from "@/src/services/course";

import styles from "./page.module.scss";
export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getInstructorCourses();
        if (response && response.data) {
          setCourses(response.data);
        } else if (Array.isArray(response)) {
          setCourses(response);
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách khóa học quản trị:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleDeleteCourse = async (courseId: string, courseTitle: string) => {
    const isConfirmed = window.confirm(
      `⚠️ CẢNH BÁO NGUY HIỂM!\n\nBạn có chắc chắn muốn xóa khóa học: "${courseTitle}"?\nHành động này sẽ xóa toàn bộ bài học, bài tập trắc nghiệm (quiz) bên trong và KHÔNG THỂ HOÀN TÁC!`,
    );
    if (!isConfirmed) return;

    try {
      setDeletingId(courseId);
      await deleteCourseAdmin(courseId);
      alert("Xóa khóa học và toàn bộ dữ liệu liên quan thành công!");
      setCourses((prevCourses) => prevCourses.filter((c) => c._id !== courseId));
    } catch (error) {
      console.error("Lỗi khi xóa khóa học:", error);
      alert(
        getErrorMessage(
          error,
          "Không thể xóa khóa học. Vui lòng kiểm tra lại phân quyền Admin.",
        ),
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <div className={styles.box}>Loading courses...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <div>
          <h1 className={styles.title}>Courses</h1>
          <p className={styles.text}>Manage your LMS courses</p>
        </div>

        <Link href="/admin/course-create" className={styles.box2}>
          Create Course
        </Link>
      </div>

      <div className={styles.box3}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.headCell}>Title</th>
              <th className={styles.headCell}>Level</th>
              <th className={styles.headCell}>Price</th>
              <th className={styles.headCell}>Status</th>
              <th className={styles.headCell}>Actions</th>
            </tr>
          </thead>

          <tbody className={styles.tbody}>
            {courses.map((course) => (
              <tr key={course._id} className={styles.row2}>
                <td className={styles.cell}>{course.title}</td>
                <td className={styles.cell2}>
                  <span className={styles.label}>{course.level}</span>
                </td>
                <td className={styles.cell3}>
                  {(course.price ?? 0) === 0 ? (
                    <span className={styles.label2}>Miễn phí</span>
                  ) : (
                    `${(course.price ?? 0).toLocaleString("vi-VN")}đ`
                  )}
                </td>
                <td className={styles.cell4}>
                  <span
                    className={`${styles.label5} ${
                      course.isPublished ? styles.label3 : styles.label4
                    }`}
                  >
                    {course.isPublished ? "Published" : "Draft"}
                  </span>
                </td>

                <td className={styles.cell5}>
                  <Link
                    href={course._id ? `/admin/lessons?courseId=${course._id}` : "#"}
                    className={styles.box4}
                  >
                    <Video size={13} /> Bài học
                  </Link>

                  {/* 🎯 NÚT MỚI THÊM: Quản lý FAQ theo Course ID */}
                  <Link
                    href={course._id ? `/admin/course-faqs?courseId=${course._id}` : "#"}
                    className={styles.box5}
                  >
                    <HelpCircle size={13} /> Hỏi đáp
                  </Link>

                  <Link
                    href={
                      course._id ? `/admin/course-detail?courseId=${course._id}` : "#"
                    }
                    className={styles.box6}
                  >
                    <Edit size={13} /> Sửa
                  </Link>

                  <button
                    type="button"
                    disabled={deletingId === course._id}
                    onClick={() => handleDeleteCourse(course._id!, course.title)}
                    className={styles.button}
                  >
                    <Trash2 size={13} />
                    {deletingId === course._id ? "Đang xóa..." : "Xóa"}
                  </button>
                </td>
              </tr>
            ))}

            {courses.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.cell6}>
                  📭 Không tìm thấy khóa học nào trong hệ thống quản trị.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
