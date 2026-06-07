"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { bannerService, BannerData } from "@/src/services/banner";
import Link from "next/link";

function HeroSkeleton() {
  return (
    <section className="bg-[#f5f7fa] animate-pulse">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-4 overflow-hidden">
          {[1, 2].map((i) => (
            <div
              key={i}
              className={`min-w-full ${
                i === 2 ? "hidden md:flex" : "flex"
              } md:min-w-[calc(50%-8px)] h-[240px] md:h-[260px] rounded-3xl p-6 md:p-8 bg-white border border-slate-200/60 justify-between items-center shadow-sm`}
            >
              {/* Bên trái: Text content */}
              <div className="max-w-[60%] flex flex-col justify-between h-full w-full">
                <div className="space-y-3 w-full">
                  {/* Badge nhỏ hoặc Subtitle giả lập */}
                  <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                  {/* Tiêu đề chính giả lập (2 dòng) */}
                  <div className="space-y-2">
                    <div className="h-6 bg-slate-200 rounded w-5/6"></div>
                    <div className="h-6 bg-slate-200 rounded w-2/3"></div>
                  </div>
                  {/* Mô tả ngắn giả lập */}
                  <div className="h-3 bg-slate-200 rounded w-full mt-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-4/5"></div>
                </div>
                {/* Button hành động giả lập */}
                <div className="w-28 h-10 bg-slate-200 rounded-lg mt-4"></div>
              </div>

              {/* Bên phải: Khối graphic/image giả lập */}
              <div className="w-[32%] h-[85%] bg-slate-100 rounded-2xl border border-slate-200 shadow-inner flex items-center justify-center">
                <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Giả lập các chấm chuyển slide (Indicators) */}
        <div className="flex gap-1.5 mt-4 ml-2">
          <div className="h-2 w-6 bg-slate-300 rounded-full"></div>
          <div className="h-2 w-2 bg-slate-200 rounded-full"></div>
        </div>
      </div>
    </section>
  );
}

export default function HeroSection() {
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchActiveHomeBanners();
  }, []);

  const fetchActiveHomeBanners = async () => {
    try {
      setLoading(true);
      const data = await bannerService.getBannersByPage("HOME");
      const activeBanners = data.filter((b) => b.isActive === true);
      setBanners(activeBanners);
    } catch (error) {
      console.error("Lỗi đồng bộ dữ liệu banner trang chủ:", error);
    } finally {
      setLoading(false);
    }
  };

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
      <div className="max-w-7xl mx-auto px-6 py-6 relative group">
        
        {/* CAROUSEL WRAPPER */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none]"
        >
          {banners.map((banner) => {
            const dynamicBg = banner.backgroundColor || "#0056d2";
            const dynamicTextColor = banner.textColor || "#ffffff";

            return (
              <div
                key={banner._id}
                style={{ backgroundColor: dynamicBg }}
                className="min-w-full md:min-w-[calc(50%-8px)] lg:min-w-[calc(50%-8px)] h-[240px] md:h-[260px] rounded-3xl p-6 md:p-8 flex justify-between items-center relative overflow-hidden shadow-sm select-none border border-transparent"
              >
                {/* CONTENT LEFT */}
                <div className="max-w-[60%] flex flex-col justify-between h-full z-10">
                  <div>
                    {banner.title.toLowerCase().includes("coursera") && (
                      <div className="flex items-center gap-1 mb-2" style={{ color: dynamicTextColor }}>
                        <span className="font-bold text-base tracking-tight">coursera</span>
                        <span className="bg-[#002452] text-[10px] text-blue-400 font-bold px-1 py-0.5 rounded-sm uppercase tracking-wider scale-90">plus</span>
                      </div>
                    )}
                    <h2 style={{ color: dynamicTextColor }} className="text-xl md:text-2xl font-bold leading-tight tracking-tight line-clamp-2">
                      {banner.title}
                    </h2>
                    <p style={{ color: dynamicTextColor }} className="text-xs md:text-sm mt-2 opacity-90 line-clamp-2 md:line-clamp-3 leading-relaxed">
                      {banner.description}
                    </p>
                  </div>

                  {/* ACTION BUTTON */}
                  <Link
                    href={(banner as any).linkUrl || "#"} 
                    target={(banner as any).linkUrl?.startsWith("http") ? "_blank" : "_self"}
                    style={{
                      backgroundColor: dynamicTextColor,
                      color: dynamicBg
                    }}
                    className="mt-4 w-fit px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-1.5 transition hover:opacity-90 shadow-sm"
                  >
                    {banner.buttonText || "Explore"}
                    <ChevronRight size={14} className="mt-0.5" />
                  </Link>
                </div>

                {/* GRAPHIC RIGHT */}
                <div className="w-[35%] h-full flex items-center justify-center relative select-none pointer-events-none">
                  {banner.displayType === "DISCOUNT" && (
                    <div className="text-right flex flex-col items-end justify-center h-full" style={{ color: dynamicTextColor }}>
                      <span className="text-6xl md:text-7xl font-extrabold tracking-tighter opacity-95 leading-none block">
                        {banner.discountText || "40%"}
                      </span>
                      <span className="text-3xl font-black tracking-tight opacity-95 leading-none mr-2 uppercase">
                        {banner.discountSubtext || "off"}
                      </span>
                    </div>
                  )}

                  {banner.displayType === "IMAGE" && banner.imageUrl && (
                    <div className="absolute right-0 bottom-0 top-0 w-full flex items-center">
                      <div className="relative w-full h-[85%] rounded-2xl overflow-hidden bg-slate-100 border-2 border-white shadow-md">
                        <img
                          src={banner.imageUrl}
                          alt={banner.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute left-2 bottom-2 bg-white rounded-full p-1.5 shadow-md">
                          <span className="text-blue-600 text-sm font-bold block leading-none">✦</span>
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
            onClick={() => scrollToSlide(currentSlide >= banners.length - 1 ? 0 : currentSlide + 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-white border shadow-lg rounded-full w-9 h-9 flex items-center justify-center transition opacity-0 group-hover:opacity-100 hover:bg-gray-50"
          >
            <ChevronRight size={18} className="text-gray-700" />
          </button>
        )}

        {/* INDICATORS */}
        {banners.length > 1 && (
          <div className="flex gap-1.5 mt-4 ml-2">
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