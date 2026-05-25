"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, User, CheckCircle, GraduationCap, Calendar, ShieldCheck, CreditCard } from "lucide-react";
import Link from "next/link";

import { getCourseBySlug } from "@/src/services/course";
import { getEnrollmentByCourse, enrollInCourse } from "@/src/services/enrollment.api";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();

  const courseSlug = (params.slug || params.id) as string;

  const [course, setCourse] = useState<any>(null);
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);

  // Tự động tải dữ liệu tuần tự chuẩn xác: Lấy Course theo Slug -> Lấy ID -> Check Enrollment
useEffect(() => {
  setIsMounted(true);
}, []);

// Sửa lại useEffect tải dữ liệu chính
useEffect(() => {
  if (!isMounted || !courseSlug) return; // Đợi mount xong mới xử lý data tránh lỗi SSR

  let isComponentMounted = true; 

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      // 1. Lấy thông tin khóa học
      const courseData = await getCourseBySlug(courseSlug) as any;
      if (!courseData || courseData.error) {
        if (isComponentMounted) setCourse(null);
        return;
      }

      if (isComponentMounted) setCourse(courseData);
      const realCourseId = courseData._id;

      // 2. Lấy token an toàn tại Client
      const token = localStorage.getItem("authToken") || 
                    document.cookie.split("; ").find(row => row.startsWith("authToken="))?.split("=")[1];
      
      if (!token) {
        if (isComponentMounted) setIsEnrolled(false);
        return;
      }

      // 3. Đối chiếu trạng thái đăng ký với Backend
      try {
        const enrollmentData = await getEnrollmentByCourse(realCourseId);
        
        if (isComponentMounted) {
          // 🔥 KIỂM TRA KỸ: Đảm bảo dữ liệu trả về hợp lệ và không phải mảng rỗng [] hay object trống {}
          if (enrollmentData && enrollmentData.isEnrolled === true) {
            setIsEnrolled(true); 
            console.log("✅ Kết quả: Học viên ĐÃ ĐĂNG KÝ khóa học này.");
          } else {
            setIsEnrolled(false); 
            console.log("ℹ️ Kết quả: Học viên CHƯA ĐĂNG KÝ khóa học này.");
          }
        }
      } catch (err: any) {
        console.log("Học viên chưa đăng ký khóa học.");
        if (isComponentMounted) setIsEnrolled(false);
      }

    } catch (error) {
      console.error("Lỗi hệ thống khi kết nối Backend:", error);
      if (isComponentMounted) {
        setCourse(null);
        setError("Không thể tải thông tin chi tiết khóa học");
      }
    } finally {
      if (isComponentMounted) setLoading(false);
    }
  };

  loadData();

  return () => {
    isComponentMounted = false;
  };
}, [courseSlug, isMounted]); // Thêm isMounted vào mảng dependency

  // Xử lý khi nhấn đăng ký (Dành cho khóa học chưa mua)
  const handleEnrollCourse = async () => {
    if (!course?._id) {
      setError("Không tìm thấy thông tin định danh khóa học");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      
      const result = await enrollInCourse(course._id);
      console.log("Đăng ký thành công:", result);
      
      setIsEnrolled(true);
      router.push(`/individuals/courses/${courseSlug}/learn`);
      
    } catch (error: any) {
      console.error("Lỗi ghi danh:", error);
      const errorMsg = error.message || "";

      if (errorMsg.includes("401")) {
        setError("Vui lòng đăng nhập để tiếp tục chương trình học");
        router.push("/login");
      } else if (errorMsg.includes("đã đăng ký") || errorMsg.includes("400")) {
        // Nếu backend báo đã đăng ký trước đó rồi, lập tức chuyển thẳng vào lớp
        setIsEnrolled(true);
        router.push(`/individuals/courses/${courseSlug}/learn`);
      } else {
        setError(errorMsg || "Không thể xử lý ghi danh. Vui lòng thử lại!");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50">
        <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-blue-600"></div>
        <p className="mt-3 text-sm text-slate-500 font-medium">Đang xác thực dữ liệu khóa học...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-sm border">
          <p className="text-red-500 font-bold text-base">Không tìm thấy dữ liệu</p>
          <p className="text-slate-400 text-xs mt-1">{error || "Khóa học không tồn tại hoặc chưa được xuất bản."}</p>
          <button onClick={() => router.push("/")} className="mt-4 text-xs bg-blue-600 hover:bg-blue-700 text-black px-4 py-2 rounded-xl font-semibold transition">
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  const instructorName = typeof course.instructor === "object" 
    ? course.instructor.name 
    : course.instructor || "Expert Instructor";

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-16">
      {/* BANNER */}
      <div className="bg-slate-900 text-black py-12 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-black mb-6 transition"
          >
            <ArrowLeft size={14} /> QUAY LẠI
          </button>
          
          <div className="space-y-4 max-w-3xl">
            <span className="px-2 py-0.5 bg-blue-600/20 text-blue-400 rounded text-xs font-bold uppercase tracking-wide border border-blue-500/20 capitalize">
              {course.level || "Beginner"}
            </span>
            <h1 className="text-2xl md:text-4xl font-extrabold text-black leading-tight">
              {course.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-slate-300 pt-2">
              <div className="flex items-center gap-1.5">
                <User size={16} className="text-blue-400" />
                <span>Giảng viên: <strong className="text-black font-medium">{instructorName}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <GraduationCap size={16} className="text-blue-400" />
                <span>Học viên: <strong className="text-black font-medium">{course.studentsCount || 0} đang học</strong></span>
              </div>
              {course.updatedAt && (
                <div className="flex items-center gap-1.5">
                  <Calendar size={16} className="text-slate-500" />
                  <span className="text-slate-400">Cập nhật: {new Date(course.updatedAt).toLocaleDateString("vi-VN")}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* NỘI DUNG CHÍNH */}
      <div className="max-w-5xl mx-auto px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm space-y-3">
              <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
                Giới thiệu khóa học
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {course.description || "Chưa có bài viết mô tả chi tiết cho chương trình đào tạo này."}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="font-bold text-base text-slate-900">
                  Nội dung chương trình học
                </h3>
                <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded">
                  {course.lessons?.length || 0} bài học
                </span>
              </div>

              <div className="space-y-2">
                {course.lessons && course.lessons.length > 0 ? (
                  [...course.lessons]
                    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                    .map((lesson: any, index: number) => (
                      <div 
                        key={lesson._id || index} 
                        className="p-3 border border-slate-100 rounded-xl bg-slate-50/30 flex items-center justify-between group hover:bg-slate-50 transition"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <CheckCircle size={15} className="text-slate-300 group-hover:text-blue-500 transition flex-shrink-0" />
                          <span className="text-xs font-bold text-slate-400 min-w-[40px]">Bài {lesson.order || index + 1}</span>
                          <span className="text-sm font-medium text-slate-700 truncate">{lesson.title}</span>
                        </div>
                        {lesson.videoUrl && (
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 flex-shrink-0">
                            Video
                          </span>
                        )}
                      </div>
                    ))
                ) : (
                  <p className="text-sm text-slate-400 italic py-4 text-center">Nội dung bài học đang được cập nhật.</p>
                )}
              </div>
            </div>
          </div>

          {/* SIDEBAR ĐIỀU KHIỂN NÚT ĐỘNG */}
          <div className="space-y-4 lg:sticky lg:top-6">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-md">
              
              <div className="aspect-video w-full bg-slate-100 relative border-b overflow-hidden flex items-center justify-center">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-slate-400 flex flex-col items-center gap-1">
                    <BookOpen size={36} className="stroke-[1.5]" />
                    <span className="text-[11px]">E-Learning Course</span>
                  </div>
                )}
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Học phí</span>
                  <div className="text-xl font-black text-slate-900">
                    {course.price === 0 ? (
                      <span className="text-emerald-600 font-bold">Miễn phí</span>
                    ) : (
                      <span>{course.price?.toLocaleString("vi-VN")}đ</span>
                    )}
                  </div>
                </div>

                {error && !isEnrolled && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs text-red-600 font-medium">{error}</p>
                  </div>
                )}

                {/* 🎯 NÚT TỰ ĐỘNG CHUẨN ĐÃ ĐƯỢC ĐỒNG BỘ TỪ HOÀN TOÀN BẰNG ID */}
                {isEnrolled ? (
                  <Link
                    href={`/individuals/courses/${courseSlug}/learn`}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-black font-bold py-3 px-4 rounded-xl transition text-center shadow-md block text-sm"
                  >
                    Vào lớp học ngay
                  </Link>
                ) : (
                  <button
                    onClick={handleEnrollCourse}
                    disabled={submitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-black font-bold py-3 px-4 rounded-xl transition text-center shadow-md text-sm flex items-center justify-center gap-2"
                  >
                    <CreditCard size={15} />
                    {submitting ? "Đang ghi danh..." : "Đăng ký học ngay"}
                  </button>
                )}

                <div className="pt-2 space-y-2 text-xs text-slate-500 font-medium border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span>Quyền truy cập học tập trọn đời</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span>Tự do quản lý tiến độ học cá nhân</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}