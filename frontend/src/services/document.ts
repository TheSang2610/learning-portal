import { apiRequest } from "./apiHelper";

export interface DocumentUploader {
  _id?: string;
  name?: string;
  avatar?: string;
}

/**
 * Mot file dinh kem. Mo / tai qua /api/documents/:id/file?i=<vi tri> - KHONG
 * co duong dan Cloudinary o day (bi chan 401, xem getDocumentFile).
 */
export interface DocumentFile {
  // Goi y va lich su khong tra ten file (cho nhe) - chi co o chi tiet/danh sach.
  fileName?: string;
  fileExt: "pdf" | "doc" | "docx";
  fileSize: number;
}

export interface SharedDocument {
  _id: string;
  title: string;
  description: string;
  /** 1-5 file, dung thu tu nguoi dang chon (chuong 1, 2, 3...). */
  files: DocumentFile[];
  uploader?: DocumentUploader | null;
  downloadCount: number;
  /** Luot mo trang chi tiet (ca khach). Tai lieu truoc khi co truong nay: khong co. */
  luotXem?: number;
  createdAt: string;
  // TEN cac mon (toi da 5). Tai lieu dang truoc khi co mon thi mang rong.
  monHoc?: string[];
  /** Ten truong dai hoc - khong bat buoc, "" = chua gan truong. */
  truong?: string;
  // Chi co o duong quan tri (getDocumentsAdmin) va duong "tai lieu cua toi"
  // (getMyDocuments). Duong cong khai khong bao gio tra tai lieu an.
  daAn?: boolean;
}

/**
 * Doi tai lieu DANG CU (mot file o cac truong le fileExt/fileSize/fileName,
 * monHoc la chuoi) sang dang moi (files[], monHoc[]).
 *
 * Can vi du lieu cu con song o cac lop cache: cache fetch cua Next (trang chi
 * tiet luu 30 giay, ban dev con giu qua HMR) va CDN (danh sach luu 60 giay).
 * Ngay sau khi doi dinh dang, trang co the nhan ban cu - khong chuan hoa thi
 * `doc.files.length` nem loi va ca trang thanh 500.
 */
export function chuanHoaTaiLieu<T extends Partial<SharedDocument>>(d: T): T {
  const cu = d as T & {
    fileExt?: DocumentFile["fileExt"];
    fileSize?: number;
    fileName?: string;
    monHoc?: unknown;
  };
  const files: DocumentFile[] = Array.isArray(cu.files)
    ? cu.files
    : cu.fileExt
      ? [{ fileExt: cu.fileExt, fileSize: cu.fileSize ?? 0, fileName: cu.fileName }]
      : [];
  const monHoc = Array.isArray(cu.monHoc)
    ? (cu.monHoc as string[])
    : typeof cu.monHoc === "string" && cu.monHoc
      ? [cu.monHoc]
      : [];
  return { ...d, files, monHoc };
}

export interface CommentAuthor {
  _id: string;
  name?: string;
  avatar?: string;
  role?: string;
}

/** Mot binh luan. Binh luan goc co `cacTraLoi`; tra loi thi mang rong. */
export interface DocumentComment {
  _id: string;
  document: string;
  user: CommentAuthor | null;
  // Chu thuong, KHONG phai HTML - hien bang {noiDung}, React tu thoat ky tu.
  noiDung: string;
  traLoi: string | null;
  daAn: boolean;
  createdAt: string;
  cacTraLoi: DocumentComment[];
}

export interface CommentListResponse {
  binhLuan: DocumentComment[];
  tong: number;
  // Id nguoi dang tai lieu - de gan nhan "Tác giả".
  chuBai: string;
}

/** Tab loai tai lieu o trang tat ca tai lieu (?loai=). */
export type LoaiTaiLieu = "pdf" | "word" | "baiViet";

/** So lieu cua bo loc dang xem - GET /api/documents?thongKe=1. */
export interface ThongKeDanhSach {
  tong: number;
  luotTai: number;
  soNguoiChiaSe: number;
  pdf: number;
  word: number;
  baiViet: number;
}

export interface DocumentListResponse {
  documents: SharedDocument[];
  total: number;
  page: number;
  totalPages: number;
  /** Chi co khi goi kem thongKe: true. Tinh tren bo loc CHUA tach loai. */
  thongKe?: ThongKeDanhSach;
}

