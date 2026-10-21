"use client";

import { useState } from "react";
import { Plus, Star, X } from "lucide-react";

import { ADMIN_POST_CREATE as C } from "@/src/constants/admin/post-create-page";

import styles from "./TagInput.module.scss";

const K = C.classify;

interface TagInputProps {
  id: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions: string[];
}

/**
 * O nhap tag dang the (chip). Truoc day la mot o chu "cach nhau bang dau
 * phay": go thua dau phay ra tag rong, go "React" va "react" ra hai tag, va
 * khong nhin ra tag nao la tag chinh. Gio moi tag la mot the rieng, trung thi
 * bo qua, du 5 thi an o nhap.
 */
export default function TagInput({ id, tags, onChange, suggestions }: TagInputProps) {
  const [draft, setDraft] = useState("");
  const full = tags.length >= C.maxTags;

  // Them nhieu tag mot luc (dan "a, b, c" vao o). Tra ve so tag da them.
  const addMany = (raws: string[]) => {
    const next = [...tags];
    for (const raw of raws) {
      // Bo dau # o dau: nguoi viet hay go "#react" theo thoi quen mang xa hoi.
      const tag = raw.trim().replace(/^#+/, "").slice(0, K.tagMaxLength).trim();
      if (!tag || next.length >= C.maxTags) continue;
      if (next.some((t) => t.toLowerCase() === tag.toLowerCase())) continue;
      next.push(tag);
    }
    if (next.length !== tags.length) onChange(next);
  };

  const commitDraft = () => {
    addMany(draft.split(","));
    setDraft("");
  };

  const remove = (index: number) => onChange(tags.filter((_, i) => i !== index));

  const left = suggestions.filter(
    (s) => !tags.some((t) => t.toLowerCase() === s.toLowerCase()),
  );

  return (
    <div>
      <div className={styles.box}>
        {tags.length > 0 && (
          <ul className={styles.chips}>
            {tags.map((tag, i) => (
              <li
                key={tag}
                className={i === 0 ? styles.chipMain : styles.chip}
                title={i === 0 ? K.tagsMain : undefined}
              >
                {i === 0 && (
                  <Star size={12} className={styles.star} aria-label={K.tagsMain} />
                )}
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className={styles.chipRemove}
                  aria-label={K.tagsRemove(tag)}
                >
                  <X size={12} />
                </button>
              </li>
            ))}
          </ul>
        )}

        {full ? (
          <p className={styles.full}>{K.tagsFull}</p>
        ) : (
          <div className={styles.inputRow}>
            <input
              id={id}
              value={draft}
              onChange={(e) => {
                const v = e.target.value;
                // Dau phay = xong mot tag, ke ca khi dan ca chuoi "a, b, c" vao.
                if (v.includes(",")) {
                  const parts = v.split(",");
                  setDraft(parts.pop() ?? "");
                  addMany(parts);
                } else {
                  setDraft(v);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  // Enter o day KHONG duoc nop ca form bai viet.
                  e.preventDefault();
                  commitDraft();
                } else if (e.key === "Backspace" && !draft && tags.length) {
                  remove(tags.length - 1);
                }
              }}
              onBlur={() => draft.trim() && commitDraft()}
              placeholder={K.tagsPlaceholder}
              maxLength={K.tagMaxLength + 5}
              className={styles.input}
            />
            <button
              type="button"
              onClick={commitDraft}
              disabled={!draft.trim()}
              className={styles.add}
              aria-label={K.tagsAdd}
              title={K.tagsAdd}
            >
              <Plus size={16} />
            </button>
          </div>
        )}
      </div>

      <p className={styles.note}>{K.tagsNote}</p>

      {!full && left.length > 0 && (
        <div className={styles.suggest}>
          <p className={styles.suggestLabel}>{K.tagsSuggest}</p>
          <div className={styles.suggestList}>
            {left.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addMany([s])}
                className={styles.suggestItem}
              >
                <Plus size={12} /> {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
