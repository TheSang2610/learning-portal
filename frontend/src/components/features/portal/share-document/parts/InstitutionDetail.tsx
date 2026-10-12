"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Folder, Home, Landmark, Search, Upload } from "lucide-react";

import type { SchoolDetail, DocumentUniversity } from "@/src/services/document";
import { ICONS } from "./DocumentCategories";
import {
  HOME_PATH,
  SCHOOLS_PATH,
  schoolCategoryPath,
  allPath,
  schoolPath,
} from "@/src/lib/document/paths";
import DocumentShelves from "./DocumentShelves";
import { stripAccents, mainSchoolName } from "@/src/lib/document/school-name";

import styles from "./InstitutionDetail.module.scss";

// Tab "Pho bien" hien bay nhieu mon nhieu tai lieu nhat.
const POPULAR_COUNT = 30;
const POPULAR = "phoBien";

/**
 * Chu cai dau cua ten MON (khong bo tien to nhu ten truong - "Trường điện từ"
 * la ten mon). "Đ" rieng mot chu; so gom vao "0-9"; chu co dau quy ve chu goc.
 */
function subjectInitial(name: string): string {
  const c = name.trim().charAt(0).toUpperCase();
  if (c === "Đ") return "Đ";
  if (/[0-9]/.test(c)) return "0-9";
  return c.normalize("NFD").replace(/[̀-ͯ]/g, "") || "#";
}

/** Logo truong neu co, khong thi bieu tuong toa nha. */
function SchoolLogo({ t, lon = false }: { t: DocumentUniversity; lon?: boolean }) {
  if (t.logo) {
    return (
      <span
        className={`${styles.logo} ${lon ? styles.logoLon : ""}`}
        style={{ backgroundImage: `url("${t.logo}")` }}
        aria-hidden
      />
    );
  }
  return (
    <Landmark
      size={lon ? 30 : 18}
      className={lon ? styles.largeIcon : styles.bieuTuong}
      aria-hidden
    />
  );
}

/**
 * Trang mot truong (/share-document/institution/<khoa>):
 *   dai dau (ten truong + o tim mon trong truong), duong dan,
 *   mon hoc cua truong tra theo chu cai (bam vao = tai lieu mon do cua truong),
 *   goi y / noi bat / xem gan day / moi dang cua truong, truong khac.
 */
