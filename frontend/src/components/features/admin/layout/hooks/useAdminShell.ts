"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useUserLoading, useStoredUser } from "@/src/hooks/userStore";
import { clearSession } from "@/src/services/apiHelper";

/** Gac cong quan tri va dang xuat. Trang thai menu nam trong DashboardShell. */
export function useAdminShell() {
  const router = useRouter();
  const pathname = usePathname();

  // Doc localStorage bang useSyncExternalStore thay vi useEffect + setState,
  // xem src/hooks/userStore.ts. Effect ben duoi chi con lo viec chuyen huong.
  const user = useStoredUser();
  const loadingUser = useUserLoading();
  const adminName = user?.name ?? "";

  // `loading` SUY RA duoc, khong can state rieng: con dang hoi may chu, hoac
  // sai vai tro va dang bi day ra. Giu state rieng thi phai setLoading() ngay
  // trong effect - React canh bao vi no de sinh vong ve lai day chuyen, va
  // eslint o day chay voi --max-warnings 0.
  const loading = loadingUser || user?.role !== "admin";

  // Gac cong khu quan tri bang cau tra loi cua MAY CHU.
  //
  // Ban cu doc localStorage.userInfo roi so user.role. Bat ky ai mo DevTools
  // cung sua duoc dong do thanh "admin": khong lay them duoc du lieu nao - moi
  // API van di qua middleware ben backend va van tra 403 - nhung TOAN BO khung
  // quan tri hien ra: menu, ten tung trang, breadcrumb. Do la ro ri be mat he
  // thong, va man hinh thi day loi 403 lon xon.
  //
  // Cung khong the sua bang cach doi sang luu token trong localStorage: trinh
  // duyet khong co JWT_SECRET nen KHONG kiem duoc chu ky, van phai tin phan
  // payload nguoi dung tu go ra - y het van de cu, lai them nguy co XSS doc
  // trom token (xem ghi chu dau utils/cookieToken.js ben backend).
  //
  // Duong dung la HOI MAY CHU. <UserBootstrap /> o root layout da goi
  // GET /users/profile mot lan va cat ket qua vao kho trong RAM; vai tro trong
  // do lay thang tu CSDL nen khong sua duoc tu trinh duyet.
  //
  // Doc lai tu kho chu khong tu goi getMyProfile() o day: goi rieng la them
  // mot luot mang trung lap, va apiHelper gap 401 se tu day ve trang chu -
  // hai duong chuyen huong chay dua nhau thi rat kho lan ra khi co su co.
  useEffect(() => {
    if (loadingUser) return;

    if (user?.role !== "admin") router.push("/");
  }, [loadingUser, user, router]);

  const logoutHandler = async () => {
    // Truoc day cho nay chi xoa userInfo, KHONG xoa authToken - da "dang xuat"
    // ma getHeaders van gan token cu vao moi request, nguoi ke tiep dung may
    // van con la admin voi backend. clearSession() lam du bon viec, xem apiHelper.
    // PHAI await, neu khong dieu huong se huy request dang xuat giua chung va
    // cookie con nguyen - xem ghi chu o apiHelper.
    await clearSession();
    router.push("/");
  };

  return {
    pathname,
    adminName,
    loading,
    logoutHandler,
  };
}

export type AdminShellState = ReturnType<typeof useAdminShell>;
