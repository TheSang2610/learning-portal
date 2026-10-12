import { USER_PROFILE as C } from "@/src/constants/portal/user-profile-page";
import type { User } from "@/src/services/userApi";

import styles from "../UserProfile.module.scss";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className={styles.fieldLabel}>{label}</label>
      <div className={styles.card3}>{value}</div>
    </div>
  );
}

const fmtDate = (v?: string) =>
  v ? new Date(v).toLocaleDateString("vi-VN") : C.info.notSet;

/** The "Thong tin tai khoan" o tab Tong quan. */
export default function AccountInfoCard({
  user,
  providerName,
}: {
  user: User;
  providerName: string | null;
}) {
  const I = C.info;

  return (
    <div className={styles.card}>
      <h2 className={styles.heading}>{I.heading}</h2>

      <div className={styles.grid2}>
        <Field label={I.name} value={user.name} />
        <Field label={I.fullname} value={user.fullname || I.notSet} />
        <Field label={I.birthday} value={fmtDate(user.birthday)} />
        <Field label={I.email} value={user.email} />
        {user.phone && <Field label={I.phone} value={user.phone} />}
        {providerName && <Field label={I.provider} value={providerName} />}
        {user.bio && (
          <div className={styles.box3}>
            <Field label={I.bio} value={user.bio} />
          </div>
        )}
      </div>
    </div>
  );
}
