"use client";

import { useEffect, useRef, useState } from "react";

// Hien dan khi cuon toi.
//
// Cai bay cua kieu hieu ung nay la de noi dung o opacity: 0 ngay tu HTML roi
// cho JavaScript bat len. Lam vay thi:
//   - JS hong hoac chua kip chay -> ca muc VO HINH vinh vien
//   - anh chup thumbnail va trinh thu thap doc trang tinh -> thay trang trang
//
// Nen o day di duong khac: HTML tra ve luon O TRANG THAI HIEN. Sau khi gan
// xong, neu phan tu con NAM DUOI TAM NHIN thi moi an di roi cho cuon toi. Luc
// an no dang o ngoai man hinh nen khong ai thay cai nhap nhay, con phan tu
// dang hien trong tam nhin thi khong dung toi.
//
// Ket qua: khong JS van doc duoc, khong nhap nhay, va van co hieu ung.

type TrangThai = "thuong" | "an" | "hien";

interface Props {
  children: React.ReactNode;
  /** Do tre tinh bang mili giay, de cac khoi ke nhau len so le. */
  doTre?: number;
  className?: string;
}

export default function HienDanKhiCuon({ children, doTre = 0, className }: Props) {
  const oRef = useRef<HTMLDivElement>(null);
  const [trangThai, setTrangThai] = useState<TrangThai>("thuong");

  useEffect(() => {
    const el = oRef.current;
    if (!el) return;

    // Nguoi dung dat he dieu hanh giam chuyen dong thi ton trong: bo qua han,
    // khong phai lam nhanh hon.
    const giamChuyenDong = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (giamChuyenDong || typeof IntersectionObserver === "undefined") return;

    // Da nam trong tam nhin ngay khi tai trang -> de nguyen, khong an roi hien
    // lai (nguoi dung se thay mot cu nhay vo co).
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    setTrangThai("an");

    const theoDoi = new IntersectionObserver(
      ([muc]) => {
        if (!muc.isIntersecting) return;
        setTrangThai("hien");
        theoDoi.disconnect();
      },
      // Cat 12% duoi man hinh: khoi bat dau hien khi da nhu vao han, chu khong
      // phai luc mep tren vua cham day man hinh.
      { rootMargin: "0px 0px -12% 0px" },
    );

    theoDoi.observe(el);
    return () => theoDoi.disconnect();
  }, []);

  return (
    <div
      ref={oRef}
      style={trangThai === "an" ? undefined : { transitionDelay: `${doTre}ms` }}
      className={[
        "transition-[opacity,transform] duration-[550ms] ease-out motion-reduce:transition-none",
        trangThai === "an" ? "translate-y-5 opacity-0" : "translate-y-0 opacity-100",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </div>
  );
}
