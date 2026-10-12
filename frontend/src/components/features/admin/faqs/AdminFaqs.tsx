"use client";

import { CheckCircle, HelpCircle, Plus } from "lucide-react";

import { ADMIN_FAQS as C } from "@/src/constants/admin/faqs-page";

import { useAdminFaqs } from "./hooks/useAdminFaqs";
import FaqAreaTabs from "./parts/FaqAreaTabs";
import FaqList from "./parts/FaqList";
import FaqModal from "./parts/FaqModal";
import styles from "./AdminFaqs.module.scss";

/** Trang /admin/faqs - FAQ Trang chu va Chia se tai lieu. */
export default function AdminFaqs() {
  const m = useAdminFaqs();

  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <div>
          <h3 className={styles.subheading}>
            <HelpCircle className={styles.box} size={26} />
            {C.title}
          </h3>
          <p className={styles.text}>{C.intro}</p>
        </div>
        <button onClick={m.openCreate} className={styles.button}>
          <Plus size={18} />
          {C.add}
        </button>
      </div>

      <FaqAreaTabs faqArea={m.faqArea} moTa={m.area?.moTa} onChange={m.setFaqArea} />

      {m.successMsg && (
        <div className={`${styles.showPaste} ${styles.card}`}>
          <CheckCircle className={styles.box2} size={20} />
          <span className={styles.label}>{m.successMsg}</span>
        </div>
      )}

      <FaqList m={m} />

      {m.isOpenModal && <FaqModal m={m} areaName={m.area?.nhan} />}
    </div>
  );
}
