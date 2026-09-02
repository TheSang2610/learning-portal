"use client";

import { useEffect, useState } from "react";
import SafeImage from "@/src/components/ui/SafeImage";
import { ArrowRight, BookOpen, Building2 } from "lucide-react";
import Link from "next/link";
import { getHomeSections, Course } from "@/src/services/course";

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
    <section className="animate-pulse bg-[#f5f7fa] py-10">
      <div className="mx-auto max-w-7xl px-6">
        {/* Tiêu đề & mô tả giả lập */}
        <div className="space-y-2">
          <div className="h-6 w-64 rounded bg-slate-200 md:w-80"></div>
          <div className="h-4 w-96 max-w-full rounded bg-slate-200"></div>
        </div>

        {/* Khung lưới Grid 3 cột tương thích layout thực tế */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {[1, 2, 3].map((colIndex) => (
            <div
              key={colIndex}
              className="flex flex-col gap-4 rounded-2xl border border-blue-50/50 bg-[#ebf3ff]/60 p-4"
            >
              {/* Header cột giả lập */}
              <div className="my-1 h-5 w-36 rounded bg-slate-200"></div>

              {/* Danh sách các thẻ bài học dọc bên trong */}
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((cardIndex) => (
                  <div
                    key={cardIndex}
                    className="flex gap-4 rounded-xl border border-slate-100 bg-white p-3 shadow-sm"
                  >
                    {/* Trái: Ảnh Thumbnail giả lập */}
                    <div className="h-16 w-16 flex-shrink-0 rounded-lg bg-slate-200"></div>

                    {/* Phải: Thông tin chi tiết */}
                    <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                      <div className="space-y-2">
                        {/* Hàng logo đối tác / Tổ chức cấp phát */}
                        <div className="flex items-center gap-1.5">
                          <div className="h-3.5 w-3.5 rounded-sm bg-slate-200"></div>
                          <div className="h-3 w-20 rounded bg-slate-200"></div>
                        </div>
                        {/* Tiêu đề khóa học (2 dòng giả lập lệch chiều dài) */}
                        <div className="h-4 w-11/12 rounded bg-slate-200"></div>
                        <div className="h-4 w-3/4 rounded bg-slate-200"></div>
                      </div>

                      {/* Hàng Badge cấp độ, số bài học và giá tiền */}
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-3.5 w-12 rounded bg-slate-200"></div>
                        <div className="h-3 w-16 rounded bg-slate-200"></div>
                        <div className="ml-auto h-3 w-14 rounded bg-slate-200"></div>
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
interface Props {
  /**
   * Du lieu lay san tu may chu (xem app/(portal)/page.tsx).
   *
   * Co san thi KHONG goi API luc mount nua: noi dung nam thang trong HTML,
   * nguoi dung khong phai nhin khung xam, va may tim kiem doc duoc.
   * Bo trong thi component tu goi nhu cu - de con dung lai duoc o cho khac.
   */
  initialData?: HomeSectionsState | null;
}

export default function PopularCoursesSection({ initialData }: Props) {
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

  const categoriesColumns = [
    { id: "most-popular", title: "Phổ biến nhất", data: sections.mostPopular },
    { id: "hot-releases", title: "Mới phát hành", data: sections.newReleases },
    { id: "trending-now", title: "Đang thịnh hành", data: sections.trendingNow },
  ];

  const hasData = categoriesColumns.some((col) => col.data.length > 0);

  return (
    <section className="bg-[#f5f7fa] py-10">
      <div className="mx-auto max-w-7xl px-6">
        {/* TITLE */}
        <div>
          <h2 className="text-xl font-bold text-[#1f1f1f] md:text-2xl">
            Khoá học mới và phổ biến
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Khám phá các khóa học trực tuyến và bài học riêng lẻ mới nhất của chúng tôi.
          </p>
        </div>

        {!hasData ? (
          <div className="mt-6 rounded-2xl border border-dashed bg-white py-16 text-center text-gray-500">
            Không có khóa học nào được Admin kích hoạt hiển thị lên trang chủ vào lúc này.
          </div>
        ) : (
          /* 3 COLUMNS GRID CONTAINER */
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {categoriesColumns.map((column) => {
              if (column.data.length === 0) return null;

              return (
                <div
                  key={column.id}
                  className="flex flex-col gap-4 rounded-2xl bg-[#ebf3ff] p-4"
                >
                  {/* CATEGORY HEADER */}
                  <Link
                    href={`/collection?slug=${column.id}-courses`}
                    className="group/title inline-flex w-fit cursor-pointer items-center gap-1 text-base font-bold text-[#1f1f1f] transition hover:text-blue-600"
                  >
                    {column.title}
                    <ArrowRight
                      size={16}
                      className="mt-0.5 ml-1 text-blue-600 transition-transform group-hover/title:translate-x-1"
                    />
                  </Link>

                  {/* COURSE LIST (VERTICAL) */}
                  <div className="flex flex-col gap-3">
                    {column.data.map((course) => {
                      const rawProvider = course.provider;
                      let providerLogo: string | null = null;
                      let providerName = "Hệ thống LMS";

                      if (rawProvider && typeof rawProvider === "object") {
                        providerLogo = rawProvider.logo || null;
                        providerName = rawProvider.name || "Hệ thống LMS";
                      }

                      return (
                        <Link
                          href={`/course?slug=${course.slug}`}
                          key={course._id}
                          className="group flex cursor-pointer gap-4 rounded-xl border border-transparent bg-white p-3 shadow-sm transition duration-200 hover:border-blue-100 hover:shadow-md"
                        >
                          {/* LEFT: THUMBNAIL */}
                          <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                            {course.thumbnail ? (
                              <SafeImage
                                src={course.thumbnail}
                                alt={course.title}
                                fill
                                sizes="64px"
                                className="object-cover transition duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <BookOpen size={24} className="text-slate-500" />
                            )}
                          </div>

                          {/* RIGHT: INFO */}
                          <div className="flex min-w-0 flex-1 flex-col justify-between">
                            <div>
                              {/* PROVIDER ROW */}
                              <div className="flex min-w-0 flex-wrap items-center gap-2">
                                <div
                                  className="flex min-w-0 items-center gap-1"
                                  title={`Cấp bởi: ${providerName}`}
                                >
                                  {providerLogo ? (
                                    <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center overflow-hidden rounded border bg-gray-50">
                                      <SafeImage
                                        src={providerLogo}
                                        alt={providerName}
                                        width={16}
                                        height={16}
                                        className="h-full w-full object-contain"
                                      />
                                    </div>
                                  ) : (
                                    <Building2
                                      size={12}
                                      className="flex-shrink-0 text-violet-400"
                                    />
                                  )}
                                  <p className="max-w-[90px] truncate text-[11px] font-medium text-violet-600">
                                    {providerName}
                                  </p>
                                </div>
                              </div>

                              {/* COURSE TITLE */}
                              <h4 className="mt-1 line-clamp-2 text-sm leading-snug font-bold text-gray-900 transition group-hover:text-blue-600">
                                {course.title}
                              </h4>
                            </div>

                            {/* BADGE LEVEL & LESSONS COUNT */}
                            <div className="mt-2 flex items-center gap-2 text-[11px] font-medium text-gray-500">
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600 capitalize">
                                {course.level}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-0.5 text-blue-600">
                                {course.lessons?.length || 0} bài học
                              </span>
                              <span>•</span>
                              <span className="font-bold text-slate-800">
                                {course.price === 0
                                  ? "Miễn phí"
                                  : `${course.price.toLocaleString("vi-VN")}đ`}
                              </span>
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
