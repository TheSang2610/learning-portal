"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import CourseCard from "@/src/components/common/CourseCard";
import SectionTitle from "@/src/components/common/SectionHeading";
import { COLLECTION_PAGE as C } from "@/src/constants/portal/collection-page";

import { useCourseCollection } from "./hooks/useCourseCollection";
import styles from "./CourseCollection.module.scss";

function Spinner() {
  return (
    <div className={styles.page}>
      <div className={styles.spinner} />
    </div>
  );
}

function CourseCollectionContent() {
  const router = useRouter();
  const { muc: item, courses, loading } = useCourseCollection();

  if (loading) return <Spinner />;

  return (
    <div className={styles.page2}>
      <div className={styles.container}>
        {/* NÚT QUAY LẠI & BREADCRUMB */}
        <button onClick={() => router.back()} className={styles.button}>
          <ArrowLeft size={14} /> {C.back}
        </button>

        <SectionTitle nhu="h1" tieuDe={item?.ten ?? C.fallbackTitle} moTa={item?.moTa} />

        {courses.length === 0 ? (
          <div className={styles.card}>{item ? C.empty : C.unknown}</div>
        ) : (
          <div className={styles.grid}>
            {courses.map((course, order) => (
              // Co rankBadge vi day DUNG la mot bang xep hang - trang chu cung
              // danh so cho ba cot nay. Con /courses thi khong, vi do la ket
              // qua loc, danh so vao la noi doi voi nguoi doc.
              <CourseCard
                key={course._id}
                khoa={course}
                rankBadge={order + 1}
                sizes={C.cardSizes}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Suspense la bat buoc: useSearchParams() khong the prerender tinh neu thieu boundary.
// Co boundary thi Next dung san khung HTML, Vercel phuc vu tu CDN, khong ton serverless.
export default function CourseCollection() {
  return (
    <Suspense fallback={<Spinner />}>
      <CourseCollectionContent />
    </Suspense>
  );
}
