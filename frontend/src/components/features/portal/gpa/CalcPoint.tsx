"use client";

import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";
import { STRUCTURES, SCALES, structureById, scaleById, gradeOf } from "./gradeScales";

import styles from "./CalcPoint.module.scss";
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
    <div className={styles.card}>
      <div className={styles.row}>
        <Calculator size={17} className={styles.box} />
        <h2 className={styles.heading}>Tính điểm tổng kết</h2>
      </div>

      {/* --- Hai o chon --- */}
      <div className={styles.grid}>
        <div>
          <h4 className={styles.minorHeading}>Chọn cấu trúc điểm của môn học</h4>
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
          <h4 className={styles.minorHeading}>Chọn cấu trúc thang điểm</h4>
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
      <div className={styles.scroller}>
        <div
          className={styles.grid2}
          style={{
            gridTemplateColumns: `repeat(${structure.weights.length + 1}, minmax(0, 1fr))`,
          }}
        >
          {structure.weights.map((w, i) => (
            <div key={`h-${i}`} className={styles.box2}>
              Điểm {w}%
            </div>
          ))}
          <div className={styles.box3}>Tổng kết</div>

          {structure.weights.map((w, i) => (
            <div key={`i-${i}`} className={styles.box4}>
              <input
                type="number"
                min={0}
                max={10}
                step="0.1"
                value={scores[i] ?? ""}
                placeholder={`Điểm ${w}%`}
                aria-label={`Điểm thành phần hệ số ${w}%`}
                onChange={(e) => setScores((p) => ({ ...p, [i]: e.target.value }))}
                className={styles.input}
              />
            </div>
          ))}

          <div className={styles.row2}>
            <span className={styles.label}>
              {total.toFixed(2)} ({grade.letter})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const selectCls = styles.card2;
