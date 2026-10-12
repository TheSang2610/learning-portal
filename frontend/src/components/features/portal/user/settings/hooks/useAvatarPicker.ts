"use client";

import { useEffect, useState } from "react";

import { setPageSize } from "@/src/lib/document/file-info";
import {
  MAX_IMAGE_MB,
  IMAGE_MIMES,
  USER_SETTINGS,
} from "@/src/constants/portal/user-settings-page";

const A = USER_SETTINGS.personal.avatar;

/** Chon file anh (kiem truoc tren trinh duyet) hoac dan duong dan anh. */
export function useAvatarPicker(initialAvatar: string) {
  const [avatar, setAvatar] = useState(initialAvatar);
  const [pickedImage, setPickedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [imageError, setImageError] = useState("");

  // Doi hoac roi trang -> tra lai bo nho cua anh xem truoc. Khong lam thi moi
  // lan chon anh khac lai bo lai mot blob trong bo nho tab.
  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  // Kiem ngay tren trinh duyet bang dung mot bo luat voi may chu, de nguoi
  // dung biet lien thay vi cho tai het 5MB roi moi bi tu choi.
  const pickImage = (f: File | null) => {
    setImageError("");
    setPickedImage(null);
    setPreview("");
    if (!f) return;

    if (!IMAGE_MIMES.includes(f.type)) {
      setImageError(A.badType);
      return;
    }
    if (f.size > MAX_IMAGE_MB * 1024 * 1024) {
      setImageError(A.tooBig(MAX_IMAGE_MB, setPageSize(f.size)));
      return;
    }

    setPickedImage(f);
    setPreview(URL.createObjectURL(f));
  };

  return { avatar, setAvatar, pickedImage, preview, imageError, pickImage };
}

export type AvatarPicker = ReturnType<typeof useAvatarPicker>;
