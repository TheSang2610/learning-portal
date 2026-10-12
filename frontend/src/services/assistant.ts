import { apiRequest } from "./apiHelper";

// Chep theo backend/src/models/Conversation.js. Ten vai tro la cua rieng du an
// chu khong phai cua hang API nao — backend doi sang 'user'/'model'/'assistant'
// ngay truoc khi goi, xem backend/src/utils/aiProvider.js.
export interface AssistantMessage {
  vaiTro: "nguoiDung" | "troLy";
  noiDung: string;
  createdAt?: string;
}

export interface AssistantReply {
  traLoi: string;
}

/**
 * Hoi tro ly AI. Co HAI che do, phan biet bang `courseId`:
 *
 *   KHONG co courseId — hop chat chung, noi o goc phai moi trang. Khach vang
 *     lai hoi duoc. May chu khong luu, nen phai tu gui `lichSu` len thi tro ly
 *     moi hieu duoc cau hoi noi tiep.
 *
 *   CO courseId — hoi ve bai hoc. Bat buoc dang nhap va phai da ghi danh: loi
 *     nhac gui cho mo hinh co chua nguyen van noi dung bai. May chu tu luu lich
 *     su, nen khong can gui `lichSu`.
 *
 * `lessonId` chi co nghia khi da co courseId; may chu kiem bai do co THUOC khoa
 * day khong roi moi doc — dung tuong o day gui gi cung duoc.
 */
export const askAssistant = async (tham: {
  cauHoi: string;
  courseId?: string;
  lessonId?: string;
  lichSu?: AssistantMessage[];
}): Promise<AssistantReply> => {
  return apiRequest("/tro-ly/hoi", {
    method: "POST",
    body: JSON.stringify(tham),
  });
};

export const getAssistantHistory = async (
  courseId: string,
  lessonId?: string,
): Promise<{ tinNhan: AssistantMessage[] }> => {
  const q = new URLSearchParams({ courseId });
  if (lessonId) q.set("lessonId", lessonId);

  return apiRequest(`/tro-ly/lich-su?${q.toString()}`, { method: "GET" });
};

export const clearAssistantHistory = async (
  courseId: string,
  lessonId?: string,
): Promise<{ message: string }> => {
  const q = new URLSearchParams({ courseId });
  if (lessonId) q.set("lessonId", lessonId);

  return apiRequest(`/tro-ly/lich-su?${q.toString()}`, { method: "DELETE" });
};
