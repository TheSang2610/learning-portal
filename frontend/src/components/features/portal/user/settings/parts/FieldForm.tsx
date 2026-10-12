import type { ReactNode } from "react";

import { USER_SETTINGS } from "@/src/constants/portal/user-settings-page";

import styles from "../UserSettings.module.scss";

interface FieldFormProps {
  children: ReactNode;
  hint?: string;
  saving: boolean;
  saveLabel?: string;
  onSave: () => void | Promise<unknown>;
  onCancel: () => void;
}

/** Khung sua mot truong: o nhap + goi y + Luu / Huy. */
export default function FieldForm({
  children,
  hint,
  saving,
  saveLabel = USER_SETTINGS.form.save,
  onSave,
  onCancel,
}: FieldFormProps) {
  return (
    <div>
      {children}
      {hint && <p className={styles.text10}>{hint}</p>}
      <div className={styles.row10}>
        <button
          type="button"
          disabled={saving}
          onClick={() => onSave()}
          className={styles.button6}
        >
          {saving ? USER_SETTINGS.form.saving : saveLabel}
        </button>
        <button type="button" onClick={onCancel} className={styles.button7}>
          {USER_SETTINGS.form.cancel}
        </button>
      </div>
    </div>
  );
}
