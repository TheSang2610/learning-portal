"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronRight } from "lucide-react";

const banners = [
  {
    id: 1,
    title: "Save 40% on skills that make you shine",
    description: "Give yourself that new-career glow with unlimited access to top programs from Google, Meta, and more.",
    buttonText: "Save on Coursera Plus",
    bgClass: "bg-gradient-to-r from-[#0056d2] to-[#00419e] text-white",
    hasDiscountBadge: true,
  },
  {
    id: 2,
    title: "Become an AI power user",
    description: "Integrate AI into your work style with advanced prompting, workflows, and automation concepts",
    buttonText: "Start learning skills",
    bgClass: "bg-gradient-to-r from-[#f0f4f9] via-[#e5ecf6] to-[#f3f7fa] text-gray-900",
    hasAiGraphic: true,
  },
  {
    id: 3,
    title: "Start or advance your career",
    description: "Grow your skills with flexible courses from world-class universities and companies.",
    buttonText: "Explore programs",
    bgClass: "bg-gradient-to-r from-[#fff9f0] to-[#fff3e0] text-gray-900",
    hasDiscountBadge: false,
  },
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Xử lý chuyển đổi indicator chấm tròn dưới banner
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

  return (
    <section className="bg-[#f5f7fa]">
      <div className="max-w-7xl mx-auto px-6 py-6 relative group">
        
        {/* CAROUSEL WRAPPER */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none]"
        >
          <style jsx global>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {banners.map((banner) => (
            <div
              key={banner.id}
              className={`min-w-full md:min-w-[calc(50%-8px)] lg:min-w-[calc(50%-8px)] h-[240px] md:h-[260px] rounded-3xl p-6 md:p-8 flex justify-between items-center relative overflow-hidden shadow-sm select-none border border-transparent ${banner.bgClass}`}
            >
              {/* CONTENT LEFT */}
              <div className="max-w-[60%] flex flex-col justify-between h-full z-10">
                <div>
                  {banner.id === 1 && (
                    <div className="flex items-center gap-1 mb-2">
                      <span className="font-bold text-base tracking-tight">coursera</span>
                      <span className="bg-[#002452] text-[10px] text-blue-400 font-bold px-1 py-0.5 rounded-sm uppercase tracking-wider scale-90">plus</span>
                    </div>
                  )}
                  <h2 className="text-xl md:text-2xl font-bold leading-tight tracking-tight">
                    {banner.title}
                  </h2>
                  <p className="text-xs md:text-sm mt-2 opacity-90 line-clamp-2 md:line-clamp-3 leading-relaxed">
                    {banner.description}
                  </p>
                </div>

                {/* ACTION BUTTON */}
                <button className={`mt-4 w-fit px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-1.5 transition ${
                  banner.id === 1 
                    ? "bg-white text-[#0056d2] hover:bg-gray-50" 
                    : "bg-[#0056d2] text-white hover:bg-blue-700"
                }`}>
                  {banner.buttonText}
                  <ChevronRight size={14} className="mt-0.5" />
                </button>
              </div>

              {/* GRAPHIC RIGHT */}
              <div className="w-[35%] h-full flex items-center justify-center relative select-none pointer-events-none">
                {banner.hasDiscountBadge && (
                  <div className="text-right flex flex-col items-end justify-center h-full">
                    <span className="text-7xl md:text-8xl font-extrabold tracking-tighter text-white opacity-95 leading-none block">40%</span>
                    <span className="text-4xl font-black tracking-tight text-white opacity-95 leading-none mr-2">off</span>
                    <div className="flex gap-1 mt-3 bg-white/10 px-2 py-1 rounded-md scale-90">
                      <span className="text-[10px] font-bold text-white/80">G M IBM </span>
                    </div>
                  </div>
                )}

                {banner.hasAiGraphic && (
                  <div className="absolute right-0 bottom-0 top-0 w-full flex items-center">
                    <div className="relative w-full h-[85%] rounded-2xl overflow-hidden bg-gray-200 border-2 border-white shadow-md">
                      <img
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2"
                        alt="AI User"
                        className="w-full h-full object-cover grayscale-[20%]"
                      />
                      {/* Sparkle Icon Overlay */}
                      <div className="absolute left-2 bottom-2 bg-white rounded-full p-2 shadow-md">
                        <span className="text-blue-600 text-lg font-bold">✦</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CAROUSEL CONTROLS (NEXT BUTTON ON HOVER LIKE COURSERA) */}
        <button
          onClick={() => scrollToSlide(currentSlide === banners.length - 2 ? 0 : currentSlide + 1)}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-white border shadow-lg rounded-full w-9 h-9 flex items-center justify-center transition opacity-0 group-hover:opacity-100 hover:bg-gray-50"
        >
          <ChevronRight size={18} className="text-gray-700" />
        </button>

        {/* INDICATORS (Dấu chấm điều hướng phía dưới bên trái) */}
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

      </div>
    </section>
  );
}