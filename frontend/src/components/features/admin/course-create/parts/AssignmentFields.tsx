"use client";

import { useState } from "react";
import { Building2, Check, Plus, Tag, User as UserIcon, X } from "lucide-react";

import { ADMIN_COURSE_CREATE as C } from "@/src/constants/admin/course-create-page";
import type { Category } from "@/src/services/categoryService";
import type { ProviderData } from "@/src/services/provider";
import type { User } from "@/src/services/userApi";
import type {
  AdminCourseCreateFormData,
  FieldChangeEvent,
} from "@/src/types/course-form";

import styles from "../AdminCourseCreate.module.scss";

interface AssignmentFieldsProps {
  formData: AdminCourseCreateFormData;
  providers: ProviderData[];
  instructors: User[];
  categories: Category[];
  onChange: (e: FieldChangeEvent) => void;
  onToggleCategory: (categoryId: string) => void;
  /** Tao danh muc moi roi chon luon. Tra ve loi (rong = thanh cong). */
  onCreateCategory: (name: string) => Promise<string>;
  /** Tao doi tac / truong hoc moi roi chon luon. Tra ve loi (rong = thanh cong). */
  onCreateProvider: (
    name: string,
    type: "company" | "university",
    logo: File | null,
  ) => Promise<string>;
}

/** Doi tac cap chung chi, giang vien phu trach va danh muc (chon nhieu). */
export default function AssignmentFields({
  formData,
  providers,
  instructors,
  categories,
  onChange,
  onToggleCategory,
  onCreateCategory,
  onCreateProvider,
}: AssignmentFieldsProps) {
  // Chi tai khoan DA duoc dat vai tro giang vien moi nam trong `instructors`
  // (loc o hook). Khong co nut tao giang vien o day: cap vai tro la viec cua
  // trang Nguoi dung.
  return (
    <>
      <div className={styles.box7}>
        <label className={styles.fieldLabel4}>
          <Building2 size={16} className={styles.box8} />
          {C.provider.label}
        </label>
        <select
          name="providerId"
          value={formData.providerId}
          onChange={onChange}
          className={styles.select2}
        >
          <option value="">{C.provider.none}</option>
          {providers.map((prov) => (
            <option key={prov._id} value={prov._id}>
              {prov.type === "university"
                ? C.provider.universityPrefix
                : C.provider.companyPrefix}{" "}
              {prov.name}
            </option>
          ))}
        </select>
        <ProviderQuickAdd onCreate={onCreateProvider} />
      </div>

      <div className={styles.box7}>
        <label className={styles.fieldLabel4}>
          <UserIcon size={16} className={styles.box3} />
          {C.instructor.label}
        </label>
        <select
          name="instructor"
          value={formData.instructor}
          onChange={onChange}
          className={styles.select2}
          required
        >
          <option value="">{C.instructor.none}</option>
          {instructors.map((ins) => (
            <option key={ins._id} value={ins._id}>
              {C.instructor.option(ins.name, ins.email)}
            </option>
          ))}
        </select>
        {instructors.length === 0 && (
          <p className={styles.text3}>{C.instructor.noneFound}</p>
        )}
      </div>

      <div className={styles.box7}>
        <label className={styles.fieldLabel5}>
          <Tag size={16} className={styles.box9} />
          {C.categories.label}
          {formData.category.length > 0 && (
            <span className={styles.selectedCount}>
              {C.categories.selected(formData.category.length)}
            </span>
          )}
        </label>
        <div className={styles.card3}>
          {categories.map((cat) => {
            const active = formData.category.includes(cat._id);
            return (
              <button
                type="button"
                key={cat._id}
                onClick={() => onToggleCategory(cat._id)}
                className={`${styles.button5} ${active ? styles.button : styles.button2}`}
              >
                {cat.name}
                {active && <Check size={14} className={styles.box10} />}
              </button>
            );
          })}
        </div>
        <CategoryQuickAdd onCreate={onCreateCategory} />
      </div>
    </>
  );
}

/** O them danh muc moi: go ten roi Enter / bam Them. */
function CategoryQuickAdd({ onCreate }: { onCreate: (name: string) => Promise<string> }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!open) {
    return (
      <button type="button" className={styles.quickAddOpen} onClick={() => setOpen(true)}>
        <Plus size={14} /> {C.categories.add}
      </button>
    );
  }

  const submit = async () => {
    const clean = name.trim();
    if (!clean) return setError(C.quickAdd.needName);
    setBusy(true);
    const err = await onCreate(clean);
    setBusy(false);
    if (err) return setError(err);
    setName("");
    setError("");
    setOpen(false);
  };

  return (
    <div className={styles.quickAdd}>
      <div className={styles.quickAddRow}>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          // Enter trong o nay KHONG duoc nop ca form tao khoa hoc.
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void submit();
            }
          }}
          placeholder={C.categories.namePlaceholder}
          className={styles.quickAddInput}
        />
        <button
          type="button"
          disabled={busy}
          onClick={submit}
          className={styles.quickAddSave}
        >
          <Plus size={14} /> {busy ? C.quickAdd.saving : C.quickAdd.save}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className={styles.quickAddCancel}
          aria-label={C.quickAdd.cancel}
        >
          <X size={14} />
        </button>
      </div>
      {error && <p className={styles.quickAddError}>{error}</p>}
    </div>
  );
}

/** O them doi tac / truong hoc moi: ten, loai, logo tuy chon. */
function ProviderQuickAdd({
  onCreate,
}: {
  onCreate: (
    name: string,
    type: "company" | "university",
    logo: File | null,
  ) => Promise<string>;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<"company" | "university">("university");
  const [logo, setLogo] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!open) {
    return (
      <button type="button" className={styles.quickAddOpen} onClick={() => setOpen(true)}>
        <Plus size={14} /> {C.provider.add}
      </button>
    );
  }

  const submit = async () => {
    const clean = name.trim();
    if (!clean) return setError(C.quickAdd.needName);
    setBusy(true);
    const err = await onCreate(clean, type, logo);
    setBusy(false);
    if (err) return setError(err);
    setName("");
    setLogo(null);
    setError("");
    setOpen(false);
  };

  return (
    <div className={styles.quickAdd}>
      <div className={styles.quickAddRow}>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void submit();
            }
          }}
          placeholder={C.provider.namePlaceholder}
          className={styles.quickAddInput}
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as "company" | "university")}
          className={styles.quickAddSelect}
        >
          <option value="university">{C.provider.typeUniversity}</option>
          <option value="company">{C.provider.typeCompany}</option>
        </select>
      </div>
      <div className={styles.quickAddRow}>
        <label className={styles.quickAddFile}>
          {C.provider.logo}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setLogo(e.target.files?.[0] ?? null)}
          />
        </label>
        <button
          type="button"
          disabled={busy}
          onClick={submit}
          className={styles.quickAddSave}
        >
          <Plus size={14} /> {busy ? C.quickAdd.saving : C.quickAdd.save}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className={styles.quickAddCancel}
          aria-label={C.quickAdd.cancel}
        >
          <X size={14} />
        </button>
      </div>
      {error && <p className={styles.quickAddError}>{error}</p>}
    </div>
  );
}
