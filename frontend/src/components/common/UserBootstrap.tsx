"use client";

import { useEffect } from "react";
import { PROFILE_PATH } from "@/src/services/apiBase";
import { storeUser, setLoading, SIGNAL_KEY } from "@/src/hooks/userStore";

// Hoi may chu "toi la ai" mot lan moi lan tai trang, roi nhet ket qua vao kho
// trong RAM (src/hooks/userStore.ts). Khong ve gi ra man hinh.
//
// VI SAO KHONG DUNG apiRequest / getMyProfile O DAY - day la cai bay:
// apiHelper.handleResponse gap 401 se goi clearSession() roi
// `window.location.href = "/"`. Component nay chay tren MOI trang, ke ca trang
// chu, va khach vang lai thi /users/profile tra dung 401. Dung apiRequest la
// khach chua dang nhap vao trang chu se bi chuyen ve trang chu -> tai lai ->
// lai 401 -> tai lai... vong lap khong loi thoat, ca trang chet.
//
// Nen o day goi fetch tho: 401 la cau tra loi HOP LE ("ban la khach"), khong
// phai loi.

// The <script> noi tuyen trong app/layout.tsx (ProfilePrefetchScript) da ban luot goi nay di
// tu luc trinh duyet con dang doc HTML, va de lai loi hua o day. Nhan lay no
// thay vi goi lai tu dau.
//
// VI SAO PHAI LAM VAY: useEffect chi chay sau khi ca goi JavaScript da tai,
// phan tich va hydrate xong. Neu doi den luc do moi goi thi luot mang nam NOI
// DUOI toan bo viec do, va goc phai thanh dieu huong trong suot ca quang thoi
// gian ay. Ban truoc thi hai viec chay song song.
//
// CHI dung duoc MOT lan: cac lan nap lai sau (doi tab, bam Back, vua dang
// nhap xong) deu phai hoi lai may chu that. Xoa ngay sau khi lay.
declare global {
  interface Window {
    __hoSoDangBay?: Promise<unknown> | null;
  }
}

const getPendingProfile = (): Promise<unknown> | null => {
  if (typeof window === "undefined") return null;
  const pending = window.__hoSoDangBay;
  if (!pending) return null;
  window.__hoSoDangBay = null;
  return pending;
};

export default function UserBootstrap() {
  useEffect(() => {
    let stillMounted = true;

    const load = async () => {
      try {
        // Lan dau: dung ket qua cua luot goi da bay san tu the <script>.
        const requested = getPendingProfile();
        if (requested) {
          const data = await requested;
          if (!stillMounted) return;
          // The <script> tra ve null cho ca 401 (khach vang lai) lan loi mang.
          // Hai truong hop deu coi nhu chua dang nhap - giong het nhanh duoi.
          storeUser((data as Parameters<typeof storeUser>[0]) ?? null, false);
          return;
        }

        const res = await fetch(PROFILE_PATH, {
          credentials: "include",
          // Danh tinh khong duoc lay tu bo dem cua trinh duyet: vua doi tai
          // khoan ma an ban cu la hien nham ten nguoi truoc.
          cache: "no-store",
        });
        if (!stillMounted) return;

        if (!res.ok) {
          // 401 = khach vang lai. Cac ma khac (500, mat mang) cung coi nhu
          // chua dang nhap: tha ve nut "Dang nhap" con hon treo mai o trang
          // thai dang tai.
          storeUser(null, false);
          return;
        }

        storeUser(await res.json(), false);
      } catch {
        if (stillMounted) storeUser(null, false);
      }
    };

    void load();

    // Dang nhap o tab ben canh thi tab nay phai biet. Su kien 'storage' chi
    // ban cho cac tab KHAC, dung y ta can.
    //
    // CAN THAN: nap() ket thuc bang storeUser(..., false). Chu `false` do
    // la thu duy nhat chan vong lap - bo di thi tra loi mot thong bao lai
    // phat ra mot thong bao moi, va hai tab se goi /users/profile qua lai
    // khong bao gio dung. Xem ghi chu dai o storeUser().
    const onOtherTabChange = (e: StorageEvent) => {
      if (e.key !== SIGNAL_KEY) return;
      setLoading(true);
      void load();
    };

    // Quay lai bang nut Back: trang duoc lay tu bo nho dem cua trinh duyet nen
    // useEffect KHONG chay lai - phai tu doc lai, neu khong man hinh con giu
    // danh tinh cu sau khi da dang xuat o trang khac.
    const onReturn = (e: PageTransitionEvent) => {
      if (e.persisted) void load();
    };

    // Vua dang nhap xong: requireReload() ban su kien nay de lap not cac truong
    // ma than phan hoi cua /login khong co (fullname, avatar, provider).
    const onRemembered = () => void load();

    window.addEventListener("storage", onOtherTabChange);
    window.addEventListener("pageshow", onReturn);
    window.addEventListener("napLaiNguoiDung", onRemembered);

    return () => {
      stillMounted = false;
      window.removeEventListener("storage", onOtherTabChange);
      window.removeEventListener("pageshow", onReturn);
      window.removeEventListener("napLaiNguoiDung", onRemembered);
    };
  }, []);

  return null;
}
