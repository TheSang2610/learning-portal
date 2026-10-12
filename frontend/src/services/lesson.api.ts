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
export const uploadPrivateVideo = async (
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> => {
  const sign: {
    cloudName: string;
    apiKey: string;
    folder: string;
    timestamp: number;
    type: string;
    signature: string;
  } = await apiRequest("/lessons/chu-ky-video", { method: "POST" });

  const fd = new FormData();
  fd.append("file", file);
  fd.append("api_key", sign.apiKey);
  fd.append("timestamp", String(sign.timestamp));
  fd.append("folder", sign.folder);
  fd.append("type", sign.type);
  fd.append("signature", sign.signature);

  return new Promise<string>((done, hong) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${sign.cloudName}/video/upload`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress)
        onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        const outcome = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && outcome.public_id)
          done(outcome.public_id);
        else hong(new Error(outcome?.error?.message || "Tải video lên không thành công"));
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
