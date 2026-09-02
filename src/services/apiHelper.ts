import { GOC_API as API_ORIGIN } from "./diaChiApi";

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

export const getHeaders = () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (typeof window !== "undefined") {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      const cleanToken = authToken.replace(/^"|"$/g, "");
      headers.Authorization = `Bearer ${cleanToken}`;
    }
  }

  return headers;
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
      localStorage.removeItem("authToken");
      localStorage.removeItem("userInfo");
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
