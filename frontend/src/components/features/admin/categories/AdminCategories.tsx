"use client";

import { Plus } from "lucide-react";

import { ADMIN_CATEGORIES as C } from "@/src/constants/admin/categories-page";

import { useAdminCategories } from "./hooks/useAdminCategories";
import CategoriesTable from "./parts/CategoriesTable";
import CategoryModal from "./parts/CategoryModal";
import styles from "./AdminCategories.module.scss";

/** Trang /admin/categories - quan ly danh muc khoa hoc. */
export default function AdminCategories() {
  const c = useAdminCategories();

  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <div>
          <h1 className={styles.title}>{C.title}</h1>
          <p className={styles.text}>
            {c.loading ? C.loading : C.count(c.categories.length)}
          </p>
        </div>
        <button onClick={c.openCreate} className={styles.button}>
          <Plus size={16} /> {C.add}
        </button>
      </div>

      {c.error && <div className={styles.card}>{c.error}</div>}

      <CategoriesTable
        categories={c.categories}
        loading={c.loading}
        busyId={c.busyId}
        onEdit={c.openEdit}
        onDelete={c.remove}
      />

      {c.editingId !== null && (
        <CategoryModal
          isEdit={!!c.editingId}
          name={c.name}
          icon={c.icon}
          saving={c.saving}
          formError={c.formError}
          onName={c.setName}
          onIcon={c.setIcon}
          onClose={c.closeModal}
          onSubmit={c.submit}
        />
      )}
    </div>
  );
}
