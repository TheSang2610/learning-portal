"use client";

import { useMemo, useState } from "react";
import type { ActivityDay } from "@/src/services/userApi";

// Ve bang SVG thay vi dung thu vien lich (cal-heatmap keo theo d3 ~250KB).
// Ca bieu do chi la mot luoi 53x7 hinh vuong - khong dang them phu thuoc.

const CELL = 11;
const GAP = 3;
const PITCH = CELL + GAP;
const LEFT_LABEL = 30; // cho nhan Mon / Wed / Fri
const TOP_LABEL = 18;  // cho nhan thang

// 5 muc nhu anh mau: trong -> dam dan
const LEVEL_COLORS = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"];

const MONTHS_VI = [
  "Th1", "Th2", "Th3", "Th4", "Th5", "Th6",
  "Th7", "Th8", "Th9", "Th10", "Th11", "Th12",
];

const dayKey = (d: Date) => {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};

const shift = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

interface Props {
  days: ActivityDay[];
  total: number;
}

export default function ActivityHeatmap({ days, total }: Props) {
  const [hover, setHover] = useState<{ x: number; y: number; day: ActivityDay | null; date: string } | null>(null);

  const { weeks, monthLabels, width, height } = useMemo(() => {
    const byDate = new Map(days.map((d) => [d.date, d]));

    // Nguong chia muc: dua theo ngay ban ron nhat, de bieu do khong bi
    // toan mot mau khi so lieu con it.
    const max = days.reduce((m, d) => Math.max(m, d.count), 0);
    const levelOf = (c: number) => {
      if (c <= 0) return 0;
      if (max <= 4) return Math.min(4, c);
      return Math.min(4, Math.ceil((c / max) * 4));
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Bat dau tu Chu Nhat cua tuan chua ngay "12 thang truoc"
    const start = shift(today, -364);
    start.setDate(start.getDate() - start.getDay());

    const cols: { date: string; level: number; day: ActivityDay | null; inRange: boolean }[][] = [];
    const labels: { x: number; text: string }[] = [];
    let lastMonth = -1;

    let cursor = new Date(start);
    let col = 0;
    while (cursor <= today) {
      const week: typeof cols[number] = [];
      for (let row = 0; row < 7; row++) {
        const cellDate = shift(cursor, row);
        const key = dayKey(cellDate);
        const rec = byDate.get(key) || null;
        week.push({
          date: key,
          level: rec ? levelOf(rec.count) : 0,
          day: rec,
          inRange: cellDate <= today,
        });
      }

      // Nhan thang dat o cot dau tien cua thang do
      const m = cursor.getMonth();
      if (m !== lastMonth) {
        labels.push({ x: col * PITCH, text: MONTHS_VI[m] });
        lastMonth = m;
      }

      cols.push(week);
      cursor = shift(cursor, 7);
      col++;
    }

    return {
      weeks: cols,
      monthLabels: labels,
      width: LEFT_LABEL + cols.length * PITCH,
      height: TOP_LABEL + 7 * PITCH,
    };
  }, [days]);

  const fmtDate = (iso: string) => {
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-bold text-slate-900">
        {total} hoạt động trong 12 tháng qua
      </h3>

      {/* Bieu do rong hon man hinh dien thoai -> cuon ngang trong khung rieng */}
      <div className="relative overflow-x-auto pb-1">
        <svg width={width} height={height} role="img" aria-label={`Biểu đồ hoạt động: ${total} hoạt động trong 12 tháng qua`}>
          {monthLabels.map((l) => (
            <text
              key={l.text + l.x}
              x={LEFT_LABEL + l.x}
              y={11}
              className="fill-slate-600"
              style={{ fontSize: 10 }}
            >
              {l.text}
            </text>
          ))}

          {/* Chi ghi Mon/Wed/Fri nhu bieu do goc, ghi het 7 dong se roi */}
          {[
            { row: 1, text: "T2" },
            { row: 3, text: "T4" },
            { row: 5, text: "T6" },
          ].map((r) => (
            <text
              key={r.text}
              x={0}
              y={TOP_LABEL + r.row * PITCH + CELL - 2}
              className="fill-slate-600"
              style={{ fontSize: 10 }}
            >
              {r.text}
            </text>
          ))}

          {weeks.map((week, ci) =>
            week.map((cell, ri) => {
              if (!cell.inRange) return null;
              return (
                <rect
                  key={cell.date}
                  x={LEFT_LABEL + ci * PITCH}
                  y={TOP_LABEL + ri * PITCH}
                  width={CELL}
                  height={CELL}
                  rx={2}
                  ry={2}
                  fill={LEVEL_COLORS[cell.level]}
                  stroke="rgba(27,31,35,0.06)"
                  onMouseEnter={(e) =>
                    setHover({
                      x: e.currentTarget.getBoundingClientRect().left,
                      y: e.currentTarget.getBoundingClientRect().top,
                      day: cell.day,
                      date: cell.date,
                    })
                  }
                  onMouseLeave={() => setHover(null)}
                />
              );
            })
          )}
        </svg>

        {hover && (
          <div
            className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg"
            style={{ left: hover.x + CELL / 2, top: hover.y - 6 }}
          >
            {hover.day
              ? `${hover.day.count} hoạt động ngày ${fmtDate(hover.date)}`
              : `Không có hoạt động ngày ${fmtDate(hover.date)}`}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-end gap-1.5 text-xs text-slate-600">
        <span>Ít hơn</span>
        {LEVEL_COLORS.map((c) => (
          <span
            key={c}
            className="inline-block rounded-sm"
            style={{ width: CELL, height: CELL, background: c, border: "1px solid rgba(27,31,35,0.06)" }}
          />
        ))}
        <span>Nhiều hơn</span>
      </div>
    </div>
  );
}
