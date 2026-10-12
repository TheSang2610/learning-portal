"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { updateUrl, loginUrl } from "@/src/components/features/portal/auth/loginUrl";
import { LEARN } from "@/src/constants/portal/learn-page";
import { useUserLoading, useStoredUser } from "@/src/hooks/userStore";
import { registered, getLessonId, getProgress } from "@/src/lib/enrollment";
import { getCourseBySlug, type Course } from "@/src/services/course";
import {
  completeCourse,
  completeLesson,
  getEnrollmentByCourse,
  getProgressStats,
  startLesson,
  updateWatchTime,
  type EnrollmentByCourseResponse,
  type ProgressStats,
} from "@/src/services/enrollment.api";
import type { Lesson } from "@/src/services/lesson.api";
import { getCourseQuizzes, type Quiz } from "@/src/services/quizService";
import { getEmbedUrl } from "@/src/services/videoEmbed";

import { useLessonVideo } from "./useLessonVideo";

// Xep danh sach quiz tho thanh bang tra theo id bai hoc. Quiz khong gan bai
// nao (lesson rong) la bai kiem tra cuoi khoa - khong thuoc bai nao nen bo
// qua o day, dung voi cach cu la loc theo dung lessonId.
const groupQuizzesByLesson = (items: Quiz[]): Record<string, Quiz> => {
  const table: Record<string, Quiz> = {};
  for (const q of items) {
    const lessonIdParam = typeof q.lesson === "string" ? q.lesson : q.lesson?._id;
    // Giu cai DAU tien: may chu sap xep createdAt giam dan, ma cach cu lay
    // res[0] - tuc la ban moi nhat. Phai giu dung thu tu do.
    if (lessonIdParam && !table[lessonIdParam]) table[lessonIdParam] = q;
  }
  return table;
};

