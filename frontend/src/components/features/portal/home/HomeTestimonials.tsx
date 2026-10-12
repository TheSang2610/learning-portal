"use client";

import { Quote } from "lucide-react";
import SafeImage from "@/src/components/ui/SafeImage";
import SectionTitle from "@/src/components/common/SectionHeading";
import type { HomeTestimonialsData } from "@/src/types/home";

import styles from "./HomeTestimonials.module.scss";
export default function HomeTestimonials({
  heading,
  description,
  items,
}: HomeTestimonialsData) {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <SectionTitle tieuDe={heading} moTa={description} />

        {/* Hai cot chu khong phai bon.
            Ban cu xep bon the ngang mot hang: moi the con khoang 290px, doan
            trich phai xuong bay dong voi co chu 13px - dai va kho doc. Hai cot
            cho moi the gap doi be ngang, doan trich ve ba dong o co chu 16px. */}
        <div className={styles.grid}>
          {items.map((item, index) => (
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
