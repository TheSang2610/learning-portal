"use client";

import { useState, useRef, useEffect } from "react";
import SafeImage from "@/src/components/ui/SafeImage";
import { ChevronRight } from "lucide-react";
import { bannerService, BannerData } from "@/src/services/banner";
import Link from "next/link";

function HeroSkeleton() {
  return (
    <section className="animate-pulse bg-[#f5f7fa]">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="flex gap-4 overflow-hidden">
          {[1, 2].map((i) => (
            <div
              key={i}
              className={`min-w-full ${
                i === 2 ? "hidden md:flex" : "flex"
              } h-[240px] items-center justify-between rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm md:h-[260px] md:min-w-[calc(50%-8px)] md:p-8`}
            >
              {/* Bên trái: Text content */}
              <div className="flex h-full w-full max-w-[60%] flex-col justify-between">
                <div className="w-full space-y-3">
                  {/* Badge nhỏ hoặc Subtitle giả lập */}
                  <div className="h-4 w-1/3 rounded bg-slate-200"></div>
                  {/* Tiêu đề chính giả lập (2 dòng) */}
                  <div className="space-y-2">
                    <div className="h-6 w-5/6 rounded bg-slate-200"></div>
                    <div className="h-6 w-2/3 rounded bg-slate-200"></div>
                  </div>
                  {/* Mô tả ngắn giả lập */}
                  <div className="mt-2 h-3 w-full rounded bg-slate-200"></div>
                  <div className="h-3 w-4/5 rounded bg-slate-200"></div>
                </div>
                {/* Button hành động giả lập */}
                <div className="mt-4 h-10 w-28 rounded-lg bg-slate-200"></div>
              </div>

              {/* Bên phải: Khối graphic/image giả lập */}
              <div className="flex h-[85%] w-[32%] items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 shadow-inner">
                <div className="h-8 w-8 rounded-full bg-slate-200"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Giả lập các chấm chuyển slide (Indicators) */}
        <div className="mt-4 ml-2 flex gap-1.5">
          <div className="h-2 w-6 rounded-full bg-slate-300"></div>
          <div className="h-2 w-2 rounded-full bg-slate-200"></div>
        </div>
      </div>
    </section>
  );
}

interface Props {
  /**
   * Du lieu lay san tu may chu (xem app/(portal)/page.tsx).
   *
   * Co san thi KHONG goi API luc mount nua: banner nam thang trong HTML nen
   * khong con khoang trong nhay len o dau trang. Bo trong thi component tu
   * goi nhu cu - de con dung lai duoc o cho khac.
   */
  initialData?: BannerData[] | null;
}

export default function HeroSection({ initialData }: Props) {
  const [banners, setBanners] = useState<BannerData[]>(initialData ?? []);
  const [loading, setLoading] = useState(!initialData);
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (initialData) return;

    bannerService
      .getBannersByPage("HOME")
      .then((data) => setBanners(data.filter((b) => b.isActive === true)))
      .catch((error) => console.error("Lỗi đồng bộ dữ liệu banner trang chủ:", error))
      .finally(() => setLoading(false));
  }, [initialData]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setCurrentSlide(index);
  };

  const scrollToSlide = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({
      left: index * el.clientWidth,
      behavior: "smooth",
    });
    setCurrentSlide(index);
  };

  // Thay thế chữ "Đang tải dữ liệu..." cũ bằng Skeleton Component vừa tạo
  if (loading) {
    return <HeroSkeleton />;
  }

  if (banners.length === 0) return null;

  return (
    <section className="bg-[#f5f7fa]">
      <div className="group relative mx-auto max-w-7xl px-6 py-6">
        {/* CAROUSEL WRAPPER */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="scrollbar-hide flex gap-4 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {banners.map((banner) => {
            const dynamicBg = banner.backgroundColor || "#0056d2";
            const dynamicTextColor = banner.textColor || "#ffffff";

            return (
              <div
                key={banner._id}
                style={{ backgroundColor: dynamicBg }}
                className="relative flex h-[240px] min-w-full items-center justify-between overflow-hidden rounded-3xl border border-transparent p-6 shadow-sm select-none md:h-[260px] md:min-w-[calc(50%-8px)] md:p-8 lg:min-w-[calc(50%-8px)]"
              >
                {/* CONTENT LEFT */}
                <div className="z-10 flex h-full max-w-[60%] flex-col justify-between">
                  <div>
                    {banner.title.toLowerCase().includes("coursera") && (
                      <div
                        className="mb-2 flex items-center gap-1"
                        style={{ color: dynamicTextColor }}
                      >
                        <span className="text-base font-bold tracking-tight">
                          coursera
                        </span>
                        <span className="scale-90 rounded-sm bg-[#002452] px-1 py-0.5 text-[10px] font-bold tracking-wider text-blue-400 uppercase">
                          plus
                        </span>
                      </div>
                    )}
                    <h2
                      style={{ color: dynamicTextColor }}
                      className="line-clamp-2 text-xl leading-tight font-bold tracking-tight md:text-2xl"
                    >
                      {banner.title}
                    </h2>
                    <p
                      style={{ color: dynamicTextColor }}
                      className="mt-2 line-clamp-2 text-xs leading-relaxed opacity-90 md:line-clamp-3 md:text-sm"
                    >
                      {banner.description}
                    </p>
                  </div>

                  {/* ACTION BUTTON */}
                  <Link
                    href={banner.linkUrl || "#"}
                    target={banner.linkUrl?.startsWith("http") ? "_blank" : "_self"}
                    style={{
                      backgroundColor: dynamicTextColor,
                      color: dynamicBg,
                    }}
                    className="mt-4 flex w-fit items-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-bold shadow-sm transition hover:opacity-90"
                  >
                    {banner.buttonText || "Explore"}
                    <ChevronRight size={14} className="mt-0.5" />
                  </Link>
                </div>

                {/* GRAPHIC RIGHT */}
                <div className="pointer-events-none relative flex h-full w-[35%] items-center justify-center select-none">
                  {banner.displayType === "DISCOUNT" && (
                    <div
                      className="flex h-full flex-col items-end justify-center text-right"
                      style={{ color: dynamicTextColor }}
                    >
                      <span className="block text-6xl leading-none font-extrabold tracking-tighter opacity-95 md:text-7xl">
                        {banner.discountText || "40%"}
                      </span>
                      <span className="mr-2 text-3xl leading-none font-black tracking-tight uppercase opacity-95">
                        {banner.discountSubtext || "off"}
                      </span>
                    </div>
                  )}

                  {banner.displayType === "IMAGE" && banner.imageUrl && (
                    <div className="absolute top-0 right-0 bottom-0 flex w-full items-center">
                      <div className="relative h-[85%] w-full overflow-hidden rounded-2xl border-2 border-white bg-slate-100 shadow-md">
                        <SafeImage
                          src={banner.imageUrl}
                          alt={banner.title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-cover"
                        />
                        <div className="absolute bottom-2 left-2 rounded-full bg-white p-1.5 shadow-md">
                          <span className="block text-sm leading-none font-bold text-blue-600">
                            ✦
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* CAROUSEL CONTROLS */}
        {banners.length > 1 && (
          <button
            onClick={() =>
              scrollToSlide(currentSlide >= banners.length - 1 ? 0 : currentSlide + 1)
            }
            className="absolute top-1/2 right-3 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border bg-white opacity-0 shadow-lg transition group-hover:opacity-100 hover:bg-gray-50"
          >
            <ChevronRight size={18} className="text-gray-700" />
          </button>
        )}

        {/* INDICATORS */}
        {banners.length > 1 && (
          <div className="mt-4 ml-2 flex gap-1.5">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentSlide === index ? "w-6 bg-gray-600" : "w-2 bg-gray-300"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
