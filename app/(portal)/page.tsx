import { Suspense } from "react";
import AuthModalGate from "@/src/components/home/AuthModalGate";
import HeroSection from "@/src/components/home/HeroSection";
import PartnersSection from "@/src/components/home/PartnersSection";
import CategoriesSection from "@/src/components/home/CategoriesSection";
import PopularCoursesSection from "@/src/components/home/PopularCoursesSection";
import FaqSection from "@/src/components/home/FaqSection";
import TestimonialsSection from "@/src/components/home/TestimonialsSection";
import CourseSection from "@/src/components/home/CourseSection";
import { locKhoaDaDang } from "@/src/components/home/locKhoaHoc";

import type { BannerData } from "@/src/services/banner";
import type { Category } from "@/src/services/categoryService";
import type { ProviderData } from "@/src/services/provider";
import type { FaqItem } from "@/src/services/faq";
import type { HomeSectionsState } from "@/src/components/home/PopularCoursesSection";
import { layTuMayChu } from "@/src/services/serverFetch";

// Trang chu doi theo khoa hoc / banner admin dat, nen khong dung trang tinh
// vinh vien. 60 giay la muc dung hoa giua "moi vao la thay ngay" va "khong
// danh thuc ham serverless moi luot xem".
export const revalidate = 60;

// Rong -> tra ve null chu khong phai [].
//
// Cac muc coi "co initialData" la tin hieu "khoi goi API nua". Neu luc dung
// san may chu lay hut (backend chet, mang chap chon) ma van truyen [] xuong
// thi trang se hien mot muc trong tron va KHONG bao gio thu lai. Tra null thi
// trinh duyet tu goi nhu truoc day - dung nguyen duong lui cu.
const hoacNull = <T,>(ds: T[]): T[] | null => (ds.length ? ds : null);

export default async function HomePage() {
  // Bay lay het o day, mot lan, song song.
  //
  // Truoc day bay muc nay tu goi API sau khi trinh duyet tai xong JS: nguoi
  // dung nhin bay khung xam, may tim kiem khong doc duoc gi, va /api/categories
  // bi goi HAI lan vi hai muc cung can no.
  const [banners, categories, providers, faqs, homeSections, coursesRes] =
    await Promise.all([
      layTuMayChu<{ success?: boolean; data?: BannerData[] }>(
        "/api/banners?page=HOME",
        {},
      ),
      layTuMayChu<Category[]>("/api/categories", []),
      layTuMayChu<ProviderData[]>("/api/providers", []),
      layTuMayChu<{ data?: FaqItem[] }>("/api/faqs/homepage", {}),
      layTuMayChu<{ success?: boolean; data?: HomeSectionsState }>(
        "/api/courses/home-sections",
        {},
      ),
      layTuMayChu<unknown>("/api/courses", []),
    ]);

  const bannerHome = (banners?.success ? (banners.data ?? []) : []).filter(
    (b) => b.isActive === true,
  );

  const muc = homeSections?.success ? homeSections.data : undefined;
  const coMuc = Boolean(
    muc &&
    (muc.mostPopular?.length || muc.trendingNow?.length || muc.newReleases?.length),
  );

  return (
    <>
      {/* AuthModalGate goi useSearchParams() -> phai boc Suspense, neu khong
          ca trang chu mat kha nang prerender tinh. */}
      <Suspense fallback={null}>
        <AuthModalGate />
      </Suspense>

      <div>
        <HeroSection initialData={hoacNull(bannerHome)} />
        <CategoriesSection initialData={hoacNull(categories)} />
        <PopularCoursesSection initialData={coMuc && muc ? muc : null} />
        <PartnersSection
          initialData={hoacNull(Array.isArray(providers) ? providers : [])}
        />
        <CourseSection
          initialCourses={hoacNull(locKhoaDaDang(coursesRes))}
          initialCategories={hoacNull(categories)}
        />
        <TestimonialsSection />
        <FaqSection initialData={hoacNull(faqs?.data ?? [])} />
      </div>
    </>
  );
}
