"use client";

import { useState, type ReactNode } from "react";
import { Repeat, Settings } from "lucide-react";
import GradeMappingTable from "./GradeMappingTable";
import { SCALES, scaleById, gradeOf } from "./gradeScales";

// Bang quy doi trong phan huong dan phai doi theo thang dang chon ("theo thang
// diem da chon"), nen cong cu va huong dan dung chung mot state. Phan "Cac tinh
// nang lien quan" nam giua hai khoi -> nhan qua children de van la server
// component, khong phai goi vao goi JavaScript cua trinh duyet.
export default function Convert10To4({ children }: { children?: ReactNode }) {
  const [scaleId, setScaleId] = useState("0");
  const [input, setInput] = useState("0");

  const scale = scaleById(scaleId);

  const raw = input.replace(",", ".").trim();
  const parsed = raw === "" ? 0 : Number(raw);
  const score = Number.isFinite(parsed) ? Math.min(10, Math.max(0, parsed)) : 0;
  const grade = gradeOf(scale, score);

  return (
    <>
      {/* ============ CONG CU ============ */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-center gap-2 bg-blue-600 px-5 py-3">
          <Repeat size={17} className="text-white" />
          <h2 className="text-base font-bold text-white">Quy đổi điểm hệ 10 sang hệ 4</h2>
        </div>

        <div className="px-5 py-5">
          <h4 className="mb-2 border-l-[3px] border-blue-600 pl-2 text-sm font-bold text-blue-600">
            Chọn cấu trúc thang điểm
          </h4>
          <select
            value={scaleId}
            onChange={(e) => setScaleId(e.target.value)}
            aria-label="Chọn cấu trúc thang điểm"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          >
            {SCALES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="px-5 pb-6">
          <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-blue-200">
            <div className="border-r border-white/25 bg-blue-600 px-3 py-2.5 text-center text-sm font-bold text-white">
              Điểm hệ 10
            </div>
            <div className="border-r border-white/25 bg-blue-600 px-3 py-2.5 text-center text-sm font-bold text-white">
              Điểm hệ 4
            </div>
            <div className="bg-blue-600 px-3 py-2.5 text-center text-sm font-bold text-white">
              Thang điểm chữ
            </div>

            <div className="border-r border-blue-200 bg-white">
              <input
                type="number"
                min={0}
                max={10}
                step="0.01"
                value={input}
                placeholder="Điểm hệ 10"
                aria-label="Điểm hệ 10"
                onChange={(e) => setInput(e.target.value)}
                className="w-full bg-transparent px-3 py-3.5 text-center text-base font-semibold text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400 focus:bg-blue-50"
              />
            </div>
            <div className="flex items-center justify-center border-r border-white/25 bg-blue-600 px-3 py-3.5 text-base font-extrabold text-white">
              {grade.gpa4}
            </div>
            <div className="flex items-center justify-center bg-blue-600 px-3 py-3.5 text-base font-extrabold text-white">
              {grade.letter}
            </div>
          </div>
        </div>
      </div>

      {children}

      {/* ============ HUONG DAN ============ */}
      <section className="mt-12 rounded-2xl border border-blue-200 bg-white px-5 py-8 shadow-sm sm:px-8">
        <div className="text-center">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-blue-100">
            <Settings size={22} className="text-blue-600" />
          </span>
          <h3 className="mt-3 text-xl font-extrabold text-blue-600">Hướng dẫn sử dụng</h3>
          <p className="mt-1.5 text-sm text-slate-600">
            Quy đổi điểm hệ 10 sang hệ 4 và thang điểm chữ một cách chính xác
          </p>
        </div>

        <div className="relative mt-8 grid gap-8 pt-8 md:grid-cols-3">
          {/* Duong ke noi cac buoc, chay qua TAM cac vong tron so.
              Phan tu absolute dinh vi theo PADDING BOX cua khung cha, nen phai
              cong ca pt-8 (2rem) vao, khong thi duong ke nam lo lung phia tren. */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-[calc(2rem_+_18px)] hidden h-px bg-blue-600/30 md:block"
          />

          <Step n={1} title="Chọn thang điểm">
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Chọn cấu trúc thang điểm phù hợp với trường của bạn. Hệ thống hỗ trợ 3
              cấu trúc thang điểm phổ biến: (A+ A B+ B C+ C D+ D F),
              (A B+ B C+ C D+ D F), (A B C D F).
            </p>
          </Step>

          <Step n={2} title="Bảng quy đổi điểm">
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Điểm quy ra hệ 4 và hệ chữ theo thang điểm đã chọn:
            </p>
            <div className="mt-3">
              <GradeMappingTable scale={scale} />
            </div>
          </Step>

          <Step n={3} title="Nhập và quy đổi">
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Nhập điểm hệ 10 vào bảng, hệ thống sẽ tự động tính toán và quy đổi sang
              hệ 4 cùng thang điểm chữ ngay lập tức.
            </p>
          </Step>
        </div>
      </section>
    </>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="text-center">
      {/* relative de vong tron ve DE LEN duong ke, khong bi ke cat ngang */}
      <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
        {n}
      </span>
      <h4 className="mt-3 text-sm font-bold text-slate-900">{title}</h4>
      {children}
    </div>
  );
}
