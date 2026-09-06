"use client";

import Link from "next/link";
import { xoaPhien } from "@/src/services/apiHelper";
import { ChevronDown, User, Settings, LogOut } from "lucide-react";
import AnhDaiDien from "@/src/components/ui/AnhDaiDien";
import SoDuCoin from "@/src/components/common/SoDuCoin";
import { useEffect, useRef, useState } from "react";

// Tach rieng khoi IndividualsHeader de moi header trang deu co menu tai khoan.
// Neu de nguyen trong IndividualsHeader thi cac trang dung header rieng se mat
// duong vao ho so, cai dat va nut dang xuat.

interface UserInfo {
  _id: string;
  name: string;
  email: string;
  role: string;
  picture?: string;
  googlePicture?: string;
  avatar?: string;
}

export default function HeaderUserMenu() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadUser = () => {
      const raw = localStorage.getItem("userInfo");
      if (raw && raw !== "undefined") {
        try {
          setUser(JSON.parse(raw));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    loadUser();

    // Quay lai bang nut Back: trang lay tu bo nho dem nen phai doc lai
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) loadUser();
    };

    window.addEventListener("storage", loadUser);
    window.addEventListener("userInfoChanged", loadUser);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("storage", loadUser);
      window.removeEventListener("userInfoChanged", loadUser);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const logout = () => {
    xoaPhien();
    setUser(null);
    window.location.href = "/";
  };

  if (!user) {
    return (
      <div className="flex items-center gap-5">
        <Link href="/?auth=login" className="text-sm text-blue-600 hover:underline">
          Log In
        </Link>
        <Link
          href="/?auth=register"
          className="rounded-md border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
        >
          Join for Free
        </Link>
      </div>
    );
  }

  const src = user.avatar || user.picture || user.googlePicture;

  // Ten hien thi co duong lui.
  //
  // Co tai khoan trong CSDL khong co `name` (tao qua trang quan tri, hoac dang
  // nhap Google khong tra ve ten). Truoc day cho nay van ra khoang trong,
  // nhung dong chu vai tro ben duoi che lap di nen khong ai de y; bo dong do
  // voi hoc sinh la lo han ra mot o trong canh anh dai dien chu "?".
  //
  // Lay phan truoc @ cua email lam ten: do la thu nguoi dung nhan ra duoc, con
  // "Tài khoản" chi la buoc cuoi cho truong hop khong con gi de bam vao.
  const tenHienThi = user.name?.trim() || user.email?.split("@")[0] || "Tài khoản";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-gray-100"
      >
        <AnhDaiDien
          src={src}
          ten={tenHienThi}
          size={40}
          nenChuCai="bg-blue-600 text-white shadow"
        />

        {/* So du coin thay cho ten vai tro o dong duoi.
            "student" la thu nguoi dung da biet (ho tu dang ky ma), con so coin
            thi doi lien tuc va anh huong toi viec ho co mua duoc khoa hay
            khong - dang cho hon nhieu. Vai tro chi con hien voi admin va giang
            vien, la hai nhom that su can biet minh dang o quyen nao. */}
        <div className="hidden max-w-[150px] flex-col items-start md:flex">
          <span className="w-full truncate text-sm leading-none font-semibold text-slate-900">
            {tenHienThi}
          </span>
          <span className="mt-1 flex items-center gap-1.5">
            <SoDuCoin />
            {user.role !== "student" && (
              <span className="text-xs text-gray-500 capitalize">{user.role}</span>
            )}
          </span>
        </div>
        <ChevronDown size={16} />
      </button>

      {open && (
        <div className="absolute top-14 right-0 z-50 w-64 overflow-hidden rounded-2xl border bg-white py-2 shadow-xl">
          <div className="border-b px-4 py-4">
            <div className="flex items-center gap-3">
              <AnhDaiDien
                src={src}
                ten={tenHienThi}
                size={48}
                nenChuCai="bg-blue-600 text-white"
              />
              <div className="overflow-hidden">
                <p className="truncate font-semibold text-slate-900">{tenHienThi}</p>
                <p className="truncate text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>

          <Link
            href="/user/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-slate-700 transition hover:bg-gray-100 hover:text-slate-900"
          >
            <User size={18} /> <span>Profile</span>
          </Link>

          <Link
            href="/user/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-slate-700 transition hover:bg-gray-100 hover:text-slate-900"
          >
            <Settings size={18} /> <span>Settings</span>
          </Link>

          {user.role === "admin" && (
            <Link
              href="/admin/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-slate-700 transition hover:bg-gray-100 hover:text-slate-900"
            >
              <User size={18} /> <span>Admin Dashboard</span>
            </Link>
          )}

          {user.role === "instructor" && (
            <Link
              href="/instructor/courses"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-slate-700 transition hover:bg-gray-100 hover:text-slate-900"
            >
              <User size={18} /> <span>Instructor Dashboard</span>
            </Link>
          )}

          <button
            onClick={logout}
            className="flex w-full items-center gap-3 px-4 py-3 text-red-500 transition hover:bg-red-50"
          >
            <LogOut size={18} /> <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}
