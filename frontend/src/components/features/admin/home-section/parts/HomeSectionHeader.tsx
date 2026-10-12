import { Search } from "lucide-react";

import {
  ADMIN_HOME_SECTION_COMMON as COMMON,
  ADMIN_HOME_SECTIONS,
  type AdminHomeSectionKind,
} from "@/src/constants/admin/home-sections-page";

import { SECTION_CONFIG } from "../config";
import styles from "../AdminHomeSection.module.scss";

interface HomeSectionHeaderProps {
  kind: AdminHomeSectionKind;
  searchTerm: string;
  onSearch: (v: string) => void;
}

/** Bieu tuong, tieu de, mo ta va o tim kiem. */
export default function HomeSectionHeader({
  kind,
  searchTerm,
  onSearch,
}: HomeSectionHeaderProps) {
  const cfg = SECTION_CONFIG[kind];
  const text = ADMIN_HOME_SECTIONS[kind];
  const Icon = cfg.icon;

  return (
    <div className={styles.card}>
      <div className={styles.row2}>
        <div className={`${styles.box} ${cfg.boxClass}`}>
          <Icon size={24} />
        </div>
        <div>
          <h1 className={styles.title}>{text.title}</h1>
          <p className={styles.text}>{text.description}</p>
        </div>
      </div>
      <div className={styles.box2}>
        <Search className={styles.floating} size={18} />
        <input
          type="text"
          placeholder={COMMON.searchPlaceholder}
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          className={styles.input}
        />
      </div>
    </div>
  );
}
