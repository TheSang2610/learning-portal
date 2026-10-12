"use client";

import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, HelpCircle, Plus } from "lucide-react";

import { ADMIN_COURSE_FAQS as C } from "@/src/constants/admin/course-faqs-page";

import { useCourseFaqs } from "./hooks/useCourseFaqs";
import CourseFaqList from "./parts/CourseFaqList";
import CourseFaqModal from "./parts/CourseFaqModal";
import styles from "./AdminCourseFaqs.module.scss";

function AdminCourseFaqsContent() {
  const m = useCourseFaqs();

  return (
    <div className={styles.stack}>
      <div>
        <Link href={C.backHref} className={styles.box}>
          <ArrowLeft size={16} /> {C.back}
        </Link>
      </div>

      <div className={styles.row}>
        <div>
          <h3 className={styles.subheading}>
            <HelpCircle className={styles.box2} size={26} />
            {C.title}
          </h3>
          <p className={styles.text}>{C.intro(m.courseId)}</p>
        </div>
        <button onClick={m.openCreate} className={styles.button}>
          <Plus size={18} />
          {C.add}
        </button>
      </div>

      {m.successMsg && (
        <div className={styles.card}>
          <CheckCircle className={styles.box3} size={20} />
          <span className={styles.label}>{m.successMsg}</span>
        </div>
      )}

      <CourseFaqList m={m} />

      {m.isOpenModal && <CourseFaqModal m={m} />}
    </div>
  );
}

/**
 * Trang /admin/course-faqs?courseId=...
 *
 * useSearchParams() phai nam trong Suspense thi Next moi prerender tinh duoc.
 * Co boundary -> khung trang di tu CDN, khong ton mot lan chay serverless moi luot xem.
 */
export default function AdminCourseFaqs() {
  return (
    <Suspense
      fallback={
        <div className={styles.row6}>
          <div className={styles.spinner3} />
        </div>
      }
    >
      <AdminCourseFaqsContent />
    </Suspense>
  );
}
