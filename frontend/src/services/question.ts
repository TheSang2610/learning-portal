import { apiRequest } from "./apiHelper";

// Chep theo backend/src/models/LessonQuestion.js.
export type ReplierRole = "hocVien" | "giangVien" | "quanTri";

export interface UserSummary {
  _id: string;
  name?: string;
  email?: string;
  avatar?: string;
}

export interface QaReply {
  _id: string;
  user: UserSummary | null;
  vaiTro: ReplierRole;
  noiDung: string;
  createdAt: string;
}

export interface QaQuestion {
  _id: string;
  student: UserSummary | null;
  noiDung: string;
  traLoi: QaReply[];
  daGiaiQuyet: boolean;
  createdAt: string;
}

export interface QaPage {
  danhSach: QaQuestion[];
  trang: number;
  tong: number;
  conNua: boolean;
  // Vai tro cua CHINH minh o khoa nay, do may chu tra ve. Dung cai nay de quyet
  // dinh hien nut gi, dung tu suy tu `role` cua tai khoan: mot giang vien day
  // khoa khac thi o khoa nay chi la hoc vien.
  vaiTro: ReplierRole;
}

/**
 * Danh sach cau hoi cua mot bai.
 *
 * May chu kiem canViewContent() truoc khi tra ve bat cu gi, va kiem ca chuyen
 * bai co thuoc khoa nay khong. Nem 403 kem requiresEnrollment neu chua ghi danh.
 */
export const getQuestions = async (
  courseId: string,
  lessonId: string,
  page = 1,
): Promise<QaPage> => {
  const q = new URLSearchParams({ courseId, lessonId, trang: String(page) });
  return apiRequest(`/hoi-dap?${q.toString()}`, { method: "GET" });
};

export const questionShape = async (tham: {
  courseId: string;
  lessonId: string;
  noiDung: string;
}): Promise<{ cauHoi: QaQuestion }> => {
  return apiRequest("/hoi-dap", {
    method: "POST",
    body: JSON.stringify(tham),
  });
};

/**
 * Tra loi mot cau hoi.
 *
 * Khong gui kem courseId/lessonId: may chu lay tu chinh cau hoi. Gui tu day thi
 * nguoi goi tu khai mot khoa ma ho co quyen roi tra loi vao cau hoi cua khoa
 * khac — xem ghi chu trong hoiDapController.
 */
export const replyQuestion = async (
  id: string,
  content: string,
): Promise<{ cauHoi: QaQuestion }> => {
  return apiRequest(`/hoi-dap/${id}/tra-loi`, {
    method: "POST",
    body: JSON.stringify({ noiDung: content }),
  });
};

export const deleteQuestion = async (id: string): Promise<{ message: string }> => {
  return apiRequest(`/hoi-dap/${id}`, { method: "DELETE" });
};

// Cau hoi trong hang doi cua giang vien mang them ten khoa va ten bai - hai thu
// ma man hinh trong bai hoc khong can (luc do da biet dang o bai nao) nhung o
// day thi bat buoc, vi danh sach tron cau hoi cua moi khoa.
export interface InstructorQuestion extends QaQuestion {
  course: { _id: string; title: string; slug?: string } | null;
  lesson: { _id: string; title: string } | null;
}

export interface InstructorQuestionPage {
  danhSach: InstructorQuestion[];
  trang: number;
  tong: number;
  conNua: boolean;
  chiChuaXong: boolean;
}

/**
 * Hang doi cau hoi chua tra loi trong cac khoa minh day.
 *
 * May chu chan pham vi ngay trong truy van (chi khoa co instructor la minh),
 * nen khong co cach nao doc duoc cau hoi cua khoa nguoi khac day.
 */
export const getInstructorQuestions = async (
  page = 1,
  all = false,
): Promise<InstructorQuestionPage> => {
  const q = new URLSearchParams({ trang: String(page) });
  if (all) q.set("tatCa", "1");

  return apiRequest(`/hoi-dap/cho-giang-vien?${q.toString()}`, { method: "GET" });
};
