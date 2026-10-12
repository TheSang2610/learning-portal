"use client";

import { ADMIN_DOCUMENT_SUBJECTS as C } from "@/src/constants/admin/document-subjects-page";

import { useDocumentCatalog } from "./hooks/useDocumentCatalog";
import CatalogAlerts from "./parts/CatalogAlerts";
import CategorySection from "./parts/CategorySection";
import SubjectSection from "./parts/SubjectSection";
import UniversitySection from "./parts/UniversitySection";
import styles from "./AdminDocumentSubjects.module.scss";

/** Trang /admin/document-subjects - linh vuc, truong va mon hoc cua kho tai lieu. */
export default function AdminDocumentSubjects() {
  const s = useDocumentCatalog();

  return (
    <div className={styles.page}>
      <header className={styles.top}>
        <h1 className={styles.title}>{C.title}</h1>
        <p className={styles.sub}>{C.intro}</p>
      </header>

      <CatalogAlerts s={s} />
      <CategorySection s={s} />
      <UniversitySection s={s} />
      <SubjectSection s={s} />
    </div>
  );
}
