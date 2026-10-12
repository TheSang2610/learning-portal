import Link from "next/link";
import { BookOpen, Building2, PlayCircle } from "lucide-react";
import SafeImage from "@/src/components/ui/SafeImage";
import type { Course } from "@/src/services/course";

import { providerLogo } from "@/src/components/features/portal/home/partnerLogos";
import styles from "./CourseCard.module.scss";
// Mot the khoa hoc duy nhat, dung chung cho ca hai muc o trang chu.
//
// Truoc day moi muc tu ve the cua no: muc bang xep hang la mot dong ngang cao
// 56px, muc danh sach la mot the doc - hai kieu chu, hai kieu vien, hai cach
// hien gia. Sua mot cho thi cho kia van cu. Gio mot component, sua mot lan.

const LEVEL_NAMES: Record<string, string> = {
  beginner: "Sơ cấp",
  intermediate: "Trung cấp",
  advanced: "Cao cấp",
};

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
  const isFree = course.price === 0;
  const lessonCount = course.lessons?.length || 0;
  const level = LEVEL_NAMES[String(course.level).toLowerCase()] ?? course.level;

  return (
    <Link href={`/course?slug=${course.slug}`} className={`group ${styles.card}`}>
      <div className={styles.box}>
        {course.thumbnail ? (
          <SafeImage
            src={course.thumbnail}
            alt=""
            fill
            sizes={sizes ?? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"}
            className={styles.box2}
          />
        ) : (
          <span className={styles.row}>
            <BookOpen size={32} className={styles.box3} />
          </span>
        )}

        {rankBadge !== undefined && (
          // Anh khoa hoc phan lon la anh chup toi mau, chu trang tren anh khong
          // du tuong phan o moi tam anh - nen so nam trong mot vien dac chu
          // khong de tran tren anh.
          <span className={styles.floating}>{rankBadge}</span>
        )}
      </div>

      <div className={styles.col}>
        {/* min-h giu day cac the thang hang khi ten khoa dai ngan khac nhau.
            Khong co no thi the co ten mot dong se lech len, va hang the trong
            nhu bi rung. */}
        <h3 className={styles.subheading}>{course.title}</h3>

        {/* CHI don vi dao tao, khong kem ten giang vien.
            The rong khoang 300px, chu 13px chi vua chung 30 ky tu - nhet ca
            hai vao thi ban nao cung bi cat cut, doc khong ra ("Nguyen Va... .
            TechAcademy Vi..."). Giu don vi vi do la tin hieu uy tin khi nguoi
            ta dang luot chon; ten giang vien co day du o trang chi tiet. */}
        {provider && (
          <p className={styles.text}>
            {providerLogo(provider).src ? (
              <span className={styles.card2}>
                <SafeImage
                  src={providerLogo(provider).src}
                  fallbackSrc={providerLogo(provider).fallback}
                  hideOnError
                  alt=""
                  width={16}
                  height={16}
                  className={styles.box4}
                />
              </span>
            ) : (
              <Building2 size={13} className={styles.box5} />
            )}
            <span className={styles.label}>{provider.name}</span>
          </p>
        )}

        <div className={styles.row2}>
          <span className={styles.row3}>
            <span className={styles.label2}>{level}</span>
            <span className={styles.row4}>
              <PlayCircle size={13} className={styles.box6} />
              {lessonCount} bài
            </span>
          </span>

          {/* Gia la thu quyet dinh bam hay khong bam, nen no la chu lon nhat
              o hang duoi.
              Khoa mien phi hien mot nhan xanh ngay tai day chu khong phai mot
              nhan goc anh: hang duoi cua moi the deu thang cot voi nhau, nen
              luot mot hang the la so sanh duoc gia ngay, con nhan tren anh thi
              moi cai mot cho. */}
          {isFree ? (
            <span className={styles.label3}>Miễn phí</span>
          ) : (
            <span className={styles.label4}>{course.price.toLocaleString("vi-VN")}đ</span>
          )}
        </div>
      </div>
    </Link>
  );
}
