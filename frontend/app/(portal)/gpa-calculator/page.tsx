import GradeProfile from "@/src/components/gpa/GradeProfile";
import { Calculator, Repeat } from "lucide-react";
import FeatureLinks from "@/src/components/gpa/FeatureLinks";
import GradeProfileGuide from "@/src/components/gpa/GradeProfileGuide";

import styles from "./page.module.scss";
export const metadata = {
  title: "Hồ sơ điểm",
  description: "Tính GPA, CPA và dự kiến điểm",
};

// Server component de giu metadata va de phan tieu de duoc dung san trong HTML.
// Phan tinh toan can trang thai nen tach ra client component.
export default function GradeProfilePage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.container2}>
          <h1 className={styles.title}>Hồ sơ điểm</h1>
          <p className={styles.title}>Tính GPA, CPA và dự kiến điểm</p>
        </div>
      </div>

      <GradeProfile />

      <div className={styles.container3}>
        <FeatureLinks
          title="Các tính năng khác"
          subtitle="Khám phá các công cụ tính điểm hữu ích khác"
          items={[
            { href: "/calc-point", label: "Tính điểm tổng kết", icon: Calculator },
            { href: "/convert-10-to-4", label: "Chuyển hệ 10 sang 4", icon: Repeat },
          ]}
        />

        <GradeProfileGuide />
      </div>
    </div>
  );
}
