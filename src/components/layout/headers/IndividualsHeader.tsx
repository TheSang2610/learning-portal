"use client";

import Link from "next/link";

import {
  ChevronDown,
  Search,
  User,
  Settings,
  LogOut,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

interface UserInfo {
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
  picture?: string;
  googlePicture?: string;
  avatar?: string;
}

export default function IndividualsHeader() {
  const [user, setUser] =
    useState<UserInfo | null>(null);

  const [avatarError, setAvatarError] =
    useState(false);

  const [openDropdown, setOpenDropdown] =
    useState(false);

  const dropdownRef =
    useRef<HTMLDivElement>(null);

  // LOAD USER
// LOAD USER
  useEffect(() => {
    const loadUser = () => {
      const userInfo = localStorage.getItem("userInfo");
      if (userInfo) {
        setUser(JSON.parse(userInfo));
        setAvatarError(false);
      } else {
        setUser(null);
      }
    };

    loadUser();

    // Xử lý khi bấm nút Back/Forward của trình duyệt
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        loadUser(); // Ép đọc lại localStorage khi back lại trang
      }
    };

    window.addEventListener("storage", loadUser);
    window.addEventListener("userInfoChanged", loadUser); // Từ Cách 1 ở câu hỏi trước
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("storage", loadUser);
      window.removeEventListener("userInfoChanged", loadUser);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  // CLICK OUTSIDE
  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target as Node
        )
      ) {
        setOpenDropdown(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // LOGOUT
  const logoutHandler = () => {
    localStorage.removeItem("userInfo");

    setUser(null);

    window.location.href = "/";
  };

  return (
    <div className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between gap-6">

        {/* LEFT */}
        <div className="flex items-center gap-6">

          <Link
            href="/"
            className="text-[38px] font-bold text-blue-600 tracking-tight"
          >
            coursera
          </Link>

          <button className="hidden md:flex items-center gap-1 text-sm hover:text-blue-600 transition">
            Explore
            <ChevronDown size={16} />
          </button>

          <Link
            href="/degrees"
            className="hidden md:block text-sm hover:text-blue-600 transition"
          >
            Degrees
          </Link>
        </div>

        {/* SEARCH */}
        <div className="flex-1 hidden lg:flex">
          <div className="w-full max-w-2xl relative">

            <input
              type="text"
              placeholder="What do you want to learn?"
              className="w-full border border-gray-300 rounded-full py-3 pl-5 pr-14 outline-none focus:border-blue-600"
            />

            <button className="absolute right-1 top-1 bg-blue-600 text-white rounded-full w-11 h-11 flex items-center justify-center">
              <Search size={20} />
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-5">

          {user ? (
            <div
              className="relative"
              ref={dropdownRef}
            >

              {/* USER BUTTON */}
              <button
                onClick={() =>
                  setOpenDropdown(
                    !openDropdown
                  )
                }
                className="flex items-center gap-3 hover:bg-gray-100 px-3 py-2 rounded-xl transition"
              >

                {/* AVATAR */}
                {(() => {
                  const src = user.avatar || user.picture || user.googlePicture;
                  if (src && !avatarError) {
                    return (
                      <img
                        src={src}
                        alt={user.name}
                        onError={() => setAvatarError(true)}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    );
                  }

                  return (
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold uppercase shadow">
                      {user.name.charAt(0)}
                    </div>
                  );
                })()}

                {/* USER NAME */}
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-semibold leading-none">
                    {user.name}
                  </span>

                  <span className="text-xs text-gray-500">
                    {user.role}
                  </span>
                </div>

                <ChevronDown size={16} />
              </button>

              {/* DROPDOWN */}
              {openDropdown && (
                <div className="absolute right-0 top-14 w-64 bg-white border rounded-2xl shadow-xl py-2 overflow-hidden z-50">

                  {/* TOP */}
                  <div className="px-4 py-4 border-b">

                    <div className="flex items-center gap-3">

                      <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                        {user.name.charAt(0)}
                      </div>

                      <div>
                        <p className="font-semibold">
                          {user.name}
                        </p>

                        <p className="text-sm text-gray-500">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* PROFILE */}
                  <Link
                    href="/user/profile"
                    onClick={() => setOpenDropdown(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition"
                  >
                    <User size={18} />
                    <span>Profile</span>
                  </Link>

                  {/* SETTINGS */}
                  <Link
                    href="/user/settings"
                    onClick={() => setOpenDropdown(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition"
                  >
                    <Settings size={18} />
                    <span>Settings</span>
                  </Link>

                  {/* ADMIN DASHBOARD */}
                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setOpenDropdown(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition"
                    >
                      <User size={18} />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}

                  {/* INSTRUCTOR DASHBOARD */}
                  {user.role === "instructor" && (
                    <Link
                      href="/instructor"
                      onClick={() => setOpenDropdown(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition"
                    >
                      <User size={18} />
                      <span>Instructor Dashboard</span>
                    </Link>
                  )}

                  {/* LOGOUT */}
                  <button
                    onClick={logoutHandler}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-500 transition"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/?auth=login"
                className="text-sm text-blue-600 hover:underline"
              >
                Log In
              </Link>

              <Link
                href="/?auth=register"
                className="border border-blue-600 text-blue-600 px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-50 transition"
              >
                Join for Free
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}