import { Loader2, X } from "lucide-react";

import Avatar from "@/src/components/ui/Avatar";
import { ADMIN_USERS as C } from "@/src/constants/admin/users-page";
import { MIN_PASSWORD_LENGTH } from "@/src/services/rules";

import type { AdminUser, AdminUsersState } from "../hooks/useAdminUsers";
import styles from "../AdminUsers.module.scss";

/** Hop tao / sua nguoi dung. Khong cho tu doi quyen / tu khoa chinh minh. */
export default function UserModal({ s }: { s: AdminUsersState }) {
  const M = C.modal;
  const { form, setForm, editingId, editing } = s;
  const isSelf = editingId === s.myId && editingId !== "";

  return (
    <div className={styles.overlay2}>
      <div className={styles.card4}>
        <div className={styles.row8}>
          <div className={styles.row10}>
            {editingId && editing && (
              <Avatar src={editing.avatar} ten={editing.name} size={40} />
            )}
            <div className={styles.box3}>
              <h2 className={styles.heading2}>
                {editingId ? M.editTitle : M.createTitle}
              </h2>
              {editingId && editing && (
                <p className={styles.text5}>
                  {editing.avatar
                    ? editing.avatarPublicId
                      ? M.avatarUploaded
                      : M.avatarExternal
                    : M.noAvatar}
                </p>
              )}
            </div>
          </div>
          <button onClick={s.closeModal} className={styles.button6}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={s.submit} className={styles.form}>
          {s.formError && <div className={styles.card5}>{s.formError}</div>}

          <div>
            <label className={styles.fieldLabel}>{M.name}</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={styles.input2}
              placeholder={M.namePlaceholder}
            />
          </div>

          <div>
            <label className={styles.fieldLabel}>{M.email}</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={styles.input2}
              placeholder={M.emailPlaceholder}
            />
          </div>

          <div>
            <label className={styles.fieldLabel}>{M.password(Boolean(editingId))}</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={styles.input2}
              placeholder={
                editingId ? M.passwordKeep : M.passwordMin(MIN_PASSWORD_LENGTH)
              }
            />
          </div>

          <div>
            <label className={styles.fieldLabel}>{M.phone}</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={styles.input2}
              placeholder={M.phonePlaceholder}
            />
          </div>

          <div className={styles.grid}>
            <div>
              <label className={styles.fieldLabel}>{M.role}</label>
              <select
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value as AdminUser["role"] })
                }
                disabled={isSelf}
                className={`${styles.input2} ${styles.select2}`}
              >
                {C.roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={styles.fieldLabel}>{M.status}</label>
              <select
                value={form.status ? "active" : "banned"}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value === "active" })
                }
                disabled={isSelf}
                className={`${styles.input2} ${styles.select2}`}
              >
                {M.statuses.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isSelf && <p className={styles.text6}>{M.selfNote}</p>}

          <div className={styles.row11}>
            <button type="button" onClick={s.closeModal} className={styles.button7}>
              {M.cancel}
            </button>
            <button type="submit" disabled={s.saving} className={styles.button8}>
              {s.saving && <Loader2 size={14} className={styles.spinner2} />}
              {editingId ? M.save : M.create}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
