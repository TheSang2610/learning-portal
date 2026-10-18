"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { INSTRUCTOR_SHELL as C } from "@/src/constants/instructor/menu";
import { useUserLoading, useStoredUser } from "@/src/hooks/userStore";
import { clearSession } from "@/src/services/apiHelper";

/** Gac cong khu giang vien va dang xuat. Trang thai menu nam trong DashboardShell. */
export function useInstructorShell() {
  const router = useRouter();
  const pathname = usePathname();

  // Doc localStorage bang useSyncExternalStore thay vi useEffect + setState,
  // xem src/hooks/userStore.ts. Effect ben duoi chi con lo viec chuyen huong.
  const user = useStoredUser();
  const loadingUser = useUserLoading();
  const instructorName = user?.name ?? "";

  // `loading` SUY RA duoc, khong can state rieng: con dang hoi may chu, hoac
  // sai vai tro va dang bi day ra. Giu state rieng thi phai setLoading() ngay
  // trong effect - React canh bao vi no de sinh vong ve lai day chuyen, va
  // eslint o day chay voi --max-warnings 0.
  const loading = loadingUser || (user?.role !== "instructor" && user?.role !== "admin");

  // null = "chua bam gi, cu theo duong dan"; true/false = nguoi dung da tu bam.
  useEffect(() => {
    if (loadingUser) return;

    if (user?.role !== "instructor" && user?.role !== "admin") router.push(C.outHref);
  }, [loadingUser, user, router]);

  const logoutHandler = async () => {
    // Truoc day cho nay chi xoa userInfo, KHONG xoa authToken - da "dang xuat"
    // ma getHeaders van gan token cu vao moi request, nguoi ke tiep dung may
    // van con la giang vien voi backend. clearSession() lam du bon viec, xem apiHelper.
    // PHAI await, neu khong dieu huong se huy request dang xuat giua chung va
    // cookie con nguyen - xem ghi chu o apiHelper.
    await clearSession();
    router.push(C.outHref);
  };

  return {
    pathname,
    loading,
    instructorName,
    logoutHandler,
  };
}

export type InstructorShellState = ReturnType<typeof useInstructorShell>;
