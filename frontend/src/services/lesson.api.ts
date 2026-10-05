import { apiRequest } from "./apiHelper";

// Chep theo backend/src/models/Lesson.js. Gan het la tuy chon vi tuy endpoint
// ma backend chi tra ve mot phan: vi du lessonProgress.lesson chi populate
// title, duration, order, content, videoUrl.
export interface LessonData {
  _id?: string;
  courseId?: string;
  title: string;
  slug?: string;
  content?: string;
  videoUrl?: string;
  documentUrl?: string;
  // La CHUOI trong model chu khong phai so, vi du "12:30".
  duration?: string;
  order?: number;
  // May chu dat co nay khi nguoi xem CHUA duoc mo khoa hoc: luc do videoUrl,
  // content va documentUrl bi cat het, chi con muc luc. Xem
  // backend/src/utils/contentAccess.js.
  biKhoa?: boolean;
  // true = video nam o KHO KIN Cloudinary; `videoUrl` khi do la link ky chi de
  // phat, KHONG phai link de sua. Xem backend/src/utils/privateVideo.js.
  videoKin?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Bai hoc do may chu tra ve thi LUON co _id. LessonData de _id tuy chon vi no
// con dung lam kieu dau vao luc tao bai moi, luc do chua co id nao ca. Tach ra
// hai ten de moi cho doc khong phai kiem tra _id vo ich.
export type Lesson = LessonData & { _id: string };

/**
 * Upload video bai giang THANG tu trinh duyet len kho kin Cloudinary, tra ve
 * public_id de gui kem form bai hoc (truong `videoPublicId`).
 *
 * Khong gui file qua backend nhu truoc: backend chay tren Vercel chi nhan request
 * khoang 4.5 MB, video bai giang that (vai tram MB) di duong do la hong tren ban
 * production. May chu chi cap chu ky (POST /lessons/chu-ky-video).
 *
 * Dung XMLHttpRequest thay vi fetch vi fetch khong bao tien do upload - video
 * vai tram MB ma khong co thanh % thi nguoi dung tuong treo va dong trang.
 */
export const uploadVideoKin = async (
  file: File,
  khiTienDo?: (phanTram: number) => void,
): Promise<string> => {
  const ky: {
    cloudName: string;
    apiKey: string;
    folder: string;
    timestamp: number;
    type: string;
    signature: string;
  } = await apiRequest("/lessons/chu-ky-video", { method: "POST" });

  const fd = new FormData();
  fd.append("file", file);
  fd.append("api_key", ky.apiKey);
  fd.append("timestamp", String(ky.timestamp));
  fd.append("folder", ky.folder);
  fd.append("type", ky.type);
  fd.append("signature", ky.signature);

  return new Promise<string>((xong, hong) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${ky.cloudName}/video/upload`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && khiTienDo)
        khiTienDo(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        const kq = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && kq.public_id) xong(kq.public_id);
        else hong(new Error(kq?.error?.message || "Tải video lên không thành công"));
      } catch {
        hong(new Error("Tải video lên không thành công"));
      }
    };
    xhr.onerror = () => hong(new Error("Mất kết nối khi tải video lên"));
    xhr.send(fd);
  });
};

export const addLesson = async (formData: FormData): Promise<Lesson> => {
  return apiRequest("/lessons", {
    method: "POST",
    body: formData,
  });
};

export const getLessonById = async (lessonId: string): Promise<Lesson> => {
  return apiRequest(`/lessons/${lessonId}`, {
    method: "GET",
  });
};

export const updateLesson = async (
  lessonId: string,
  formData: FormData,
): Promise<Lesson> => {
  return apiRequest(`/lessons/${lessonId}`, {
    method: "PUT",
    body: formData,
  });
};

export const deleteLesson = async (lessonId: string): Promise<{ message: string }> => {
  return apiRequest(`/lessons/${lessonId}`, {
    method: "DELETE",
  });
};

export const getLessonBySlug = async (
  courseSlug: string,
  lessonSlug: string,
): Promise<LessonData> => {
  return apiRequest(`/lessons/course/${courseSlug}/lesson/${lessonSlug}`, {
    method: "GET",
  });
};

export const getLessonsByCourseId = async (courseId: string): Promise<LessonData[]> => {
  return apiRequest(`/lessons?courseId=${courseId}`, {
    method: "GET",
  });
};
