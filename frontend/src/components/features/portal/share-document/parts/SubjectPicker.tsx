"use client";

import { useState } from "react";
import { Check, Search } from "lucide-react";
import type { DocumentSubject } from "@/src/services/document";
import { MAX_SUBJECTS } from "@/src/lib/document/file-info";

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
  subjectList,
  chon: choice,
  toggleSelect,
  toiDa: max = MAX_SUBJECTS,
  labelId,
}: {
  subjectList: DocumentSubject[];
  chon: string[];
  toggleSelect: (keys: string[]) => void;
  toiDa?: number;
  /** id cua <label> dat ten cho nhom - cho trinh doc man hinh. */
  labelId?: string;
}) {
  const [query, setFilter] = useState("");
  const enough = choice.length >= max;

  const bat = (key: string) =>
    toggleSelect(
      choice.includes(key)
        ? choice.filter((k) => k !== key)
        : enough
          ? choice
          : [...choice, key],
    );

  // O loc chi hien khi danh sach dai - vai mon thi nhin la thay.
  const hasFilter = subjectList.length > 12;
  const filterText = query.trim().toLowerCase();
  const visible = filterText
    ? subjectList.filter(
        (m) => m.ten.toLowerCase().includes(filterText) || choice.includes(m.key),
      )
    : subjectList;

  if (!subjectList.length) {
    return (
      <p className={styles.trong}>
        Chưa có môn học nào. Quản trị viên cần thêm môn trước khi đăng tài liệu.
      </p>
    );
  }

  return (
    <div className={styles.khung}>
      {hasFilter && (
        <div className={styles.filterInput}>
          <Search size={14} />
          <input
            value={query}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Lọc môn học…"
            aria-label="Lọc môn học"
          />
        </div>
      )}
      <div className={styles.chips} role="group" aria-labelledby={labelId}>
        {visible.map((m) => {
          const selected = choice.includes(m.key);
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => bat(m.key)}
              aria-pressed={selected}
              disabled={!selected && enough}
              className={`${styles.chip} ${selected ? styles.chipActive : ""}`}
            >
              {selected && <Check size={13} />}
              <span>{m.ten}</span>
            </button>
          );
        })}
      </div>
      <p className={styles.ghiChu}>
        {enough
          ? `Đã chọn đủ ${max} môn. Bỏ một môn để chọn môn khác.`
          : `Đã chọn ${choice.length}/${max} môn.`}
      </p>
    </div>
  );
}
