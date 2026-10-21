import CourseSuggestions from "@/src/components/common/CourseSuggestions";
import FaqSection from "@/src/components/common/FaqSection";
import GuestOnly from "@/src/components/common/GuestOnly";
import {
  HomeCategories,
  HomeCourses,
  HomeDocuments,
  HomeFeatures,
  HomeGuides,
  HomeModeSync,
  HomeHero,
  HomePartners,
  HomePopularCourses,
  HomePricing,
  HomePromo,
  HomeTestimonials,
  getHomeData,
} from "@/src/components/features/portal/home";
import { HOME_PAGE } from "@/src/constants/portal/home-page";

// Trang chu doi theo khoa hoc admin dat, nen khong dung trang tinh vinh vien.
// 60 giay la muc dung hoa giua "moi vao la thay ngay" va "khong danh thuc ham
// serverless moi luot xem".
export const revalidate = 60;

export const metadata = HOME_PAGE.metadata;

/**
 * Trang chu cho KHACH (landing). Nguoi da dang nhap khong toi day: proxy.ts dua
 * "/" sang app/(portal)/home/page.tsx (dashboard) khi thay cookie phien.
 *
 * Phan "ban hang" (dai moi dang ky, bang hoc phi) boc trong <GuestOnly>: luoi
 * an toan cho luc proxy khong thay cookie - xem ghi chu trong proxy.ts.
 */
export default async function HomePage() {
  // Du lieu dong (so khoa, danh muc, don vi...) lay mot lan o may chu, song
  // song. Chu tinh cua tung muc nam trong HOME_PAGE.
  const d = await getHomeData();

  return (
    // AuthModalGate da chuyen len app/(portal)/layout.tsx: moi trang trong
    // khu hoc vien deu can mo duoc hop dang nhap, khong rieng trang chu.
    <div>
      <HomeHero
        {...HOME_PAGE.hero}
        courseCount={d.courseCount}
        freeCourseCount={d.freeCourseCount}
      />

      {/* Dai chay ngang nay thay cho luoi the doi tac hoi truoc - cung mot
          noi dung (don vi dao tao), nhung gon trong mot dai. */}
      <HomePartners unit={d.unit} />

      <GuestOnly>
        {d.appearance.banners.guestPromo.enabled && (
          <HomePromo
            variant="guest"
            {...HOME_PAGE.guestPromo}
            theme={d.appearance.banners.guestPromo}
          />
        )}
      </GuestOnly>

      <HomeFeatures {...HOME_PAGE.features} />

      <HomeCategories
        {...HOME_PAGE.categories}
        initialData={d.categories}
        courseCountByCategory={d.courseCountByCategory}
      />

      <HomePopularCourses
        {...HOME_PAGE.popularCourses}
        initialData={d.featuredItems}
        visible={d.appearance.homeSections}
      />

      <GuestOnly>
        <HomePricing {...HOME_PAGE.pricing} {...d.pricing} />
      </GuestOnly>

      <HomeCourses
        {...HOME_PAGE.courses}
        initialCourses={d.publishedCourses}
        initialCategories={d.categories}
      />

      {/* Goi y dat SAU cac muc co san va TRUOC phan danh gia/FAQ.
          Dat tren cung thi no day muc "Khoa hoc pho bien" xuong, ma voi
          nguoi chua dang nhap thi hai muc do noi dung gan trung nhau. Dat
          duoi cung sau FAQ thi khong ai cuon toi.

          Component tu an di khi khong co goi y nao, nen khong can boc dieu
          kien o day. */}
      <CourseSuggestions soLuong={HOME_PAGE.suggestionsCount} />

      {/* Hai loi vao khu khac ngoai khoa hoc: Cam nang (/blog) va Tai lieu
          (/share-document). Dat sau het cac muc ve khoa hoc - nguoi da cuon
          qua do la nguoi chua chon duoc khoa, dua them duong khac cho ho -
          va truoc danh gia/FAQ. Hai muc xen nen (xam nhat / trang) voi nhau. */}
      <HomeGuides
        tone="course"
        {...HOME_PAGE.guides}
        posts={d.guides.posts}
        topics={d.guides.topics}
      />

      <HomeDocuments
        tone="course"
        {...HOME_PAGE.documents}
        stats={d.documents.stats}
        items={d.documents.items}
        groups={d.documents.groups}
      />

      <HomeTestimonials {...HOME_PAGE.testimonials} />

      <FaqSection initialData={d.faqs} />

      {/* Dang nhap bang hop thoai ngay tren trang nay -> doi sang dashboard. */}
      <HomeModeSync mode="guest" />
    </div>
  );
}
