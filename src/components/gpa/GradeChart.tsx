"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Kieu duong lay theo bieu do ban goc; mau doi sang xanh cho dong bo voi
// phan con lai cua trang (blue-300 cho GPA hoc ky, blue-600 cho CPA).
const COLOR_GPA = "#93c5fd";
const COLOR_CPA = "#2563eb";

export interface ChartPoint {
  name: string;
  gpa: number | null;
  cpa: number | null;
}

export default function GradeChart({ data }: { data: ChartPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center text-sm text-slate-600">
        Thêm học kỳ và nhập điểm để xem biểu đồ GPA / CPA.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {/* Ban goc dat cung 900px. Dung ResponsiveContainer de tren dien thoai
          bieu do co lai thay vi tran ra ngoai man hinh. */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
          <XAxis dataKey="name" stroke="#666" tick={{ fontSize: 12, fill: "#666" }} />
          <YAxis stroke="#666" tick={{ fontSize: 12, fill: "#666" }} />
          <Tooltip formatter={(v) => (typeof v === "number" ? v.toFixed(2) : "--")} />
          <Legend verticalAlign="bottom" />
          <Line
            type="monotone"
            dataKey="gpa"
            name="Điểm GPA học kỳ"
            stroke={COLOR_GPA}
            strokeWidth={2}
            dot={{ r: 3, stroke: COLOR_GPA, strokeWidth: 1, fill: "#fff" }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="cpa"
            name="Điểm CPA"
            stroke={COLOR_CPA}
            strokeWidth={2}
            dot={{ r: 3, stroke: COLOR_CPA, strokeWidth: 1, fill: "#fff" }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
