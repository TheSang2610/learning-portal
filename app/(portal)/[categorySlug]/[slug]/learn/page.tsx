"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Play, CheckCircle, Award, BookOpen, Clock, FileText } from "lucide-react";

// Import các thành phần Modal Chứng chỉ & Sub-view Quiz riêng biệt
import CertificateModal from "@/src/components/certificate/CertificateModal";
import StudentQuizView from "@/src/components/quiz/StudentQuizView"; // 🎯 ĐƯỜNG IMPORT MỚI

import { getCourseBySlug } from "@/src/services/course";
import {
  getEnrollmentByCourse,
  startLesson,
  updateWatchTime,
  completeLesson,
  getProgressStats,
  completeCourse,
} from "@/src/services/enrollment.api";

// Rút gọn bớt import dư thừa liên quan đến submit vì đã được chuyển sang file Quiz riêng
import { getCourseQuizzes } from "@/src/services/quizService"; 

export default function CourseLearnPage() {
  const params = useParams();
  const router = useRouter();
  
  const courseSlug = (params.slug || params.id) as string;
  const categorySlug = params.categorySlug as string;
  const videoRef = useRef<HTMLVideoElement>(null);

  const [course, setCourse] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuiz, setCurrentQuiz] = useState<any>(null);
  const [isDoingQuiz, setIsDoingQuiz] = useState<boolean>(false);
  const [showCertificate, setShowCertificate] = useState<boolean>(false);

  useEffect(() => {
    if (!courseSlug) return;

    const initLearnPage = async () => {
      try {
        setLoading(true);
        const courseData = await getCourseBySlug(courseSlug) as any;
        if (!courseData || courseData.error) {
          setCourse(null);
          setLoading(false);
          return;
        }
        setCourse(courseData);

        const realCourseId = courseData._id;
        const enrollData = await getEnrollmentByCourse(realCourseId);
        setEnrollment(enrollData);

        const stats = await getProgressStats(realCourseId);
        setProgress(stats);

        if (courseData?.lessons && courseData.lessons.length > 0) {
          const sortedLessons = [...courseData.lessons].sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
          const lastActiveLessonId = enrollData?.currentLessonId;
          const defaultLesson = sortedLessons.find((l: any) => l._id === lastActiveLessonId) || sortedLessons[0];
          
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

  const handleSelectLesson = async (lesson: any) => {
    if (!course?._id) return;
    setActiveLesson(lesson);
    try {
      await startLesson(course._id, lesson._id);
      const history = enrollment?.completedLessons?.find((h: any) => h.lessonId === lesson._id);
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
      const response = await completeLesson(course._id, activeLesson._id, duration) as any;
      
      const updatedEnroll = await getEnrollmentByCourse(course._id);
      setEnrollment(updatedEnroll);

      const newStats = await getProgressStats(course._id);
      setProgress(newStats);

      if (newStats?.progressPercentage === 100 || newStats?.completedCount === course?.lessons?.length) {
        await completeCourse(course._id);
        setShowCertificate(true); 
      } else {
        alert(response?.message || `Chúc mừng bạn đã hoàn thành phần video bài học: ${activeLesson.title}`);
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
    if (!enrollment?.lessonProgress) return false;
    const found = enrollment.lessonProgress.find((lp: any) => lp.lesson?._id === lessonId || lp.lesson === lessonId);
    return found?.status === 'completed';
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col justify-center items-center bg-slate-900 text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="mt-3 text-xs text-slate-400">Đang chuẩn bị phòng học trực tuyến...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="h-full flex flex-col justify-center items-center bg-[#0f172a] text-white p-4">
        <div className="bg-slate-900 p-8 rounded-2xl shadow-sm text-center max-w-sm border border-slate-800">
          <p className="text-red-500 font-bold text-base">Không vào được phòng học</p>
          <p className="text-slate-400 text-xs mt-1">Khóa học không tồn tại hoặc bạn chưa đăng ký thành viên.</p>
          <button onClick={() => router.push("/")} className="mt-4 text-xs bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition">
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#0f172a] text-slate-100 flex flex-col">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <button 
            onClick={() => router.push(`/${categorySlug}/${courseSlug}`)}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-white truncate">{course?.title}</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">Giảng viên: {course?.instructor?.name || "Chuyên gia"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/50">
          <Award size={16} className="text-yellow-500" />
          <div className="text-right">
            <span className="text-xs font-bold block text-white"> Tiến độ: {progress?.progressPercentage || 0}%</span>
            <span className="text-[10px] text-slate-400 block">Bài đã xong: {progress?.completedCount || progress?.completedLessons || 0}/{course?.lessons?.length || 0}</span>
          </div>
        </div>
      </header>

      <div className="w-full flex-1 grid grid-cols-1 md:grid-cols-12 h-[calc(100vh-73px)] overflow-hidden bg-[#0f172a]">
        <div className="col-span-12 md:col-span-9 min-w-0 p-6 flex flex-col gap-4 overflow-y-auto">
          {isDoingQuiz && currentQuiz && currentQuiz._id ? (
            /* 🎯 GỌI COMPONENT QUIZ ĐÃ TÁCH FILE */
            <StudentQuizView 
              quizId={currentQuiz._id} 
              onClose={() => setIsDoingQuiz(false)} 
              onSuccess={handleQuizSuccess}
            />
          ) : activeLesson ? (
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

              <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-blue-600/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                      Đang diễn ra
                    </span>
                    {checkLessonCompleted(activeLesson._id) && (
                      <span className="text-[10px] font-bold bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                        Đã hoàn thành
                      </span>
                    )}
                  </div>
                  <h2 className="text-base font-bold text-white">{activeLesson.title}</h2>
                  <p className="text-xs text-slate-400 leading-relaxed pt-1">
                    {activeLesson.description || "Bài học này nằm trong khung năng lực đào tạo chuẩn hệ thống."}
                  </p>
                </div>

                <div className="w-full md:w-auto flex flex-col md:flex-row items-stretch gap-2 flex-shrink-0 pt-2 md:pt-0">
                  {currentQuiz && (
                    <button
                      onClick={() => setIsDoingQuiz(true)}
                      className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl font-bold text-xs shadow-md shadow-orange-900/20 transition-all transform active:scale-95"
                    >
                      <FileText size={16} />
                      Làm bài kiểm tra ({currentQuiz.passingScore}% để đạt)
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-20">
              <Play size={40} className="stroke-[1.5] mb-2" />
              <p className="text-xs">Vui lòng chọn một bài giảng ở menu bên cạnh để bắt đầu học tập.</p>
            </div>
          )}
        </div>

        <div className="col-span-12 md:col-span-3 bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col min-h-0 overflow-hidden">
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
                          ? "bg-blue-600/10 border border-blue-500/30 text-white" 
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
                        <span className={`text-xs font-medium block truncate leading-snug ${isCurrent ? "text-blue-400 font-bold" : "group-hover:text-white"}`}>
                          {lesson.title}
                        </span>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                            <Clock size={10} />
                            <span>{lesson.duration ? `${lesson.duration} phút` : "Bài học Video"}</span>
                          </div>
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

      <CertificateModal
        isOpen={showCertificate}
        onClose={() => setShowCertificate(false)}
        enrollmentId={enrollment?._id}
        courseTitle={course?.title}
        instructorName={course?.instructor?.name}
      />
    </div>
  );
}