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

/**
 * Địa chỉ mà TRÌNH DUYỆT dùng để gọi backend.
 *
 * Khác `GOC_API` ở trên: đó là địa chỉ thật của backend, dùng cho mã chạy trên
 * máy chủ (Server Component, route handler). Còn trình duyệt gọi qua đường
 * tương đối, để Next chuyển tiếp sang backend — xem `rewrites()` trong
 * next.config.ts.
 *
 * VÌ SAO PHẢI VÒNG QUA NEXT: token nằm trong cookie. Nếu trình duyệt gọi thẳng
 * `api.mien-khac.com` trong khi trang đang ở `app.vercel.app` thì cookie đó là
 * cookie bên thứ ba — Safari chặn sẵn, Chrome đang bỏ dần, và đăng nhập sẽ
 * hỏng mà không có thông báo gì. Đi qua Next thì trình duyệt chỉ thấy một
 * miền duy nhất, cookie là bên thứ nhất, chạy trên mọi trình duyệt.
 *
 * Thêm một cái lợi: không còn request nào của trình duyệt là cross-origin nữa,
 * nên CORS không còn nằm trên đường đi của người dùng thật.
 *
 * Đặt NEXT_PUBLIC_GOI_THANG_BACKEND=1 để quay lại cách gọi thẳng (ví dụ khi
 * chạy giao diện mà không có máy chủ Next đứng trước).
 */
export const GOC_API_TRINH_DUYET =
  process.env.NEXT_PUBLIC_GOI_THANG_BACKEND === "1" ? GOC_API : "";
