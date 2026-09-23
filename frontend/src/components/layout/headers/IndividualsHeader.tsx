"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Search, BookOpen } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getCourses, Course } from "@/src/services/course";
import { getCategories, Category } from "@/src/services/categoryService";
import HeaderUserMenu from "./HeaderUserMenu";

import styles from "./IndividualsHeader.module.scss";
export default function IndividualsHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("search") ?? "");

  // 🌟 States quản lý Menu Explore
  const [categories, setCategories] = useState<Category[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [openExplore, setOpenExplore] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const exploreRef = useRef<HTMLDivElement>(null);

  const normalizeCategoryId = (
    value: string | { _id?: string; $oid?: string } | null | undefined,
  ): string | null => {
    if (!value) return null;
    if (typeof value === "string") return value;

    if (typeof value._id === "string") return value._id;
    if (typeof value.$oid === "string") return value.$oid;
    return null;
  };

  // LOAD CATEGORIES & COURSES CHO EXPLORE MENU
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const [catsData, coursesData] = await Promise.all([
          getCategories(),
          getCourses(),
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

  // CLICK OUTSIDE DROPDOWNS (Xử lý đóng cả menu avatar lẫn menu explore)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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

  // 🌟 HÀM XỬ LÝ LỌC KHÓA HỌC THEO DANH MỤC (ĐÃ SỬA LỖI MẢNG MONGOOSE)
  const filteredCourses = allCourses.filter((course) => {
    if (!course.category || !activeCategory) return false;

    if (Array.isArray(course.category)) {
      return course.category.some((cat) => normalizeCategoryId(cat) === activeCategory);
    }

    return normalizeCategoryId(course.category) === activeCategory;
  });

  return (
    <div className={styles.sticky}>
      <div className={styles.container}>
        {/* LEFT */}
        <div className={styles.row}>
          {/* Co chu nho lai tren dien thoai. O 26px logo chiem 190px trong
              tong 390px cua iPhone 12 Pro, khong con cho cho hai nut dang
              nhap - do chinh la canh logo de len chu "Dang nhap". */}
          <Link href="/" className={styles.box}>
            Learning Portal
          </Link>

          {/* 🌟 EXPLORE DROPDOWN MENU */}
          <div className={styles.box2} ref={exploreRef}>
            <button
              onClick={() => setOpenExplore(!openExplore)}
              className={`${styles.button7} ${
                openExplore ? styles.button : styles.button2
              }`}
            >
              Khám phá{" "}
              <ChevronDown
                size={16}
                className={`${styles.box13} ${openExplore ? styles.box3 : ""}`}
              />
            </button>

            {/* MEGA MENU CONTAINER */}
            {openExplore && categories.length > 0 && (
              <div className={`${styles.hienTruotXuong} ${styles.floating}`}>
                {/* CỘT TRÁI: DANH MỤC (CATEGORIES) */}
                <div className={styles.box4}>
                  <div className={styles.box5}>Danh mục ngành học</div>
                  <div className={styles.scroller}>
                    {categories.map((cat) => (
                      <button
                        key={cat._id}
                        onMouseEnter={() => setActiveCategory(cat._id)} // Rê chuột qua đâu đổi nội dung bên phải qua đó
                        onClick={() => {
                          router.push(`/courses?category=${cat.slug}`);
                          setOpenExplore(false);
                        }}
                        className={`${styles.button8} ${
                          activeCategory === cat._id ? styles.button3 : styles.button4
                        }`}
                      >
                        <span className={styles.label}>{cat.name}</span>
                        <span className={styles.label2}>→</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* CỘT PHẢI: KHÓA HỌC TƯƠNG ỨNG (COURSES) */}
                <div className={styles.col}>
                  <div>
                    <div className={styles.box6}>Khóa học phổ biến</div>
                    <div className={styles.scroller2}>
                      {filteredCourses.length > 0 ? (
                        filteredCourses.map((course) => (
                          <Link
                            key={course._id}
                            href={`/course?slug=${course.slug}`}
                            onClick={() => setOpenExplore(false)}
                            className={`group ${styles.row2}`}
                          >
                            <BookOpen size={16} className={styles.box7} />
                            <div className={styles.box8}>
                              <p className={styles.text}>{course.title}</p>
                              <p className={styles.text2}>
                                Trình độ: {course.level || "Tất cả"}
                              </p>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <div className={styles.box9}>
                          Chưa có khóa học nào thuộc nhóm này.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* NÚT XEM TẤT CẢ PHÍA DƯỚI */}
                  {activeCategory && (
                    <div className={styles.box10}>
                      <button
                        onClick={() => {
                          const activeCatSlug = categories.find(
                            (c) => c._id === activeCategory,
                          )?.slug;
                          router.push(`/courses?category=${activeCatSlug}`);
                          setOpenExplore(false);
                        }}
                        className={styles.button5}
                      >
                        Xem tất cả khóa học của nhóm này
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* <Link href="/degrees" className={styles.box11}>
            Degrees
          </Link> */}
        </div>

        {/* SEARCH BAR */}
        <div className={styles.box12}>
          <form onSubmit={handleSearchSubmit} className={styles.form}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Bạn muốn học gì?"
              className={styles.input}
            />
            <button type="submit" className={styles.button6}>
              <Search size={20} />
            </button>
          </form>
        </div>

        {/* RIGHT */}
        <div className={styles.row3}>
          <HeaderUserMenu />
        </div>
      </div>
    </div>
  );
}
