import Link from "next/link";
import { ArrowRight, FileText, Upload } from "lucide-react";

import DocumentCard from "@/src/components/features/portal/share-document/parts/DocumentCard";
import { allPath } from "@/src/lib/document/paths";
import type {
  DocumentCategory,
  DocumentStats,
  SharedDocument,
} from "@/src/services/document";
import type { HomeDocumentsData } from "@/src/types/home";

import styles from "./HomeDocuments.module.scss";

// So gon: 1.234 -> "1,2K" - cung cach DocumentStats o /share-document.
const compactNumber = (n: number) =>
  new Intl.NumberFormat("vi-VN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);

interface Props extends HomeDocumentsData {
  stats: DocumentStats | null;
  items: SharedDocument[];
  groups: DocumentCategory[];
  /**
   * Tong mau. Mac dinh la mau rieng cua khu (landing); "course" = xanh cua cac
   * muc khoa hoc, dung o dashboard noi muc nay dung giua cac muc khoa hoc.
   */
  tone?: "default" | "course";
}

/**
 * Muc "Chia se tai lieu" o trang chu: so lieu that cua kho, vai tai lieu xem
 * nhieu, loi vao theo linh vuc va loi moi dang tai lieu.
 *
 * Phan nao thieu du lieu (backend loi, kho trong) thi phan do tu an; dong tieu
 * de + nut "Vao kho tai lieu" luon con, vi viec chinh cua muc la dan sang khu.
 *
 * Component MAY CHU - du lieu lay san trong getHomeData. DocumentCard la
 * client component (nut luu), boc duoc tu day.
 */
export default function HomeDocuments({
  tone = "default",
  stats,
  items,
  groups,
  eyebrow,
  heading,
  text,
  cta,
  statLabels,
  popularTitle,
  seeAllLabel,
  seeAllHref,
  groupsTitle,
  share,
}: Props) {
  const statItems = stats
    ? [
        { value: stats.soTaiLieu, label: statLabels.documents },
        { value: stats.soMon, label: statLabels.subjects },
        { value: stats.soTruong, label: statLabels.schools },
        { value: stats.tongLuotTai, label: statLabels.downloads },
      ]
    : [];

  return (
    <section
      className={`${styles.section} ${tone === "course" ? styles.toneCourse : ""}`}
      aria-labelledby="home-documents-heading"
    >
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <span className={styles.eyebrow}>
              <FileText size={14} aria-hidden />
              {eyebrow}
            </span>
            <h2 id="home-documents-heading" className={styles.heading}>
              {heading}
            </h2>
            <p className={styles.text}>{text}</p>
          </div>

          <Link href={cta.href} className={`group ${styles.cta}`}>
            {cta.label}
            <ArrowRight size={18} className={styles.ctaArrow} />
          </Link>
        </div>

        {statItems.length > 0 && (
          <dl className={styles.stats}>
            {statItems.map((s) => (
              <div key={s.label} className={styles.stat}>
                <dt className={styles.statLabel}>{s.label}</dt>
                <dd className={styles.statValue}>{compactNumber(s.value)}</dd>
              </div>
            ))}
          </dl>
        )}

        {items.length > 0 && (
          <div className={styles.popular}>
            <div className={styles.rowTitle}>
              <h3 className={styles.blockTitle}>{popularTitle}</h3>
              <Link href={seeAllHref} className={`group ${styles.seeAll}`}>
                {seeAllLabel}
                <ArrowRight size={15} className={styles.ctaArrow} />
              </Link>
            </div>
            <ul className={styles.grid}>
              {items.map((doc) => (
                <li key={doc._id}>
                  <DocumentCard doc={doc} chan="phoBien" />
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className={styles.footer}>
          {groups.length > 0 && (
            <div className={styles.groups}>
              <h3 className={styles.blockTitle}>{groupsTitle}</h3>
              <ul className={styles.chips}>
                {groups.map((g) => (
                  <li key={g._id}>
                    <Link href={allPath({ nhom: g.key })} className={styles.chip}>
                      {g.ten}
                      <span className={styles.chipCount}>{g.soTaiLieu}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className={styles.share}>
            <span className={styles.shareIcon} aria-hidden>
              <Upload size={20} />
            </span>
            <div className={styles.shareText}>
              <p className={styles.shareTitle}>{share.title}</p>
              <p className={styles.shareDesc}>{share.text}</p>
            </div>
            <Link href={share.href} className={styles.shareButton}>
              {share.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
