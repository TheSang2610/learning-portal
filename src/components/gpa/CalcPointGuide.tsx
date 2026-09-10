import { Settings } from "lucide-react";
import GradeMappingTable from "./GradeMappingTable";
import { SCALES } from "./gradeScales";

// Bang quy doi trong huong dan lay theo thang 9 muc (thang day du nhat).
// gradeScales.ts la nguon duy nhat, nen bang nay va ket qua tinh khong bao gio
// lech nhau.
const SCALE = SCALES[0];

const STEPS = [
  {
    title: "Chọn cấu trúc điểm",
    body: "Chọn cấu trúc điểm của môn học tương ứng với hệ số các điểm thành phần. Ví dụ: môn có 4 điểm với hệ số 10%, 10%, 20%, 60% → chọn 10-10-20-60.",
  },
  {
    title: "Chọn thang điểm",
    body: "Chọn cấu trúc thang điểm phù hợp với trường của bạn. Hệ thống hỗ trợ 3 cấu trúc thang điểm phổ biến: (A+ A B+ B C+ C D+ D F), (A B+ B C+ C D+ D F), (A B C D F).",
  },
  { title: "Bảng quy đổi điểm", body: null },
  {
    title: "Tính toán tự động",
    body: "Sau khi nhập điểm, hệ thống sẽ tự động tính toán điểm tổng kết của môn học một cách chính xác và nhanh chóng.",
  },
];

export default function CalcPointGuide() {
  return (
    <section className="mt-12 rounded-2xl border border-blue-200 bg-white px-5 py-8 shadow-sm sm:px-8">
      <div className="text-center">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-blue-100">
          <Settings size={22} className="text-blue-600" />
        </span>
        <h3 className="mt-3 text-xl font-extrabold text-blue-600">Hướng dẫn sử dụng</h3>
        <p className="mt-1.5 text-sm text-slate-600">
          Công cụ tính điểm tổng kết của môn học, quy đổi ra hệ 4 và xếp loại điểm
        </p>
      </div>

      <div className="relative mt-8 grid gap-8 pt-8 md:grid-cols-2 lg:grid-cols-4">
        {/* Duong ke noi cac buoc, chay qua TAM cac vong tron so.
              Phan tu absolute dinh vi theo PADDING BOX cua khung cha, nen phai
              cong ca pt-8 (2rem) vao, khong thi duong ke nam lo lung phia tren. */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-[calc(2rem_+_18px)] hidden h-px bg-blue-600/30 lg:block"
        />

        {STEPS.map((s, i) => (
          <div key={s.title} className="text-center">
            {/* relative de vong tron ve DE LEN duong ke, khong bi ke cat ngang */}
            <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
              {i + 1}
            </span>
            <h4 className="mt-3 text-sm font-bold text-slate-900">{s.title}</h4>

            {s.body ? (
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.body}</p>
            ) : (
              <>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Điểm tổng kết quy ra hệ 4 và hệ chữ (điểm lẻ được làm tròn):
                </p>
                <div className="mt-3">
                  <GradeMappingTable scale={SCALE} />
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
