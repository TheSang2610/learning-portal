import { CheckCircle2, PlayCircle, XCircle, type LucideIcon } from "lucide-react";

import Avatar from "@/src/components/ui/Avatar";
import { ADMIN_ENROLLMENTS as C } from "@/src/constants/admin/enrollments-page";
import type { AdminEnrollmentRow } from "@/src/services/adminService";

import styles from "../AdminEnrollments.module.scss";

/** Mau va bieu tuong cua nhan trang thai. */
const STATUS_STYLE: Record<string, { cls: string; Icon: LucideIcon }> = {
  active: { cls: styles.learningLabel, Icon: PlayCircle },
  completed: { cls: styles.completedLabel, Icon: CheckCircle2 },
  dropped: { cls: styles.droppedLabel, Icon: XCircle },
};

interface EnrollmentRowProps {
  r: AdminEnrollmentRow;
  busy: boolean;
  onChangeStatus: (row: AdminEnrollmentRow, status: string) => void;
}

/** Mot luot ghi danh: hoc vien, khoa, tien do, diem, ngay, trang thai. */
export default function EnrollmentRow({ r, busy, onChangeStatus }: EnrollmentRowProps) {
  const pct = Math.round(r.totalProgress ?? 0);
  const key = STATUS_STYLE[r.status] ? r.status : "active";
  const st = STATUS_STYLE[key];

  return (
    <tr className={styles.row2}>
      <td className={styles.headCell}>
        <div className={styles.row3}>
          <Avatar src={r.student?.avatar} ten={r.student?.name} size={36} />
          <div className={styles.box}>
            <p className={styles.text2}>{r.student?.name || C.deleted}</p>
            <p className={styles.text3}>{r.student?.email || C.none}</p>
          </div>
        </div>
      </td>
      <td className={styles.headCell}>
        <p className={styles.text4}>{r.course?.title || C.deleted}</p>
      </td>
      <td className={styles.headCell}>
        <div className={styles.row4}>
          <div className={styles.box2}>
            <div
              className={styles.box3}
              style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
            />
          </div>
          <span className={styles.label}>{pct}%</span>
        </div>
      </td>
      <td className={styles.cell3}>{r.finalScore ?? C.none}</td>
      <td className={styles.cell4}>
        {r.createdAt ? new Date(r.createdAt).toLocaleDateString("vi-VN") : C.none}
      </td>
      <td className={styles.headCell}>
        <div className={styles.row5}>
          <span className={`${styles.label2} ${st.cls}`}>
            <st.Icon size={12} /> {C.statusLabel[key]}
          </span>
          <select
            value={r.status}
            disabled={busy}
            onChange={(e) => onChangeStatus(r, e.target.value)}
            title={C.changeStatusTitle}
            className={styles.select2}
          >
            {C.statuses.map((s) => (
              <option key={s} value={s}>
                {C.statusLabel[s]}
              </option>
            ))}
          </select>
        </div>
      </td>
    </tr>
  );
}
