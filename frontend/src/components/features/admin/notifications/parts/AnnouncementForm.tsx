import { Pencil, Send, TriangleAlert } from "lucide-react";

import { ADMIN_NOTIFICATIONS as C } from "@/src/constants/admin/notifications-page";
import type { AnnouncementLevel, RecipientRole } from "@/src/services/announcement";

import type { AdminAnnouncementsState } from "../hooks/useAdminAnnouncements";
import styles from "../AdminNotifications.module.scss";

/** Bieu mau soan / sua thong bao + chon kenh + buoc xac nhan truoc khi gui. */
export default function AnnouncementForm({ s }: { s: AdminAnnouncementsState }) {
  const F = C.form;
  const K = C.confirm;

  return (
    <div className={styles.card}>
      {s.editing && (
        <p className={styles.editing}>
          <Pencil size={14} />
          <span>{F.editing}</span>
          <strong>{s.editing.tieuDe}</strong>
        </p>
      )}

      <label className={styles.fieldLabel}>
        <span className={styles.label}>{F.title}</span>
        <input
          id="tb-tieude"
          value={s.tieuDe}
          onChange={(e) => s.setTitle(e.target.value)}
          placeholder={F.titlePlaceholder}
          className={styles.input}
        />
        <span className={styles.label2}>{F.counter(s.tieuDe.length, C.maxTitle)}</span>
      </label>

      <label className={styles.fieldLabel}>
        <span className={styles.label}>{F.body}</span>
        <textarea
          id="tb-noidung"
          value={s.noiDung}
          onChange={(e) => s.setContent(e.target.value)}
          rows={4}
          placeholder={F.bodyPlaceholder}
          className={styles.textarea}
        />
        <span className={styles.label2}>{F.counter(s.noiDung.length, C.maxBody)}</span>
      </label>

      <label className={styles.fieldLabel}>
        <span className={styles.label}>{F.link}</span>
        <input
          id="tb-duongdan"
          value={s.duongDan}
          onChange={(e) => s.setPath(e.target.value)}
          placeholder={F.linkPlaceholder}
          className={styles.input}
        />
        {/* May chu CHAN moi dia chi ben ngoai (xem duongDanNoiBo trong
            notificationContent.js). Noi truoc o day de quan tri khong go mot dia
            chi ngoai roi thac mac vi sao lien ket bien mat. */}
        <span className={styles.label3}>{F.linkHint}</span>
      </label>

      <fieldset className={styles.channels}>
        <legend className={styles.label}>{F.where}</legend>

        {s.editing ? (
          // Luc sua khong gui them chuong cho nguoi moi: sua la sua dot cu.
          <p className={styles.checkHint}>
            {s.editing.guiChuong
              ? F.editBellSent(s.editing.soNguoiNhan ?? 0)
              : F.editNoBell}
          </p>
        ) : (
          <>
            <label className={styles.check}>
              <input
                id="tb-kenh-chuong"
                type="checkbox"
                checked={s.guiChuong}
                onChange={(e) => s.setSendBell(e.target.checked)}
              />
              <span>
                <strong>{F.bell}</strong>
                <span className={styles.checkHint}>{F.bellHint}</span>
              </span>
            </label>

            {s.guiChuong && (
              <label className={styles.subField}>
                <span className={styles.label}>{F.sendTo}</span>
                <select
                  id="tb-vaitro"
                  value={s.vaiTro}
                  onChange={(e) => s.setRole(e.target.value as RecipientRole)}
                  className={styles.input}
                >
                  {F.audiences.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </>
        )}

        <label className={styles.check}>
          <input
            id="tb-kenh-congkhai"
            type="checkbox"
            checked={s.showPublic}
            onChange={(e) => s.setShowPublic(e.target.checked)}
          />
          <span>
            <strong>{F.public}</strong>
            <span className={styles.checkHint}>{F.publicHint}</span>
          </span>
        </label>

        {s.showPublic && (
          <div className={styles.subGrid}>
            <label className={styles.subField}>
              <span className={styles.label}>{F.level}</span>
              <select
                id="tb-mucdo"
                value={s.mucDo}
                onChange={(e) => s.setLevel(e.target.value as AnnouncementLevel)}
                className={styles.input}
              >
                {F.levels.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.subField}>
              <span className={styles.label}>{F.expires}</span>
              <input
                id="tb-hethan"
                type="datetime-local"
                value={s.hetHan}
                onChange={(e) => s.setExpiresAt(e.target.value)}
                className={styles.input}
              />
            </label>
          </div>
        )}
      </fieldset>

      {s.loi && <p className={styles.text2}>{s.loi}</p>}

      {s.ketQua && <p className={styles.text3}>{s.ketQua}</p>}

      {s.confirmAgain ? (
        <div className={styles.card2}>
          <p className={styles.text4}>
            <TriangleAlert size={16} className={styles.box3} />
            <span>
              {s.editing ? K.edit : K.send} {K.check}
            </span>
          </p>
          <div className={styles.row2}>
            <button
              type="button"
              onClick={() => s.setConfirmAgain(false)}
              className={styles.button}
            >
              {K.back}
            </button>
            <button
              type="button"
              onClick={s.gui}
              disabled={s.sending}
              className={styles.button2}
            >
              {s.sending ? K.saving : s.editing ? K.saveReal : K.sendReal}
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.row2Start}>
          <button
            type="button"
            onClick={() => s.setConfirmAgain(true)}
            disabled={!s.ready}
            className={styles.button3}
          >
            {s.editing ? (
              <>
                <Pencil size={16} />
                <span>{C.actions.save}</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>{C.actions.send}</span>
              </>
            )}
          </button>
          {s.editing && (
            <button type="button" onClick={s.resetForm} className={styles.button}>
              {C.actions.cancelEdit}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
