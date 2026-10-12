"use client";

import { RefreshCw } from "lucide-react";

import { ADMIN_PROVIDERS as C } from "@/src/constants/admin/providers-page";

import { useAdminProviders } from "./hooks/useAdminProviders";
import ProviderForm from "./parts/ProviderForm";
import ProvidersTable from "./parts/ProvidersTable";
import styles from "./AdminProviders.module.scss";

/** Trang /admin/providers - doi tac doanh nghiep va truong hoc. */
export default function AdminProviders() {
  const s = useAdminProviders();

  return (
    <div className={styles.page}>
      <div className={styles.row}>
        <div>
          <h1 className={styles.title}>{C.title}</h1>
          <p className={styles.text}>{C.intro}</p>
        </div>
        <button
          onClick={s.loadProviders}
          disabled={s.fetching}
          className={styles.button}
          title={C.refreshTitle}
        >
          <RefreshCw size={18} className={s.fetching ? styles.spinner : ""} />
        </button>
      </div>

      <div className={styles.grid}>
        <ProviderForm s={s} />
        <ProvidersTable s={s} />
      </div>
    </div>
  );
}
