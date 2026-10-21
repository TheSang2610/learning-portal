import Link from "next/link";
import { BookOpen, Star } from "lucide-react";

import SafeImage from "@/src/components/ui/SafeImage";
import { COURSE_LEVEL_LABELS } from "@/src/constants/course-level";
import { fillTemplate, formatVnd } from "@/src/lib/format";
import type { ExploreCourse } from "@/src/services/course";

import { providerLogo } from "../partnerLogos";
import styles from "./CourseListCard.module.scss";

export interface CourseListCardLabels {
  free: string;
  /** Mau chu so bai, {n} = so bai. Bo trong thi khong hien so bai. */
  lessons?: string;
}

/**
 * The khoa hoc dang hang ngang (anh 80px ben trai), bo cuc theo the danh sach
 * cua Coursera: logo + ten don vi, ten khoa, dong thong tin "cap do · so bai ·
 * gia · ★ diem". Dung chung cho "Tiep tuc kham pha" va "Khoa hoc moi va pho
 * bien" de hai muc luon giong nhau.
 *
 * Phai nam trong mot <ul>. `index` = thu tu xuat hien (moi the tre hon the
 * truoc mot nhip - xem SCSS).
 */
export default function CourseListCard({
  course: k,
  href,
  index = 0,
  labels,
}: {
  course: ExploreCourse & { lessons?: unknown[] };
  href: string;
  index?: number;
  labels: CourseListCardLabels;
}) {
  const provider = typeof k.provider === "object" ? k.provider : null;
  const logo = provider ? providerLogo(provider) : null;
  const meta = [
    k.level ? (COURSE_LEVEL_LABELS[k.level] ?? k.level) : null,
    labels.lessons && Array.isArray(k.lessons)
      ? fillTemplate(labels.lessons, { n: k.lessons.length })
      : null,
    k.price > 0 ? formatVnd(k.price) : labels.free,
  ].filter((m): m is string => Boolean(m));
  const hasRating = (k.reviewsCount ?? 0) > 0 && (k.rating ?? 0) > 0;

  return (
    <li className={styles.item} style={{ "--i": index } as React.CSSProperties}>
      <Link
        href={href}
        className={styles.card}
        aria-label={[
          k.title,
          provider?.name,
          ...meta,
          hasRating ? `${k.rating?.toFixed(1)} sao` : null,
        ]
          .filter(Boolean)
          .join(", ")}
      >
        <span className={styles.thumb}>
          {k.thumbnail ? (
            <SafeImage
              src={k.thumbnail}
              alt=""
              fill
              sizes="80px"
              className={styles.thumbImage}
              hideOnError
              // O vuong 80px: anh 16:9 thuong lech 1.78 lan van cat binh
              // thuong; chi anh be ngang hon 2:1 (anh chup man hinh) moi hien tron.
              avoidHeavyCrop={2}
            />
          ) : (
            <BookOpen size={22} aria-hidden />
          )}
        </span>

        <span className={styles.body}>
          {/* Hang dau: don vi dao tao ben trai, diem danh gia can phai. Diem
              danh gia tung nam cuoi dong "cap do · so bai · gia" nhung dong do
              qua dai cho the hep, sao bi rot xuong mot dong rieng va moi the
              rot mot kieu. Dat o day thi sao cua moi the nam thang mot hang. */}
          {(provider || hasRating) && (
            <span className={styles.partner}>
              {provider && (
                <>
                  <span className={styles.partnerLogo}>
                    {logo?.src ? (
                      <SafeImage
                        src={logo.src}
                        fallbackSrc={logo.fallback}
                        alt=""
                        width={20}
                        height={20}
                        className={styles.partnerLogoImage}
                        hideOnError
                      />
                    ) : null}
                  </span>
                  <span className={styles.partnerName}>{provider.name}</span>
                </>
              )}
              {hasRating && (
                <span className={styles.rating}>
                  <Star size={14} aria-hidden className={styles.star} />
                  {k.rating?.toFixed(1)}
                </span>
              )}
            </span>
          )}
          <span className={styles.title}>{k.title}</span>
          {/* Dau "·" dat TRUOC moi muc; muc nao roi xuong dau dong thi dau cua
              no nam trong vung bi cat (xem .metaWrap) - khong bao gio co dong
              bat dau bang "·". */}
          <span className={styles.metaWrap}>
            <span className={styles.meta}>
              {meta.map((m, i) => (
                <span
                  key={m}
                  className={`${styles.metaItem} ${i === meta.length - 1 ? (k.price > 0 ? styles.price : styles.free) : ""}`}
                >
                  {m}
                </span>
              ))}
            </span>
          </span>
        </span>
      </Link>
    </li>
  );
}
