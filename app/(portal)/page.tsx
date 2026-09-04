import { Suspense } from "react";
import AuthModalGate from "@/src/components/home/AuthModalGate";
import HeroSection from "@/src/components/home/HeroSection";
import DaiDonVi from "@/src/components/home/DaiDonVi";
import TrinhBay from "@/src/components/home/TrinhBay";
import CategoriesSection from "@/src/components/home/CategoriesSection";
import PopularCoursesSection from "@/src/components/home/PopularCoursesSection";
import FaqSection from "@/src/components/home/FaqSection";
import TestimonialsSection from "@/src/components/home/TestimonialsSection";
import CourseSection from "@/src/components/home/CourseSection";
import { locKhoaDaDang } from "@/src/components/home/locKhoaHoc";

import type { Category } from "@/src/services/categoryService";
import type { ProviderData } from "@/src/services/provider";
import type { FaqItem } from "@/src/services/faq";
import type { HomeSectionsState } from "@/src/components/home/PopularCoursesSection";
import { layTuMayChu } from "@/src/services/serverFetch";

// Trang chu doi theo khoa hoc admin dat, nen khong dung trang tinh vinh vien.
// 60 giay la muc dung hoa giua "moi vao la thay ngay" va "khong danh thuc ham
// serverless moi luot xem".
export const revalidate = 60;

// Rong -> tra ve null chu khong phai [].
//
// Cac muc coi "co initialData" la tin hieu "khoi goi API nua". Neu luc dung
// san may chu lay hut (backend chet, mang chap chon) ma van truyen [] xuong
// thi trang se hien mot muc trong tron va KHONG bao gio thu lai. Tra null thi
// trinh duyet tu goi nhu truoc day - dung nguyen duong lui cu.
const hoacNull = <T,>(ds: T[]): T[] | null => (ds.length ? ds : null);

export default async function HomePage() {
  // Lay het o day, mot lan, song song.
  //
  // Da BO luot goi /api/banners: phan mo dau khong con la bang bang khuyen
  // mai nua. Xem ghi chu dau HeroSection.tsx.
  const [categories, providers, faqs, homeSections, coursesRes] = await Promise.all([
    layTuMayChu<Category[]>("/api/categories", []),
    layTuMayChu<ProviderData[]>("/api/providers", []),
    layTuMayChu<{ data?: FaqItem[] }>("/api/faqs/homepage", {}),
    layTuMayChu<{ success?: boolean; data?: HomeSectionsState }>(
      "/api/courses/home-sections",
      {},
    ),
    layTuMayChu<unknown>("/api/courses", []),
  ]);

  const muc = homeSections?.success ? homeSections.data : undefined;
  const coMuc = Boolean(
    muc &&
    (muc.mostPopular?.length || muc.trendingNow?.length || muc.newReleases?.length),
  );

  const khoaDaDang = locKhoaDaDang(coursesRes);
  const soMienPhi = khoaDaDang.filter((k) => (k.price ?? 0) === 0).length;
  const donVi = Array.isArray(providers) ? providers : [];

  return (
    <>
      {/* AuthModalGate goi useSearchParams() -> phai boc Suspense, neu khong
          ca trang chu mat kha nang prerender tinh. */}
      <Suspense fallback={null}>
        <AuthModalGate />
      </Suspense>

      <div>
        <HeroSection soKhoa={khoaDaDang.length} soMienPhi={soMienPhi} />
        {/* Dai nay thay cho PartnersSection cu - cung mot noi dung (don vi
            dao tao), nhung gon trong mot dai thay vi mot luoi the. */}
        <DaiDonVi donVi={donVi} />
        <TrinhBay />
        <CategoriesSection initialData={hoacNull(categories)} />
        <PopularCoursesSection initialData={coMuc && muc ? muc : null} />
        <CourseSection
          initialCourses={hoacNull(khoaDaDang)}
          initialCategories={hoacNull(categories)}
        />
        <TestimonialsSection />
        <FaqSection initialData={hoacNull(faqs?.data ?? [])} />
      </div>
    </>
  );
}
