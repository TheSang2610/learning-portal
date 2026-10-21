import Link from "next/link";
import { BookOpen, Building2 } from "lucide-react";
import SafeImage from "@/src/components/ui/SafeImage";
import { COURSE_LEVEL_LABELS } from "@/src/constants/course-level";
import type { Course } from "@/src/services/course";

import { providerLogo } from "@/src/components/features/portal/home/partnerLogos";
import styles from "./CourseCard.module.scss";
// Mot the khoa hoc duy nhat, dung chung cho ca hai muc o trang chu.
//
// Truoc day moi muc tu ve the cua no: muc bang xep hang la mot dong ngang cao
// 56px, muc danh sach la mot the doc - hai kieu chu, hai kieu vien, hai cach
// hien gia. Sua mot cho thi cho kia van cu. Gio mot component, sua mot lan.
//
// Bo cuc theo the luoi cua Coursera: anh nam trong khung (co dem, bo goc rieng),
// o logo co vien + ten don vi, ten khoa dam, dong "cap do · so bai", va nhan
// gia dang vien o day the.

interface Props {
  khoa: Course;
  /**
   * Thu hang trong bang xep hang, tinh tu 1.
   *
   * Chi truyen o nhung muc THUC SU la xep hang. Gan so vao mot danh sach
   * khong co thu tu la noi doi voi nguoi doc: ho se tuong khoa dau bang la
   * khoa duoc chuong nhat trong khi that ra chi la khoa nam dau mang.
   */
  rankBadge?: number;
  /** Kich thuoc anh bao trinh duyet tai dung do phan giai can dung. */
  sizes?: string;
}

export default function CourseCard({ khoa: course, rankBadge, sizes }: Props) {
  const provider =
    course.provider && typeof course.provider === "object" ? course.provider : null;
  const logo = provider ? providerLogo(provider) : null;
  const isFree = course.price === 0;
  const lessonCount = course.lessons?.length || 0;
  const level = COURSE_LEVEL_LABELS[String(course.level).toLowerCase()] ?? course.level;

  return (
    <Link href={`/course?slug=${course.slug}`} className={styles.card}>
      <div className={styles.preview}>
        {course.thumbnail ? (
          <SafeImage
            src={course.thumbnail}
            alt=""
            fill
            sizes={sizes ?? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"}
            className={styles.previewImage}
            // Anh bia do giang vien tai len co the la anh chup man hinh be
            // ngang; cat cover thi chu tren anh bi dut doan.
            avoidHeavyCrop
          />
        ) : (
          <span className={styles.previewEmpty}>
            <BookOpen size={32} />
          </span>
        )}

        {rankBadge !== undefined && (
          // Anh khoa hoc phan lon la anh chup toi mau, chu trang tren anh khong
          // du tuong phan o moi tam anh - nen so nam trong mot vien dac chu
          // khong de tran tren anh.
          <span className={styles.rank}>{rankBadge}</span>
        )}
      </div>

      <div className={styles.content}>
        {/* CHI don vi dao tao, khong kem ten giang vien: the hep, nhet ca hai
            thi ban nao cung bi cat. Ten giang vien co o trang chi tiet. */}
        {provider && (
          <p className={styles.partner}>
            <span className={styles.partnerLogo}>
              {logo?.src ? (
                <SafeImage
                  src={logo.src}
                  fallbackSrc={logo.fallback}
                  hideOnError
                  alt=""
                  width={28}
                  height={28}
                  className={styles.partnerLogoImage}
                />
              ) : (
                <Building2 size={16} />
              )}
            </span>
            <span className={styles.partnerName}>{provider.name}</span>
          </p>
        )}

        <h3 className={styles.title}>{course.title}</h3>

        <p className={styles.meta}>
          {[level, `${lessonCount} bài học`].filter(Boolean).join(" · ")}
        </p>

        {/* Gia la thu quyet dinh bam hay khong, nen la mot vien rieng o day the -
            hang the nao cung thang cot, luot qua la so duoc gia. */}
        <span className={`${styles.tag} ${isFree ? styles.tagFree : styles.tagPrice}`}>
          {isFree ? "Miễn phí" : `${course.price.toLocaleString("vi-VN")}đ`}
        </span>
      </div>
    </Link>
  );
}
