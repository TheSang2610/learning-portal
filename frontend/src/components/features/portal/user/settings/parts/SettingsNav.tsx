import {
  SETTINGS_NAV,
  USER_SETTINGS as C,
} from "@/src/constants/portal/user-settings-page";
import type { SettingsTabKey } from "@/src/types/settings";

import styles from "../UserSettings.module.scss";

interface SettingsNavProps {
  tab: SettingsTabKey;
  onChange: (key: SettingsTabKey) => void;
}

/** Thanh dieu huong ben trai cua trang cai dat. */
export default function SettingsNav({ tab, onChange }: SettingsNavProps) {
  return (
    <aside className={styles.aside}>
      <div className={styles.box}>
        <div className={styles.box2}>
          <h1 className={styles.title}>{C.title}</h1>
          <p className={styles.text2}>{C.subtitle}</p>
        </div>

        {/* Man hinh nho: thanh ngang cuon duoc. Man hinh lon: danh sach doc */}
        <nav aria-label={C.navAria} className={styles.nav}>
          {SETTINGS_NAV.map((section) => (
            <div key={section.group} className={styles.box3}>
              <h3 className={styles.subheading}>{section.group}</h3>
              <div className={styles.box4}>
                {section.items.map(({ key, label, icon: Icon }) => {
                  const active = tab === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => onChange(key)}
                      aria-current={active ? "page" : undefined}
                      className={`${styles.button8} ${
                        active ? styles.button : styles.button2
                      }`}
                    >
                      <Icon size={16} className={styles.box5} />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
