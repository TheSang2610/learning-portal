"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { ImageMinus, ImageOff, Scissors, Upload, X } from "lucide-react";

import SafeImage from "@/src/components/ui/SafeImage";
import { ADMIN_POST_CREATE as C } from "@/src/constants/admin/post-create-page";
import { getErrorMessage } from "@/src/services/apiHelper";
import { postService } from "@/src/services/post";

import styles from "./ThumbnailPicker.module.scss";

const T = C.thumbnail;

/** Anh tu link khong cho doc (thieu CORS) - canvas bi "ban" nen khong xuat ra duoc. */
class CropBlockedError extends Error {}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    // Anh blob: (file tu may) khong can; anh tu link thi phai xin CORS, neu
    // khong canvas ve duoc nhung toBlob nem SecurityError.
    if (!src.startsWith("blob:")) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new CropBlockedError());
    img.src = src;
  });
}

/** Cat vung da chon ra JPEG co dinh 16:9 de moi anh bia cung kich thuoc. */
async function cropToBlob(src: string, area: Area) {
  const img = await loadImage(src);
  const { width, height, quality } = T.output;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error(T.uploadFailed);
  // PNG trong suot ma xuat JPEG se ra nen den - lot nen trang truoc.
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, width, height);
  return new Promise<Blob>((resolve, reject) => {
    try {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error(T.uploadFailed))),
        "image/jpeg",
        quality,
      );
    } catch {
      reject(new CropBlockedError());
    }
  });
}

interface ThumbnailPickerProps {
  value: string;
  onChange: (url: string) => void;
}

/**
 * Anh dai dien bai viet: dan link hoac tai file len, xem truoc dung khung
 * 16:9, cat lai trong cua so rieng. Anh cat xong duoc tai len Cloudinary va
 * chi URL duoc luu vao bai - truong thumbnail van la chuoi nhu truoc.
 */
export default function ThumbnailPicker({ value, onChange }: ThumbnailPickerProps) {
  const [tab, setTab] = useState<"url" | "upload">("url");
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const url = value.trim();

  const closeCrop = () => {
    if (cropSrc?.startsWith("blob:")) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  };

  const openCrop = (src: string) => {
    setError("");
    setCropSrc(src);
  };

  const pickFile = (file?: File) => {
    // Xoa gia tri de chon lai dung file vua huy van bat duoc onChange.
    if (fileRef.current) fileRef.current.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError(T.notImage);
    if (file.size > T.maxMb * 1024 * 1024) return setError(T.tooBig);
    openCrop(URL.createObjectURL(file));
  };

  const applyCrop = async (area: Area) => {
    if (!cropSrc) return;
    setBusy(true);
    setError("");
    try {
      const blob = await cropToBlob(cropSrc, area);
      const res = await postService.uploadImage(blob);
      onChange(res.url);
      closeCrop();
    } catch (err) {
      if (err instanceof CropBlockedError) {
        closeCrop();
        setError(T.corsBlocked);
      } else {
        setError(getErrorMessage(err, T.uploadFailed));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <h4 className={styles.heading}>{T.heading}</h4>
        <span className={styles.ratio}>{T.ratio}</span>
      </div>

      <div className={styles.tabs} role="tablist">
        {(["url", "upload"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={tab === t ? styles.tabActive : styles.tab}
          >
            {t === "url" ? T.tabUrl : T.tabUpload}
          </button>
        ))}
      </div>

      {tab === "url" ? (
        <input
          value={value}
          onChange={(e) => {
            setError("");
            onChange(e.target.value);
          }}
          placeholder={T.placeholder}
          aria-label={T.aria}
          className={styles.input}
        />
      ) : (
        <div>
          <label className={styles.fileButton}>
            <Upload size={14} /> {T.fileAria}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => pickFile(e.target.files?.[0])}
              className={styles.fileInput}
            />
          </label>
          <p className={styles.note}>{T.fileNote}</p>
        </div>
      )}

      <div className={styles.preview}>
        {url ? (
          <>
            <SafeImage
              src={url}
              alt={T.alt}
              fill
              sizes="320px"
              className={styles.previewImage}
            />
            <div className={styles.overlay}>
              <button
                type="button"
                onClick={() => openCrop(url)}
                className={styles.overlayEdit}
              >
                <Scissors size={14} /> {T.crop}
              </button>
              <button
                type="button"
                onClick={() => onChange("")}
                className={styles.overlayRemove}
              >
                {/* Khong dung icon thung rac: DashboardShell ep moi nut co icon do sang
                    chu do !important, chim mat tren nen do. */}
                <ImageMinus size={14} /> {T.remove}
              </button>
            </div>
          </>
        ) : (
          <div className={styles.empty}>
            <ImageOff size={24} />
            <span>{T.empty}</span>
          </div>
        )}
      </div>

      {error && !cropSrc && <p className={styles.error}>{error}</p>}

      {cropSrc && (
        <CropModal
          key={cropSrc}
          src={cropSrc}
          busy={busy}
          error={error}
          onCancel={closeCrop}
          onApply={applyCrop}
        />
      )}
    </div>
  );
}

interface CropModalProps {
  src: string;
  busy: boolean;
  error: string;
  onCancel: () => void;
  onApply: (area: Area) => void;
}

function CropModal({ src, busy, error, onCancel, onApply }: CropModalProps) {
  const M = T.modal;
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onCancel();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [busy, onCancel]);

  // Dua ra body: cot ben phai dang sticky, de trong do thi lop phu bi cat theo cot.
  return createPortal(
    <div className={styles.modalOverlay} role="presentation">
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label={M.title}>
        <div className={styles.modalHead}>
          <h3 className={styles.modalTitle}>{M.title}</h3>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className={styles.modalClose}
            aria-label={M.cancel}
          >
            <X size={18} />
          </button>
        </div>
        <p className={styles.note}>{M.hint}</p>

        <div className={styles.cropArea}>
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={16 / 9}
            maxZoom={4}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, pixels) => setArea(pixels)}
          />
        </div>

        <label className={styles.zoom}>
          <span>{M.zoom}</span>
          <input
            type="range"
            min={1}
            max={4}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          />
        </label>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.modalActions}>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className={styles.cancel}
          >
            {M.cancel}
          </button>
          <button
            type="button"
            onClick={() => area && onApply(area)}
            disabled={busy || !area}
            className={styles.apply}
          >
            {busy ? T.uploading : M.apply}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
