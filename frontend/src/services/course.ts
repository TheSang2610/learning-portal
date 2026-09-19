import { apiRequest } from "./apiHelper";
import type { Lesson } from "./lesson.api";
import type { Enrollment } from "./enrollment.api";

export type ThamChieuChuDe = string | { _id?: string; $oid?: string; name?: string };

export interface Course {
  _id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  price: number;
  instructor: string | { _id: string; name: string; email: string };
  provider?:
    string | { _id: string; name: string; type: "company" | "university"; logo: string };
  // category trong model la MOT MANG ObjectId (backend/src/models/Course.js),
  // du ten truong o so it. Tuy endpoint ma no ve duoi dang mang id, mang doi
  // tuong da populate, hoac - voi ban ghi cu nhap thang bang Compass - dang
  // { $oid }. Kieu cu chi khai mot object don, ma typeof [] cung la "object",
  // nen doc thang .name hay ._id tra ve undefined ma khong ai hay: dung the la
  // bo loc theo chu de o /courses tra ve rong suot mot thoi gian.
  // Doc bang layIdChuDe / tenChuDe ben duoi, dung doc thang.
  category: ThamChieuChuDe | ThamChieuChuDe[];
  level: string;
  // Tuy endpoint: /courses tra ve mang ObjectId, /courses/slug/:slug populate
  // day du bai hoc. Noi goi phai tu phan biet.
  lessons: string[] | Lesson[];
  studentsCount: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  isPopular?: boolean;
  isTrending?: boolean;
  isNewRelease?: boolean;
}

// Doc chu de cua khoa hoc: chap nhan ca ba hinh dang o tren, luon tra ve mang.
const chuanHoaChuDe = (tho: Course["category"]): Exclude<ThamChieuChuDe, string>[] => {
  if (!tho) return [];
  const ds = Array.isArray(tho) ? tho : [tho];
  return ds.map((m) => (typeof m === "string" ? { _id: m } : m)).filter(Boolean);
};

export const layIdChuDe = (tho: Course["category"]): string[] =>
  chuanHoaChuDe(tho)
    .map((m) => m._id ?? m.$oid ?? "")
    .filter(Boolean);

// Chi co ten khi endpoint do populate chu de; khong thi tra ve mang rong.
export const tenChuDe = (tho: Course["category"]): string[] =>
  chuanHoaChuDe(tho)
    .map((m) => m.name ?? "")
    .filter(Boolean);

// instructor khi la ObjectId dang chuoi, khi la doi tuong da populate - chi lay
// duoc ten o truong hop thu hai.
export const tenGiangVien = (gv: Course["instructor"] | undefined): string =>
  gv && typeof gv === "object" ? (gv.name ?? "") : "";

export interface CreateCourseData {
  title: string;
  description: string;
  thumbnail?: string;
  price: number;
  category: string;
  providerId?: string;
  level: string;
}

export interface InstructorCoursesResponse {
  success: boolean;
  count: number;
  data: Course[];
}

export interface HomeSectionsResponse {
  success: boolean;
  data: {
    mostPopular: Course[];
    trendingNow: Course[];
    newReleases: Course[];
  };
}

export interface UpdateCourseTagsData {
  isPopular?: boolean;
  isTrending?: boolean;
  isNewRelease?: boolean;
}

export const getCourses = async (): Promise<Course[]> => {
  return apiRequest("/courses");
};

export interface TrangKhoaHoc {
  danhSach: Course[];
  trang: number;
  soDong: number;
  tong: number;
  conNua: boolean;
}

/**
 * Danh sach khoa hoc CO LOC VA PHAN TRANG o may chu.
 *
 * Khac getCourses() o tren: ham do goi /courses khong tham so va nhan ve toan
 * bo khoa da xuat ban duoi dang mang. Ham nay luon gui it nhat mot tham so nen
 * may chu tra ve hinh dang co phan trang - xem ghi chu trong courseController.
 *
 * Giu ca hai la co chu dich: trang chu va ban dung san o may chu van dung ban
 * mang cu, doi tung cho mot thay vi doi het cung luc.
 */
