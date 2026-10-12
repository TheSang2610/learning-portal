"use client";

import { useCallback, useEffect, useState } from "react";
import { CircleCheck, MessageCircleQuestion, Send, Trash2 } from "lucide-react";

import Avatar from "@/src/components/ui/Avatar";

import styles from "./LessonQuestions.module.scss";
import {
  questionShape,
  getQuestions,
  replyQuestion,
  deleteQuestion,
  type QaQuestion,
  type ReplierRole,
} from "@/src/services/question";
import { gap, displayName } from "@/src/lib/time";

const MAX_LENGTH = 2000;

// Nhan vai tro. Chi hien voi giang vien va quan tri: "Học viên" la truong hop
// mac dinh, gan nhan cho moi nguoi thi cai nhan mat het tac dung phan biet.
const ROLE_LABELS: Partial<Record<ReplierRole, { chu: string; className: string }>> = {
  giangVien: { chu: "Giảng viên", className: styles.instructorLabel },
  quanTri: { chu: "Quản trị", className: styles.adminLabel },
};

const nameOf = (n: { name?: string; email?: string } | null): string =>
  displayName(n, "Người dùng");

export default function LessonQa({
  courseId,
  lessonId,
}: {
  courseId: string;
  lessonId: string;
}) {
  const [list, setList] = useState<QaQuestion[]>([]);
  const [role, setRole] = useState<ReplierRole>("hocVien");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [newQuestion, setNewQuestion] = useState("");
  const [sending, setSending] = useState(false);

  // Dang mo o tra loi cua cau nao. Mot o duy nhat tai mot thoi diem: mo tat ca
  // cung luc thi tren dien thoai man hinh day o nhap, khong con thay cau hoi.
  const [replying, setReplying] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");

    try {
      const outcome = await getQuestions(courseId, lessonId);
      setList(outcome.danhSach);
      setRole(outcome.vaiTro);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Không tải được phần hỏi đáp.");
    } finally {
      setLoading(false);
    }
  }, [courseId, lessonId]);

  useEffect(() => {
    if (!courseId || !lessonId) return;

    // Day sang microtask thay vi goi thang trong than effect: goi thang la mot
    // vong ve lai noi tiep ngay sau lan ve dau, va react-hooks/set-state-in-effect
    // chan dung cho nay. Khong ai thay khac biet - nap() la mot luot goi mang,
    // luon cham hon mot khung hinh.
    queueMicrotask(load);
  }, [courseId, lessonId, load]);

  const sendQuestion = async () => {
    const questionItem = newQuestion.trim();
    if (questionItem.length < 5 || sending) return;

    setSending(true);
    setErr("");

    try {
      const outcome = await questionShape({ courseId, lessonId, noiDung: questionItem });
      // Chen len dau thay vi nap lai ca danh sach: nguoi dung thay ngay cau vua
      // gui, va khong mat vi tri cuon.
      setList((old) => [outcome.cauHoi, ...old]);
      setNewQuestion("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Không đăng được câu hỏi.");
    } finally {
      setSending(false);
    }
  };

  const sendReply = async (id: string) => {
    const questionItem = replyText.trim();
    if (!questionItem || sending) return;

    setSending(true);
    setErr("");

    try {
      const outcome = await replyQuestion(id, questionItem);
      setList((old) => old.map((c) => (c._id === id ? outcome.cauHoi : c)));
      setReplyText("");
      setReplying(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Không gửi được câu trả lời.");
    } finally {
      setSending(false);
    }
  };

  const remove = async (id: string) => {
    // Bo khoi danh sach ngay roi moi goi may chu. Hong thi nap lai - trang thai
    // that luon o may chu, cai tren man hinh chi la ban sao.
    const old = list;
    setList((items) => items.filter((c) => c._id !== id));

    try {
      await deleteQuestion(id);
    } catch {
      setList(old);
      setErr("Không xóa được câu hỏi.");
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.row}>
        <MessageCircleQuestion size={20} className={styles.box} />
        <h2 className={styles.heading}>Hỏi đáp với giảng viên</h2>
      </div>

      {/* Noi ro day khong phai tro ly AI. Hai cho hoi nam canh nhau trong cung
          mot trang, khong phan biet thi hoc vien hoi nguoi that roi ngoi cho
          cau tra loi tuc thi. */}
      <p className={styles.text}>
        Câu hỏi ở đây do giảng viên trả lời nên cần thời gian. Muốn có câu trả lời ngay,
        bạn dùng trợ lý AI ở góc màn hình.
      </p>

      <div className={styles.box2}>
        <textarea
          id="hoi-dap-cau-moi"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value.slice(0, MAX_LENGTH))}
          rows={3}
          placeholder="Bạn chưa hiểu chỗ nào trong bài này?"
          className={styles.textarea}
        />

        <div className={styles.row2}>
          <span className={styles.label}>
            {newQuestion.length}/{MAX_LENGTH}
          </span>

          <button
            type="button"
            onClick={sendQuestion}
            disabled={newQuestion.trim().length < 5 || sending}
            className={styles.row3}
          >
            <Send size={16} /> Gửi câu hỏi
          </button>
        </div>
      </div>

      {err && <p className={styles.text2}>{err}</p>}

      {loading && <p className={styles.text3}>Đang tải…</p>}

      {!loading && list.length === 0 && (
        <p className={styles.text3}>
          Chưa có câu hỏi nào cho bài này. Bạn hỏi câu đầu tiên nhé.
        </p>
      )}

      <div className={styles.col}>
        {list.map((c) => (
          <article key={c._id} className={styles.article}>
            <div className={styles.row4}>
              <Avatar
                src={c.student?.avatar}
                ten={nameOf(c.student)}
                size={36}
                letterBackground={styles.box5}
              />

              <div className={styles.box3}>
                <div className={styles.row5}>
                  <span className={styles.label2}>{nameOf(c.student)}</span>
                  <span className={styles.label3}>{gap(c.createdAt)}</span>

                  {c.daGiaiQuyet && (
                    <span className={styles.row6}>
                      <CircleCheck size={12} /> Đã trả lời
                    </span>
                  )}
                </div>

                {/* whitespace-pre-wrap: hoc vien xuong dong de tach y, ep mot
                    dong lam cau hoi dai thanh mot khoi chu khong doc noi. */}
                <p className={styles.text4}>{c.noiDung}</p>

                <div className={styles.row7}>
                  <button
                    type="button"
                    onClick={() => {
                      setReplying(replying === c._id ? null : c._id);
                      setReplyText("");
                    }}
                    className={styles.button}
                  >
                    Trả lời
                  </button>

                  {/* Nut xoa chi hien voi nguoi co the xoa duoc. May chu van kiem
                      lai lan nua - an nut khong phai la kiem quyen. */}
                  {role !== "hocVien" && (
                    <button
                      type="button"
                      onClick={() => remove(c._id)}
                      className={styles.button2}
                    >
                      <Trash2 size={12} /> Xóa
                    </button>
                  )}
                </div>

                {c.traLoi.length > 0 && (
                  <div className={styles.col2}>
                    {c.traLoi.map((t) => {
                      const label = ROLE_LABELS[t.vaiTro];

                      return (
                        <div key={t._id} className={styles.row8}>
                          <Avatar
                            src={t.user?.avatar}
                            ten={nameOf(t.user)}
                            size={28}
                            letterBackground={styles.box5}
                          />
                          <div className={styles.box3}>
                            <div className={styles.row5}>
                              <span className={styles.label2}>{nameOf(t.user)}</span>
                              {label && (
                                <span className={`${styles.label4} ${label.className}`}>
                                  {label.chu}
                                </span>
                              )}
                              <span className={styles.label3}>{gap(t.createdAt)}</span>
                            </div>
                            <p className={styles.text5}>{t.noiDung}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {replying === c._id && (
                  <div className={styles.box4}>
                    <textarea
                      id={`hoi-dap-tra-loi-${c._id}`}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value.slice(0, MAX_LENGTH))}
                      rows={2}
                      placeholder="Nhập câu trả lời…"
                      className={styles.textarea2}
                    />
                    <div className={styles.row9}>
                      <button
                        type="button"
                        onClick={() => setReplying(null)}
                        className={styles.button3}
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={() => sendReply(c._id)}
                        disabled={!replyText.trim() || sending}
                        className={styles.button4}
                      >
                        Gửi
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
