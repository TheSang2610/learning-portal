import Link from "next/link";
import { BookOpen, Building2, PlayCircle } from "lucide-react";
import SafeImage from "@/src/components/ui/SafeImage";
import type { Course } from "@/src/services/course";

import styles from "./CourseCard.module.scss";
// Mot the khoa hoc duy nhat, dung chung cho ca hai muc o trang chu.
//
// Truoc day moi muc tu ve the cua no: muc bang xep hang la mot dong ngang cao
// 56px, muc danh sach la mot the doc - hai kieu chu, hai kieu vien, hai cach
// hien gia. Sua mot cho thi cho kia van cu. Gio mot component, sua mot lan.

const TEN_CAP_DO: Record<string, string> = {
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
  thuHang?: number;
  /** Kich thuoc anh bao trinh duyet tai dung do phan giai can dung. */
  sizes?: string;
}

export default function TheKhoaHoc({ khoa, thuHang, sizes }: Props) {
  const nhaCungCap =
    khoa.provider && typeof khoa.provider === "object" ? khoa.provider : null;
  const mienPhi = khoa.price === 0;
  const soBai = khoa.lessons?.length || 0;
  const capDo = TEN_CAP_DO[String(khoa.level).toLowerCase()] ?? khoa.level;

  return (
    <Link href={`/course?slug=${khoa.slug}`} className={`group ${styles.card}`}>
      <div className={styles.box}>
        {khoa.thumbnail ? (
          <SafeImage
            src={khoa.thumbnail}
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

        {thuHang !== undefined && (
          // Anh khoa hoc phan lon la anh chup toi mau, chu trang tren anh khong
          // du tuong phan o moi tam anh - nen so nam trong mot vien dac chu
          // khong de tran tren anh.
          <span className={styles.floating}>{thuHang}</span>
        )}
      </div>

      <div className={styles.col}>
        {/* min-h giu day cac the thang hang khi ten khoa dai ngan khac nhau.
            Khong co no thi the co ten mot dong se lech len, va hang the trong
            nhu bi rung. */}
        <h3 className={styles.subheading}>{khoa.title}</h3>

        {/* CHI don vi dao tao, khong kem ten giang vien.
            The rong khoang 300px, chu 13px chi vua chung 30 ky tu - nhet ca
            hai vao thi ban nao cung bi cat cut, doc khong ra ("Nguyen Va... .
            TechAcademy Vi..."). Giu don vi vi do la tin hieu uy tin khi nguoi
            ta dang luot chon; ten giang vien co day du o trang chi tiet. */}
        {nhaCungCap && (
          <p className={styles.text}>
            {nhaCungCap.logo ? (
              <span className={styles.card2}>
                <SafeImage
                  src={nhaCungCap.logo}
                  alt=""
                  width={16}
                  height={16}
                  className={styles.box4}
                />
              </span>
            ) : (
              <Building2 size={13} className={styles.box5} />
            )}
            <span className={styles.label}>{nhaCungCap.name}</span>
          </p>
        )}

        <div className={styles.row2}>
          <span className={styles.row3}>
            <span className={styles.label2}>{capDo}</span>
            <span className={styles.row4}>
              <PlayCircle size={13} className={styles.box6} />
              {soBai} bài
            </span>
          </span>

          {/* Gia la thu quyet dinh bam hay khong bam, nen no la chu lon nhat
              o hang duoi.
              Khoa mien phi hien mot nhan xanh ngay tai day chu khong phai mot
              nhan goc anh: hang duoi cua moi the deu thang cot voi nhau, nen
              luot mot hang the la so sanh duoc gia ngay, con nhan tren anh thi
              moi cai mot cho. */}
          {mienPhi ? (
            <span className={styles.label3}>Miễn phí</span>
          ) : (
            <span className={styles.label4}>{khoa.price.toLocaleString("vi-VN")}đ</span>
          )}
        </div>
      </div>
    </Link>
  );
}
