"use client";

import { Loader2 } from "lucide-react";

import {
  ADMIN_HOME_SECTION_COMMON as COMMON,
  ADMIN_HOME_SECTIONS,
  type AdminHomeSectionKind,
} from "@/src/constants/admin/home-sections-page";

import { useAdminHomeSection } from "./hooks/useAdminHomeSection";
import HomeSectionHeader from "./parts/HomeSectionHeader";
import HomeSectionRow from "./parts/HomeSectionRow";
import styles from "./AdminHomeSection.module.scss";

/**
 * Trang ghim khoa hoc len mot muc cua trang chu (pho bien / xu huong / moi
 * phat hanh). Truoc day la ba trang chep tay gan nhu y het nhau.
 */
export default function AdminHomeSection({ kind }: { kind: AdminHomeSectionKind }) {
  const s = useAdminHomeSection(kind);
  const text = ADMIN_HOME_SECTIONS[kind];

  if (s.loading) {
    return (
      <div className={styles.row}>
        <Loader2 className={styles.spinner} size={24} /> {text.loading}
      </div>
    );
  }

  return (
    <div className={styles.stack}>
      <HomeSectionHeader
        kind={kind}
        searchTerm={s.searchTerm}
        onSearch={s.setSearchTerm}
      />

      <div className={styles.card2}>
        {s.filteredCourses.length === 0 ? (
          <div className={styles.box3}>{COMMON.empty}</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr className={styles.row3}>
                <th className={styles.headCell}>{COMMON.columns.course}</th>
                <th className={styles.headCell}>{COMMON.columns.instructor}</th>
                <th className={styles.headCell2}>{text.metricColumn}</th>
                <th className={styles.headCell2}>{COMMON.columns.showOnHome}</th>
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {s.filteredCourses.map(({ course, rank }) => (
                <HomeSectionRow
                  key={course._id}
                  kind={kind}
                  course={course}
                  rank={rank}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
