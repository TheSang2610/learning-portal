import GradeProfile from "@/src/components/gpa/GradeProfile";
import { Calculator, Repeat } from "lucide-react";
import FeatureLinks from "@/src/components/gpa/FeatureLinks";
import GradeProfileGuide from "@/src/components/gpa/GradeProfileGuide";

export const metadata = {
  title: "Hồ sơ điểm",
  description: "Tính GPA, CPA và dự kiến điểm",
};

// Server component de giu metadata va de phan tieu de duoc dung san trong HTML.
// Phan tinh toan can trang thai nen tach ra client component.
export default function GradeProfilePage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] py-8">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mx-auto mb-6 max-w-md rounded-2xl bg-blue-600 px-8 py-4 text-center shadow-sm">
          <h1 className="text-lg font-extrabold text-white">Hồ sơ điểm</h1>
          <p className="text-lg font-extrabold text-white">
            Tính GPA, CPA và dự kiến điểm
          </p>
        </div>
      </div>

      <GradeProfile />

      <div className="mx-auto max-w-5xl px-4 pb-12">
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
