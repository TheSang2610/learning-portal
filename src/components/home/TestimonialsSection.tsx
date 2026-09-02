"use client";

import { useState } from "react";
import SafeImage from "@/src/components/ui/SafeImage";
const testimonials = [
  {
    name: "Jessica Wong",
    role: "Học viên Phân tích Dữ liệu Google",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    review:
      "Coursera đã giúp tôi có được những kỹ năng thực tế và tìm được một công việc mới trong lĩnh vực công nghệ. Sự linh hoạt của chương trình giúp việc học trở nên dễ dàng hơn, song song với công việc.",
  },
  {
    name: "Michael Johnson",
    role: "Sinh viên Phát triển Full Stack IBM",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    review:
      "Các khóa học được cấu trúc cực kỳ tốt và được giảng dạy bởi các chuyên gia trong ngành. Tôi cảm thấy tự tin khi xây dựng các dự án thực tế.",
  },
  {
    name: "Sophia Martinez",
    role: "Học viên Phát triển Front-End Meta",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    review:
      "Tôi rất thích trải nghiệm học tập thực hành và các chứng chỉ chuyên môn. Điều đó đã giúp tôi tự tin hơn để chuyển đổi nghề nghiệp.",
  },
  {
    name: "David Kim",
    role: "Cựu học viên Kiến trúc Điện toán Đám mây",
    image: "https://randomuser.me/api/portraits/men/46.jpg",
    review:
      "Những chứng chỉ và kinh nghiệm trong CV của tôi thực sự nổi bật trong các buổi phỏng vấn. Việc học thêm kỹ năng ở đây đã thay đổi toàn bộ con đường sự nghiệp của tôi.",
  },
];

// ==========================================
// SKELETON LOADING COMPONENT
// ==========================================
function TestimonialsSkeleton() {
  return (
    <section className="animate-pulse bg-[#f5f7fa] py-10">
      <div className="mx-auto max-w-7xl px-6">
        {/* Tiêu đề giả lập */}
        <div className="h-6 w-64 rounded bg-slate-200 md:w-80"></div>

        {/* Khung lưới 4 card giả lập */}
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className="flex h-[200px] flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
            >
              {/* Top: Avatar + Tên giả lập */}
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 flex-shrink-0 rounded-full bg-slate-200"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 rounded bg-slate-200"></div>
                  <div className="h-3 w-1/2 rounded bg-slate-200"></div>
                </div>
              </div>

              {/* Bottom: Đoạn văn đánh giá giả lập */}
              <div className="mt-5 flex-grow space-y-2">
                <div className="h-3 w-full rounded bg-slate-200"></div>
                <div className="h-3 w-11/12 rounded bg-slate-200"></div>
                <div className="h-3 w-4/5 rounded bg-slate-200"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function TestimonialsSection() {
  // Nếu sau này bạn chuyển sang fetch API từ DB, hãy đổi giá trị khởi tạo thành true
  const [loading] = useState<boolean>(false);

  if (loading) {
    return <TestimonialsSkeleton />;
  }

  return (
    <section className="bg-[#f5f7fa]">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* HEADER */}
        <div>
          <h2 className="text-xl font-bold text-[#1f1f1f] md:text-2xl">
            Tại sao mọi người chọn Coursera
          </h2>
        </div>

        {/* CARDS GRID */}
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((item, index) => (
            <div
              key={`${item.name}-${index}`}
              className="flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition duration-200 hover:shadow-md"
            >
              {/* TOP: AVATAR + INFO */}
              <div className="flex items-center gap-4">
                <SafeImage
                  src={item.image}
                  alt={item.name}
                  width={48}
                  height={48}
                  className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <h3 className="truncate text-base font-bold text-[#1f1f1f]">
                    {item.name}
                  </h3>
                  {/* <p className="text-xs text-gray-500 truncate mt-0.5">
                    {item.role}
                  </p> */}
                </div>
              </div>

              {/* BOTTOM: REVIEW TEXT */}
              <p className="mt-4 flex-grow text-sm leading-relaxed text-[#5b6780] italic md:text-base">
                &quot;{item.review}&quot;
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
