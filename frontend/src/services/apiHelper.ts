import { GOC_API_TRINH_DUYET as API_ORIGIN } from "./diaChiApi";
import { datNguoiDung } from "@/src/hooks/nguoiDungLuu";

const resolveApiUrl = (path: string) => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (normalizedPath.startsWith("/api/")) {
    return `${API_ORIGIN}${normalizedPath}`;
  }

  return `${API_ORIGIN}/api${normalizedPath}`;
};

/**
 * Khong con gan Authorization o day nua.
 *
 * Token gio nam trong cookie httpOnly do may chu dat, va trinh duyet tu gui
 * kem moi request co `credentials: "include"`. JavaScript khong doc duoc no -
 * do chinh la muc dich: mot lo XSS khong con lay duoc token.
 */
export const getHeaders = () => ({
  "Content-Type": "application/json",
});

/**
 * Xoa sach dau vet cua phien dang nhap. Goi o MOI cho dang xuat.
 *
 * Phai lam du bon viec, thieu mot la sinh loi:
 *   1. POST /users/logout - cookie token la httpOnly nen JavaScript KHONG xoa
 *      duoc; bo buoc nay thi da "dang xuat" ma nguoi ke tiep dung may van con
 *      la admin voi backend. Hai man hinh /admin va /instructor truoc day chi
 *      xoa userInfo nen dinh dung loi do.
 *   2. userInfo  - de giao dien biet la da dang xuat.
 *   3. clearApiCache - bo dem GET song 30 giay va CHI khoa theo dia chi, khong
 *      theo nguoi. Khong xoa thi nguoi dang nhap ngay sau do co the nhan lai
 *      du lieu cua nguoi truoc (vi du /enrollments/my-courses).
 *   4. Ban su kien userInfoChanged - Header, HeaderUserMenu va hook
 *      useNguoiDungLuu deu nghe su kien nay. Su kien 'storage' cua trinh duyet
 *      KHONG ban cho chinh tab dang sua, nen phai tu ban.
 */
export const xoaPhien = () => {
  if (typeof window === "undefined") return;

  // Cookie httpOnly thi JavaScript KHONG xoa duoc - phai nho may chu xoa.
  // Khong cho ket qua: dang xuat o phia giao dien phai xay ra ngay ca khi
  // mang hong, va cookie du con lai thi token trong no cung het han sau 1 ngay.
  void fetch(resolveApiUrl("/users/logout"), {
    method: "POST",
    credentials: "include",
  }).catch(() => {});

  // Ban cu con xoa "authToken" trong localStorage. Gio khong luu o do nua,
  // nhung van xoa mot lan de don rac cua nhung nguoi dang mo trang tu truoc
  // khi doi sang cookie.
  localStorage.removeItem("authToken");
  // userInfo khong con nam trong localStorage; van xoa mot lan de don rac cua
  // nhung nguoi dang mo trang tu truoc khi doi sang kho trong RAM.
  localStorage.removeItem("userInfo");
  clearApiCache();
  // datNguoiDung(null) da tu ban su kien "userInfoChanged".
  datNguoiDung(null);
};

export const handleResponse = async (res: Response) => {
  const text = await res.text();
  let data;

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text || res.statusText };
  }

  if (!res.ok) {
    // 403 cung dung cho "khong du quyen" (vd: khong phai admin) -> chi dang xuat
    // khi backend bao tai khoan bi khoa, con lai giu nguyen phien.
    const accountLocked =
      res.status === 403 && /bị khóa/i.test(String(data?.message || ""));

    if ((res.status === 401 || accountLocked) && typeof window !== "undefined") {
      xoaPhien();
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
    }
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }

  return data;
};

// ---------------------------------------------------------------------------
// Gop request GET trung nhau.
//
// Trang chu goi getCategories() 4 lan (Header, Footer, CategoriesSection,
// CourseSection), getCourses()/getHomeSections()/getProviders() moi thu 2 lan.
// Header va Footer con chay lai tren MOI trang. Tong ~12 request cho 6 tai nguyen.
//
// - inflight: nhieu component goi cung luc -> chung MOT fetch
// - cache   : giu ket qua trong CACHE_TTL_MS de dieu huong qua lai khong goi lai
//
// Chi ap dung cho GET. Moi POST/PUT/DELETE deu xoa sach cache
// nen danh sach khong bao gio hien du lieu cu sau khi sua.
// ---------------------------------------------------------------------------
const CACHE_TTL_MS = 30_000;

// unknown chu khong phai any: hai bang nay giu phan hoi cua moi endpoint nen
// khong the co mot kieu chung. apiRequest van tra ve any de cac ham boc ben
// ngoai tu khai kieu dung cua tung endpoint - do la ranh gioi kieu duy nhat cua
// tang service.
const inflight = new Map<string, Promise<unknown>>();
const cache = new Map<string, { at: number; data: unknown }>();

