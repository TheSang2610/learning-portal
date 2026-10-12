"use client";

import { Suspense } from "react";
import { Play } from "lucide-react";

import AssistantChatBox from "@/src/components/features/portal/assistant/AssistantChat";
import CertificateModal from "@/src/components/features/portal/learn/parts/CertificateModal";
import LessonNote from "@/src/components/features/portal/learn/parts/LessonNotes";
import LessonQa from "@/src/components/features/portal/learn/parts/LessonQuestions";
import StudentQuizView from "@/src/components/features/portal/learn/parts/StudentQuizView";
import { LEARN } from "@/src/constants/portal/learn-page";
import { registered } from "@/src/lib/enrollment";

import { useCourseLearn } from "./hooks/useCourseLearn";
import CourseLearnSkeleton from "./parts/CourseLearnSkeleton";
import LearnHeader from "./parts/LearnHeader";
import LearnNotFound from "./parts/LearnNotFound";
import LessonInfo from "./parts/LessonInfo";
import LessonPlayer from "./parts/LessonPlayer";
import LessonSidebar from "./parts/LessonSidebar";
import styles from "./CourseLearn.module.scss";

function CourseLearnContent() {
  const s = useCourseLearn();
  const { course, activeLesson, enrollment, router } = s;

  if (s.loading) {
    return <CourseLearnSkeleton />;
  }

  if (!course) {
    return <LearnNotFound onHome={() => router.push(LEARN.homeHref)} />;
  }

  return (
    <div className={styles.col5}>
      <LearnHeader
        course={course}
        progress={s.progress}
        onBack={() => router.push(LEARN.courseIntroHref(s.courseSlug))}
      />

      {/* KHU VỰC BÀI HỌC VÀ MENU DANH SÁCH */}
      <div className={styles.grid2}>
        {/* VIEW TRÁI: VIDEO & NỘI DUNG BÀI HỌC CÙNG BÀI KIỂM TRA */}
        <div className={styles.scroller}>
          {s.isDoingQuiz && s.currentQuiz && s.currentQuiz._id ? (
            <StudentQuizView
              quizId={s.currentQuiz._id}
              onClose={() => s.setIsDoingQuiz(false)}
              onSuccess={s.handleQuizSuccess}
            />
          ) : activeLesson ? (
            <div className={styles.stack4}>
              <LessonPlayer
                lesson={activeLesson}
                videoRef={s.videoRef}
                embedVideo={s.embedVideo}
                videoError={s.videoError}
                onLoadedMetadata={s.handleLoadedMetadata}
                onEnded={s.handleVideoEnded}
                onVideoError={s.setVideoError}
                onOpenCourse={() => router.push(LEARN.courseHref(s.courseSlug))}
                expired={Boolean(enrollment?.isEnrolled && enrollment.expired)}
                watermark={
                  s.user ? `${s.user.email} · ${(s.user._id ?? "").slice(-6)}` : undefined
                }
              />
              <LessonInfo s={s} lesson={activeLesson} />
            </div>
          ) : (
            <div className={styles.card9}>
              <Play size={40} className={styles.box18} />
              <p className={styles.text9}>{LEARN.noLesson}</p>
            </div>
          )}

          {/* Hoi dap nam DUOI noi dung bai, trong cung cot cuon.
              Ba dieu kien deu can:
                - daDangKy: may chu kiem lai bang duocXemNoiDung() nen day chi
                  de khong bay ra mot khu vuc bam vao chi de an 403.
                - activeLesson: cau hoi gan theo BAI, chua chon bai thi khong co
                  gi de hoi ve.
                - !isDoingQuiz: dang lam bai kiem tra ma cuon xuong thay o hoi
                  dap la moi nguoi ta di hoi bai - xem loi nhac cua tro ly, luat
                  "khong lam ho bai danh gia" cung tu do ra. */}
          {registered(enrollment) &&
            course?._id &&
            activeLesson?._id &&
            !s.isDoingQuiz && (
              <>
                {/* Ghi chu dat TREN hoi dap: ghi chu la viec lam trong luc xem,
                  con hoi dap la viec lam khi da xem xong ma van khong hieu. */}
                <LessonNote
                  courseId={course._id}
                  lessonId={activeLesson._id}
                  getVideoPosition={s.getVideoPosition}
                  jumpTo={s.jumpTo}
                />

                <LessonQa courseId={course._id} lessonId={activeLesson._id} />
              </>
            )}
        </div>

        <LessonSidebar s={s} />
      </div>

      {/* Chi dung khi thuc su co ban ghi dang ky: CertificateModal lay chung
          chi theo enrollmentId, dua chuoi rong vao la no goi API vo ich. */}
      {registered(enrollment) && (
        <CertificateModal
          isOpen={s.showCertificate}
          onClose={() => s.setShowCertificate(false)}
          enrollmentId={enrollment._id}
        />
      )}

      {/* Tro giang chi hien khi DA ghi danh. May chu van kiem quyen lai mot lan
          nua (duocXemNoiDung trong troLyController) — day chi la de khong bay
          ra mot cai nut bam vao chi de an 403. */}
      {registered(enrollment) && course?._id && (
        <AssistantChatBox
          courseId={course._id}
          lessonId={activeLesson?._id}
          tenBai={activeLesson?.title}
        />
      )}
    </div>
  );
}

// Suspense la bat buoc: useSearchParams() khong the prerender tinh neu thieu boundary.
// Co boundary thi Next dung san khung HTML, Vercel phuc vu tu CDN, khong ton serverless.
export default function CourseLearn() {
  return (
    <Suspense
      fallback={
        <div className={styles.page}>
          <div className={styles.spinner} />
        </div>
      }
    >
      <CourseLearnContent />
    </Suspense>
  );
}
