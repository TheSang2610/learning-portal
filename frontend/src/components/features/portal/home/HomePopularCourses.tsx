"use client";

import { useEffect, useState } from "react";
import SafeImage from "@/src/components/ui/SafeImage";
import { ArrowRight, BookOpen, Building2 } from "lucide-react";
import Link from "next/link";
import { fillTemplate, formatVnd } from "@/src/lib/format";
import { getHomeSections, Course } from "@/src/services/course";
import type { HomePopularCoursesData } from "@/src/types/home";

import { providerLogo } from "./partnerLogos";
import styles from "./HomePopularCourses.module.scss";
export interface HomeSectionsState {
  mostPopular: Course[];
  trendingNow: Course[];
  newReleases: Course[];
}

// ==========================================
// SKELETON LOADING COMPONENT (LIGHT MODE)
// ==========================================
function PopularCoursesSkeleton() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* Tiêu đề & mô tả giả lập */}
        <div className={styles.stack}>
          <div className={styles.box}></div>
          <div className={styles.box2}></div>
        </div>

        {/* Khung lưới Grid 3 cột tương thích layout thực tế */}
        <div className={styles.grid}>
          {[1, 2, 3].map((colIndex) => (
            <div key={colIndex} className={styles.card}>
              {/* Header cột giả lập */}
              <div className={styles.box3}></div>

              {/* Danh sách các thẻ bài học dọc bên trong */}
              <div className={styles.col}>
                {[1, 2, 3].map((cardIndex) => (
                  <div key={cardIndex} className={styles.card2}>
                    {/* Trái: Ảnh Thumbnail giả lập */}
                    <div className={styles.box4}></div>

                    {/* Phải: Thông tin chi tiết */}
                    <div className={styles.col2}>
                      <div className={styles.stack}>
                        {/* Hàng logo đối tác / Tổ chức cấp phát */}
                        <div className={styles.row}>
                          <div className={styles.box5}></div>
                          <div className={styles.box6}></div>
                        </div>
                        {/* Tiêu đề khóa học (2 dòng giả lập lệch chiều dài) */}
                        <div className={styles.box7}></div>
                        <div className={styles.box8}></div>
                      </div>

                      {/* Hàng Badge cấp độ, số bài học và giá tiền */}
                      <div className={styles.row2}>
                        <div className={styles.box9}></div>
                        <div className={styles.box10}></div>
                        <div className={styles.box11}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==========================================
// MAIN COMPONENT: POPULAR COURSES SECTION
// ==========================================
interface Props extends HomePopularCoursesData {
  /**
   * Du lieu lay san tu may chu (xem app/(portal)/page.tsx).
   *
   * Co san thi KHONG goi API luc mount nua: noi dung nam thang trong HTML,
   * nguoi dung khong phai nhin khung xam, va may tim kiem doc duoc.
   * Bo trong thi component tu goi nhu cu - de con dung lai duoc o cho khac.
   */
  initialData?: HomeSectionsState | null;
}

export default function HomePopularCourses({
  initialData,
  heading,
  description,
  empty,
  columns,
  collectionHref,
  courseHref,
  providerFallback,
  providerTitle,
  lessons,
  free,
}: Props) {
  const [sections, setSections] = useState<HomeSectionsState>(
    initialData ?? { mostPopular: [], trendingNow: [], newReleases: [] },
  );

  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    if (initialData) return;

    getHomeSections()
      .then((response) => {
        if (response?.success && response.data) {
          setSections({
            mostPopular: response.data.mostPopular || [],
            trendingNow: response.data.trendingNow || [],
            newReleases: response.data.newReleases || [],
          });
        }
      })
      .catch((error) =>
        console.error("Lỗi khi load danh sách cấu trúc trang chủ:", error),
      )
      .finally(() => setLoading(false));
  }, [initialData]);

  // Thay thế vòng xoay Loading bằng Component Skeleton thông minh
  if (loading) {
    return <PopularCoursesSkeleton />;
  }

  const categoriesColumns = columns.map((c) => ({ ...c, data: sections[c.key] }));

  const hasData = categoriesColumns.some((col) => col.data.length > 0);

  return (
    <section className={styles.section2}>
      <div className={styles.container}>
        {/* TITLE */}
        <div>
          <h2 className={styles.heading}>{heading}</h2>
          <p className={styles.text}>{description}</p>
        </div>

        {!hasData ? (
          <div className={styles.card3}>{empty}</div>
        ) : (
          /* 3 COLUMNS GRID CONTAINER */
          <div className={styles.grid}>
            {categoriesColumns.map((column) => {
              if (column.data.length === 0) return null;

              return (
                <div key={column.id} className={styles.col3}>
                  {/* CATEGORY HEADER */}
                  <Link
                    href={fillTemplate(collectionHref, { id: column.id })}
                    className={`group/title ${styles.box12}`}
                  >
                    {column.title}
                    <ArrowRight size={16} className={styles.box13} />
                  </Link>

                  {/* COURSE LIST (VERTICAL) */}
                  <div className={styles.col}>
                    {column.data.map((course) => {
                      const rawProvider = course.provider;
                      let providerLogoSrc: string | null = null;
                      let providerLogoFallback: string | undefined;
                      let providerName = providerFallback;

                      if (rawProvider && typeof rawProvider === "object") {
                        const l = providerLogo(rawProvider);
                        providerLogoSrc = l.src || null;
                        providerLogoFallback = l.fallback;
                        providerName = rawProvider.name || providerFallback;
                      }

                      return (
                        <Link
                          href={fillTemplate(courseHref, { slug: course.slug })}
                          key={course._id}
                          className={`group ${styles.card4}`}
                        >
                          {/* LEFT: THUMBNAIL */}
                          <div className={styles.row3}>
                            {course.thumbnail ? (
                              <SafeImage
                                src={course.thumbnail}
                                alt={course.title}
                                fill
                                sizes="64px"
                                className={styles.box14}
                              />
                            ) : (
                              <BookOpen size={24} className={styles.box15} />
                            )}
                          </div>

                          {/* RIGHT: INFO */}
                          <div className={styles.col4}>
                            <div>
                              {/* PROVIDER ROW */}
                              <div className={styles.row4}>
                                <div
                                  className={styles.row5}
                                  title={fillTemplate(providerTitle, {
                                    name: providerName,
                                  })}
                                >
                                  {providerLogoSrc ? (
                                    <div className={styles.card5}>
                                      <SafeImage
                                        src={providerLogoSrc}
                                        fallbackSrc={providerLogoFallback}
                                        hideOnError
                                        alt={providerName}
                                        width={16}
                                        height={16}
                                        className={styles.box16}
                                      />
                                    </div>
                                  ) : (
                                    <Building2 size={12} className={styles.box17} />
                                  )}
                                  <p className={styles.text2}>{providerName}</p>
                                </div>
                              </div>

                              {/* COURSE TITLE */}
                              <h4 className={styles.minorHeading}>{course.title}</h4>
                            </div>

                            {/* BADGE LEVEL & LESSONS COUNT */}
                            <div className={styles.row6}>
                              <span className={styles.label}>{course.level}</span>
                              <span>•</span>
                              <span className={styles.row7}>
                                {fillTemplate(lessons, {
                                  n: course.lessons?.length || 0,
                                })}
                              </span>
                              {/* Gia tach khoi hang thong tin: "Mien phi" la nhan xanh
                                  la, gia la so dam mau chu dao day ve cuoi hang - khac
                                  ca hinh lan mau, khong de doc nham voi so bai hoc. */}
                              {course.price === 0 ? (
                                <span className={styles.freeBadge}>{free}</span>
                              ) : (
                                <span className={styles.price}>
                                  {formatVnd(course.price)}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
