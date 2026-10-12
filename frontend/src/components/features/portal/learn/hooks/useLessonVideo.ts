"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type Hls from "hls.js";

import { LEARN } from "@/src/constants/portal/learn-page";
import { getErrorMessage } from "@/src/services/apiHelper";
import { getEmbedUrl } from "@/src/services/videoEmbed";

const V = LEARN.video;

/**
 * Nap video cua bai dang mo vao the <video> - ho tro HLS (.m3u8).
 * Tra ve loi video de hien len tren khung phat.
 */
export function useLessonVideo(
  videoUrl: string | undefined,
  videoRef: RefObject<HTMLVideoElement | null>,
) {
  // import type nen hls.js khong bi keo vao goi JavaScript - no van duoc nap
  // dong o duoi bang await import("hls.js").
  const hlsRef = useRef<Hls | null>(null);
  const [videoError, setVideoError] = useState<string>("");

  // 🎯 Xử lý video URL - Hỗ trợ HLS streaming
  useEffect(() => {
    // videoUrl la tham so rieng nen TypeScript giu duoc ket qua thu hep kieu
    // ben trong closure bat dong bo ben duoi.
    if (!videoUrl || !videoRef.current) return;
    // Bai dung YouTube/Vimeo khong dung the <video> nen khong co gi de nap.
    if (getEmbedUrl(videoUrl)) return;

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
                      ? V.httpError(data.response.code)
                      : V.hlsError(String(data.error || V.unknown));
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
        setVideoError(V.setupError(getErrorMessage(error, V.unknown)));
      }
    };

    setupVideo();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [videoUrl, videoRef]);

  return { videoError, setVideoError };
}
