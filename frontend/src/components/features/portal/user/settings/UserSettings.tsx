"use client";

import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

import {
  SETTINGS_TAB_META,
  USER_SETTINGS as C,
} from "@/src/constants/portal/user-settings-page";

import { useUserSettings } from "./hooks/useUserSettings";
import CoursesTab from "./parts/CoursesTab";
import PersonalTab from "./parts/PersonalTab";
import SecurityTab from "./parts/SecurityTab";
import SettingsNav from "./parts/SettingsNav";
import styles from "./UserSettings.module.scss";

export default function UserSettings() {
  const s = useUserSettings();
  const { user, msg } = s;

  if (s.loading) {
    return (
      <div className={styles.row}>
        <Loader2 size={24} className={styles.spinner} />
      </div>
    );
  }

  if (s.loadError || !user) {
    return (
      <div className={styles.container}>
        <p className={styles.text}>{s.loadError || C.needLogin}</p>
      </div>
    );
  }

  const meta = SETTINGS_TAB_META[s.tab];
  const tabProps = {
    user,
    editing: s.editing,
    toggle: s.toggle,
    saving: s.saving,
    save: s.save,
  };

  return (
    <div className={styles.page}>
      <div className={styles.container2}>
        <div className={styles.grid}>
          {/* ============ THANH DIEU HUONG ============ */}
          <SettingsNav tab={s.tab} onChange={s.selectTab} />

          {/* ============ NOI DUNG ============ */}
          <main className={styles.main}>
            <div>
              <h2 className={styles.heading}>{meta.title}</h2>
              <p className={styles.text2}>{meta.desc}</p>
            </div>

            {msg && (
              <div
                role="status"
                className={`${styles.row11} ${msg.ok ? styles.box6 : styles.box7}`}
              >
                {msg.ok ? (
                  <CheckCircle2 size={16} className={styles.box8} />
                ) : (
                  <AlertCircle size={16} className={styles.box8} />
                )}
                {msg.text}
              </div>
            )}

            {s.tab === "personal" && (
              // updatedAt doi sau moi lan luu -> React tao lai component,
              // cac o nhap lay lai gia tri that tu server thay vi giu ban nhap cu.
              <PersonalTab
                key={user.updatedAt ?? "personal"}
                {...tabProps}
                providers={s.providers}
                saveAvatarFile={s.saveAvatarFile}
              />
            )}

            {s.tab === "security" && <SecurityTab {...tabProps} setMsg={s.setMsg} />}

            {s.tab === "courses" && <CoursesTab />}
          </main>
        </div>
      </div>
    </div>
  );
}
