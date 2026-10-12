import { useEffect, useRef, type RefObject } from "react";
import { BookOpen, Lock } from "lucide-react";

import { LEARN } from "@/src/constants/portal/learn-page";
import type { Lesson } from "@/src/services/lesson.api";

import VideoWatermark from "./VideoWatermark";
import styles from "../CourseLearn.module.scss";

const P = LEARN.player;

// Props tach rieng tung cai chu khong nhan ca doi tuong state: doi tuong do
// chua videoRef, va React Compiler coi moi thu doc tu no la "doc ref khi ve".
interface LessonPlayerProps {
  lesson: Lesson;
  videoRef: RefObject<HTMLVideoElement | null>;
  embedVideo: string | null;
  videoError: string;
  onLoadedMetadata: () => void;
  onEnded: () => void;
  onVideoError: (msg: string) => void;
  onOpenCourse: () => void;
  /** Chu chay tren khung phat (email nguoi xem). Rong thi khong hien. */
  watermark?: string;
  /** Khoa co phi da het thoi han hoc: o khoa hien loi nhac gia han. */
  expired?: boolean;
}

/* Box Video bo góc thanh lịch */
export default function LessonPlayer({
  lesson,
  videoRef,
  embedVideo,
  videoError,
  onLoadedMetadata,
  onEnded,
  onVideoError,
  onOpenCourse,
  watermark,
  expired,
}: LessonPlayerProps) {
  const boxRef = useRef<HTMLDivElement>(null);

  // Nut toan man hinh cua the <video> chi dua RIENG video len toan man hinh,
  // watermark nam ngoai the do se bien mat. Bat lai: thoat ra roi dua CA KHUNG
  // (video + watermark) len toan man hinh.
  useEffect(() => {
    const onChange = () => {
      const video = videoRef.current;
      if (!video || document.fullscreenElement !== video) return;
      document
        .exitFullscreen()
        .then(() => boxRef.current?.requestFullscreen())
        .catch(() => {});
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [videoRef]);

  return (
    <div ref={boxRef} className={styles.card5}>
      {embedVideo ? (
        <iframe
          key={lesson._id}
          src={embedVideo}
          title={lesson.title}
          className={styles.frame}
          allow={P.iframeAllow}
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : lesson.videoUrl ? (
        <>
          {/* KHONG dat crossOrigin o day. Dat vao la trinh duyet doi
              may chu video phai gui header Access-Control-Allow-Origin;
              may chu nao khong gui thi video bi chan thang, nguoi hoc
              chi thay o den. 18 bai dung media.w3.org da dinh dung loi
              do. crossOrigin chi can khi muon ve khung hinh ra canvas
              hoac nap phu de tu ten mien khac - trang nay khong lam. */}
          <video
            ref={videoRef}
            key={lesson._id}
            controls
            // Bo nut tai ve va cua so noi (PiP): cua so noi tach video khoi
            // watermark. Khong phai bao mat that - chi bot loi tat de dang.
            controlsList="nodownload"
            disablePictureInPicture
            onContextMenu={(e) => e.preventDefault()}
            className={styles.video}
            onLoadedMetadata={onLoadedMetadata}
            onEnded={onEnded}
            onError={(e) => {
              console.error("❌ Video element error:", e);
              onVideoError(P.playError);
            }}
          />
          {watermark && <VideoWatermark label={watermark} />}
          {videoError && (
            <div className={styles.floating}>
              <p className={styles.text4}>
                {P.errorPrefix}
                {videoError}
              </p>
            </div>
          )}
        </>
      ) : lesson.biKhoa ? (
        /* May chu da cat videoUrl vi nguoi xem chua duoc mo khoa hoc.
           Truoc day cho nay hien "chua cau hinh video" - nguoi hoc doc
           xong tuong he thong hong, khong biet la minh chua duoc duyet. */
        <div className={styles.floating2}>
          <Lock size={40} className={styles.box16} />
          <p className={styles.text5}>{expired ? P.expiredTitle : P.lockedTitle}</p>
          <p className={styles.text6}>{expired ? P.expiredText : P.lockedText}</p>
          <button onClick={onOpenCourse} className={styles.button3}>
            {expired ? P.expiredCta : P.lockedCta}
          </button>
        </div>
      ) : (
        <div className={styles.floating3}>
          <BookOpen size={48} className={styles.box17} />
          <p className={styles.text7}>{P.noVideo}</p>
        </div>
      )}
    </div>
  );
}