export const layDanhSachKhoa = async (tham: {
  trang?: number;
  soDong?: number;
  search?: string;
  category?: string;
}): Promise<TrangKhoaHoc> => {
  const q = new URLSearchParams();

  // Luon co `page` de may chu chac chan tra ve hinh dang co phan trang, ke ca
  // khi khong loc gi.
  q.set("page", String(tham.trang ?? 1));
  q.set("limit", String(tham.soDong ?? 24));

  if (tham.search?.trim()) q.set("search", tham.search.trim());
  if (tham.category?.trim()) q.set("category", tham.category.trim());

  return apiRequest(`/courses?${q.toString()}`);
};

// Khoa hoc kem ly do duoc goi y. `viSaoGoiY` do may chu sinh (xem
// backend/src/utils/xepHangGoiY.js) chu khong phai chu co dinh o giao dien:
// ly do doi theo tin hieu nao da lam khoa do len hang.
export interface KhoaGoiY extends Course {
  diemGoiY: number;
  viSaoGoiY: string;
}

export interface KetQuaGoiY {
  danhSach: KhoaGoiY[];
  // false khi nguoi xem chua dang nhap hoac chua hoc khoa nao - luc do danh
  // sach chi la khoa pho bien, va tieu de muc phai noi dung nhu vay.
  caNhanHoa: boolean;
}

/**
 * Goi y khoa hoc tiep theo.
 *
 * Khach vang lai goi duoc: ho nhan danh sach khoa pho bien. May chu KHONG dat
 * cache cho duong nay vi phan hoi phu thuoc nguoi dang dang nhap.
 */
export const layGoiYKhoaHoc = async (
  soLuong = 6,
  courseId?: string,
): Promise<KetQuaGoiY> => {
  const q = new URLSearchParams({ soLuong: String(soLuong) });
  // Co courseId -> che do "khoa lien quan" voi khoa dang xem. Khong co -> goi y
  // theo lich su hoc cua nguoi dung (hoac khoa pho bien neu la khach).
  if (courseId) q.set("courseId", courseId);

  return apiRequest(`/courses/goi-y?${q.toString()}`);
};

export interface HomeSectionsResponse {
  success: boolean;
  data: {
    mostPopular: Course[];
    trendingNow: Course[];
    newReleases: Course[];
  };
}

export const getHomeSections = async (): Promise<HomeSectionsResponse> => {
  return apiRequest("/courses/home-sections");
};

export const getInstructorCourses = async (): Promise<InstructorCoursesResponse> => {
  return apiRequest("/courses/instructor", {
    method: "GET",
  });
};

export const getCourseById = async (id: string): Promise<Course> => {
  return apiRequest(`/courses/${id}`);
};

export const getCourseBySlug = async (
  slug: string,
): Promise<Course | { error: string }> => {
  return apiRequest(`/courses/slug/${slug}`);
};

export const createCourse = async (formData: FormData): Promise<Course> => {
  return apiRequest("/courses", {
    method: "POST",
    body: formData,
  });
};

export const updateCourse = async (id: string, formData: FormData): Promise<Course> => {
  return apiRequest(`/courses/${id}`, {
    method: "PUT",
    body: formData,
  });
};

export const deleteCourseInstructor = async (
  id: string,
): Promise<{ message: string }> => {
  return apiRequest(`/courses/${id}`, {
    method: "DELETE",
  });
};

export const updateCoursePublishStatus = async (
  id: string,
  isPublished: boolean,
): Promise<{ message: string; course: Course }> => {
  return apiRequest(`/admin/courses/${id}/publish`, {
    method: "PUT",
    body: JSON.stringify({ isPublished }),
  });
};

// PATCH /courses/:id/tags boc trong { success, message, data } chu khong tra
// ve ban ghi khoa hoc tran nhu createCourse hay updateCourse.
export const updateCourseTags = async (
  id: string,
  tagsData: UpdateCourseTagsData,
): Promise<{ success: boolean; message: string; data: Course }> => {
  return apiRequest(`/courses/${id}/tags`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tagsData),
  });
};

export const enrollInCourse = async (
  id: string,
): Promise<{ message: string; enrollment: Enrollment }> => {
  return apiRequest(`/courses/${id}/enroll`, {
    method: "POST",
  });
};

export const getAdminPopularCourses = async (): Promise<Course[]> => {
  return apiRequest("/courses/admin/courses/home-sections/most-popular");
};

export const getAdminTrendingCourses = async (): Promise<Course[]> => {
  return apiRequest("/courses/admin/courses/home-sections/trending-now");
};

export const getAdminNewReleasesCourses = async (): Promise<Course[]> => {
  return apiRequest("/courses/admin/courses/home-sections/new-releases");
};
