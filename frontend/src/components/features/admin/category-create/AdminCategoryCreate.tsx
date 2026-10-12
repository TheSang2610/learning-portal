"use client";

import { ArrowLeft } from "lucide-react";

import { ADMIN_CATEGORY_CREATE as C } from "@/src/constants/admin/category-create-page";

import { useCategoryCreate } from "./hooks/useCategoryCreate";
import CategoryForm from "./parts/CategoryForm";
import styles from "./AdminCategoryCreate.module.scss";

/** Trang /admin/category-create. */
export default function AdminCategoryCreate() {
  const f = useCategoryCreate();

  return (
    <div className={styles.stack}>
      <button onClick={f.backToList} className={styles.button}>
        <ArrowLeft size={16} />
        {C.back}
      </button>

      <div>
        <h1 className={styles.title}>{C.title}</h1>
        <p className={styles.text}>{C.subtitle}</p>
      </div>

      <CategoryForm
        name={f.name}
        slug={f.slug}
        submitting={f.submitting}
        onName={f.handleNameChange}
        onSlug={f.handleSlugChange}
        onSubmit={f.submitHandler}
      />
    </div>
  );
}
