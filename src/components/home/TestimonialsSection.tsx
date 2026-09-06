"use client";

import { Quote } from "lucide-react";
import SafeImage from "@/src/components/ui/SafeImage";
import TieuDeMuc from "./TieuDeMuc";
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

export default function TestimonialsSection() {
  return (
    <section className="bg-[#f5f7fa]">
      <div className="mx-auto max-w-7xl px-6 py-14 md:py-16">
        <TieuDeMuc
          tieuDe="Học viên nói gì"
          moTa="Bốn người đã học xong và đi làm, kể lại thứ họ mang theo được sau khoá học."
        />

        {/* Hai cot chu khong phai bon.
            Ban cu xep bon the ngang mot hang: moi the con khoang 290px, doan
            trich phai xuong bay dong voi co chu 13px - dai va kho doc. Hai cot
            cho moi the gap doi be ngang, doan trich ve ba dong o co chu 16px. */}
        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {testimonials.map((item, index) => (
            <figure
              key={index}
              className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-6 md:p-7"
            >
              {/* Dau nhay la trang tri -> aria-hidden de trinh doc man hinh
                  khong doc no thanh mot tu vo nghia truoc moi doan trich. */}
              <Quote
                size={64}
                aria-hidden="true"
                className="pointer-events-none absolute -top-2 right-2 text-blue-50"
                strokeWidth={1.5}
              />

              <blockquote className="relative text-[16px] leading-[1.7] text-slate-700">
                {item.review}
              </blockquote>

              <figcaption className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-5">
                <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-slate-100">
                  <SafeImage
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[15px] font-semibold text-slate-900">
                    {item.name}
                  </span>
                  <span className="block truncate text-[13px] text-slate-500">
                    {item.role}
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
