"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { getErrorMessage } from "@/src/services/apiHelper";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Play,
  CheckCircle,
  Award,
  BookOpen,
  Clock,
  FileText,
  Lock,
} from "lucide-react";

import CertificateModal from "@/src/components/certificate/CertificateModal";
import StudentQuizView from "@/src/components/quiz/StudentQuizView";

import type Hls from "hls.js";

import { getCourseBySlug, type Course } from "@/src/services/course";
import type { Lesson } from "@/src/services/lesson.api";
import {
  getEnrollmentByCourse,
  startLesson,
  updateWatchTime,
  completeLesson,
  getProgressStats,
  completeCourse,
  type Enrollment,
  type EnrollmentByCourseResponse,
  type LessonProgress,
  type ProgressStats,
} from "@/src/services/enrollment.api";

import { getCourseQuizzes, type Quiz } from "@/src/services/quizService";

// Backend tra ve 200 kem isEnrolled: false khi chua dang ky chu khong tra 404,
// nen phai thu hep kieu truoc thi moi doc duoc lessonProgress.
const daDangKy = (
  e: EnrollmentByCourseResponse | null,
): e is { isEnrolled: true } & Enrollment => Boolean(e && e.isEnrolled === true);

// lessonProgress.lesson khi la ObjectId dang chuoi, khi la ca doi tuong bai hoc
// da populate - tuy endpoint nao tra ve.
const layIdBaiHoc = (lesson: LessonProgress["lesson"]): string | undefined =>
  typeof lesson === "string" ? lesson : (lesson?._id ?? undefined);

// Doc lessonProgress ma khong phai kiem tra isEnrolled lap lai o tung cho.
const layTienDo = (e: EnrollmentByCourseResponse | null): LessonProgress[] =>
  daDangKy(e) ? e.lessonProgress : [];

// course.instructor khi la ObjectId dang chuoi, khi la doi tuong da populate.
// Chi lay duoc ten o truong hop thu hai.
const tenGiangVien = (c: Course | null): string | undefined =>
  c && typeof c.instructor === "object" ? c.instructor.name : undefined;

