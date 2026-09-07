"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SafeImage from "@/src/components/ui/SafeImage";
import { useRef, useState, useEffect } from "react";
import { getProviders, ProviderData } from "@/src/services/provider";

function PartnersSkeleton() {
  return (
    <section className="animate-pulse bg-[#f5f7fa]">
      <div className="mx-auto max-w-7xl px-6 py-6">
        {/* Tiêu đề giả lập */}
        <div className="h-5 w-72 max-w-full rounded bg-slate-200"></div>

        {/* Danh sách logo đối tác chạy ngang giả lập */}
        <div className="mt-6 flex gap-3 overflow-hidden px-2">
          {["w-28", "w-36", "w-24", "w-40", "w-32", "w-28", "w-36", "w-24"].map(
            (widthClass, index) => (
              <div
                key={index}
                className={`${widthClass} flex h-9 flex-shrink-0 items-center gap-2 rounded-full border border-slate-200/60 bg-white px-4 shadow-sm`}
              >
                {/* Giả lập hình ảnh logo tròn/vuông nhỏ phía trước */}
                <div className="h-4 w-4 flex-shrink-0 rounded-sm bg-slate-200"></div>
                {/* Giả lập chữ tên thương hiệu */}
                <div className="h-3 w-full rounded bg-slate-200"></div>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

interface Props {
  /**
   * Du lieu lay san tu may chu (xem app/(portal)/page.tsx).
   *
   * Co san thi KHONG goi API luc mount nua: noi dung nam thang trong HTML,
   * nguoi dung khong phai nhin khung xam, va may tim kiem doc duoc.
   * Bo trong thi component tu goi nhu cu - de con dung lai duoc o cho khac.
   */
  initialData?: ProviderData[] | null;
}

export default function PartnersSection({ initialData }: Props) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);
  const [companies, setCompanies] = useState<ProviderData[]>(initialData ?? []);
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    if (initialData) return;

    getProviders()
      .then((data) => {
        if (Array.isArray(data)) setCompanies(data);
      })
      .catch((err) => console.error("Lỗi lấy danh sách đối tác:", err))
      .finally(() => setLoading(false));
  }, [initialData]);

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
  }, [companies]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction === "left" ? -250 : 250,
      behavior: "smooth",
    });
  };

  if (loading) {
    return <PartnersSkeleton />;
  }

  if (companies.length === 0) return null;

  return (
    <section className="bg-[#f5f7fa]">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div>
          <h3 className="text-sm font-semibold text-[#1f1f1f] md:text-base">
            Học từ{" "}
            <span className="font-semibold">các trường đại học và công ty hàng đầu</span>
          </h3>
        </div>

        <div className="relative mt-6">
          {showLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute top-1/2 left-0 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border bg-white shadow-md transition hover:bg-gray-50"
            >
              <ChevronLeft size={16} />
            </button>
          )}

          {showRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute top-1/2 right-0 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border bg-white shadow-md transition hover:bg-gray-50"
            >
              <ChevronRight size={16} />
            </button>
          )}

          <div
            ref={scrollRef}
            className="flex min-h-[50px] gap-3 overflow-x-auto scroll-smooth px-2 [-ms-overflow-style:none] [scrollbar-width:none]"
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
                className="flex min-w-fit items-center justify-center rounded-full border bg-white px-4 py-2 shadow-sm grayscale transition duration-200 select-none hover:shadow-md hover:grayscale-0"
              >
                <SafeImage
                  src={
                    company.logo ||
                    "https://res.cloudinary.com/demo/image/upload/sample.jpg"
                  }
                  alt={company.name}
                  className="h-4 w-auto object-contain"
                  width={40}
                  height={16}
                  loading="lazy"
                />
                <span className="px-2 text-sm font-medium text-gray-700">
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
