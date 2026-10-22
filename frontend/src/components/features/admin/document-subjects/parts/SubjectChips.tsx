"use client";

import { useId, useState } from "react";
import { Plus, X } from "lucide-react";

import { ADMIN_DOCUMENT_SUBJECTS as C } from "@/src/constants/admin/document-subjects-page";

import { normName } from "../hooks/useDocumentCatalog";
import styles from "../AdminDocumentSubjects.module.scss";

const K = C.categories;
// Cung tran voi ten mon o backend (models/DocumentSubject.js).
const MAX_SUBJECT = 80;

/**
 * O nhap danh sach nganh dang the: go ten roi Enter (hoac dau phay, hoac nut
 * +), bam x de bo. Goi y la cac mon da co - chon lai mon cu thay vi go ra mot
 * ban trung khac dau.
 */
export default function SubjectChips({
  value,
  onChange,
  suggestions,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  suggestions: string[];
}) {
  const [draft, setDraft] = useState("");
  const listId = useId();

  const add = (raws: string[]) => {
    const next = [...value];
    for (const raw of raws) {
      const name = raw.trim().slice(0, MAX_SUBJECT);
      if (!name || next.some((x) => normName(x) === normName(name))) continue;
      next.push(name);
    }
    if (next.length !== value.length) onChange(next);
  };

  const commit = () => {
    add(draft.split(","));
    setDraft("");
  };

  const left = suggestions.filter((s) => !value.some((x) => normName(x) === normName(s)));

  return (
    <div className={styles.chipBox}>
      {value.length > 0 && (
        <ul className={styles.chips}>
          {value.map((name) => (
            <li key={name} className={styles.chip}>
              <span>{name}</span>
              <button
                type="button"
                onClick={() => onChange(value.filter((x) => x !== name))}
                aria-label={K.removeSubject(name)}
                className={styles.chipRemove}
              >
                <X size={12} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className={styles.chipInputRow}>
        <input
          value={draft}
          list={listId}
          onChange={(e) => {
            const v = e.target.value;
            if (v.includes(",")) {
              const parts = v.split(",");
              setDraft(parts.pop() ?? "");
              add(parts);
            } else {
              setDraft(v);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              // Enter o day KHONG duoc nop ca form them linh vuc.
              e.preventDefault();
              commit();
            } else if (e.key === "Backspace" && !draft && value.length) {
              onChange(value.slice(0, -1));
            }
          }}
          maxLength={MAX_SUBJECT + 5}
          placeholder={K.subjectPlaceholder}
          aria-label={K.subjects}
          className={styles.chipInput}
        />
        <datalist id={listId}>
          {left.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
        <button
          type="button"
          onClick={commit}
          disabled={!draft.trim()}
          className={styles.chipAdd}
          aria-label={K.addSubject}
          title={K.addSubject}
        >
          <Plus size={15} />
        </button>
      </div>
    </div>
  );
}
