"use client";

import { useEffect, useState } from "react";

import styles from "../CourseLearn.module.scss";

// Cac vi tri watermark nhay qua lai (phan tram khung phat). Danh sach co dinh
// thay vi Math.random() trong lan ve dau: ve tren may chu va trinh duyet phai
// ra cung mot ket qua.
const POSITIONS = [
  { top: 12, left: 8 },
  { top: 70, left: 58 },
  { top: 40, left: 30 },
  { top: 18, left: 62 },
  { top: 78, left: 10 },
  { top: 52, left: 70 },
];
const EVERY_MS = 7000;

/**
 * Watermark email + ma tai khoan chay tren khung phat video (10/10/2026).
 *
 * Khong chan duoc quay man hinh - viec do can DRM co phi (kieu Netflix). Thay
 * vao do ai quay roi dang len mang thi trong video co san danh tinh cua ho.
 * Doi cho moi vai giay de khong che mai mot goc ma cat bo duoc.
 */
export default function VideoWatermark({ label }: { label: string }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const h = setInterval(() => setI((n) => (n + 1) % POSITIONS.length), EVERY_MS);
    return () => clearInterval(h);
  }, []);

  const pos = POSITIONS[i];
  return (
    <span
      aria-hidden="true"
      className={styles.watermark}
      style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
    >
      {label}
    </span>
  );
}
