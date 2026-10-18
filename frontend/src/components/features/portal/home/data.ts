import type { HomeSectionsState } from "@/src/components/features/portal/home/HomePopularCourses";
import { filterPublished } from "@/src/lib/filter-courses";
import { HOME_PAGE as C } from "@/src/constants/portal/home-page";
import type { Category } from "@/src/services/categoryService";
import { getCategoryId } from "@/src/services/course";
import {
  normalizeDocument,
  type DocumentCategory,
  type DocumentListResponse,
  type DocumentStats,
} from "@/src/services/document";
import type { FaqItem } from "@/src/services/faq";
import type { PostListResponse, Topic } from "@/src/services/post";
import type { ProviderData } from "@/src/services/provider";
import { fetchFromServer } from "@/src/services/serverFetch";
import {
  APPEARANCE_PATH,
  DEFAULT_APPEARANCE,
  type Appearance,
} from "@/src/services/settings";

// Rong -> tra ve null chu khong phai [].
//
// Cac muc coi "co initialData" la tin hieu "khoi goi API nua". Neu luc dung
// san may chu lay hut (backend chet, mang chap chon) ma van truyen [] xuong
// thi trang se hien mot muc trong tron va KHONG bao gio thu lai. Tra null thi
// trinh duyet tu goi nhu truoc day - dung nguyen duong lui cu.
const hoacNull = <T>(items: T[]): T[] | null => (items.length ? items : null);

/** Lay va tinh san moi thu trang chu can, o may chu. */
export async function getHomeData() {
  // Lay het o day, mot lan, song song.
  //
  // Da BO luot goi /api/banners: phan mo dau khong con la bang bang khuyen
  // mai nua. Xem ghi chu dau HeroSection.tsx.
  //
  // Nam luot cuoi phuc vu hai muc Cam nang / Tai lieu. Hong luot nao thi muc do
  // chi thieu phan du lieu dong (bai moi, so lieu...), van con loi dan sang khu.
  const [
    categories,
    providers,
    faqs,
    homeSections,
    coursesRes,
    latestPosts,
    postTopics,
    documentStats,
    popularDocuments,
    documentGroups,
    appearance,
  ] = await Promise.all([
    fetchFromServer<Category[]>(C.api.categories, []),
    fetchFromServer<ProviderData[]>(C.api.providers, []),
    fetchFromServer<{ data?: FaqItem[] }>(C.api.faqs, {}),
    fetchFromServer<{ success?: boolean; data?: HomeSectionsState }>(
      C.api.homeSections,
      {},
    ),
    fetchFromServer<unknown>(C.api.courses, []),
    fetchFromServer<Partial<PostListResponse>>(C.api.latestPosts, {}),
    fetchFromServer<Topic[]>(C.api.postTopics, []),
    fetchFromServer<DocumentStats | null>(C.api.documentStats, null),
    fetchFromServer<Partial<DocumentListResponse>>(C.api.popularDocuments, {}),
    fetchFromServer<DocumentCategory[]>(C.api.documentGroups, []),
    // Cai dat admin dat o /admin/appearance. Dem 30 giay: doi xong khong phai
    // cho lau moi thay tren trang chu.
    fetchFromServer<Appearance>(APPEARANCE_PATH, DEFAULT_APPEARANCE, 30),
  ]);

  const item = homeSections?.success ? homeSections.data : undefined;
  const hasSection = Boolean(
    item &&
    (item.mostPopular?.length || item.trendingNow?.length || item.newReleases?.length),
  );

  const publishedCourses = filterPublished(coursesRes);
  const freeCourseCount = publishedCourses.filter((k) => (k.price ?? 0) === 0).length;

  // Cho bang hoc phi (chi khach thay): gia khoa co phi re nhat va so ngay hoc
  // ngan nhat - ghi "tu X" va "N ngay" thi khong bao gio hua qua so that.
  const paidCourses = publishedCourses.filter((k) => (k.price ?? 0) > 0);
  const pricing = {
    freeCount: freeCourseCount,
    paidCount: paidCourses.length,
    minPaidPrice: paidCourses.length
      ? Math.min(...paidCourses.map((k) => k.price ?? 0))
      : null,
    // Course.accessDays mac dinh 30 o backend; ban ghi cu chua co truong nay.
    accessDays: paidCourses.length
      ? Math.min(...paidCourses.map((k) => k.accessDays ?? 30))
      : 30,
  };

  // Dem so khoa hoc trong tung danh muc, dem o day chu khong goi them API.
  //
  // Danh sach khoa hoc da nam san trong tay o tren, nen viec dem la mien phi.
  // Con o phia danh muc thi con so nay la thu duy nhat tra loi duoc "bam vao
  // day co gi khong" truoc khi nguoi ta bam.
  //
  // Mot khoa co the thuoc nhieu danh muc - getCategoryId tra ve MANG - nen tong
  // cac o dem se lon hon tong so khoa hoc, va do la dung.
  const courseCountByCategory: Record<string, number> = {};
  for (const course of publishedCourses) {
    for (const id of getCategoryId(course.category)) {
      courseCountByCategory[id] = (courseCountByCategory[id] ?? 0) + 1;
    }
  }

  return {
    courseCount: publishedCourses.length,
    freeCourseCount,
    pricing,
    unit: Array.isArray(providers) ? providers : [],
    categories: hoacNull(categories),
    courseCountByCategory,
    featuredItems: hasSection && item ? item : null,
    publishedCourses: hoacNull(publishedCourses),
    faqs: hoacNull(faqs?.data ?? []),
    appearance,
    guides: {
      posts: Array.isArray(latestPosts.posts) ? latestPosts.posts : [],
      topics: Array.isArray(postTopics) ? postTopics : [],
    },
    documents: {
      stats: documentStats,
      // CDN luu danh sach 60 giay - co the con ban dinh dang cu, xem normalizeDocument.
      items: Array.isArray(popularDocuments.documents)
        ? popularDocuments.documents.map(normalizeDocument)
        : [],
      // Chi lay linh vuc CO tai lieu: bam vao mot o rong la mat mot luot tin.
      groups: (Array.isArray(documentGroups) ? documentGroups : [])
        .filter((g) => g.soTaiLieu > 0)
        .sort((a, b) => b.soTaiLieu - a.soTaiLieu)
        .slice(0, C.documentGroupCount),
    },
  };
}
