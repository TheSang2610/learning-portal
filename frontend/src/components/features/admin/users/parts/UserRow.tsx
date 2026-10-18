import {
  GraduationCap,
  Lock,
  Pencil,
  ShieldCheck,
  Trash2,
  type LucideIcon,
  Unlock,
  User as UserIcon,
} from "lucide-react";

import Avatar from "@/src/components/ui/Avatar";
import { ADMIN_USERS as C } from "@/src/constants/admin/users-page";

import type { AdminUser } from "../hooks/useAdminUsers";
import styles from "../AdminUsers.module.scss";

const ROLE_STYLE: Record<string, { cls: string; Icon: LucideIcon }> = {
  admin: { cls: styles.adminLabel, Icon: ShieldCheck },
  instructor: { cls: styles.instructorLabel, Icon: GraduationCap },
  student: { cls: styles.studentLabel, Icon: UserIcon },
};

interface UserRowProps {
  u: AdminUser;
  isSelf: boolean;
  busy: boolean;
  onViewAvatar: (u: AdminUser) => void;
  onEdit: (u: AdminUser) => void;
  onToggle: (u: AdminUser) => void;
  onDelete: (u: AdminUser) => void;
}

/** Mot nguoi dung: anh + ten/email, quyen, trang thai, ngay tao, thao tac. */
export default function UserRow({
  u,
  isSelf,
  busy,
  onViewAvatar,
  onEdit,
  onToggle,
  onDelete,
}: UserRowProps) {
  const { cls, Icon } = ROLE_STYLE[u.role] ?? ROLE_STYLE.student;
  const R = C.row;

  return (
    <tr className={styles.row3}>
      <td className={styles.headCell}>
        <div className={styles.row4}>
          {u.avatar ? (
            <button
              type="button"
              onClick={() => onViewAvatar(u)}
              title={R.viewAvatar}
              className={styles.button2}
            >
              <Avatar src={u.avatar} ten={u.name} size={36} colorful />
            </button>
          ) : (
            <Avatar ten={u.name} size={36} colorful />
          )}
          <div className={styles.box3}>
            <p className={styles.text4}>
              {u.name}
              {isSelf && <span className={styles.label}>{R.you}</span>}
            </p>
            <p className={styles.text5}>{u.email}</p>
          </div>
        </div>
      </td>
      <td className={styles.headCell}>
        <span className={`${styles.label6} ${cls}`}>
          <Icon size={12} /> {u.role}
        </span>
      </td>
      <td className={styles.headCell}>
        <span
          className={`${styles.label7} ${(u.status ?? true) ? styles.label2 : styles.label3}`}
        >
          <span
            className={`${styles.label8} ${u.status ? styles.label4 : styles.label5}`}
          />
          {u.status ? R.active : R.banned}
        </span>
      </td>
      <td className={styles.cell3}>
        {u.createdAt ? new Date(u.createdAt).toLocaleDateString("vi-VN") : R.none}
      </td>
      <td className={styles.headCell}>
        <div className={styles.row5}>
          <button onClick={() => onEdit(u)} title={R.edit} className={styles.button3}>
            <Pencil size={16} />
          </button>
          <button
            onClick={() => onToggle(u)}
            disabled={isSelf || busy}
            title={isSelf ? R.cannotLockSelf : u.status ? R.lock : R.unlock}
            className={styles.button4}
          >
            {u.status ? <Lock size={16} /> : <Unlock size={16} />}
          </button>
          <button
            onClick={() => onDelete(u)}
            disabled={isSelf || busy}
            title={isSelf ? R.cannotDeleteSelf : R.delete}
            className={styles.button5}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}
