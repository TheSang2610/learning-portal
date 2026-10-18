"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

import { ADMIN_DASHBOARD as C } from "@/src/constants/admin/dashboard-page";
import type { DashboardDay } from "@/src/services/adminService";

import styles from "../AdminDashboard.module.scss";

const COLORS = { enrollments: "#171717", users: "#a3a3a3" } as const;
const SERIES = ["enrollments", "users"] as const;

const shortDate = (d: string) => {
  const [, m, day] = d.split("-");
  return `${day}/${m}`;
};

/** Bieu do vung hai chuoi + nut chon khoang (kieu ChartAreaInteractive cua shadcn). */
export default function ActivityChart({ days }: { days: DashboardDay[] }) {
  const [range, setRange] = useState<number>(C.chart.ranges[0].days);
  const data = days.slice(-range);

  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <div>
          <h2 className={styles.panelTitle}>{C.chart.title}</h2>
          <p className={styles.panelDesc}>{C.chart.description}</p>
        </div>
        <div className={styles.toggle} role="group" aria-label={C.chart.title}>
          {C.chart.ranges.map((r) => (
            <button
              key={r.days}
              type="button"
              onClick={() => setRange(r.days)}
              className={`${styles.toggleItem} ${range === r.days ? styles.toggleActive : ""}`}
              aria-pressed={range === r.days}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.legend}>
        {SERIES.map((k) => (
          <span key={k}>
            <i style={{ background: COLORS[k] }} />
            {C.chart.series[k]}
          </span>
        ))}
      </div>

      <div className={styles.chart}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
            <defs>
              {SERIES.map((k) => (
                <linearGradient key={k} id={`fill-${k}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS[k]} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={COLORS[k]} stopOpacity={0.03} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} stroke="#e5e5e5" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={shortDate}
              tick={{ fontSize: 12, fill: "#737373" }}
            />
            <Tooltip
              cursor={{ stroke: "#d4d4d4" }}
              labelFormatter={(d) => shortDate(String(d))}
              formatter={(v, name) => [
                v,
                C.chart.series[name as (typeof SERIES)[number]] ?? name,
              ]}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e5e5e5",
                fontSize: 13,
                boxShadow: "0 4px 12px rgb(0 0 0 / 0.08)",
              }}
            />
            <Area
              dataKey="users"
              type="monotone"
              fill="url(#fill-users)"
              stroke={COLORS.users}
              strokeWidth={1.5}
              stackId="a"
            />
            <Area
              dataKey="enrollments"
              type="monotone"
              fill="url(#fill-enrollments)"
              stroke={COLORS.enrollments}
              strokeWidth={1.5}
              stackId="a"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