/** Mot mon hoc trong danh sach admin quan ly, kem so tai lieu dang hien. */
export interface DocumentSubject {
  _id: string;
  // Khoa chuan hoa (bo dau, chu thuong) - dung de LOC va de GUI khi dang bai.
  // Hien ra thi dung `ten`.
  key: string;
  ten: string;
  soTaiLieu: number;
  /** _id cua linh vuc chua mon nay, null = chua xep. */
  nhom?: string | null;
}

/** Bieu tuong cua linh vuc - khop BIEU_TUONG ben backend (models/DocumentCategory.js). */
export type BieuTuongLinhVuc =
  | "sach"
  | "luat"
  | "kinh-doanh"
  | "kinh-te"
  | "he-thong"
  | "lap-trinh"
  | "toan"
  | "khoa-hoc"
  | "y-te"
  | "ngoai-ngu"
  | "chinh-tri"
  | "ky-thuat"
  | "thiet-ke"
  | "giao-duc";

/** Truong dai hoc - admin quan ly, nguoi dang chon (khong bat buoc). */
export interface DocumentUniversity {
  _id: string;
  key: string;
  ten: string;
  /** "/images/institution/<file>" hoac link https; "" = chua co logo. */
  logo?: string;
  thuTu: number;
  soTaiLieu: number;
}

/** Mot mon co tai lieu cua mot truong. */
export interface MonCuaTruong {
  key: string;
  ten: string;
  soTaiLieu: number;
  /** _id linh vuc cua mon, null = chua xep linh vuc. */
  nhom: string | null;
}

/** Mot linh vuc co mon cua truong - o "Danh mục môn học" trang truong. */
export interface LinhVucTruong {
  _id: string;
  key: string;
  ten: string;
  bieuTuong: BieuTuongLinhVuc;
  soMon: number;
  soTaiLieu: number;
}

/** GET /api/documents/truong/:khoa - trang /share-document/institution/<khoa>. */
export interface ChiTietTruong {
  truong: DocumentUniversity;
  /** Danh muc mon cua truong + mon da co bai cua truong, nhieu tai lieu truoc. */
  monHoc: MonCuaTruong[];
  /** Linh vuc co mon cua truong. */
  linhVuc: LinhVucTruong[];
  /** Vai truong khac, nhieu tai lieu truoc. */
  truongKhac: DocumentUniversity[];
}

/** So lieu tong quan cua kho - section so lieu o /share-document. */
export interface DocumentStats {
  soTaiLieu: number;
  moiTuanNay: number;
  soMon: number;
  soLinhVuc: number;
  soTruong: number;
  soNguoiChiaSe: number;
  tongLuotTai: number;
}

/** Linh vuc - nhom lon chua nhieu mon (Luat, Kinh doanh, He thong...). */
export interface DocumentCategory {
  _id: string;
  key: string;
  ten: string;
  bieuTuong: BieuTuongLinhVuc;
  thuTu: number;
  soMon: number;
  /** So tai lieu KHAC NHAU co it nhat mot mon thuoc linh vuc. */
  soTaiLieu: number;
  monTieuBieu: { key: string; ten: string }[];
}

/**
 * Tai lieu trong goi y va lich su KHONG co `description` (may chu bo di cho
 * nhe). Tach kieu rieng de khong ai vo tinh doc description roi nhan undefined.
 */
export type DocumentSummary = Omit<SharedDocument, "description">;

export type RecommendedDocument = DocumentSummary & { viSaoGoiY: string };

export interface RecommendationResponse {
  documents: RecommendedDocument[];
  // true chi khi may chu THAT SU dua tren lich su cua nguoi nay. false thi ket
  // qua chi la moi nhat / pho bien - dung goi no la "danh cho ban".
  caNhanHoa: boolean;
}

export type HistoryItem = DocumentSummary & {
  lanCuoi: string;
  daTai: boolean;
};

