"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCategories, Category } from "@/src/services/categoryService";
import { getHomeSections, Course } from "@/src/services/course";
import { getProviders, ProviderData } from "@/src/services/provider";

import styles from "./Footer.module.scss";
interface Props {
  /**
   * Du lieu lay san tu may chu (xem app/(portal)/layout.tsx).
   *
   * Footer nam duoi MOI trang portal, nen truoc day moi trang deu keo theo ba
   * luot goi API va ba khung xam o chan trang. Co san thi khong goi nua.
   * Bo trong thi tu goi nhu cu - de backend chet van con duong lui.
   */
  initialCategories?: Category[] | null;
  initialPopular?: Course[] | null;
  initialProviders?: ProviderData[] | null;
}

export default function Footer({
  initialCategories,
  initialPopular,
  initialProviders,
}: Props) {
  const [categories, setCategories] = useState<Category[]>(initialCategories ?? []);
  const [popularCourses, setPopularCourses] = useState<Course[]>(initialPopular ?? []);
  const [providers, setProviders] = useState<ProviderData[]>(initialProviders ?? []);
  const [loading, setLoading] = useState(!initialCategories);

  useEffect(() => {
    if (initialCategories) return;

    Promise.all([getCategories(), getHomeSections(), getProviders()])
      .then(([categoriesData, homeSectionsData, providersData]) => {
        setCategories(categoriesData.slice(0, 5));
        if (homeSectionsData?.success && homeSectionsData?.data?.mostPopular) {
          setPopularCourses(homeSectionsData.data.mostPopular.slice(0, 5));
        }
        setProviders(providersData.slice(0, 5));
      })
      .catch((error) => console.error("Lỗi khi tải dữ liệu hệ thống tại Footer:", error))
      .finally(() => setLoading(false));
  }, [initialCategories]);

  return (
    <footer className={styles.footer}>
      {/* Bo cot "Cac thanh vien nhom" nen luoi tu 5 xuong 4 cot. Giu nguyen
          md:grid-cols-5 thi cot cuoi bo trong va bon cot con lai bi bop hep
          lai mot cach vo co. */}
      <div className={styles.container}>
        {/* CỘT 1: THƯƠNG HIỆU PLATFORM */}
        <div className={styles.col}>
          <Link href="/" className={styles.box}>
            Learning Portal
          </Link>
          <p className={styles.text}>
            Nền tảng đào tạo trực tuyến chuẩn hóa thế hệ mới. Học tập mọi lúc, mọi nơi
            cùng các chuyên gia và tổ chức uy tín hàng đầu.
          </p>
        </div>

        {/* CỘT 2: DANH MỤC KHÓA HỌC (DỮ LIỆU THỰC) */}
        <div>
          <h3 className={styles.subheading}>Chủ đề học tập</h3>
          {loading ? (
            <div className={styles.stack}>
              <div className={styles.box2}></div>
              <div className={styles.box3}></div>
              <div className={styles.box4}></div>
            </div>
          ) : (
            <ul className={styles.list}>
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <li key={cat._id}>
                    <Link href={`/courses?category=${cat.slug}`} className={styles.box5}>
                      {cat.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li className={styles.item}>Chưa có danh mục</li>
              )}
            </ul>
          )}
        </div>

        {/* CỘT 3: KHÓA HỌC NỔI BẬT (DỮ LIỆU THỰC) */}
        <div>
          <h3 className={styles.subheading}>Khóa học phổ biến</h3>
          {loading ? (
            <div className={styles.stack}>
              <div className={styles.box4}></div>
              <div className={styles.box2}></div>
              <div className={styles.box6}></div>
            </div>
          ) : (
            <ul className={styles.list}>
              {popularCourses.length > 0 ? (
                popularCourses.map((course) => (
                  <li key={course._id}>
                    <Link
                      href={`/course?slug=${course.slug}`}
                      className={styles.box7}
                      title={course.title}
                    >
                      {course.title}
                    </Link>
                  </li>
                ))
              ) : (
                <li className={styles.item}>Chưa cập nhật khóa học</li>
              )}
            </ul>
          )}
        </div>

        {/* CỘT 4: ĐỐI TÁC ĐÀO TẠO (DỮ LIỆU THỰC) */}
        <div>
          <h3 className={styles.subheading}>Đối tác liên kết</h3>
          {loading ? (
            <div className={styles.stack}>
              <div className={styles.box3}></div>
              <div className={styles.box2}></div>
            </div>
          ) : (
            <ul className={styles.list}>
              {providers.length > 0 ? (
                providers.map((prov) => (
                  <li key={prov._id} className={styles.item2}>
                    <span className={styles.box7}>{prov.name}</span>
                  </li>
                ))
              ) : (
                <li className={styles.item}>Chưa có đối tác liên kết</li>
              )}
            </ul>
          )}
        </div>
      </div>

      {/* DÒNG BẢN QUYỀN DƯỚI CÙNG */}
      <div className={styles.box8}>
        <div className={styles.container2}>
          <div className={styles.box9}>
            © {new Date().getFullYear()}{" "}
            <span className={styles.label}>Learning Portal</span>. All rights reserved.
          </div>
          <div className={styles.row}>
            <Link href="/terms" className={styles.box10}>
              Điều khoản dịch vụ
            </Link>
            <Link href="/privacy" className={styles.box10}>
              Chính sách bảo mật
            </Link>
            <Link href="/help" className={styles.box10}>
              Trung tâm trợ giúp
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
