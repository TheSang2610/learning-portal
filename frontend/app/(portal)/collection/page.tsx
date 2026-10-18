import { Suspense } from "react";

import { CourseCollection } from "@/src/components/features/portal/collection";
import collectionStyles from "@/src/components/features/portal/collection/CourseCollection.module.scss";
import { ListingExtras } from "@/src/components/features/portal/course-listing";
import { getHomeData } from "@/src/components/features/portal/home";

// Ba bang xep hang doi theo khoa admin dat - lam moi moi 60 giay nhu trang chu.
export const revalidate = 60;

/**
 * /collection?slug=... - cung khung voi /courses (course-listing). May chu lay
 * san ca ba bang + so lieu mot lan; phan doc ?slug= nam trong Suspense de
 * trang van dung san tinh duoc.
 */
export default async function CourseCollectionPage() {
  const d = await getHomeData();

  return (
    <>
      <Suspense fallback={<div className={collectionStyles.fallback} />}>
        <CourseCollection
          lists={d.featuredItems}
          stats={
            d.courseCount
              ? {
                  courses: d.courseCount,
                  free: d.freeCourseCount,
                  providers: d.unit.length,
                }
              : null
          }
          visible={d.appearance.homeSections}
        />
      </Suspense>

      <ListingExtras d={d} />
    </>
  );
}
