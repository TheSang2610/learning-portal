"use client";

import { useStoredUser } from "@/src/hooks/userStore";

/**
 * Chi hien cho KHACH: an di ngay khi biet nguoi xem da dang nhap.
 *
 * Chieu mac dinh la HIEN: luc may chu ve trang va luc con dang hoi
 * /users/profile thi van hien. Vi:
 *   - HTML may chu ve ra la ban cho khach (Google cung la khach) - an trong
 *     luc cho thi khach that phai nhin mot khoang trong roi moi thay noi dung.
 *   - Nguoi da dang nhap binh thuong khong toi duoc trang landing: proxy.ts da
 *     chuyen ho sang dashboard. Day chi la luoi an toan cho luc proxy khong
 *     thay cookie (NEXT_PUBLIC_GOI_THANG_BACKEND=1), hoac vua dang nhap xong
 *     ma trang chua kip doi.
 *
 * Muon nguoc lai (chi hien cho nguoi da dang nhap) thi KHONG dung component
 * nay - dat noi dung do o dashboard (app/(portal)/home/page.tsx).
 */
export default function GuestOnly({ children }: { children: React.ReactNode }) {
  const user = useStoredUser();
  if (user) return null;
  return <>{children}</>;
}
