"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Video,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  FileQuestion,
} from "lucide-react";
import { getCourseById } from "@/src/services/course";
import { deleteLesson } from "@/src/services/lesson.api";

import styles from "./page.module.scss";
import {
  getCourseQuizzes,
  deleteQuiz,
  publishQuiz,
  Quiz,
} from "@/src/services/quizService"; // Tích hợp API Quiz

interface Lesson {
  _id: string;
  title: string;
  videoUrl?: string;
  duration?: number | string;
  isFreePreview?: boolean;
}

function AdminLessonsPageContent() {
  const params = useSearchParams();
  const courseId = params.get("courseId") || "";

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]); // Lưu danh sách Quiz của khóa học
  const [courseTitle, setCourseTitle] = useState("");
  const [loading, setLoading] = useState(true);

  // Hàm gom chung để fetch lại toàn bộ dữ liệu đồng bộ
  const fetchData = useCallback(async () => {
    if (!courseId || courseId === "undefined") return;
    try {
      setLoading(true);

      // Gọi song song cả API Khóa học & API danh sách Quiz để tối ưu tốc độ
      const [courseResponse, quizzesResponse] = await Promise.all([
        getCourseById(courseId),
        getCourseQuizzes(courseId),
      ]);

      // Xử lý dữ liệu Khóa học
      // GET /courses/:id tra thang ban ghi khoa hoc, khong boc trong { data }
      // hay { course } - hai nhanh du phong cu chua bao gio chay.
      const courseData = courseResponse;
      if (courseData) {
        setCourseTitle(courseData.title || "Khóa học");
        if (Array.isArray(courseData.lessons)) {
          setLessons(courseData.lessons as Lesson[]);
        }
      }

      // Xử lý dữ liệu Quizzes
      if (Array.isArray(quizzesResponse)) {
        setQuizzes(quizzesResponse);
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu quản trị:", error);
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

  // Xử lý xóa bài học (Lesson)
  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài học này khỏi giáo trình?")) return;
    try {
      await deleteLesson(lessonId);
      setLessons(lessons.filter((l) => l._id !== lessonId));
      alert("Xóa bài học thành công!");
    } catch {
      alert("Xóa bài học thất bại.");
    }
  };

  // 🎯 Xử lý xóa bài tập (Quiz)
  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa HOÀN TOÀN bài trắc nghiệm này không?"))
      return;
    try {
      await deleteQuiz(quizId);
      setQuizzes(quizzes.filter((q) => q._id !== quizId));
      alert("Xóa bài tập trắc nghiệm thành công!");
    } catch {
      alert("Không thể xóa bài tập này.");
    }
  };

  // 🎯 Xử lý bật/tắt Publish bài tập (Quiz) trực tiếp trên bảng dữ liệu
  const handleTogglePublishQuiz = async (quizId: string) => {
    try {
      const response = await publishQuiz(quizId);
      // Cập nhật lại trạng thái ngay trên State local để UI thay đổi lập tức
      setQuizzes(
        quizzes.map((q) =>
          q._id === quizId ? { ...q, isPublished: !q.isPublished } : q,
        ),
      );
      alert(response?.message || "Cập nhật trạng thái hiển thị thành công!");
    } catch {
      alert("Lỗi thao tác trạng thái công bố.");
    }
  };

  if (loading) return <div className={styles.box}>Đang tải giáo trình bài học...</div>;

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.col}>
        <div>
          <Link
            href={`/admin/course-detail?courseId=${courseId}`}
            className={styles.box2}
          >
            <ArrowLeft size={16} /> Quay lại chi tiết khóa học
          </Link>
          <h1 className={styles.title}>Quản Lý Bài Học</h1>
          <p className={styles.text}>
            Khóa học: <span className={styles.label}>{courseTitle}</span>
          </p>
        </div>

        <Link href={`/admin/lesson-create?courseId=${courseId}`} className={styles.card}>
          <Plus size={16} /> Thêm bài học mới
        </Link>
      </div>

      {/* DANH SÁCH BẢNG */}
      <div className={styles.card2}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.headCell}>Tên bài học</th>
              <th className={styles.headCell}>Thời lượng</th>
              <th className={styles.headCell}>Trạng thái bài tập (Quiz)</th>
              <th className={styles.headCell2}>Hành động</th>
            </tr>
          </thead>
          <tbody className={styles.tbody}>
            {lessons.length > 0 ? (
              lessons.map((lesson, index) => {
                // 🔎 Tìm kiếm bài kiểm tra tương ứng với bài học hiện tại
                const matchingQuiz = quizzes.find((q) => {
                  const qLessonId =
                    typeof q.lesson === "object" ? q.lesson?._id : q.lesson;
                  return qLessonId === lesson._id;
                });

                return (
                  <tr key={lesson._id} className={styles.row}>
                    {/* TÊN BÀI HỌC */}
                    <td className={styles.cell}>
                      <span className={styles.label2}>#{index + 1}</span>
                      <div className={styles.box3}>
                        <Video size={16} />
                      </div>
                      <span className={styles.label3}>{lesson.title}</span>
                    </td>

                    {/* THỜI LƯỢNG */}
                    <td className={styles.cell2}>
                      {lesson.duration
                        ? `${Math.round(Number(lesson.duration) / 60)} phút`
                        : "--:--"}
                    </td>

                    {/* TRẠNG THÁI QUIZ */}
                    <td className={styles.cell3}>
                      {matchingQuiz ? (
                        <div className={styles.row2}>
                          <span
                            className={`${styles.row4} ${
                              matchingQuiz.isPublished ? styles.label4 : styles.label5
                            }`}
                          >
                            <FileQuestion size={12} />
                            {matchingQuiz.isPublished ? "Đang Công Bố" : "Bản Nháp (Ẩn)"}
                          </span>
                          <span className={styles.label6}>
                            ({matchingQuiz.questions?.length || 0} câu hỏi)
                          </span>
                        </div>
                      ) : (
                        <span className={styles.label7}>Chưa có bài tập</span>
                      )}
                    </td>

                    {/* HÀNH ĐỘNG DÀNH CHO LESSON & QUIZ */}
                    <td className={styles.cell4}>
                      {/* --- PHẦN QUẢN LÝ QUIZ --- */}
                      {!matchingQuiz ? (
                        // Nút Tạo nếu chưa có Quiz
                        <Link
                          href={`/admin/quiz-create?courseId=${courseId}&lessonId=${lesson._id}`}
                          className={styles.box4}
                        >
                          <Plus size={12} /> Thêm Quiz
                        </Link>
                      ) : (
                        // Chuỗi nút xử lý nếu đã tồn tại Quiz độc lập
                        <>
                          <Link
                            href={`/admin/quiz-edit?courseId=${courseId}&lessonId=${lesson._id}`}
                            className={styles.box5}
                          >
                            <Edit2 size={12} /> Sửa Quiz
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleTogglePublishQuiz(matchingQuiz._id)}
                            className={`${styles.button5} ${
                              matchingQuiz.isPublished ? styles.button : styles.button2
                            }`}
                          >
                            {matchingQuiz.isPublished ? (
                              <XCircle size={12} />
                            ) : (
                              <CheckCircle2 size={12} />
                            )}
                            {matchingQuiz.isPublished ? "Ẩn Quiz" : "Hiện Quiz"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteQuiz(matchingQuiz._id)}
                            className={styles.button3}
                          >
                            <Trash2 size={12} /> Xóa Quiz
                          </button>
                        </>
                      )}

                      {/* Vạch chia nhẹ phân biệt giữa cấu hình Quiz và cấu hình cốt lõi Lesson */}
                      <span className={styles.label8}>|</span>

                      {/* --- PHẦN QUẢN LÝ LESSON --- */}
                      <Link
                        href={`/admin/lesson-detail?courseId=${courseId}&lessonId=${lesson._id}`}
                        className={styles.box6}
                      >
                        Sửa Bài
                      </Link>
                      <button
                        onClick={() => handleDeleteLesson(lesson._id)}
                        className={styles.button4}
                      >
                        Xóa Bài
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className={styles.cell5}>
                  📭 Giáo trình trống. Vui lòng bấm nút phía trên để thêm bài giảng đầu
                  tiên!
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
export default function AdminLessonsPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.row3}>
          <div className={styles.spinner} />
        </div>
      }
    >
      <AdminLessonsPageContent />
    </Suspense>
  );
}
