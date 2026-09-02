import { Calculator, TrendingUp, GraduationCap, Trophy, Repeat } from "lucide-react";
import CalcPoint from "@/src/components/gpa/CalcPoint";
import CalcPointGuide from "@/src/components/gpa/CalcPointGuide";
import FeatureLinks from "@/src/components/gpa/FeatureLinks";
import { STRUCTURES, SCALES } from "@/src/components/gpa/gradeScales";

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
    <div className="min-h-screen bg-[#f8fafc]">
      {/* ============ HERO ============ */}
      <section className="bg-gradient-to-b from-blue-50 to-[#f8fafc] px-4 py-12 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
          <Calculator size={24} className="text-blue-600" />
        </span>

        <h1 className="mt-4 text-3xl font-extrabold text-blue-600">Tính điểm tổng kết</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-700">
          Công cụ tính điểm tổng kết chính xác và nhanh chóng. Hỗ trợ nhiều cấu trúc điểm
          và thang điểm khác nhau của các trường đại học.
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
