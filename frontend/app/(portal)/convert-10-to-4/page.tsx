import { Repeat, ArrowRightLeft, GraduationCap, Trophy, Calculator } from "lucide-react";
import Convert10To4 from "@/src/components/gpa/Convert10To4";
import FeatureLinks from "@/src/components/gpa/FeatureLinks";
import { SCALES } from "@/src/components/gpa/gradeScales";

import styles from "./page.module.scss";
export const metadata = {
  title: "Quy đổi điểm hệ 10 sang hệ 4",
  description:
    "Công cụ chuyển đổi điểm chính xác và nhanh chóng từ hệ 10 sang hệ 4. Hỗ trợ nhiều thang điểm khác nhau của các trường đại học Việt Nam.",
};

const STATS = [
  { icon: ArrowRightLeft, value: String(SCALES.length), label: "Thang điểm" },
  { icon: GraduationCap, value: "100+", label: "Trường ĐH" },
  { icon: Trophy, value: "Tức thì", label: "Kết quả" },
];

export default function Convert10To4Page() {
  return (
    <div className={styles.page}>
      {/* ============ HERO ============ */}
      <section className={styles.section}>
        <span className={styles.label}>
          <Repeat size={24} className={styles.box} />
        </span>

        <h1 className={styles.title}>Quy đổi điểm hệ 10 sang hệ 4</h1>
        <p className={styles.text}>
          Công cụ chuyển đổi điểm chính xác và nhanh chóng từ hệ 10 sang hệ 4. Hỗ trợ
          nhiều thang điểm khác nhau của các trường đại học Việt Nam.
        </p>

        <div className={styles.row}>
          {STATS.map(({ icon: Icon, value, label }) => (
            <span key={label} className={styles.card}>
              <Icon size={15} className={styles.box} />
              <strong className={styles.strong}>{value}</strong>
              <span className={styles.label2}>·</span>
              <span className={styles.label3}>{label}</span>
            </span>
          ))}
        </div>
      </section>

      <div className={styles.container}>
        {/* Phan "tinh nang lien quan" nam giua cong cu va huong dan */}
        <Convert10To4>
          <FeatureLinks
            title="Các tính năng liên quan"
            subtitle="Khám phá thêm các công cụ hỗ trợ học tập khác"
            items={[
              {
                href: "/gpa-calculator",
                label: "GPA & CPA",
                desc: "Tính toán & theo dõi",
                icon: GraduationCap,
              },
              {
                href: "/calc-point",
                label: "Tính điểm tổng kết",
                desc: "Công cụ tính điểm",
                icon: Calculator,
              },
            ]}
          />
        </Convert10To4>
      </div>
    </div>
  );
}
