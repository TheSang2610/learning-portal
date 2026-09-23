"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  Cloud,
  Code2,
  Cpu,
  LayoutGrid,
  Megaphone,
  PenTool,
  ShieldCheck,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { getCategories, Category } from "@/src/services/categoryService";
import TieuDeMuc from "./SectionHeading";

import styles from "./CategoriesSection.module.scss";
// Bieu tuong chon theo TU KHOA trong ten danh muc, khong theo truong icon cua
// ban ghi: truong do la o nhap tu do trong trang quan tri, admin go gi cung
// duoc, nen khong the dua vao no de chon dung mot component.
//
// Doi ten danh muc thi cung chi roi ve bieu tuong mac dinh, khong vo trang.
const BIEU_TUONG: [RegExp, LucideIcon][] = [
  [/web|front|html|css/i, Code2],
  [/devops|cloud|docker|kubernet/i, Cloud],
  [/mobile|android|ios|flutter/i, Smartphone],
  [/marketing|seo|quảng cáo/i, Megaphone],
  [/dữ liệu|data|phân tích|analytic/i, BarChart3],
  [/thiết kế|design|ui|ux/i, PenTool],
  [/ai|máy học|machine|khoa học/i, Cpu],
  [/bảo mật|security|an toàn/i, ShieldCheck],
];

function chonBieuTuong(ten: string): LucideIcon {
  for (const [mau, Icon] of BIEU_TUONG) if (mau.test(ten)) return Icon;
  return LayoutGrid;
}

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

interface Props {
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
  soKhoaTheoDanhMuc?: Record<string, number>;
}

export default function CategoriesSection({ initialData, soKhoaTheoDanhMuc }: Props) {
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
        <TieuDeMuc
          tieuDe="Khám phá danh mục"
          moTa="Chọn lĩnh vực bạn muốn theo đuổi. Mỗi danh mục là một lộ trình từ khoá nhập môn tới khoá nâng cao."
          xemTatCa="/courses"
          chuXemTatCa="Xem toàn bộ khoá học"
        />

        <div className={styles.grid}>
          {categories.map((category) => {
            const catSlug =
              category.slug || category.name.toLowerCase().replace(/ /g, "-");
            const Icon = chonBieuTuong(category.name);
            const soKhoa = soKhoaTheoDanhMuc?.[category._id];

            return (
              <Link
                href={`/courses?category=${catSlug}`}
                key={category._id}
                className={`group ${styles.card2}`}
              >
                <span className={styles.row}>
                  <Icon size={22} strokeWidth={1.75} />
                </span>

                <span className={styles.label}>
                  <span className={styles.label2}>{category.name}</span>
                  <span className={styles.label3}>
                    {soKhoa === undefined
                      ? "Xem khoá học"
                      : soKhoa === 0
                        ? "Sắp có khoá học"
                        : `${soKhoa} khoá học`}
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
