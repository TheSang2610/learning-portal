const RAW_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:5000";

const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, "");
const API_ORIGIN = API_BASE_URL.endsWith("/api")
  ? API_BASE_URL.slice(0, -4)
  : API_BASE_URL;

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

const inflight = new Map<string, Promise<any>>();
const cache = new Map<string, { at: number; data: any }>();

const isGet = (options: RequestInit) =>
  !options.method || options.method.toUpperCase() === "GET";

export const clearApiCache = () => {
  cache.clear();
  inflight.clear();
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

  const p = rawRequest(url, options)
    .then((data) => {
      cache.set(key, { at: Date.now(), data });
      return data;
    })
    .finally(() => {
      inflight.delete(key);
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
