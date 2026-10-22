"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getCategories, Category } from "@/src/services/categoryService";
import SectionTitle from "@/src/components/common/SectionHeading";
import { categoryIcon } from "@/src/lib/category-icons";
import { fillTemplate } from "@/src/lib/format";
import type { HomeCategoriesData } from "@/src/types/home";

import styles from "./HomeCategories.module.scss";
// Bieu tuong: cai admin chon trong trang Danh muc, chua chon thi doan theo
// ten - xem lib/category-icons.ts.

function CategoriesSkeleton() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.box} />
        <div className={styles.box2} />
        <div className={styles.grid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={styles.card}>
              <div className={styles.box3} />
              <div className={styles.stack}>
                <div className={styles.box4} />
                <div className={styles.box5} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

interface Props extends HomeCategoriesData {
  /**
   * Du lieu lay san tu may chu (xem app/(portal)/page.tsx).
   *
   * Co san thi KHONG goi API luc mount nua: noi dung nam thang trong HTML,
   * nguoi dung khong phai nhin khung xam, va may tim kiem doc duoc.
   * Bo trong thi component tu goi nhu cu - de con dung lai duoc o cho khac.
   */
  initialData?: Category[] | null;
  /**
   * So khoa hoc theo id danh muc, dem san o may chu.
   *
   * Khong bat buoc: thieu thi the chi hien ten danh muc. Co thi moi o tra loi
   * duoc cau hoi that su cua nguoi bam vao - "trong day co gi khong" - thay vi
   * bat ho bam vao roi moi biet muc do rong.
   */
  courseCountByCategory?: Record<string, number>;
}

export default function HomeCategories({
  initialData,
  courseCountByCategory,
  heading,
  description,
  seeAllHref,
  seeAllLabel,
  categoryHref,
  countUnknown,
  countZero,
  count,
}: Props) {
  const [categories, setCategories] = useState<Category[]>(initialData ?? []);
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    if (initialData) return;

    getCategories()
      .then(setCategories)
      .catch((error) => console.error("Failed to fetch categories:", error))
      .finally(() => setLoading(false));
  }, [initialData]);

  if (loading) return <CategoriesSkeleton />;
  if (categories.length === 0) return null;

  return (
    <section className={styles.section2}>
      <div className={styles.container}>
        <SectionTitle
          tieuDe={heading}
          moTa={description}
          viewAll={seeAllHref}
          viewAllLabel={seeAllLabel}
        />

        <div className={styles.grid}>
          {categories.map((category) => {
            const catSlug =
              category.slug || category.name.toLowerCase().replace(/ /g, "-");
            const Icon = categoryIcon(category.icon, category.name);
            const courseCount = courseCountByCategory?.[category._id];

            return (
              <Link
                href={fillTemplate(categoryHref, { slug: catSlug })}
                key={category._id}
                className={`group ${styles.card2}`}
              >
                <span className={styles.row}>
                  <Icon size={22} strokeWidth={1.75} />
                </span>

                <span className={styles.label}>
                  <span className={styles.label2}>{category.name}</span>
                  <span className={styles.label3}>
                    {courseCount === undefined
                      ? countUnknown
                      : courseCount === 0
                        ? countZero
                        : fillTemplate(count, { n: courseCount })}
                  </span>
                </span>

                <ArrowUpRight size={18} className={styles.box6} />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