export const documentService = {
  /** Danh sach tai lieu - cong khai, khong can dang nhap */
  getDocuments: async (params?: {
    page?: number;
    limit?: number;
    q?: string;
    // Khoa mon (DocumentSubject.key), khong phai ten hien thi.
    mon?: string;
    // Khoa linh vuc (DocumentCategory.key).
    nhom?: string;
    // Khoa truong (DocumentUniversity.key).
    truong?: string;
    loai?: LoaiTaiLieu | "";
    sapXep?: "luotTai" | "phoBien";
    thongKe?: boolean;
  }): Promise<DocumentListResponse> => {
    const sp = new URLSearchParams();
    if (params?.page) sp.append("page", String(params.page));
    if (params?.limit) sp.append("limit", String(params.limit));
    if (params?.q?.trim()) sp.append("q", params.q.trim());
    if (params?.mon?.trim()) sp.append("mon", params.mon.trim());
    if (params?.nhom?.trim()) sp.append("nhom", params.nhom.trim());
    if (params?.truong?.trim()) sp.append("truong", params.truong.trim());
    if (params?.loai) sp.append("loai", params.loai);
    if (params?.sapXep) sp.append("sapXep", params.sapXep);
    if (params?.thongKe) sp.append("thongKe", "1");
    const qs = sp.toString() ? `?${sp.toString()}` : "";
    const kq: DocumentListResponse = await apiRequest(`/documents${qs}`, {
      method: "GET",
    });
    // Duong nay qua CDN (luu 60 giay) - xem chuanHoaTaiLieu.
    return { ...kq, documents: (kq.documents ?? []).map(chuanHoaTaiLieu) };
  },

  /**
   * Dang tai lieu moi. Bat buoc dang nhap - apiHelper tu gan token.
   *
   * Truyen thang FormData, KHONG tu dat Content-Type: apiHelper se go header
   * do ra de trinh duyet tu sinh boundary cho multipart.
   */
  createDocument: async (data: {
    title: string;
    description: string;
    /** KHOA cac mon (DocumentSubject.key), 1-5 mon. */
    monHoc: string[];
    /** 1-5 file, dung thu tu se hien. */
    files: File[];
    /** KHOA truong - khong bat buoc. */
    truong?: string;
  }): Promise<SharedDocument> => {
    const fd = new FormData();
    fd.append("title", data.title);
    fd.append("description", data.description);
    // Multipart khong co kieu mang - gui mot chuoi JSON, may chu tu doc
    // (docDsMonTho ben backend).
    fd.append("monHoc", JSON.stringify(data.monHoc));
    // Cung ten truong "files" cho moi file - Multer gom lai thanh mang.
    data.files.forEach((f) => fd.append("files", f));
    if (data.truong) fd.append("truong", data.truong);
    return apiRequest("/documents", { method: "POST", body: fd });
  },

  /**
   * Tai mot anh len de chen vao noi dung bai (anh chup man hinh cac buoc).
   * Tra ve URL tren kho anh cua du an - may chu chi giu anh co URL nay.
   */
  uploadImage: async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("anh", file);
    const kq: { url: string } = await apiRequest("/documents/anh", {
      method: "POST",
      body: fd,
    });
    return kq.url;
  },

  /** Tang so luot tai. Loi o day khong quan trong nen goi xong bo qua. */
  countDownload: async (id: string): Promise<{ downloadCount: number }> => {
    return apiRequest(`/documents/${id}/download`, { method: "POST" });
  },

  /** Xoa tai lieu - chi chu bai hoac admin */
  deleteDocument: async (id: string): Promise<{ message: string }> => {
    return apiRequest(`/documents/${id}`, { method: "DELETE" });
  },

  /** Cac mon hoc dang co trong kho, nhieu tai lieu nhat truoc. */
  getSubjects: async (): Promise<DocumentSubject[]> => {
    return apiRequest("/documents/mon-hoc", { method: "GET" });
  },

  /**
   * Goi y tai lieu.
   * Co `id`: tai lieu lien quan toi tai lieu dang xem.
   * Khong id: goi y theo lich su xem/tai/tim cua nguoi dang dang nhap.
   */
  getRecommendations: async (params?: {
    id?: string;
    limit?: number;
  }): Promise<RecommendationResponse> => {
    const sp = new URLSearchParams();
    if (params?.id) sp.append("id", params.id);
    if (params?.limit) sp.append("limit", String(params.limit));
    const qs = sp.toString() ? `?${sp.toString()}` : "";
    const kq: RecommendationResponse = await apiRequest(`/documents/goi-y${qs}`, {
      method: "GET",
    });
    // Moi duong tra tai lieu ra deu phai qua chuanHoaTaiLieu, khong chi
    // getDocuments. Bai kieu blog co the khong co `files` (khong kem file) -
    // the TheTaiLieuDoc doc `doc.files.length` la sap ca trang. Loi that
    // 04/10/2026 o hang "Xem gần đây" cua /share-document/all-document.
    return { ...kq, documents: (kq.documents ?? []).map(chuanHoaTaiLieu) };
  },

  /**
   * Bao may chu nguoi dung vua mo trang chi tiet. May chu chi ghi khi da dang
   * nhap, khach thi tra 204 va khong ghi gi. Loi o day khong quan trong.
   */
  logView: async (id: string): Promise<void> => {
    await apiRequest(`/documents/${id}/xem`, { method: "POST" });
  },

  /** Ghi lai mot lan tim - xem logView. */
  logSearch: async (q: string): Promise<void> => {
    await apiRequest("/documents/tim-kiem", {
      method: "POST",
      body: JSON.stringify({ q }),
    });
  },

  /** Lich su xem/tai cua chinh minh. Bat buoc dang nhap. */
  getMyHistory: async (): Promise<{ items: HistoryItem[] }> => {
    const kq: { items: HistoryItem[] } = await apiRequest("/documents/lich-su", {
      method: "GET",
    });
    // Xem ghi chu o getRecommendations.
    return { ...kq, items: (kq.items ?? []).map(chuanHoaTaiLieu) };
  },

  /** Xoa toan bo lich su cua chinh minh (ca lich su tim). */
  clearMyHistory: async (): Promise<{ daXoa: number }> => {
    return apiRequest("/documents/lich-su", { method: "DELETE" });
  },

  /**
   * Sua tai lieu - chu bai hoac admin. Chi gui truong can doi; truong khong
   * gui thi may chu giu nguyen. `monHoc` la KHOA mon (DocumentSubject.key).
   */
  updateDocument: async (
    id: string,
    data: { title?: string; description?: string; monHoc?: string[]; truong?: string },
  ): Promise<SharedDocument> => {
    return apiRequest(`/documents/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * Tai lieu do chinh minh dang - cho trang ca nhan. GOM ca bai bi admin an
   * (co `daAn`). Bat buoc dang nhap.
   */
  getMyDocuments: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<DocumentListResponse> => {
    const sp = new URLSearchParams();
    if (params?.page) sp.append("page", String(params.page));
    if (params?.limit) sp.append("limit", String(params.limit));
    const qs = sp.toString() ? `?${sp.toString()}` : "";
    const kq: DocumentListResponse = await apiRequest(`/documents/cua-toi${qs}`, {
      method: "GET",
    });
    // Xem ghi chu o getRecommendations.
    return { ...kq, documents: (kq.documents ?? []).map(chuanHoaTaiLieu) };
  },

  // ----------------------------- quan tri -----------------------------

  /** Danh sach cho quan tri - GOM ca tai lieu da an. Chi admin. */
  getDocumentsAdmin: async (params?: {
    page?: number;
    limit?: number;
    q?: string;
  }): Promise<DocumentListResponse> => {
    const sp = new URLSearchParams();
    if (params?.page) sp.append("page", String(params.page));
    if (params?.limit) sp.append("limit", String(params.limit));
    if (params?.q?.trim()) sp.append("q", params.q.trim());
    const qs = sp.toString() ? `?${sp.toString()}` : "";
    const kq: DocumentListResponse = await apiRequest(`/documents/quan-tri${qs}`, {
      method: "GET",
    });
    // Xem ghi chu o getRecommendations.
    return { ...kq, documents: (kq.documents ?? []).map(chuanHoaTaiLieu) };
  },

  /** An / hien tai lieu. Chi admin. */
  setHidden: async (id: string, daAn: boolean): Promise<{ daAn: boolean }> => {
    return apiRequest(`/documents/${id}/an`, {
      method: "PATCH",
      body: JSON.stringify({ daAn }),
    });
  },

  // --------------------- danh sach mon (admin) ---------------------

  createSubject: async (ten: string): Promise<DocumentSubject> => {
    return apiRequest("/documents/mon-hoc", {
      method: "POST",
      body: JSON.stringify({ ten }),
    });
  },

  /** Doi ten mon. May chu tu cap nhat moi tai lieu dang dung mon nay. */
  renameSubject: async (
    id: string,
    ten: string,
  ): Promise<DocumentSubject & { soTaiLieuDaCapNhat: number }> => {
    return apiRequest(`/documents/mon-hoc/${id}`, {
      method: "PUT",
      body: JSON.stringify({ ten }),
    });
  },

  /** Xep mon vao linh vuc (null = bo khoi linh vuc). */
  setSubjectCategory: async (
    id: string,
    nhom: string | null,
  ): Promise<DocumentSubject> => {
    return apiRequest(`/documents/mon-hoc/${id}`, {
      method: "PUT",
      body: JSON.stringify({ nhom }),
    });
  },

  // ----------------------------- truong dai hoc -----------------------------

  getUniversities: async (): Promise<DocumentUniversity[]> => {
    return apiRequest("/documents/truong", { method: "GET" });
  },

  createUniversity: async (ten: string): Promise<DocumentUniversity> => {
    return apiRequest("/documents/truong", {
      method: "POST",
      body: JSON.stringify({ ten }),
    });
  },

  renameUniversity: async (
    id: string,
    ten: string,
  ): Promise<DocumentUniversity & { soTaiLieuDaCapNhat: number }> => {
    return apiRequest(`/documents/truong/${id}`, {
      method: "PUT",
      body: JSON.stringify({ ten }),
    });
  },

  /** Dat logo truong - "" de bo logo. */
  setUniversityLogo: async (id: string, logo: string): Promise<DocumentUniversity> => {
    return apiRequest(`/documents/truong/${id}`, {
      method: "PUT",
      body: JSON.stringify({ logo }),
    });
  },

  deleteUniversity: async (id: string): Promise<{ soTaiLieuDaGo: number }> => {
    return apiRequest(`/documents/truong/${id}`, { method: "DELETE" });
  },

  // ----------------------------- linh vuc -----------------------------

  /** Cac linh vuc kem so mon, so tai lieu - cong khai. */
  getCategories: async (): Promise<DocumentCategory[]> => {
    return apiRequest("/documents/linh-vuc", { method: "GET" });
  },

  createCategory: async (data: {
    ten: string;
    bieuTuong?: BieuTuongLinhVuc;
  }): Promise<DocumentCategory> => {
    return apiRequest("/documents/linh-vuc", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateCategory: async (
    id: string,
    data: { ten?: string; bieuTuong?: BieuTuongLinhVuc; thuTu?: number },
  ): Promise<DocumentCategory> => {
    return apiRequest(`/documents/linh-vuc/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /** Xoa linh vuc - cac mon trong do chi thanh "chua co linh vuc", khong mat. */
  deleteCategory: async (id: string): Promise<{ soMonDaGo: number }> => {
    return apiRequest(`/documents/linh-vuc/${id}`, { method: "DELETE" });
  },

  /** Xoa mon. May chu tu choi (409) neu con tai lieu dung mon nay. */
  deleteSubject: async (id: string): Promise<{ message: string }> => {
    return apiRequest(`/documents/mon-hoc/${id}`, { method: "DELETE" });
  },

  // ----------------------------- binh luan -----------------------------

  getComments: async (id: string): Promise<CommentListResponse> => {
    return apiRequest(`/documents/${id}/binh-luan`, { method: "GET" });
  },

  /** Viet binh luan, hoac tra loi neu co `traLoi`. Bat buoc dang nhap. */
  createComment: async (
    id: string,
    noiDung: string,
    traLoi?: string,
  ): Promise<{ binhLuan: DocumentComment }> => {
    return apiRequest(`/documents/${id}/binh-luan`, {
      method: "POST",
      body: JSON.stringify({ noiDung, traLoi }),
    });
  },

  /** Xoa binh luan - nguoi viet hoac admin. Xoa binh luan goc la xoa ca tra loi. */
  deleteComment: async (commentId: string): Promise<{ message: string }> => {
    return apiRequest(`/documents/binh-luan/${commentId}`, { method: "DELETE" });
  },

  /** An / hien binh luan. Chi admin. */
  setCommentHidden: async (
    commentId: string,
    daAn: boolean,
  ): Promise<{ daAn: boolean }> => {
    return apiRequest(`/documents/binh-luan/${commentId}/an`, {
      method: "PATCH",
      body: JSON.stringify({ daAn }),
    });
  },
};
