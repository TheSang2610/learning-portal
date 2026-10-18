"use client";

import { useSearchParams } from "next/navigation";

import {
  CourseGrid,
  ListingHero,
  type ListingChip,
  type ListingStats,
} from "@/src/components/features/portal/course-listing";
import type { HomeSectionsState } from "@/src/components/features/portal/home/HomePopularCourses";
import { COURSES_PAGE } from "@/src/constants/portal/courses-page";
import {
  COLLECTION_PAGE as C,
  COLLECTIONS,
} from "@/src/constants/portal/collection-page";
import { fillTemplate } from "@/src/lib/format";

import { useCourseCollection } from "./hooks/useCourseCollection";
import styles from "./CourseCollection.module.scss";

const H = COURSES_PAGE.hero;

/**
 * Trang /collection?slug=... - mot bang xep hang (Pho bien nhat / Moi phat
 * hanh / Dang thinh hanh). Dung CHUNG khung voi /courses: ListingHero +
 * CourseGrid (+ ListingExtras o page.tsx), nen sua khung la ca hai doi theo.
 */
export default function CourseCollection({
  lists,
  stats,
  visible,
}: {
  /** Ba danh sach lay san o may chu; null = trinh duyet tu tai. */
  lists: HomeSectionsState | null;
  stats: ListingStats | null;
  /** Bang nao admin dang bat (/admin/appearance). */
  visible: Partial<Record<keyof HomeSectionsState, boolean>>;
}) {
  const slug = useSearchParams().get("slug") || "";
  const def = COLLECTIONS[slug];
  const { courses, loading } = useCourseCollection(slug, lists);
  const all = lists;

  // Hang chip = ba bang xep hang, chuyen qua lai nhanh; bang admin tat thi an.
  const chips: ListingChip[] = Object.entries(COLLECTIONS)
    .filter(([, c]) => visible[c.get] !== false)
    .map(([key, c]) => ({
      key,
      label: c.ten,
      href: `${C.href}${key}`,
      count: all ? (all[c.get]?.length ?? 0) : undefined,
      active: key === slug,
    }));

  return (
    <div className={styles.page}>
      <ListingHero
        crumbs={[
          { label: H.breadcrumbHome, href: H.breadcrumbHref },
          { label: H.breadcrumbCurrent, href: "/courses" },
          { label: def?.ten ?? C.fallbackTitle },
        ]}
        title={def?.ten ?? C.fallbackTitle}
        subtitle={def?.moTa ?? C.unknown}
        stats={stats}
        chipsLabel={C.chipsLabel}
        chips={chips}
      />

      <CourseGrid
        courses={courses}
        loading={loading}
        countText={fillTemplate(C.count, { n: courses.length })}
        empty={def ? C.empty : C.unknown}
        // Danh so vi day DUNG la bang xep hang - trang chu cung danh so ba cot
        // nay. /courses thi khong: do la ket qua loc, danh so la noi doi.
        ranked
      />
    </div>
  );
}
