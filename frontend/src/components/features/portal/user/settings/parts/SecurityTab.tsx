"use client";

import { Link2 } from "lucide-react";

import SettingRow, {
  SettingCard,
} from "@/src/components/features/portal/user/settings/parts/SettingRow";
import { USER_SETTINGS } from "@/src/constants/portal/user-settings-page";
import type { SettingsMessage, SettingsTabProps } from "@/src/types/settings";

import { useSecuritySettings } from "../hooks/useSecuritySettings";
import styles from "../UserSettings.module.scss";
import FieldForm from "./FieldForm";

const S = USER_SETTINGS.security;

interface SecurityTabProps extends SettingsTabProps {
  setMsg: (m: SettingsMessage) => void;
}

/* ==========================================================================
   TAB: MAT KHAU VA BAO MAT
   ========================================================================== */
export default function SecurityTab({
  user,
  editing,
  toggle,
  saving,
  save,
  setMsg,
}: SecurityTabProps) {
  const f = useSecuritySettings(user, save, setMsg);

  return (
    <>
      <SettingCard title={S.login.title} desc={S.login.desc}>
        <SettingRow
          label={S.password.label}
          value={f.hasPassword ? S.password.masked : S.password.notSet}
          hint={f.hasPassword ? S.password.hintHas : S.password.hintNone}
          open={editing === "password"}
          onToggle={() => toggle("password")}
        >
          <FieldForm
            saving={saving}
            onSave={f.submitPassword}
            onCancel={() => toggle("password")}
            saveLabel={f.hasPassword ? S.password.change : S.password.set}
          >
            <div className={styles.stack}>
              {f.hasPassword ? (
                <div>
                  <label className={styles.box16}>{S.password.current}</label>
                  <input
                    type="password"
                    className={styles.input2}
                    value={f.current}
                    autoComplete="current-password"
                    onChange={(e) => f.setCurrent(e.target.value)}
                    autoFocus
                  />
                </div>
              ) : (
                <p className={styles.text6}>{S.password.googleOnly}</p>
              )}
              <div>
                <label className={styles.box16}>{S.password.next}</label>
                <input
                  type="password"
                  className={styles.input2}
                  value={f.next}
                  autoComplete="new-password"
                  onChange={(e) => f.setNext(e.target.value)}
                />
              </div>
              <div>
                <label className={styles.box16}>{S.password.confirm}</label>
                <input
                  type="password"
                  className={styles.input2}
                  value={f.confirm}
                  autoComplete="new-password"
                  onChange={(e) => f.setConfirm(e.target.value)}
                />
              </div>
            </div>
          </FieldForm>
        </SettingRow>
      </SettingCard>

      <SettingCard title={S.linked.title} desc={S.linked.desc}>
        <SettingRow
          label={S.linked.google}
          value={f.hasGoogle ? user.email : S.linked.notLinked}
          readOnly
          trailing={
            f.hasGoogle ? (
              <span className={styles.row3}>
                <Link2 size={12} /> {S.linked.linked}
              </span>
            ) : (
              <span className={styles.label5}>{S.linked.notLinked}</span>
            )
          }
        />
      </SettingCard>

      {/* Admin tu khoa minh thi khong con ai mo khoa duoc -> an han muc nay */}
      {user.role !== "admin" && (
        <SettingCard title={S.deactivate.title} desc={S.deactivate.desc}>
          <SettingRow
            label={S.deactivate.title}
            value={S.deactivate.value}
            open={editing === "deactivate"}
            onToggle={() => toggle("deactivate")}
          >
            <div className={styles.stack}>
              <div className={styles.card2}>{S.deactivate.warning}</div>
              <div>
                <label className={styles.box16}>{S.deactivate.confirmLabel}</label>
                <input
                  type="password"
                  className={styles.input2}
                  value={f.delPassword}
                  autoComplete="current-password"
                  onChange={(e) => f.setDelPassword(e.target.value)}
                />
              </div>
              <div className={styles.row4}>
                <button
                  type="button"
                  disabled={f.deleting || !f.delPassword}
                  onClick={f.submitDeactivate}
                  className={styles.button4}
                >
                  {f.deleting ? S.deactivate.processing : S.deactivate.submit}
                </button>
                <button
                  type="button"
                  onClick={() => toggle("deactivate")}
                  className={styles.button5}
                >
                  {USER_SETTINGS.form.cancel}
                </button>
              </div>
            </div>
          </SettingRow>
        </SettingCard>
      )}
    </>
  );
}
