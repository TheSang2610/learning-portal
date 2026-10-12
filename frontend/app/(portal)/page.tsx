import CourseSuggestions from "@/src/components/common/CourseSuggestions";
import FaqSection from "@/src/components/common/FaqSection";
import {
  HomeCategories,
  HomeCourses,
  HomeFeatures,
  HomeHero,
  HomePartners,
  HomePopularCourses,
  HomeTestimonials,
  getHomeData,
} from "@/src/components/features/portal/home";
import { HOME_PAGE } from "@/src/constants/portal/home-page";

// Trang chu doi theo khoa hoc admin dat, nen khong dung trang tinh vinh vien.
// 60 giay la muc dung hoa giua "moi vao la thay ngay" va "khong danh thuc ham
// serverless moi luot xem".
export const revalidate = 60;

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

      <HomeFeatures {...HOME_PAGE.features} />

      <HomeCategories
        {...HOME_PAGE.categories}
        initialData={d.categories}
        courseCountByCategory={d.courseCountByCategory}
      />

      <HomePopularCourses {...HOME_PAGE.popularCourses} initialData={d.featuredItems} />

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

      <HomeTestimonials {...HOME_PAGE.testimonials} />

      <FaqSection initialData={d.faqs} />
    </div>
  );
}
