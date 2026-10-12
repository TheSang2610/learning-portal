import { ADMIN_FAQS as C } from "@/src/constants/admin/faqs-page";
import type { FaqArea } from "@/src/services/faq";

import styles from "../AdminFaqs.module.scss";

interface FaqAreaTabsProps {
  faqArea: FaqArea;
  moTa: string | undefined;
  onChange: (k: FaqArea) => void;
}

/** Chon khu vuc: moi khu vuc mot bo FAQ rieng. */
export default function FaqAreaTabs({
  faqArea,
  moTa: description,
  onChange,
}: FaqAreaTabsProps) {
  return (
    <div className={styles.faqArea} role="tablist" aria-label={C.areasAria}>
      {C.areas.map((k) => (
        <button
          key={k.khoa}
          type="button"
          role="tab"
          aria-selected={faqArea === k.khoa}
          onClick={() => onChange(k.khoa)}
          className={`${styles.tabKhuVuc} ${faqArea === k.khoa ? styles.tabKhuVucOn : ""}`}
        >
          {k.nhan}
        </button>
      ))}
      <span className={styles.areaDescription}>{description}</span>
    </div>
  );
}
