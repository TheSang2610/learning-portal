import type { UpdateProfilePayload, User } from "@/src/services/userApi";

export type SettingsTabKey = "personal" | "security" | "courses";

/** Dong bao ket qua o dau noi dung (xanh = thanh cong, do = loi). */
export type SettingsMessage = { ok: boolean; text: string } | null;

/** Phan chung ma cac tab sua thong tin deu nhan tu trang cha. */
export interface SettingsTabProps {
  user: User;
  editing: string | null;
  toggle: (k: string) => void;
  saving: boolean;
  save: (p: UpdateProfilePayload) => Promise<boolean>;
}
