import { Calculator, TrendingUp, GraduationCap, Trophy, Repeat } from "lucide-react";
import CalcPoint from "@/src/components/gpa/CalcPoint";
import CalcPointGuide from "@/src/components/gpa/CalcPointGuide";
import FeatureLinks from "@/src/components/gpa/FeatureLinks";
import { STRUCTURES, SCALES } from "@/src/components/gpa/gradeScales";

import styles from "./page.module.scss";
export const metadata = {
  title: "Tính điểm tổng kết",
  description:
    "Công cụ tính điểm tổng kết chính xác và nhanh chóng. Hỗ trợ nhiều cấu trúc điểm và thang điểm khác nhau của các trường đại học.",
};

// Con so lay tu chinh du lieu chu khong go cung: them mot cau truc diem la o
// day tu cap nhat, khong bao gio lech voi so luong that trong o chon.
const STATS = [
  { icon: TrendingUp, value: String(STRUCTURES.length), label: "Cấu trúc điểm" },
  { icon: GraduationCap, value: String(SCALES.length), label: "Thang điểm" },
  { icon: Trophy, value: "100%", label: "Chính xác" },
];

export default function CalcPointPage() {
  return (
    <div className={styles.page}>
      {/* ============ HERO ============ */}
      <section className={styles.section}>
        <span className={styles.label}>
          <Calculator size={24} className={styles.box} />
        </span>

        <h1 className={styles.title}>Tính điểm tổng kết</h1>
        <p className={styles.text}>
          Công cụ tính điểm tổng kết chính xác và nhanh chóng. Hỗ trợ nhiều cấu trúc điểm
          và thang điểm khác nhau của các trường đại học.
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
        <CalcPoint />

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
              href: "/convert-10-to-4",
              label: "Chuyển hệ 10 sang 4",
              desc: "Chuyển đổi thang điểm",
              icon: Repeat,
            },
          ]}
        />

        <CalcPointGuide />
      </div>
    </div>
  );
}
