"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useStoredUser } from "@/src/hooks/userStore";
import { fillTemplate } from "@/src/lib/format";
import {
  getCourseSuggestions,
  getRecentlyViewedCourses,
  type ExploreCourse,
} from "@/src/services/course";
import type { HomeExploreData } from "@/src/types/home";

import CourseListCard from "./parts/CourseListCard";
import styles from "./HomeExplore.module.scss";

/** So the moi cot. */
const PER_PANEL = 3;

type Panel = {
  id: "recent" | "similar" | "trending";
  title: string;
  /** null = dang tai. */
  items: ExploreCourse[] | null;
};

/**
 * "Tiep tuc kham pha" o dashboard - ba cot cuon ngang (Xem gan day / Tuong tu
 * hoat dong cua ban / Dang thinh hanh), bo cuc va chuyen dong theo muc
 * "Resume your exploration" cua Coursera: cot nen xanh nhat, the trang bo goc,
 * nut Truoc/Sau tron o hai mep, cuon muot va bam nhip theo tung cot.
 *
 * "Dang thinh hanh" lay san o may chu (trang dem 60 giay). Hai cot kia la du
 * lieu rieng cua nguoi xem nen goi o trinh duyet.
 */
export default function HomeExplore({
  trending,
  ...t
}: HomeExploreData & { trending: ExploreCourse[] }) {
  const user = useStoredUser();
  const [recent, setRecent] = useState<ExploreCourse[] | null>(null);
  const [similar, setSimilar] = useState<ExploreCourse[] | null>(null);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    getRecentlyViewedCourses(PER_PANEL)
      .then((r) => alive && setRecent(r?.danhSach ?? []))
      .catch(() => alive && setRecent([]));
    getCourseSuggestions(PER_PANEL)
      .then((r) => alive && setSimilar(r?.danhSach ?? []))
      .catch(() => alive && setSimilar([]));
    return () => {
      alive = false;
    };
  }, [user]);

  // ---- carousel: hien nut nao tuy con cuon duoc ve phia nao
  const trackRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const updateEdges = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setEdges({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateEdges);
    ro.observe(el);
    el.addEventListener("scroll", updateEdges, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", updateEdges);
    };
  }, [updateEdges]);

  const scrollByPanel = (dir: 1 | -1) => {
    const el = trackRef.current;
    const panel = el?.querySelector<HTMLElement>("[data-panel]");
    if (!el || !panel) return;
    el.scrollBy({ left: dir * (panel.offsetWidth + 24), behavior: "smooth" });
  };

  const panels: Panel[] = [
    { id: "recent", title: t.panels.recent, items: recent },
    { id: "similar", title: t.panels.similar, items: similar },
    { id: "trending", title: t.panels.trending, items: trending.slice(0, PER_PANEL) },
  ];

  return (
    <section className={styles.section} aria-labelledby="home-explore-heading">
      <div className={styles.container}>
        <h2 id="home-explore-heading" className={styles.heading}>
          {t.heading}
        </h2>

        <div className={styles.carousel}>
          <div ref={trackRef} className={styles.track} role="list">
            {panels.map((p) => (
              <div key={p.id} role="listitem" data-panel className={styles.panel}>
                <h3 className={styles.panelTitle}>{p.title}</h3>

                {p.items === null ? (
                  <ul className={styles.rows} aria-busy="true">
                    {Array.from({ length: PER_PANEL }, (_, i) => (
                      <li key={i} className={styles.skeleton} />
                    ))}
                  </ul>
                ) : p.items.length === 0 ? (
                  <div className={styles.empty}>
                    <p>{p.id === "recent" ? t.recentEmpty : t.empty}</p>
                    {p.id === "recent" && (
                      <Link href={t.recentEmptyCta.href} className={styles.emptyLink}>
                        {t.recentEmptyCta.label}
                      </Link>
                    )}
                  </div>
                ) : (
                  <ul className={styles.rows}>
                    {p.items.map((k, i) => (
                      <CourseListCard
                        key={k._id}
                        course={k}
                        href={fillTemplate(t.courseHref, { slug: k.slug })}
                        index={i}
                        labels={{ free: t.free }}
                      />
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scrollByPanel(-1)}
            className={`${styles.arrow} ${styles.arrowPrev} ${
              edges.start ? styles.arrowHidden : ""
            }`}
            aria-label={t.prev}
            tabIndex={edges.start ? -1 : 0}
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            onClick={() => scrollByPanel(1)}
            className={`${styles.arrow} ${styles.arrowNext} ${
              edges.end ? styles.arrowHidden : ""
            }`}
            aria-label={t.next}
            tabIndex={edges.end ? -1 : 0}
          >
            <ChevronRight size={22} />
          </button>
        </div>
      </div>
    </section>
  );
}
