"use client";

import { useEffect, useState } from "react";
import SafeImage from "@/src/components/ui/SafeImage";
import Link from "next/link";
import { getInstructorCourses, Course, tenChuDe } from "@/src/services/course";
import { Plus, BookOpen, User, Tag, ChevronRight } from "lucide-react";

import styles from "./page.module.scss";
export default function AllCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getInstructorCourses();
        if (response.success) {
          setCourses(response.data);
        }
      } catch (error) {
        console.error("Lỗi lấy khóa học:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return <div className={styles.row}>Đang tải danh sách khóa học của bạn...</div>;
  }

  return (
    <div className={styles.stack}>
      {/* HEADER DANH SÁCH */}
      <div className={styles.row2}>
        <div>
          <h3 className={styles.subheading}>Khóa học của tôi</h3>
          <p className={styles.text}>
            Quản lý và cập nhật nội dung các chương trình giảng dạy.
          </p>
        </div>
        {/* ✅ Đã sửa: text-black -> text-white tăng độ tương phản */}
        <Link href="/instructor/course-create" className={styles.card}>
          <Plus size={18} />
          Tạo khóa học mới
        </Link>
      </div>

      {/* ĐIỀU KIỆN RỖNG (EMPTY STATE) */}
      {courses.length === 0 ? (
        <div className={styles.container}>
          <div className={styles.row3}>
            <BookOpen size={24} />
          </div>
          <h4 className={styles.minorHeading}>Chưa có khóa học nào</h4>
          <p className={styles.text2}>
            Bạn chưa khởi tạo chương trình giảng dạy nào trên hệ thống LMS.
          </p>
          <Link href="/instructor/course-create" className={styles.box}>
            Bắt đầu tạo khóa học đầu tiên <ChevronRight size={16} />
          </Link>
        </div>
      ) : (
        /* GRID KHÓA HỌC */
        <div className={styles.grid}>
          {courses.map((course) => (
            <div key={course._id} className={`group ${styles.card2}`}>
              {/* THUMBNAIL */}
              <div className={styles.box2}>
                <SafeImage
                  src={
                    course.thumbnail ||
                    "https://res.cloudinary.com/demo/image/upload/sample.jpg"
                  }
                  alt={course.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className={styles.box3}
                />
                <span
                  className={`${styles.floating} ${
                    course.isPublished ? styles.label : styles.label2
                  }`}
                >
                  {course.isPublished ? "Đang phát hành" : "Bản nháp"}
                </span>
              </div>

              {/* NỘI DUNG CARD */}
              <div className={styles.col}>
                <div className={styles.stack2}>
                  <span className={styles.label3}>
                    <Tag size={12} />
                    {tenChuDe(course.category)[0] || "Chưa phân loại"}
                  </span>
                  <h4 className={styles.minorHeading2}>{course.title}</h4>
                  <p className={styles.text3}>
                    {course.description || "Chưa có mô tả chi tiết cho khóa học này."}
                  </p>
                </div>

                {/* THÔNG SỐ PHỤ */}
                <div className={styles.row4}>
                  <span className={styles.row5}>
                    <User size={14} className={styles.box4} />
                    {course.studentsCount || 0} học viên
                  </span>
                  <span className={styles.label4}>
                    {(course.price ?? 0) === 0
                      ? "Miễn phí"
                      : `${(course.price ?? 0).toLocaleString("vi-VN")}đ`}
                  </span>
                </div>

                {/* HÀNH ĐỘNG */}
                <Link
                  href={`/instructor/course-detail?courseId=${course._id}`}
                  className={styles.card3}
                >
                  Chỉnh sửa nội dung & Bài học
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
