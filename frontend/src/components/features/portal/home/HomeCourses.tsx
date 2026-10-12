"use client";

import { useEffect, useMemo, useState } from "react";
import { Filter, RotateCcw } from "lucide-react";
import { getCourses, getCategoryId, type Course } from "@/src/services/course";
import { getCategories, Category } from "@/src/services/categoryService";
import { filterPublished } from "@/src/lib/filter-courses";
import SectionTitle from "@/src/components/common/SectionHeading";
import CourseCard from "@/src/components/common/CourseCard";
import type { HomeCoursesData } from "@/src/types/home";

import styles from "./HomeCourses.module.scss";
function CourseGridSkeleton() {
  return (
    <div className={styles.grid}>
      {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
        <div key={index} className={styles.card}>
          {/* Trên: Khung ảnh Thumbnail giả lập tỷ lệ aspect-video */}
          <div className={styles.box}></div>

          {/* Dưới: Khung nội dung chi tiết */}
          <div className={styles.col}>
            <div className={styles.stack}>
              {/* Hàng Instructor và Provider giả lập */}
              <div className={styles.row}>
                <div className={styles.box2}></div>
                <span className={styles.label}>|</span>
                <div className={styles.box3}></div>
              </div>

              {/* Tiêu đề khóa học giả lập (2 dòng lệch size) */}
              <div className={styles.stack2}>
                <div className={styles.box4}></div>
                <div className={styles.box5}></div>
              </div>
            </div>

            {/* Bottom bar giả lập: Level, Số bài, Giá tiền */}
            <div className={styles.row2}>
              <div className={styles.row}>
                <div className={styles.box6}></div>
                <div className={styles.box7}></div>
              </div>
              <div className={styles.box8}></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface Props extends HomeCoursesData {
  /**
   * Du lieu lay san tu may chu (xem app/(portal)/page.tsx).
   *
   * Co san thi KHONG goi API luc mount nua: noi dung nam thang trong HTML,
   * nguoi dung khong phai nhin khung xam, va may tim kiem doc duoc.
   * Bo trong thi component tu goi nhu cu - de con dung lai duoc o cho khac.
   */
  initialCourses?: Course[] | null;
  initialCategories?: Category[] | null;
}

export default function HomeCourses({
  initialCourses,
  initialCategories,
  heading,
  description,
  filterLabel,
  allCategories,
  levels,
  prices,
  countSuffix,
  resetFilters,
  empty,
  cardSizes,
}: Props) {
  const [courses, setCourses] = useState<Course[]>(initialCourses ?? []);
  const [categories, setCategories] = useState<Category[]>(initialCategories ?? []);
  const [loading, setLoading] = useState(!initialCourses);

  // States quản lý bộ lọc
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedPrice, setSelectedPrice] = useState<string>("all");

  useEffect(() => {
    if (initialCourses) return;

    Promise.all([getCourses(), getCategories()])
      .then(([coursesRes, categoriesRes]) => {
        // filteredCourses tu suy ra tu courses qua useMemo ben duoi,
        // khong can set rieng nua.
        setCourses(filterPublished(coursesRes));
        if (Array.isArray(categoriesRes)) setCategories(categoriesRes);
      })
      .catch((error) => console.error("Lỗi khi tải dữ liệu:", error))
      .finally(() => setLoading(false));
  }, [initialCourses]);

  const filteredCourses = useMemo(() => {
    let result = [...courses];

    // Lọc theo Category
    if (selectedCategory !== "all") {
      // getCategoryId xu ly ca ba hinh dang cua course.category (mang id, mang doi
      // tuong da populate, dang { $oid }) - xem ghi chu tai dinh nghia Course.
      result = result.filter((course) =>
        getCategoryId(course.category).includes(selectedCategory),
      );
    }

    // Lọc theo Trình độ (Level)
    if (selectedLevel !== "all") {
      result = result.filter(
        (course) => course.level?.toLowerCase() === selectedLevel.toLowerCase(),
      );
    }

    // Lọc theo Giá cả (Price)
    if (selectedPrice !== "all") {
      if (selectedPrice === "free") {
        result = result.filter((course) => course.price === 0);
      } else if (selectedPrice === "paid") {
        result = result.filter((course) => course.price > 0);
      }
    }

    return result;
  }, [selectedCategory, selectedLevel, selectedPrice, courses]);

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSelectedLevel("all");
    setSelectedPrice("all");
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <SectionTitle tieuDe={heading} moTa={description} />

        {/* THANH BỘ LỌC (Giữ nguyên cấu trúc để UI không bị trống trải khi đang tải) */}
        <div className={styles.card2}>
          <div className={styles.row3}>
            <div className={styles.row4}>
              <Filter size={16} className={styles.box9} />
              <span>{filterLabel}</span>
            </div>

            {/* Chọn Danh mục */}
            <div className={styles.col2}>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={styles.select}
              >
                <option value="all">{allCategories}</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Chọn Cấp độ */}
            <div className={styles.col3}>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className={styles.select}
              >
                {levels.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Chọn Học phí */}
            <div className={styles.col3}>
              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className={styles.select}
              >
                {prices.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Ket qua + xoa loc.
              So khoa hoc luon hien chu khong chi hien khi dang loc: doi bo loc
              ma con so khong nhuc nhich la dau hieu duy nhat cho biet lua chon
              vua roi khong thu hep them duoc gi. */}
          <div className={styles.row5}>
            <span className={styles.label2}>
              <b className={styles.box10}>{filteredCourses.length}</b>
              {countSuffix}
            </span>

            {(selectedCategory !== "all" ||
              selectedLevel !== "all" ||
              selectedPrice !== "all") && (
              <button onClick={handleResetFilters} className={styles.button}>
                <RotateCcw size={14} />
                {resetFilters}
              </button>
            )}
          </div>
        </div>

        {/* LISTING GRID HOẶC SKELETON */}
        {loading ? (
          <CourseGridSkeleton />
        ) : filteredCourses.length === 0 ? (
          <div className={styles.card3}>{empty}</div>
        ) : (
          <div className={styles.grid2}>
            {filteredCourses.map((course) => (
              <CourseCard key={course._id} khoa={course} sizes={cardSizes} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
