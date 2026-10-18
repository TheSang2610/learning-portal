"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Building2, ChevronRight, Gift, Search, X } from "lucide-react";

import { COURSES_PAGE } from "@/src/constants/portal/courses-page";
import { fillTemplate } from "@/src/lib/format";

import styles from "./ListingHero.module.scss";

const H = COURSES_PAGE.hero;

/** Duong dan /courses giu lai tu khoa / danh muc (bo trong thi bo tham so). */
export const coursesHref = (p: { search?: string; category?: string }) => {
  const q = new URLSearchParams();
  if (p.search?.trim()) q.set("search", p.search.trim());
  if (p.category) q.set("category", p.category);
  const s = q.toString();
  return s ? `/courses?${s}` : "/courses";
};

export interface ListingStats {
  courses: number;
  free: number;
  providers: number;
}

export interface ListingCrumb {
  label: string;
  /** Bo trong = chang cuoi (trang hien tai). */
  href?: string;
}

export interface ListingChip {
  key: string;
  label: string;
  href: string;
  count?: number;
  active: boolean;
}

/**
 * Dai dau trang DUNG CHUNG cho moi trang danh sach khoa hoc (/courses,
 * /collection...): breadcrumb, tieu de, mo ta, o tim kiem, so lieu cua kho
 * khoa hoc va hang chip loc nhanh. Sua o day la moi trang doi theo.
 *
 * O tim kiem luon dua sang /courses?search= (giu danh muc `searchCategory`
 * neu co) - tim kiem chi co mot noi xu ly.
 */
export default function ListingHero({
  crumbs,
  title,
  subtitle,
  keyword = "",
  searchCategory = "",
  stats,
  chipsLabel,
  chips = [],
}: {
  crumbs: ListingCrumb[];
  title: string;
  subtitle?: string;
  /** Tu khoa dang tim (hien san trong o + nut xoa). */
  keyword?: string;
  searchCategory?: string;
  stats: ListingStats | null;
  chipsLabel?: string;
  chips?: ListingChip[];
}) {
  const router = useRouter();
  // Noi goi dat `key` = tu khoa tren dia chi, nen doi dia chi la o nhap lam moi.
  const [value, setValue] = useState(keyword);
  const chipsRef = useRef<HTMLUListElement>(null);
  const activeKey = chips.find((c) => c.active)?.key;

  // Chip dang chon co the nam khuat ben phai (man hinh hep, nhieu chip) - cuon
  // hang chip toi no, khong cuon ca trang.
  useEffect(() => {
    const list = chipsRef.current;
    const active = list?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!list || !active) return;
    list.scrollLeft = active.offsetLeft - list.clientWidth / 2 + active.offsetWidth / 2;
  }, [activeKey]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(coursesHref({ search: value, category: searchCategory }));
  };

  return (
    <header className={styles.hero}>
      <span aria-hidden className={styles.glow} />
      <div className={styles.container}>
        <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
          {crumbs.map((c, i) => (
            <span key={`${c.label}-${i}`} className={styles.crumb}>
              {i > 0 && <ChevronRight size={14} aria-hidden />}
              {c.href ? (
                <Link href={c.href}>{c.label}</Link>
              ) : (
                <span aria-current="page">{c.label}</span>
              )}
            </span>
          ))}
        </nav>

        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}

        <form role="search" onSubmit={submit} className={styles.search}>
          <Search size={20} aria-hidden className={styles.searchIcon} />
          <input
            type="search"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={H.searchPlaceholder}
            aria-label={H.searchPlaceholder}
            className={styles.searchInput}
          />
          {keyword && (
            <Link
              href={coursesHref({ category: searchCategory })}
              className={styles.clear}
              aria-label={H.clearSearch}
              title={H.clearSearch}
            >
              <X size={18} />
            </Link>
          )}
          <button type="submit" className={styles.searchButton}>
            {H.searchButton}
          </button>
        </form>

        {stats && (
          <ul className={styles.stats}>
            <li>
              <BookOpen size={16} aria-hidden />
              {fillTemplate(H.stats.courses, { n: stats.courses })}
            </li>
            {stats.free > 0 && (
              <li>
                <Gift size={16} aria-hidden />
                {fillTemplate(H.stats.free, { n: stats.free })}
              </li>
            )}
            {stats.providers > 0 && (
              <li>
                <Building2 size={16} aria-hidden />
                {fillTemplate(H.stats.providers, { n: stats.providers })}
              </li>
            )}
          </ul>
        )}

        {chips.length > 0 && (
          <div className={styles.chipsRow}>
            {chipsLabel && <span className={styles.chipsLabel}>{chipsLabel}</span>}
            <ul ref={chipsRef} className={styles.chips}>
              {chips.map((c) => (
                <li key={c.key}>
                  <Link
                    href={c.href}
                    className={`${styles.chip} ${c.active ? styles.chipActive : ""}`}
                    aria-current={c.active ? "true" : undefined}
                  >
                    {c.label}
                    {c.count !== undefined && (
                      <span className={styles.chipCount}>{c.count}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
