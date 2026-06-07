"use client";

import { useState } from "react";

const testimonials = [
  {
    name: "Jessica Wong",
    role: "Học viên Phân tích Dữ liệu Google",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    review: "Coursera đã giúp tôi có được những kỹ năng thực tế và tìm được một công việc mới trong lĩnh vực công nghệ. Sự linh hoạt của chương trình giúp việc học trở nên dễ dàng hơn, song song với công việc.",
  },
  {
    name: "Michael Johnson",
    role: "Sinh viên Phát triển Full Stack IBM",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    review: "Các khóa học được cấu trúc cực kỳ tốt và được giảng dạy bởi các chuyên gia trong ngành. Tôi cảm thấy tự tin khi xây dựng các dự án thực tế.",
  },
  {
    name: "Sophia Martinez",
    role: "Học viên Phát triển Front-End Meta",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    review: "Tôi rất thích trải nghiệm học tập thực hành và các chứng chỉ chuyên môn. Điều đó đã giúp tôi tự tin hơn để chuyển đổi nghề nghiệp.",
  },
  {
    name: "David Kim",
    role: "Cựu học viên Kiến trúc Điện toán Đám mây",
    image: "https://randomuser.me/api/portraits/men/46.jpg",
    review: "Những chứng chỉ và kinh nghiệm trong CV của tôi thực sự nổi bật trong các buổi phỏng vấn. Việc học thêm kỹ năng ở đây đã thay đổi toàn bộ con đường sự nghiệp của tôi.",
  },
];

// ==========================================
// SKELETON LOADING COMPONENT
// ==========================================
function TestimonialsSkeleton() {
  return (
    <section className="bg-[#f5f7fa] py-10 animate-pulse">
      <div className="max-w-7xl mx-auto px-6">
        {/* Tiêu đề giả lập */}
        <div className="h-6 bg-slate-200 rounded w-64 md:w-80"></div>

        {/* Khung lưới 4 card giả lập */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          {[1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col h-[200px]"
            >
              {/* Top: Avatar + Tên giả lập */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 flex-shrink-0"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>

              {/* Bottom: Đoạn văn đánh giá giả lập */}
              <div className="space-y-2 mt-5 flex-grow">
                <div className="h-3 bg-slate-200 rounded w-full"></div>
                <div className="h-3 bg-slate-200 rounded w-11/12"></div>
                <div className="h-3 bg-slate-200 rounded w-4/5"></div>
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
      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* HEADER */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#1f1f1f]">
            Tại sao mọi người chọn Coursera
          </h2>
        </div>

        {/* CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          {testimonials.map((item, index) => (
            <div
              key={`${item.name}-${index}`}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition duration-200"
            >
              {/* TOP: AVATAR + INFO */}
              <div className="flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="font-bold text-base text-[#1f1f1f] truncate">
                    {item.name}
                  </h3>
                  {/* <p className="text-xs text-gray-500 truncate mt-0.5">
                    {item.role}
                  </p> */}
                </div>
              </div>

              {/* BOTTOM: REVIEW TEXT */}
              <p className="text-sm md:text-base text-[#5b6780] italic leading-relaxed mt-4 flex-grow">
                "{item.review}"
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}