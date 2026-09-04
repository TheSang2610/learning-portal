"use client";

import { Suspense, useEffect, useState } from "react";
import { getErrorMessage } from "@/src/services/apiHelper";
import AnhDaiDien from "@/src/components/ui/AnhDaiDien";
import SafeImage from "@/src/components/ui/SafeImage";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  User,
  CheckCircle,
  Calendar,
  ShieldCheck,
  CreditCard,
  Star,
  ThumbsUp,
  ChevronDown,
  Loader2,
  Award,
  Clock,
  Sliders,
} from "lucide-react";
import Link from "next/link";

import { getCourseBySlug, type Course } from "@/src/services/course";
import { useDaGanVaoTrinhDuyet } from "@/src/hooks/nguoiDungLuu";
import type { Lesson } from "@/src/services/lesson.api";
import {
  getEnrollmentByCourse,
  enrollInCourse,
  getProgressStats,
} from "@/src/services/enrollment.api";
import { reviewService, Review, ReviewStats } from "@/src/services/review";
import { faqService, FaqItem } from "@/src/services/faq";

function CourseDetailSkeleton() {
  return (
    <div className="min-h-screen animate-pulse bg-white pb-24 antialiased">
      {/* 1. Hero Banner Skeleton */}
      <div className="border-b border-slate-200 bg-[#FBFCFD] py-16">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-12 px-6 md:px-12 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <div className="h-4 w-32 rounded bg-slate-200"></div>
            <div className="space-y-3">
              <div className="h-10 w-11/12 rounded bg-slate-200 md:w-3/4"></div>
              <div className="h-4 w-full rounded bg-slate-200"></div>
              <div className="h-4 w-5/6 rounded bg-slate-200"></div>
            </div>
            <div className="flex gap-4 pt-2">
              <div className="h-4 w-40 rounded bg-slate-200"></div>
              <div className="h-4 w-40 rounded bg-slate-200"></div>
            </div>
            <div className="flex items-center gap-4 pt-4">
              <div className="h-14 w-52 rounded-lg bg-slate-200"></div>
              <div className="h-4 w-48 rounded bg-slate-200"></div>
            </div>
          </div>
          <div className="order-first aspect-video w-full rounded-xl bg-slate-200 lg:order-last lg:col-span-5"></div>
        </div>
      </div>

      {/* 2. Sticky Sub-Navbar Skeleton */}
      <div className="hidden border-b border-slate-200 bg-white md:block">
        <div className="mx-auto flex max-w-[1400px] gap-8 px-12 py-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-5 w-24 rounded bg-slate-200"></div>
          ))}
        </div>
      </div>

      {/* 3. Main Content Skeleton */}
      <div className="mx-auto mt-12 max-w-[1400px] px-6 md:px-12">
        {/* Grid 4 thông số */}
        <div className="mb-12 grid grid-cols-2 gap-6 rounded-xl border border-slate-200 bg-slate-50/50 p-6 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-16 rounded bg-slate-200"></div>
              <div className="h-4 w-32 rounded bg-slate-200"></div>
            </div>
          ))}
        </div>

        {/* Cột trái & Cột phải */}
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
          {/* Cột trái (70%) */}
          <div className="space-y-16 lg:col-span-8">
            {/* Về khóa học */}
            <div className="space-y-4">
              <div className="h-6 w-48 rounded bg-slate-200"></div>
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-slate-200"></div>
                <div className="h-4 w-full rounded bg-slate-200"></div>
                <div className="h-4 w-4/5 rounded bg-slate-200"></div>
              </div>
            </div>

            {/* Chương trình học */}
            <div className="space-y-4">
              <div className="h-6 w-56 rounded bg-slate-200"></div>
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-5">
                    <div className="flex w-2/3 items-center gap-4">
                      <div className="h-4 w-6 rounded bg-slate-200"></div>
                      <div className="h-4 w-full rounded bg-slate-200"></div>
                    </div>
                    <div className="h-5 w-20 rounded-full bg-slate-200"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cột phải (30%) */}
          <div className="space-y-4 lg:col-span-4">
            <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="space-y-2">
                <div className="h-3 w-24 rounded bg-slate-200"></div>
                <div className="h-8 w-32 rounded bg-slate-200"></div>
              </div>
              <div className="h-12 w-full rounded-lg bg-slate-200"></div>
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <div className="h-4 w-3/4 rounded bg-slate-200"></div>
                <div className="h-4 w-5/6 rounded bg-slate-200"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CourseDetailPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Lay slug tu query string: ?slug=ten-khoa-hoc
  const courseSlug = searchParams.get("slug") || "";

  const [course, setCourse] = useState<Course | null>(null);
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  // false khi dung HTML o may chu, true sau khi React gan vao trinh duyet.
  const isMounted = useDaGanVaoTrinhDuyet();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loadingReviews, setLoadingReviews] = useState<boolean>(false);

  const [userProgress, setUserProgress] = useState<number>(0);
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>("");
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);

  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loadingFaqs, setLoadingFaqs] = useState<boolean>(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Thêm state để switch tab giống Coursera
  const [activeTab, setActiveTab] = useState<string>("about");

  const loadCourseFaqs = async (courseId: string) => {
    try {
      setLoadingFaqs(true);
      const faqsData = await faqService.getFaqsByCourse(courseId);
      setFaqs(faqsData || []);
    } catch (err) {
      console.error("Không thể tải danh sách câu hỏi FAQ của khóa học:", err);
    } finally {
      setLoadingFaqs(false);
    }
  };

  const loadReviewsAndStats = async (courseId: string) => {
    try {
      setLoadingReviews(true);
      const [reviewsData, statsData] = await Promise.all([
        reviewService.getCourseReviews(courseId, { limit: 10, sortBy: "newest" }),
        reviewService.getReviewStats(courseId),
      ]);
      setReviews(reviewsData.reviews || []);
      setStats(statsData);
    } catch (err) {
      console.error("Không thể tải dữ liệu đánh giá:", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    if (!isMounted || !courseSlug) return;

    let isComponentMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        // getCourseBySlug tra ve Course HOAC { error }, phai loai truong hop
        // loi ra truoc thi phan con lai moi chac chan la Course.
        const courseData = await getCourseBySlug(courseSlug);
        if (!courseData || "error" in courseData) {
          if (isComponentMounted) setCourse(null);
          return;
        }

        if (isComponentMounted) setCourse(courseData);
        const realCourseId = courseData._id;

        loadReviewsAndStats(realCourseId);
        loadCourseFaqs(realCourseId);

        // Truoc day cho nay doc token tu localStorage/cookie de doan xem da
        // dang nhap chua. Token gio nam trong cookie httpOnly nen JavaScript
        // khong con nhin thay - va cung khong can: `userInfo` la thu duy nhat
        // can biet o day, con dung sai thi hai loi goi ben duoi tu tra 401.
        if (!localStorage.getItem("userInfo")) {
          if (isComponentMounted) setIsEnrolled(false);
          return;
        }

        try {
          const [enrollmentData, progressData] = await Promise.all([
            getEnrollmentByCourse(realCourseId),
            getProgressStats(realCourseId).catch(() => null),
          ]);

          if (isComponentMounted) {
            if (enrollmentData && enrollmentData.isEnrolled === true) {
              setIsEnrolled(true);
              // Truoc day dong nay doc progressData?.totalProgress, ma
              // ProgressStats khong he co truong do (ten that la
              // progressPercentage). Ve mat kieu la undefined, nen ve phai cua
              // ?? luon thang - tuc la ket qua cua getProgressStats bi vut di,
              // luot goi API do khong dung vao viec gi.
              const currentProgress =
                progressData?.progressPercentage ?? enrollmentData?.totalProgress ?? 0;
              setUserProgress(currentProgress);
            } else {
              setIsEnrolled(false);
              setUserProgress(0);
            }
          }
        } catch {
          if (isComponentMounted) {
            setIsEnrolled(false);
            setUserProgress(0);
          }
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
  }, [courseSlug, isMounted]);

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      const updatedReview = await reviewService.markHelpful(reviewId);
      setReviews((prev) =>
        prev.map((r) =>
          r._id === reviewId ? { ...r, helpful: updatedReview.helpful } : r,
        ),
      );
    } catch (err) {
      alert(getErrorMessage(err, "Đã xảy ra lỗi"));
    }
  };

  const handleEnrollCourse = async () => {
    if (!course?._id) {
      setError("Không tìm thấy thông tin định danh khóa học");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const result = await enrollInCourse(course._id);

      setCourse((prevCourse) => {
        if (!prevCourse) return null;
        const newCount =
          result && result.studentsCount !== undefined
            ? result.studentsCount
            : (prevCourse.studentsCount || 0) + 1;

        return { ...prevCourse, studentsCount: newCount };
      });

      setIsEnrolled(true);
      router.refresh();
      router.push(`/learn?slug=${courseSlug}`);
    } catch (error) {
      console.error("Lỗi ghi danh:", error);
      const errorMsg = getErrorMessage(error, "");

      if (errorMsg.includes("401")) {
        setError("Vui lòng đăng nhập để tiếp tục chương trình học");
        // Khong co route /login - dang nhap la modal tren trang chu
        router.push("/?auth=login");
      } else if (errorMsg.includes("đã đăng ký") || errorMsg.includes("400")) {
        setIsEnrolled(true);
        router.push(`/learn?slug=${courseSlug}`);
      } else {
        setError(errorMsg || "Không thể xử lý ghi danh. Vui lòng thử lại!");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <CourseDetailSkeleton />;
  }

  if (!course) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
        <div className="max-w-sm rounded-2xl border bg-white p-8 text-center shadow-sm">
          <p className="text-base font-bold text-red-500">Không tìm thấy dữ liệu</p>
          <p className="mt-1 text-xs text-slate-500">
            {error || "Khóa học không tồn tại hoặc chưa được xuất bản."}
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  const instructorName =
    typeof course.instructor === "object"
      ? course.instructor.name
      : course.instructor || "Expert Instructor";

  return (
    <div className="min-h-screen bg-white pb-24 antialiased">
      {/* 1. HERO BANNER - FULL WIDTH CHUẨN COURSERA */}
      <div className="border-b border-slate-200 bg-[#FBFCFD] py-16 text-slate-900">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-12 px-6 md:px-12 lg:grid-cols-12">
          {/* Thông tin khóa học */}
          <div className="space-y-6 lg:col-span-7">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-blue-600 transition hover:underline"
            >
              <ArrowLeft size={14} /> QUAY LẠI DANH MỤC
            </button>

            <div className="space-y-4">
              <h1 className="text-3xl leading-[1.15] font-semibold tracking-tight text-slate-900 md:text-5xl">
                {course.title}
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed font-normal text-slate-600">
                {course.description?.split(".")[0]}. Học cách thiết kế hệ thống thực
                chiến, tăng tư duy logic cốt lõi.
              </p>
            </div>

            {/* Khối Đánh giá nhanh dưới Title */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2 text-sm text-slate-700">
              {stats && (
                <div className="flex items-center gap-1">
                  <Star size={16} className="fill-amber-500 text-amber-500" />
                  <span className="font-bold text-slate-900">
                    {Number(stats.averageRating).toFixed(1)}
                  </span>
                  <span className="text-slate-500">({stats.totalReviews} đánh giá)</span>
                </div>
              )}
              <div className="hidden h-4 w-px bg-slate-300 sm:block"></div>
              <div className="flex items-center gap-1.5">
                <User size={16} className="text-slate-500" />
                <span>
                  Giảng viên:{" "}
                  <strong className="font-medium text-slate-950">{instructorName}</strong>
                </span>
              </div>
            </div>

            {/* Nút Đăng ký To bự trên Banner (Khác biệt lớn nhất của Coursera) */}
            <div className="flex flex-col items-start gap-4 pt-4 sm:flex-row sm:items-center">
              {isEnrolled ? (
                <Link
                  href={`/learn?slug=${courseSlug}`}
                  className="rounded-lg bg-blue-700 px-8 py-4 text-center text-base font-bold tracking-wide text-white shadow-sm transition hover:bg-blue-800"
                >
                  Vào lớp học ngay
                </Link>
              ) : (
                <button
                  onClick={handleEnrollCourse}
                  disabled={submitting}
                  className="flex items-center gap-3 rounded-lg bg-blue-700 px-10 py-4 text-center text-base font-bold tracking-wide text-white shadow-md transition hover:bg-blue-800 disabled:bg-blue-400"
                >
                  {submitting ? "Đang xử lý..." : "Đăng ký học miễn phí"}
                  <span className="text-xs font-normal opacity-80">Bắt đầu ngay</span>
                </button>
              )}
              <div className="text-xs text-slate-500">
                <span className="font-bold text-slate-900">
                  {(course.studentsCount || 0).toLocaleString()}
                </span>{" "}
                học viên đã tham gia khóa học này.
              </div>
            </div>
          </div>

          {/* Hình ảnh/Thumbnail bên phải chuẩn Coursera */}
          <div className="relative order-first aspect-video w-full overflow-hidden rounded-xl border border-slate-200/60 shadow-2xl lg:order-last lg:col-span-5">
            {course.thumbnail ? (
              <SafeImage
                src={course.thumbnail}
                alt={course.title}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center bg-slate-100 text-slate-500">
                <BookOpen size={48} className="stroke-[1.2]" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. SUB-NAVBAR CHỈ MỤC (STICKY SUB-HEADER) */}
      <div className="sticky top-0 z-40 hidden border-b border-slate-200 bg-white shadow-sm md:block">
        <div className="mx-auto flex max-w-[1400px] gap-8 px-12">
          {[
            { id: "about", label: "Tổng quan" },
            { id: "curriculum", label: "Chương trình học" },
            { id: "faqs", label: "Câu hỏi thường gặp" },
            { id: "reviews", label: "Đánh giá" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                document
                  .getElementById(tab.id)
                  ?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
              className={`border-b-2 py-4 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "border-blue-700 font-bold text-blue-700"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. NỘI DUNG CHÍNH - 3 THÔNG SỐ SƠ LƯỢC KẾ HOẠCH */}
      <div className="mx-auto mt-12 max-w-[1400px] px-6 md:px-12">
        {/* Khối Grid 4 cột tổng quan thông số kĩ thuật */}
        <div className="mb-12 grid grid-cols-2 gap-6 rounded-xl border border-slate-200 bg-slate-50/50 p-6 md:grid-cols-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
              <Award size={14} className="text-blue-600" /> Tiến độ học
            </div>
            <p className="text-sm font-bold text-slate-800">Cấp chứng chỉ hoàn thành</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
              <Clock size={14} className="text-blue-600" /> Thời gian học
            </div>
            <p className="text-sm font-bold text-slate-800">
              Khoảng 4 tháng (Tự điều chỉnh)
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
              <Sliders size={14} className="text-blue-600" /> Cấp độ chuyên môn
            </div>
            <p className="text-sm font-bold text-slate-800 capitalize">
              {course.level || "Beginner level"}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
              <Calendar size={14} className="text-blue-600" /> Lịch trình học
            </div>
            <p className="text-sm font-bold text-slate-800">100% Linh hoạt theo ý bạn</p>
          </div>
        </div>

        {/* Bố cục Grid chính: Cột trái (70%) - Cột phải (30%) */}
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
          {/* CỘT TRÁI CHỨA NỘI DUNG CHI TIẾT */}
          <div className="space-y-16 lg:col-span-8">
            {/* Tab 1: About */}
            <section id="about" className="scroll-mt-20 space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Giới thiệu về khóa học này
              </h2>
              <div className="pr-4 text-base leading-relaxed font-normal whitespace-pre-line text-slate-700">
                {course.description ||
                  "Chưa có bài viết mô tả chi tiết cho chương trình đào tạo này."}
              </div>
            </section>

            {/* Tab 2: Curriculum */}
            <section id="curriculum" className="scroll-mt-20 space-y-6">
              <div className="flex items-end justify-between border-b border-slate-200 pb-3">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  Nội dung chương trình đào tạo
                </h2>
                <span className="rounded bg-slate-100 px-2.5 py-1 text-xs font-bold tracking-wide text-slate-500 uppercase">
                  {course.lessons?.length || 0} Học phần bài giảng
                </span>
              </div>

              <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                {course.lessons && course.lessons.length > 0 ? (
                  [...(course.lessons as Lesson[])]
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((lesson, index: number) => (
                      <div
                        key={lesson._id || index}
                        className="group flex items-center justify-between bg-white p-4 transition hover:bg-slate-50/60 md:p-5"
                      >
                        <div className="flex min-w-0 items-center gap-4">
                          <span className="w-6 text-center text-sm font-bold text-slate-500 group-hover:text-blue-600">
                            {index + 1}
                          </span>
                          <CheckCircle
                            size={16}
                            className="flex-shrink-0 text-slate-400 transition-colors group-hover:text-blue-600"
                          />
                          <span className="truncate text-sm font-medium text-slate-800 md:text-base">
                            {lesson.title}
                          </span>
                        </div>
                        {lesson.videoUrl && (
                          <span className="flex-shrink-0 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-600">
                            Bài học Video
                          </span>
                        )}
                      </div>
                    ))
                ) : (
                  <p className="bg-slate-50/50 py-8 text-center text-sm text-slate-500 italic">
                    Nội dung bài học hiện tại đang được xây dựng.
                  </p>
                )}
              </div>
            </section>

            {/* Tab 3: FAQs */}
            <section id="faqs" className="scroll-mt-20 space-y-6">
              {(loadingFaqs || faqs.length > 0) && (
                <div className="space-y-4">
                  <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
                    Các câu hỏi thường gặp hệ thống
                  </h2>

                  {loadingFaqs ? (
                    <div className="flex items-center gap-2 py-4 text-xs text-slate-500">
                      <Loader2 className="animate-spin text-blue-600" size={16} />
                      <span>Đang kết nối hệ thống giải đáp...</span>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                      {faqs.map((faq, index) => {
                        const isOpen = openFaqIndex === index;
                        return (
                          <div key={faq._id || index} className="p-1">
                            <button
                              onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                              className="group flex w-full items-center justify-between p-4 text-left select-none"
                            >
                              <span className="pr-4 text-base font-semibold text-slate-800 transition-colors group-hover:text-blue-700">
                                {faq.question}
                              </span>
                              <ChevronDown
                                size={18}
                                className={`flex-shrink-0 text-slate-500 transition-transform duration-300 ${
                                  isOpen ? "rotate-180 text-blue-700" : ""
                                }`}
                              />
                            </button>

                            <div
                              className={`grid transition-all duration-200 ease-in-out ${
                                isOpen
                                  ? "grid-rows-[1fr] opacity-100"
                                  : "grid-rows-[0fr] opacity-0"
                              }`}
                            >
                              <div className="overflow-hidden">
                                <p className="mx-4 mt-1 mb-4 rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
                                  {faq.answer}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Tab 4: Reviews */}
            <section id="reviews" className="scroll-mt-20 space-y-6">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Ý kiến từ cộng đồng học viên
              </h2>

              {stats && (
                <div className="grid grid-cols-1 items-center gap-6 rounded-xl border border-slate-200 bg-slate-50/50 p-6 md:grid-cols-12">
                  <div className="border-slate-200 py-2 text-center md:col-span-4 md:border-r">
                    <p className="text-5xl font-black tracking-tight text-slate-900">
                      {Number(stats.averageRating).toFixed(1)}
                    </p>
                    <div className="my-2 flex justify-center text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          fill={
                            i < Math.round(Number(stats.averageRating))
                              ? "currentColor"
                              : "none"
                          }
                        />
                      ))}
                    </div>
                    <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                      {stats.totalReviews} xếp hạng thực tế
                    </p>
                  </div>

                  <div className="space-y-2 px-2 md:col-span-8">
                    {Object.entries(stats.ratingDistribution)
                      .reverse()
                      .map(([star, count]) => (
                        <div
                          key={star}
                          className="flex items-center gap-3 text-xs font-semibold text-slate-700"
                        >
                          <span className="w-3 text-right">{star}</span>
                          <Star
                            size={12}
                            fill="currentColor"
                            className="flex-shrink-0 text-amber-500"
                          />
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full bg-amber-500"
                              style={{
                                width: `${stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0}%`,
                              }}
                            ></div>
                          </div>
                          <span className="w-8 text-right text-slate-500">{count}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* KHU VỰC THÊM ĐÁNH GIÁ CỦA BẢN THÂN */}
              {isEnrolled && userProgress >= 25 ? (
                <div className="space-y-4 rounded-xl border border-blue-100 bg-blue-50/40 p-5 shadow-sm">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <Star size={16} className="fill-amber-500 text-amber-500" />
                    Chia sẻ trải nghiệm học của bạn (Tiến độ: {userProgress}%)
                  </h4>

                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="text-amber-500 transition hover:scale-110"
                      >
                        <Star
                          size={20}
                          fill={star <= newRating ? "currentColor" : "none"}
                        />
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Nội dung kiến thức có sát với thực chiến không? Hãy đánh giá trung thực để cải thiện hệ thống nhé..."
                      className="min-h-[90px] w-full resize-none rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-inner focus:border-blue-600 focus:outline-none"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={async () => {
                          if (!newComment.trim()) return alert("Vui lòng nhập phản hồi!");
                          try {
                            setIsSubmittingReview(true);
                            await reviewService.createReview({
                              courseId: course._id,
                              rating: newRating,
                              comment: newComment,
                            });
                            setNewComment("");
                            loadReviewsAndStats(course._id);
                            alert("Gửi phản hồi thành công!");
                          } catch (err) {
                            alert(getErrorMessage(err, "Gặp sự cố khi gửi"));
                          } finally {
                            setIsSubmittingReview(false);
                          }
                        }}
                        disabled={isSubmittingReview}
                        className="rounded-lg bg-blue-700 px-5 py-2.5 text-xs font-bold tracking-wider text-white uppercase transition hover:bg-blue-800 disabled:bg-slate-300"
                      >
                        {isSubmittingReview ? "Đang gửi đi..." : "Đăng tải phản hồi"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : isEnrolled ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
                  <p className="text-xs font-semibold text-slate-500">
                    🔒 Bạn cần tích lũy học tập tối thiểu{" "}
                    <strong className="text-slate-900">25%</strong> tổng thời lượng khóa
                    học để mở khóa tính năng viết bình luận.
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Tiến trình lớp học hiện tại của bạn: {userProgress}%
                  </p>
                </div>
              ) : null}

              {/* LIST HIỂN THỊ ĐÁNH GIÁ */}
              <div className="space-y-4">
                {loadingReviews ? (
                  <p className="py-4 text-center text-xs text-slate-500">
                    Đang đồng bộ bình luận...
                  </p>
                ) : reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div
                      key={review._id}
                      className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <AnhDaiDien
                            src={review.student?.avatar}
                            ten={review.student?.name}
                            size={36}
                            nenChuCai="bg-blue-100 text-blue-700"
                          />
                          <div>
                            <p className="text-sm font-bold text-slate-800">
                              {review.student?.name}
                            </p>
                            <div className="mt-0.5 flex gap-0.5 text-amber-500">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={12}
                                  fill={i < review.rating ? "currentColor" : "none"}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-[11px] font-medium text-slate-500">
                          {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>

                      <p className="pl-1 text-sm leading-relaxed font-normal text-slate-600">
                        {review.comment}
                      </p>

                      <div className="flex items-center gap-4 pt-1 pl-1">
                        <button
                          onClick={() => handleMarkHelpful(review._id)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-blue-700"
                        >
                          <ThumbsUp size={13} />
                          <span>Bình luận hữu ích ({review.helpful})</span>
                        </button>
                        {review.isVerifiedPurchase && (
                          <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            Tài khoản đã được xác thực
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="rounded-xl border border-dashed py-6 text-center text-sm text-slate-500 italic">
                    Khóa học này hiện chưa nhận được phản hồi.
                  </p>
                )}
              </div>
            </section>
          </div>

          {/* CỘT PHẢI: BANNER BOX PHỤ (TRÁNH BỊ TRỐNG KHI CUỘN) */}
          <div className="space-y-4 lg:sticky lg:top-24 lg:col-span-4">
            <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-md">
              <div className="space-y-1">
                <span className="block text-xs font-bold tracking-widest text-slate-500 uppercase">
                  Mức giá chương trình
                </span>
                <div className="text-3xl font-bold tracking-tight text-slate-900">
                  {course.price === 0 ? (
                    <span className="font-bold text-emerald-600">Miễn Phí</span>
                  ) : (
                    <span>{course.price?.toLocaleString("vi-VN")}đ</span>
                  )}
                </div>
              </div>

              {error && !isEnrolled && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-xs font-medium text-red-600">{error}</p>
                </div>
              )}

              {isEnrolled ? (
                <Link
                  href={`/learn?slug=${courseSlug}`}
                  className="block w-full rounded-lg bg-blue-700 px-4 py-3 text-center text-sm font-bold tracking-wider text-white uppercase shadow-md transition hover:bg-blue-800"
                >
                  Tiếp tục học tập
                </Link>
              ) : (
                <button
                  onClick={handleEnrollCourse}
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-center text-sm font-bold tracking-wider text-white uppercase shadow-md transition hover:bg-slate-800 disabled:bg-slate-500"
                >
                  <CreditCard size={15} />
                  {submitting ? "Đang liên kết..." : "Ghi danh học viên"}
                </button>
              )}

              <div className="space-y-3 border-t border-slate-100 pt-4 text-xs font-medium text-slate-600">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={16} className="flex-shrink-0 text-emerald-500" />
                  <span>Quyền sở hữu chương trình vô thời hạn</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={16} className="flex-shrink-0 text-emerald-500" />
                  <span>Tự động nhận bài tập & giáo trình mới nhất</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Suspense la bat buoc: useSearchParams() khong the prerender tinh neu thieu boundary.
// Co boundary thi Next dung san khung HTML, Vercel phuc vu tu CDN, khong ton serverless.
export default function CourseDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
        </div>
      }
    >
      <CourseDetailPageContent />
    </Suspense>
  );
}
