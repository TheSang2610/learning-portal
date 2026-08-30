"use client";

import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";
import { STRUCTURES, SCALES, structureById, scaleById, gradeOf } from "./gradeScales";

export default function CalcPoint() {
  const [structureId, setStructureId] = useState("2");
  const [scaleId, setScaleId] = useState("0");
  const [scores, setScores] = useState<Record<number, string>>({});

  const structure = structureById(structureId);
  const scale = scaleById(scaleId);

  const total = useMemo(() => {
    // O trong tinh la 0, giong ban goc: chua nhap gi van hien 0.00 (F)
    let sum = 0;
    for (let i = 0; i < structure.weights.length; i++) {
      const raw = (scores[i] ?? "").replace(",", ".").trim();
      const v = raw === "" ? 0 : Number(raw);
      if (!Number.isFinite(v)) continue;
      sum += Math.min(10, Math.max(0, v)) * structure.weights[i];
    }
    return sum / 100;
  }, [scores, structure]);

  const grade = gradeOf(scale, total);

  // Doi cau truc: bo diem cua nhung o khong con ton tai
  const changeStructure = (id: string) => {
    const next = structureById(id);
    setScores((prev) => {
      const kept: Record<number, string> = {};
      for (let i = 0; i < next.weights.length; i++) {
        if (prev[i] !== undefined) kept[i] = prev[i];
      }
      return kept;
    });
    setStructureId(id);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-center gap-2 bg-blue-600 px-5 py-3">
        <Calculator size={17} className="text-white" />
        <h2 className="text-base font-bold text-white">Tính điểm tổng kết</h2>
      </div>

      {/* --- Hai o chon --- */}
      <div className="grid gap-5 px-5 py-5 sm:grid-cols-2">
        <div>
          <h4 className="mb-2 border-l-[3px] border-blue-600 pl-2 text-sm font-bold text-blue-600">
            Chọn cấu trúc điểm của môn học
          </h4>
          <select
            value={structureId}
            onChange={(e) => changeStructure(e.target.value)}
            className={selectCls}
          >
            {STRUCTURES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <h4 className="mb-2 border-l-[3px] border-blue-600 pl-2 text-sm font-bold text-blue-600">
            Chọn cấu trúc thang điểm
          </h4>
          <select
            value={scaleId}
            onChange={(e) => setScaleId(e.target.value)}
            className={selectCls}
          >
            {SCALES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* --- Bang nhap diem --- */}
      {/* Cuon ngang khi mang hinh hep: 5 cot khong the co lai vua dien thoai */}
      <div className="overflow-x-auto px-5 pb-6">
        <div
          className="grid min-w-[560px] overflow-hidden rounded-xl border border-blue-200"
          style={{
            gridTemplateColumns: `repeat(${structure.weights.length + 1}, minmax(0, 1fr))`,
          }}
        >
          {structure.weights.map((w, i) => (
            <div
              key={`h-${i}`}
              className="border-r border-white/25 bg-blue-600 px-3 py-2.5 text-center text-sm font-bold text-white"
            >
              Điểm {w}%
            </div>
          ))}
          <div className="bg-blue-700 px-3 py-2.5 text-center text-sm font-bold text-white">
            Tổng kết
          </div>

          {structure.weights.map((w, i) => (
            <div key={`i-${i}`} className="border-r border-blue-200 bg-white">
              <input
                type="number"
                min={0}
                max={10}
                step="0.1"
                value={scores[i] ?? ""}
                placeholder={`Điểm ${w}%`}
                aria-label={`Điểm thành phần hệ số ${w}%`}
                onChange={(e) =>
                  setScores((p) => ({ ...p, [i]: e.target.value }))
                }
                className="w-full bg-transparent px-3 py-3.5 text-center text-sm font-semibold text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400 focus:bg-blue-50"
              />
            </div>
          ))}

          <div className="flex items-center justify-center bg-blue-600 px-3 py-3.5">
            <span className="text-base font-extrabold text-white">
              {total.toFixed(2)} ({grade.letter})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const selectCls =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100";
