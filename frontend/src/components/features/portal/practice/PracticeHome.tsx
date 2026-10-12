"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { ChevronRight, GraduationCap, ListChecks, Search } from "lucide-react";

import { PRACTICE_QUIZZES, SUBJECTS } from "./practiceData";

import styles from "./PracticeHome.module.scss";

// Hien san 8 mon nhu ban goc ("Xem them 30 mon"), con lai an sau nut.
const VISIBLE_SUBJECTS = 8;

// Mau vach cua the de xoay vong: the dau dung mau chu dao cua trang, nhu ban
// goc de the dau mang mau chu dao cua ho.
const CARD_COLORS = ["#155dfc", "#306da6"];

// So sanh khong phan biet dau va hoa thuong: go "co so du lieu" van ra "Cơ sở dữ liệu"
const stripAccents = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();

export default function PracticeHome() {
  const [keyword, setKeyword] = useState("");
  // Mo trang la hien het de cua moi mon; bam mot mon thi loc theo mon do,
  // bam lai mon dang chon thi bo loc.
  const [pickedSubject, setPickedSubject] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const tk = stripAccents(keyword.trim());
  const subjectFilter = tk
    ? SUBJECTS.filter((m) => stripAccents(m.ten).includes(tk))
    : SUBJECTS;
  const visibleSubjects =
    expanded || tk ? subjectFilter : subjectFilter.slice(0, VISIBLE_SUBJECTS);
  const stillHidden = subjectFilter.length - visibleSubjects.length;

  const subjectItem = SUBJECTS.find((m) => m.id === pickedSubject);
  const subjectName = new Map(SUBJECTS.map((m) => [m.id, m.ten]));
  // Chua chon mon: hien het de, co go tim thi loc theo ten mon hoac ten de
  const visibleQuizzes = PRACTICE_QUIZZES.filter((d) =>
    pickedSubject
      ? d.subjectId === pickedSubject
      : !tk ||
        stripAccents(subjectName.get(d.subjectId) ?? "").includes(tk) ||
        stripAccents(d.title).includes(tk),
  );

  return (
    <div className={styles.page}>
      {/* ============ MO DAU ============ */}
      <section className={styles.hero}>
        <span className={styles.heroBong} aria-hidden="true" />
        <span className={styles.heroBong2} aria-hidden="true" />
        <span className={styles.heroIcon} aria-hidden="true">
          <GraduationCap />
        </span>
        <h1 className={styles.heroTitle}>Ôn thi trắc nghiệm LMS</h1>
        <p className={styles.heroSub}>Luyện tập mỗi ngày – tự tin thi cử</p>
        <span className={styles.heroBadge}>{SUBJECTS.length} môn học</span>
      </section>

      <div className={styles.container}>
        {/* ============ TIM KIEM ============ */}
        <label className={styles.search}>
          <Search size={16} className={styles.searchIcon} aria-hidden="true" />
          <input
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm kiếm môn học..."
            aria-label="Tìm kiếm môn học"
            className={styles.searchInput}
          />
        </label>

        {/* ============ MON HOC ============ */}
        <section className={styles.khoi}>
          <h2 className={styles.tieuDe}>Môn học</h2>
          {subjectFilter.length === 0 ? (
            <p className={styles.trong}>Không có môn nào khớp “{keyword.trim()}”.</p>
          ) : (
            <div className={styles.chips}>
              {visibleSubjects.map((m) => {
                const choice = m.id === pickedSubject;
                return (
                  <button
                    key={m.id}
                    type="button"
                    aria-pressed={choice}
                    onClick={() => setPickedSubject(choice ? null : m.id)}
                    className={
                      choice ? `${styles.chip} ${styles.selectedChip}` : styles.chip
                    }
                    style={{ "--mau-mon": m.mau } as CSSProperties}
                  >
                    <span className={styles.chipDivider} aria-hidden="true" />
                    <GraduationCap
                      size={17}
                      className={styles.chipIcon}
                      aria-hidden="true"
                    />
                    <span className={styles.chipLabel}>{m.ten}</span>
                  </button>
                );
              })}
            </div>
          )}
          {!tk && (stillHidden > 0 || expanded) && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className={styles.viewMore}
            >
              {expanded ? "Thu gọn" : `Xem thêm ${stillHidden} môn`}
            </button>
          )}
        </section>

        {/* ============ DE LUYEN TAP (tat ca, hoac cua mon dang chon) ============ */}
        <section className={styles.khoi}>
          <div className={styles.rowTitle}>
            <h2 className={styles.tieuDe}>
              {subjectItem ? subjectItem.ten : "Tất cả bài luyện tập"} (
              {visibleQuizzes.length})
            </h2>
            {subjectItem && (
              <button
                type="button"
                onClick={() => setPickedSubject(null)}
                className={styles.viewMore}
              >
                Xem tất cả
              </button>
            )}
          </div>
          {visibleQuizzes.length === 0 ? (
            <p className={styles.trong}>
              {subjectItem
                ? "Môn này chưa có đề luyện tập."
                : "Không có bài luyện tập nào khớp."}
            </p>
          ) : (
            <div className={styles.luoi}>
              {visibleQuizzes.map((d, i) => (
                <Link
                  href={`/practice/${d.id}`}
                  key={d.id}
                  className={styles.the}
                  style={
                    { "--mau-mon": CARD_COLORS[i % CARD_COLORS.length] } as CSSProperties
                  }
                >
                  <span className={styles.dividerCard} aria-hidden="true" />
                  <span className={styles.cardBody}>
                    <span className={styles.firstCard}>
                      <span className={styles.subjectCard}>
                        {subjectName.get(d.subjectId)}
                      </span>
                      <ChevronRight
                        size={20}
                        className={styles.cardTip}
                        aria-hidden="true"
                      />
                    </span>
                    <h3 className={styles.nameCard}>{d.title}</h3>
                    {d.description && (
                      <p className={styles.cardDescription}>{d.description}</p>
                    )}
                    <span className={styles.numberCard}>
                      <span className={styles.questionCountCard}>
                        <ListChecks size={14} aria-hidden="true" />
                        {d.soCau} câu
                      </span>
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
