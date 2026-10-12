import Link from "next/link";
import { ArrowLeft, BookOpen, Star, User } from "lucide-react";

import SafeImage from "@/src/components/ui/SafeImage";
import { COURSE_PAGE as C } from "@/src/constants/portal/course-page";
import type { Course } from "@/src/services/course";
import { formatMoney } from "@/src/services/order";
import type { ReviewStats } from "@/src/services/review";

import styles from "../CourseDetail.module.scss";

interface CourseHeroProps {
  course: Course;
  courseSlug: string;
  stats: ReviewStats | null;
  isEnrolled: boolean;
  submitting: boolean;
  onBack: () => void;
  onMainAction: () => void;
}

/* 1. HERO BANNER - FULL WIDTH CHUẨN COURSERA */
export default function CourseHero({
  course,
  courseSlug,
  stats,
  isEnrolled,
  submitting,
  onBack,
  onMainAction,
}: CourseHeroProps) {
  const H = C.hero;
  const instructorName =
    typeof course.instructor === "object"
      ? course.instructor?.name || C.instructorFallback
      : course.instructor || C.instructorFallback;

  return (
    <div className={styles.box23}>
      <div className={styles.container}>
        {/* Thông tin khóa học */}
        <div className={styles.stack}>
          {/* -my-2 py-2: noi cao vung cham len 40px cho ngon tay ma khong
              day chu xuong. Ban cu cao dung 16px - tren dien thoai bam
              truot la chuyen binh thuong. */}
          <button onClick={onBack} className={styles.button2}>
            <ArrowLeft size={14} /> {H.back}
          </button>

          <div className={styles.stack5}>
            <h1 className={styles.title}>{course.title}</h1>
            <p className={styles.text3}>
              {course.description?.split(".")[0]}
              {H.taglineSuffix}
            </p>
          </div>

          {/* Khối Đánh giá nhanh dưới Title */}
          <div className={styles.row5}>
            {stats && (
              <div className={styles.row6}>
                <Star size={16} className={styles.box24} />
                <span className={styles.label}>
                  {Number(stats.averageRating).toFixed(1)}
                </span>
                <span className={styles.label2}>
                  {H.reviewsCount(stats.totalReviews)}
                </span>
              </div>
            )}
            <div className={styles.box25}></div>
            <div className={styles.row7}>
              <User size={16} className={styles.label2} />
              <span>
                {H.instructor}
                <strong className={styles.strong}>{instructorName}</strong>
              </span>
            </div>
          </div>

          {/* Nút Đăng ký To bự trên Banner (Khác biệt lớn nhất của Coursera) */}
          <div className={styles.col}>
            {isEnrolled ? (
              <Link href={C.learnHref(courseSlug)} className={styles.card4}>
                {H.enter}
              </Link>
            ) : (
              <button
                onClick={onMainAction}
                disabled={submitting}
                className={styles.button3}
              >
                {submitting
                  ? H.processing
                  : (course.price ?? 0) > 0
                    ? H.buy(formatMoney(course.price ?? 0))
                    : H.freeEnroll}
                <span className={styles.label3}>
                  {(course.price ?? 0) > 0 ? H.transferQr : H.startNow}
                </span>
              </button>
            )}
            <div className={styles.box26}>
              <span className={styles.label}>
                {(course.studentsCount || 0).toLocaleString()}
              </span>{" "}
              {H.joined}
            </div>
          </div>
        </div>

        {/* Hình ảnh/Thumbnail bên phải chuẩn Coursera */}
        <div className={styles.box27}>
          {course.thumbnail ? (
            <SafeImage
              src={course.thumbnail}
              alt={course.title}
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className={styles.box28}
            />
          ) : (
            <div className={styles.col2}>
              <BookOpen size={48} className={styles.box29} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
