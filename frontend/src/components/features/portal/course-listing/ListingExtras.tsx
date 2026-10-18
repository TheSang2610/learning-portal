import FaqSection from "@/src/components/common/FaqSection";
import {
  HomePartners,
  HomePopularCourses,
  getHomeData,
} from "@/src/components/features/portal/home";
import { COURSES_PAGE as C } from "@/src/constants/portal/courses-page";
import { HOME_PAGE } from "@/src/constants/portal/home-page";

import ListingMore from "./ListingMore";
import styles from "./ListingExtras.module.scss";

type HomeData = Awaited<ReturnType<typeof getHomeData>>;

/**
 * Cac muc kham pha them DUNG CHUNG cuoi moi trang danh sach khoa hoc
 * (/courses, /collection...): moi va pho bien, don vi dao tao, cam nang /
 * tai lieu, FAQ. Sua o day la moi trang doi theo.
 *
 * Component MAY CHU - nhan du lieu getHomeData() tu trang.
 */
export default function ListingExtras({ d }: { d: HomeData }) {
  return (
    <>
      <HomePopularCourses
        {...HOME_PAGE.popularCourses}
        initialData={d.featuredItems}
        visible={d.appearance.homeSections}
      />

      {d.unit.length > 0 && (
        <section className={styles.partners} aria-labelledby="listing-partners-heading">
          <div className={styles.partnersHead}>
            <h2 id="listing-partners-heading" className={styles.partnersHeading}>
              {C.partners.heading}
            </h2>
            <p className={styles.partnersText}>{C.partners.description}</p>
          </div>
          <HomePartners unit={d.unit} />
        </section>
      )}

      <ListingMore />

      <FaqSection initialData={d.faqs} tieuDe={C.faq.heading} />
    </>
  );
}
