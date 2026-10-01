"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { ChevronRight, GraduationCap, ListChecks, Search } from "lucide-react";

import { DE_LUYEN_TAP, MON_HOC } from "./practiceData";

import styles from "./PracticeHome.module.scss";

// Hien san 8 mon nhu ban goc ("Xem them 30 mon"), con lai an sau nut.
const SO_MON_HIEN = 8;

// Mau vach cua the de xoay vong: the dau dung mau chu dao cua trang, nhu ban
// goc de the dau mang mau chu dao cua ho.
const MAU_THE = ["#155dfc", "#306da6"];

// So sanh khong phan biet dau va hoa thuong: go "co so du lieu" van ra "Cơ sở dữ liệu"
const boDau = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();

export default function PracticeHome() {
  const [tuKhoa, setTuKhoa] = useState("");
  // Mo trang la hien het de cua moi mon; bam mot mon thi loc theo mon do,
  // bam lai mon dang chon thi bo loc.
  const [monChon, setMonChon] = useState<string | null>(null);
  const [moRong, setMoRong] = useState(false);

  const tk = boDau(tuKhoa.trim());
  const monLoc = tk ? MON_HOC.filter((m) => boDau(m.ten).includes(tk)) : MON_HOC;
  const monHien = moRong || tk ? monLoc : monLoc.slice(0, SO_MON_HIEN);
  const conAn = monLoc.length - monHien.length;

  const mon = MON_HOC.find((m) => m.id === monChon);
  const tenMon = new Map(MON_HOC.map((m) => [m.id, m.ten]));
  // Chua chon mon: hien het de, co go tim thi loc theo ten mon hoac ten de
  const deHien = DE_LUYEN_TAP.filter((d) =>
    monChon
      ? d.monId === monChon
      : !tk ||
        boDau(tenMon.get(d.monId) ?? "").includes(tk) ||
        boDau(d.title).includes(tk),
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
        <span className={styles.heroBadge}>{MON_HOC.length} môn học</span>
      </section>

      <div className={styles.container}>
        {/* ============ TIM KIEM ============ */}
        <label className={styles.search}>
          <Search size={16} className={styles.searchIcon} aria-hidden="true" />
          <input
            type="search"
            value={tuKhoa}
            onChange={(e) => setTuKhoa(e.target.value)}
            placeholder="Tìm kiếm môn học..."
            aria-label="Tìm kiếm môn học"
            className={styles.searchInput}
          />
        </label>

        {/* ============ MON HOC ============ */}
        <section className={styles.khoi}>
          <h2 className={styles.tieuDe}>Môn học</h2>
          {monLoc.length === 0 ? (
            <p className={styles.trong}>Không có môn nào khớp “{tuKhoa.trim()}”.</p>
          ) : (
            <div className={styles.chips}>
              {monHien.map((m) => {
                const chon = m.id === monChon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    aria-pressed={chon}
                    onClick={() => setMonChon(chon ? null : m.id)}
                    className={chon ? `${styles.chip} ${styles.chipChon}` : styles.chip}
                    style={{ "--mau-mon": m.mau } as CSSProperties}
                  >
                    <span className={styles.chipVach} aria-hidden="true" />
                    <GraduationCap
                      size={17}
                      className={styles.chipIcon}
                      aria-hidden="true"
                    />
                    <span className={styles.chipTen}>{m.ten}</span>
                  </button>
                );
              })}
            </div>
          )}
          {!tk && (conAn > 0 || moRong) && (
            <button
              type="button"
              onClick={() => setMoRong((v) => !v)}
              className={styles.xemThem}
            >
              {moRong ? "Thu gọn" : `Xem thêm ${conAn} môn`}
            </button>
          )}
        </section>

        {/* ============ DE LUYEN TAP (tat ca, hoac cua mon dang chon) ============ */}
        <section className={styles.khoi}>
          <div className={styles.tieuDeDong}>
            <h2 className={styles.tieuDe}>
              {mon ? mon.ten : "Tất cả bài luyện tập"} ({deHien.length})
            </h2>
            {mon && (
              <button
                type="button"
                onClick={() => setMonChon(null)}
                className={styles.xemThem}
              >
                Xem tất cả
              </button>
            )}
          </div>
          {deHien.length === 0 ? (
            <p className={styles.trong}>
              {mon ? "Môn này chưa có đề luyện tập." : "Không có bài luyện tập nào khớp."}
            </p>
          ) : (
            <div className={styles.luoi}>
              {deHien.map((d, i) => (
                <Link
                  href={`/practice/${d.id}`}
                  key={d.id}
                  className={styles.the}
                  style={{ "--mau-mon": MAU_THE[i % MAU_THE.length] } as CSSProperties}
                >
                  <span className={styles.theVach} aria-hidden="true" />
                  <span className={styles.theThan}>
                    <span className={styles.theDau}>
                      <span className={styles.theMon}>{tenMon.get(d.monId)}</span>
                      <ChevronRight
                        size={20}
                        className={styles.theMui}
                        aria-hidden="true"
                      />
                    </span>
                    <h3 className={styles.theTen}>{d.title}</h3>
                    {d.description && <p className={styles.theMoTa}>{d.description}</p>}
                    <span className={styles.theSo}>
                      <span className={styles.theSoCau}>
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