function CourseLearnSkeleton() {
  return (
    <div className="flex h-full animate-pulse flex-col bg-[#f8f9fa]">
      {/* SKELETON HEADER */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex w-1/3 items-center gap-4">
          <div className="h-8 w-8 rounded-lg bg-slate-200"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-slate-200"></div>
            <div className="h-3 w-1/2 rounded bg-slate-200"></div>
          </div>
        </div>
        <div className="h-9 w-32 rounded-xl bg-slate-200"></div>
      </header>

      {/* SKELETON CONTENT */}
      <div className="grid h-[calc(100vh-73px)] w-full flex-1 grid-cols-1 overflow-hidden md:grid-cols-12">
        {/* VIEW TRÁI: VIDEO SKELETON */}
        <div className="col-span-12 flex flex-col gap-4 p-6 md:col-span-9">
          <div className="aspect-video w-full rounded-2xl bg-slate-200 shadow-sm"></div>
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex-1 space-y-3">
              <div className="h-3 w-16 rounded bg-slate-200"></div>
              <div className="h-5 w-1/3 rounded bg-slate-200"></div>
              <div className="h-3 w-1/2 rounded bg-slate-200"></div>
            </div>
            <div className="h-10 w-28 rounded-xl bg-slate-200"></div>
          </div>
        </div>

        {/* VIEW PHẢI: MENU LESSONS SKELETON */}
        <div className="col-span-12 flex flex-col border-t border-slate-200 bg-white md:col-span-3 md:border-t-0 md:border-l">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 p-4">
            <div className="h-4 w-1/2 rounded bg-slate-200"></div>
            <div className="h-4 w-10 rounded bg-slate-200"></div>
          </div>
          <div className="flex-1 space-y-2 p-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <div className="h-4 w-4 flex-shrink-0 rounded-full bg-slate-200"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-5/6 rounded bg-slate-200"></div>
                  <div className="h-2 w-1/4 rounded bg-slate-200"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CourseLearnPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Lay slug tu query string: ?slug=ten-khoa-hoc
  const courseSlug = searchParams.get("slug") || "";
  const videoRef = useRef<HTMLVideoElement>(null);
  // import type nen hls.js khong bi keo vao goi JavaScript - no van duoc nap
  // dong o duoi bang await import("hls.js").
  const hlsRef = useRef<Hls | null>(null);

  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<EnrollmentByCourseResponse | null>(null);
  const [progress, setProgress] = useState<ProgressStats | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [isDoingQuiz, setIsDoingQuiz] = useState<boolean>(false);
  const [showCertificate, setShowCertificate] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<string>("");

  useEffect(() => {
    if (!courseSlug) return;

    const initLearnPage = async () => {
      try {
        setLoading(true);
        // getCourseBySlug tra ve Course HOAC { error }, nen phai loai truong
        // hop loi ra truoc thi phan con lai moi chac chan la Course.
        const ketQua = await getCourseBySlug(courseSlug);
        if (!ketQua || "error" in ketQua) {
          setCourse(null);
          setLoading(false);
          return;
        }
        const courseData = ketQua;
        setCourse(courseData);

        const realCourseId = courseData._id;
        const enrollData = await getEnrollmentByCourse(realCourseId);
        setEnrollment(enrollData);

        const stats = await getProgressStats(realCourseId);
        setProgress(stats);

        if (courseData?.lessons && courseData.lessons.length > 0) {
          // /courses/slug/:slug populate day du bai hoc, khac voi /courses chi
          // tra ve mang ObjectId - nen o day moi ep sang Lesson duoc.
          const sortedLessons = [...(courseData.lessons as Lesson[])].sort(
            (a, b) => (a.order || 0) - (b.order || 0),
          );

          let defaultLesson: Lesson | undefined;

          if (daDangKy(enrollData) && enrollData.lessonProgress.length > 0) {
            const nextIncompleteProgress = enrollData.lessonProgress.find(
              (lp) => lp.status !== "completed",
            );

            if (nextIncompleteProgress) {
              const targetLessonId = layIdBaiHoc(nextIncompleteProgress.lesson);
              defaultLesson = sortedLessons.find((l) => l._id === targetLessonId);
            }
          }

          // Truoc day nhanh du phong doc enrollData.currentLessonId, ma model
          // Enrollment khong he co truong do - luon undefined, nen cai goi la
          // "hoc tiep tu cho dang do" that ra chua bao gio chay: no roi thang
          // xuong bai dau tien. Bo han cho khoi hieu nham, vi truong hop nay chi
          // xay ra khi moi bai deu da hoc xong.
          if (!defaultLesson) defaultLesson = sortedLessons[0];

          setActiveLesson(defaultLesson);

          // Bai bi khoa thi khong ghi tien do - xem ghi chu o handleSelectLesson.
          if (!defaultLesson.biKhoa) {
            try {
              await startLesson(realCourseId, defaultLesson._id);

              const history = layTienDo(enrollData).find(
                (lp) => layIdBaiHoc(lp.lesson) === defaultLesson._id,
              );

              if (history?.watchedDuration && videoRef.current) {
                videoRef.current.currentTime = history.watchedDuration;
              }
            } catch (err) {
              console.error("Lỗi kích hoạt bài học mặc định:", err);
            }
          }
        }
      } catch (error) {
        console.error("Lỗi khi khởi tạo màn hình học tập:", error);
      } finally {
        setLoading(false);
      }
    };

    initLearnPage();
  }, [courseSlug]);

  // 🎯 Xử lý video URL - Hỗ trợ HLS streaming
  useEffect(() => {
    // Rut ra bien rieng TRUOC khi vao ham bat dong bo: TypeScript khong giu
    // duoc ket qua thu hep kieu cua activeLesson?.videoUrl qua ranh gioi ham,
    // nen o trong closure no lai thanh string | undefined.
    const videoUrl = activeLesson?.videoUrl;
    if (!videoUrl || !videoRef.current) return;

    const setupVideo = async () => {
      try {
        setVideoError("");

        const videoElement = videoRef.current;
        if (!videoElement) return;

        // Always reset the current source before switching videos
        videoElement.pause();
        videoElement.removeAttribute("src");
        videoElement.load();

        const isHls = /\.m3u8(\?|$)|application\/vnd\.apple\.mpegurl/i.test(videoUrl);

        if (isHls) {
          const canNativeHls =
            videoElement.canPlayType("application/vnd.apple.mpegurl") ||
            videoElement.canPlayType("application/x-mpegURL");

          if (canNativeHls) {
            videoElement.src = videoUrl;
            videoElement.load();
          } else {
            try {
              const hlsModule = await import("hls.js");
              const Hls = hlsModule.default;

              if (Hls && Hls.isSupported()) {
                if (hlsRef.current) {
                  hlsRef.current.destroy();
                  hlsRef.current = null;
                }

                const hls = new Hls({
                  debug: false,
                  enableWorker: true,
                });

                hlsRef.current = hls;
                hls.loadSource(videoUrl);
                hls.attachMedia(videoElement);

                hls.on(Hls.Events.MANIFEST_PARSED, () => {});

                hls.on(Hls.Events.ERROR, (event, data) => {
                  console.error("❌ HLS Error:", event, data);
                  if (data.fatal) {
                    // Truong ma HTTP trong hls.js ten la code chu khong phai
                    // status - viet sai thi nhanh nay chua bao gio chay.
                    const errorMsg = data.response?.code
                      ? `Lỗi tải video: ${data.response.code}`
                      : `Lỗi tải video: ${data.error || "Không xác định"}`;
                    setVideoError(errorMsg);
                  }
                });
              } else {
                console.warn(
                  "⚠️ Browser does not support HLS.js; falling back to native HLS",
                );
                videoElement.src = videoUrl;
                videoElement.load();
              }
            } catch (error) {
              console.error("❌ Không tải được hls.js:", error);
              videoElement.src = videoUrl;
              videoElement.load();
            }
          }
        } else {
          videoElement.src = videoUrl;
          videoElement.load();
        }
      } catch (error) {
        console.error("Lỗi setup video:", error);
        setVideoError(
          `Có lỗi khi tải video: ${getErrorMessage(error, "Không xác định")}`,
        );
      }
    };

    setupVideo();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [activeLesson?.videoUrl]);

  useEffect(() => {
    if (!activeLesson || !course?._id) return;

    const checkQuizForLesson = async () => {
      try {
        setIsDoingQuiz(false);
        const res = await getCourseQuizzes(course._id, activeLesson._id);
        if (Array.isArray(res) && res.length > 0) {
          setCurrentQuiz(res[0]);
        } else {
          setCurrentQuiz(null);
        }
      } catch (err) {
        console.error("Lỗi tìm kiếm Quiz đính kèm bài học:", err);
        setCurrentQuiz(null);
      }
    };

    checkQuizForLesson();
  }, [activeLesson, course?._id]);

  useEffect(() => {
    if (!activeLesson || !videoRef.current || !course?._id || isDoingQuiz) return;

    const interval = setInterval(async () => {
      if (videoRef.current && !videoRef.current.paused) {
        const currentTime = Math.floor(videoRef.current.currentTime);
        try {
          await updateWatchTime(course._id, activeLesson._id, currentTime);
        } catch (err) {
          console.error("Lỗi lưu watch time cập nhật ngầm:", err);
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [activeLesson, course?._id, isDoingQuiz]);

  const handleSelectLesson = async (lesson: Lesson) => {
    if (!course?._id) return;
    setActiveLesson(lesson);
    setVideoError("");

    // Bai bi khoa thi khong ghi tien do: nguoi nay chua duoc mo khoa hoc, may
    // chu se tu choi, goi vao chi de lai mot dong loi do trong console.
    if (lesson.biKhoa) return;

    try {
      await startLesson(course._id, lesson._id);

      const history = layTienDo(enrollment).find(
        (lp) => layIdBaiHoc(lp.lesson) === lesson._id,
      );

      if (history?.watchedDuration && videoRef.current) {
        videoRef.current.currentTime = history.watchedDuration;
      }
    } catch (err) {
      console.error("Lỗi khi kích hoạt startLesson:", err);
    }
  };

  const handleVideoEnded = async () => {
    if (!activeLesson || !course?._id) return;
    try {
      const duration = videoRef.current ? Math.floor(videoRef.current.duration) : 0;
      const response = await completeLesson(course._id, activeLesson._id, duration);

      const updatedEnroll = await getEnrollmentByCourse(course._id);
      setEnrollment(updatedEnroll);

      const newStats = await getProgressStats(course._id);
      setProgress(newStats);

      if (
        // Truoc day ve phai viet la newStats?.completedCount, ma ProgressStats
        // khong co truong do (ten that la completedLessons) - so undefined voi
        // mot con so thi luon sai, nen ca ve nay chua bao gio dung toi.
        newStats?.progressPercentage === 100 ||
        newStats?.completedLessons === course?.lessons?.length
      ) {
        await completeCourse(course._id);
        setShowCertificate(true);
      } else {
        alert(
          response?.message ||
            `Chúc mừng bạn đã hoàn thành phần video bài học: ${activeLesson.title}`,
        );
      }
    } catch (error) {
      console.error("Lỗi khi gửi kết quả hoàn thành bài học:", error);
    }
  };

  const handleQuizSuccess = async () => {
    if (!activeLesson || !course?._id) return;
    try {
      const duration = videoRef.current ? Math.floor(videoRef.current.duration) : 0;
      await completeLesson(course._id, activeLesson._id, duration);

      const updatedEnroll = await getEnrollmentByCourse(course._id);
      setEnrollment(updatedEnroll);

      const newStats = await getProgressStats(course._id);
      setProgress(newStats);

      if (newStats?.progressPercentage === 100) {
        await completeCourse(course._id);
        setShowCertificate(true);
      }
    } catch (error) {
      console.error("Lỗi đồng bộ tiến độ sau khi hoàn thành bài học:", error);
    }
  };

  const checkLessonCompleted = (lessonId: string) => {
    const found = layTienDo(enrollment).find((lp) => layIdBaiHoc(lp.lesson) === lessonId);
    return found?.status === "completed";
  };

  if (loading) {
    return <CourseLearnSkeleton />;
  }

  if (!course) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-[#f8f9fa] p-4">
        <div className="max-w-sm rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-base font-bold text-red-600">Không vào được phòng học</p>
          <p className="mt-1 text-xs text-gray-500">
            Khóa học không tồn tại hoặc bạn chưa đăng ký thành viên.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 rounded-xl bg-[#0056d2] px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-[#f8f9fa] text-[#1f2124]">
      {/* HEADER SÁNG */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex min-w-0 items-center gap-4">
          {/* xem=1 bao trang gioi thieu dung day nguoc lai vao day. Khoa mien
              phi da ghi danh mac dinh nhay thang vao bai hoc, thieu tham so nay
              thi bam Quay lai se bi nem tro ve chinh trang nay. */}
          <button
            onClick={() => router.push(`/course?slug=${courseSlug}&xem=1`)}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-slate-100 hover:text-black"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-bold text-slate-900">{course?.title}</h1>
            <p className="mt-0.5 text-[11px] text-gray-500">
              Giảng viên:{" "}
              <span className="font-medium text-slate-700">
                {tenGiangVien(course) || "Chuyên gia"}
              </span>
            </p>
          </div>
        </div>

        {/* Khung Tiến độ nổi bật */}
        <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-1.5">
          <Award size={16} className="text-amber-500" />
          <div className="text-right">
            <span className="block text-xs font-bold text-[#0056d2]">
              {" "}
              Tiến độ: {progress?.progressPercentage || 0}%
            </span>
            <span className="block text-[10px] font-medium text-gray-500">
              Bài đã xong: {progress?.completedLessons || 0}/
              {course?.lessons?.length || 0}
            </span>
          </div>
        </div>
      </header>

      {/* KHU VỰC BÀI HỌC VÀ MENU DANH SÁCH */}
      <div className="grid h-[calc(100vh-73px)] w-full flex-1 grid-cols-1 overflow-hidden bg-[#f8f9fa] md:grid-cols-12">
        {/* VIEW TRÁI: VIDEO & NỘI DUNG BÀI HỌC CÙNG BÀI KIỂM TRA */}
        <div className="col-span-12 flex min-w-0 flex-col gap-4 overflow-y-auto p-6 md:col-span-9">
          {isDoingQuiz && currentQuiz && currentQuiz._id ? (
            <StudentQuizView
              quizId={currentQuiz._id}
              onClose={() => setIsDoingQuiz(false)}
              onSuccess={handleQuizSuccess}
            />
          ) : activeLesson ? (
            <div className="space-y-4">
              {/* Box Video bo góc thanh lịch */}
              <div className="relative aspect-video overflow-hidden rounded-2xl bg-black shadow-md">
                {activeLesson.videoUrl ? (
                  <>
                    <video
                      ref={videoRef}
                      key={activeLesson._id}
                      controls
                      className="h-full w-full object-contain"
                      crossOrigin="anonymous"
                      onEnded={handleVideoEnded}
                      onError={(e) => {
                        console.error("❌ Video element error:", e);
                        setVideoError(
                          "Không thể phát video. Kiểm tra kết nối mạng hoặc định dạng file.",
                        );
                      }}
                    />
                    {videoError && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl bg-slate-900/80 p-4 text-red-400">
                        <p className="text-center text-xs font-medium">❌ {videoError}</p>
                      </div>
                    )}
                  </>
                ) : activeLesson.biKhoa ? (
                  /* May chu da cat videoUrl vi nguoi xem chua duoc mo khoa hoc.
                     Truoc day cho nay hien "chua cau hinh video" - nguoi hoc doc
                     xong tuong he thong hong, khong biet la minh chua duoc duyet. */
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900 px-6 text-center">
                    <Lock size={40} className="text-amber-400" />
                    <p className="text-sm font-semibold text-white">
                      Bài học chưa được mở
                    </p>
                    <p className="max-w-sm text-xs leading-relaxed text-slate-400">
                      Khóa học này có phí. Sau khi bạn chuyển khoản, ban quản trị đối
                      chiếu rồi xác nhận đơn — toàn bộ bài giảng sẽ mở ra ngay tại đây.
                    </p>
                    <button
                      onClick={() => router.push(`/course?slug=${courseSlug}`)}
                      className="mt-1 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-amber-600"
                    >
                      Xem cách đăng ký khóa học
                    </button>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900 text-gray-500">
                    <BookOpen size={48} className="animate-pulse text-gray-600" />
                    <p className="text-xs">
                      Bài học này chưa được cấu hình liên kết Video bài giảng
                    </p>
                  </div>
                )}
              </div>

              {/* Chi tiết bài học dưới Video (Nền Trắng) */}
              <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-bold tracking-wider text-blue-600 uppercase">
                      Đang diễn ra
                    </span>
                    {checkLessonCompleted(activeLesson._id) && (
                      <span className="rounded border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold tracking-wider text-emerald-600 uppercase">
                        Đã hoàn thành
                      </span>
                    )}
                  </div>
                  <h2 className="pt-1 text-base font-bold text-slate-900">
                    {activeLesson.title}
                  </h2>
                  <p className="pt-1 text-xs leading-relaxed text-slate-500">
                    {/* Truoc day doc activeLesson.description, ma model Lesson
                        khong co truong do - luon rong nen cau du phong ben duoi
                        moi la thu thuc su hien ra tu truoc toi nay. */}
                    Bài học này nằm trong khung năng lực đào tạo chuẩn hệ thống.
                  </p>
                </div>

                <div className="flex w-full flex-shrink-0 flex-col items-stretch gap-2 pt-2 md:w-auto md:flex-row md:pt-0">
                  {currentQuiz && (
                    <button
                      onClick={() => setIsDoingQuiz(true)}
                      className="flex transform items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 text-xs font-bold text-white shadow-md transition-all hover:from-amber-600 hover:to-orange-600 active:scale-95"
                    >
                      <FileText size={16} />
                      Làm bài kiểm tra ({currentQuiz.passingScore}% để đạt)
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-20 text-gray-500">
              <Play size={40} className="mb-2 stroke-[1.5] text-slate-400" />
              <p className="text-xs font-medium">
                Vui lòng chọn một bài giảng ở menu bên cạnh để bắt đầu học tập.
              </p>
            </div>
          )}
        </div>

        {/* VIEW PHẢI: MENU DANH SÁCH BÀI HỌC (Nền Trắng) */}
        <div className="col-span-12 flex min-h-0 flex-col overflow-hidden border-t border-slate-200 bg-white shadow-sm md:col-span-3 md:border-t-0 md:border-l">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 p-4">
            <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase">
              Nội dung bài học
            </h3>
            <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
              {course?.lessons?.length || 0} mục
            </span>
          </div>

          <div className="flex-1 space-y-1 overflow-y-auto p-2">
            {course?.lessons && course.lessons.length > 0 ? (
              [...(course.lessons as Lesson[])]
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((lesson, index: number) => {
                  const isCurrent = activeLesson?._id === lesson._id;
                  const isCompleted = checkLessonCompleted(lesson._id);

                  return (
                    <button
                      key={lesson._id || index}
                      onClick={() => handleSelectLesson(lesson)}
                      className={`group relative flex w-full items-start gap-3 rounded-xl p-3 text-left transition ${
                        isCurrent
                          ? "border border-blue-100 bg-blue-50 font-semibold text-[#0056d2]"
                          : "border border-transparent text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {lesson.biKhoa ? (
                          <Lock size={15} className="text-amber-500" />
                        ) : isCompleted ? (
                          <CheckCircle
                            size={16}
                            className="fill-emerald-50 text-emerald-500"
                          />
                        ) : (
                          <div
                            className={`h-4 w-4 rounded-full border-2 ${isCurrent ? "border-blue-500 bg-[#0056d2] text-white" : "border-slate-300 text-slate-500 group-hover:border-slate-400"} flex items-center justify-center text-[9px] font-bold`}
                          >
                            {index + 1}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <span
                          className={`block truncate text-xs leading-snug font-medium ${isCurrent ? "font-bold text-[#0056d2]" : "group-hover:text-black"}`}
                        >
                          {lesson.title}
                        </span>
                        <div className="mt-1 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                            <Clock size={10} />
                            <span>
                              {lesson.duration
                                ? `${lesson.duration} phút`
                                : "Bài học Video"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
            ) : (
              <p className="p-4 text-center text-xs text-slate-500 italic">
                Đang cập nhật bài giảng.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Chi dung khi thuc su co ban ghi dang ky: CertificateModal lay chung
          chi theo enrollmentId, dua chuoi rong vao la no goi API vo ich. */}
      {daDangKy(enrollment) && (
        <CertificateModal
          isOpen={showCertificate}
          onClose={() => setShowCertificate(false)}
          enrollmentId={enrollment._id}
        />
      )}
    </div>
  );
}

// Suspense la bat buoc: useSearchParams() khong the prerender tinh neu thieu boundary.
// Co boundary thi Next dung san khung HTML, Vercel phuc vu tu CDN, khong ton serverless.
export default function CourseLearnPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
        </div>
      }
    >
      <CourseLearnPageContent />
    </Suspense>
  );
}
