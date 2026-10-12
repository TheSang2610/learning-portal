/* eslint-disable @next/next/no-img-element --
   Anh xem truoc lay tu URL.createObjectURL nen la URL blob: cuc bo.
   next/image khong toi uu duoc blob vi no phai di qua /_next/image tren may chu,
   nen dung the <img> o day moi dung. */
import { Building2, Edit3, Plus, School, UploadCloud } from "lucide-react";

import { ADMIN_PROVIDERS as C } from "@/src/constants/admin/providers-page";

import type { AdminProvidersState } from "../hooks/useAdminProviders";
import styles from "../AdminProviders.module.scss";

/** Khoi trai: them / sua doi tac (ten, loai, logo). */
export default function ProviderForm({ s }: { s: AdminProvidersState }) {
  return (
    <div className={styles.sticky}>
      <h2 className={styles.heading}>
        {s.editingId ? (
          <Edit3 size={18} className={styles.box} />
        ) : (
          <Plus size={18} className={styles.box2} />
        )}
        {s.editingId ? C.form.editTitle : C.form.createTitle}
      </h2>

      <form onSubmit={s.handleSubmit} className={styles.form}>
        <div>
          <label className={styles.fieldLabel}>{C.form.name}</label>
          <input
            type="text"
            className={styles.input}
            placeholder={C.form.namePlaceholder}
            value={s.name}
            onChange={(e) => s.setName(e.target.value)}
          />
        </div>

        <div>
          <label className={styles.fieldLabel}>{C.form.kind}</label>
          <div className={styles.grid2}>
            <button
              type="button"
              onClick={() => s.setType("company")}
              className={`${styles.button9} ${
                s.type === "company" ? styles.button2 : styles.button3
              }`}
            >
              <Building2 size={16} /> {C.form.company}
            </button>
            <button
              type="button"
              onClick={() => s.setType("university")}
              className={`${styles.button9} ${
                s.type === "university" ? styles.button4 : styles.button3
              }`}
            >
              <School size={16} /> {C.form.university}
            </button>
          </div>
        </div>

        <div>
          <label className={styles.fieldLabel}>{C.form.logo}</label>
          <div className={`group ${styles.box3}`}>
            <input
              type="file"
              accept="image/*"
              className={styles.input2}
              onChange={s.handleFileChange}
            />
            {s.previewUrl ? (
              <div className={styles.col}>
                <img
                  src={s.previewUrl}
                  alt={C.form.previewAlt}
                  className={styles.image}
                />
                <span className={styles.label}>{C.form.changeLogo}</span>
              </div>
            ) : (
              <div className={styles.col2}>
                <UploadCloud size={28} className={styles.box4} />
                <span className={styles.label2}>{C.form.pickLogo}</span>
                <span className={styles.label3}>{C.form.formats}</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.box5}>
          <button type="submit" disabled={s.loading} className={styles.button5}>
            {s.loading ? C.form.busy : s.editingId ? C.form.update : C.form.create}
          </button>
          {s.editingId && (
            <button type="button" className={styles.button6} onClick={s.resetForm}>
              {C.form.cancelEdit}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
