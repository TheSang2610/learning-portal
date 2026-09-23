"use client";

import { Quote } from "lucide-react";
import SafeImage from "@/src/components/ui/SafeImage";
import TieuDeMuc from "./SectionHeading";

import styles from "./TestimonialsSection.module.scss";
const testimonials = [
  {
    name: "Jessica Wong",
    role: "Học viên Phân tích Dữ liệu Google",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    review:
      "Learning Portal đã giúp tôi có được những kỹ năng thực tế và tìm được một công việc mới trong lĩnh vực công nghệ. Sự linh hoạt của chương trình giúp việc học trở nên dễ dàng hơn, song song với công việc.",
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
    <section className={styles.section}>
      <div className={styles.container}>
        <TieuDeMuc
          tieuDe="Học viên nói gì"
          moTa="Bốn người đã học xong và đi làm, kể lại thứ họ mang theo được sau khoá học."
        />

        {/* Hai cot chu khong phai bon.
            Ban cu xep bon the ngang mot hang: moi the con khoang 290px, doan
            trich phai xuong bay dong voi co chu 13px - dai va kho doc. Hai cot
            cho moi the gap doi be ngang, doan trich ve ba dong o co chu 16px. */}
        <div className={styles.grid}>
          {testimonials.map((item, index) => (
            <figure key={index} className={styles.card}>
              {/* Dau nhay la trang tri -> aria-hidden de trinh doc man hinh
                  khong doc no thanh mot tu vo nghia truoc moi doan trich. */}
              <Quote
                size={64}
                aria-hidden="true"
                className={styles.floating}
                strokeWidth={1.5}
              />

              <blockquote className={styles.box}>{item.review}</blockquote>

              <figcaption className={styles.row}>
                <span className={styles.label}>
                  <SafeImage
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="44px"
                    className={styles.box2}
                  />
                </span>
                <span className={styles.label2}>
                  <span className={styles.label3}>{item.name}</span>
                  <span className={styles.label4}>{item.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
