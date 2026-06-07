"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Search, User, Settings, LogOut, BookOpen } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getCourses, Course } from "@/src/services/course";
import { getCategories, Category } from "@/src/services/categoryService"; 

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
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [user, setUser] = useState<UserInfo | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 🌟 States quản lý Menu Explore
  const [categories, setCategories] = useState<Category[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [openExplore, setOpenExplore] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const exploreRef = useRef<HTMLDivElement>(null);

  // LOAD CATEGORIES & COURSES CHO EXPLORE MENU
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const [catsData, coursesData] = await Promise.all([
          getCategories(),
          getCourses()
        ]);
        setCategories(catsData);
        setAllCourses(coursesData);
        if (catsData.length > 0) {
          setActiveCategory(catsData[0]._id); // Mặc định hover sẵn vào danh mục đầu tiên
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu cho menu Explore:", error);
      }
    };
    fetchMenuData();
  }, []);

  // ĐỒNG BỘ TỪ KHÓA TỪ URL
  useEffect(() => {
    const currentSearch = searchParams.get("search");
    if (currentSearch) {
      setSearchQuery(currentSearch);
    }
  }, [searchParams]);

  // LOAD USER
  useEffect(() => {
    const loadUser = () => {
      const userInfo = localStorage.getItem("userInfo");
      if (userInfo && userInfo !== "undefined") {
        try {
          setUser(JSON.parse(userInfo));
          setAvatarError(false);
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    loadUser();

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        loadUser();
      }
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

  // CLICK OUTSIDE DROPDOWNS (Xử lý đóng cả menu avatar lẫn menu explore)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(false);
      }
      if (exploreRef.current && !exploreRef.current.contains(event.target as Node)) {
        setOpenExplore(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // HÀM XỬ LÝ TÌM KIẾM TOÀN TRANG
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/courses");
    }
  };

  // LOGOUT
  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("authToken");
    setUser(null);
    window.location.href = "/";
  };

// 🌟 HÀM XỬ LÝ LỌC KHÓA HỌC THEO DANH MỤC (ĐÃ SỬA LỖI MẢNG MONGOOSE)
const filteredCourses = allCourses.filter((course) => {
  if (!course.category || !activeCategory) return false;

  // Trường hợp 1: Nếu category từ DB trả về là một Mảng (Array) nhiều danh mục giống như của bạn
  if (Array.isArray(course.category)) {
    return course.category.some((cat: any) => {
      if (!cat) return false;
      // Trích xuất ID bất kể backend trả về chuỗi, object thường hoặc object chứa $oid
      const idToCheck = typeof cat === "object" ? (cat._id || cat.$oid || cat) : cat;
      return String(idToCheck) === String(activeCategory);
    });
  }

  // Trường hợp 2: Nếu category chỉ là một chuỗi hoặc một Object đơn lẻ (Dự phòng)
  const singleCatId = typeof course.category === "object" 
    ? ((course.category as any)._id || (course.category as any).$oid || course.category) 
    : course.category;

  return String(singleCatId) === String(activeCategory);
});

  return (
    <div className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between gap-6">

        {/* LEFT */}
        <div className="flex items-center gap-6">
          <Link href="/" className="text-[38px] font-bold text-blue-600 tracking-tight">
            coursera
          </Link>
          
          {/* 🌟 EXPLORE DROPDOWN MENU */}
          <div className="relative" ref={exploreRef}>
            <button 
              onClick={() => setOpenExplore(!openExplore)}
              className={`hidden md:flex items-center gap-1 text-sm font-medium px-4 py-2.5 rounded-full transition ${
                openExplore ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600 hover:bg-blue-100"
              }`}
            >
              Khám phá <ChevronDown size={16} className={`transition-transform duration-200 ${openExplore ? "rotate-180" : ""}`} />
            </button>

            {/* MEGA MENU CONTAINER */}
            {openExplore && categories.length > 0 && (
              <div className="absolute left-0 top-12 w-[680px] bg-white border border-gray-200 rounded-2xl shadow-2xl flex overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                
                {/* CỘT TRÁI: DANH MỤC (CATEGORIES) */}
                <div className="w-2/5 bg-gray-50 border-r border-gray-100 py-3">
                  <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Danh mục ngành học
                  </div>
                  <div className="max-h-[380px] overflow-y-auto">
                    {categories.map((cat) => (
                      <button
                        key={cat._id}
                        onMouseEnter={() => setActiveCategory(cat._id)} // Rê chuột qua đâu đổi nội dung bên phải qua đó
                        onClick={() => {
                          router.push(`/courses?category=${cat.slug}`);
                          setOpenExplore(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm font-semibold transition-colors flex items-center justify-between ${
                          activeCategory === cat._id 
                            ? "bg-white text-blue-600 border-l-4 border-blue-600" 
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        <span className="text-gray-400 text-xs">→</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* CỘT PHẢI: KHÓA HỌC TƯƠNG ỨNG (COURSES) */}
                <div className="w-3/5 p-4 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                      Khóa học phổ biến
                    </div>
                    <div className="max-h-[300px] overflow-y-auto space-y-1 pr-1">
                      {filteredCourses.length > 0 ? (
                        filteredCourses.map((course) => (
                          <Link
                            key={course._id}
                            href={`/courses/${course.slug}`}
                            onClick={() => setOpenExplore(false)}
                            className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-blue-50/70 transition group text-left"
                          >
                            <BookOpen size={16} className="text-gray-400 mt-0.5 group-hover:text-blue-500 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-800 group-hover:text-blue-600 line-clamp-1">
                                {course.title}
                              </p>
                              <p className="text-xs text-gray-400 capitalize">
                                Trình độ: {course.level || "Tất cả"}
                              </p>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <div className="text-sm text-gray-400 italic py-4 text-center">
                          Chưa có khóa học nào thuộc nhóm này.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* NÚT XEM TẤT CẢ PHÍA DƯỚI */}
                  {activeCategory && (
                    <div className="pt-3 border-t border-gray-100 mt-2">
                      <button
                        onClick={() => {
                          const activeCatSlug = categories.find(c => c._id === activeCategory)?.slug;
                          router.push(`/courses?category=${activeCatSlug}`);
                          setOpenExplore(false);
                        }}
                        className="w-full text-center text-xs font-bold text-blue-600 bg-blue-50/50 hover:bg-blue-600 hover:text-white py-2.5 rounded-xl transition"
                      >
                        Xem tất cả khóa học của nhóm này
                      </button>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

          {/* <Link href="/degrees" className="hidden md:block text-sm hover:text-blue-600 transition">
            Degrees
          </Link> */}
        </div>

        {/* SEARCH BAR */}
        <div className="flex-1 hidden lg:flex">
          <form onSubmit={handleSearchSubmit} className="w-full max-w-2xl relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What do you want to learn?"
              className="w-full border border-gray-300 rounded-full py-3 pl-5 pr-14 outline-none focus:border-blue-600 text-sm"
            />
            <button 
              type="submit"
              className="absolute right-1 top-1 bg-blue-600 text-white rounded-full w-11 h-11 flex items-center justify-center hover:bg-blue-700 transition"
            >
              <Search size={20} />
            </button>
          </form>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-5">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpenDropdown(!openDropdown)}
                className="flex items-center gap-3 hover:bg-gray-100 px-3 py-2 rounded-xl transition"
              >
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

                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-semibold leading-none">{user.name}</span>
                  <span className="text-xs text-gray-500 capitalize">{user.role}</span>
                </div>
                <ChevronDown size={16} />
              </button>

              {openDropdown && (
                <div className="absolute right-0 top-14 w-64 bg-white border rounded-2xl shadow-xl py-2 overflow-hidden z-50">
                  <div className="px-4 py-4 border-b">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold uppercase">
                        {user.name.charAt(0)}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-semibold truncate">{user.name}</p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  <Link href="/user/profile" onClick={() => setOpenDropdown(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition">
                    <User size={18} /> <span>Profile</span>
                  </Link>

                  <Link href="/user/settings" onClick={() => setOpenDropdown(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition">
                    <Settings size={18} /> <span>Settings</span>
                  </Link>

                  {user.role === "admin" && (
                    <Link href="/admin/dashboard" onClick={() => setOpenDropdown(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition">
                      <User size={18} /> <span>Admin Dashboard</span>
                    </Link>
                  )}

                  {user.role === "instructor" && (
                    <Link href="/instructor/courses" onClick={() => setOpenDropdown(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition">
                      <User size={18} /> <span>Instructor Dashboard</span>
                    </Link>
                  )}

                  <button onClick={logoutHandler} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-500 transition">
                    <LogOut size={18} /> <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/?auth=login" className="text-sm text-blue-600 hover:underline">Log In</Link>
              <Link href="/?auth=register" className="border border-blue-600 text-blue-600 px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-50 transition">Join for Free</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}