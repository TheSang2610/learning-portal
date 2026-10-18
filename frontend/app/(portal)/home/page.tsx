import {
  HomeDashboard,
  HomeDocuments,
  HomeExplore,
  HomeGuides,
  HomeModeSync,
  HomePopularCourses,
  HomePromo,
  getHomeData,
} from "@/src/components/features/portal/home";
import { HOME_PAGE } from "@/src/constants/portal/home-page";

// Dung chung du lieu (va bo dem 60 giay) voi landing. Phan rieng cua tung
// nguoi (khoa dang hoc...) do HomeDashboard tu lay o trinh duyet, nen trang nay
// van dem san duoc cho moi nguoi.
export const revalidate = 60;

/**
 * Trang chu cua nguoi DA dang nhap (dashboard).
 *
 * Khong co dia chi rieng: proxy.ts dua "/" vao day khi thay cookie phien, va
 * chuyen huong /home go tay ve "/". Nguoi xem luon thay dia chi la "/".
 *
 * Bo han phan ban hang cua landing (dai moi dang ky, bang hoc phi, danh gia
 * cua hoc vien) - nguoi nay da la hoc vien. Thay bang: hoc tiep, dai gioi
 * thieu tinh nang moi, goi y khoa, va loi vao Cam nang / Tai lieu.
 */
export default async function MemberHomePage() {
  const d = await getHomeData();

  return (
    <div>
      <HomeDashboard {...HOME_PAGE.dashboard} />

      {/* Xem gan day / Tuong tu hoat dong / Dang thinh hanh. Thay cho
          CourseSuggestions o landing - cot giua chinh la goi y do. */}
      <HomeExplore {...HOME_PAGE.explore} trending={d.featuredItems?.trendingNow ?? []} />

      {d.appearance.banners.memberPromo.enabled && (
        <HomePromo
          variant="member"
          {...HOME_PAGE.memberPromo}
          theme={d.appearance.banners.memberPromo}
        />
      )}

      <HomePopularCourses
        {...HOME_PAGE.popularCourses}
        initialData={d.featuredItems}
        visible={d.appearance.homeSections}
      />

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

      {/* Phien da chet ma cookie con (het han, doi mat khau) -> ve landing. */}
      <HomeModeSync mode="member" />
    </div>
  );
}
