"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";

const companies = [
  {
    name: "Google",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
  },
  {
    name: "Meta",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Meta-Logo.png",
  },
  {
    name: "IBM",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg",
  },
  {
    name: "Microsoft",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
  },
  {
    name: "Stanford",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Stanford_Cardinal_logo.svg",
  },
  {
    name: "University of Pennsylvania",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/UPenn_shield_with_banner.svg/250px-UPenn_shield_with_banner.svg.png?utm_source=vi.wikipedia.org&utm_campaign=parser&utm_content=thumbnail",
  },
  {
    name: "Harvard",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Harvard_University_shield.png/250px-Harvard_University_shield.png",
  },
 {
    name: "Posts and Telecommunications Institute of Technology (PTIT)",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Logo_PTIT_University.png/960px-Logo_PTIT_University.png",
  },
];

export default function PartnersSection() {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

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
  }, []);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;

    el.scrollBy({
      left: direction === "left" ? -250 : 250,
      behavior: "smooth",
    });
  };

  return (
    <section className="bg-[#f5f7fa]">
      <div className="max-w-7xl mx-auto px-6 py-6">
        
        {/* TITLE */}
        <div>
          <h3 className="text-sm md:text-base font-semibold text-[#1f1f1f]">
            Learn from <span>350+ leading universities and companies</span>
          </h3>
        </div>

        {/* WRAPPER */}
        <div className="relative mt-6">
          
          {/* LEFT BUTTON */}
          {showLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border shadow-md rounded-full w-8 h-8 flex items-center justify-center transition hover:bg-gray-50"
            >
              <ChevronLeft size={16} />
            </button>
          )}

          {/* RIGHT BUTTON */}
          {showRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border shadow-md rounded-full w-8 h-8 flex items-center justify-center transition hover:bg-gray-50"
            >
              <ChevronRight size={16} />
            </button>
          )}

          {/* SCROLL AREA */}
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto scroll-smooth px-2 [scrollbar-width:none] [-ms-overflow-style:none]"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {/* Thẻ style phụ trợ ẩn scrollbar hoàn toàn trên Chrome/Safari */}
            <style jsx global>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            {companies.map((company) => (
              <div
                key={company.name}
                className="min-w-fit bg-white rounded-full border px-4 py-2 flex items-center justify-center shadow-sm grayscale hover:grayscale-0 hover:shadow-md transition duration-200 select-none"
              >
                <img
                  src={company.logo}
                  alt={company.name}
                  className="h-4 object-contain"
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