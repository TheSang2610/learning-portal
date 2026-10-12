"use client";

import { Loader2, Plus, Search } from "lucide-react";

import Pager from "@/src/components/ui/Pager";
import { ADMIN_USERS as C } from "@/src/constants/admin/users-page";

import { useAdminUsers } from "./hooks/useAdminUsers";
import AvatarViewer from "./parts/AvatarViewer";
import UserModal from "./parts/UserModal";
import UserRow from "./parts/UserRow";
import styles from "./AdminUsers.module.scss";

/** Trang /admin/users - quan ly tai khoan. */
export default function AdminUsers() {
  const s = useAdminUsers();
  const F = C.filters;

  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <div>
          <h1 className={styles.title}>{C.title}</h1>
          <p className={styles.text3}>{s.fetching ? C.loading : C.count(s.total)}</p>
        </div>
        <button onClick={s.openCreate} className={styles.button}>
          <Plus size={16} /> {C.add}
        </button>
      </div>

      <div className={styles.row2}>
        <div className={styles.box2}>
          <Search size={16} className={styles.floating} />
          <input
            value={s.search}
            onChange={(e) => s.setSearch(e.target.value)}
            placeholder={F.searchPlaceholder}
            className={`${styles.input2} ${styles.input}`}
          />
        </div>
        <select
          value={s.roleFilter}
          onChange={(e) => s.changeRoleFilter(e.target.value)}
          className={`${styles.input2} ${styles.select}`}
        >
          <option value="">{F.allRoles}</option>
          {C.roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select
          value={s.statusFilter}
          onChange={(e) => s.changeStatusFilter(e.target.value)}
          className={`${styles.input2} ${styles.select}`}
        >
          <option value="">{F.allStatuses}</option>
          {F.statuses.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {s.error && <div className={styles.card}>{s.error}</div>}

      <div className={styles.card2}>
        <div className={styles.scroller}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                {C.columns.map((col, i) => (
                  <th
                    key={col}
                    className={
                      i === C.columns.length - 1 ? styles.headCell2 : styles.headCell
                    }
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {s.fetching ? (
                <tr>
                  <td colSpan={5} className={styles.cell}>
                    <Loader2 size={20} className={styles.spinner} />
                  </td>
                </tr>
              ) : s.users.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.cell2}>
                    {C.empty}
                  </td>
                </tr>
              ) : (
                s.users.map((u) => (
                  <UserRow
                    key={u._id}
                    u={u}
                    isSelf={u._id === s.myId}
                    busy={s.busyId === u._id}
                    onViewAvatar={s.setViewImage}
                    onEdit={s.openEdit}
                    onToggle={s.toggleStatus}
                    onDelete={s.remove}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pager
          page={s.page}
          pages={s.pages}
          setPage={s.setPage}
          classes={{
            wrap: styles.row6,
            info: styles.text6,
            group: styles.row7,
            button: styles.box4,
          }}
        />
      </div>

      {s.viewImage?.avatar && (
        <AvatarViewer
          user={{ ...s.viewImage, avatar: s.viewImage.avatar }}
          onClose={() => s.setViewImage(null)}
        />
      )}

      {s.editingId !== null && <UserModal s={s} />}
    </div>
  );
}
