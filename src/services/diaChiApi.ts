// Mot noi DUY NHAT quyet dinh dia chi backend.
//
// Truoc day ba file tu doc bien moi truong, va thu tu uu tien khong khop nhau:
//
//   apiHelper.ts   NEXT_PUBLIC_API_URL  ->  NEXT_PUBLIC_BACKEND_URL
//   serverFetch.ts NEXT_PUBLIC_API_URL  ->  NEXT_PUBLIC_BACKEND_URL
//   api.ts         NEXT_PUBLIC_BACKEND_URL  ->  NEXT_PUBLIC_API_URL   <- nguoc
//
// api.ts la file lo dang nhap / dang ky / dang nhap Google. Dat ca hai bien ve
// hai may khac nhau la dang nhap di mot noi con moi loi goi con lai di noi
// khac. Trieu chung cua no rat kho doan: dang nhap thanh cong nhung vao trang
// nao cung trong, hoac nguoc lai. Hien tai chi dat NEXT_PUBLIC_API_URL nen chua
// ai vap phai, nhung day la cai bay dat san.

const THO =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:5000";

/**
 * Goc cua backend: da bo dau "/" thua o cuoi va bo duoi "/api" neu co.
 *
 * Bo "/api" vi bien moi truong duoc dat theo ca hai kieu tuy nguoi deploy
 * ("https://may-chu.com" hoac "https://may-chu.com/api"), nen chuan hoa mot lan
 * o day roi noi duong dan day du o noi goi.
 */
export const GOC_API = THO.replace(/\/+$/, "").replace(/\/api$/, "");

