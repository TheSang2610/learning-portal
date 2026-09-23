"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Video, FileQuestion, BarChart2 } from "lucide-react"; // 🎯 Thêm BarChart2
import { getCourseById } from "@/src/services/course";
import { deleteLesson } from "@/src/services/lesson.api";
import { getCourseQuizzes, publishQuiz, Quiz } from "@/src/services/quizService";

import styles from "./page.module.scss";
interface Lesson {
  _id: string;
  title: string;
  videoUrl?: string;
  duration?: number | string;
  isFreePreview?: boolean;
}

function InstructorLessonsPageContent() {
  const params = useSearchParams();
  const courseId = params.get("courseId") || "";

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [courseTitle, setCourseTitle] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!courseId || courseId === "undefined") return;
    try {
      setLoading(true);
      const [courseResponse, quizzesResponse] = await Promise.all([
        getCourseById(courseId),
        getCourseQuizzes(courseId),
      ]);

      // GET /courses/:id tra thang ban ghi khoa hoc, khong boc trong { data }
      // hay { course } - hai nhanh du phong cu chua bao gio chay.
      const courseData = courseResponse;
      if (courseData) {
        setCourseTitle(courseData.title || "Khóa học");
        if (Array.isArray(courseData.lessons)) {
          setLessons(courseData.lessons as Lesson[]);
        }
      }
      if (Array.isArray(quizzesResponse)) {
        setQuizzes(quizzesResponse);
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    // Goi qua mot vong microtask thay vi goi thang. Ham tai du lieu bat dau
    // bang setLoading(true), nen goi thang la setState dong bo ngay trong than
    // effect: React phai chay them mot vong ve lai truoc khi hien man hinh
    // (rule react-hooks/set-state-in-effect canh bao dung cho nay). Hoan mot
    // vong microtask thi mat thuong khong thay khac, ma vong ve thua het.
    void Promise.resolve().then(fetchData);
  }, [fetchData]);

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Bạn có chắc muốn xóa bài học này khỏi giáo trình?")) return;
    try {
      await deleteLesson(lessonId);
      setLessons(lessons.filter((l) => l._id !== lessonId));
      alert("Xóa bài học thành công!");
    } catch {
      alert("Xóa bài học thất bại.");
    }
  };

  const handleTogglePublishQuiz = async (quizId: string) => {
    try {
      const response = await publishQuiz(quizId);
      setQuizzes(
        quizzes.map((q) =>
          q._id === quizId ? { ...q, isPublished: !q.isPublished } : q,
        ),
      );
      alert(response?.message || "Cập nhật trạng thái thành công!");
    } catch {
      alert("Lỗi cập nhật trạng thái hiển thị Quiz.");
    }
  };

  if (loading) return <div className={styles.box}>Đang tải giáo trình bài học...</div>;

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.col}>
        <div>
          <Link
            href={`/instructor/course-detail?courseId=${courseId}`}
            className={styles.box2}
          >
            <ArrowLeft size={16} /> Quay lại thông tin chung
          </Link>
          <h1 className={styles.title}>Quản Lý Giáo Trình Bài Học</h1>
          <p className={styles.text}>
            Khóa học: <span className={styles.label}>{courseTitle}</span>
          </p>
        </div>

        <Link
          href={`/instructor/lesson-create?courseId=${courseId}`}
          className={styles.card}
        >
          <Plus size={16} /> Thêm bài học mới
        </Link>
      </div>

      {/* TABLE DATA */}
      <div className={styles.card2}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.headCell}>Tên bài giảng</th>
              <th className={styles.headCell}>Thời lượng</th>
              <th className={styles.headCell}>Bài tập (Quiz)</th>
              <th className={styles.headCell2}>Hành động</th>
            </tr>
          </thead>
          <tbody className={styles.tbody}>
            {lessons.length > 0 ? (
              lessons.map((lesson, index) => {
                const matchingQuiz = quizzes.find(
                  (q) =>
                    (typeof q.lesson === "object" ? q.lesson?._id : q.lesson) ===
                    lesson._id,
                );

                return (
                  <tr key={lesson._id} className={styles.row}>
                    <td className={styles.cell}>
                      <span className={styles.label2}>#{index + 1}</span>
                      <div className={styles.box3}>
                        <Video size={14} />
                      </div>
                      <span className={styles.label3}>{lesson.title}</span>
                    </td>

                    <td className={styles.cell2}>
                      {lesson.duration
                        ? `${Math.round(Number(lesson.duration) / 60)} phút`
                        : "--:--"}
                    </td>

                    <td className={styles.cell3}>
                      {matchingQuiz ? (
                        <div className={styles.row2}>
                          <span
                            className={`${styles.row4} ${matchingQuiz.isPublished ? styles.label4 : styles.label5}`}
                          >
                            <FileQuestion size={10} />
                            {matchingQuiz.isPublished ? "Đang mở" : "Ẩn"}
                          </span>
                          <span className={styles.label6}>
                            ({matchingQuiz.questions?.length || 0} câu)
                          </span>
                        </div>
                      ) : (
                        <span className={styles.label7}>Chưa có</span>
                      )}
                    </td>

                    <td className={styles.cell4}>
                      {/* TÁC VỤ QUIZ */}
                      {!matchingQuiz ? (
                        <Link
                          href={`/instructor/quiz-create?courseId=${courseId}&lessonId=${lesson._id}`}
                          className={styles.box4}
                        >
                          + Quiz
                        </Link>
                      ) : (
                        <>
                          {/* 🎯 NÚT XEM THỐNG KÊ & RESET BÀI LÀM MỚI BỔ SUNG */}
                          <Link
                            href={`/instructor/quiz-stats?courseId=${courseId}&lessonId=${lesson._id}&quizId=${matchingQuiz._id}`}
                            className={styles.box5}
                          >
                            <BarChart2 size={12} /> Xem điểm
                          </Link>

                          <Link
                            href={`/instructor/quiz-edit?courseId=${courseId}&lessonId=${lesson._id}`}
                            className={styles.box6}
                          >
                            Sửa Quiz
                          </Link>

                          <button
                            onClick={() => handleTogglePublishQuiz(matchingQuiz._id)}
                            className={styles.button}
                          >
                            {matchingQuiz.isPublished ? "Ẩn" : "Hiện"}
                          </button>
                        </>
                      )}

                      <span className={styles.label8}>|</span>

                      {/* TÁC VỤ LESSON */}
                      <Link
                        href={`/instructor/lesson-detail?courseId=${courseId}&lessonId=${lesson._id}`}
                        className={styles.box7}
                      >
                        Sửa Bài
                      </Link>
                      <button
                        onClick={() => handleDeleteLesson(lesson._id)}
                        className={styles.button2}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className={styles.cell5}>
                  📭 Chưa có bài giảng nào trong hệ thống cấu trúc nháp này.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// useSearchParams() phai nam trong Suspense thi Next moi prerender tinh duoc.
// Co boundary -> khung trang di tu CDN, khong ton mot lan chay serverless moi luot xem.
export default function InstructorLessonsPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.row3}>
          <div className={styles.spinner} />
        </div>
      }
    >
      <InstructorLessonsPageContent />
    </Suspense>
  );
}
