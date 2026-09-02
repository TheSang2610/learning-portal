"use client";

import { useSyncExternalStore } from "react";

// Doc thong tin nguoi dung tu localStorage MA KHONG dung useEffect.
//
// Cach cu la useEffect + setState: React phai ve man hinh mot lan voi gia tri
// rong roi ve lai lan nua ngay sau do (rule react-hooks/set-state-in-effect
// canh bao dung cho nay). useSyncExternalStore sinh ra de lam viec nay: no doc
// tu mot nguon ngoai React va tra ve dung mot gia tri ngay tu lan ve dau tien
// o trinh duyet.

export interface NguoiDungLuu {
  _id?: string;
  name?: string;
  fullname?: string;
  email?: string;
  role?: string;
  avatar?: string;
  googlePicture?: string;
}

const KHOA = "userInfo";

// useSyncExternalStore doi getSnapshot tra ve gia tri ON DINH giua hai lan goi
// lien tiep. JSON.parse moi lan se tra ve object MOI, React so sanh thay khac
// nhau va lap vo tan - nen phai nho lai chuoi tho va chi phan tich khi no doi.
let thoDaDoc: string | null = null;
let ketQua: NguoiDungLuu | null = null;

function doc(): NguoiDungLuu | null {
  let tho: string | null = null;
  try {
    tho = localStorage.getItem(KHOA);
  } catch {
    // Trinh duyet chan cookie/localStorage thi coi nhu chua dang nhap.
    tho = null;
  }

  if (tho === thoDaDoc) return ketQua;

  thoDaDoc = tho;
  try {
    ketQua = tho ? (JSON.parse(tho) as NguoiDungLuu) : null;
  } catch {
    ketQua = null;
  }
  return ketQua;
}

const nguoiNghe = new Set<() => void>();

function dangKy(bao: () => void) {
  const lamMoi = () => {
    // Bo cache da phan tich, neu khong doc() se tra lai gia tri cu.
    thoDaDoc = null;
    ketQua = null;
    bao();
  };

  nguoiNghe.add(lamMoi);

  // Hai su kien, khong the thieu cai nao:
  //   storage         - CHI ban khi TAB KHAC sua localStorage
  //   userInfoChanged - quy uoc rieng cua du an cho chinh tab nay, duoc ban o
  //                     AuthModal, trang callback cua Google, trang cai dat, va
  //                     xoaPhien() trong apiHelper
  window.addEventListener("storage", lamMoi);
  window.addEventListener("userInfoChanged", lamMoi);

  return () => {
    nguoiNghe.delete(lamMoi);
    window.removeEventListener("storage", lamMoi);
    window.removeEventListener("userInfoChanged", lamMoi);
  };
}

/**
 * Ban tay cho cac hook dang nghe.
 *
 * Hau het cac cho da ban su kien "userInfoChanged" nen khong can goi ham nay;
 * giu lai cho truong hop sua localStorage ma khong ban su kien do.
 */
export function baoDaDoiNguoiDung() {
  thoDaDoc = null;
  ketQua = null;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("userInfoChanged"));
  }
}

/** null khi chua dang nhap, va luon null o phia may chu. */
export const useNguoiDungLuu = (): NguoiDungLuu | null =>
  // Tham so thu ba la anh chup phia may chu: HTML dung san khong doc duoc
  // localStorage nen bat buoc phai la null, neu khong se lech khi hydrate.
  useSyncExternalStore(dangKy, doc, () => null);

const khongDangKy = () => () => {};

/**
 * false khi dung HTML o may chu, true sau khi React gan vao trinh duyet.
 *
 * Thay cho cap `useState(false)` + `useEffect(() => setIsMounted(true))`, vong
 * ve lai thua bi bo han.
 */
export const useDaGanVaoTrinhDuyet = (): boolean =>
  useSyncExternalStore(
    khongDangKy,
    () => true,
    () => false,
  );
