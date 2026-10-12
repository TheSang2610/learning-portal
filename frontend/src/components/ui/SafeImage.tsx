"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { isOptimizableImageHost } from "@/image-hosts";

type SafeImageProps = ImageProps & {
  /** Anh thay the khi `src` tai hong (link chet, host chan...). */
  fallbackSrc?: string;
  /** Hong ca `src` lan `fallbackSrc` thi khong ve gi, thay vi hien anh vo. */
  hideOnError?: boolean;
};

/**
 * Boc next/image cho cac anh lay tu CSDL (thumbnail khoa hoc, banner, avatar...).
 *
 * next/image NEM LOI luc chay neu host cua anh chua khai trong next.config.ts,
 * va loi do lam sap ca trang chu khong phai chi hong mot o anh. URL trong CSDL
 * thi nhap tay duoc nen khong the dam bao luc nao cung thuoc danh sach cho phep.
 *
 * O day: host quen thi van toi uu binh thuong, host la thi bo qua toi uu de anh
 * van hien ra. Danh sach host nam trong image-hosts.ts.
 *
 * Link anh chet (logo don vi, anh bia bi xoa ben kho anh) thi chuyen sang
 * `fallbackSrc`; hong luon ca cai do va co `hideOnError` thi an han - mot o
 * anh vo trong nhu trang loi, con khong co anh thi cai ten ben canh van doc duoc.
 */
export default function SafeImage({
  src,
  alt,
  unoptimized,
  fallbackSrc,
  hideOnError,
  onError,
  ...rest
}: SafeImageProps) {
  // Nho lan hong theo dung `src` dang ve: src doi (ban ghi khac) thi thu lai tu dau.
  const [failed, setFailed] = useState<{ src: unknown; step: number }>({ src, step: 0 });
  const step = failed.src === src ? failed.step : 0;

  const current = step === 0 ? src : step === 1 && fallbackSrc ? fallbackSrc : null;
  // Het duong lui: an han neu duoc phep, khong thi giu anh goc va thoi bat loi
  // (bat tiep la vong lap doi src -> hong -> doi src).
  if (current === null && hideOnError) return null;
  const shown = current ?? src;
  const canOptimize = typeof shown === "string" ? isOptimizableImageHost(shown) : true;

  return (
    <Image
      src={shown}
      alt={alt}
      {...rest}
      unoptimized={unoptimized ?? !canOptimize}
      onError={(e) => {
        if (current !== null) setFailed({ src, step: step + 1 });
        onError?.(e);
      }}
    />
  );
}
