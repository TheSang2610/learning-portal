"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { useStoredUser, useUserLoading } from "@/src/hooks/userStore";
import { clearSession } from "@/src/services/apiHelper";
import { PROFILE_PATH } from "@/src/services/apiBase";

// Ghi o cap module (song qua viec component bi dung lai sau router.refresh):
// da xin doi trang cho nguoi nay roi thi thoi. Khi proxy KHONG thay duoc cookie
// (NEXT_PUBLIC_GOI_THANG_BACKEND=1) refresh xong van la landing - khong co co
// nay thi refresh -> landing -> refresh... lap mai.
let refreshedForUser: string | null = null;

const RETRY_KEY = "trang-chu-thu-dang-xuat";

/**
 * Giu trang chu dung che do khi trang thai dang nhap doi ma KHONG tai lai trang.
 *
 * proxy.ts chon landing / dashboard luc yeu cau toi may chu. Nhung dang nhap
 * bang hop thoai ngay tren landing thi khong co yeu cau nao moi - nguoi vua
 * dang nhap van dung o landing, nhin bang hoc phi. Component nay bat khoanh
 * khac do va xin lai trang tu may chu (router.refresh), luc nay proxy da thay
 * cookie.
 *
 *   mode="guest"  (landing)   : vua co nguoi dung -> refresh -> dashboard.
 *   mode="member" (dashboard) : hoi xong ma KHONG co nguoi dung, tuc cookie con
 *                               nhung phien da chet (het han, bi khoa, doi mat
 *                               khau). Hoi lai mot lan cho chac: chi 401 moi
 *                               xoa cookie va ve landing. Loi 500 / mat mang
 *                               thi de yen - da nguoi dung ra ngoai chi vi
 *                               may chu truc trac la sai.
 *
 * Khong ve gi ra man hinh.
 */
export default function HomeModeSync({ mode }: { mode: "guest" | "member" }) {
  const router = useRouter();
  const user = useStoredUser();
  const loading = useUserLoading();
  const handled = useRef(false);

  useEffect(() => {
    if (loading || handled.current) return;

    if (mode === "guest" && user) {
      handled.current = true;
      const id = user._id ?? user.email ?? "?";
      if (refreshedForUser === id) return;
      refreshedForUser = id;
      router.refresh();
      return;
    }

    if (mode === "member" && !user) {
      handled.current = true;
      void (async () => {
        try {
          const res = await fetch(PROFILE_PATH, {
            credentials: "include",
            cache: "no-store",
          });
          if (res.status !== 401) {
            handled.current = false;
            return;
          }
        } catch {
          handled.current = false;
          return;
        }
        // Phai cho may chu xoa cookie xong, neu khong proxy lai dua ve dashboard.
        await clearSession();

        // Chot chong lap: neu cookie VAN khong mat (luot dang xuat that bai) thi
        // refresh xong lai la dashboard -> lai vao day -> lai refresh... Moi tab
        // chi thu mot lan trong 30 giay; qua do thi dung yen o dashboard (khung
        // trong) con hon nhay trang lien tuc.
        try {
          const last = Number(sessionStorage.getItem(RETRY_KEY) ?? 0);
          if (Date.now() - last < 30_000) return;
          sessionStorage.setItem(RETRY_KEY, String(Date.now()));
        } catch {
          // Khong co sessionStorage: van refresh, chap nhan rui ro nho.
        }
        router.refresh();
      })();
    }
  }, [mode, user, loading, router]);

  return null;
}
