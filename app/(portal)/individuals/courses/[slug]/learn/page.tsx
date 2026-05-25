"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Play, CheckCircle, Award, BookOpen, Clock } from "lucide-react";

// Đổi từ getCourseById sang getCourseBySlug để tìm kiếm bằng chuỗi chữ chuẩn SEO
import { getCourseBySlug } from "@/src/services/course";
import {
  getEnrollmentByCourse,
  startLesson,
  updateWatchTime,
  completeLesson,
  getProgressStats,
  completeCourse,
} from "@/src/services/enrollment.api";

export default function CourseLearnPage() {
  const params = useParams();
  const router = useRouter();
  
  // Next.js có thể định danh tên thư mục động là [id] hoặc [slug]
  // Lấy giá trị linh hoạt từ thanh URL để tránh bị undefined
  const courseSlug = (params.slug || params.id) as string;

  const videoRef = useRef<HTMLVideoElement>(null);

  // States quản lý dữ liệu dự án
  const [course, setCourse] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 1. Tải thông tin tổng quan khi vào trang bằng Slug
  useEffect(() => {
    if (!courseSlug) return;

    const initLearnPage = async () => {
      try {
        setLoading(true);
        
        // Bước A: Tìm thông tin khóa học bằng chuỗi SLUG chuẩn SEO trên URL
        const courseData = await getCourseBySlug(courseSlug) as any;
        if (!courseData || courseData.error) {
          setCourse(null);
          setLoading(false);
          return;
        }
        setCourse(courseData);

        // Bước B: Bóc tách lấy ID thật từ database của khóa học vừa tìm được
        const realCourseId = courseData._id;

        // Bước C: Sử dụng ID thật này cho toàn bộ các API tiến độ học tập ngầm
        const enrollData = await getEnrollmentByCourse(realCourseId);
        setEnrollment(enrollData);

        const stats = await getProgressStats(realCourseId);
        setProgress(stats);

        // Chọn bài học đầu tiên hoặc bài học đang học dở làm mặc định
        if (courseData?.lessons && courseData.lessons.length > 0) {
          const sortedLessons = [...courseData.lessons].sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
          const lastActiveLessonId = enrollData?.currentLessonId;
          const defaultLesson = sortedLessons.find((l: any) => l._id === lastActiveLessonId) || sortedLessons[0];
          
          // Kích hoạt bài học đầu tiên (Lưu ý: hàm handleSelectLesson cần truyền cả ID thật)
          setActiveLesson(defaultLesson);
          try {
            await startLesson(realCourseId, defaultLesson._id);
            const history = enrollData?.completedLessons?.find((h: any) => h.lessonId === defaultLesson._id);
            if (history?.watchedDuration && videoRef.current) {
              videoRef.current.currentTime = history.watchedDuration;
            }
          } catch (err) {
            console.error("Lỗi kích hoạt bài học mặc định:", err);
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

  // 2. Tự động cập nhật thời gian xem liên tục dựa trên ID thật của khóa học
  useEffect(() => {
    if (!activeLesson || !videoRef.current || !course?._id) return;

    const interval = setInterval(async () => {
      if (videoRef.current && !videoRef.current.paused) {
        const currentTime = Math.floor(videoRef.current.currentTime);
        try {
          // Sử dụng course._id (ID thật bóc từ database)
          await updateWatchTime(course._id, activeLesson._id, currentTime);
          console.log(`Đã lưu thời gian xem: ${currentTime}s`);
        } catch (err) {
          console.error("Lỗi lưu watch time cập nhật ngầm:", err);
        }
      }
    }, 10000); // 10 giây chạy một lần

    return () => clearInterval(interval);
  }, [activeLesson, course?._id]);

  // 3. Xử lý khi học viên bấm chọn một bài học khác từ danh sách bên phải
  const handleSelectLesson = async (lesson: any) => {
    if (!course?._id) return;
    setActiveLesson(lesson);
    try {
      // Sử dụng course._id thay vì biến URL bậy bạ
      await startLesson(course._id, lesson._id);
      
      const history = enrollment?.completedLessons?.find((h: any) => h.lessonId === lesson._id);
      if (history?.watchedDuration && videoRef.current) {
        videoRef.current.currentTime = history.watchedDuration;
      }
    } catch (err) {
      console.error("Lỗi khi kích hoạt startLesson:", err);
    }
  };

  // 4. Xử lý khi xem hết Video (Video Ended) -> Đánh dấu hoàn thành bài học
  const handleVideoEnded = async () => {
    if (!activeLesson || !course?._id) return;
    try {
      const duration = videoRef.current ? Math.floor(videoRef.current.duration) : 0;
      
      // Gọi API hoàn thành bài học bằng ID thật
      await completeLesson(course._id, activeLesson._id, duration);
      alert(`Chúc mừng bạn đã hoàn thành bài: ${activeLesson.title}`);

      // Cập nhật lại UI dựa trên ID thật
      const updatedEnroll = await getEnrollmentByCourse(course._id);
      setEnrollment(updatedEnroll);

      const newStats = await getProgressStats(course._id);
      setProgress(newStats);

      if (newStats?.progressPercentage === 100 || newStats?.completedCount === course?.lessons?.length) {
        await completeCourse(course._id);
        alert("🎉 Xuất sắc! Bạn đã hoàn thành toàn bộ khóa học này!");
      }
    } catch (error) {
      console.error("Lỗi khi gửi kết quả hoàn thành bài học:", error);
    }
  };

  const checkLessonCompleted = (lessonId: string) => {
    if (!enrollment?.completedLessons) return false;
    return enrollment.completedLessons.some((item: any) => 
      typeof item === "string" ? item === lessonId : item.lessonId === lessonId
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-900 text-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="mt-3 text-xs text-slate-400">Đang chuẩn bị phòng học trực tuyến...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#0f172a] text-black p-4">
        <div className="bg-slate-900 p-8 rounded-2xl shadow-sm text-center max-w-sm border border-slate-800">
          <p className="text-red-500 font-bold text-base">Không vào được phòng học</p>
          <p className="text-slate-400 text-xs mt-1">Khóa học không tồn tại hoặc bạn chưa đăng ký thành viên.</p>
          <button onClick={() => router.push("/")} className="mt-4 text-xs bg-blue-600 hover:bg-blue-700 text-black px-4 py-2 rounded-xl font-semibold transition">
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col">
      
      {/* 1. TOP BAR HEADER */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <button 
            onClick={() => router.push(`/individuals/courses/${courseSlug}`)} // Quay lại trang chi tiết bằng slug cho đẹp URL
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-black transition"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-black truncate">{course?.title}</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">Giảng viên: {course?.instructor?.name || course?.instructor || "Chuyên gia"}</p>
          </div>
        </div>

        {/* TIẾN ĐỘ TỔNG QUAN */}
        <div className="flex items-center gap-3 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/50">
          <Award size={16} className="text-yellow-500" />
          <div className="text-right">
            <span className="text-xs font-bold block text-black"> Tiến độ: {progress?.progressPercentage || 0}%</span>
            <span className="text-[10px] text-slate-400 block">Bài đã xong: {progress?.completedCount || 0}/{course?.lessons?.length || 0}</span>
          </div>
        </div>
      </header>

      {/* 2. CHƯƠNG TRÌNH CHI TIẾT (BÀI HỌC VÀ MENU) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 overflow-hidden">
        
        {/* CỘT TRÁI: VIDEO PLAYER & THÔNG TIN BÀI HỌC */}
        <div className="lg:col-span-3 p-6 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-73px)]">
          {activeLesson ? (
            <div className="space-y-4">
              <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
                {activeLesson.videoUrl ? (
                  <video
                    ref={videoRef}
                    key={activeLesson._id}
                    src={activeLesson.videoUrl}
                    controls
                    autoPlay
                    onEnded={handleVideoEnded}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-2">
                    <BookOpen size={48} className="text-slate-700 animate-pulse" />
                    <p className="text-xs">Bài học này chưa được cấu hình liên kết Video bài giảng</p>
                  </div>
                )}
              </div>

              <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl space-y-2">
                <span className="text-[10px] font-bold bg-blue-600/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                  Đang diễn ra
                </span>
                <h2 className="text-base font-bold text-black">{activeLesson.title}</h2>
                <p className="text-xs text-slate-400 leading-relaxed pt-1 border-t border-slate-800/50">
                  {activeLesson.description || "Bài học này nằm trong khung năng lực đào tạo chuẩn hệ thống. Chúc bạn có thời gian tiếp thu kiến thức hiệu quả!"}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-20">
              <Play size={40} className="stroke-[1.5] mb-2" />
              <p className="text-xs">Vui lòng chọn một bài giảng ở menu bên cạnh để bắt đầu học tập.</p>
            </div>
          )}
        </div>

        {/* CỘT PHẢI: SIDEBAR DANH SÁCH BÀI GIẢNG */}
        <div className="bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col max-h-[calc(100vh-73px)]">
          <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Nội dung bài học</h3>
            <span className="text-[10px] font-bold bg-slate-800 px-2 py-0.5 rounded text-slate-300">
              {course?.lessons?.length || 0} mục
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40 p-2 space-y-1">
            {course?.lessons && course.lessons.length > 0 ? (
              [...course.lessons]
                .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                .map((lesson: any, index: number) => {
                  const isCurrent = activeLesson?._id === lesson._id;
                  const isCompleted = checkLessonCompleted(lesson._id);

                  return (
                    <button
                      key={lesson._id || index}
                      onClick={() => handleSelectLesson(lesson)}
                      className={`w-full text-left p-3 rounded-xl flex items-start gap-3 transition group relative ${
                        isCurrent 
                          ? "bg-blue-600/10 border border-blue-500/30 text-black" 
                          : "hover:bg-slate-800/50 text-slate-300 border border-transparent"
                      }`}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {isCompleted ? (
                          <CheckCircle size={16} className="text-emerald-500 fill-emerald-500/10" />
                        ) : (
                          <div className={`w-4 h-4 rounded-full border-2 ${isCurrent ? "border-blue-400" : "border-slate-600 group-hover:border-slate-400"} flex items-center justify-center text-[9px] font-bold`}>
                            {index + 1}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <span className={`text-xs font-medium block truncate leading-snug ${isCurrent ? "text-blue-400 font-bold" : "group-hover:text-black"}`}>
                          {lesson.title}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1">
                          <Clock size={10} />
                          <span>{lesson.duration ? `${lesson.duration} phút` : "Bài học Video"}</span>
                        </div>
                      </div>
                    </button>
                  );
                })
            ) : (
              <p className="text-xs text-slate-500 italic p-4 text-center">Đang cập nhật bài giảng.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}