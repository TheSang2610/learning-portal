"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Landmark, Search } from "lucide-react";

import type { DocumentUniversity } from "@/src/services/document";
import { schoolPath } from "@/src/lib/document/paths";
import {
  stripAccents,
  initialLetter,
  mainSchoolName,
} from "@/src/lib/document/school-name";

import styles from "./InstitutionDirectory.module.scss";

const POPULAR_COUNT = 36;
const SUGGESTION_COUNT = 8;

/** Logo truong neu co, khong thi bieu tuong toa nha. */
function SchoolLogo({ t }: { t: DocumentUniversity }) {
  if (t.logo) {
    // background-image thay vi <img>: logo chi de trang tri canh ten truong
    // (ten da la chu doc duoc), va khong di qua bo toi uu anh cua Next.
    return (
      <span
        className={styles.logo}
        style={{ backgroundImage: `url("${t.logo}")` }}
        aria-hidden
      />
    );
  }
  return <Landmark size={18} className={styles.bieuTuong} aria-hidden />;
}

function SchoolRow({ t }: { t: DocumentUniversity }) {
  return (
    <li>
      <Link href={schoolPath(t.key)} className={styles.rows}>
        <SchoolLogo t={t} />
        <span className={styles.schoolName}>{t.ten}</span>
        {t.soTaiLieu > 0 && <span className={styles.so}>{t.soTaiLieu} tài liệu</span>}
      </Link>
    </li>
  );
}

/**
 * Trang danh sach truong (/share-document/institution): o tim truong co goi y,
 * "truong pho bien nhat" (nhieu tai lieu nhat truoc), va tra theo chu cai dau
 * cua TEN CHINH (bo "Truong Dai hoc", "Hoc vien"...).
 */
export default function InstitutionDirectory({
  schoolList,
}: {
  schoolList: DocumentUniversity[];
}) {
  const router = useRouter();
  const idDs = useId();
  const [keyword, setKeyword] = useState("");
  const [openSuggestions, setOpenSuggestions] = useState(false);
  const [activeAnchor, setActiveAnchor] = useState(-1);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  // Nhieu tai lieu nhat truoc; bang nhau thi theo thu tu admin dat.
  const popular = useMemo(
    () =>
      [...schoolList]
        .sort((a, b) => b.soTaiLieu - a.soTaiLieu || a.thuTu - b.thuTu)
        .slice(0, POPULAR_COUNT),
    [schoolList],
  );

  // Nhom theo chu cai dau, xep chu va ten theo tieng Viet.
  const byLetter = useMemo(() => {
    const m = new Map<string, DocumentUniversity[]>();
    for (const t of schoolList) {
      const c = initialLetter(t.ten);
      if (!m.has(c)) m.set(c, []);
      m.get(c)!.push(t);
    }
    for (const items of m.values()) {
      items.sort((a, b) =>
        mainSchoolName(a.ten).localeCompare(mainSchoolName(b.ten), "vi"),
      );
    }
    return m;
  }, [schoolList]);
  const allLetters = [...byLetter.keys()].sort((a, b) => a.localeCompare(b, "vi"));

  const suggest = useMemo(() => {
    const q = stripAccents(keyword.trim());
    if (!q) return [];
    return schoolList
      .filter((t) => stripAccents(t.ten).includes(q))
      .slice(0, SUGGESTION_COUNT);
  }, [keyword, schoolList]);

  const goToSchool = (t: DocumentUniversity) => router.push(schoolPath(t.key));

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggest.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpenSuggestions(true);
      setActiveAnchor((i) => (i + 1) % suggest.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveAnchor((i) => (i <= 0 ? suggest.length - 1 : i - 1));
    } else if (e.key === "Escape") {
      setOpenSuggestions(false);
    }
  };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Enter: truong dang tro, khong thi goi y dau tien.
    const choice = suggest[activeAnchor] ?? suggest[0];
    if (choice) goToSchool(choice);
  };

  const showSuggestions = openSuggestions && keyword.trim().length > 0;

  return (
    <>
      <section className={styles.dau}>
        <div className={styles.contentStart}>
          <span className={styles.illustration} aria-hidden />
          <h1 className={styles.tieuDe}>Bạn đang học ở trường nào?</h1>
          <p className={styles.explanation}>Tìm trường của bạn để xem tài liệu học tập</p>

          <form role="search" onSubmit={onSearch} className={styles.searchInput}>
            <input
              type="search"
              role="combobox"
              aria-label="Tìm trường đại học"
              aria-autocomplete="list"
              aria-expanded={showSuggestions}
              aria-controls={idDs}
              aria-activedescendant={
                activeAnchor >= 0 ? `${idDs}-${activeAnchor}` : undefined
              }
              autoComplete="off"
              placeholder="Gõ tên trường để tìm…"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setOpenSuggestions(true);
                setActiveAnchor(-1);
              }}
              onFocus={() => setOpenSuggestions(true)}
              // Tre mot nhip: bam vao goi y can click chay truoc khi danh sach an.
              onBlur={() => setTimeout(() => setOpenSuggestions(false), 150)}
              onKeyDown={onKeyDown}
              className={styles.nhap}
            />
            <button type="submit" aria-label="Tìm" className={styles.searchButton}>
              <Search size={18} />
            </button>

            {showSuggestions && (
              <div
                id={idDs}
                role="listbox"
                aria-label="Trường đại học"
                className={styles.suggest}
              >
                {suggest.length === 0 ? (
                  <p role="alert" className={styles.empty}>
                    Không tìm thấy trường nào
                  </p>
                ) : (
                  suggest.map((t, i) => (
                    <button
                      key={t._id}
                      id={`${idDs}-${i}`}
                      type="button"
                      role="option"
                      aria-selected={i === activeAnchor}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => goToSchool(t)}
                      className={`${styles.suggestionItem} ${i === activeAnchor ? styles.activeSuggestion : ""}`}
                    >
                      <SchoolLogo t={t} />
                      <span>{t.ten}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </form>
        </div>
      </section>

      {/* Nen trang tran ngang - layout chung cua khu portal la xam nhat. */}
      <div className={styles.nen}>
        <div className={styles.than}>
          <section aria-labelledby="truong-pho-bien">
            <h2 id="truong-pho-bien" className={styles.sectionTitle}>
              Trường đại học phổ biến nhất
            </h2>
            <ul className={styles.luoi}>
              {popular.map((t) => (
                <SchoolRow key={t._id} t={t} />
              ))}
            </ul>
          </section>

          <section aria-labelledby="truong-theo-chu" className={styles.letterItem}>
            <h2 id="truong-theo-chu" className={styles.sectionTitle}>
              Tài liệu theo tất cả các trường
            </h2>
            <p className={styles.phu}>Tìm trường theo chữ cái đầu</p>
            <div className={styles.letter} role="group" aria-label="Chữ cái đầu">
              {allLetters.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={activeLetter === c}
                  onClick={() => setActiveLetter((old) => (old === c ? null : c))}
                  className={`${styles.chu} ${activeLetter === c ? styles.filterLabel : ""}`}
                >
                  {c}
                </button>
              ))}
            </div>

            {activeLetter && (
              <ul
                className={`${styles.luoi} ${styles.letterGrid}`}
                aria-label={`Trường bắt đầu bằng ${activeLetter}`}
              >
                {(byLetter.get(activeLetter) ?? []).map((t) => (
                  <SchoolRow key={t._id} t={t} />
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
