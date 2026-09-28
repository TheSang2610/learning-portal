"use client";

import { useState } from "react";
import { Check, Search } from "lucide-react";
import type { DocumentSubject } from "@/src/services/document";
import { SO_MON_TOI_DA } from "./fileInfo";

import styles from "./SubjectPicker.module.scss";

/**
 * Chon NHIEU mon hoc cho mot tai lieu (vd. "Toán", "Toán cao cấp", "Toán rời
 * rạc") - bam the de bat / tat.
 *
 * Gia tri la mang KHOA mon (DocumentSubject.key), dung thu tu nguoi dung bam.
 * Du toi da thi cac the chua chon bi khoa lai, kem mot dong noi ro vi sao -
 * khong de nguoi dung bam ma khong thay gi xay ra.
 */
export default function SubjectPicker({
  dsMon,
  chon,
  doiChon,
  toiDa = SO_MON_TOI_DA,
  idNhan,
}: {
  dsMon: DocumentSubject[];
  chon: string[];
  doiChon: (keys: string[]) => void;
  toiDa?: number;
  /** id cua <label> dat ten cho nhom - cho trinh doc man hinh. */
  idNhan?: string;
}) {
  const [loc, setLoc] = useState("");
  const du = chon.length >= toiDa;

  const bat = (key: string) =>
    doiChon(
      chon.includes(key) ? chon.filter((k) => k !== key) : du ? chon : [...chon, key],
    );

  // O loc chi hien khi danh sach dai - vai mon thi nhin la thay.
  const coLoc = dsMon.length > 12;
  const tuLoc = loc.trim().toLowerCase();
  const hien = tuLoc
    ? dsMon.filter((m) => m.ten.toLowerCase().includes(tuLoc) || chon.includes(m.key))
    : dsMon;

  if (!dsMon.length) {
    return (
      <p className={styles.trong}>
        Chưa có môn học nào. Quản trị viên cần thêm môn trước khi đăng tài liệu.
      </p>
    );
  }

  return (
    <div className={styles.khung}>
      {coLoc && (
        <div className={styles.oLoc}>
          <Search size={14} />
          <input
            value={loc}
            onChange={(e) => setLoc(e.target.value)}
            placeholder="Lọc môn học…"
            aria-label="Lọc môn học"
          />
        </div>
      )}
      <div className={styles.chips} role="group" aria-labelledby={idNhan}>
        {hien.map((m) => {
          const dangChon = chon.includes(m.key);
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => bat(m.key)}
              aria-pressed={dangChon}
              disabled={!dangChon && du}
              className={`${styles.chip} ${dangChon ? styles.chipOn : ""}`}
            >
              {dangChon && <Check size={13} />}
              {m.ten}
            </button>
          );
        })}
      </div>
      <p className={styles.ghiChu}>
        {du
          ? `Đã chọn đủ ${toiDa} môn. Bỏ một môn để chọn môn khác.`
          : `Đã chọn ${chon.length}/${toiDa} môn.`}
      </p>
    </div>
  );
}
