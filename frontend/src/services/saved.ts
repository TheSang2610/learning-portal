import { apiRequest } from "./apiHelper";

/** Hai loai noi dung luu duoc - khop SavedItem.LOAI ben backend. */
export type SaveType = "baiViet" | "taiLieu";

export interface SavedItem {
  loai: SaveType;
  id: string;
  luuLuc: string;
  tieuDe: string;
  duongDan: string;
  tacGia: string | null;
  ngayDang: string;
  // Chi bai viet
  moTa?: string;
  anh?: string | null;
  // Chi tai lieu
  monHoc?: string[];
  duoiFile?: string;
  soFile?: number;
}

/** Bai viet / tai lieu da luu cua chinh minh. Bat buoc dang nhap. */
export const savedService = {
  layDaLuu: async (): Promise<{ items: SavedItem[] }> =>
    apiRequest("/da-luu", { method: "GET" }),

  /** Chi id - de to mau nut luu tren cac danh sach. */
  getId: async (): Promise<Record<SaveType, string[]>> =>
    apiRequest("/da-luu/id", { method: "GET" }),

  luu: async (loai: SaveType, id: string): Promise<{ daLuu: boolean }> =>
    apiRequest("/da-luu", { method: "POST", body: JSON.stringify({ loai, id }) }),

  boLuu: async (loai: SaveType, id: string): Promise<{ daLuu: boolean }> =>
    apiRequest(`/da-luu/${loai}/${id}`, { method: "DELETE" }),

  /** Chuyen danh sach luu cu trong localStorage vao tai khoan. */
  nhap: async (path: string[]): Promise<{ daNhap: number }> =>
    apiRequest("/da-luu/nhap", {
      method: "POST",
      body: JSON.stringify({ duongDan: path }),
    }),
};
