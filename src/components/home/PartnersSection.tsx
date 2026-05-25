"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { getProviders, ProviderData } from "@/src/services/provider"; // Import service mới

export default function PartnersSection() {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);
  const [companies, setCompanies] = useState<ProviderData[]>([]); // Đổi thành state động

  // Lấy dữ liệu thực tế từ Database
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const data = await getProviders();
        if (Array.isArray(data)) {
          setCompanies(data);
        }
      } catch (err) {
        console.error("Lỗi lấy danh sách đối tác:", err);
      }
    };
    fetchPartners();
  }, []);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 10);
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (el) {
        el.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      }
    };
  }, [companies]); // Kích hoạt lại khi có dữ liệu danh sách trả về

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction === "left" ? -250 : 250,
      behavior: "smooth",
    });
  };

  // Nếu chưa load xong dữ liệu, render trước một khung trống có chiều cao cố định để chống giật trang (CLS = 0)
  if (companies.length === 0) {
    return <div className="bg-[#f5f7fa] h-[120px] w-full animate-pulse" />;
  }

  return (
    <section className="bg-[#f5f7fa]">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div>
          <h3 className="text-sm md:text-base font-semibold text-[#1f1f1f]">
            Learn from <span>350+ leading universities and companies</span>
          </h3>
        </div>

        <div className="relative mt-6">
          {showLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border shadow-md rounded-full w-8 h-8 flex items-center justify-center transition hover:bg-gray-50"
            >
              <ChevronLeft size={16} />
            </button>
          )}

          {showRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border shadow-md rounded-full w-8 h-8 flex items-center justify-center transition hover:bg-gray-50"
            >
              <ChevronRight size={16} />
            </button>
          )}

          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto scroll-smooth px-2 min-h-[50px] [scrollbar-width:none] [-ms-overflow-style:none]"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <style jsx global>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            {companies.map((company) => (
              <div
                key={company._id}
                className="min-w-fit bg-white rounded-full border px-4 py-2 flex items-center justify-center shadow-sm grayscale hover:grayscale-0 hover:shadow-md transition duration-200 select-none"
              >
                <img
                  src={company.logo || "https://res.cloudinary.com/demo/image/upload/sample.jpg"}
                  alt={company.name}
                  className="h-4 w-auto object-contain"
                  width={40}
                  height={16}
                  loading="lazy"
                />
                <span className="px-2 text-sm text-gray-700 font-medium">
                  {company.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}