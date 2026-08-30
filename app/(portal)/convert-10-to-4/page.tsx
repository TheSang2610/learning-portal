import { Repeat, ArrowRightLeft, GraduationCap, Trophy, Calculator } from "lucide-react";
import Convert10To4 from "@/src/components/gpa/Convert10To4";
import FeatureLinks from "@/src/components/gpa/FeatureLinks";
import { SCALES } from "@/src/components/gpa/gradeScales";

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
    <div className="min-h-screen bg-[#f8fafc]">
      {/* ============ HERO ============ */}
      <section className="bg-gradient-to-b from-blue-50 to-[#f8fafc] px-4 py-12 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
          <Repeat size={24} className="text-blue-600" />
        </span>

        <h1 className="mt-4 text-3xl font-extrabold text-blue-600">
          Quy đổi điểm hệ 10 sang hệ 4
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-700">
          Công cụ chuyển đổi điểm chính xác và nhanh chóng từ hệ 10 sang hệ 4. Hỗ trợ
          nhiều thang điểm khác nhau của các trường đại học Việt Nam.
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {STATS.map(({ icon: Icon, value, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-white px-4 py-1.5 text-sm shadow-sm"
            >
              <Icon size={15} className="text-blue-600" />
              <strong className="font-extrabold text-blue-600">{value}</strong>
              <span className="text-slate-400">·</span>
              <span className="font-medium text-slate-700">{label}</span>
            </span>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 pb-12">
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
