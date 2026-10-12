"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { DocumentSummary, SharedDocument } from "@/src/services/document";
import DocumentCard from "./DocumentCard";

import styles from "./DocumentShelf.module.scss";

/**
 * Mot hang tai lieu cuon ngang co nut trai / phai (kieu "Trending", "New").
 * Cuon bang thanh cuon that (scroll-snap) - vuot tay tren dien thoai van
 * chay; hai nut chi la loi tat cho chuot.
 */
export default function DocumentShelf({
  id,
  tieuDe: title,
  phu,
  ds: items,
  chan: block = "luotTai",
  actions,
}: {
  id: string;
  tieuDe: string;
  /** Dong nho canh tieu de, vd. ly do goi y. */
  phu?: string;
  ds: (DocumentSummary | SharedDocument)[];
  chan?: "luotTai" | "thoiGian" | "phoBien";
  /** Nut phu canh hai nut truot, vd. "Xóa lịch sử". */
  actions?: ReactNode;
}) {
  const scroll = useRef<HTMLUListElement>(null);
  const [startCap, setStartCap] = useState(true);
  const [endCap, setEndCap] = useState(true);

  const measurePosition = useCallback(() => {
    const el = scroll.current;
    if (!el) return;
    setStartCap(el.scrollLeft <= 4);
    setEndCap(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scroll.current;
    if (!el) return;
    // Hoan mot vong microtask - tranh setState dong bo trong than effect.
    void Promise.resolve().then(measurePosition);
    const ro = new ResizeObserver(measurePosition);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measurePosition, items.length]);

  const truot = (direction: 1 | -1) => {
    const el = scroll.current;
    if (!el) return;
    // Truot gan tron mot man, chua lai mot chut the cu de mat khong lac.
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: "smooth" });
  };

  if (!items.length) return null;

  return (
    <section aria-labelledby={`hang-${id}`} className={styles.hang}>
      <div className={styles.dau}>
        <div className={styles.firstLetter}>
          <h2 id={`hang-${id}`} className={styles.tieuDe}>
            {title}
          </h2>
          {phu && <p className={styles.phu}>{phu}</p>}
        </div>
        <div className={styles.button}>
          {actions}
          <button
            type="button"
            onClick={() => truot(-1)}
            disabled={startCap}
            aria-label={`${title}: xem trước`}
            className={styles.slideButton}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => truot(1)}
            disabled={endCap}
            aria-label={`${title}: xem tiếp`}
            className={styles.slideButton}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <ul
        ref={scroll}
        onScroll={measurePosition}
        className={`${styles.ds} ${!endCap ? styles.mo : ""}`}
        aria-labelledby={`hang-${id}`}
      >
        {items.map((d) => (
          <li key={d._id} className={styles.muc}>
            <DocumentCard doc={d} chan={block} />
          </li>
        ))}
      </ul>
    </section>
  );
}
