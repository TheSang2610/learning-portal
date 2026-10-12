import type { LucideIcon } from "lucide-react";

/** Bon mau nhan dien cua bon mang noi dung - map sang class CSS trong HomeHero. */
export type HomeTone = "certificate" | "course" | "document" | "post";

/** Mot canh trong khoi hinh doi o phan mo dau. */
export interface HomeHeroScene {
  tone: HomeTone;
  icon: LucideIcon;
  label: string;
  lead: string;
  title: string;
  /** De trong = canh ve vong quy dao thay cho anh chup. */
  image?: { src: string; alt: string };
  badge?: { title: string; subtitle: string };
}

/** Mot the quay quanh tam o canh quy dao. */
export interface HomeHeroOrbit {
  tone: HomeTone;
  icon: LucideIcon;
  label: string;
  angle: string;
  radius: string;
  period: string;
}

export interface HomeHeroData {
  newBadge: string;
  freeCount: (n: number) => string;
  titleLine1: string;
  titleLine2: string;
  intro: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { href: string; withCount: (n: number) => string; fallback: string };
  scenes: HomeHeroScene[];
  orbit: HomeHeroOrbit[];
  logoMark: string;
  stats: { courses: string; free: string; certificate: string };
}

export interface HomeFeaturesData {
  lessons: { title: string; time: string; state: "done" | "current" | "locked" }[];
  progressLabel: string;
  progressValue: string;
  lessonBlock: { heading: string; text: string; points: string[] };
  certificateBlock: { heading: string; text: string; points: string[] };
  certificate: {
    mark: string;
    title: string;
    learner: string;
    course: string;
    codeLabel: string;
    code: string;
    dateLabel: string;
    date: string;
  };
}

export interface HomeTestimonialsData {
  heading: string;
  description: string;
  items: { name: string; role: string; image: string; review: string }[];
}

export interface HomeCategoriesData {
  heading: string;
  description: string;
  seeAllHref: string;
  seeAllLabel: string;
  /** Mau duong dan, {slug} = slug danh muc. */
  categoryHref: string;
  countUnknown: string;
  countZero: string;
  /** Mau chu, {n} = so khoa. */
  count: string;
}

export interface HomePopularCoursesData {
  heading: string;
  description: string;
  empty: string;
  columns: {
    id: string;
    title: string;
    key: "mostPopular" | "newReleases" | "trendingNow";
  }[];
  /** Mau duong dan, {id} = id cot. */
  collectionHref: string;
  /** Mau duong dan, {slug} = slug khoa hoc. */
  courseHref: string;
  providerFallback: string;
  /** Mau chu, {name} = ten don vi. */
  providerTitle: string;
  /** Mau chu, {n} = so bai. */
  lessons: string;
  free: string;
}

export interface HomeCoursesData {
  heading: string;
  description: string;
  filterLabel: string;
  allCategories: string;
  levels: { value: string; label: string }[];
  prices: { value: string; label: string }[];
  countSuffix: string;
  resetFilters: string;
  empty: string;
  cardSizes: string;
}