const isGet = (options: RequestInit) =>
  !options.method || options.method.toUpperCase() === "GET";

// So the he cua bo dem. Moi lan don sach thi tang len mot.
//
// Can no vi mot cuoc dua co that: GET bat dau chay -> nguoi dung bam Xoa ->
// POST/DELETE goi clearApiCache() -> GET (van dang bay, mang du lieu CU) ve va
// ghi de len bo dem vua don sach. Ket qua la muc da xoa con hien them 30 giay,
// dung cai ma viec don bo dem sinh ra de tranh.
//
// Doi chieu the he luc goi voi the he luc ve: khac nhau thi bo qua khong ghi.
let theHe = 0;

export const clearApiCache = () => {
  cache.clear();
  inflight.clear();
  theHe += 1;
};

// Bo dem chi song 30 giay nhung khong ai don cac muc het han, nen Map cu the
// phinh ra suot phien lam viec. Chan tren mot con so, cham nguong thi don muc
// het han truoc, van day thi xoa sach - mat bo dem khong sai gi, chi cham hon.
const CACHE_TOI_DA = 100;

const donBotCache = () => {
  if (cache.size < CACHE_TOI_DA) return;
  const bayGio = Date.now();
  for (const [k, v] of cache) {
    if (bayGio - v.at >= CACHE_TTL_MS) cache.delete(k);
  }
  if (cache.size >= CACHE_TOI_DA) cache.clear();
};

export const apiRequest = async (path: string, options: RequestInit = {}) => {
  const url = resolveApiUrl(path);

  // Ghi du lieu -> du lieu cu khong con dung nua
  if (!isGet(options)) {
    clearApiCache();
    return rawRequest(url, options);
  }

  const key = url;

  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return hit.data;
  }

  const pending = inflight.get(key);
  if (pending) return pending;

  const theHeLucGoi = theHe;

  const p = rawRequest(url, options)
    .then((data) => {
      // Co ai don bo dem trong luc minh dang bay khong? Co thi du lieu nay da
      // cu, tra ve cho nguoi goi nhung KHONG ghi vao bo dem.
      if (theHe === theHeLucGoi) {
        donBotCache();
        cache.set(key, { at: Date.now(), data });
      }
      return data;
    })
    .finally(() => {
      // Chi go dung promise cua minh: clearApiCache() da don roi thi o nay co
      // the dang giu mot request moi hon cho cung dia chi.
      if (inflight.get(key) === p) inflight.delete(key);
    });

  inflight.set(key, p);
  return p;
};

const rawRequest = async (url: string, options: RequestInit = {}) => {
  const mergedHeaders: Record<string, string> = {
    ...getHeaders(),
    ...((options.headers as Record<string, string>) || {}),
  };

  if (options.body && options.body instanceof FormData) {
    delete mergedHeaders["Content-Type"];
    delete mergedHeaders["content-type"];
  }

  const response = await fetch(url, {
    ...options,
    headers: mergedHeaders,
    // Bat buoc: token nam trong cookie httpOnly, va fetch KHONG gui cookie
    // sang mien khac neu thieu dong nay. Bo di thi moi duong can dang nhap
    // deu tra 401.
    credentials: "include",
  });

  return handleResponse(response);
};

// ---------------------------------------------------------------------------
// Lay thong bao loi tu mot gia tri nem ra.
//
// Trong TypeScript che do strict, bien cua khoi catch co kieu unknown, vi
// JavaScript cho phep nem ra BAT KY thu gi (chuoi, so, object...), khong chi
// Error. Viet "catch (err: any)" roi doc thang err.message la bo qua dieu do:
// neu thu duoc nem ra khong phai Error thi ta nhan undefined.
//
// Ham nay xu ly du cac truong hop that su gap trong du an:
//   - Error chuan            -> err.message
//   - Nem ra mot chuoi        -> chinh chuoi do
//   - Loi tra ve tu backend   -> err.response.data.message
// Khong khop cai nao thi tra ve cau mac dinh, de nguoi dung khong bao gio
// nhin thay chu "undefined" tren man hinh.
// ---------------------------------------------------------------------------
export function getErrorMessage(
  err: unknown,
  fallback = "Đã có lỗi xảy ra, vui lòng thử lại.",
): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "string" && err.trim()) return err;

  const shaped = err as {
    message?: unknown;
    response?: { data?: { message?: unknown } };
  } | null;

  const fromBackend = shaped?.response?.data?.message;
  if (typeof fromBackend === "string" && fromBackend.trim()) return fromBackend;

  const direct = shaped?.message;
  if (typeof direct === "string" && direct.trim()) return direct;

  return fallback;
}
