"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { DocumentSummary, SharedDocument } from "@/src/services/document";
import TheTaiLieuDoc from "./TheTaiLieuDoc";

import styles from "./HangTaiLieu.module.scss";

/**
 * Mot hang tai lieu cuon ngang co nut trai / phai (kieu "Trending", "New").
 * Cuon bang thanh cuon that (scroll-snap) - vuot tay tren dien thoai van
 * chay; hai nut chi la loi tat cho chuot.
 */
export default function HangTaiLieu({
  id,
  tieuDe,
  phu,
  ds,
  chan = "luotTai",
  hanhDong,
}: {
  id: string;
  tieuDe: string;
  /** Dong nho canh tieu de, vd. ly do goi y. */
  phu?: string;
  ds: (DocumentSummary | SharedDocument)[];
  chan?: "luotTai" | "thoiGian" | "phoBien";
  /** Nut phu canh hai nut truot, vd. "Xóa lịch sử". */
  hanhDong?: ReactNode;
}) {
  const cuon = useRef<HTMLUListElement>(null);
  const [dauMut, setDauMut] = useState(true);
  const [cuoiMut, setCuoiMut] = useState(true);

  const doViTri = useCallback(() => {
    const el = cuon.current;
    if (!el) return;
    setDauMut(el.scrollLeft <= 4);
    setCuoiMut(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = cuon.current;
    if (!el) return;
    // Hoan mot vong microtask - tranh setState dong bo trong than effect.
    void Promise.resolve().then(doViTri);
    const ro = new ResizeObserver(doViTri);
    ro.observe(el);
    return () => ro.disconnect();
  }, [doViTri, ds.length]);

  const truot = (huong: 1 | -1) => {
    const el = cuon.current;
    if (!el) return;
    // Truot gan tron mot man, chua lai mot chut the cu de mat khong lac.
    el.scrollBy({ left: huong * el.clientWidth * 0.9, behavior: "smooth" });
  };

  if (!ds.length) return null;

  return (
    <section aria-labelledby={`hang-${id}`} className={styles.hang}>
      <div className={styles.dau}>
        <div className={styles.chuDau}>
          <h2 id={`hang-${id}`} className={styles.tieuDe}>
            {tieuDe}
          </h2>
          {phu && <p className={styles.phu}>{phu}</p>}
        </div>
        <div className={styles.nut}>
          {hanhDong}
          <button
            type="button"
            onClick={() => truot(-1)}
            disabled={dauMut}
            aria-label={`${tieuDe}: xem trước`}
            className={styles.nutTruot}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => truot(1)}
            disabled={cuoiMut}
            aria-label={`${tieuDe}: xem tiếp`}
            className={styles.nutTruot}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <ul
        ref={cuon}
        onScroll={doViTri}
        className={`${styles.ds} ${!cuoiMut ? styles.mo : ""}`}
        aria-labelledby={`hang-${id}`}
      >
        {ds.map((d) => (
          <li key={d._id} className={styles.muc}>
            <TheTaiLieuDoc doc={d} chan={chan} />
          </li>
        ))}
      </ul>
    </section>
  );
}
