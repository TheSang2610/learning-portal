"use client";

import { useCallback, useEffect, useState } from "react";
import { Clock, NotebookPen, Pencil, Trash2 } from "lucide-react";

import styles from "./LessonNotes.module.scss";
import { getNotes, editNote, addNote, deleteNote, type Note } from "@/src/services/note";

const MAX_LENGTH = 5000;

/** Giay -> "12:07" hoac "1:02:07". Khong bao gio hien "NaN:NaN". */
const formatTimestamp = (seconds: number): string => {
  const g = Math.max(0, Math.floor(seconds));
  const hour = Math.floor(g / 3600);
  const minutes = Math.floor((g % 3600) / 60);
  const left = g % 60;

  const pad2 = (n: number) => String(n).padStart(2, "0");

  return hour > 0 ? `${hour}:${pad2(minutes)}:${pad2(left)}` : `${minutes}:${pad2(left)}`;
};

interface Props {
  courseId: string;
  lessonId: string;
  /**
   * Doc vi tri hien tai cua video, tinh bang giay.
   *
   * Tra ve null khi bai khong co video (bai doc) hoac video chua san sang.
   * Trang hoc truyen ham chu khong truyen con so: con so chup mot thoi diem,
   * ma thoi diem can biet la LUC BAM NUT, khong phai luc ve lai component.
   */
  getVideoPosition?: () => number | null;
  /** Nhay video toi mot moc. Khong co thi moc chi la nhan doc, khong bam duoc. */
  jumpTo?: (seconds: number) => void;
}

export default function LessonNote({
  courseId,
  lessonId,
  getVideoPosition,
  jumpTo,
}: Props) {
  const [list, setList] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [newText, setNewText] = useState("");
  const [sending, setSending] = useState(false);

  const [editing, setEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");

    try {
      const outcome = await getNotes(courseId, lessonId);
      setList(outcome.danhSach);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Không tải được ghi chú.");
    } finally {
      setLoading(false);
    }
  }, [courseId, lessonId]);

  useEffect(() => {
    if (!courseId || !lessonId) return;
    // Day sang microtask - xem ghi chu cung kieu o NotificationBell.
    queueMicrotask(load);
  }, [courseId, lessonId, load]);

  const them = async () => {
    const text = newText.trim();
    if (!text || sending) return;

    setSending(true);
    setErr("");

    try {
      // Doc vi tri video NGAY LUC NAY, khong phai luc ve component.
      const moc = getVideoPosition?.() ?? null;

      const outcome = await addNote({ courseId, lessonId, noiDung: text, mocGiay: moc });

      // Chen dung cho theo moc thoi gian de danh sach luon khop voi video.
      // Nap lai ca danh sach cho chuyen nay la mot luot mang thua.
      setList((old) =>
        [...old, outcome.ghiChu].sort((a, b) => {
          const code = a.mocGiay ?? Number.MAX_SAFE_INTEGER;
          const mb = b.mocGiay ?? Number.MAX_SAFE_INTEGER;
          if (code !== mb) return code - mb;
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }),
      );
      setNewText("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Không lưu được ghi chú.");
    } finally {
      setSending(false);
    }
  };

  const saveEdit = async (id: string) => {
    const text = editText.trim();
    if (!text || sending) return;

    setSending(true);

    try {
      const outcome = await editNote(id, text);
      setList((old) => old.map((g) => (g._id === id ? outcome.ghiChu : g)));
      setEditing(null);
      setEditText("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Không sửa được ghi chú.");
    } finally {
      setSending(false);
    }
  };

  const remove = async (id: string) => {
    const old = list;
    setList((items) => items.filter((g) => g._id !== id));

    try {
      await deleteNote(id);
    } catch {
      setList(old);
      setErr("Không xóa được ghi chú.");
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.row}>
        <NotebookPen size={20} className={styles.box} />
        <h2 className={styles.heading}>Ghi chú của bạn</h2>
      </div>

      {/* Noi ro day la rieng tu. Khung hoi dap nam ngay duoi va trong giong
          nhau - khong phan biet thi hoc vien go ghi chu ca nhan vao cho cong
          khai, hoac nguoc lai khong dam go gi vi so nguoi khac doc duoc. */}
      <p className={styles.text}>
        Chỉ mình bạn đọc được. Ghi chú lưu kèm mốc thời gian trong video để bấm vào là
        quay lại đúng đoạn.
      </p>

      <div className={styles.box2}>
        <textarea
          id="ghi-chu-moi"
          value={newText}
          onChange={(e) => setNewText(e.target.value.slice(0, MAX_LENGTH))}
          rows={2}
          placeholder="Ghi lại điều bạn muốn nhớ…"
          className={styles.textarea}
        />

        <div className={styles.row2}>
          <span className={styles.label}>
            {newText.length}/{MAX_LENGTH}
          </span>

          <button
            type="button"
            onClick={them}
            disabled={!newText.trim() || sending}
            className={styles.button}
          >
            Lưu ghi chú
          </button>
        </div>
      </div>

      {err && <p className={styles.text2}>{err}</p>}

      {loading && <p className={styles.text3}>Đang tải…</p>}

      {!loading && list.length === 0 && (
        <p className={styles.text3}>Chưa có ghi chú nào cho bài này.</p>
      )}

      <div className={styles.col}>
        {list.map((g) => (
          <div key={g._id} className={styles.card}>
            {editing === g._id ? (
              <>
                <textarea
                  id={`ghi-chu-sua-${g._id}`}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value.slice(0, MAX_LENGTH))}
                  rows={3}
                  className={styles.textarea2}
                />
                <div className={styles.row3}>
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className={styles.button2}
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={() => saveEdit(g._id)}
                    disabled={!editText.trim() || sending}
                    className={styles.button3}
                  >
                    Lưu
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className={styles.row4}>
                  {/* Moc thoi gian chi bam duoc khi trang hoc co truyen nhayToi.
                      Khong co thi ve <span> - mot cai nut bam vao khong lam gi
                      te hon han mot cai nhan doc. */}
                  {g.mocGiay !== null && jumpTo ? (
                    <button
                      type="button"
                      onClick={() => jumpTo(g.mocGiay as number)}
                      className={styles.button4}
                    >
                      <Clock size={11} /> {formatTimestamp(g.mocGiay)}
                    </button>
                  ) : g.mocGiay !== null ? (
                    <span className={styles.row5}>
                      <Clock size={11} /> {formatTimestamp(g.mocGiay)}
                    </span>
                  ) : (
                    <span className={styles.label2}>
                      {new Date(g.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  )}

                  <div className={styles.row6}>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(g._id);
                        setEditText(g.noiDung);
                      }}
                      aria-label="Sửa ghi chú"
                      className={styles.button5}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(g._id)}
                      aria-label="Xóa ghi chú"
                      className={styles.button6}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <p className={styles.text4}>{g.noiDung}</p>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
