"use client";

import { useEffect } from "react";
import { GOC_API_TRINH_DUYET } from "@/src/services/diaChiApi";
import { datNguoiDung, datDangTai, KHOA_HIEU } from "@/src/hooks/nguoiDungLuu";

// Hoi may chu "toi la ai" mot lan moi lan tai trang, roi nhet ket qua vao kho
// trong RAM (src/hooks/nguoiDungLuu.ts). Khong ve gi ra man hinh.
//
// VI SAO KHONG DUNG apiRequest / getMyProfile O DAY - day la cai bay:
// apiHelper.handleResponse gap 401 se goi xoaPhien() roi
// `window.location.href = "/"`. Component nay chay tren MOI trang, ke ca trang
// chu, va khach vang lai thi /users/profile tra dung 401. Dung apiRequest la
// khach chua dang nhap vao trang chu se bi chuyen ve trang chu -> tai lai ->
// lai 401 -> tai lai... vong lap khong loi thoat, ca trang chet.
//
// Nen o day goi fetch tho: 401 la cau tra loi HOP LE ("ban la khach"), khong
// phai loi.

const DUONG = `${GOC_API_TRINH_DUYET}/api/users/profile`;

export default function NapNguoiDung() {
  useEffect(() => {
    let conSong = true;

    const nap = async () => {
      try {
        const res = await fetch(DUONG, {
          credentials: "include",
          // Danh tinh khong duoc lay tu bo dem cua trinh duyet: vua doi tai
          // khoan ma an ban cu la hien nham ten nguoi truoc.
          cache: "no-store",
        });
        if (!conSong) return;

        if (!res.ok) {
          // 401 = khach vang lai. Cac ma khac (500, mat mang) cung coi nhu
          // chua dang nhap: tha ve nut "Dang nhap" con hon treo mai o trang
          // thai dang tai.
          datNguoiDung(null);
          return;
        }

        datNguoiDung(await res.json());
      } catch {
        if (conSong) datNguoiDung(null);
      }
    };

    void nap();

    // Dang nhap o tab ben canh thi tab nay phai biet. Su kien 'storage' chi
    // ban cho cac tab KHAC, dung y ta can.
    const khiTabKhacDoi = (e: StorageEvent) => {
      if (e.key !== KHOA_HIEU) return;
      datDangTai(true);
      void nap();
    };

    // Quay lai bang nut Back: trang duoc lay tu bo nho dem cua trinh duyet nen
    // useEffect KHONG chay lai - phai tu doc lai, neu khong man hinh con giu
    // danh tinh cu sau khi da dang xuat o trang khac.
    const khiQuayLai = (e: PageTransitionEvent) => {
      if (e.persisted) void nap();
    };

    // Vua dang nhap xong: yeuCauNapLai() ban su kien nay de lap not cac truong
    // ma than phan hoi cua /login khong co (fullname, avatar, provider).
    const khiDuocNho = () => void nap();

    window.addEventListener("storage", khiTabKhacDoi);
    window.addEventListener("pageshow", khiQuayLai);
    window.addEventListener("napLaiNguoiDung", khiDuocNho);

    return () => {
      conSong = false;
      window.removeEventListener("storage", khiTabKhacDoi);
      window.removeEventListener("pageshow", khiQuayLai);
      window.removeEventListener("napLaiNguoiDung", khiDuocNho);
    };
  }, []);

  return null;
}
