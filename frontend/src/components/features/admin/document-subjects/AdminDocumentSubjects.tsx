"use client";

import { PageHeader } from "@/src/components/admin-ui";
import { ADMIN_DOCUMENT_SUBJECTS as C } from "@/src/constants/admin/document-subjects-page";

import { useDocumentCatalog } from "./hooks/useDocumentCatalog";
import CatalogAlerts from "./parts/CatalogAlerts";
import CategorySection from "./parts/CategorySection";
import SubjectSection from "./parts/SubjectSection";
import UniversitySection from "./parts/UniversitySection";
import styles from "./AdminDocumentSubjects.module.scss";

export type CatalogSection = "categories" | "universities" | "subjects";

const SECTIONS = {
  categories: CategorySection,
  universities: UniversitySection,
  subjects: SubjectSection,
} as const;

/**
 * Mot trong ba trang quan ly danh muc cua kho tai lieu:
 *   /admin/document-categories    - linh vuc
 *   /admin/document-universities  - truong dai hoc
 *   /admin/document-subjects      - mon hoc
 *
 * Truoc day ca ba nam chung mot trang. Van dung chung mot hook du lieu (mon
 * hoc can danh sach linh vuc de gan), chi khac phan nao duoc ve.
 */
export default function AdminDocumentSubjects({ section }: { section: CatalogSection }) {
  const s = useDocumentCatalog();
  const page = C.pages[section];
  const Section = SECTIONS[section];

  return (
    <div className={styles.page}>
      <PageHeader title={page.title} description={page.intro} />
      <CatalogAlerts s={s} />
      <Section s={s} hideHeading />
    </div>
  );
}
