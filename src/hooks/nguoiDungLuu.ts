"use client";

import { useSyncExternalStore } from "react";

// Danh tinh nguoi dang dang nhap, giu TRONG BO NHO - khong ghi xuong dia nua.
//
// Ban cu luu ca cuc JSON {_id, name, email, role} vao localStorage. No chua
// bao gio la thu dung de xac thuc - token that nam trong cookie httpOnly - nen
// sua "role" thanh "admin" khong leo thang duoc quyen nao, backend van doc vai
// tro tu CSDL. Nhung no van la hai van de that:
//
//   1. Sua mot dong la HIEN ra toan bo khung quan tri: menu, ten tung trang,
//      breadcrumb. Ro ri be mat he thong, va man hinh thi day loi 403.
//   2. Email va _id nam tro tren dia, bat ky XSS hay tien ich mo rong nao
//      cung doc duoc, va con lai do sau khi dong trinh duyet.
//
// Doi sang bien trong RAM: dong tab la mat sach. Va vi gia tri duoc nap tu
// GET /api/users/profile chu khong phai tu than phan hoi luc dang nhap, no
// LUON khop voi CSDL - ha vai tro mot nguoi thi lan tai trang sau ho thay
// ngay, khong con canh du lieu oi nam lai ca ngay.
//
// KHONG doi sang "luu token trong localStorage" duoc: trinh duyet khong co
// JWT_SECRET nen khong kiem noi chu ky, van phai tin phan payload nguoi dung
// tu che ra - y het van de cu, lai them nguy co bi doc trom. Xem ghi chu dau
// backend/src/utils/cookieToken.js.
//
// Cai gia phai tra: moi lan tai trang phai doi mot luot mang moi biet minh la
// ai. Trong luc do useDangTaiNguoiDung() tra ve true - giao dien PHAI ve o
// trong cho, dung ve nut "Dang nhap", neu khong nguoi dang dang nhap se thay
// nut do loe len mot cai roi bien mat.

export interface NguoiDungLuu {
  _id?: string;
  name?: string;
  fullname?: string;
  email?: string;
  role?: string;
  avatar?: string;
  googlePicture?: string;
  picture?: string;
  provider?: string | { _id: string; name: string };
}

let nguoiDung: NguoiDungLuu | null = null;
let dangTai = true;

const nguoiNghe = new Set<() => void>();
const bao = () => nguoiNghe.forEach((goi) => goi());

/**
 * Khoa localStorage duy nhat con lai. No CHI chua mot con so thoi diem, tuyet
 * doi khong chua thong tin nguoi dung.
 *
 * Cong dung duy nhat la 0 thuc cac tab KHAC: su kien 'storage' khong bao
 * gio ban cho chinh tab vua ghi, nen day la cach duy nhat de tab dang mo san
 * biet ma tu goi lai /users/profile khi ban dang nhap o tab ben canh.
 */
export const KHOA_HIEU = "phien-doi";

/**
 * Cap nhat danh tinh. Truyen null khi dang xuat.
 *
 * `lanTruyen` = co bao cho cac TAB KHAC biet hay khong.
 *
 * PHAI truyen false khi dang ghi lai ket qua cua mot luot goi /users/profile
 * ma chinh no do mot tab khac danh thuc. Neu khong thi thanh vong lap vinh
 * vien giua hai cua so cung mien:
 *
 *   tab A ghi phien-doi  ->  tab B nghe 'storage', goi /users/profile
 *   tab B ghi phien-doi  ->  tab A nghe 'storage', goi /users/profile
 *   tab A ghi phien-doi  ->  ... khong bao gio dung
 *
 * Chi can hai tab cung mo la dinh, ke ca khi chua dang nhap. Dang nhap bang
 * Google luon dinh vi no mo them mot cua so bat len cung mien.
 *
 * Su kien 'userInfoChanged' thi van ban trong MOI truong hop: no chi chay
 * trong tab nay nen khong the gay vong lap.
 */
export function datNguoiDung(u: NguoiDungLuu | null, lanTruyen = true) {
  nguoiDung = u;
  dangTai = false;
  bao();

  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("userInfoChanged"));

  if (!lanTruyen) return;

  try {
    localStorage.setItem(KHOA_HIEU, String(Date.now()));
  } catch {
    // Trinh duyet chan luu tru: mat dong bo giua cac tab, khong sao.
  }
}

/**
 * Nho <NapNguoiDung /> goi lai /users/profile.
 *
 * Dung ngay sau khi dang nhap: than phan hoi cua /login chi co bon truong
 * (_id, name, email, role), con fullname / avatar / provider thi phai lay tu
 * ho so day du. Dat tam bon truong cho giao dien hien ngay, roi goi ham nay
 * de lap not phan con lai.
 */
export function yeuCauNapLai() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("napLaiNguoiDung"));
  }
}

/** Bat co "dang hoi may chu" - dung khi bat dau nap lai. */
export function datDangTai(v: boolean) {
  dangTai = v;
  bao();
}

function dangKy(goi: () => void) {
  nguoiNghe.add(goi);

  // Chinh tab nay: cac cho cu van ban su kien nay, giu lai cho tuong thich.
  window.addEventListener("userInfoChanged", goi);

  return () => {
    nguoiNghe.delete(goi);
    window.removeEventListener("userInfoChanged", goi);
  };
}

const doc = () => nguoiDung;
const docDangTai = () => dangTai;

/**
 * Ban tay cho cac hook dang nghe, khi co cho sua danh tinh ma khong goi
 * datNguoiDung().
 */
export function baoDaDoiNguoiDung() {
  bao();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("userInfoChanged"));
  }
}

/** null khi chua dang nhap HOAC dang hoi may chu. Luon null o phia may chu. */
export const useNguoiDungLuu = (): NguoiDungLuu | null =>
  useSyncExternalStore(dangKy, doc, () => null);

/**
 * true khi chua biet minh la ai.
 *
 * Anh chup phia may chu cung la true: HTML dung san khong the biet nguoi xem
 * la ai, va trinh duyet cung bat dau tu true - hai ben khop nhau nen khong
 * lech luc hydrate.
 */
export const useDangTaiNguoiDung = (): boolean =>
  useSyncExternalStore(dangKy, docDangTai, () => true);

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