export default function InstitutionDetail({
  truong: school,
  monHoc: subject,
  linhVuc: field = [],
  truongKhac: otherSchools,
}: SchoolDetail) {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [tab, setTab] = useState(POPULAR);

  // Nhom mon theo chu cai dau, xep theo tieng Viet.
  const byLetter = useMemo(() => {
    const m = new Map<string, typeof subject>();
    for (const subjectItem of subject) {
      const c = subjectInitial(subjectItem.ten);
      if (!m.has(c)) m.set(c, []);
      m.get(c)!.push(subjectItem);
    }
    for (const items of m.values())
      items.sort((a, b) => a.ten.localeCompare(b.ten, "vi"));
    return m;
  }, [subject]);
  // "0-9" xep cuoi nhu ban mau tham chieu.
  const allLetters = [...byLetter.keys()].sort((a, b) =>
    a === "0-9" ? 1 : b === "0-9" ? -1 : a.localeCompare(b, "vi"),
  );

  const q = stripAccents(keyword.trim());
  const searching = q.length > 0;
  const visible = searching
    ? subject.filter((m) => stripAccents(m.ten).includes(q))
    : tab === POPULAR
      ? subject.slice(0, POPULAR_COUNT)
      : (byLetter.get(tab) ?? []);

  // _id linh vuc -> khoa, de dua link mon vao trang linh vuc cua truong.
  const groupKey = new Map(field.map((n) => [n._id, n.key]));
  const subjectPath = (m: (typeof subject)[number]) => {
    const group = m.nhom ? groupKey.get(m.nhom) : undefined;
    return group
      ? schoolCategoryPath(school.key, group, { mon: m.key })
      : allPath({ truong: school.key, mon: m.key });
  };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searching) return;
    // Trung dung mot mon thi vao thang mon do; khong thi tim chu trong tai lieu
    // cua truong - nguoi dung co the dang go ten tai lieu chu khong phai ten mon.
    router.push(
      visible.length === 1
        ? subjectPath(visible[0])
        : allPath({ truong: school.key, q: keyword }),
    );
  };

  return (
    <>
      <section className={styles.dau}>
        {/* Hinh trang tri - cac dom mau cua khu tai lieu. */}
        <span className={`${styles.dom} ${styles.dom1}`} aria-hidden />
        <span className={`${styles.dom} ${styles.dom2}`} aria-hidden />
        <span className={`${styles.dom} ${styles.dom3}`} aria-hidden />
        <span className={`${styles.dom} ${styles.dom4}`} aria-hidden />
        <span className={`${styles.dom} ${styles.dom5}`} aria-hidden />
        <span className={`${styles.dom} ${styles.dom6}`} aria-hidden />

        <div className={styles.contentStart}>
          <span className={styles.oLogo}>
            <SchoolLogo t={school} lon />
          </span>
          <h1 className={styles.tieuDe}>{school.ten}</h1>
          <p className={styles.figures}>
            <strong>{school.soTaiLieu}</strong> tài liệu &middot;{" "}
            <strong>{subject.length}</strong> môn học
          </p>

          <form role="search" onSubmit={onSearch} className={styles.searchInput}>
            <Search size={18} className={styles.searchIcon} aria-hidden />
            <input
              type="search"
              aria-label="Tìm môn học trong trường này"
              placeholder="Tìm môn học trong trường này…"
              autoComplete="off"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className={styles.nhap}
            />
          </form>
        </div>
      </section>

      <div className={styles.nen}>
        <div className={styles.than}>
          <nav aria-label="Đường dẫn" className={styles.duongDan}>
            <Link href={HOME_PATH} aria-label="Chia sẻ tài liệu">
              <Home size={15} />
            </Link>
            <ChevronRight size={14} aria-hidden />
            <Link href={SCHOOLS_PATH}>Trường đại học</Link>
            <ChevronRight size={14} aria-hidden />
            <span aria-current="page" className={styles.currentPath}>
              {school.ten}
            </span>
          </nav>

          {/* ================================================ danh muc (linh vuc) */}
          {field.length > 0 && (
            <section aria-labelledby="danh-muc-truong" className={styles.muc}>
              <h2 id="danh-muc-truong" className={styles.sectionTitle}>
                Danh mục môn học
              </h2>
              <ul className={styles.categoryGrid}>
                {field.map((n) => {
                  const icon = ICONS[n.bieuTuong] ?? ICONS.sach;
                  return (
                    <li key={n._id}>
                      <Link
                        href={schoolCategoryPath(school.key, n.key)}
                        className={styles.category}
                      >
                        <span
                          className={`${styles.iconCell} ${styles[icon.mau]}`}
                          aria-hidden
                        >
                          <icon.Icon size={22} />
                        </span>
                        <span className={styles.categoryLabel}>
                          <span className={styles.categoryName}>{n.ten}</span>
                          <span className={styles.categorySub}>
                            {n.soMon} môn · {n.soTaiLieu} tài liệu
                          </span>
                        </span>
                        <ChevronRight size={18} className={styles.arrow} aria-hidden />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* ================================================ mon hoc */}
          <section aria-labelledby="mon-cua-truong" className={styles.muc}>
            <div className={styles.titleRow}>
              <h2 id="mon-cua-truong" className={styles.sectionTitle}>
                Môn học ({subject.length})
              </h2>
              {school.soTaiLieu > 0 && (
                <Link href={allPath({ truong: school.key })} className={styles.viewAll}>
                  Xem tất cả tài liệu của trường
                  <ChevronRight size={16} aria-hidden />
                </Link>
              )}
            </div>

            {subject.length === 0 ? (
              <div className={styles.trong}>
                <span className={styles.inShape} aria-hidden />
                <p className={styles.inTitle}>Chưa có tài liệu nào của trường này</p>
                <p>
                  Bạn học ở {school.ten}? Hãy là người đầu tiên chia sẻ đề cương, đề thi
                  hoặc bài giải cho các bạn cùng trường.
                </p>
                <Link
                  href={allPath({ truong: school.key, dang: true })}
                  className={styles.uploadButton}
                >
                  <Upload size={16} aria-hidden />
                  Chia sẻ tài liệu đầu tiên
                </Link>
              </div>
            ) : (
              <>
                {!searching && (
                  <div
                    className={styles.letter}
                    role="group"
                    aria-label="Lọc môn theo chữ cái đầu"
                  >
                    {[POPULAR, ...allLetters].map((c) => (
                      <button
                        key={c}
                        type="button"
                        aria-pressed={tab === c}
                        onClick={() => setTab(c)}
                        className={`${styles.chu} ${tab === c ? styles.filterLabel : ""}`}
                      >
                        {c === POPULAR ? "Phổ biến" : c}
                      </button>
                    ))}
                  </div>
                )}
                {searching && (
                  <p className={styles.searchResults} role="status">
                    {visible.length
                      ? `${visible.length} môn khớp "${keyword.trim()}"`
                      : `Không có môn nào khớp "${keyword.trim()}" - nhấn Enter để tìm trong tài liệu của trường.`}
                  </p>
                )}

                <ul className={styles.subjectList}>
                  {visible.map((m) => (
                    <li key={m.key}>
                      <Link href={subjectPath(m)} className={styles.mon}>
                        <Folder size={22} className={styles.subjectIcon} aria-hidden />
                        <span className={styles.subjectLabel}>
                          <span className={styles.subjectName}>{m.ten}</span>
                          <span className={styles.subjectSub}>
                            {m.soTaiLieu ? `${m.soTaiLieu} tài liệu` : "Chưa có tài liệu"}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          {/* ================================================ cac hang: goi y, noi bat, xem gan day, moi dang */}
          <DocumentShelves
            query={{ truong: school.key }}
            scopeName={mainSchoolName(school.ten)}
          />

          {/* ================================================ truong khac */}
          {otherSchools.length > 0 && (
            <section aria-labelledby="truong-khac" className={styles.muc}>
              <div className={styles.titleRow}>
                <h2 id="truong-khac" className={styles.sectionTitle}>
                  Trường khác
                </h2>
                <Link href={SCHOOLS_PATH} className={styles.viewAll}>
                  Tất cả trường
                  <ChevronRight size={16} aria-hidden />
                </Link>
              </div>
              <ul className={styles.schoolList}>
                {otherSchools.map((t) => (
                  <li key={t._id}>
                    <Link href={schoolPath(t.key)} className={styles.truong}>
                      <SchoolLogo t={t} />
                      <span className={styles.schoolName}>{t.ten}</span>
                      {t.soTaiLieu > 0 && (
                        <span className={styles.soTruong}>{t.soTaiLieu} tài liệu</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
