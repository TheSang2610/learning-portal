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

/** Muc "Cam nang mon hoc" - dan sang /blog. */
export interface HomeGuidesData {
  eyebrow: string;
  heading: string;
  text: string;
  points: string[];
  cta: { label: string; href: string };
  latestTitle: string;
  topicsTitle: string;
  /** Mau chu, {n} = so bai trong chu de. */
  topicCount: string;
  topicEmpty: string;
  /** Mau duong dan, {slug} = slug chu de. */
  topicHref: string;
  /** Mau chu, {n} = so phut doc. */
  readMinutes: string;
}

/** Muc "Chia se tai lieu" - dan sang /share-document. */
export interface HomeDocumentsData {
  eyebrow: string;
  heading: string;
  text: string;
  cta: { label: string; href: string };
  statLabels: { documents: string; subjects: string; schools: string; downloads: string };
  popularTitle: string;
  seeAllLabel: string;
  seeAllHref: string;
  groupsTitle: string;
  share: { title: string; text: string; label: string; href: string };
}

/** Dai quang cao noi bo ngay duoi phan mo dau. */
export interface HomePromoData {
  badge: string;
  title: string;
  text: string;
  /** "register" = mo hop dang ky ngay tren trang thay vi chuyen trang. */
  cta: { label: string; href?: string; action?: "register" };
  secondary?: { label: string; href: string };
}

/** Mot goi trong bang hoc phi. */
export interface HomePricingPlan {
  id: "free" | "paid";
  name: string;
  /** Gia hien to. Rong = tinh tu du lieu khoa hoc (xem HomePricing). */
  priceNote: string;
  /** Mau chu, {n} = so khoa thuoc goi. */
  count: string;
  countZero: string;
  features: string[];
  cta: { label: string; href: string };
  highlight?: boolean;
}

export interface HomePricingData {
  heading: string;
  description: string;
  freePrice: string;
  /** Mau chu, {price} = gia khoa re nhat. */
  paidFrom: string;
  paidNone: string;
  /** Mau chu, {n} = so ngay hoc cua khoa co phi. */
  accessDaysLabel: string;
  plans: HomePricingPlan[];
  footnote: string;
}

/** Phan dau trang chu cua nguoi DA dang nhap. Mau chu dung "{...}" + fillTemplate. */
export interface HomeDashboardData {
  /** {name} = ten nguoi dung. */
  welcome: string;
  welcomeFallback: string;
  /** Nhan han hoc: {n} = so ngay con lai, {date} = ngay het han. */
  pace: { daysLeft: string; until: string; unlimited: string; expired: string };
  /** {n} = phan tram. */
  complete: string;
  /** {title} = ten bai. */
  upNext: string;
  allDone: string;
  /** Khi chua biet bai tiep theo (khoa chua co bai, hoac tai muc luc loi). */
  upNextUnknown: string;
  /** {i}/{total} = vi tri bai trong khoa. */
  lessonPosition: string;
  video: string;
  reading: string;
  resume: string;
  start: string;
  review: string;
  continueWatching: string;
  goalsTitle: string;
  /** {n} = so bai muc tieu, {course} = ten khoa, {done} = so bai xong hom nay. */
  goal: string;
  /** {n} = so tuan lien tiep. */
  streak: string;
  streakTip: string;
  weekDays: string[];
  /** {n} = so bai xong, {m} = so phut hoc trong tuan. */
  weekSummary: string;
  /** {n} = so bai moi ngay. */
  setGoal: string;
  goalOptions: number[];
  otherTitle: string;
  emptyTitle: string;
  emptyText: string;
  emptyCta: { label: string; href: string };
  myCoursesHref: string;
  myCoursesLabel: string;
  error: string;
}

/** Muc "Tiep tuc kham pha" o dashboard - ba cot cuon ngang. */
export interface HomeExploreData {
  heading: string;
  panels: { recent: string; similar: string; trending: string };
  recentEmpty: string;
  recentEmptyCta: { label: string; href: string };
  empty: string;
  free: string;
  /** Mau duong dan, {slug} = slug khoa hoc. */
  courseHref: string;
  prev: string;
  next: string;
}
