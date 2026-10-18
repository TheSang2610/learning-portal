import { Eye, EyeOff, Megaphone, Pencil, Trash2 } from "lucide-react";

import { ADMIN_NOTIFICATIONS as C } from "@/src/constants/admin/notifications-page";
import type { Announcement } from "@/src/services/announcement";

import type { AdminAnnouncementsState } from "../hooks/useAdminAnnouncements";
import styles from "../AdminNotifications.module.scss";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });

const isActive = (tb: Announcement) =>
  Boolean(tb.dangHien) && (!tb.hetHan || new Date(tb.hetHan).getTime() > Date.now());

/** Danh sach thong bao da gui: nhan trang thai, sua, ghim/bo ghim, thu hoi. */
export default function AnnouncementList({ s }: { s: AdminAnnouncementsState }) {
  const L = C.list;

  return (
    <section className={styles.listCard} aria-labelledby="tb-dasgui-tieude">
      <div className={styles.row}>
        <Megaphone size={20} className={styles.box2} />
        <h2 id="tb-dasgui-tieude" className={styles.listTitle}>
          {L.title}
        </h2>
      </div>

      {s.danhSach.length === 0 ? (
        <p className={styles.empty}>{L.empty}</p>
      ) : (
        <ul className={styles.list}>
          {s.danhSach.map((tb) => {
            const visibleNow = isActive(tb);
            const busy = s.processing === tb._id;
            return (
              <li key={tb._id} className={styles.item}>
                <div className={styles.itemMain}>
                  <div className={styles.badges}>
                    {visibleNow && (
                      <span
                        className={
                          tb.mucDo === "quan_trong"
                            ? styles.badgeImportant
                            : styles.badgeInfo
                        }
                      >
                        {L.pinned}
                      </span>
                    )}
                    {tb.guiChuong && (
                      <span className={styles.badgeBell}>
                        {L.bell(tb.soNguoiNhan ?? 0, C.audienceName[tb.vaiTro ?? ""])}
                      </span>
                    )}
                    {!visibleNow && !tb.guiChuong && (
                      <span className={styles.badgeMuted}>{L.hidden}</span>
                    )}
                  </div>
                  <strong className={styles.itemTitle}>{tb.tieuDe}</strong>
                  {tb.noiDung && <p className={styles.itemBody}>{tb.noiDung}</p>}
                  <span className={styles.itemMeta}>
                    {L.sentAt(formatDate(tb.createdAt))}
                    {tb.dangHien && tb.hetHan ? L.autoHide(formatDate(tb.hetHan)) : ""}
                  </span>
                </div>

                {s.pendingDelete === tb._id ? (
                  <div className={styles.actions}>
                    <span className={styles.confirmText}>
                      {tb.guiChuong
                        ? L.confirmRecall(tb.soNguoiNhan ?? 0)
                        : L.confirmDelete}
                    </span>
                    <button
                      type="button"
                      onClick={() => s.setPendingDelete(null)}
                      className={styles.button}
                    >
                      {L.no}
                    </button>
                    <button
                      type="button"
                      onClick={() => s.xoa(tb)}
                      disabled={busy}
                      className={styles.buttonDanger}
                    >
                      {busy ? L.deleting : L.delete}
                    </button>
                  </div>
                ) : (
                  <div className={styles.actions}>
                    <button
                      type="button"
                      onClick={() => s.startEdit(tb)}
                      className={styles.button}
                    >
                      <Pencil size={14} />
                      <span>{L.edit}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => s.togglePinned(tb)}
                      disabled={busy}
                      className={styles.button}
                    >
                      {tb.dangHien ? (
                        <>
                          <EyeOff size={14} />
                          <span>{L.unpin}</span>
                        </>
                      ) : (
                        <>
                          <Eye size={14} />
                          <span>{L.pin}</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => s.setPendingDelete(tb._id)}
                      className={styles.buttonDangerGhost}
                    >
                      <Trash2 size={14} />
                      <span>{tb.guiChuong ? L.recall : L.delete}</span>
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
