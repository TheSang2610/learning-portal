import { apiRequest } from "./apiHelper";

export interface DocumentUploader {
  _id?: string;
  name?: string;
  avatar?: string;
}

export interface SharedDocument {
  _id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileExt: "pdf" | "doc" | "docx";
  fileSize: number;
  uploader?: DocumentUploader | null;
  downloadCount: number;
  createdAt: string;
}

export interface DocumentListResponse {
  documents: SharedDocument[];
  total: number;
  page: number;
  totalPages: number;
}

export const documentService = {
  /** Danh sach tai lieu - cong khai, khong can dang nhap */
  getDocuments: async (params?: {
    page?: number;
    limit?: number;
    q?: string;
  }): Promise<DocumentListResponse> => {
    const sp = new URLSearchParams();
    if (params?.page) sp.append("page", String(params.page));
    if (params?.limit) sp.append("limit", String(params.limit));
    if (params?.q?.trim()) sp.append("q", params.q.trim());
    const qs = sp.toString() ? `?${sp.toString()}` : "";
    return apiRequest(`/documents${qs}`, { method: "GET" });
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
    file: File;
  }): Promise<SharedDocument> => {
    const fd = new FormData();
    fd.append("title", data.title);
    fd.append("description", data.description);
    fd.append("file", data.file);
    return apiRequest("/documents", { method: "POST", body: fd });
  },

  /** Tang so luot tai. Loi o day khong quan trong nen goi xong bo qua. */
  countDownload: async (id: string): Promise<{ downloadCount: number }> => {
    return apiRequest(`/documents/${id}/download`, { method: "POST" });
  },

  /** Xoa tai lieu - chi chu bai hoac admin */
  deleteDocument: async (id: string): Promise<{ message: string }> => {
    return apiRequest(`/documents/${id}`, { method: "DELETE" });
  },
};
