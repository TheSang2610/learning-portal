"use client";

import { usePathname } from "next/navigation";

import AssistantChatBox from "./AssistantChat";

/**
 * Hop chat noi o goc phai, gan trong layout nen hien tren MOI trang portal.
 *
 * Vi sao phai co lop boc nay thay vi dat thang AssistantChatBox vao layout:
 * layout la Server Component, ma o day can usePathname() de an di o trang hoc
 * bai. Trang do da tu dat mot AssistantChatBox rieng — ban co ngu canh cua dung
 * bai dang mo — nen neu khong an, goc phai se co HAI cai nut chong len nhau.
 *
 * usePathname() khong can Suspense (khac useSearchParams), nen dat o day khong
 * lam hong viec prerender tinh cua cac trang portal.
 */
export default function GlobalAssistant() {
  const path = usePathname();

  if (path?.startsWith("/learn")) return null;

  // Khong truyen courseId -> che do hoi chung: khach vang lai cung hoi duoc,
  // va may chu khong dua noi dung bai hoc nao vao loi nhac.
  return <AssistantChatBox />;
}
