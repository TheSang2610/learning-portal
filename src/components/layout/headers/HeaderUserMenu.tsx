"use client";

import Link from "next/link";
import { ChevronDown, User, Settings, LogOut } from "lucide-react";
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
  const [avatarError, setAvatarError] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadUser = () => {
      const raw = localStorage.getItem("userInfo");
      if (raw && raw !== "undefined") {
        try {
          setUser(JSON.parse(raw));
          setAvatarError(false);
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
    localStorage.removeItem("userInfo");
    localStorage.removeItem("authToken");
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
          className="border border-blue-600 text-blue-600 px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-50 transition"
        >
          Join for Free
        </Link>
      </div>
    );
  }

  const src = user.avatar || user.picture || user.googlePicture;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 hover:bg-gray-100 px-3 py-2 rounded-xl transition"
      >
        {src && !avatarError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={user.name}
            onError={() => setAvatarError(true)}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold uppercase shadow">
            {user.name.charAt(0)}
          </div>
        )}

        <div className="hidden md:flex flex-col items-start max-w-[150px]">
          <span className="text-sm font-semibold leading-none truncate w-full text-slate-900">
            {user.name}
          </span>
          <span className="text-xs text-gray-500 capitalize mt-1">{user.role}</span>
        </div>
        <ChevronDown size={16} />
      </button>

      {open && (
        <div className="absolute right-0 top-14 w-64 bg-white border rounded-2xl shadow-xl py-2 overflow-hidden z-50">
          <div className="px-4 py-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold uppercase">
                {user.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="font-semibold truncate text-slate-900">{user.name}</p>
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>

          <Link
            href="/user/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-gray-100 hover:text-slate-900 transition"
          >
            <User size={18} /> <span>Profile</span>
          </Link>

          <Link
            href="/user/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-gray-100 hover:text-slate-900 transition"
          >
            <Settings size={18} /> <span>Settings</span>
          </Link>

          {user.role === "admin" && (
            <Link
              href="/admin/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-gray-100 hover:text-slate-900 transition"
            >
              <User size={18} /> <span>Admin Dashboard</span>
            </Link>
          )}

          {user.role === "instructor" && (
            <Link
              href="/instructor/courses"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-gray-100 hover:text-slate-900 transition"
            >
              <User size={18} /> <span>Instructor Dashboard</span>
            </Link>
          )}

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-500 transition"
          >
            <LogOut size={18} /> <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}