/** Phong hoc: tai khoa + ghi danh + quiz, chon bai, ghi tien do, hoan thanh bai / khoa. */
export function useCourseLearn() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Lay slug tu query string: ?slug=ten-khoa-hoc
  const courseSlug = searchParams.get("slug") || "";
  const path = usePathname();
  const user = useStoredUser();
  const loadingUser = useUserLoading();
  const isGuest = !loadingUser && !user;
  const videoRef = useRef<HTMLVideoElement>(null);

  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<EnrollmentByCourseResponse | null>(null);
  const [progress, setProgress] = useState<ProgressStats | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  // Bo cau hoi cua CA khoa hoc, tra cuu theo id bai hoc.
  //
  // Truoc day moi lan doi bai la mot loi goi
  // GET /quizzes/course/:id?lessonId=... - bam qua lai giua hai bai la goi lai
  // tu dau, khong he nho. Ca khoa hoc thuong chi co vai bai kiem tra, nen nap
  // mot lan cung voi trang roi tra cuu tai cho thi re hon han, va doi bai
  // khong con phai cho mang nua.
  const [quizByLesson, setQuizByLesson] = useState<Record<string, Quiz>>({});
  const [isDoingQuiz, setIsDoingQuiz] = useState<boolean>(false);
  const [showCertificate, setShowCertificate] = useState<boolean>(false);
  const { videoError, setVideoError } = useLessonVideo(activeLesson?.videoUrl, videoRef);

  const currentQuiz = activeLesson ? (quizByLesson[activeLesson._id] ?? null) : null;

  // Khac null nghia la bai nay dung video cua YouTube/Vimeo: phai nhung bang
  // iframe, the <video> khong doc duoc trang xem cua ho.
  const embedVideo = activeLesson?.videoUrl ? getEmbedUrl(activeLesson.videoUrl) : null;

  // Khach vang lai mo thang /learn: hien hop dang nhap ngay.
  //
  // Trang VAN nap binh thuong o duoi - may chu tu cat video va bai viet cua
  // nguoi chua ghi danh (xem backend/src/utils/contentAccess.js), nen khong co
  // gi de lo. Cho tai la de dang nhap xong ho o dung bai dang mo, khong phai
  // di lai tu trang chu.
  //
  // CHI mo MOT lan cho moi lan tai trang.
  //
  // Khong co cai co nay thi hop dang nhap khong tat duoc: bam dong la
  // AuthModalGate xoa tham so `auth` khoi dia chi, hieu ung nay thay tham so
  // bien mat va khach van chua dang nhap, nen no dat lai ngay lap tuc. Nut
  // dong tro thanh vo dung.
  //
  // useRef chu khong phai useState: doi gia tri nay khong duoc ve lai gi ca.
  const promptedLogin = useRef(false);

  useEffect(() => {
    if (!isGuest || promptedLogin.current) return;
    promptedLogin.current = true;
    updateUrl(loginUrl(path, searchParams, "hoc"), true);
  }, [isGuest, searchParams, path]);

  useEffect(() => {
    if (!courseSlug) return;

    const initLearnPage = async () => {
      try {
        setLoading(true);
        // getCourseBySlug tra ve Course HOAC { error }, nen phai loai truong
        // hop loi ra truoc thi phan con lai moi chac chan la Course.
        const result = await getCourseBySlug(courseSlug);
        if (!result || "error" in result) {
          setCourse(null);
          setLoading(false);
          return;
        }
        const courseData = result;
        setCourse(courseData);

        const realCourseId = courseData._id;

        // Ba loi goi nay khong phu thuoc nhau, chi cung can courseId - nen goi
        // song song. Truoc day chung xep hang cho nhau, cong them
        // getCourseBySlug o tren va startLesson o duoi la NAM luot di-ve noi
        // tiep truoc khi khung xuong tat. Gio con hai.
        //
        // getProgressStats tra 404 khi chua ghi danh (khoa co phi chua duyet),
        // va quiz thi khong phai khoa nao cung co - bat rieng tung cai de mot
        // loi binh thuong o hai nhanh phu khong keo do ca man hinh hoc.
        const [enrollData, stats, dsQuiz] = await Promise.all([
          getEnrollmentByCourse(realCourseId),
          getProgressStats(realCourseId).catch(() => null),
          getCourseQuizzes(realCourseId).catch(() => [] as Quiz[]),
        ]);
        setEnrollment(enrollData);
        setProgress(stats);
        setQuizByLesson(groupQuizzesByLesson(dsQuiz));

        if (courseData?.lessons && courseData.lessons.length > 0) {
          // /courses/slug/:slug populate day du bai hoc, khac voi /courses chi
          // tra ve mang ObjectId - nen o day moi ep sang Lesson duoc.
          const sortedLessons = [...(courseData.lessons as Lesson[])].sort(
            (a, b) => (a.order || 0) - (b.order || 0),
          );

          let defaultLesson: Lesson | undefined;

          if (registered(enrollData) && enrollData.lessonProgress.length > 0) {
            const nextIncompleteProgress = enrollData.lessonProgress.find(
              (lp) => lp.status !== "completed",
            );

            if (nextIncompleteProgress) {
              const targetLessonId = getLessonId(nextIncompleteProgress.lesson);
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
            // KHONG await: day la mot lenh GHI tien do, tren man hinh khong co
            // gi cho no ca. Truoc day no nam trong duong chay chinh nen khung
            // xuong phai doi them mot luot di-ve nua moi chiu tat.
            startLesson(realCourseId, defaultLesson._id).catch((err) =>
              console.error("Lỗi kích hoạt bài học mặc định:", err),
            );
          }
          // Cho nay truoc kia con gan videoRef.current.currentTime de hoc tiep
          // tu cho dang do. No chua bao gio chay: luc nay loading van la true
          // nen the <video> chua duoc dung, videoRef.current con null. Viec
          // tua da chuyen xuong onLoadedMetadata cua the <video>, la cho duy
          // nhat biet chac video da san sang de tua.
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
    }, LEARN.watchTimeMs);

    return () => clearInterval(interval);
  }, [activeLesson, course?._id, isDoingQuiz]);

  const handleSelectLesson = (lesson: Lesson) => {
    if (!course?._id) return;
    setActiveLesson(lesson);
    setVideoError("");
    // Dong bai kiem tra cua bai truoc. Truoc day viec nay nam trong mot hieu
    // ung chay moi lan doi bai, va hieu ung do keo theo mot loi goi mang di tim
    // quiz cua bai moi. Gio bang quiz da nam san trong bo nho nen dat co ngay
    // tai cho bam la du - doi bai khong cham mang nua.
    setIsDoingQuiz(false);

    // Bai bi khoa thi khong ghi tien do: nguoi nay chua duoc mo khoa hoc, may
    // chu se tu choi, goi vao chi de lai mot dong loi do trong console.
    if (lesson.biKhoa) return;

    // KHONG await: bai moi da hien ra o dong tren roi, khong co gi phai cho
    // lenh ghi tien do nay ca.
    //
    // Truoc day sau await con gan videoRef.current.currentTime de tua ve cho
    // dang do. Cung chua bao gio chay dung: the <video> mang key={_id} nen doi
    // bai la React dung mot the MOI, roi hieu ung nap video goi load() - ca hai
    // deu dua currentTime ve 0 sau khi cau lenh do chay xong. Viec tua da
    // chuyen xuong onLoadedMetadata.
    startLesson(course._id, lesson._id).catch((err) =>
      console.error("Lỗi khi kích hoạt startLesson:", err),
    );
  };

  // Tua ve dung cho da xem do. Chi o day moi chac chan the <video> da co va da
  // biet thoi luong - gan currentTime truoc thoi diem nay thi bi load() xoa.
  const handleLoadedMetadata = () => {
    if (!activeLesson || !videoRef.current) return;
    const history = getProgress(enrollment).find(
      (lp) => getLessonId(lp.lesson) === activeLesson._id,
    );
    if (history?.watchedDuration) {
      videoRef.current.currentTime = history.watchedDuration;
    }
  };

  const handleVideoEnded = async () => {
    if (!activeLesson || !course?._id) return;
    try {
      const duration = videoRef.current ? Math.floor(videoRef.current.duration) : 0;
      const response = await completeLesson(course._id, activeLesson._id, duration);

      // Hai lenh doc lai nay doc lap nhau - goi song song. Chung phai chay SAU
      // completeLesson, neu khong se doc ra tien do cu.
      const [updatedEnroll, newStats] = await Promise.all([
        getEnrollmentByCourse(course._id),
        getProgressStats(course._id),
      ]);
      setEnrollment(updatedEnroll);
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
        alert(response?.message || LEARN.messages.lessonDone(activeLesson.title));
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

      const [updatedEnroll, newStats] = await Promise.all([
        getEnrollmentByCourse(course._id),
        getProgressStats(course._id),
      ]);
      setEnrollment(updatedEnroll);
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
    const found = getProgress(enrollment).find(
      (lp) => getLessonId(lp.lesson) === lessonId,
    );
    return found?.status === "completed";
  };

  // Truyen HAM chu khong truyen con so cho ghi chu: con so chup mot thoi
  // diem, ma thoi diem can biet la luc bam nut Luu, khong phai luc ve lai
  // component.
  const getVideoPosition = () =>
    videoRef.current ? Math.floor(videoRef.current.currentTime) : null;

  const jumpTo = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = seconds;
    // Cuon video vao tam nhin: ghi chu nam duoi man hinh nen bam
    // xong ma khong cuon thi nguoi dung khong thay gi xay ra.
    videoRef.current.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  return {
    user,
    router,
    courseSlug,
    videoRef,
    course,
    enrollment,
    progress,
    activeLesson,
    loading,
    currentQuiz,
    isDoingQuiz,
    setIsDoingQuiz,
    showCertificate,
    setShowCertificate,
    videoError,
    setVideoError,
    embedVideo,
    handleSelectLesson,
    handleLoadedMetadata,
    handleVideoEnded,
    handleQuizSuccess,
    checkLessonCompleted,
    getVideoPosition,
    jumpTo,
  };
}

export type CourseLearnState = ReturnType<typeof useCourseLearn>;
